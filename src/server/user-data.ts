import "server-only";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { INGREDIENTS_BY_ID } from "@/data/pantry";
import { MEALS } from "@/data/schema";
import { getRecipe } from "@/lib/catalog";
import type { Db } from "./db";
import { favorites, pantryItems, planEntries, shoppingChecks } from "./db/schema";

/** Water and ice are always on hand, so they are never stored. */
const ingredientId = z.string().refine(
  (id) => {
    const ing = INGREDIENTS_BY_ID.get(id);
    return Boolean(ing) && ing!.tier !== "free";
  },
  { message: "Unknown ingredient" },
);
const slug = z.string().refine((s) => Boolean(getRecipe(s)), { message: "Unknown recipe" });

export const pantrySchema = z
  .object({ have: z.array(ingredientId).max(200), low: z.array(ingredientId).max(200) })
  .strict()
  .refine((p) => p.low.every((id) => p.have.includes(id)), {
    path: ["low"],
    message: "Low items must also be in have",
  });

export const planEntrySchema = z
  .object({
    id: z.string().min(1).max(64),
    day: z.number().int().min(0).max(6),
    meal: z.enum(MEALS),
    slug,
    servings: z.number().int().min(1).max(6),
  })
  .strict();

export const planSchema = z.object({ entries: z.array(planEntrySchema).max(100) }).strict();
export const favoritesSchema = z.object({ slugs: z.array(slug).max(300) }).strict();
export const checksSchema = z.object({ ingredientIds: z.array(ingredientId).max(200) }).strict();

export const userDataSchema = z
  .object({
    pantry: pantrySchema,
    plan: z.array(planEntrySchema).max(100),
    favorites: z.array(slug).max(300),
    checked: z.array(ingredientId).max(200),
  })
  .strict();

export type UserData = z.infer<typeof userDataSchema>;
type PlanEntry = z.infer<typeof planEntrySchema>;

export async function getUserData(db: Db, userId: string): Promise<UserData> {
  const [pantry, plan, favs, checks] = await Promise.all([
    db.select().from(pantryItems).where(eq(pantryItems.userId, userId)).orderBy(asc(pantryItems.ingredientId)),
    db.select().from(planEntries).where(eq(planEntries.userId, userId)).orderBy(asc(planEntries.position)),
    db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(asc(favorites.position)),
    db.select().from(shoppingChecks).where(eq(shoppingChecks.userId, userId)),
  ]);
  return {
    pantry: { have: pantry.map((p) => p.ingredientId), low: pantry.filter((p) => p.low).map((p) => p.ingredientId) },
    plan: plan.map(({ id, day, meal, slug: s, servings }) => ({
      id,
      day,
      meal: meal as PlanEntry["meal"],
      slug: s,
      servings,
    })),
    favorites: favs.map((f) => f.slug),
    checked: checks.map((c) => c.ingredientId),
  };
}

// Each collection is replaced as a whole inside a transaction: the client always sends
// its full state, so concurrent edits from two tabs resolve as last-write-wins per collection.

export async function replacePantry(db: Db, userId: string, p: UserData["pantry"]) {
  await db.transaction(async (tx) => {
    await tx.delete(pantryItems).where(eq(pantryItems.userId, userId));
    const have = [...new Set(p.have)];
    if (have.length)
      await tx.insert(pantryItems).values(have.map((id) => ({ userId, ingredientId: id, low: p.low.includes(id) })));
  });
}

export async function replacePlan(db: Db, userId: string, entries: UserData["plan"]) {
  await db.transaction(async (tx) => {
    await tx.delete(planEntries).where(eq(planEntries.userId, userId));
    if (entries.length) await tx.insert(planEntries).values(entries.map((e, position) => ({ ...e, userId, position })));
  });
}

export async function replaceFavorites(db: Db, userId: string, slugs: UserData["favorites"]) {
  await db.transaction(async (tx) => {
    await tx.delete(favorites).where(eq(favorites.userId, userId));
    const unique = [...new Set(slugs)];
    if (unique.length) await tx.insert(favorites).values(unique.map((s, position) => ({ userId, slug: s, position })));
  });
}

export async function replaceChecks(db: Db, userId: string, ids: UserData["checked"]) {
  await db.transaction(async (tx) => {
    await tx.delete(shoppingChecks).where(eq(shoppingChecks.userId, userId));
    const unique = [...new Set(ids)];
    if (unique.length) await tx.insert(shoppingChecks).values(unique.map((id) => ({ userId, ingredientId: id })));
  });
}

/**
 * Combines data saved in the browser before signing in with the account's data.
 * Everything is a union; where both sides have the same plan entry, the account wins.
 */
export function mergeUserData(server: UserData, local: UserData): UserData {
  const have = [...new Set([...server.pantry.have, ...local.pantry.have])];
  const low = [...new Set([...server.pantry.low, ...local.pantry.low])].filter((id) => have.includes(id));
  const ids = new Set(server.plan.map((e) => e.id));
  return {
    pantry: { have, low },
    plan: [...server.plan, ...local.plan.filter((e) => !ids.has(e.id))].slice(0, 100),
    favorites: [...new Set([...server.favorites, ...local.favorites])].slice(0, 300),
    checked: [...new Set([...server.checked, ...local.checked])],
  };
}

/** Saves every collection in one transaction, so a failure leaves the account unchanged. */
export async function saveUserData(db: Db, userId: string, data: UserData) {
  await db.transaction(async (tx) => {
    await replacePantry(tx, userId, data.pantry);
    await replacePlan(tx, userId, data.plan);
    await replaceFavorites(tx, userId, data.favorites);
    await replaceChecks(tx, userId, data.checked);
  });
}
