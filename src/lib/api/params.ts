import { z } from "zod";
import { INGREDIENTS_BY_ID } from "@/data/pantry";
import { LANGS } from "@/i18n/config";

/**
 * Building blocks for validating API input. A list parameter is comma separated
 * ("course=main,soup"), and every value in it must be a known one.
 */

export const list = <T extends string>(values: readonly [T, ...T[]]) =>
  z.preprocess(
    (v) => (typeof v === "string" && v !== "" ? v.split(",") : []),
    z.array(z.enum(values, { errorMap: () => ({ message: `Expected one of: ${values.join(", ")}` }) })),
  );

export const ingredientId = z.string().refine(
  (id) => INGREDIENTS_BY_ID.has(id),
  (id) => ({ message: `Unknown ingredient "${id}"` }),
);

export const ingredientList = z.preprocess(
  (v) => (typeof v === "string" && v !== "" ? v.split(",") : []),
  z.array(ingredientId),
);

export const intParam = (min: number, max: number) => z.coerce.number().int().min(min).max(max);

export const boolParam = z.enum(["true", "false", "1", "0"]).transform((v) => v === "true" || v === "1");

export const langParam = z.enum(LANGS).default("en");

/** Cursors are opaque to clients; internally they are a base64url offset. */
export function encodeCursor(offset: number): string {
  return Buffer.from(`o:${offset}`).toString("base64url");
}

export function decodeCursor(cursor: string): number | null {
  const m = Buffer.from(cursor, "base64url")
    .toString()
    .match(/^o:(\d+)$/);
  return m ? Number(m[1]) : null;
}
