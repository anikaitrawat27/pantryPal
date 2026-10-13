import { getIngredient } from "@/data/pantry";
import type { RecipeIngredient, Unit } from "@/data/schema";
import type { Lang } from "@/i18n/config";
import { ingredientCanName, ingredientName, ingredientPlural, joinAmount, toTaste, unitName } from "@/i18n/ingredients";

/** Fractions a home cook can measure, as [value, label]. */
const FRACTIONS: readonly [number, string][] = [
  [0, ""],
  [1 / 8, "1/8"],
  [1 / 4, "1/4"],
  [1 / 3, "1/3"],
  [1 / 2, "1/2"],
  [2 / 3, "2/3"],
  [3 / 4, "3/4"],
  [1, ""],
];

/** Rounds to the nearest measurable fraction. */
export function roundFriendly(value: number): number {
  const whole = Math.floor(value);
  const frac = value - whole;
  let best = FRACTIONS[0][0];
  for (const [f] of FRACTIONS) {
    if (Math.abs(frac - f) < Math.abs(frac - best)) best = f;
  }
  return whole + best;
}

/** Formats a quantity as a mixed number: 1.5 -> "1 1/2", 0.333 -> "1/3". */
export function formatNumber(value: number): string {
  const rounded = roundFriendly(value);
  const whole = Math.floor(rounded + 1e-9);
  const frac = rounded - whole;
  const label = FRACTIONS.find(([f]) => Math.abs(f - frac) < 1e-6)?.[1] ?? "";
  if (whole === 0) return label || "0";
  return label ? `${whole} ${label}` : `${whole}`;
}

export const VOLUME_IN_TSP: Partial<Record<Unit, number>> = { tsp: 1, tbsp: 3, cup: 48 };
export const WEIGHT_IN_OZ: Partial<Record<Unit, number>> = { oz: 1, lb: 16 };

/** Units whose items are counted, so they round to whole numbers. */
const WHOLE_UNITS: ReadonlySet<Unit> = new Set([
  "slice",
  "clove",
  "link",
  "packet",
  "pinch",
  "dash",
  "splash",
  "handful",
  "leaf",
]);

/**
 * Picks the largest unit in the family that expresses `base` cleanly
 * (within 10% after rounding to a friendly fraction), e.g. 6 tsp -> 2 tbsp.
 */
export function bestUnit(
  base: number,
  table: Partial<Record<Unit, number>>,
  minimums: Partial<Record<Unit, number>>,
): { qty: number; unit: Unit } {
  const units = (Object.entries(table) as [Unit, number][]).sort((a, b) => b[1] - a[1]);
  for (const [unit, size] of units) {
    const qty = base / size;
    if (qty < (minimums[unit] ?? 0)) continue;
    const rounded = roundFriendly(qty);
    if (rounded > 0 && Math.abs(rounded - qty) / qty <= 0.1) return { qty: rounded, unit };
  }
  const [smallest, size] = units[units.length - 1];
  return { qty: Math.max(roundFriendly(base / size), 1 / 8), unit: smallest };
}

/** Expresses a teaspoon total in the cleanest of tsp, tbsp, or cup. */
export const bestVolume = (tsp: number) => bestUnit(tsp, VOLUME_IN_TSP, { cup: 1 / 4, tbsp: 1 });
/** Expresses an ounce total in oz or lb. */
export const bestWeight = (oz: number) => bestUnit(oz, WEIGHT_IN_OZ, { lb: 1 });

export interface ScaledAmount {
  qty?: number;
  unit?: Unit;
}

/**
 * Scales an ingredient amount by `factor` (target servings / base servings)
 * and normalizes it into something measurable.
 */
export function scaleAmount(
  ing: Pick<RecipeIngredient, "id" | "qty" | "unit" | "fixed" | "frying">,
  factor: number,
): ScaledAmount {
  if (ing.qty === undefined) return { unit: ing.unit };
  if (ing.fixed || ing.frying || factor === 1) return { qty: ing.qty, unit: ing.unit };

  const raw = ing.qty * factor;
  const unit = ing.unit;

  if (unit && unit in VOLUME_IN_TSP) {
    return bestVolume(raw * VOLUME_IN_TSP[unit]!);
  }
  if (unit && unit in WEIGHT_IN_OZ) {
    return bestWeight(raw * WEIGHT_IN_OZ[unit]!);
  }
  if (unit === "can" || unit === "stick") {
    return { qty: Math.max(Math.round(raw * 2) / 2, 1 / 2), unit };
  }
  if ((unit && WHOLE_UNITS.has(unit)) || (!unit && getIngredient(ing.id).wholeOnly)) {
    return { qty: Math.max(Math.round(raw), 1), unit };
  }
  // Counted produce such as onions or bananas can be halved.
  return { qty: Math.max(Math.round(raw * 2) / 2, 1 / 2), unit };
}

/**
 * Renders a full ingredient line: "1 1/2 cups milk", "2 eggs", "salt, to taste",
 * or in Spanish "1 1/2 tazas de leche", "2 huevos", "sal, al gusto".
 */
export function formatIngredientLine(id: string, amount: ScaledAmount, lang: Lang = "en"): string {
  if (amount.qty === undefined) return toTaste(ingredientName(id, lang), lang);
  const n = formatNumber(amount.qty);
  if (amount.unit) {
    const name = amount.unit === "can" ? ingredientCanName(id, lang) : ingredientName(id, lang);
    return joinAmount(`${n} ${unitName(amount.unit, amount.qty, lang)}`, name, lang);
  }
  return `${n} ${amount.qty > 1 ? ingredientPlural(id, lang) : ingredientName(id, lang)}`;
}
