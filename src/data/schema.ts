import { z } from "zod";

export const COURSES = ["breakfast", "main", "soup", "salad", "appetizer", "side", "drink", "dessert"] as const;
export type Course = (typeof COURSES)[number];

export const MEALS = ["breakfast", "lunch", "dinner", "snack"] as const;
export type Meal = (typeof MEALS)[number];

export const CUISINES = [
  "american",
  "mexican",
  "italian",
  "chinese",
  "indian",
  "thai",
  "japanese",
  "korean",
  "mediterranean",
  "middle-eastern",
  "spanish",
  "caribbean",
  "french",
] as const;
export type Cuisine = (typeof CUISINES)[number];

/** Allowed equipment. There is deliberately no oven or broiler. */
export const EQUIPMENT = ["no-cook", "microwave", "stovetop", "blender", "toaster", "air-fryer"] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export const UNITS = [
  "tsp",
  "tbsp",
  "cup",
  "oz",
  "lb",
  "can",
  "slice",
  "clove",
  "link",
  "stick",
  "packet",
  "pinch",
  "dash",
  "splash",
  "handful",
  "leaf",
] as const;
export type Unit = (typeof UNITS)[number];

export const TO_TASTE = "to taste" as const;

const substitutionSchema = z.object({
  id: z.string(),
  /** Multiplier applied to the original quantity. Defaults to 1. */
  ratio: z.number().positive().optional(),
  /** Replacement unit, when it differs from the original. Requires `from`. */
  unit: z.enum(UNITS).optional(),
  /**
   * The substitution only applies when the original ingredient uses this unit
   * ("count" means no unit, as in "2 eggs"). Required whenever `unit` is set,
   * because a ratio that converts units is only valid from one specific unit.
   */
  from: z.union([z.enum(UNITS), z.literal("count")]).optional(),
  note: z.string().optional(),
});
export type Substitution = z.infer<typeof substitutionSchema>;

const ingredientOptsSchema = z
  .object({
    note: z.string().optional(),
    optional: z.boolean().optional(),
    /** Quantity stays the same at every serving size. */
    fixed: z.boolean().optional(),
    /** Oil for shallow frying. It does not scale with servings, and most of it stays in the pan. */
    frying: z.boolean().optional(),
    /** The amount is measured after cooking (cooked rice). Nutrition and shopping convert it to dry weight. */
    cooked: z.boolean().optional(),
    /** Replaces the global substitution list for this ingredient in this recipe. */
    subs: z.array(substitutionSchema).optional(),
    /** Disables substitutions where a swap would ruin the dish. */
    noSubs: z.boolean().optional(),
  })
  .strict();
export type IngredientOpts = z.infer<typeof ingredientOptsSchema>;

const amountSchema = z.union([z.number().positive(), z.literal(TO_TASTE)]);

/**
 * Authoring shorthand for a recipe ingredient:
 *   ["eggs", 2]
 *   ["milk", 0.5, "cup"]
 *   ["salt", "to taste"]
 *   ["cheese", 0.25, "cup", { optional: true }]
 *   ["onion", 1, { note: "diced" }]
 */
const ingredientTupleSchema = z.union([
  z.tuple([z.string(), amountSchema, z.enum(UNITS), ingredientOptsSchema]),
  z.tuple([z.string(), amountSchema, z.enum(UNITS)]),
  z.tuple([z.string(), amountSchema, ingredientOptsSchema]),
  z.tuple([z.string(), amountSchema]),
]);
export type IngredientInput = z.input<typeof ingredientTupleSchema>;

export interface RecipeIngredient extends IngredientOpts {
  id: string;
  /** Undefined when the amount is "to taste". */
  qty?: number;
  unit?: Unit;
}

const recipeIngredientSchema = ingredientTupleSchema.transform((t): RecipeIngredient => {
  const [id, amount, third, fourth] = t;
  const unit = typeof third === "string" ? third : undefined;
  const opts = typeof third === "object" ? third : fourth;
  return {
    id,
    ...(amount === TO_TASTE ? { fixed: true } : { qty: amount }),
    ...(unit ? { unit } : {}),
    ...opts,
  };
});

export const recipeSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be kebab-case"),
    title: z.string().min(2),
    blurb: z.string().min(10).max(220),
    course: z.enum(COURSES),
    meal: z.array(z.enum(MEALS)).min(1),
    cuisine: z.enum(CUISINES),
    equipment: z.array(z.enum(EQUIPMENT)).min(1),
    difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    prep: z.number().int().min(0).max(120),
    cook: z.number().int().min(0).max(240),
    serves: z.number().int().min(1).max(6),
    ingredients: z.array(recipeIngredientSchema).min(1),
    steps: z.array(z.string().min(3)).min(1),
    tips: z.array(z.string()).optional(),
  })
  .strict();

export type RecipeInput = z.input<typeof recipeSchema>;
export type Recipe = z.output<typeof recipeSchema>;

/** Identity helper that gives recipe files type checking and autocomplete. */
export function defineRecipes(recipes: RecipeInput[]): RecipeInput[] {
  return recipes;
}
