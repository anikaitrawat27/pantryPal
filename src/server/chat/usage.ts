import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { ApiError } from "@/lib/api/http";
import type { Db } from "@/server/db";
import { chatUsage } from "@/server/db/schema";
import { DAILY_MESSAGE_LIMIT } from "./model";

/** Token counts for one user message, summed across every model call it made. */
export interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
}

const today = () => new Date().toISOString().slice(0, 10);

/** Counts a message against today's limit, or throws 429 when the limit is reached. */
export async function reserveMessage(db: Db, userId: string) {
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

export async function recordTokens(db: Db, userId: string, usage: TokenUsage) {
  await db
    .update(chatUsage)
    .set({
      inputTokens: sql`${chatUsage.inputTokens} + ${usage.input}`,
      outputTokens: sql`${chatUsage.outputTokens} + ${usage.output}`,
      cacheReadTokens: sql`${chatUsage.cacheReadTokens} + ${usage.cacheRead}`,
    })
    .where(and(eq(chatUsage.userId, userId), eq(chatUsage.day, today())));
}
