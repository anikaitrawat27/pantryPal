import { ASSUMED_ON_HAND, INGREDIENTS, lineage, type Ingredient } from "@/data/pantry";
import type { RecipeIngredient } from "@/data/schema";
import { ingredientSearchNames } from "@/i18n/ingredients";
import { resolveSubs } from "./substitute";

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Autocomplete over ingredient names and aliases in English and Spanish. Prefix matches rank first. */
export function searchIngredients(query: string, limit = 8): Ingredient[] {
  const q = normalize(query);
  if (!q) return [];
  const scored: [number, Ingredient][] = [];
  for (const ing of INGREDIENTS) {
    if (ing.tier === "free") continue;
    const names = ingredientSearchNames(ing.id).map(normalize);
    let score = Infinity;
    for (const n of names) {
      if (n === q) score = Math.min(score, 0);
      else if (n.startsWith(q)) score = Math.min(score, 1);
      else if (n.split(" ").some((w) => w.startsWith(q))) score = Math.min(score, 2);
      else if (n.includes(q)) score = Math.min(score, 3);
    }
    if (score < Infinity) scored.push([score, ing]);
  }
  return scored
    .sort((a, b) => a[0] - b[0] || a[1].name.localeCompare(b[1].name) || a[1].id.localeCompare(b[1].id))
    .slice(0, limit)
    .map(([, ing]) => ing);
}

/**
 * True when ingredient ids `a` and `b` refer to the same thing at different
 * levels of specificity, such as "cheese" and "cheddar".
 */
export function related(a: string, b: string): boolean {
  return lineage(a).includes(b) || lineage(b).includes(a);
}

/** "Includes" mode: the recipe uses every wanted ingredient. */
export function includesAll(ingredients: readonly RecipeIngredient[], wanted: readonly string[]): boolean {
  return wanted.every((w) => ingredients.some((i) => related(i.id, w)));
}

export interface PantryMatch {
  /** Required ingredients the user does not have and cannot swap. */
  missing: string[];
  /** Missing ingredients covered by a swap the user can make. */
  swaps: { from: string; to: string }[];
  /** How many of the user's items the recipe uses. */
  used: number;
}

/** "I only have these" mode: what the user is missing to make this recipe. */
export function matchPantry(ingredients: readonly RecipeIngredient[], have: readonly string[]): PantryMatch {
  const has = (id: string) => ASSUMED_ON_HAND.has(id) || have.some((h) => related(id, h));
  const missing: string[] = [];
  const swaps: PantryMatch["swaps"] = [];
  let used = 0;
  for (const ing of ingredients) {
    if (has(ing.id)) {
      if (!ASSUMED_ON_HAND.has(ing.id)) used++;
      continue;
    }
    if (ing.optional) continue;
    const swap = resolveSubs(ing).find((s) => has(s.id));
    if (swap) swaps.push({ from: ing.id, to: swap.id });
    else missing.push(ing.id);
  }
  return { missing, swaps, used };
}
