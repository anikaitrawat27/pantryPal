import type { Substitution } from "./schema";

/**
 * Default swaps offered for an ingredient in every recipe. A recipe can replace
 * the list for one ingredient (`subs`) or turn swaps off (`noSubs`).
 * Every target must be a pantry, free, or extra ingredient.
 */
const interchangeable = (ids: string[], note?: string): Record<string, Substitution[]> =>
  Object.fromEntries(ids.map((id) => [id, ids.filter((other) => other !== id).map((other) => ({ id: other, note }))]));

export const GLOBAL_SUBSTITUTIONS: Readonly<Record<string, readonly Substitution[]>> = {
  ...interchangeable(["canned-corn", "canned-peas", "canned-green-beans", "canned-carrots", "canned-mixed-veg"]),
  ...interchangeable(["black-beans", "kidney-beans", "pinto-beans", "chickpeas"]),
  ...interchangeable(["canned-chicken", "canned-turkey", "canned-tuna"]),
  ...interchangeable(["cheddar", "mozzarella", "cheese"]),
  ...interchangeable(["strawberries", "blueberries", "raspberries", "berries", "frozen-fruit"]),
  ...interchangeable(["apple", "pear"]),
  ...interchangeable(["lettuce", "greens", "cabbage"]),
  ...interchangeable(["cream-of-mushroom", "cream-of-chicken"]),
  ...interchangeable(["sausage", "hot-dogs"]),
  ...interchangeable(["cereal", "oats"]),

  "ground-beef": [{ id: "ground-turkey" }],
  "ground-turkey": [{ id: "ground-beef" }],
  parmesan: [{ id: "cheddar", note: "Finely shredded." }, { id: "cheese" }],
  butter: [{ id: "oil", ratio: 0.75, note: "Use a little less oil than butter." }],
  oil: [{ id: "butter" }],
  milk: [{ id: "yogurt", ratio: 0.5, note: "Whisk with an equal amount of water." }],
  yogurt: [{ id: "cream-cheese", ratio: 0.5, note: "Soften and thin with a splash of milk." }],
  "cream-cheese": [{ id: "yogurt", note: "The result is looser and tangier." }],
  mayo: [{ id: "yogurt", note: "Tangier and lighter." }],
  honey: [{ id: "sugar" }, { id: "jelly", note: "Adds fruit flavor." }],
  sugar: [{ id: "honey", ratio: 0.75 }],
  jelly: [{ id: "honey" }],
  pasta: [{ id: "noodles" }],
  noodles: [{ id: "pasta" }],
  "pasta-sauce": [{ id: "tomato-puree", note: "Add a pinch of salt and sugar." }],
  "tomato-puree": [{ id: "pasta-sauce" }, { id: "diced-tomatoes", note: "Mash or blend for a smoother sauce." }],
  "diced-tomatoes": [{ id: "tomato-puree" }],
  "chicken-broth": [{ id: "water", note: "Add an extra pinch of salt and a little garlic-ginger paste." }],
  garlic: [{ id: "garlic-ginger-paste", from: "clove", unit: "tsp", ratio: 0.5 }],
  "garlic-ginger-paste": [{ id: "garlic", from: "tsp", unit: "clove", ratio: 2 }],
  "lemon-juice": [{ id: "vinegar", note: "Sharper, so start with less." }],
  vinegar: [{ id: "lemon-juice" }],
};
