import { describe, expect, it } from "vitest";
import { addEntry, EMPTY_PLAN, entriesFor, moveEntry, parsePlan, removeEntry, setEntryServings, toggleChecked } from "@/lib/plan";
import { buildShoppingList, formatShoppingLine, shoppingListText, type PlannedRecipe } from "@/lib/shopping";

describe("plan", () => {
  const p1 = addEntry(EMPTY_PLAN, { slug: "tacos", day: 1, meal: "dinner", servings: 9 }, "a");

  it("adds entries and clamps servings to 1-6", () => {
    expect(p1.entries).toEqual([{ id: "a", slug: "tacos", day: 1, meal: "dinner", servings: 6 }]);
    expect(setEntryServings(p1, "a", 0).entries[0].servings).toBe(1);
  });

  it("moves, filters by slot, and removes entries", () => {
    const moved = moveEntry(p1, "a", 4, "lunch");
    expect(entriesFor(moved, 4, "lunch")).toHaveLength(1);
    expect(entriesFor(moved, 1, "dinner")).toHaveLength(0);
    expect(removeEntry(moved, "a").entries).toEqual([]);
  });

  it("toggles shopping checks", () => {
    const c = toggleChecked(EMPTY_PLAN, "rice");
    expect(c.checked).toEqual(["rice"]);
    expect(toggleChecked(c, "rice").checked).toEqual([]);
  });

  it("parses stored plans and drops malformed entries", () => {
    const parsed = parsePlan({
      entries: [
        { id: "a", slug: "tacos", day: 2, meal: "lunch", servings: 3 },
        { id: "b", slug: "x", day: 9, meal: "lunch", servings: 3 },
        { id: "c", slug: "x", day: 1, meal: "brunch", servings: 3 },
        { slug: "x", day: 1, meal: "lunch", servings: 3 },
        "junk",
      ],
      checked: ["rice", 4],
    });
    expect(parsed).toEqual({ entries: [{ id: "a", slug: "tacos", day: 2, meal: "lunch", servings: 3 }], checked: ["rice"] });
    expect(parsePlan(undefined)).toEqual(EMPTY_PLAN);
  });
});

const recipes = new Map<string, PlannedRecipe>([
  [
    "bean-tacos",
    {
      slug: "bean-tacos",
      title: "Bean Tacos",
      serves: 2,
      ingredients: [
        { id: "black-beans", qty: 1, unit: "can" },
        { id: "tortillas", qty: 4 },
        { id: "onion", qty: 0.5 },
        { id: "cumin", qty: 1, unit: "tsp" },
        { id: "oil", qty: 1, unit: "tbsp" },
        { id: "cheese", qty: 0.25, unit: "cup", optional: true },
        { id: "water", qty: 0.25, unit: "cup" },
      ],
    },
  ],
  [
    "bean-soup",
    {
      slug: "bean-soup",
      title: "Bean Soup",
      serves: 4,
      ingredients: [
        { id: "black-beans", qty: 2, unit: "can" },
        { id: "onion", qty: 1 },
        { id: "cumin", qty: 2, unit: "tsp" },
      ],
    },
  ],
  [
    "rice-bowl",
    {
      slug: "rice-bowl",
      title: "Rice Bowl",
      serves: 2,
      ingredients: [
        { id: "rice", qty: 3, unit: "cup", cooked: true },
        { id: "oil", qty: 0.5, unit: "cup", frying: true },
      ],
    },
  ],
]);

describe("buildShoppingList", () => {
  const noPantry = { have: [], low: [] };

  it("adds amounts across meals, scaled to each meal's servings", () => {
    const list = buildShoppingList(
      [
        { slug: "bean-tacos", servings: 2 },
        { slug: "bean-soup", servings: 2 },
      ],
      recipes,
      noPantry,
    );
    const byId = Object.fromEntries(list.items.map((i) => [i.id, i]));
    // 1 can + half of 2 cans = 2 cans.
    expect(byId["black-beans"].line).toBe("2 cans black beans");
    expect(byId["black-beans"].packages).toBe(2);
    expect(byId["black-beans"].recipes).toEqual(["Bean Tacos", "Bean Soup"]);
    // 1/2 + 1/2 onion rounds up to a whole onion.
    expect(byId.onion.line).toBe("1 onion");
    // 1 tsp + 1 tsp = 2 tsp.
    expect(byId.cumin.line).toBe("2 tsp cumin");
  });

  it("leaves out optional ingredients and water, and assumes oil", () => {
    const list = buildShoppingList([{ slug: "bean-tacos", servings: 2 }], recipes, noPantry);
    const ids = list.items.map((i) => i.id);
    expect(ids).not.toContain("cheese");
    expect(ids).not.toContain("water");
    expect(list.items.find((i) => i.id === "oil")?.status).toBe("have");
  });

  it("marks pantry items as have, low items as buy-again, and totals only what to buy", () => {
    const list = buildShoppingList([{ slug: "bean-tacos", servings: 2 }], recipes, { have: ["canned-beans", "tortillas"], low: ["tortillas"] });
    const byId = Object.fromEntries(list.items.map((i) => [i.id, i]));
    expect(byId["black-beans"]).toMatchObject({ status: "have", packages: 0, cost: 0 });
    expect(byId.tortillas.status).toBe("low");
    expect(list.total).toBe(Math.round((byId.tortillas.cost + byId.onion.cost + byId.cumin.cost) * 100) / 100);
  });

  it("buys dry rice for cooked rice and does not scale frying oil", () => {
    const list = buildShoppingList([{ slug: "rice-bowl", servings: 6 }], recipes, noPantry);
    const byId = Object.fromEntries(list.items.map((i) => [i.id, i]));
    // 9 cooked cups is about 2 1/2 dry cups.
    expect(byId.rice.line).toBe("2 1/2 cups rice");
    expect(byId.oil.line).toBe("1/2 cup oil");
  });

  it("ignores meals whose recipe no longer exists", () => {
    expect(buildShoppingList([{ slug: "gone", servings: 2 }], recipes, noPantry).items).toEqual([]);
  });

  it("formats plain text without pantry or checked items", () => {
    const list = buildShoppingList([{ slug: "bean-tacos", servings: 2 }], recipes, noPantry);
    const text = shoppingListText(list, ["onion"]);
    expect(text).toContain("- 1 can black beans (1 × 15 oz can)");
    expect(text).not.toContain("onion");
    expect(text).not.toContain("oil");
  });
});

describe("formatShoppingLine", () => {
  it("joins mixed units", () => {
    expect(formatShoppingLine("canned-corn", [{ qty: 1, unit: "can" }, { qty: 0.5, unit: "cup" }])).toBe("1 can + 1/2 cup canned corn");
    expect(formatShoppingLine("eggs", [{ qty: 3 }])).toBe("3 eggs");
  });
});
