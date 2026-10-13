import "server-only";
import { sql } from "drizzle-orm";
import type { Db } from "@/server/db";
import { rateLimits } from "@/server/db/schema";

export interface Limit {
  /** Requests allowed per window. */
  max: number;
  windowSeconds: number;
}

export const LIMITS = {
  loginPerIp: { max: 30, windowSeconds: 15 * 60 },
  loginPerUser: { max: 10, windowSeconds: 15 * 60 },
  signupPerIp: { max: 10, windowSeconds: 60 * 60 },
  resetPerIp: { max: 10, windowSeconds: 15 * 60 },
  resetPerUser: { max: 5, windowSeconds: 15 * 60 },
} satisfies Record<string, Limit>;

/**
 * Fixed-window counter in Postgres. One atomic upsert increments the counter, or
 * restarts it when the window has passed, and returns the new count, so concurrent
 * requests cannot both slip under the limit.
 *
 * Returns the number of seconds to wait when the limit is exceeded, otherwise null.
 */
export async function hit(db: Db, key: string, limit: Limit, now = new Date()): Promise<number | null> {
  const windowStart = new Date(now.getTime() - limit.windowSeconds * 1000);
  const [row] = await db
    .insert(rateLimits)
    .values({ key, windowStart: now, count: 1 })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`CASE WHEN ${rateLimits.windowStart} <= ${windowStart.toISOString()} THEN 1 ELSE ${rateLimits.count} + 1 END`,
        windowStart: sql`CASE WHEN ${rateLimits.windowStart} <= ${windowStart.toISOString()} THEN ${now.toISOString()}::timestamptz ELSE ${rateLimits.windowStart} END`,
      },
    })
    .returning({ count: rateLimits.count, windowStart: rateLimits.windowStart });
  if (row.count <= limit.max) return null;
  const resetAt = row.windowStart.getTime() + limit.windowSeconds * 1000;
  return Math.max(1, Math.ceil((resetAt - now.getTime()) / 1000));
}
