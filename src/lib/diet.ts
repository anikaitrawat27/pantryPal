import { getIngredient } from "@/data/pantry";
import type { RecipeIngredient } from "@/data/schema";

export const DIETS = ["vegan", "vegetarian", "dairy-free", "egg-free", "gluten-free"] as const;
export type Diet = (typeof DIETS)[number];

export const DIET_LABELS: Record<Diet, string> = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  "dairy-free": "Dairy-free",
  "egg-free": "Egg-free",
  "gluten-free": "Gluten-free",
};

/**
 * Derives diet labels from the required ingredients, so labels can never
 * contradict the ingredient list. Optional ingredients are ignored.
 */
export function dietsFor(ingredients: readonly Pick<RecipeIngredient, "id" | "optional">[]): Diet[] {
  const contains = new Set<string>();
  let gluten = false;
  for (const ri of ingredients) {
    if (ri.optional) continue;
    const ing = getIngredient(ri.id);
    ing.contains?.forEach((c) => contains.add(c));
    if (ing.gluten) gluten = true;
  }
  const meatless = !contains.has("meat") && !contains.has("fish");
  const out: Diet[] = [];
  if (meatless && !contains.has("dairy") && !contains.has("egg") && !contains.has("honey")) out.push("vegan");
  if (meatless) out.push("vegetarian");
  if (!contains.has("dairy")) out.push("dairy-free");
  if (!contains.has("egg")) out.push("egg-free");
  if (!gluten) out.push("gluten-free");
  return out;
}
