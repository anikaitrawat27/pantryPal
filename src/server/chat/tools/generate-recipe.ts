import "server-only";
import * as z from "zod/v4";
import { COURSES } from "@/data/schema";
import { randomId } from "@/server/auth/crypto";
import { generatedRecipes } from "@/server/db/schema";
import { generateRecipe } from "../generate";
import { defineTool, ingredientIds } from "./types";

export const generateRecipeTool = defineTool({
  name: "generate_recipe",
  description:
    "Write a new recipe when no catalog recipe fits (check search_recipes first). The result is validated against the pantry-only, no-oven rules before the user sees it.",
  input: z.strictObject({
    request: z.string().describe("What the user wants, in a sentence."),
    mustUse: ingredientIds.optional(),
    course: z.enum(COURSES).optional(),
    servings: z.number().int().optional(),
    maxMinutes: z.number().int().optional(),
  }),
  label: (_i, lang) => (lang === "es" ? "Escribiendo una receta nueva" : "Writing a new recipe"),
  run: async (i, ctx) => {
    const id = randomId().slice(0, 10);
    const outcome = await generateRecipe(
      ctx.client,
      {
        request: i.request,
        mustUse: i.mustUse ?? [],
        course: i.course,
        servings: i.servings === undefined ? undefined : Math.min(6, Math.max(1, i.servings)),
        maxMinutes: i.maxMinutes,
        lang: ctx.lang,
      },
      id.slice(0, 6),
      ctx.signal,
    );
    if (!outcome.ok) return { error: "Could not write a recipe that passes the rules.", problems: outcome.problems };
    const { result } = outcome;
    await ctx.db.insert(generatedRecipes).values({ id, userId: ctx.userId, recipe: result });
    ctx.emit({ type: "generated", id, recipe: result });
    const text = ctx.lang === "es" && result.es ? result.es : result.recipe;
    return {
      id,
      title: text.title,
      blurb: text.blurb,
      servings: result.recipe.serves,
      minutes: result.recipe.prep + result.recipe.cook,
      equipment: result.recipe.equipment,
      costPerServingUsd: result.costPerServingUsd,
      note: "The recipe card is already shown to the user. Summarize it briefly; do not repeat the steps.",
    };
  },
});
