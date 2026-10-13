import { RAW_RECIPES } from "@/data/recipes";
import { getIngredient } from "@/data/pantry";
import { recipeSchema, type Recipe, type RecipeIngredient } from "@/data/schema";
import { dietsFor, type Diet } from "./diet";

/** The fields browse, search, and cards need. Excludes steps and tips to keep client bundles small. */
export interface RecipeSummary {
  slug: string;
  title: string;
  blurb: string;
  course: Recipe["course"];
  meal: Recipe["meal"];
  cuisine: Recipe["cuisine"];
  equipment: Recipe["equipment"];
  difficulty: Recipe["difficulty"];
  serves: number;
  totalMin: number;
  diets: Diet[];
  /** True when a required ingredient is from the "extra" tier. */
  usesExtras: boolean;
  ingredients: RecipeIngredient[];
}

export type CatalogRecipe = Recipe & Omit<RecipeSummary, keyof Recipe>;

function enrich(recipe: Recipe): CatalogRecipe {
  return {
    ...recipe,
    totalMin: recipe.prep + recipe.cook,
    diets: dietsFor(recipe.ingredients),
    usesExtras: recipe.ingredients.some((i) => !i.optional && getIngredient(i.id).tier === "extra"),
  };
}

function parse(raw: unknown, index: number): Recipe {
  const result = recipeSchema.safeParse(raw);
  if (!result.success) {
    const slug = (raw as { slug?: string })?.slug ?? `#${index}`;
    throw new Error(`Invalid recipe ${slug}: ${result.error.message}`);
  }
  return result.data;
}

export const RECIPES: readonly CatalogRecipe[] = RAW_RECIPES.map((r, i) => enrich(parse(r, i)));

const BY_SLUG = new Map(RECIPES.map((r) => [r.slug, r]));

export function getRecipe(slug: string): CatalogRecipe | undefined {
  return BY_SLUG.get(slug);
}

export function toSummary(r: CatalogRecipe): RecipeSummary {
  return {
    slug: r.slug,
    title: r.title,
    blurb: r.blurb,
    course: r.course,
    meal: r.meal,
    cuisine: r.cuisine,
    equipment: r.equipment,
    difficulty: r.difficulty,
    serves: r.serves,
    totalMin: r.totalMin,
    diets: r.diets,
    usesExtras: r.usesExtras,
    ingredients: r.ingredients,
  };
}
