import { z } from "zod";
import { getIngredient, INGREDIENTS_BY_ID } from "@/data/pantry";
import { COURSES, CUISINES, EQUIPMENT, MEALS, type Substitution } from "@/data/schema";
import { LANGS, localePath, type Lang } from "@/i18n/config";
import { ingredientName, packLabel, subNote } from "@/i18n/ingredients";
import { localizeRecipe } from "@/i18n/recipes";
import { getRecipe, RECIPES, toSummary, type RecipeSummary } from "@/lib/catalog";
import { DIETS, dietsFor } from "@/lib/diet";
import { EMPTY_FILTERS, filterRecipes, SORTS, type FilterState } from "@/lib/filter";
import type { PantryMatch } from "@/lib/match";
import { costPerServing, nutritionPerServing } from "@/lib/nutrition";
import { formatIngredientLine, scaleAmount } from "@/lib/scale";
import { buildShoppingList, shoppingListText } from "@/lib/shopping";
import { applySub, resolveSubs } from "@/lib/substitute";
import { ApiError, fieldsFromZod } from "./http";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;
const MAX_MEALS = 60;

// Query-string helpers. A list is comma separated ("course=main,soup"); every value must be known.

const list = <T extends string>(values: readonly [T, ...T[]]) =>
  z.preprocess(
    (v) => (typeof v === "string" && v !== "" ? v.split(",") : []),
    z.array(z.enum(values, { errorMap: () => ({ message: `Expected one of: ${values.join(", ")}` }) })),
  );

const ingredientId = z.string().refine(
  (id) => INGREDIENTS_BY_ID.has(id),
  (id) => ({ message: `Unknown ingredient "${id}"` }),
);

const ingredientList = z.preprocess(
  (v) => (typeof v === "string" && v !== "" ? v.split(",") : []),
  z.array(ingredientId),
);

const intParam = (min: number, max: number) => z.coerce.number().int().min(min).max(max);

const boolParam = z.enum(["true", "false", "1", "0"]).transform((v) => v === "true" || v === "1");

const langParam = z.enum(LANGS).default("en");

/** Cursors are opaque to clients; internally they are a base64url offset. */
export function encodeCursor(offset: number): string {
  return Buffer.from(`o:${offset}`).toString("base64url");
}

function decodeCursor(cursor: string): number | null {
  const m = Buffer.from(cursor, "base64url")
    .toString()
    .match(/^o:(\d+)$/);
  return m ? Number(m[1]) : null;
}

const searchQuerySchema = z
  .object({
    q: z.string().max(100).default(""),
    course: list(COURSES),
    meal: list(MEALS),
    cuisine: list(CUISINES),
    diet: list(DIETS),
    tools: list(EQUIPMENT),
    maxTime: intParam(1, 600).optional(),
    maxLevel: intParam(1, 3).optional(),
    maxCost: z.coerce.number().positive().max(100).optional(),
    noExtras: boolParam.optional(),
    have: ingredientList,
    mode: z.enum(["includes", "only"]).default("includes"),
    sort: z.enum(SORTS).default("az"),
    lang: langParam,
    limit: intParam(1, MAX_LIMIT).default(DEFAULT_LIMIT),
    cursor: z.string().optional(),
  })
  .strict();

export type SearchQuery = z.infer<typeof searchQuerySchema>;

/** Parameter names, for keeping the OpenAPI description in sync (see tests). */
export const SEARCH_PARAMS = Object.keys(searchQuerySchema.shape);

/** Validates search query parameters, rejecting unknown parameters and values. */
export function parseSearchQuery(params: URLSearchParams): SearchQuery {
  const result = searchQuerySchema.safeParse(Object.fromEntries(params));
  if (!result.success) throw ApiError.invalid("Invalid query parameters.", fieldsFromZod(result.error));
  if (result.data.cursor !== undefined && decodeCursor(result.data.cursor) === null) {
    throw ApiError.invalid("Invalid query parameters.", { cursor: "Not a valid cursor." });
  }
  return result.data;
}

function toFilterState(q: SearchQuery): FilterState {
  return {
    ...EMPTY_FILTERS,
    q: q.q,
    courses: q.course,
    meals: q.meal,
    cuisines: q.cuisine,
    diets: q.diet,
    tools: q.tools,
    maxTime: q.maxTime,
    maxLevel: q.maxLevel as FilterState["maxLevel"],
    maxCost: q.maxCost,
    noExtras: q.noExtras ?? false,
    have: q.have,
    haveMode: q.mode,
    sort: q.sort,
  };
}

/** The public shape of a recipe in search results. */
export interface RecipeListItem {
  slug: string;
  url: string;
  title: string;
  blurb: string;
  course: string;
  meals: string[];
  cuisine: string;
  equipment: string[];
  difficulty: number;
  totalMinutes: number;
  baseServings: number;
  diets: string[];
  usesExtras: boolean;
  nutritionPerServing: { calories: number; proteinGrams: number; fiberGrams: number };
  costPerServingUsd: number;
  /** Present when searching with `mode=only`. */
  pantryMatch?: { missing: string[]; swaps: { from: string; to: string }[] };
}

function listItem(r: RecipeSummary, lang: Lang, match?: PantryMatch): RecipeListItem {
  return {
    slug: r.slug,
    url: localePath(lang, `/recipes/${r.slug}`),
    title: r.title,
    blurb: r.blurb,
    course: r.course,
    meals: r.meal,
    cuisine: r.cuisine,
    equipment: r.equipment,
    difficulty: r.difficulty,
    totalMinutes: r.totalMin,
    baseServings: r.serves,
    diets: r.diets,
    usesExtras: r.usesExtras,
    nutritionPerServing: {
      calories: r.nutrition.kcal,
      proteinGrams: r.nutrition.protein,
      fiberGrams: r.nutrition.fiber,
    },
    costPerServingUsd: r.cost,
    ...(match ? { pantryMatch: { missing: match.missing, swaps: match.swaps } } : {}),
  };
}

export interface SearchResponse {
  data: RecipeListItem[];
  total: number;
  nextCursor: string | null;
}

export function searchRecipes(q: SearchQuery): SearchResponse {
  const results = filterRecipes(
    RECIPES.map((r) => toSummary(r, q.lang)),
    toFilterState(q),
  );
  const offset = q.cursor ? decodeCursor(q.cursor)! : 0;
  const page = results.slice(offset, offset + q.limit);
  const next = offset + q.limit;
  return {
    data: page.map((r) => listItem(r.recipe, q.lang, r.match)),
    total: results.length,
    nextCursor: next < results.length ? encodeCursor(next) : null,
  };
}

// Recipe detail

const detailQuerySchema = z
  .object({
    servings: intParam(1, 6).optional(),
    lang: langParam,
    swap: z.array(z.string().regex(/^[a-z0-9-]+:[a-z0-9-]+$/, 'Expected "from:to", e.g. "butter:oil"')).default([]),
  })
  .strict();

export type DetailQuery = z.infer<typeof detailQuerySchema>;

export const DETAIL_PARAMS = Object.keys(detailQuerySchema.shape);

export function parseDetailQuery(params: URLSearchParams): DetailQuery {
  const raw: Record<string, unknown> = Object.fromEntries(params);
  raw.swap = params.getAll("swap");
  const result = detailQuerySchema.safeParse(raw);
  if (!result.success) throw ApiError.invalid("Invalid query parameters.", fieldsFromZod(result.error));
  return result.data;
}

export interface RecipeDetail
  extends Omit<RecipeListItem, "pantryMatch" | "nutritionPerServing" | "costPerServingUsd" | "diets"> {
  servings: number;
  prepMinutes: number;
  cookMinutes: number;
  ingredients: {
    id: string;
    name: string;
    /** Display line at the requested servings, e.g. "1 1/2 cups milk". */
    line: string;
    quantity: number | null;
    unit: string | null;
    note: string | null;
    optional: boolean;
    extra: boolean;
    swappedFrom: string | null;
    swapOptions: { id: string; name: string; note: string | null }[];
  }[];
  steps: string[];
  tips: string[];
  /** Recomputed after swaps. */
  diets: string[];
  nutritionPerServing: RecipeListItem["nutritionPerServing"];
  costPerServingUsd: number;
  totalCostUsd: number;
}

/** One recipe scaled to `servings` with `swaps` applied. Unknown slugs are 404s; invalid swaps are 400s. */
export function recipeDetail(slug: string, q: DetailQuery): RecipeDetail {
  const recipe = getRecipe(slug);
  if (!recipe) throw ApiError.notFound(`No recipe with slug "${slug}".`);
  const { lang } = q;
  const servings = q.servings ?? recipe.serves;
  const factor = servings / recipe.serves;
  const text = localizeRecipe(recipe, lang);

  const swaps = new Map<string, Substitution>();
  const fields: Record<string, string> = {};
  q.swap.forEach((s, i) => {
    const [from, to] = s.split(":");
    const ing = recipe.ingredients.find((x) => x.id === from);
    const option = ing && resolveSubs(ing).find((o) => o.id === to);
    if (!ing) fields[`swap.${i}`] = `This recipe does not use "${from}".`;
    else if (!option) fields[`swap.${i}`] = `"${to}" is not a swap for "${from}" in this recipe.`;
    else swaps.set(from, option);
  });
  if (Object.keys(fields).length) throw ApiError.invalid("Invalid swap.", fields);

  const current = recipe.ingredients.map((ing) => (swaps.has(ing.id) ? applySub(ing, swaps.get(ing.id)!) : ing));
  const cost = costPerServing(current, recipe.serves);
  const nutrition = nutritionPerServing(current, recipe.serves);

  return {
    slug: recipe.slug,
    url: localePath(lang, `/recipes/${recipe.slug}`),
    title: text.title,
    blurb: text.blurb,
    course: recipe.course,
    meals: recipe.meal,
    cuisine: recipe.cuisine,
    equipment: recipe.equipment,
    difficulty: recipe.difficulty,
    prepMinutes: recipe.prep,
    cookMinutes: recipe.cook,
    totalMinutes: recipe.totalMin,
    baseServings: recipe.serves,
    servings,
    usesExtras: recipe.usesExtras,
    ingredients: current.map((ing, i) => {
      const original = recipe.ingredients[i];
      const sub = swaps.get(original.id);
      const amount = scaleAmount(ing, factor);
      return {
        id: ing.id,
        name: ingredientName(ing.id, lang),
        line: formatIngredientLine(ing.id, amount, lang),
        quantity: amount.qty ?? null,
        unit: amount.unit ?? null,
        note: sub ? (sub.note ? subNote(sub.note, lang) : null) : (text.notes[original.id] ?? null),
        optional: Boolean(ing.optional),
        extra: getIngredient(ing.id).tier === "extra",
        swappedFrom: sub ? original.id : null,
        swapOptions: sub
          ? []
          : resolveSubs(original).map((o) => ({
              id: o.id,
              name: ingredientName(o.id, lang),
              note: o.note ? subNote(o.note, lang) : null,
            })),
      };
    }),
    steps: text.steps,
    tips: text.tips ?? [],
    diets: dietsFor(current),
    nutritionPerServing: { calories: nutrition.kcal, proteinGrams: nutrition.protein, fiberGrams: nutrition.fiber },
    costPerServingUsd: cost,
    totalCostUsd: Math.round(cost * servings * 100) / 100,
  };
}

// Shopping list

export const shoppingListBodySchema = z
  .object({
    meals: z
      .array(
        z
          .object({
            slug: z.string().refine(
              (s) => Boolean(getRecipe(s)),
              (s) => ({ message: `Unknown recipe "${s}"` }),
            ),
            servings: z.number().int().min(1).max(6),
          })
          .strict(),
      )
      .max(MAX_MEALS, `At most ${MAX_MEALS} meals`),
    pantry: z
      .object({ have: z.array(ingredientId).default([]), low: z.array(ingredientId).default([]) })
      .strict()
      .default({ have: [], low: [] }),
    checked: z.array(ingredientId).default([]),
    lang: langParam,
  })
  .strict();

export type ShoppingListBody = z.infer<typeof shoppingListBodySchema>;

export function parseShoppingListBody(raw: unknown): ShoppingListBody {
  const result = shoppingListBodySchema.safeParse(raw);
  if (!result.success) throw ApiError.invalid("Invalid request body.", fieldsFromZod(result.error));
  return result.data;
}

export interface ShoppingListResponse {
  items: {
    id: string;
    group: string;
    line: string;
    status: "buy" | "low" | "have";
    packages: number;
    packageLabel: string | null;
    costUsd: number;
    recipes: string[];
    checked: boolean;
  }[];
  totalUsd: number;
  /** Text version of the items still to buy, for copying. */
  text: string;
}

export function shoppingList(body: ShoppingListBody): ShoppingListResponse {
  const { lang } = body;
  const bySlug = new Map(RECIPES.map((r) => [r.slug, toSummary(r, lang)]));
  const list = buildShoppingList(body.meals, bySlug, body.pantry, lang);
  const items = list.items.map((i) => ({
    id: i.id,
    group: i.group,
    line: i.line,
    status: i.status,
    packages: i.packages,
    packageLabel: i.packLabel ? packLabel(i.packLabel, lang) : null,
    costUsd: i.cost,
    recipes: i.recipes,
    checked: body.checked.includes(i.id),
  }));
  return { items, totalUsd: list.total, text: shoppingListText(list, body.checked, (l) => packLabel(l, lang)) };
}
