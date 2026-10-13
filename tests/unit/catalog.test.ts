import { describe, expect, it } from "vitest";
import { RECIPES } from "@/lib/catalog";
import { scaleAmount, formatIngredientLine } from "@/lib/scale";
import { validateRecipes } from "@/lib/validate";

const complete = process.env.REQUIRE_FULL_CATALOG !== "0";

describe("recipe catalog", () => {
  it("passes content validation", () => {
    expect(validateRecipes(RECIPES, { requireCounts: complete })).toEqual([]);
  });

  it("renders every ingredient line at every serving size", () => {
    for (const r of RECIPES) {
      for (let s = 1; s <= 6; s++) {
        for (const ing of r.ingredients) {
          const line = formatIngredientLine(ing.id, scaleAmount(ing, s / r.serves));
          expect(line, `${r.slug} at ${s} servings`).not.toMatch(/^0 |NaN|undefined/);
        }
      }
    }
  });
});

describe("Spanish catalog", () => {
  it("translates every recipe completely and keeps the content rules", async () => {
    const { RECIPES_ES } = await import("@/i18n/es/recipes");
    const { validateTranslations } = await import("@/lib/validate-es");
    expect(validateTranslations(RECIPES, RECIPES_ES, { requireAll: true })).toEqual([]);
  });

  it("finds a timer in most Spanish steps that have one in English", async () => {
    const { RECIPES_ES } = await import("@/i18n/es/recipes");
    const { parseTimers } = await import("@/lib/timers");
    let english = 0;
    let both = 0;
    for (const r of RECIPES) {
      r.steps.forEach((step, i) => {
        if (parseTimers(step).length === 0) return;
        english++;
        if (parseTimers(RECIPES_ES[r.slug].steps[i]).length > 0) both++;
      });
    }
    expect(both / english).toBeGreaterThan(0.95);
  });
});
