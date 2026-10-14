import "server-only";
import * as z from "zod/v4";
import { recipeDetail } from "@/lib/api/recipe-detail";
import { defineTool } from "./types";

export const getRecipeTool = defineTool({
  name: "get_recipe",
  description: "Get one recipe's ingredients and steps, scaled to a serving count, optionally with ingredient swaps.",
  input: z.strictObject({
    slug: z.string(),
    servings: z.number().int().optional().describe("1 to 6."),
    swaps: z.array(z.strictObject({ from: z.string(), to: z.string() })).optional(),
  }),
  label: (i, lang) => (lang === "es" ? "Abriendo la receta" : "Opening the recipe") + `: ${i.slug}`,
  run: async (i, ctx) => {
    const d = recipeDetail(i.slug, {
      lang: ctx.lang,
      servings: i.servings === undefined ? undefined : Math.min(6, Math.max(1, i.servings)),
      swap: (i.swaps ?? []).map((s) => `${s.from}:${s.to}`),
    });
    return {
      slug: d.slug,
      url: d.url,
      title: d.title,
      servings: d.servings,
      minutes: d.totalMinutes,
      equipment: d.equipment,
      ingredients: d.ingredients.map((ing) => ({
        line: ing.line,
        optional: ing.optional,
        swapOptions: ing.swapOptions.map((o) => o.id),
      })),
      steps: d.steps,
      diets: d.diets,
      nutritionPerServing: d.nutritionPerServing,
      costPerServingUsd: d.costPerServingUsd,
    };
  },
});
