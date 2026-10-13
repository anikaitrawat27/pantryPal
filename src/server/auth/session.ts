import "server-only";
import { eq } from "drizzle-orm";
import type { Db } from "@/server/db";
import { sessions, users } from "@/server/db/schema";
import { randomToken, sha256 } from "./crypto";

export const SESSION_COOKIE = "pp_session";
const DAY = 24 * 60 * 60 * 1000;
export const SESSION_TTL = 30 * DAY;
/** Sessions with less than this left are extended on use, so active users stay signed in. */
const RENEW_WITHIN = 15 * DAY;

export interface SessionUser {
  id: string;
  username: string;
}

export interface ValidSession {
  user: SessionUser;
  expiresAt: Date;
  /** True when this request extended the session, so the cookie should be re-sent. */
  renewed: boolean;
}

/** Creates a session and returns the token for the cookie. Only its hash is stored. */
export async function createSession(
  db: Db,
  userId: string,
  now = new Date(),
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomToken();
  const expiresAt = new Date(now.getTime() + SESSION_TTL);
  await db.insert(sessions).values({ id: sha256(token), userId, expiresAt });
  return { token, expiresAt };
}

export async function validateSession(db: Db, token: string, now = new Date()): Promise<ValidSession | null> {
  const id = sha256(token);
  const [row] = await db
    .select({ userId: users.id, username: users.username, expiresAt: sessions.expiresAt })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, id));
  if (!row) return null;
  if (row.expiresAt.getTime() <= now.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }
  let expiresAt = row.expiresAt;
  let renewed = false;
  if (expiresAt.getTime() - now.getTime() < RENEW_WITHIN) {
    expiresAt = new Date(now.getTime() + SESSION_TTL);
    await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, id));
    renewed = true;
  }
  return { user: { id: row.userId, username: row.username }, expiresAt, renewed };
}

export async function deleteSession(db: Db, token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sha256(token)));
}

export async function deleteAllSessions(db: Db, userId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

// Cookies are read from and written to raw headers so route handlers stay plain
// functions of (Request) => Response, which tests can call directly.

export function readSessionToken(request: Request): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function secureFlag(request: Request): string {
  const proto = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  return proto === "https" ? "; Secure" : "";
}

export function sessionCookie(request: Request, token: string, expiresAt: Date): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${secureFlag(request)}`;
}

export function clearedSessionCookie(request: Request): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag(request)}`;
}
