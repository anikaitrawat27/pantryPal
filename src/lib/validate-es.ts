import type { Recipe } from "@/data/schema";
import type { RecipeEs } from "@/i18n/recipe-es";

/**
 * Oven words by stem (horno, hornear, hornee, gratinar, precalentar). "Sin horno" (no oven),
 * "polvo para hornear" (baking powder), and "hornilla" (a stove burner) are allowed.
 */
const BANNED_ES = /(?<!\bsin |\bpolvo para )\b(horn(?!ill)\w*|gratin\w*|precal\w*)\b/i;
const HARD_CODED_AMOUNT_ES =
  /\b\d+(\s*\/\s*\d+)?\s*(tazas?|cucharadas?|cucharaditas?|cdas?|cditas?|onzas?|oz|libras?|lbs?|latas?)\b/i;

/**
 * Checks Spanish translations against the English recipes: every recipe is
 * translated, step and tip counts match, every ingredient note is translated,
 * and the Spanish keeps the no-oven and no-amounts-in-steps rules.
 */
export function validateTranslations(
  recipes: readonly Recipe[],
  es: Readonly<Record<string, RecipeEs>>,
  opts: { requireAll: boolean },
): string[] {
  const errors: string[] = [];
  const slugs = new Set(recipes.map((r) => r.slug));
  for (const slug of Object.keys(es)) if (!slugs.has(slug)) errors.push(`es.${slug}: no English recipe with this slug`);

  for (const r of recipes) {
    const t = es[r.slug];
    const at = (msg: string) => errors.push(`es.${r.slug}: ${msg}`);
    if (!t) {
      if (opts.requireAll) at("missing translation");
      continue;
    }
    if (!t.title.trim()) at("empty title");
    if (t.blurb.length < 10 || t.blurb.length > 240)
      at(`blurb is ${t.blurb.length} characters; keep it between 10 and 240`);
    if (t.steps.length !== r.steps.length) at(`has ${t.steps.length} steps; English has ${r.steps.length}`);
    if ((t.tips?.length ?? 0) !== (r.tips?.length ?? 0))
      at(`has ${t.tips?.length ?? 0} tips; English has ${r.tips?.length ?? 0}`);

    const ids = new Set(r.ingredients.map((i) => i.id));
    for (const ing of r.ingredients) if (ing.note && !t.notes?.[ing.id]?.trim()) at(`missing note for "${ing.id}"`);
    for (const id of Object.keys(t.notes ?? {})) {
      if (!ids.has(id)) at(`note for "${id}", which the recipe does not use`);
      else if (!r.ingredients.find((i) => i.id === id)?.note) at(`note for "${id}", which has no English note`);
    }

    for (const text of [t.title, t.blurb, ...t.steps, ...(t.tips ?? [])]) {
      const banned = text.match(BANNED_ES);
      if (banned) at(`mentions "${banned[0]}", but recipes cannot use an oven`);
    }
    for (const step of t.steps) {
      const amount = step.match(HARD_CODED_AMOUNT_ES);
      if (amount) at(`step has hard-coded amount "${amount[0]}", which would not scale`);
    }
  }
  return errors;
}
