import "server-only";
import { hash, verify } from "@node-rs/argon2";
import { createHash, randomBytes, randomInt } from "node:crypto";

/**
 * Argon2id with OWASP's recommended minimum (19 MiB memory, 2 iterations, 1 lane).
 * The algorithm and parameters are stored in the hash string, so they can be raised
 * later without breaking existing passwords.
 */
const ARGON2 = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2);
}

export async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

/**
 * A real Argon2id hash of a random password. Login verifies against it when the
 * username does not exist, so both cases take the same time.
 */
let dummyHash: Promise<string> | null = null;
export function dummyPasswordHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(16).toString("hex"));
  return dummyHash;
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/** Random token for session cookies: 32 bytes, base64url. */
export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

export function randomId(): string {
  return randomBytes(16).toString("hex");
}

const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no 0/o, 1/l/i

/** A recovery code like "k7pm-3xqa-h9tr": 12 characters from a 31-letter alphabet, about 59 bits. */
export function recoveryCode(): string {
  // randomInt is unbiased; mapping bytes with % would favor some letters.
  const chars = Array.from({ length: 12 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]);
  return [chars.slice(0, 4), chars.slice(4, 8), chars.slice(8, 12)].map((g) => g.join("")).join("-");
}

/** Codes are compared after normalizing case, spaces, and dashes, so "K7PM 3XQA H9TR" works. */
export function normalizeRecoveryCode(code: string): string {
  const clean = code.toLowerCase().replace(/[\s-]/g, "");
  return clean.length === 12 ? `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8)}` : clean;
}
