import { FACTS } from "@/data/facts";
import { ASSUMED_ON_HAND, getIngredient, INGREDIENTS, pluralName, type IngredientGroup } from "@/data/pantry";
import type { RecipeIngredient, Unit } from "@/data/schema";
import { related } from "./match";
import { gramsOf } from "./nutrition";
import { bestVolume, bestWeight, formatNumber, formatUnit, VOLUME_IN_TSP, WEIGHT_IN_OZ, type ScaledAmount } from "./scale";

export interface PlannedRecipe {
  slug: string;
  title: string;
  serves: number;
  ingredients: readonly RecipeIngredient[];
}

export interface PlannedMeal {
  slug: string;
  servings: number;
}

/** "buy": not in the pantry. "low": in the pantry but running low, so buy it. "have": skip it. */
export type ItemStatus = "buy" | "low" | "have";

export interface ShoppingItem {
  id: string;
  group: IngredientGroup;
  /** Total needed, such as "1 1/2 cups + 1 can corn". */
  line: string;
  /** Packages to buy, rounded up. Zero for items the cook has. */
  packages: number;
  packLabel?: string;
  /** Estimated cost of the packages. */
  cost: number;
  /** Titles of the planned recipes that use this item. */
  recipes: string[];
  status: ItemStatus;
}

export interface ShoppingList {
  items: ShoppingItem[];
  /** Estimated cost of everything with status "buy" or "low". */
  total: number;
}

/** Amounts of one ingredient summed by unit family. */
interface Tally {
  tsp: number;
  oz: number;
  /** Other units keyed by unit name, or "each" for counted items. */
  other: Map<Unit | "each", number>;
  grams: number;
  recipes: Set<string>;
}

const GROUP_ORDER: IngredientGroup[] = ["produce", "dairy-eggs", "protein", "grains", "canned", "baking", "condiments", "extras"];
const NAME_ORDER = new Map(INGREDIENTS.map((ing, i) => [ing.id, i]));

/** Shopping amounts round up: nobody buys a third of an onion. */
function roundUp(qty: number, unit: Unit | "each"): number {
  if (unit === "can" || unit === "stick") return Math.ceil(qty * 2 - 1e-9) / 2;
  return Math.max(1, Math.ceil(qty - 1e-9));
}

function amountsOf(t: Tally): ScaledAmount[] {
  const out: ScaledAmount[] = [];
  if (t.tsp > 0) out.push(bestVolume(t.tsp));
  if (t.oz > 0) out.push(bestWeight(t.oz));
  for (const [unit, qty] of t.other) out.push({ qty: roundUp(qty, unit), unit: unit === "each" ? undefined : unit });
  return out;
}

/** "2 cans + 1 cup corn", "3 onions", "garlic-ginger paste". */
export function formatShoppingLine(id: string, amounts: readonly ScaledAmount[]): string {
  const ing = getIngredient(id);
  if (amounts.length === 0) return ing.name;
  const counted = amounts.length === 1 && !amounts[0].unit;
  if (counted) {
    const qty = amounts[0].qty!;
    return `${formatNumber(qty)} ${qty > 1 ? pluralName(ing) : ing.name}`;
  }
  const parts = amounts.map((a) => (a.unit ? `${formatNumber(a.qty!)} ${formatUnit(a.unit, a.qty!)}` : formatNumber(a.qty!)));
  const name = amounts.every((a) => a.unit === "can") ? ing.name.replace(/^canned /, "") : ing.name;
  return `${parts.join(" + ")} ${name}`;
}

function addLine(t: Tally, ing: RecipeIngredient, factor: number) {
  const scaled = ing.fixed || ing.frying ? 1 : factor;
  t.grams += gramsOf(ing) * scaled;
  if (ing.qty === undefined) return;
  const qty = ing.qty * scaled;
  const facts = FACTS[ing.id];

  if (ing.cooked && facts.cooked && facts.grams.cup) {
    // Buy dry rice: convert cooked cups to dry cups.
    t.tsp += ((qty * facts.cooked.cupGrams) / facts.cooked.yield / facts.grams.cup) * 48;
  } else if (ing.unit && ing.unit in VOLUME_IN_TSP) {
    t.tsp += qty * VOLUME_IN_TSP[ing.unit]!;
  } else if (ing.unit && ing.unit in WEIGHT_IN_OZ) {
    t.oz += qty * WEIGHT_IN_OZ[ing.unit]!;
  } else {
    const key = ing.unit ?? "each";
    t.other.set(key, (t.other.get(key) ?? 0) + qty);
  }
}

/**
 * Combines every planned meal into one list. Amounts scale to each meal's
 * servings and add up per ingredient. Optional ingredients and water are left
 * out. Items in the pantry are marked "have" unless they are running low; salt,
 * pepper, and oil are assumed on hand. Pantry items marked low are always
 * included so they get restocked.
 */
export function buildShoppingList(
  meals: readonly PlannedMeal[],
  recipes: ReadonlyMap<string, PlannedRecipe>,
  pantry: { have: readonly string[]; low: readonly string[] },
): ShoppingList {
  const tallies = new Map<string, Tally>();

  for (const meal of meals) {
    const recipe = recipes.get(meal.slug);
    if (!recipe) continue;
    const factor = meal.servings / recipe.serves;
    for (const ing of recipe.ingredients) {
      if (ing.optional || getIngredient(ing.id).tier === "free") continue;
      let t = tallies.get(ing.id);
      if (!t) {
        t = { tsp: 0, oz: 0, other: new Map(), grams: 0, recipes: new Set() };
        tallies.set(ing.id, t);
      }
      addLine(t, ing, factor);
      t.recipes.add(recipe.title);
    }
  }

  const items: ShoppingItem[] = [];
  for (const [id, t] of tallies) {
    const isLow = pantry.low.some((h) => related(id, h));
    const has = ASSUMED_ON_HAND.has(id) || pantry.have.some((h) => related(id, h));
    const status: ItemStatus = isLow ? "low" : has ? "have" : "buy";
    const pack = FACTS[id].pack;
    // A small tolerance keeps 1.02 packages from rounding up to 2.
    const packages = status === "have" || !pack ? 0 : Math.max(1, Math.ceil(t.grams / pack.grams - 0.05));
    items.push({
      id,
      group: getIngredient(id).group,
      line: formatShoppingLine(id, amountsOf(t)),
      packages,
      packLabel: pack?.label,
      cost: pack ? Math.round(packages * pack.usd * 100) / 100 : 0,
      recipes: [...t.recipes],
      status,
    });
  }

  // Restock anything marked low, even if no planned meal uses it.
  for (const id of pantry.low) {
    if (tallies.has(id)) continue;
    const pack = FACTS[id]?.pack;
    items.push({
      id,
      group: getIngredient(id).group,
      line: getIngredient(id).name,
      packages: pack ? 1 : 0,
      packLabel: pack?.label,
      cost: pack?.usd ?? 0,
      recipes: [],
      status: "low",
    });
  }

  items.sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || NAME_ORDER.get(a.id)! - NAME_ORDER.get(b.id)!);
  const total = Math.round(items.reduce((sum, i) => sum + (i.status === "have" ? 0 : i.cost), 0) * 100) / 100;
  return { items, total };
}

/** Plain-text version for copying into a notes app or a text message. */
export function shoppingListText(list: ShoppingList, checked: readonly string[] = []): string {
  return list.items
    .filter((i) => i.status !== "have" && !checked.includes(i.id))
    .map((i) => `- ${i.line}${i.packages > 0 && i.packLabel ? ` (${i.packages} × ${i.packLabel})` : ""}`)
    .join("\n");
}
