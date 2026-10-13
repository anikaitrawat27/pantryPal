import { describe, expect, it } from "vitest";
import type { RecipeSummary } from "@/lib/catalog";
import { EMPTY_FILTERS, filterRecipes, parseFilters, serializeFilters, type FilterState } from "@/lib/filter";
import { includesAll, matchPantry, searchIngredients } from "@/lib/match";

function summary(over: Partial<RecipeSummary> & Pick<RecipeSummary, "slug" | "ingredients">): RecipeSummary {
  return {
    title: over.slug,
    blurb: "A test recipe.",
    course: "main",
    meal: ["dinner"],
    cuisine: "american",
    equipment: ["stovetop"],
    difficulty: 1,
    serves: 2,
    totalMin: 20,
    diets: [],
    usesExtras: false,
    ...over,
  };
}

const friedRice = summary({
  slug: "fried-rice",
  title: "Fried Rice",
  cuisine: "chinese",
  ingredients: [{ id: "rice", qty: 1, unit: "cup" }, { id: "eggs", qty: 2 }, { id: "canned-peas", qty: 0.5, unit: "can" }, { id: "oil", qty: 1, unit: "tbsp" }, { id: "soy-sauce", qty: 1, unit: "tbsp", optional: true }],
});
const smoothie = summary({
  slug: "smoothie",
  title: "Berry Smoothie",
  course: "drink",
  meal: ["breakfast", "snack"],
  equipment: ["blender"],
  totalMin: 5,
  diets: ["vegetarian", "gluten-free"],
  ingredients: [{ id: "strawberries", qty: 1, unit: "cup" }, { id: "yogurt", qty: 0.5, unit: "cup" }, { id: "ice", qty: 1, unit: "handful" }],
});
const cheesyBeans = summary({
  slug: "cheesy-beans",
  title: "Cheesy Beans",
  cuisine: "mexican",
  equipment: ["microwave"],
  difficulty: 2,
  totalMin: 45,
  usesExtras: true,
  ingredients: [{ id: "black-beans", qty: 1, unit: "can" }, { id: "cheese", qty: 0.5, unit: "cup" }, { id: "cumin", qty: 1, unit: "tsp" }],
});
const ALL = [friedRice, smoothie, cheesyBeans];
const slugs = (f: Partial<FilterState>) => filterRecipes(ALL, { ...EMPTY_FILTERS, ...f }).map((r) => r.recipe.slug);

describe("searchIngredients", () => {
  it("ranks prefix matches first and searches aliases", () => {
    expect(searchIngredients("chee")[0].id).toBe("cheese");
    expect(searchIngredients("spaghetti")[0].id).toBe("pasta");
    expect(searchIngredients("garbanzo")[0].id).toBe("chickpeas");
  });

  it("never suggests water or ice", () => {
    expect(searchIngredients("ice").map((i) => i.id)).not.toContain("ice");
  });

  it("returns nothing for blank input", () => {
    expect(searchIngredients("  ")).toEqual([]);
  });
});

describe("includesAll", () => {
  it("matches generic searches to specific ingredients and back", () => {
    expect(includesAll(cheesyBeans.ingredients, ["canned-beans"])).toBe(true);
    expect(includesAll(cheesyBeans.ingredients, ["cheddar"])).toBe(true);
    expect(includesAll(cheesyBeans.ingredients, ["kidney-beans"])).toBe(false);
  });
});

describe("matchPantry", () => {
  it("counts salt, pepper, oil, water, and ice as on hand and skips optional items", () => {
    expect(matchPantry(friedRice.ingredients, ["rice", "eggs", "canned-peas"])).toEqual({ missing: [], swaps: [], used: 3 });
  });

  it("covers a missing item with a swap the cook can make", () => {
    const m = matchPantry(friedRice.ingredients, ["rice", "eggs", "canned-corn"]);
    expect(m.missing).toEqual([]);
    expect(m.swaps).toEqual([{ from: "canned-peas", to: "canned-corn" }]);
  });

  it("reports what is missing", () => {
    expect(matchPantry(friedRice.ingredients, ["rice"]).missing).toEqual(["eggs", "canned-peas"]);
  });
});

describe("filterRecipes", () => {
  it("returns everything alphabetically with no filters", () => {
    expect(slugs({})).toEqual(["smoothie", "cheesy-beans", "fried-rice"]);
  });

  it("filters each facet", () => {
    expect(slugs({ courses: ["drink"] })).toEqual(["smoothie"]);
    expect(slugs({ meals: ["breakfast"] })).toEqual(["smoothie"]);
    expect(slugs({ cuisines: ["mexican"] })).toEqual(["cheesy-beans"]);
    expect(slugs({ diets: ["vegetarian", "gluten-free"] })).toEqual(["smoothie"]);
    expect(slugs({ tools: ["microwave"] })).toEqual(["cheesy-beans"]);
    expect(slugs({ maxTime: 20 })).toEqual(["smoothie", "fried-rice"]);
    expect(slugs({ maxLevel: 1 })).toEqual(["smoothie", "fried-rice"]);
    expect(slugs({ noExtras: true })).toEqual(["smoothie", "fried-rice"]);
  });

  it("treats no-cook recipes as fitting any tool set", () => {
    const salad = summary({ slug: "salad", equipment: ["no-cook"], ingredients: [{ id: "lettuce", qty: 1 }] });
    expect(filterRecipes([salad], { ...EMPTY_FILTERS, tools: ["microwave"] })).toHaveLength(1);
  });

  it("searches titles and ingredient aliases with every word", () => {
    expect(slugs({ q: "fried" })).toEqual(["fried-rice"]);
    expect(slugs({ q: "garbanzo" })).toEqual([]);
    expect(slugs({ q: "beans cheese" })).toEqual(["cheesy-beans"]);
  });

  it("combines facets", () => {
    expect(slugs({ maxTime: 30, courses: ["main"] })).toEqual(["fried-rice"]);
  });

  it("ranks 'only' mode by missing count and hides recipes that use none of the items", () => {
    const res = filterRecipes(ALL, { ...EMPTY_FILTERS, have: ["rice", "eggs", "strawberries"], haveMode: "only" });
    expect(res.map((r) => [r.recipe.slug, r.match!.missing.length])).toEqual([
      ["fried-rice", 1],
      ["smoothie", 1],
    ]);
  });

  it("'includes' mode requires every item", () => {
    expect(slugs({ have: ["rice", "eggs"] })).toEqual(["fried-rice"]);
    expect(slugs({ have: ["rice", "yogurt"] })).toEqual([]);
  });
});

describe("URL round trip", () => {
  it("serializes and parses back to the same state", () => {
    const state: FilterState = {
      q: "rice",
      courses: ["main", "soup"],
      meals: ["dinner"],
      cuisines: ["chinese"],
      diets: ["vegan"],
      tools: ["stovetop", "microwave"],
      maxTime: 30,
      maxLevel: 2,
      noExtras: true,
      have: ["rice", "eggs"],
      haveMode: "only",
    };
    expect(parseFilters(serializeFilters(state))).toEqual(state);
  });

  it("drops unknown or malformed values", () => {
    const f = parseFilters(new URLSearchParams("course=main,nope&time=abc&level=9&have=rice,unicorn&mode=weird"));
    expect(f).toMatchObject({ courses: ["main"], maxTime: undefined, maxLevel: undefined, have: ["rice"], haveMode: "includes" });
  });

  it("serializes the empty state to an empty query", () => {
    expect(serializeFilters(EMPTY_FILTERS).toString()).toBe("");
  });
});
