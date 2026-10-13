import { describe, expect, it } from "vitest";
import { dietsFor } from "@/lib/diet";
import { applySub, resolveSubs } from "@/lib/substitute";

describe("resolveSubs", () => {
  it("uses the global map by default", () => {
    expect(resolveSubs({ id: "butter", qty: 1, unit: "tbsp" }).map((s) => s.id)).toEqual(["oil"]);
  });

  it("honors recipe overrides and blocks", () => {
    expect(resolveSubs({ id: "butter", qty: 1, unit: "tbsp", subs: [{ id: "peanut-butter" }] }).map((s) => s.id)).toEqual(["peanut-butter"]);
    expect(resolveSubs({ id: "butter", qty: 1, unit: "tbsp", noSubs: true })).toEqual([]);
  });

  it("only offers unit-converting swaps from the matching unit", () => {
    expect(resolveSubs({ id: "garlic", qty: 2, unit: "clove" }).map((s) => s.id)).toEqual(["garlic-ginger-paste"]);
    expect(resolveSubs({ id: "garlic", qty: 1 })).toEqual([]);
  });

  it("returns nothing for items with no swaps", () => {
    expect(resolveSubs({ id: "eggs", qty: 2 })).toEqual([]);
  });
});

describe("applySub", () => {
  it("applies ratio, unit, and note", () => {
    const out = applySub({ id: "garlic", qty: 2, unit: "clove" }, { id: "garlic-ginger-paste", from: "clove", unit: "tsp", ratio: 0.5 });
    expect(out).toMatchObject({ id: "garlic-ginger-paste", qty: 1, unit: "tsp", noSubs: true });
  });

  it("keeps to-taste amounts unquantified", () => {
    expect(applySub({ id: "lemon-juice", fixed: true }, { id: "vinegar" }).qty).toBeUndefined();
  });
});

describe("dietsFor", () => {
  it("labels a plant-only dish with every diet", () => {
    expect(dietsFor([{ id: "rice" }, { id: "black-beans" }, { id: "oil" }])).toEqual(["vegan", "vegetarian", "dairy-free", "egg-free", "gluten-free"]);
  });

  it("treats honey as not vegan but vegetarian", () => {
    const d = dietsFor([{ id: "oats" }, { id: "honey" }]);
    expect(d).toContain("vegetarian");
    expect(d).not.toContain("vegan");
    expect(d).not.toContain("gluten-free");
  });

  it("treats broth as meat", () => {
    expect(dietsFor([{ id: "chicken-broth" }])).not.toContain("vegetarian");
  });

  it("ignores optional ingredients", () => {
    expect(dietsFor([{ id: "rice" }, { id: "cheese", optional: true }])).toContain("vegan");
  });

  it("detects eggs in mayo", () => {
    expect(dietsFor([{ id: "mayo" }])).not.toContain("egg-free");
  });
});
