import { describe, expect, it } from "vitest";
import { formatIngredientLine, formatNumber, roundFriendly, scaleAmount } from "@/lib/scale";

describe("formatNumber", () => {
  it.each([
    [1, "1"],
    [0.5, "1/2"],
    [1.5, "1 1/2"],
    [1 / 3, "1/3"],
    [2 / 3, "2/3"],
    [0.75, "3/4"],
    [0.125, "1/8"],
    [2.98, "3"],
    [0.3, "1/3"],
  ])("%d -> %s", (n, s) => expect(formatNumber(n)).toBe(s));

  it("rolls a near-whole fraction up", () => {
    expect(roundFriendly(1.97)).toBe(2);
  });
});

describe("scaleAmount", () => {
  it("leaves amounts alone at factor 1", () => {
    expect(scaleAmount({ id: "milk", qty: 1, unit: "cup" }, 1)).toEqual({ qty: 1, unit: "cup" });
  });

  it("keeps to-taste and fixed amounts", () => {
    expect(scaleAmount({ id: "salt", fixed: true }, 4)).toEqual({ unit: undefined });
    expect(scaleAmount({ id: "ice", qty: 1, unit: "handful", fixed: true }, 6)).toEqual({ qty: 1, unit: "handful" });
  });

  it("never scales frying oil", () => {
    expect(scaleAmount({ id: "oil", qty: 0.5, unit: "cup", frying: true }, 3)).toEqual({ qty: 0.5, unit: "cup" });
  });

  it("steps volume up into larger units", () => {
    expect(scaleAmount({ id: "sugar", qty: 1, unit: "tsp" }, 3)).toEqual({ qty: 1, unit: "tbsp" });
    expect(scaleAmount({ id: "oil", qty: 2, unit: "tbsp" }, 2)).toEqual({ qty: 1 / 4, unit: "cup" });
    expect(scaleAmount({ id: "milk", qty: 0.5, unit: "cup" }, 3)).toEqual({ qty: 1.5, unit: "cup" });
  });

  it("steps volume down when a cup amount gets small", () => {
    expect(scaleAmount({ id: "milk", qty: 0.25, unit: "cup" }, 1 / 2)).toEqual({ qty: 2, unit: "tbsp" });
    expect(scaleAmount({ id: "oil", qty: 1, unit: "tbsp" }, 1 / 3)).toEqual({ qty: 1, unit: "tsp" });
  });

  it("never rounds a volume to zero", () => {
    expect(scaleAmount({ id: "sugar", qty: 1 / 4, unit: "tsp" }, 1 / 6).qty).toBeGreaterThan(0);
  });

  it("converts ounces to pounds when clean", () => {
    expect(scaleAmount({ id: "pasta", qty: 8, unit: "oz" }, 2)).toEqual({ qty: 1, unit: "lb" });
    expect(scaleAmount({ id: "pasta", qty: 8, unit: "oz" }, 1 / 2)).toEqual({ qty: 4, unit: "oz" });
  });

  it("rounds cans and sticks to halves", () => {
    expect(scaleAmount({ id: "black-beans", qty: 1, unit: "can" }, 1 / 3)).toEqual({ qty: 0.5, unit: "can" });
    expect(scaleAmount({ id: "black-beans", qty: 1, unit: "can" }, 1.7)).toEqual({ qty: 1.5, unit: "can" });
  });

  it("rounds whole-only items to integers with a minimum of one", () => {
    expect(scaleAmount({ id: "eggs", qty: 2 }, 1 / 4)).toEqual({ qty: 1, unit: undefined });
    expect(scaleAmount({ id: "eggs", qty: 3 }, 1.5)).toEqual({ qty: 5, unit: undefined });
    expect(scaleAmount({ id: "bread", qty: 2, unit: "slice" }, 0.25)).toEqual({ qty: 1, unit: "slice" });
  });

  it("lets counted produce halve", () => {
    expect(scaleAmount({ id: "onion", qty: 1 }, 1 / 2)).toEqual({ qty: 0.5, unit: undefined });
    expect(scaleAmount({ id: "banana", qty: 1 }, 1 / 6)).toEqual({ qty: 0.5, unit: undefined });
  });

  it("produces a measurable amount at every serving size from 1 to 6", () => {
    for (let base = 1; base <= 6; base++) {
      for (let target = 1; target <= 6; target++) {
        const out = scaleAmount({ id: "milk", qty: 0.75, unit: "cup" }, target / base);
        expect(out.qty).toBeGreaterThan(0);
        expect(formatNumber(out.qty!)).not.toBe("0");
      }
    }
  });
});

describe("formatIngredientLine", () => {
  it("pluralizes units and names", () => {
    expect(formatIngredientLine("milk", { qty: 1.5, unit: "cup" })).toBe("1 1/2 cups milk");
    expect(formatIngredientLine("eggs", { qty: 2 })).toBe("2 eggs");
    expect(formatIngredientLine("eggs", { qty: 1 })).toBe("1 egg");
    expect(formatIngredientLine("tomato", { qty: 2 })).toBe("2 tomatoes");
  });

  it("drops the redundant 'canned' after a can unit", () => {
    expect(formatIngredientLine("canned-corn", { qty: 1, unit: "can" })).toBe("1 can corn");
  });

  it("renders to-taste lines", () => {
    expect(formatIngredientLine("salt", {})).toBe("salt, to taste");
  });
});
