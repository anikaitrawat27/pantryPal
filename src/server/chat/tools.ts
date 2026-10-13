import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import * as z from "zod/v4";
import { INGREDIENTS } from "@/data/pantry";
import { COURSES, CUISINES, EQUIPMENT, MEALS } from "@/data/schema";
import type { Lang } from "@/i18n/config";
import { ApiError } from "@/lib/api/http";
import { recipeDetail, searchRecipes, type RecipeListItem, type SearchQuery } from "@/lib/api/recipes";
import { DIETS } from "@/lib/diet";
import { SORTS } from "@/lib/filter";
import type { Db } from "@/server/db";
import { generatedRecipes } from "@/server/db/schema";
import { getUserData } from "@/server/user-data";
import { randomId } from "@/server/auth/crypto";
import { generateRecipe, type GeneratedRecipe } from "./generate";

const STOCKABLE_IDS = INGREDIENTS.filter((i) => i.tier !== "free").map((i) => i.id) as [string, ...string[]];
const ingredientIds = z.array(z.enum(STOCKABLE_IDS));

/** What the page renders for a turn, besides streamed text. Stored with the turn so a thread reloads the same way. */
export type UiEvent =
  | { type: "tool"; name: string; label: string }
  | { type: "recipes"; items: RecipeListItem[] }
  | { type: "generated"; id: string; recipe: GeneratedRecipe };

export interface ToolContext {
  db: Db;
  userId: string;
  lang: Lang;
  client: Anthropic;
  signal?: AbortSignal;
  emit: (event: UiEvent) => void;
}

interface ChatTool<S extends z.ZodType> {
  name: string;
  description: string;
  input: S;
  label: (input: z.infer<S>, lang: Lang) => string;
  run: (input: z.infer<S>, ctx: ToolContext) => Promise<unknown>;
}

const defineTool = <S extends z.ZodType>(t: ChatTool<S>) => t;

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

function query(lang: Lang, over: Partial<SearchQuery>): SearchQuery {
  return {
    q: "",
    course: [],
    meal: [],
    cuisine: [],
    diet: [],
    tools: [],
    have: [],
    mode: "includes",
    sort: "az",
    lang,
    limit: 6,
    ...over,
  };
}

const clampLimit = (n: number | undefined) => Math.min(10, Math.max(1, n ?? 6));

/** The compact view the model reads; the page gets full cards separately. */
function forModel(items: RecipeListItem[], total: number) {
  return {
    total,
    recipes: items.map((r) => ({
      slug: r.slug,
      title: r.title,
      minutes: r.totalMinutes,
      costPerServingUsd: r.costPerServingUsd,
      calories: r.nutritionPerServing.calories,
      proteinGrams: r.nutritionPerServing.proteinGrams,
      diets: r.diets,
      ...(r.pantryMatch ? { missing: r.pantryMatch.missing, swaps: r.pantryMatch.swaps } : {}),
    })),
  };
}

export const TOOLS = [
  defineTool({
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
      return forModel(res.data, res.total);
    },
  }),
  defineTool({
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
  }),
  defineTool({
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
  }),
  defineTool({
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
  }),
];

/**
 * Zod's JSON Schema output carries a `$schema` key and safe-integer bounds on every int.
 * Strict tool schemas support a subset of keywords, so those are removed; the Zod
 * schema still validates every input before a tool runs.
 */
function toToolSchema(schema: z.ZodType): Anthropic.Beta.BetaTool["input_schema"] {
  const strip = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(strip);
    if (!node || typeof node !== "object") return node;
    return Object.fromEntries(
      Object.entries(node)
        .filter(([k]) => k !== "$schema" && k !== "minimum" && k !== "maximum")
        .map(([k, v]) => [k, strip(v)]),
    );
  };
  return strip(z.toJSONSchema(schema, { target: "draft-7" })) as Anthropic.Beta.BetaTool["input_schema"];
}

/** Tool definitions for the API. Schemas come from the same Zod objects used to validate input. */
export const API_TOOLS: Anthropic.Beta.BetaTool[] = TOOLS.map((t) => ({
  name: t.name,
  description: t.description,
  strict: true,
  input_schema: toToolSchema(t.input),
}));

export interface ToolOutcome {
  content: string;
  isError: boolean;
}

/** Validates the model's input against the tool's schema, runs it, and turns failures into error results. */
export async function runTool(name: string, rawInput: unknown, ctx: ToolContext): Promise<ToolOutcome> {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) return { content: `Unknown tool "${name}".`, isError: true };
  const parsed = tool.input.safeParse(rawInput);
  if (!parsed.success) return { content: `Invalid input: ${z.prettifyError(parsed.error)}`, isError: true };
  ctx.emit({ type: "tool", name, label: (tool.label as (i: unknown, l: Lang) => string)(parsed.data, ctx.lang) });
  try {
    const result = await (tool.run as (i: unknown, c: ToolContext) => Promise<unknown>)(parsed.data, ctx);
    return { content: JSON.stringify(result), isError: false };
  } catch (err) {
    if (err instanceof ApiError) return { content: err.body.error.message, isError: true };
    throw err;
  }
}
