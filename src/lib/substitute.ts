import type { RecipeIngredient, Substitution } from "@/data/schema";
import { GLOBAL_SUBSTITUTIONS } from "@/data/substitutions";

/** The swaps available for one ingredient line in a recipe. */
export function resolveSubs(ing: RecipeIngredient): readonly Substitution[] {
  if (ing.noSubs) return [];
  const candidates = ing.subs ?? GLOBAL_SUBSTITUTIONS[ing.id] ?? [];
  const unit = ing.unit ?? "count";
  return candidates.filter((s) => s.from === undefined || s.from === unit);
}

/** Returns the ingredient line rewritten to use `sub`. */
export function applySub(ing: RecipeIngredient, sub: Substitution): RecipeIngredient {
  return {
    ...ing,
    id: sub.id,
    qty: ing.qty === undefined ? undefined : ing.qty * (sub.ratio ?? 1),
    unit: sub.unit ?? ing.unit,
    note: sub.note ?? ing.note,
    subs: undefined,
    noSubs: true,
  };
}
