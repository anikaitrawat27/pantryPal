import { INGREDIENTS_BY_ID } from "@/data/pantry";
import {
  COURSES,
  CUISINES,
  EQUIPMENT,
  MEALS,
  type Course,
  type Cuisine,
  type Equipment,
  type Meal,
} from "@/data/schema";
import type { RecipeSummary } from "./catalog";
import { DIETS, type Diet } from "./diet";
import { includesAll, matchPantry, normalize, type PantryMatch } from "./match";

export type HaveMode = "includes" | "only";

export const SORTS = ["az", "cost", "time", "protein"] as const;
export type Sort = (typeof SORTS)[number];

export interface FilterState {
  q: string;
  courses: Course[];
  meals: Meal[];
  cuisines: Cuisine[];
  diets: Diet[];
  /** Tools the cook has. A recipe matches when it needs nothing else. Empty means any. */
  tools: Equipment[];
  /** Maximum total minutes. */
  maxTime?: number;
  /** Maximum difficulty, 1 to 3. */
  maxLevel?: 1 | 2 | 3;
  /** Maximum estimated dollars per serving. */
  maxCost?: number;
  sort: Sort;
  noExtras: boolean;
  have: string[];
  /**
   * How `have` is matched. The browse page always uses "only" (what can I make with these);
   * the public API and the chat's search tool can also ask for "includes".
   */
  haveMode: HaveMode;
}

export const EMPTY_FILTERS: FilterState = {
  q: "",
  courses: [],
  meals: [],
  cuisines: [],
  diets: [],
  tools: [],
  noExtras: false,
  have: [],
  haveMode: "only",
  sort: "az",
};

/** In "only" mode, recipes missing more than this many ingredients are hidden. */
export const MAX_MISSING = 2;

export interface FilterResult {
  recipe: RecipeSummary;
  /** Present in "only" mode. */
  match?: PantryMatch;
}

/** Search matches the recipe name only, so "alf" finds Alfredo but not a blurb that says "half". */
function matchesText(r: RecipeSummary, q: string): boolean {
  if (!q) return true;
  const title = normalize(r.title);
  return q.split(" ").every((word) => title.includes(word));
}

function passesFacets(r: RecipeSummary, f: FilterState, q: string): boolean {
  if (f.courses.length && !f.courses.includes(r.course)) return false;
  if (f.meals.length && !r.meal.some((m) => f.meals.includes(m))) return false;
  if (f.cuisines.length && !f.cuisines.includes(r.cuisine)) return false;
  if (f.diets.length && !f.diets.every((d) => r.diets.includes(d))) return false;
  if (f.tools.length && !r.equipment.every((e) => e === "no-cook" || f.tools.includes(e))) return false;
  if (f.maxTime !== undefined && r.totalMin > f.maxTime) return false;
  if (f.maxLevel !== undefined && r.difficulty > f.maxLevel) return false;
  if (f.maxCost !== undefined && r.cost > f.maxCost) return false;
  if (f.noExtras && r.usesExtras) return false;
  return matchesText(r, q);
}

const COMPARATORS: Record<Sort, (a: RecipeSummary, b: RecipeSummary) => number> = {
  az: (a, b) => a.title.localeCompare(b.title),
  cost: (a, b) => a.cost - b.cost || a.title.localeCompare(b.title),
  time: (a, b) => a.totalMin - b.totalMin || a.title.localeCompare(b.title),
  protein: (a, b) => b.nutrition.protein - a.nutrition.protein || a.title.localeCompare(b.title),
};

/**
 * Applies every filter. In "includes" mode results follow the chosen sort. In
 * "only" mode they are ranked by fewest missing ingredients, then fewest swaps,
 * then most of the cook's items used, then the chosen sort.
 */
export function filterRecipes(recipes: readonly RecipeSummary[], f: FilterState): FilterResult[] {
  const q = normalize(f.q);
  const compare = COMPARATORS[f.sort];
  const faceted = recipes.filter((r) => passesFacets(r, f, q));

  if (f.have.length === 0 || f.haveMode === "includes") {
    return faceted
      .filter((r) => includesAll(r.ingredients, f.have))
      .sort(compare)
      .map((recipe) => ({ recipe }));
  }

  return faceted
    .map((recipe) => ({ recipe, match: matchPantry(recipe.ingredients, f.have) }))
    .filter(({ match }) => match.missing.length <= MAX_MISSING && match.used > 0)
    .sort(
      (a, b) =>
        a.match.missing.length - b.match.missing.length ||
        a.match.swaps.length - b.match.swaps.length ||
        b.match.used - a.match.used ||
        compare(a.recipe, b.recipe),
    );
}

// URL serialization. Keys are short so shared links stay readable.

function pickList<T extends string>(params: URLSearchParams, key: string, allowed: readonly T[]): T[] {
  const raw = params.get(key);
  if (!raw) return [];
  const set = new Set<string>(allowed);
  return [...new Set(raw.split(","))].filter((v): v is T => set.has(v));
}

function pickInt(params: URLSearchParams, key: string, min: number, max: number): number | undefined {
  if (!params.has(key)) return undefined;
  const n = Number(params.get(key));
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
}

/**
 * "Breakfast" is both a course and a meal. Browsing offers it once, as a meal, which also
 * covers every breakfast-course recipe. The API and chat still accept the course.
 */
export const COURSE_FILTERS = COURSES.filter((c) => c !== "breakfast");

export function parseFilters(params: URLSearchParams): FilterState {
  const courses = pickList(params, "course", COURSES);
  const meals = pickList(params, "meal", MEALS);
  // Older links used course=breakfast; read it as the meal so no hidden filter is left on.
  const breakfast = courses.includes("breakfast");
  return {
    q: (params.get("q") ?? "").slice(0, 100),
    courses: breakfast ? courses.filter((c) => c !== "breakfast") : courses,
    meals: breakfast && !meals.includes("breakfast") ? [...meals, "breakfast"] : meals,
    cuisines: pickList(params, "cuisine", CUISINES),
    diets: pickList(params, "diet", DIETS),
    tools: pickList(params, "tools", EQUIPMENT),
    maxTime: pickInt(params, "time", 1, 600),
    maxLevel: pickInt(params, "level", 1, 3) as FilterState["maxLevel"],
    maxCost: pickInt(params, "cost", 1, 20),
    sort: (SORTS as readonly string[]).includes(params.get("sort") ?? "") ? (params.get("sort") as Sort) : "az",
    noExtras: params.get("noextras") === "1",
    have: pickList(params, "have", [...INGREDIENTS_BY_ID.keys()]),
    haveMode: "only",
  };
}

export function serializeFilters(f: FilterState): URLSearchParams {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.courses.length) p.set("course", f.courses.join(","));
  if (f.meals.length) p.set("meal", f.meals.join(","));
  if (f.cuisines.length) p.set("cuisine", f.cuisines.join(","));
  if (f.diets.length) p.set("diet", f.diets.join(","));
  if (f.tools.length) p.set("tools", f.tools.join(","));
  if (f.maxTime !== undefined) p.set("time", String(f.maxTime));
  if (f.maxLevel !== undefined) p.set("level", String(f.maxLevel));
  if (f.maxCost !== undefined) p.set("cost", String(f.maxCost));
  if (f.noExtras) p.set("noextras", "1");
  if (f.have.length) p.set("have", f.have.join(","));
  if (f.sort !== "az") p.set("sort", f.sort);
  return p;
}

export function activeFilterCount(f: FilterState): number {
  return (
    f.courses.length +
    f.meals.length +
    f.cuisines.length +
    f.diets.length +
    f.tools.length +
    (f.maxTime !== undefined ? 1 : 0) +
    (f.maxLevel !== undefined ? 1 : 0) +
    (f.maxCost !== undefined ? 1 : 0) +
    (f.noExtras ? 1 : 0)
  );
}
