import "server-only";
import type { Lang } from "@/i18n/config";
import type { RecipeListItem, SearchQuery } from "@/lib/api/search";

export function query(lang: Lang, over: Partial<SearchQuery>): SearchQuery {
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

export const clampLimit = (n: number | undefined) => Math.min(10, Math.max(1, n ?? 6));

/** The compact view the model reads; the page gets full cards separately. */
export function forModel(items: RecipeListItem[], total: number) {
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
