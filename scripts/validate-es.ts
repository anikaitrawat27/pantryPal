/**
 * Validates Spanish recipe translations.
 *
 * Usage:
 *   tsx scripts/validate-es.ts                 every recipe must be translated
 *   tsx scripts/validate-es.ts --file <path>   check one translation file, e.g. src/i18n/es/recipes/drinks.ts,
 *                                              against every recipe in src/data/recipes/drinks.ts
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import { RECIPES_ES } from "@/i18n/es/recipes";
import type { RecipeEs } from "@/i18n/recipe-es";
import { recipeSchema, type Recipe, type RecipeInput } from "@/data/schema";
import { RECIPES } from "@/lib/catalog";
import { validateTranslations } from "@/lib/validate-es";

async function loadOnlyExport<T>(file: string, pick: (v: unknown) => boolean): Promise<T> {
  const mod = (await import(pathToFileURL(path.resolve(file)).href)) as Record<string, unknown>;
  const found = Object.values(mod).filter(pick);
  if (found.length !== 1) throw new Error(`${file} must export exactly one value of the expected kind`);
  return found[0] as T;
}

async function main() {
  const fileIdx = process.argv.indexOf("--file");
  const file = fileIdx >= 0 ? process.argv[fileIdx + 1] : undefined;
  let es: Readonly<Record<string, RecipeEs>> = RECIPES_ES;
  let recipes: readonly Recipe[] = RECIPES;
  if (file) {
    es = await loadOnlyExport<Record<string, RecipeEs>>(file, (v) => Boolean(v) && typeof v === "object" && !Array.isArray(v));
    const english = path.join("src/data/recipes", path.basename(file));
    const raw = await loadOnlyExport<RecipeInput[]>(english, Array.isArray);
    recipes = raw.map((r) => recipeSchema.parse(r));
  }
  const errors = validateTranslations(recipes, es, { requireAll: true });
  console.log(`${Object.keys(es).length} Spanish translations checked${file ? ` in ${file}` : ""}`);
  if (errors.length) {
    console.error(`\n${errors.length} problem(s):\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  console.log("Spanish content OK");
}

void main();
