import { FACTS, type GramUnit } from "@/data/facts";
import { getIngredient } from "@/data/pantry";
import type { RecipeIngredient } from "@/data/schema";
import { VOLUME_IN_TSP } from "./scale";

const OZ_GRAMS = 28.35;
const LB_GRAMS = 453.6;
/** Share of shallow-frying oil that ends up in the food. */
const FRYING_OIL_ABSORBED = 0.2;
/** Small measures as fractions of a cup. */
const CUP_FRACTION: Record<string, number> = { pinch: 1 / 768, dash: 1 / 384, splash: 1 / 16 };

/**
 * Grams of an ingredient line. Cooked rice converts to its dry weight.
 * Throws when the ingredient has no weight for the unit, which the content
 * tests rule out for every recipe.
 */
export function gramsOf(ing: Pick<RecipeIngredient, "id" | "qty" | "unit" | "cooked">): number {
  if (ing.qty === undefined) return 0;
  const facts = FACTS[ing.id];
  if (!facts) throw new Error(`No facts for ingredient "${ing.id}"`);
  const { unit, qty } = ing;

  if (ing.cooked && facts.cooked && unit === "cup") return (qty * facts.cooked.cupGrams) / facts.cooked.yield;
  if (unit === "oz") return qty * OZ_GRAMS;
  if (unit === "lb") return qty * LB_GRAMS;

  const cup = facts.grams.cup;
  if (unit && unit in VOLUME_IN_TSP && cup !== undefined) return (qty * cup * VOLUME_IN_TSP[unit]!) / 48;
  if (unit && unit in CUP_FRACTION && cup !== undefined) return qty * cup * CUP_FRACTION[unit];

  const per = facts.grams[(unit ?? "each") as GramUnit];
  if (per === undefined) throw new Error(`No weight for ${ing.id} measured in ${unit ?? "each"}`);
  return qty * per;
}

export interface Nutrition {
  kcal: number;
  protein: number;
  fiber: number;
}

/** Estimated nutrition per serving from the required ingredients. */
export function nutritionPerServing(ingredients: readonly RecipeIngredient[], serves: number): Nutrition {
  const total = { kcal: 0, protein: 0, fiber: 0 };
  for (const ing of ingredients) {
    if (ing.optional) continue;
    const g = (gramsOf(ing) * (ing.frying ? FRYING_OIL_ABSORBED : 1)) / 100;
    const f = FACTS[ing.id];
    total.kcal += g * f.kcal;
    total.protein += g * f.protein;
    total.fiber += g * f.fiber;
  }
  return {
    kcal: Math.round(total.kcal / serves / 10) * 10,
    protein: Math.round(total.protein / serves),
    fiber: Math.round(total.fiber / serves),
  };
}

/**
 * Estimated cost per serving in U.S. dollars, by the share of each package used.
 * Water and ice are free.
 */
export function costPerServing(ingredients: readonly RecipeIngredient[], serves: number): number {
  let total = 0;
  for (const ing of ingredients) {
    if (ing.optional || getIngredient(ing.id).tier === "free") continue;
    const pack = FACTS[ing.id].pack;
    if (pack) total += (gramsOf(ing) * pack.usd) / pack.grams;
  }
  return Math.round((total / serves) * 100) / 100;
}

export function formatUsd(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}
