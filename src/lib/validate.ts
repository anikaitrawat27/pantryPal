import { INGREDIENTS_BY_ID } from "@/data/pantry";
import type { Course, Equipment, Recipe, Substitution } from "@/data/schema";

/** Number of recipes per course the finished catalog must contain (250 total). */
export const COURSE_TARGETS: Record<Course, number> = {
  breakfast: 35,
  main: 75,
  soup: 20,
  salad: 15,
  appetizer: 30,
  side: 15,
  drink: 25,
  dessert: 35,
};

const BANNED = /\b(oven|bake[ds]?|baking (sheet|tray|dish|pan)|broil\w*|preheat\w*)\b/i;
const HARD_CODED_AMOUNT =
  /\b\d+(\s*\/\s*\d+)?\s*(cups?|tbsp|tablespoons?|tsp|teaspoons?|oz|ounces?|lbs?|pounds?|cans?)\b/i;

/** Words in steps that imply a tool. A recipe that mentions one must list the tool. */
const TOOL_HINTS: [Equipment, RegExp][] = [
  ["microwave", /\bmicrowav/i],
  ["stovetop", /\b(skillet|pan|pot|saucepan|stovetop|stove|boil\w*|simmer\w*|saut[eé]\w*|fry|fries|fried|frying|griddle|wok)\b/i],
  ["blender", /\bblend(er)?\b/i],
  ["toaster", /\btoaster\b/i],
  ["air-fryer", /\bair[- ]fry/i],
];

function checkSubs(where: string, subs: readonly Substitution[], originalId: string, errors: string[]) {
  for (const s of subs) {
    if (!INGREDIENTS_BY_ID.has(s.id)) errors.push(`${where}: substitution target "${s.id}" is not in the pantry`);
    if (s.id === originalId) errors.push(`${where}: substitutes "${s.id}" for itself`);
    if (s.unit && !s.from) errors.push(`${where}: substitution to "${s.id}" changes unit without "from"`);
  }
}

export function validateSubstitutionMap(map: Readonly<Record<string, readonly Substitution[]>>): string[] {
  const errors: string[] = [];
  for (const [id, subs] of Object.entries(map)) {
    if (!INGREDIENTS_BY_ID.has(id)) errors.push(`substitutions: unknown ingredient "${id}"`);
    checkSubs(`substitutions.${id}`, subs, id, errors);
  }
  return errors;
}

function validateRecipe(r: Recipe): string[] {
  const errors: string[] = [];
  const at = (msg: string) => errors.push(`${r.slug}: ${msg}`);

  const seen = new Set<string>();
  for (const ing of r.ingredients) {
    if (!INGREDIENTS_BY_ID.has(ing.id)) at(`unknown ingredient "${ing.id}"`);
    if (seen.has(ing.id)) at(`ingredient "${ing.id}" is listed twice`);
    seen.add(ing.id);
    if (ing.subs) checkSubs(`${r.slug}.${ing.id}`, ing.subs, ing.id, errors);
  }

  const text = [r.title, r.blurb, ...r.steps, ...(r.tips ?? [])];
  for (const t of text) {
    const banned = t.match(BANNED);
    if (banned) at(`mentions "${banned[0]}", but recipes cannot use an oven`);
  }
  for (const step of r.steps) {
    const amount = step.match(HARD_CODED_AMOUNT);
    if (amount) at(`step has hard-coded amount "${amount[0]}", which would not scale`);
  }

  const steps = r.steps.join(" ");
  if (r.equipment.includes("no-cook") && r.equipment.length > 1) at(`"no-cook" cannot be combined with other equipment`);
  for (const [tool, hint] of TOOL_HINTS) {
    const mentioned = hint.test(steps);
    if (mentioned && !r.equipment.includes(tool)) at(`steps mention ${tool} but equipment does not list it`);
    if (!mentioned && r.equipment.includes(tool)) at(`equipment lists ${tool} but no step uses it`);
  }
  return errors;
}

export interface ValidateOptions {
  /** Require the per-course and total counts. Off while the catalog is still being written. */
  requireCounts: boolean;
}

export function validateRecipes(recipes: readonly Recipe[], opts: ValidateOptions): string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();
  const titles = new Set<string>();
  for (const r of recipes) {
    if (slugs.has(r.slug)) errors.push(`${r.slug}: duplicate slug`);
    const title = r.title.toLowerCase();
    if (titles.has(title)) errors.push(`${r.slug}: duplicate title "${r.title}"`);
    slugs.add(r.slug);
    titles.add(title);
    errors.push(...validateRecipe(r));
  }

  if (opts.requireCounts) {
    const total = Object.values(COURSE_TARGETS).reduce((a, b) => a + b, 0);
    if (recipes.length !== total) errors.push(`catalog has ${recipes.length} recipes; expected ${total}`);
    for (const [course, target] of Object.entries(COURSE_TARGETS)) {
      const n = recipes.filter((r) => r.course === course).length;
      if (n !== target) errors.push(`course "${course}" has ${n} recipes; expected ${target}`);
    }
  }
  return errors;
}
