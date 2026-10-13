import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { ApiError } from "@/lib/api/http";
import type { GeneratedRecipe } from "./chat/generate";
import type { Db } from "./db";
import { generatedRecipes } from "./db/schema";

export async function listSavedRecipes(db: Db, userId: string) {
  const rows = await db
    .select()
    .from(generatedRecipes)
    .where(and(eq(generatedRecipes.userId, userId), eq(generatedRecipes.saved, true)))
    .orderBy(desc(generatedRecipes.createdAt));
  return rows.map((r) => ({ id: r.id, saved: r.saved, ...(r.recipe as GeneratedRecipe) }));
}

export async function getGeneratedRecipe(db: Db, userId: string, id: string) {
  const [row] = await db
    .select()
    .from(generatedRecipes)
    .where(and(eq(generatedRecipes.id, id), eq(generatedRecipes.userId, userId)));
  if (!row) throw ApiError.notFound("Recipe not found.");
  return { id: row.id, saved: row.saved, ...(row.recipe as GeneratedRecipe) };
}

export async function setSaved(db: Db, userId: string, id: string, saved: boolean) {
  const updated = await db
    .update(generatedRecipes)
    .set({ saved })
    .where(and(eq(generatedRecipes.id, id), eq(generatedRecipes.userId, userId)))
    .returning({ id: generatedRecipes.id });
  if (updated.length === 0) throw ApiError.notFound("Recipe not found.");
}
