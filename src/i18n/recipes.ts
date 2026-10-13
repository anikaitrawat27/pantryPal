import type { Recipe } from "@/data/schema";
import type { Lang } from "./config";
import { RECIPES_ES } from "./es/recipes";

export interface LocalizedText {
  title: string;
  blurb: string;
  steps: string[];
  tips?: string[];
  /** Ingredient notes keyed by ingredient id. */
  notes: Record<string, string>;
}

/**
 * The recipe's words in the given language. Falls back to English for any
 * recipe that has not been translated, so a missing translation never breaks a page.
 */
export function localizeRecipe(r: Recipe, lang: Lang): LocalizedText {
  const englishNotes = Object.fromEntries(r.ingredients.filter((i) => i.note).map((i) => [i.id, i.note!]));
  const es = lang === "es" ? RECIPES_ES[r.slug] : undefined;
  if (!es) return { title: r.title, blurb: r.blurb, steps: r.steps, tips: r.tips, notes: englishNotes };
  return { title: es.title, blurb: es.blurb, steps: es.steps, tips: es.tips, notes: { ...englishNotes, ...es.notes } };
}
