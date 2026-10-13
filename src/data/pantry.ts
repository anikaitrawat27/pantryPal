/**
 * The canonical pantry. Every recipe ingredient must reference an id defined here.
 *
 * Tiers:
 * - "pantry": items commonly handed out by food pantries.
 * - "free":   water and ice, assumed to always be on hand.
 * - "extra":  a short list of basic seasonings that pantries do not always stock.
 *             Recipes using these can be hidden with the "no extras" filter.
 *
 * `parent` groups specific items under a generic one ("black beans" under
 * "canned beans"), so searching for the generic item also finds the specific ones.
 */

export type IngredientGroup =
  | "produce"
  | "dairy-eggs"
  | "protein"
  | "grains"
  | "canned"
  | "baking"
  | "condiments"
  | "extras"
  | "free";

export type IngredientTier = "pantry" | "free" | "extra";

/** Animal products an ingredient contains; drives the derived diet labels. */
export type Contains = "meat" | "fish" | "dairy" | "egg" | "honey";

export interface Ingredient {
  id: string;
  name: string;
  /** Plural display name, when it is not `name + "s"`. */
  plural?: string;
  aliases: readonly string[];
  group: IngredientGroup;
  tier: IngredientTier;
  parent?: string;
  contains?: readonly Contains[];
  /** "maybe" means some brands contain gluten, so recipes using it are never labeled gluten-free. */
  gluten?: "yes" | "maybe";
  /** Counted items that cannot sensibly be halved (eggs, tortillas). */
  wholeOnly?: boolean;
}

type Def = Omit<Ingredient, "aliases" | "tier"> & {
  aliases?: readonly string[];
  tier?: IngredientTier;
};

const DEFS: readonly Def[] = [
  // Produce
  { id: "apple", name: "apple", group: "produce" },
  { id: "pear", name: "pear", group: "produce" },
  { id: "orange", name: "orange", group: "produce", aliases: ["mandarin", "clementine"] },
  { id: "banana", name: "banana", group: "produce" },
  { id: "berries", name: "berries", plural: "berries", group: "produce", aliases: ["mixed berries"] },
  { id: "strawberries", name: "strawberries", plural: "strawberries", group: "produce", parent: "berries", aliases: ["strawberry"] },
  { id: "blueberries", name: "blueberries", plural: "blueberries", group: "produce", parent: "berries", aliases: ["blueberry"] },
  { id: "raspberries", name: "raspberries", plural: "raspberries", group: "produce", parent: "berries", aliases: ["raspberry"] },
  { id: "frozen-fruit", name: "frozen fruit", plural: "frozen fruit", group: "produce", aliases: ["frozen berries", "frozen mango", "frozen peaches"] },
  { id: "carrot", name: "carrot", group: "produce", aliases: ["carrots"] },
  { id: "onion", name: "onion", group: "produce", aliases: ["onions", "green onion", "scallion"] },
  { id: "lettuce", name: "lettuce", plural: "lettuce", group: "produce", aliases: ["romaine", "iceberg"] },
  { id: "tomato", name: "tomato", plural: "tomatoes", group: "produce", aliases: ["tomatoes", "fresh tomato"] },
  { id: "potato", name: "potato", plural: "potatoes", group: "produce", aliases: ["potatoes", "russet"] },
  { id: "bell-pepper", name: "bell pepper", group: "produce", aliases: ["peppers", "green pepper", "red pepper"] },
  { id: "garlic", name: "garlic", plural: "garlic", group: "produce", aliases: ["garlic clove"] },
  { id: "cabbage", name: "cabbage", plural: "cabbage", group: "produce" },
  { id: "greens", name: "leafy greens", plural: "leafy greens", group: "produce", aliases: ["greens", "spinach", "kale", "collards", "collard greens"] },

  // Dairy and eggs
  { id: "milk", name: "milk", plural: "milk", group: "dairy-eggs", contains: ["dairy"] },
  { id: "eggs", name: "egg", group: "dairy-eggs", aliases: ["eggs"], contains: ["egg"], wholeOnly: true },
  { id: "butter", name: "butter", plural: "butter", group: "dairy-eggs", contains: ["dairy"] },
  { id: "cheese", name: "cheese", plural: "cheese", group: "dairy-eggs", aliases: ["shredded cheese"], contains: ["dairy"] },
  { id: "cheddar", name: "cheddar cheese", plural: "cheddar cheese", group: "dairy-eggs", parent: "cheese", aliases: ["cheddar"], contains: ["dairy"] },
  { id: "parmesan", name: "parmesan cheese", plural: "parmesan cheese", group: "dairy-eggs", parent: "cheese", aliases: ["parmesan", "parm"], contains: ["dairy"] },
  { id: "mozzarella", name: "mozzarella cheese", plural: "mozzarella cheese", group: "dairy-eggs", parent: "cheese", aliases: ["mozzarella"], contains: ["dairy"] },
  { id: "cream-cheese", name: "cream cheese", plural: "cream cheese", group: "dairy-eggs", contains: ["dairy"] },
  { id: "yogurt", name: "yogurt", plural: "yogurt", group: "dairy-eggs", aliases: ["yoghurt", "plain yogurt"], contains: ["dairy"] },

  // Protein
  { id: "chicken", name: "chicken breast", group: "protein", aliases: ["chicken", "frozen chicken", "chicken thigh"], contains: ["meat"] },
  { id: "ground-beef", name: "ground beef", plural: "ground beef", group: "protein", aliases: ["beef", "hamburger"], contains: ["meat"] },
  { id: "ground-turkey", name: "ground turkey", plural: "ground turkey", group: "protein", aliases: ["turkey"], contains: ["meat"] },
  { id: "sausage", name: "sausage", group: "protein", aliases: ["sausage links", "breakfast sausage"], contains: ["meat"], gluten: "maybe", wholeOnly: true },
  { id: "hot-dogs", name: "hot dog", group: "protein", aliases: ["hot dogs", "franks", "wieners"], contains: ["meat"], gluten: "maybe", wholeOnly: true },
  { id: "canned-meat", name: "canned meat", plural: "canned meat", group: "protein", aliases: ["canned protein"], contains: ["meat"] },
  { id: "canned-chicken", name: "canned chicken", plural: "canned chicken", group: "protein", parent: "canned-meat", contains: ["meat"] },
  { id: "canned-tuna", name: "canned tuna", plural: "canned tuna", group: "protein", parent: "canned-meat", aliases: ["tuna"], contains: ["fish"] },
  { id: "canned-turkey", name: "canned turkey", plural: "canned turkey", group: "protein", parent: "canned-meat", contains: ["meat"] },
  { id: "lentils", name: "lentils", plural: "lentils", group: "protein", aliases: ["lentil", "dried lentils"] },
  { id: "canned-beans", name: "canned beans", plural: "canned beans", group: "protein", aliases: ["beans"] },
  { id: "black-beans", name: "black beans", plural: "black beans", group: "protein", parent: "canned-beans" },
  { id: "kidney-beans", name: "kidney beans", plural: "kidney beans", group: "protein", parent: "canned-beans", aliases: ["red beans"] },
  { id: "pinto-beans", name: "pinto beans", plural: "pinto beans", group: "protein", parent: "canned-beans", aliases: ["refried beans"] },
  { id: "chickpeas", name: "chickpeas", plural: "chickpeas", group: "protein", parent: "canned-beans", aliases: ["garbanzo beans", "garbanzo"] },
  { id: "peanut-butter", name: "peanut butter", plural: "peanut butter", group: "protein", aliases: ["pb", "nut butter"] },

  // Grains and bread
  { id: "pasta", name: "dry pasta", plural: "dry pasta", group: "grains", aliases: ["pasta", "spaghetti", "macaroni", "penne", "elbow"], gluten: "yes" },
  { id: "noodles", name: "noodles", plural: "noodles", group: "grains", aliases: ["ramen", "egg noodles", "instant noodles"], gluten: "yes" },
  { id: "rice", name: "rice", plural: "rice", group: "grains", aliases: ["white rice", "brown rice"] },
  { id: "oats", name: "oatmeal", plural: "oatmeal", group: "grains", aliases: ["oats", "rolled oats", "quick oats"], gluten: "maybe" },
  { id: "cereal", name: "breakfast cereal", plural: "breakfast cereal", group: "grains", aliases: ["cereal", "corn flakes", "o's"], gluten: "maybe" },
  { id: "tortillas", name: "tortilla", group: "grains", aliases: ["tortillas", "flour tortilla", "wrap"], gluten: "yes", wholeOnly: true },
  { id: "bread", name: "bread", plural: "bread", group: "grains", aliases: ["toast", "sandwich bread", "rolls", "buns"], gluten: "yes" },
  { id: "biscuit-dough", name: "biscuit dough", plural: "biscuit dough", group: "grains", aliases: ["crescent roll dough", "crescent rolls", "biscuits", "canned biscuits"], gluten: "yes", contains: ["dairy"] },
  { id: "chips", name: "chips", plural: "chips", group: "grains", aliases: ["tortilla chips", "potato chips"] },

  // Canned
  { id: "canned-vegetables", name: "canned vegetables", plural: "canned vegetables", group: "canned", aliases: ["canned veggies"] },
  { id: "canned-corn", name: "canned corn", plural: "canned corn", group: "canned", parent: "canned-vegetables", aliases: ["corn"] },
  { id: "canned-peas", name: "canned peas", plural: "canned peas", group: "canned", parent: "canned-vegetables", aliases: ["peas"] },
  { id: "canned-green-beans", name: "canned green beans", plural: "canned green beans", group: "canned", parent: "canned-vegetables", aliases: ["green beans"] },
  { id: "canned-carrots", name: "canned carrots", plural: "canned carrots", group: "canned", parent: "canned-vegetables" },
  { id: "canned-mixed-veg", name: "canned mixed vegetables", plural: "canned mixed vegetables", group: "canned", parent: "canned-vegetables", aliases: ["mixed vegetables", "mixed veggies"] },
  { id: "canned-spinach", name: "canned spinach", plural: "canned spinach", group: "canned", parent: "canned-vegetables" },
  { id: "diced-tomatoes", name: "canned diced tomatoes", plural: "canned diced tomatoes", group: "canned", parent: "canned-vegetables", aliases: ["diced tomatoes", "canned tomatoes", "crushed tomatoes"] },
  { id: "tomato-puree", name: "tomato puree", plural: "tomato puree", group: "canned", parent: "canned-vegetables", aliases: ["tomato sauce", "tomato paste"] },
  { id: "pasta-sauce", name: "pasta sauce", plural: "pasta sauce", group: "canned", aliases: ["marinara", "spaghetti sauce"] },
  { id: "soup", name: "canned cream soup", plural: "canned cream soup", group: "canned", aliases: ["condensed soup"], gluten: "maybe" },
  { id: "cream-of-mushroom", name: "cream of mushroom soup", plural: "cream of mushroom soup", group: "canned", parent: "soup", contains: ["dairy"], gluten: "maybe" },
  { id: "cream-of-chicken", name: "cream of chicken soup", plural: "cream of chicken soup", group: "canned", parent: "soup", contains: ["dairy", "meat"], gluten: "maybe" },
  { id: "chicken-broth", name: "chicken broth", plural: "chicken broth", group: "canned", aliases: ["broth", "stock", "chicken stock"], contains: ["meat"], gluten: "maybe" },

  // Baking
  { id: "flour", name: "flour", plural: "flour", group: "baking", aliases: ["all-purpose flour", "ap flour"], gluten: "yes" },
  { id: "sugar", name: "sugar", plural: "sugar", group: "baking", aliases: ["white sugar"] },
  { id: "baking-powder", name: "baking powder", plural: "baking powder", group: "baking" },
  { id: "baking-soda", name: "baking soda", plural: "baking soda", group: "baking" },

  // Condiments and staples
  { id: "jelly", name: "jelly", plural: "jelly", group: "condiments", aliases: ["jam", "preserves"] },
  { id: "mayo", name: "mayonnaise", plural: "mayonnaise", group: "condiments", aliases: ["mayo"], contains: ["egg"] },
  { id: "honey", name: "honey", plural: "honey", group: "condiments", contains: ["honey"] },
  { id: "oil", name: "oil", plural: "oil", group: "condiments", aliases: ["vegetable oil", "cooking oil", "olive oil"] },
  { id: "salt", name: "salt", plural: "salt", group: "condiments" },
  { id: "pepper", name: "black pepper", plural: "black pepper", group: "condiments", aliases: ["pepper"] },
  { id: "garlic-ginger-paste", name: "garlic-ginger paste", plural: "garlic-ginger paste", group: "condiments", aliases: ["ginger", "garlic paste", "ginger paste"] },

  // Extras: basic seasonings not every pantry stocks
  { id: "cinnamon", name: "cinnamon", plural: "cinnamon", group: "extras", tier: "extra" },
  { id: "chili-powder", name: "chili powder", plural: "chili powder", group: "extras", tier: "extra", aliases: ["cayenne", "chili flakes"] },
  { id: "cumin", name: "cumin", plural: "cumin", group: "extras", tier: "extra" },
  { id: "paprika", name: "paprika", plural: "paprika", group: "extras", tier: "extra" },
  { id: "italian-seasoning", name: "Italian seasoning", plural: "Italian seasoning", group: "extras", tier: "extra", aliases: ["oregano", "dried herbs", "basil"] },
  { id: "soy-sauce", name: "soy sauce", plural: "soy sauce", group: "extras", tier: "extra", gluten: "yes" },
  { id: "vinegar", name: "vinegar", plural: "vinegar", group: "extras", tier: "extra" },
  { id: "lemon-juice", name: "lemon juice", plural: "lemon juice", group: "extras", tier: "extra", aliases: ["lemon", "lime juice", "lime"] },
  { id: "hot-sauce", name: "hot sauce", plural: "hot sauce", group: "extras", tier: "extra", aliases: ["chili sauce", "sriracha"] },
  { id: "vanilla", name: "vanilla extract", plural: "vanilla extract", group: "extras", tier: "extra", aliases: ["vanilla"] },

  // Free
  { id: "water", name: "water", plural: "water", group: "free", tier: "free" },
  { id: "ice", name: "ice", plural: "ice", group: "free", tier: "free" },
];

export const INGREDIENTS: readonly Ingredient[] = DEFS.map((d) => ({
  ...d,
  aliases: d.aliases ?? [],
  tier: d.tier ?? "pantry",
}));

export const INGREDIENTS_BY_ID: ReadonlyMap<string, Ingredient> = new Map(
  INGREDIENTS.map((i) => [i.id, i]),
);

/** Items every kitchen is assumed to have when matching "what can I make". */
export const ASSUMED_ON_HAND: ReadonlySet<string> = new Set([
  "water",
  "ice",
  "salt",
  "pepper",
  "oil",
]);

export const GROUP_LABELS: Record<IngredientGroup, string> = {
  produce: "Fruits and vegetables",
  "dairy-eggs": "Dairy and eggs",
  protein: "Proteins and beans",
  grains: "Grains, bread, and pasta",
  canned: "Canned goods",
  baking: "Baking",
  condiments: "Condiments and staples",
  extras: "Extras (basic seasonings)",
  free: "Always on hand",
};

export function getIngredient(id: string): Ingredient {
  const ing = INGREDIENTS_BY_ID.get(id);
  if (!ing) throw new Error(`Unknown ingredient id: ${id}`);
  return ing;
}

/** The ingredient's id followed by each ancestor id, nearest first. */
export function lineage(id: string): string[] {
  const out: string[] = [];
  let cur: string | undefined = id;
  while (cur) {
    out.push(cur);
    cur = INGREDIENTS_BY_ID.get(cur)?.parent;
  }
  return out;
}

export function pluralName(ing: Ingredient): string {
  return ing.plural ?? `${ing.name}s`;
}
