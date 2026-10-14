import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import type { Lang } from "@/i18n/config";
import type { Db } from "@/server/db";
import { appendMessages, openConversation, type StoredMessage } from "./conversations";
import { CHAT_MODEL } from "./model";
import { systemPrompt } from "./prompt";
import { API_TOOLS, runTool, type UiEvent } from "./tools";
import { recordTokens, reserveMessage, type TokenUsage } from "./usage";

/** At most this many model calls per user message, so a tool loop cannot run away. */
export const MAX_STEPS = 6;

/** Events streamed to the page, one per server-sent event. */
export type ChatEvent =
  | { type: "conversation"; id: string }
  | { type: "text"; delta: string }
  | UiEvent
  | { type: "error"; code: "refusal" | "too_many_steps" | "truncated" | "failed"; message: string }
  | { type: "done" };

type ToolUse = Anthropic.Beta.BetaToolUseBlock;

/**
 * After a mid-stream server-side fallback, blocks the declined model produced before
 * the last `fallback` block must not be echoed back, except text. See the API docs on
 * echoing fallback turns.
 */
export function echoSafe(content: Anthropic.Beta.BetaContentBlock[]): Anthropic.Beta.BetaContentBlockParam[] {
  const lastFallback = content.map((b) => b.type).lastIndexOf("fallback");
  const blocks = lastFallback < 0 ? content : content.filter((b, i) => i >= lastFallback || b.type === "text");
  return blocks as unknown as Anthropic.Beta.BetaContentBlockParam[];
}

/** Turns tool outcomes into one user message, which is how the API expects results back. */
function toolResultsMessage(toolUses: ToolUse[], results: { content: string; isError: boolean }[]): StoredMessage {
  return {
    role: "user",
    content: toolUses.map((t, i) => ({
      type: "tool_result",
      tool_use_id: t.id,
      content: results[i].content,
      ...(results[i].isError ? { is_error: true } : {}),
    })),
  };
}

interface TurnInput {
  db: Db;
  client: Anthropic;
  userId: string;
  conversationId: string | null;
  text: string;
  lang: Lang;
  signal?: AbortSignal;
  emit: (event: ChatEvent) => void;
}

/**
 * Handles one user message:
 * 1. call the model with the whole conversation, streaming its text to the page;
 * 2. if it asked for tools, run them and send the results back, then repeat;
 * 3. stop when it answers without tools, refuses, runs out of room, or hits MAX_STEPS.
 * Every message is then appended to the stored conversation, even if the browser left mid-turn.
 */
export async function runChatTurn(input: TurnInput): Promise<void> {
  const { db, client, userId, emit, signal } = input;
  await reserveMessage(db, userId);
  const conversation = await openConversation(db, userId, input.conversationId, input.text, input.lang);
  emit({ type: "conversation", id: conversation.id });

  const { lang } = conversation;
  const history = [...conversation.history];
  const added: StoredMessage[] = [];
  const addMessage = (m: StoredMessage) => {
    added.push(m);
    history.push({ role: m.role, content: m.content });
  };

  // Cards and tool activity the page shows for this turn; stored so the thread reloads the same way.
  const ui: UiEvent[] = [];
  const toolContext = {
    db,
    userId,
    lang,
    client,
    signal,
    emit: (e: UiEvent) => {
      ui.push(e);
      emit(e);
    },
  };
  const usage: TokenUsage = { input: 0, output: 0, cacheRead: 0 };

  addMessage({ role: "user", content: [{ type: "text", text: input.text }] });

  try {
    let finished = false;
    for (let step = 1; step <= MAX_STEPS && !finished; step++) {
      // 1. Call the model, streaming text to the page as it arrives.
      const stream = client.beta.messages.stream(
        {
          model: CHAT_MODEL,
          max_tokens: 4096,
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
          // Chat turns are short; low effort keeps them fast and cheap. Thinking cannot be disabled on this model.
          output_config: { effort: "low" },
          cache_control: { type: "ephemeral" },
          system: systemPrompt(lang),
          tools: API_TOOLS,
          messages: history,
        },
        { signal },
      );
      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          emit({ type: "text", delta: event.delta.text });
        }
      }
      const reply = await stream.finalMessage();
      usage.input += reply.usage.input_tokens + (reply.usage.cache_creation_input_tokens ?? 0);
      usage.output += reply.usage.output_tokens;
      usage.cacheRead += reply.usage.cache_read_input_tokens ?? 0;

      if (reply.stop_reason === "refusal") {
        emit({
          type: "error",
          code: "refusal",
          message: "Sorry, I can't help with that one. Ask me about recipes or cooking.",
        });
        finished = true;
        break;
      }

      addMessage({ role: "assistant", content: echoSafe(reply.content) });
      const toolUses = reply.content.filter((b): b is ToolUse => b.type === "tool_use");

      if (reply.stop_reason === "max_tokens") {
        // A tool call cut off mid-input is not safe to run; answer it with errors instead.
        emit({ type: "error", code: "truncated", message: "The reply was cut short." });
        if (toolUses.length > 0) {
          const cutOff = toolUses.map(() => ({ content: "Input was cut off.", isError: true }));
          addMessage(toolResultsMessage(toolUses, cutOff));
        }
        finished = true;
        break;
      }

      // 3. No tool calls means the model has answered.
      if (toolUses.length === 0) {
        finished = true;
        break;
      }

      // 2. Run every requested tool in parallel and send all results back in one message.
      const results = await Promise.all(toolUses.map((t) => runTool(t.name, t.input, toolContext)));
      addMessage(toolResultsMessage(toolUses, results));
    }
    if (!finished) {
      emit({ type: "error", code: "too_many_steps", message: "That took too many steps. Try a simpler question." });
    }
  } finally {
    const lastReply = added.map((m) => m.role).lastIndexOf("assistant");
    if (lastReply >= 0) added[lastReply].ui = ui;
    await appendMessages(db, conversation.id, added);
    await recordTokens(db, userId, usage);
  }
  emit({ type: "done" });
}
