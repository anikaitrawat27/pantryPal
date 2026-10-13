import { describe, expect, it } from "vitest";
import { recipeSchema } from "@/data/schema";
import type { RecipeEs } from "@/i18n/recipe-es";
import { validateTranslations } from "@/lib/validate-es";

const recipe = recipeSchema.parse({
  slug: "test-toast",
  title: "Test Toast",
  blurb: "Buttery toast for testing.",
  course: "breakfast",
  meal: ["breakfast"],
  cuisine: "american",
  equipment: ["stovetop"],
  difficulty: 1,
  prep: 1,
  cook: 4,
  serves: 1,
  ingredients: [
    ["bread", 2, "slice", { note: "any kind" }],
    ["butter", 1, "tbsp"],
    ["baking-powder", 1, "pinch"],
  ],
  steps: ["Melt the butter in a skillet.", "Toast the bread until golden."],
  tips: ["Add jelly."],
});

const good: RecipeEs = {
  title: "Pan tostado de prueba",
  blurb: "Pan tostado con mantequilla, para pruebas.",
  steps: ["Derrita la mantequilla en un sartén.", "Tueste el pan con el polvo para hornear hasta que esté dorado."],
  tips: ["Agregue mermelada."],
  notes: { bread: "de cualquier tipo" },
};

const check = (t: Partial<RecipeEs>, requireAll = true) =>
  validateTranslations([recipe], { "test-toast": { ...good, ...t } }, { requireAll });

describe("validateTranslations", () => {
  it("accepts a complete translation, including 'polvo para hornear' and 'sin horno'", () => {
    expect(check({})).toEqual([]);
    expect(check({ blurb: "Pan tostado sin horno, listo en minutos." })).toEqual([]);
    expect(check({ steps: ["Derrita la mantequilla en la hornilla.", "Tueste el pan."] })).toEqual([]);
  });

  it("requires every recipe when asked", () => {
    expect(validateTranslations([recipe], {}, { requireAll: true })).toEqual(["es.test-toast: missing translation"]);
    expect(validateTranslations([recipe], {}, { requireAll: false })).toEqual([]);
  });

  it("flags unknown slugs", () => {
    expect(validateTranslations([recipe], { "test-toast": good, ghost: good }, { requireAll: true }).join()).toMatch(
      /es.ghost/,
    );
  });

  it("requires matching step and tip counts", () => {
    expect(check({ steps: ["Solo un paso."] }).join()).toMatch(/1 steps; English has 2/);
    expect(check({ tips: [] }).join()).toMatch(/0 tips; English has 1/);
  });

  it("requires notes for exactly the ingredients that have English notes", () => {
    expect(check({ notes: {} }).join()).toMatch(/missing note for "bread"/);
    expect(check({ notes: { bread: "x", butter: "y" } }).join()).toMatch(/"butter", which has no English note/);
    expect(check({ notes: { bread: "x", milk: "y" } }).join()).toMatch(/"milk", which the recipe does not use/);
  });

  it("rejects oven words and hard-coded amounts", () => {
    expect(check({ steps: ["Precaliente el sartén.", "Tueste el pan."] }).join()).toMatch(/Precaliente/);
    expect(check({ steps: ["Hornee el pan.", "Listo."] }).join()).toMatch(/Hornee/);
    expect(check({ blurb: "Gratinado y dorado al horno." }).join()).toMatch(/Gratinado/);
    expect(check({ steps: ["Agregue 2 cucharadas de mantequilla.", "Tueste."] }).join()).toMatch(/2 cucharadas/);
  });
});
