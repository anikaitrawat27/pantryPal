import { z } from "zod";
import { COURSES, CUISINES, EQUIPMENT, MEALS } from "@/data/schema";
import { localePath, type Lang } from "@/i18n/config";
import { RECIPES, toSummary, type RecipeSummary } from "@/lib/catalog";
import { DIETS } from "@/lib/diet";
import { EMPTY_FILTERS, filterRecipes, SORTS, type FilterState } from "@/lib/filter";
import type { PantryMatch } from "@/lib/match";
import { ApiError, fieldsFromZod } from "./http";
import { boolParam, decodeCursor, encodeCursor, ingredientList, intParam, langParam, list } from "./params";

/** GET /api/recipes: search and filter the catalog, one page at a time. */

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;

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
