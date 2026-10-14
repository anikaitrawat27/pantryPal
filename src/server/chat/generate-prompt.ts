import "server-only";
import { FACTS } from "@/data/facts";
import { INGREDIENTS } from "@/data/pantry";
import { EQUIPMENT } from "@/data/schema";

/** The units an ingredient can be measured in, for the prompt and for error messages. */
export const unitsFor = (id: string) => {
  const g = FACTS[id]?.grams ?? {};
  const units: string[] = [];
  if (g.cup !== undefined) units.push("tsp", "tbsp", "cup", "pinch", "dash", "splash");
  units.push("oz", "lb");
  if (g.each !== undefined) units.push("(no unit: counted)");
  for (const u of ["can", "slice", "clove", "stick", "packet", "handful", "leaf"] as const)
    if (g[u] !== undefined) units.push(u);
  return units.join(", ");
};

/** The recipe writer's rules. Stable across requests, so it is served from the prompt cache. */
export const RECIPE_WRITER_PROMPT = `You write recipes for Pantry Pal, a site for people cooking from food-pantry groceries.

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
