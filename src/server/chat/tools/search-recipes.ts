import "server-only";
import * as z from "zod/v4";
import { COURSES, CUISINES, EQUIPMENT, MEALS } from "@/data/schema";
import { searchRecipes } from "@/lib/api/search";
import { DIETS } from "@/lib/diet";
import { SORTS } from "@/lib/filter";
import { clampLimit, forModel, query } from "./shared";
import { defineTool, ingredientIds } from "./types";

const searchInput = z.strictObject({
  query: z.string().optional().describe("Words to match in titles and ingredient names."),
  courses: z.array(z.enum(COURSES)).optional(),
  meals: z.array(z.enum(MEALS)).optional(),
  cuisines: z.array(z.enum(CUISINES)).optional(),
  diets: z.array(z.enum(DIETS)).optional().describe("Every listed diet must apply."),
  tools: z
    .array(z.enum(EQUIPMENT))
    .optional()
    .describe("Tools the cook has; recipes needing anything else are excluded."),
  maxMinutes: z.number().int().optional(),
  maxDifficulty: z.number().int().optional().describe("1 easy, 2 medium, 3 a little project."),
  maxCostUsd: z.number().optional().describe("Maximum estimated cost per serving."),
  noExtras: z.boolean().optional().describe("Exclude recipes that require extra seasonings."),
  ingredients: ingredientIds.optional().describe("Recipes must use all of these."),
  sort: z.enum(SORTS).optional(),
  limit: z.number().int().optional().describe("1 to 10, default 6."),
});

export const searchRecipesTool = defineTool({
  name: "search_recipes",
  description:
    "Search the Pantry Pal catalog of 250 recipes. Use it for any question about which recipes exist, e.g. quick dinners, vegan options, recipes with chickpeas, cheapest breakfasts.",
  input: searchInput,
  label: (i, lang) => (lang === "es" ? "Buscando recetas" : "Searching recipes") + (i.query ? `: ${i.query}` : ""),
  run: async (i, ctx) => {
    const res = searchRecipes(
      query(ctx.lang, {
        q: i.query ?? "",
        course: i.courses ?? [],
        meal: i.meals ?? [],
        cuisine: i.cuisines ?? [],
        diet: i.diets ?? [],
        tools: i.tools ?? [],
        maxTime: i.maxMinutes,
        maxLevel: i.maxDifficulty,
        maxCost: i.maxCostUsd,
        noExtras: i.noExtras,
        have: i.ingredients ?? [],
        sort: i.sort ?? "az",
        limit: clampLimit(i.limit),
      }),
    );
    if (res.data.length) ctx.emit({ type: "recipes", items: res.data });
    // Echo the filters that were applied, so the model can tell a real empty or broad result from a bad call.
    return { appliedFilters: i, ...forModel(res.data, res.total) };
  },
});
