import "server-only";
import { and, count, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { ApiError, fieldsFromZod } from "@/lib/api/http";
import type { Db } from "@/server/db";
import { authEvents, recoveryCodes, users } from "@/server/db/schema";
import {
  dummyPasswordHash,
  hashPassword,
  normalizeRecoveryCode,
  randomId,
  recoveryCode,
  sha256,
  verifyPassword,
} from "./crypto";
import { hit, LIMITS } from "./rate-limit";
import { createSession, deleteAllSessions, type SessionUser } from "./session";

export const RECOVERY_CODE_COUNT = 8;

const username = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters.")
  .max(24, "Use at most 24 characters.")
  .regex(/^[A-Za-z0-9_-]+$/, "Use only letters, numbers, - and _.");

/** Long passphrases are encouraged; 200 characters keeps hashing time bounded. */
const password = z.string().min(10, "Use at least 10 characters.").max(200, "Use at most 200 characters.");

export const signupSchema = z
  .object({ username, password })
  .strict()
  .refine((v) => v.password.toLowerCase() !== v.username.toLowerCase(), {
    path: ["password"],
    message: "Your password cannot be your username.",
  });

export const loginSchema = z
  .object({ username: z.string().trim().min(1).max(64), password: z.string().min(1).max(200) })
  .strict();

export const resetSchema = z
  .object({ username: z.string().trim().min(1).max(64), code: z.string().trim().min(1).max(40), newPassword: password })
  .strict();

export const passwordConfirmSchema = z.object({ password: z.string().min(1).max(200) }).strict();

export function parseBody<T extends z.ZodTypeAny>(schema: T, raw: unknown): z.infer<T> {
  const result = schema.safeParse(raw);
  if (!result.success) throw ApiError.invalid("Invalid request body.", fieldsFromZod(result.error));
  return result.data;
}

const key = (name: string) => name.trim().toLowerCase();

async function limit(db: Db, bucket: string, l: (typeof LIMITS)[keyof typeof LIMITS]) {
  const wait = await hit(db, bucket, l);
  if (wait !== null) throw ApiError.rateLimited(wait);
}

async function logEvent(db: Db, type: string, userId: string | null, ip: string) {
  await db.insert(authEvents).values({ type, userId, ip });
}

function isUniqueViolation(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code === "23505" || e?.cause?.code === "23505";
}

async function issueRecoveryCodes(db: Db, userId: string): Promise<string[]> {
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, recoveryCode);
  await db.delete(recoveryCodes).where(eq(recoveryCodes.userId, userId));
  await db.insert(recoveryCodes).values(codes.map((c) => ({ userId, codeHash: sha256(c) })));
  return codes;
}

export interface AuthResult {
  user: SessionUser;
  session: { token: string; expiresAt: Date };
}

/** Creates an account and signs it in. Returns the recovery codes, which are never shown again. */
export async function signup(
  db: Db,
  input: z.infer<typeof signupSchema>,
  ip: string,
): Promise<AuthResult & { recoveryCodes: string[] }> {
  await limit(db, `signup:ip:${ip}`, LIMITS.signupPerIp);
  const id = randomId();
  const passwordHash = await hashPassword(input.password);
  try {
    return await db.transaction(async (tx) => {
      await tx.insert(users).values({ id, username: input.username, usernameKey: key(input.username), passwordHash });
      const codes = await issueRecoveryCodes(tx, id);
      const session = await createSession(tx, id);
      await logEvent(tx, "signup", id, ip);
      return { user: { id, username: input.username }, session, recoveryCodes: codes };
    });
  } catch (err) {
    if (isUniqueViolation(err))
      throw ApiError.conflict("That username is taken.", { username: "That username is taken." });
    throw err;
  }
}

const BAD_LOGIN = "Wrong username or password.";

/** Signs in. Unknown usernames and wrong passwords get the same message and take the same time. */
export async function login(db: Db, input: z.infer<typeof loginSchema>, ip: string): Promise<AuthResult> {
  await limit(db, `login:ip:${ip}`, LIMITS.loginPerIp);
  await limit(db, `login:user:${key(input.username)}`, LIMITS.loginPerUser);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.usernameKey, key(input.username)));
  const ok = await verifyPassword(user?.passwordHash ?? (await dummyPasswordHash()), input.password);
  if (!user || !ok) {
    await logEvent(db, "login_failed", user?.id ?? null, ip);
    throw ApiError.unauthorized(BAD_LOGIN);
  }
  const session = await createSession(db, user.id);
  await logEvent(db, "login", user.id, ip);
  return { user: { id: user.id, username: user.username }, session };
}

const BAD_RESET = "That username and recovery code do not match.";

/**
 * Resets a password with a one-time recovery code. The code is consumed, every
 * existing session is signed out, and the caller gets a fresh session.
 */
export async function resetPassword(
  db: Db,
  input: z.infer<typeof resetSchema>,
  ip: string,
): Promise<AuthResult & { codesLeft: number }> {
  await limit(db, `reset:ip:${ip}`, LIMITS.resetPerIp);
  await limit(db, `reset:user:${key(input.username)}`, LIMITS.resetPerUser);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.usernameKey, key(input.username)));
  if (!user) {
    await logEvent(db, "reset_failed", null, ip);
    throw ApiError.unauthorized(BAD_RESET);
  }
  const passwordHash = await hashPassword(input.newPassword);
  const result = await db.transaction(async (tx) => {
    // Conditional update: only one request can consume a given code, even if two race.
    const consumed = await tx
      .update(recoveryCodes)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(recoveryCodes.userId, user.id),
          eq(recoveryCodes.codeHash, sha256(normalizeRecoveryCode(input.code))),
          isNull(recoveryCodes.usedAt),
        ),
      )
      .returning({ userId: recoveryCodes.userId });
    if (consumed.length === 0) return null;
    await tx.update(users).set({ passwordHash }).where(eq(users.id, user.id));
    await deleteAllSessions(tx, user.id);
    const session = await createSession(tx, user.id);
    return session;
  });
  if (!result) {
    await logEvent(db, "reset_failed", user.id, ip);
    throw ApiError.unauthorized(BAD_RESET);
  }
  await logEvent(db, "password_reset", user.id, ip);
  return { user: { id: user.id, username: user.username }, session: result, codesLeft: await codesLeft(db, user.id) };
}

export async function codesLeft(db: Db, userId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(recoveryCodes)
    .where(and(eq(recoveryCodes.userId, userId), isNull(recoveryCodes.usedAt)));
  return row.n;
}

async function requirePassword(db: Db, userId: string, pw: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user || !(await verifyPassword(user.passwordHash, pw))) {
    throw ApiError.unauthorized("Wrong password.");
  }
}

/** Replaces all recovery codes after confirming the password. */
export async function regenerateCodes(db: Db, userId: string, pw: string, ip: string): Promise<string[]> {
  await requirePassword(db, userId, pw);
  const codes = await db.transaction((tx) => issueRecoveryCodes(tx, userId));
  await logEvent(db, "codes_regenerated", userId, ip);
  return codes;
}

/** Deletes the account and, by cascade, every row that belongs to it. */
export async function deleteAccount(db: Db, userId: string, pw: string): Promise<void> {
  await requirePassword(db, userId, pw);
  await db.delete(users).where(eq(users.id, userId));
}
