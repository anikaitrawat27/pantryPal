import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import type { Lang } from "@/i18n/config";
import { ApiError } from "@/lib/api/http";
import { randomId } from "@/server/auth/crypto";
import type { Db } from "@/server/db";
import { chatConversations, chatMessages } from "@/server/db/schema";
import type { UiEvent } from "./tools";

/**
 * Stored chat threads. The full API transcript is kept server-side and replayed exactly
 * on the next turn, which keeps the model's thinking valid and stops a browser from
 * forging earlier tool results.
 */

/** Conversations end after this many user messages; the user starts a new one. */
export const MAX_USER_TURNS = 40;

export type ApiMessage = Anthropic.Beta.BetaMessageParam;

/** A message to store: content blocks exactly as sent or received, plus what the page showed. */
export interface StoredMessage {
  role: "user" | "assistant";
  content: Anthropic.Beta.BetaContentBlockParam[];
  ui?: UiEvent[];
}

export type DisplayMessage = { role: "user"; text: string } | { role: "assistant"; text: string; ui: UiEvent[] };

type Block = { type?: string; text?: string };

const textOf = (content: unknown) =>
  Array.isArray(content)
    ? (content as Block[])
        .filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("")
    : "";

const isTypedByUser = (content: unknown) =>
  Array.isArray(content) && content.some((b: { type?: string }) => b?.type === "text");

/** Opens the user's conversation `id`, or starts a new one titled from the first message. */
export async function openConversation(db: Db, userId: string, id: string | null, firstText: string, lang: Lang) {
  if (!id) {
    const newId = randomId();
    await db.insert(chatConversations).values({ id: newId, userId, title: firstText.slice(0, 60), lang });
    return { id: newId, lang, history: [] as ApiMessage[] };
  }
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
  // Tool results are also user-role messages; count only what the person typed.
  if (rows.filter((r) => r.role === "user" && isTypedByUser(r.content)).length >= MAX_USER_TURNS) {
    throw ApiError.invalid("This conversation is full. Start a new one.");
  }
  return {
    id,
    lang: conv.lang as Lang,
    history: rows.map((r) => ({ role: r.role, content: r.content }) as ApiMessage),
  };
}

/** Appends messages to the end of a conversation's transcript. */
export async function appendMessages(db: Db, conversationId: string, messages: StoredMessage[]) {
  if (messages.length === 0) return;
  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${chatMessages.seq}), -1) + 1` })
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId));
  await db.insert(chatMessages).values(
    messages.map((m, i) => ({
      conversationId,
      seq: Number(next) + i,
      role: m.role,
      content: m.content,
      ui: m.ui ?? null,
    })),
  );
  await db.update(chatConversations).set({ updatedAt: new Date() }).where(eq(chatConversations.id, conversationId));
}

export async function listConversations(db: Db, userId: string) {
  return db
    .select({ id: chatConversations.id, title: chatConversations.title, updatedAt: chatConversations.updatedAt })
    .from(chatConversations)
    .where(eq(chatConversations.userId, userId))
    .orderBy(desc(chatConversations.updatedAt))
    .limit(20);
}

/**
 * Turns the stored API transcript back into what the page showed: the user's words,
 * and per turn the assistant's text plus the cards it rendered. Tool calls and
 * tool results are internal and are not shown.
 */
export async function loadDisplayMessages(db: Db, userId: string, id: string) {
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
  const out: DisplayMessage[] = [];
  for (const row of rows) {
    const text = textOf(row.content);
    if (row.role === "user") {
      if (text) out.push({ role: "user", text });
      continue;
    }
    const last = out[out.length - 1];
    const ui = (row.ui as UiEvent[] | null) ?? [];
    if (last?.role === "assistant") {
      last.text += text;
      last.ui.push(...ui);
    } else out.push({ role: "assistant", text, ui });
  }
  return { id: conv.id, title: conv.title, lang: conv.lang, messages: out };
}

export async function deleteConversation(db: Db, userId: string, id: string) {
  await db.delete(chatConversations).where(and(eq(chatConversations.id, id), eq(chatConversations.userId, userId)));
}
