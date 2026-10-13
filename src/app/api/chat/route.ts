import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { LANGS } from "@/i18n/config";
import { ApiError, readJson } from "@/lib/api/http";
import { parseBody } from "@/server/auth/accounts";
import { runChatTurn, type ChatEvent } from "@/server/chat/loop";
import { authedRoute } from "@/server/route";

const bodySchema = z
  .object({
    conversationId: z.string().min(1).max(64).nullable().default(null),
    message: z.string().trim().min(1, "Type a message.").max(2000, "Keep messages under 2000 characters."),
    lang: z.enum(LANGS).default("en"),
  })
  .strict();

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw ApiError.unavailable("The chat is not set up yet.");
  client ??= new Anthropic();
  return client;
}

/**
 * POST /api/chat: one chat message. Responds with a server-sent event stream of
 * ChatEvent objects: text deltas, tool activity, recipe cards, and a final `done`.
 * Validation, auth, and rate-limit failures are ordinary JSON errors before the stream starts.
 */
export const POST = authedRoute("POST /api/chat", async ({ db, user, request }) => {
  const body = parseBody(bodySchema, await readJson(request));
  const anthropic = getClient();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (event: ChatEvent) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // The client went away; the turn still finishes and is saved.
        }
      };
      try {
        await runChatTurn({
          db,
          client: anthropic,
          userId: user.id,
          conversationId: body.conversationId,
          text: body.message,
          lang: body.lang,
          signal: request.signal,
          emit,
        });
      } catch (err) {
        if (err instanceof ApiError) emit({ type: "error", code: "failed", message: err.body.error.message });
        else {
          console.error(JSON.stringify({ level: "error", route: "POST /api/chat", message: (err as Error).message }));
          emit({ type: "error", code: "failed", message: "Something went wrong. Try again." });
        }
        emit({ type: "done" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
});
