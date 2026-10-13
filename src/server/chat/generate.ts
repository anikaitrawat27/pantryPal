import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import * as z from "zod/v4";
import { FACTS } from "@/data/facts";
import { INGREDIENTS } from "@/data/pantry";
import { COURSES, CUISINES, EQUIPMENT, MEALS, recipeSchema, UNITS, type Recipe, type RecipeInput } from "@/data/schema";
import type { Lang } from "@/i18n/config";
import type { RecipeEs } from "@/i18n/recipe-es";
import { dietsFor, type Diet } from "@/lib/diet";
import { costPerServing, nutritionPerServing, type Nutrition } from "@/lib/nutrition";
import { validateRecipes } from "@/lib/validate";
import { validateTranslations } from "@/lib/validate-es";
import { CHAT_MODEL } from "./model";

export const MAX_GENERATION_ATTEMPTS = 3;

const INGREDIENT_IDS = INGREDIENTS.map((i) => i.id) as [string, ...string[]];

/**
 * What the model fills in. Ingredient ids and units are enums, so structured output
 * makes off-list ingredients impossible; everything else is checked by the same
 * validator the catalog uses.
 */
const generatedSchema = z.object({
  title: z.string(),
  blurb: z.string(),
  course: z.enum(COURSES),
  meal: z.array(z.enum(MEALS)),
  cuisine: z.enum(CUISINES),
  equipment: z.array(z.enum(EQUIPMENT)),
  difficulty: z.enum(["1", "2", "3"]),
  prepMinutes: z.number().int(),
  cookMinutes: z.number().int(),
  servings: z.number().int(),
  ingredients: z.array(
    z.object({
      id: z.enum(INGREDIENT_IDS),
      /** null means "to taste". */
      amount: z.number().nullable(),
      unit: z.enum(UNITS).nullable(),
      note: z.string().nullable(),
      optional: z.boolean(),
    }),
  ),
  steps: z.array(z.string()),
  tips: z.array(z.string()),
  /** Spanish text, filled in only when the conversation is in Spanish. */
  es: z
    .object({
      title: z.string(),
      blurb: z.string(),
      steps: z.array(z.string()),
      tips: z.array(z.string()),
      notes: z.array(z.object({ id: z.enum(INGREDIENT_IDS), note: z.string() })),
    })
    .nullable(),
});

type Generated = z.infer<typeof generatedSchema>;

export interface GenerateRequest {
  request: string;
  mustUse: string[];
  servings?: number;
  course?: Recipe["course"];
  maxMinutes?: number;
  lang: Lang;
}

export interface GeneratedRecipe {
  recipe: Recipe;
  es: RecipeEs | null;
  diets: Diet[];
  nutrition: Nutrition;
  costPerServingUsd: number;
}

const unitsFor = (id: string) => {
  const g = FACTS[id]?.grams ?? {};
  const units: string[] = [];
  if (g.cup !== undefined) units.push("tsp", "tbsp", "cup", "pinch", "dash", "splash");
  units.push("oz", "lb");
  if (g.each !== undefined) units.push("(no unit: counted)");
  for (const u of ["can", "slice", "clove", "stick", "packet", "handful", "leaf"] as const)
    if (g[u] !== undefined) units.push(u);
  return units.join(", ");
};

/** Stable across requests so it is served from the prompt cache. */
const SYSTEM = `You write recipes for Pantry Pal, a site for people cooking from food-pantry groceries.

Hard rules (a validator rejects any recipe that breaks them):
- Use only these ingredient ids. Allowed units per ingredient are listed; "counted" means amount with unit null (e.g. 2 eggs).
${INGREDIENTS.map((i) => `  ${i.id} (${i.name}${i.tier === "extra" ? ", extra seasoning" : ""}): ${unitsFor(i.id)}`).join("\n")}
- No oven or broiler. Never write oven, bake, baked, broil, preheat, or "baking sheet". Equipment is any of: ${EQUIPMENT.join(", ")}.
- "equipment" must match the steps exactly: a step that mentions a skillet, pan, pot, boil, simmer, or fry needs stovetop; "microwave" needs microwave; "blend" needs blender; "toaster" needs toaster; "air fryer" needs air-fryer. Do not list a tool no step uses. no-cook is used alone.
- Steps never contain amounts such as "2 tbsp" or "1 cup" (servings can be scaled). Write "add the milk". Times and heat levels are fine.
- servings is 1 to 6, and amounts are for that many servings. difficulty is "1" (easy), "2", or "3".
- Mark extras (cinnamon, cumin, soy sauce, etc.) optional when the dish works without them. Use amount null only for "to taste" seasoning.
- Food safety: cook meat until no pink remains; no raw eggs or raw flour in no-cook dishes.

Style: blurb is one or two plain sentences under 220 characters, no hype words, no exclamation marks. Steps are short imperative sentences in cooking order with doneness cues. Keep it easy; most recipes are difficulty 1 or 2.

When asked for Spanish, also fill "es": Latin American Spanish, "usted" imperatives, the same number of steps and tips, a note translation for every ingredient that has a note, and the same no-amounts and no-oven rules (never horno, hornear, gratinar, precalentar). Otherwise set "es" to null.`;

function toRecipeInput(g: Generated, slug: string): RecipeInput {
  return {
    slug,
    title: g.title,
    blurb: g.blurb,
    course: g.course,
    meal: g.meal,
    cuisine: g.cuisine,
    equipment: g.equipment,
    difficulty: Number(g.difficulty) as 1 | 2 | 3,
    prep: g.prepMinutes,
    cook: g.cookMinutes,
    serves: g.servings,
    ingredients: g.ingredients.map((i) => {
      const opts = { ...(i.note ? { note: i.note } : {}), ...(i.optional ? { optional: true } : {}) };
      if (i.amount === null) return [i.id, "to taste", opts] as const;
      return i.unit ? ([i.id, i.amount, i.unit, opts] as const) : ([i.id, i.amount, opts] as const);
    }) as RecipeInput["ingredients"],
    steps: g.steps,
    ...(g.tips.length ? { tips: g.tips } : {}),
  };
}

export interface CheckResult {
  problems: string[];
  recipe?: Recipe;
  es?: RecipeEs | null;
}

/** Runs every catalog rule on a generated recipe. Exported for tests. */
export function checkGenerated(g: Generated, slug: string, lang: Lang): CheckResult {
  const parsed = recipeSchema.safeParse(toRecipeInput(g, slug));
  if (!parsed.success) {
    return { problems: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
  }
  const recipe = parsed.data;
  const problems = validateRecipes([recipe], { requireCounts: false }).map((p) => p.replace(`${slug}: `, ""));
  if (recipe.ingredients.some((i) => i.id === "water" || i.id === "ice") && recipe.ingredients.length === 1) {
    problems.push("A recipe needs more than water or ice.");
  }
  try {
    nutritionPerServing(recipe.ingredients, recipe.serves);
  } catch (err) {
    const id = recipe.ingredients.find((i) => {
      try {
        nutritionPerServing([i], 1);
        return false;
      } catch {
        return true;
      }
    })?.id;
    problems.push(id ? `Unit not allowed for ${id}. Allowed: ${unitsFor(id)}.` : (err as Error).message);
  }
  let es: RecipeEs | null = null;
  if (lang === "es") {
    if (!g.es) problems.push('The conversation is in Spanish, so fill in "es".');
    else {
      es = {
        title: g.es.title,
        blurb: g.es.blurb,
        steps: g.es.steps,
        ...(g.es.tips.length ? { tips: g.es.tips } : {}),
        notes: Object.fromEntries(g.es.notes.map((n) => [n.id, n.note])),
      };
      problems.push(
        ...validateTranslations([recipe], { [slug]: es }, { requireAll: true }).map((p) =>
          p.replace(`es.${slug}: `, "Spanish: "),
        ),
      );
    }
  }
  return { problems, recipe, es };
}

function slugify(title: string, suffix: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  return `${base || "recipe"}-${suffix}`;
}

export type GenerateOutcome =
  | { ok: true; result: GeneratedRecipe; attempts: number }
  | { ok: false; problems: string[]; attempts: number };

/**
 * Asks the model for a recipe as structured output and validates it. On failure the
 * exact problems go back to the model, up to MAX_GENERATION_ATTEMPTS in total.
 * The transcript is append-only (each attempt adds the model's full reply and the feedback).
 */
export async function generateRecipe(
  client: Anthropic,
  req: GenerateRequest,
  idSuffix: string,
  signal?: AbortSignal,
): Promise<GenerateOutcome> {
  const constraints = [
    `Request: ${req.request}`,
    req.mustUse.length ? `Must use: ${req.mustUse.join(", ")}` : null,
    req.course ? `Course: ${req.course}` : null,
    req.servings ? `Servings: ${req.servings}` : null,
    req.maxMinutes ? `Total time at most ${req.maxMinutes} minutes.` : null,
    `Language: ${req.lang === "es" ? "English recipe plus Spanish text in es" : "English; es is null"}`,
  ].filter(Boolean);
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: constraints.join("\n") }];
  let problems: string[] = [];

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    const response = await client.messages.parse(
      {
        model: CHAT_MODEL,
        max_tokens: 8000,
        system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
        output_config: { effort: "low", format: zodOutputFormat(generatedSchema) },
        messages,
      },
      { signal },
    );
    if (response.stop_reason === "refusal")
      return { ok: false, problems: ["The request was declined."], attempts: attempt };
    const g = response.parsed_output;
    if (!g || response.stop_reason === "max_tokens") {
      problems = ["The response was cut off or not valid JSON."];
    } else {
      const slug = slugify(g.title, idSuffix);
      const check = checkGenerated(g, slug, req.lang);
      problems = check.problems;
      if (problems.length === 0 && check.recipe) {
        const r = check.recipe;
        return {
          ok: true,
          attempts: attempt,
          result: {
            recipe: r,
            es: check.es ?? null,
            diets: dietsFor(r.ingredients),
            nutrition: nutritionPerServing(r.ingredients, r.serves),
            costPerServingUsd: costPerServing(r.ingredients, r.serves),
          },
        };
      }
    }
    messages.push({ role: "assistant", content: response.content });
    messages.push({
      role: "user",
      content: `The recipe failed validation:\n- ${problems.join("\n- ")}\nFix every problem and return the complete recipe again.`,
    });
  }
  return { ok: false, problems, attempts: MAX_GENERATION_ATTEMPTS };
}
