import "server-only";
import * as z from "zod/v4";
import { COURSES } from "@/data/schema";
import { searchRecipes } from "@/lib/api/search";
import { getUserData } from "@/server/user-data";
import { clampLimit, forModel, query } from "./shared";
import { defineTool, ingredientIds } from "./types";

export const whatCanIMakeTool = defineTool({
  name: "what_can_i_make",
  description:
    "Find recipes the user can make from ingredients they have, ranked by fewest missing items. Leave ingredients empty to use the user's saved pantry.",
  input: z.strictObject({
    ingredients: ingredientIds
      .optional()
      .describe("Ingredients the user says they have. Omit to use their saved pantry."),
    maxMissing: z.number().int().optional().describe("0 to 2, default 0."),
    courses: z.array(z.enum(COURSES)).optional(),
    maxMinutes: z.number().int().optional(),
    limit: z.number().int().optional(),
  }),
  label: (_i, lang) => (lang === "es" ? "Revisando su despensa" : "Checking your pantry"),
  run: async (i, ctx) => {
    const have = i.ingredients?.length ? i.ingredients : (await getUserData(ctx.db, ctx.userId)).pantry.have;
    if (have.length === 0) return { error: "The user has no saved pantry. Ask which ingredients they have." };
    const maxMissing = Math.min(2, Math.max(0, i.maxMissing ?? 0));
    const res = searchRecipes(
      query(ctx.lang, { have, mode: "only", course: i.courses ?? [], maxTime: i.maxMinutes, limit: 50 }),
    );
    const fits = res.data
      .filter((r) => (r.pantryMatch?.missing.length ?? 0) <= maxMissing)
      .slice(0, clampLimit(i.limit));
    if (fits.length) ctx.emit({ type: "recipes", items: fits });
    return { usedIngredients: have, ...forModel(fits, fits.length) };
  },
});
