import { z } from "zod";
import { getIngredient } from "@/data/pantry";
import type { Substitution } from "@/data/schema";
import { localePath } from "@/i18n/config";
import { ingredientName, subNote } from "@/i18n/ingredients";
import { localizeRecipe } from "@/i18n/recipes";
import { getRecipe } from "@/lib/catalog";
import { dietsFor } from "@/lib/diet";
import { costPerServing, nutritionPerServing } from "@/lib/nutrition";
import { formatIngredientLine, scaleAmount } from "@/lib/scale";
import { applySub, resolveSubs } from "@/lib/substitute";
import { ApiError, fieldsFromZod } from "./http";
import { intParam, langParam } from "./params";
import type { RecipeListItem } from "./search";

/** GET /api/recipes/{slug}: one recipe, scaled to a serving count, with swaps applied. */

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
