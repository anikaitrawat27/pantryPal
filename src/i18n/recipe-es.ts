/** Spanish text for one recipe. Amounts, ingredients, and tools come from the English recipe. */
export interface RecipeEs {
  title: string;
  blurb: string;
  /** Same count and order as the English steps. */
  steps: string[];
  /** Same count and order as the English tips, when there are any. */
  tips?: string[];
  /** Translated ingredient notes, keyed by ingredient id. Required for every ingredient that has a note. */
  notes?: Record<string, string>;
}

export function defineRecipesEs(map: Record<string, RecipeEs>): Record<string, RecipeEs> {
  return map;
}
