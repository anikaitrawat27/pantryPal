import { describe, expect, it } from "vitest";
import { FACTS } from "@/data/facts";
import { INGREDIENTS } from "@/data/pantry";
import { RECIPES } from "@/lib/catalog";
import { costPerServing, gramsOf, nutritionPerServing } from "@/lib/nutrition";

describe("gramsOf", () => {
  it("converts volumes through the cup weight", () => {
    expect(gramsOf({ id: "flour", qty: 1, unit: "cup" })).toBe(125);
    expect(gramsOf({ id: "flour", qty: 2, unit: "tbsp" })).toBeCloseTo(15.625);
    expect(gramsOf({ id: "salt", qty: 1, unit: "tsp" })).toBeCloseTo(6.08, 1);
  });

  it("handles weights, counts, cans, and small measures", () => {
    expect(gramsOf({ id: "ground-beef", qty: 1, unit: "lb" })).toBeCloseTo(453.6);
    expect(gramsOf({ id: "pasta", qty: 8, unit: "oz" })).toBeCloseTo(226.8);
    expect(gramsOf({ id: "eggs", qty: 2 })).toBe(100);
    expect(gramsOf({ id: "black-beans", qty: 1, unit: "can" })).toBe(255);
    expect(gramsOf({ id: "salt", qty: 1, unit: "pinch" })).toBeLessThan(1);
  });

  it("converts cooked rice to dry weight", () => {
    expect(gramsOf({ id: "rice", qty: 3, unit: "cup", cooked: true })).toBeCloseTo(158);
    expect(gramsOf({ id: "rice", qty: 1, unit: "cup" })).toBe(185);
  });

  it("treats to-taste amounts as zero and rejects unknown units", () => {
    expect(gramsOf({ id: "salt" })).toBe(0);
    expect(() => gramsOf({ id: "ground-beef", qty: 1, unit: "cup" })).toThrow(/No weight/);
  });
});

describe("estimates", () => {
  const ings = [
    { id: "eggs", qty: 2 },
    { id: "butter", qty: 1, unit: "tbsp" as const },
    { id: "cheese", qty: 0.25, unit: "cup" as const, optional: true },
    { id: "water", qty: 1, unit: "cup" as const },
  ];

  it("computes per-serving nutrition from required ingredients", () => {
    // 100 g egg (143 kcal, 12.6 g protein) + 14.2 g butter (102 kcal), over 2 servings.
    expect(nutritionPerServing(ings, 2)).toEqual({ kcal: 120, protein: 6, fiber: 0 });
  });

  it("costs the share of each package used, skipping optional and free items", () => {
    // 100/600 of $3.50 + 14.19/454 of $5.00, over 1 serving.
    expect(costPerServing(ings, 1)).toBeCloseTo(0.74, 2);
  });
});

describe("frying oil", () => {
  it("counts only the absorbed share for nutrition but the full amount for cost", () => {
    const fried = [{ id: "oil", qty: 0.5, unit: "cup" as const, frying: true }];
    const eaten = [{ id: "oil", qty: 0.5, unit: "cup" as const }];
    expect(nutritionPerServing(fried, 1).kcal).toBe(Math.round((nutritionPerServing(eaten, 1).kcal * 0.2) / 10) * 10);
    expect(costPerServing(fried, 1)).toBe(costPerServing(eaten, 1));
  });
});

describe("facts coverage", () => {
  it("has facts for every ingredient and a price for everything but water and ice", () => {
    for (const ing of INGREDIENTS) {
      expect(FACTS[ing.id], ing.id).toBeDefined();
      if (ing.tier !== "free") expect(FACTS[ing.id].pack, ing.id).toBeDefined();
    }
  });

  it("can weigh every ingredient line in the catalog", () => {
    for (const r of RECIPES)
      for (const ing of r.ingredients) expect(() => gramsOf(ing), `${r.slug} ${ing.id}`).not.toThrow();
  });

  it("produces plausible estimates for every recipe", () => {
    for (const r of RECIPES) {
      const n = nutritionPerServing(r.ingredients, r.serves);
      expect(n.kcal, r.slug).toBeGreaterThanOrEqual(10);
      expect(n.kcal, r.slug).toBeLessThanOrEqual(1500);
      const cost = costPerServing(r.ingredients, r.serves);
      expect(cost, r.slug).toBeGreaterThan(0);
      expect(cost, r.slug).toBeLessThan(8);
    }
  });
});
