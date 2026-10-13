import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { ApiError } from "@/lib/api/http";
import type { Db } from "@/server/db";
import { chatConversations, chatMessages } from "@/server/db/schema";
import type { UiEvent } from "./tools";

export type DisplayMessage = { role: "user"; text: string } | { role: "assistant"; text: string; ui: UiEvent[] };

type Block = { type?: string; text?: string };

const textOf = (content: unknown) =>
  Array.isArray(content)
    ? (content as Block[])
        .filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("")
    : "";

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
