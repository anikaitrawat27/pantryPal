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
