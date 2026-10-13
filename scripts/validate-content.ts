/**
 * Validates the recipe catalog and the substitution map.
 *
 * Usage:
 *   tsx scripts/validate-content.ts                 full check, including per-course counts
 *   tsx scripts/validate-content.ts --partial       skip the count check while writing recipes
 *   tsx scripts/validate-content.ts --file <path>   check one recipe file in isolation (implies --partial)
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import { RAW_RECIPES } from "@/data/recipes";
import { recipeSchema, type Recipe, type RecipeInput } from "@/data/schema";
import { GLOBAL_SUBSTITUTIONS } from "@/data/substitutions";
import { COURSE_TARGETS, validateRecipes, validateSubstitutionMap } from "@/lib/validate";

async function loadFile(file: string): Promise<readonly RecipeInput[]> {
  const mod = (await import(pathToFileURL(path.resolve(file)).href)) as Record<string, unknown>;
  const arrays = Object.values(mod).filter(Array.isArray) as RecipeInput[][];
  if (arrays.length !== 1) throw new Error(`${file} must export exactly one recipe array`);
  return arrays[0];
}

async function main() {
  const fileIdx = process.argv.indexOf("--file");
  const file = fileIdx >= 0 ? process.argv[fileIdx + 1] : undefined;
  const partial = Boolean(file) || process.argv.includes("--partial");
  const raw = file ? await loadFile(file) : RAW_RECIPES;

  const errors: string[] = validateSubstitutionMap(GLOBAL_SUBSTITUTIONS);
  const parsed: Recipe[] = [];
  raw.forEach((r, i) => {
    const res = recipeSchema.safeParse(r);
    if (res.success) parsed.push(res.data);
    else {
      const issues = res.error.issues.map((iss) => `${iss.path.join(".")}: ${iss.message}`).join("; ");
      errors.push(`${(r as { slug?: string }).slug ?? `#${i}`}: schema: ${issues}`);
    }
  });
  errors.push(...validateRecipes(parsed, { requireCounts: !partial }));

  const counts = Object.entries(COURSE_TARGETS)
    .map(([c, target]) => `${c} ${parsed.filter((r) => r.course === c).length}/${target}`)
    .join(", ");
  console.log(`${raw.length} recipes${file ? ` in ${file}` : ""} (${counts})`);

  if (errors.length) {
    console.error(`\n${errors.length} problem(s):\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  console.log("Content OK");
}

void main();
