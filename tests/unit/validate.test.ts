import { describe, expect, it } from "vitest";
import { recipeSchema, type RecipeInput } from "@/data/schema";
import { GLOBAL_SUBSTITUTIONS } from "@/data/substitutions";
import { validateRecipes, validateSubstitutionMap } from "@/lib/validate";

const base: RecipeInput = {
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
  ingredients: [["bread", 2, "slice"], ["butter", 1, "tbsp"], ["salt", "to taste"]],
  steps: ["Melt the butter in a skillet.", "Toast the bread until golden."],
};

const check = (over: Partial<RecipeInput>) =>
  validateRecipes([recipeSchema.parse({ ...base, ...over })], { requireCounts: false });

describe("recipe schema", () => {
  it("normalizes ingredient tuples", () => {
    const r = recipeSchema.parse({ ...base, ingredients: [["onion", 1, { note: "diced" }], ["salt", "to taste"], ["milk", 0.5, "cup", { optional: true }]] });
    expect(r.ingredients).toEqual([
      { id: "onion", qty: 1, note: "diced" },
      { id: "salt", fixed: true },
      { id: "milk", qty: 0.5, unit: "cup", optional: true },
    ]);
  });

  it("rejects servings outside 1-6 and bad slugs", () => {
    expect(recipeSchema.safeParse({ ...base, serves: 8 }).success).toBe(false);
    expect(recipeSchema.safeParse({ ...base, slug: "Bad Slug" }).success).toBe(false);
  });

  it("rejects oven as equipment", () => {
    expect(recipeSchema.safeParse({ ...base, equipment: ["oven"] }).success).toBe(false);
  });
});

describe("validateRecipes", () => {
  it("accepts a valid recipe", () => {
    expect(check({})).toEqual([]);
  });

  it("rejects unknown and duplicate ingredients", () => {
    expect(check({ ingredients: [["unicorn", 1]] }).join()).toMatch(/unknown ingredient "unicorn"/);
    expect(check({ ingredients: [["bread", 1, "slice"], ["bread", 1, "slice"]] }).join()).toMatch(/listed twice/);
  });

  it("rejects oven words but allows baking powder", () => {
    expect(check({ steps: ["Preheat the skillet."] }).join()).toMatch(/Preheat/);
    expect(check({ steps: ["Bake in a skillet."] }).join()).toMatch(/Bake/);
    expect(check({ steps: ["Whisk in the baking powder, then cook in a skillet."] })).toEqual([]);
    expect(check({ title: "No-Bake Toast", blurb: "Toast with no oven needed at all." })).toEqual([]);
    expect(check({ blurb: "Better than oven toast, honestly." }).join()).toMatch(/oven/);
  });

  it("rejects hard-coded amounts in steps but allows times", () => {
    expect(check({ steps: ["Add 2 tbsp butter to a skillet."] }).join()).toMatch(/hard-coded amount "2 tbsp"/);
    expect(check({ steps: ["Cook in a skillet for 3 minutes."] })).toEqual([]);
  });

  it("checks equipment against the steps", () => {
    expect(check({ steps: ["Microwave the bread."], equipment: ["stovetop"] }).join()).toMatch(/mention microwave/);
    expect(check({ equipment: ["stovetop", "blender"] }).join()).toMatch(/lists blender but no step/);
    expect(check({ equipment: ["no-cook", "stovetop"] }).join()).toMatch(/no-cook/);
  });

  it("does not read 'air fry' as a stovetop step", () => {
    expect(check({ equipment: ["air-fryer"], steps: ["Air fry the bread for 4 minutes."] })).toEqual([]);
    expect(check({ equipment: ["air-fryer"], steps: ["Fry the bread in the air fryer."] }).join()).toMatch(/mention stovetop/);
  });

  it("flags duplicate slugs and titles", () => {
    const r = recipeSchema.parse(base);
    expect(validateRecipes([r, r], { requireCounts: false }).join()).toMatch(/duplicate slug/);
  });

  it("enforces course counts when required", () => {
    expect(validateRecipes([recipeSchema.parse(base)], { requireCounts: true }).join()).toMatch(/expected 250/);
  });

  it("validates per-recipe substitutions", () => {
    expect(check({ ingredients: [["butter", 1, "tbsp", { subs: [{ id: "lard" }] }]] }).join()).toMatch(/"lard" is not in the pantry/);
  });
});

describe("global substitution map", () => {
  it("is valid", () => {
    expect(validateSubstitutionMap(GLOBAL_SUBSTITUTIONS)).toEqual([]);
  });
});
