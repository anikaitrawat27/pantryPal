import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { and, asc, eq, sql } from "drizzle-orm";
import type { Lang } from "@/i18n/config";
import { ApiError } from "@/lib/api/http";
import { randomId } from "@/server/auth/crypto";
import type { Db } from "@/server/db";
import { chatConversations, chatMessages, chatUsage } from "@/server/db/schema";
import { CHAT_MODEL, DAILY_MESSAGE_LIMIT } from "./model";
import { API_TOOLS, runTool, type UiEvent } from "./tools";

/** At most this many model calls per user message, so a tool loop cannot run away. */
export const MAX_STEPS = 6;
/** Conversations end after this many user messages; the user starts a new one. */
export const MAX_USER_TURNS = 40;

/** Events streamed to the page, one per server-sent event. */
export type ChatEvent =
  | { type: "conversation"; id: string }
  | { type: "text"; delta: string }
  | UiEvent
  | { type: "error"; code: "refusal" | "too_many_steps" | "truncated" | "failed"; message: string }
  | { type: "done" };

function systemPrompt(lang: Lang): string {
  // Kept identical across requests for a language so it stays in the prompt cache.
  return `You are Pantry Pal's kitchen helper. Pantry Pal has 250 easy recipes that use only food-pantry ingredients and no oven.

How to help:
- For any question about which recipes exist or fit a need, call search_recipes. For "what can I make", call what_can_i_make; it uses the user's saved pantry when they don't list ingredients.
- Call get_recipe for details about one recipe (scaling, swaps, steps). Never invent recipe titles or slugs; only mention recipes a tool returned.
- If nothing in the catalog fits, call generate_recipe. It writes and checks a new recipe against the same rules.
- Recipe cards for tool results are shown to the user automatically. Don't repeat ingredient lists or steps unless asked; give a short, helpful answer that points to the best options and why.
- Costs and nutrition are estimates; say so if the user relies on them.
- Stay on cooking, food, and using the site. Politely decline anything else.
- Reply in ${lang === "es" ? "Spanish (Latin American, usted)" : "English"}. Keep replies short: a few sentences or a brief list. No emoji.`;
}

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

const today = () => new Date().toISOString().slice(0, 10);

/** Counts the message against today's limit, or throws 429 when the limit is reached. */
async function reserveMessage(db: Db, userId: string) {
  const [row] = await db
    .insert(chatUsage)
    .values({ userId, day: today(), messages: 1 })
    .onConflictDoUpdate({
      target: [chatUsage.userId, chatUsage.day],
      set: { messages: sql`${chatUsage.messages} + 1` },
    })
    .returning({ messages: chatUsage.messages });
  if (row.messages > DAILY_MESSAGE_LIMIT) {
    const midnight = new Date();
    midnight.setUTCHours(24, 0, 0, 0);
    throw ApiError.rateLimited(Math.ceil((midnight.getTime() - Date.now()) / 1000));
  }
}

async function recordTokens(db: Db, userId: string, usage: { input: number; output: number; cacheRead: number }) {
  await db
    .update(chatUsage)
    .set({
      inputTokens: sql`${chatUsage.inputTokens} + ${usage.input}`,
      outputTokens: sql`${chatUsage.outputTokens} + ${usage.output}`,
      cacheReadTokens: sql`${chatUsage.cacheReadTokens} + ${usage.cacheRead}`,
    })
    .where(and(eq(chatUsage.userId, userId), eq(chatUsage.day, today())));
}

async function loadConversation(db: Db, userId: string, id: string | null, text: string, lang: Lang) {
  if (id) {
    const [conv] = await db
      .select()
      .from(chatConversations)
      .where(and(eq(chatConversations.id, id), eq(chatConversations.userId, userId)));
    if (!conv) throw ApiError.notFound("Conversation not found.");
    const rows = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, id))
      .orderBy(asc(chatMessages.seq));
    // Tool results are also user-role messages; only count what the person typed.
    if (rows.filter((r) => r.role === "user" && isUserText(r.content)).length >= MAX_USER_TURNS) {
      throw ApiError.invalid("This conversation is full. Start a new one.");
    }
    return {
      id,
      lang: conv.lang as Lang,
      history: rows.map((r) => ({ role: r.role, content: r.content }) as Anthropic.Beta.BetaMessageParam),
    };
  }
  const newId = randomId();
  await db.insert(chatConversations).values({ id: newId, userId, title: text.slice(0, 60), lang });
  return { id: newId, lang, history: [] as Anthropic.Beta.BetaMessageParam[] };
}

function isUserText(content: unknown): boolean {
  return Array.isArray(content) && content.some((b: { type?: string }) => b?.type === "text");
}

/**
 * Runs one user message: streams the model's reply, runs tools it calls, and stores
 * every message. The stored transcript is append-only, which keeps the model's
 * thinking blocks valid and the prompt cache warm.
 */
export async function runChatTurn(input: TurnInput): Promise<void> {
  const { db, client, userId, emit, signal } = input;
  await reserveMessage(db, userId);
  const conv = await loadConversation(db, userId, input.conversationId, input.text, input.lang);
  emit({ type: "conversation", id: conv.id });

  const lang = conv.lang;
  const history = [...conv.history];
  const added: { role: "user" | "assistant"; content: Anthropic.Beta.BetaContentBlockParam[]; ui?: UiEvent[] }[] = [];
  const push = (m: (typeof added)[number]) => {
    added.push(m);
    history.push({ role: m.role, content: m.content });
  };
  push({ role: "user", content: [{ type: "text", text: input.text }] });

  const ui: UiEvent[] = [];
  const emitUi = (e: UiEvent) => {
    ui.push(e);
    emit(e);
  };
  const usage = { input: 0, output: 0, cacheRead: 0 };

  try {
    for (let step = 1; ; step++) {
      if (step > MAX_STEPS) {
        emit({ type: "error", code: "too_many_steps", message: "That took too many steps. Try a simpler question." });
        break;
      }
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
      const message = await stream.finalMessage();
      usage.input += message.usage.input_tokens + (message.usage.cache_creation_input_tokens ?? 0);
      usage.output += message.usage.output_tokens;
      usage.cacheRead += message.usage.cache_read_input_tokens ?? 0;

      if (message.stop_reason === "refusal") {
        emit({
          type: "error",
          code: "refusal",
          message: "Sorry, I can't help with that one. Ask me about recipes or cooking.",
        });
        break;
      }

      const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
      push({ role: "assistant", content: echoSafe(message.content) });

      if (message.stop_reason === "max_tokens") {
        // A tool call cut off mid-input is not safe to run.
        emit({ type: "error", code: "truncated", message: "The reply was cut short." });
        if (toolUses.length) {
          push({
            role: "user",
            content: toolUses.map((t) => ({
              type: "tool_result",
              tool_use_id: t.id,
              is_error: true,
              content: "Input was cut off.",
            })),
          });
        }
        break;
      }
      if (toolUses.length === 0) break;

      // Run tools in parallel and return every result in one user message.
      const ctx = { db, userId, lang, client, signal, emit: emitUi };
      const results = await Promise.all(toolUses.map((t) => runTool(t.name, t.input, ctx)));
      push({
        role: "user",
        content: toolUses.map((t, i) => ({
          type: "tool_result",
          tool_use_id: t.id,
          content: results[i].content,
          ...(results[i].isError ? { is_error: true } : {}),
        })),
      });
    }
  } finally {
    // Persist whatever completed, even if the client disconnected mid-turn.
    const lastAssistant = added.map((m) => m.role).lastIndexOf("assistant");
    if (lastAssistant >= 0) added[lastAssistant].ui = ui;
    const [{ next }] = await db
      .select({ next: sql<number>`coalesce(max(${chatMessages.seq}), -1) + 1` })
      .from(chatMessages)
      .where(eq(chatMessages.conversationId, conv.id));
    await db.insert(chatMessages).values(
      added.map((m, i) => ({
        conversationId: conv.id,
        seq: Number(next) + i,
        role: m.role,
        content: m.content,
        ui: m.ui ?? null,
      })),
    );
    await db.update(chatConversations).set({ updatedAt: new Date() }).where(eq(chatConversations.id, conv.id));
    await recordTokens(db, userId, usage);
  }
  emit({ type: "done" });
}
