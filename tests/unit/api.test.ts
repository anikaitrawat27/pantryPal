import { describe, expect, it } from "vitest";
import { GET as getRecipe } from "@/app/api/recipes/[slug]/route";
import { GET as searchRecipes } from "@/app/api/recipes/route";
import { POST as postShoppingList } from "@/app/api/shopping-list/route";
import { encodeCursor } from "@/lib/api/params";
import { RECIPES } from "@/lib/catalog";

const BASE = "http://localhost/api";

async function search(query: string) {
  const res = await searchRecipes(new Request(`${BASE}/recipes?${query}`));
  return { status: res.status, headers: res.headers, body: await res.json() };
}

async function detail(slug: string, query = "") {
  const res = await getRecipe(new Request(`${BASE}/recipes/${slug}?${query}`), { params: Promise.resolve({ slug }) });
  return { status: res.status, body: await res.json() };
}

async function shopping(body: unknown) {
  const res = await postShoppingList(
    new Request(`${BASE}/shopping-list`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
  return { status: res.status, headers: res.headers, body: await res.json() };
}

describe("GET /api/recipes", () => {
  it("returns the first page of every recipe with a cursor and cache headers", async () => {
    const { status, headers, body } = await search("");
    expect(status).toBe(200);
    expect(headers.get("cache-control")).toContain("s-maxage");
    expect(body.total).toBe(RECIPES.length);
    expect(body.data).toHaveLength(20);
    expect(body.nextCursor).toBe(encodeCursor(20));
    expect(body.data[0]).toMatchObject({ slug: expect.any(String), url: expect.stringMatching(/^\/recipes\//) });
  });

  it("pages through every result exactly once", async () => {
    const seen = new Set<string>();
    let cursor: string | null = "";
    while (cursor !== null) {
      const { body } = await search(`limit=50${cursor ? `&cursor=${cursor}` : ""}`);
      for (const r of body.data) seen.add(r.slug);
      cursor = body.nextCursor;
    }
    expect(seen.size).toBe(RECIPES.length);
  });

  it("filters, sorts, and localizes", async () => {
    const { body } = await search("course=soup&diet=vegan&maxTime=60&sort=cost&lang=es&limit=50");
    expect(body.total).toBeGreaterThan(0);
    for (const r of body.data) {
      expect(r.course).toBe("soup");
      expect(r.diets).toContain("vegan");
      expect(r.totalMinutes).toBeLessThanOrEqual(60);
      expect(r.url).toMatch(/^\/es\/recipes\//);
    }
    const costs = body.data.map((r: { costPerServingUsd: number }) => r.costPerServingUsd);
    expect(costs).toEqual([...costs].sort((a, b) => a - b));
  });

  it("returns pantry matches in 'only' mode", async () => {
    const { body } = await search("have=rice,eggs,canned-peas&mode=only");
    expect(body.data[0].pantryMatch).toEqual({ missing: expect.any(Array), swaps: expect.any(Array) });
    expect(body.data.map((r: { slug: string }) => r.slug)).toContain("chinese-fried-rice");
  });

  it("rejects unknown values, unknown parameters, and bad cursors with field errors", async () => {
    const bad = await search("course=brunch&maxTime=0&have=unicorn&limit=500");
    expect(bad.status).toBe(400);
    expect(bad.body.error.code).toBe("invalid_request");
    expect(Object.keys(bad.body.error.fields)).toEqual(
      expect.arrayContaining(["course.0", "maxTime", "have.0", "limit"]),
    );

    expect((await search("color=blue")).status).toBe(400);
    const cursor = await search("cursor=nonsense");
    expect(cursor.body.error.fields).toEqual({ cursor: "Not a valid cursor." });
  });
});

describe("GET /api/recipes/{slug}", () => {
  it("scales amounts to the requested servings", async () => {
    const { status, body } = await detail("creamy-tomato-soup", "servings=6");
    expect(status).toBe(200);
    expect(body.servings).toBe(6);
    expect(body.baseServings).toBe(4);
    expect(body.ingredients.find((i: { id: string }) => i.id === "milk")).toMatchObject({
      line: "1 1/2 cups milk",
      quantity: 1.5,
      unit: "cup",
    });
    expect(body.totalCostUsd).toBeCloseTo(body.costPerServingUsd * 6, 2);
  });

  it("applies swaps and recomputes diets and cost", async () => {
    const plain = await detail("creamy-tomato-soup");
    const swapped = await detail("creamy-tomato-soup", "swap=chicken-broth:water");
    expect(plain.body.diets).not.toContain("vegetarian");
    expect(swapped.body.diets).toContain("vegetarian");
    const water = swapped.body.ingredients.find((i: { id: string }) => i.id === "water");
    expect(water).toMatchObject({ swappedFrom: "chicken-broth", swapOptions: [] });
    expect(swapped.body.costPerServingUsd).toBeLessThan(plain.body.costPerServingUsd);
  });

  it("returns Spanish text and amounts", async () => {
    const { body } = await detail("creamy-tomato-soup", "lang=es");
    expect(body.ingredients.find((i: { id: string }) => i.id === "milk").line).toBe("1 taza de leche");
    expect(body.url).toBe("/es/recipes/creamy-tomato-soup");
  });

  it("404s for unknown recipes and 400s for invalid swaps and servings", async () => {
    expect((await detail("not-a-recipe")).status).toBe(404);
    const badSwap = await detail("creamy-tomato-soup", "swap=butter:oil&swap=chicken-broth:honey");
    expect(badSwap.status).toBe(400);
    expect(badSwap.body.error.fields).toEqual({
      "swap.0": 'This recipe does not use "butter".',
      "swap.1": '"honey" is not a swap for "chicken-broth" in this recipe.',
    });
    expect((await detail("creamy-tomato-soup", "servings=7")).status).toBe(400);
    expect((await detail("creamy-tomato-soup", "swap=nope")).status).toBe(400);
  });
});

describe("POST /api/shopping-list", () => {
  it("combines meals, scales them, and is never cached", async () => {
    const { status, headers, body } = await shopping({
      meals: [
        { slug: "creamy-tomato-soup", servings: 4 },
        { slug: "creamy-tomato-soup", servings: 2 },
      ],
    });
    expect(status).toBe(200);
    expect(headers.get("cache-control")).toBe("no-store");
    const milk = body.items.find((i: { id: string }) => i.id === "milk");
    expect(milk).toMatchObject({
      line: "1 1/2 cups milk",
      status: "buy",
      packages: 1,
      recipes: ["Creamy Tomato Soup"],
    });
    expect(body.totalUsd).toBeGreaterThan(0);
    expect(body.text).toContain("- 1 1/2 cups milk");
  });

  it("respects the pantry, checked items, and language", async () => {
    const { body } = await shopping({
      meals: [{ slug: "creamy-tomato-soup", servings: 4 }],
      pantry: { have: ["milk"], low: [] },
      checked: ["chicken-broth"],
      lang: "es",
    });
    expect(body.items.find((i: { id: string }) => i.id === "milk")).toMatchObject({ status: "have", costUsd: 0 });
    expect(body.items.find((i: { id: string }) => i.id === "chicken-broth").checked).toBe(true);
    expect(body.text).not.toContain("caldo");
    expect(body.items.find((i: { id: string }) => i.id === "tomato-puree").packageLabel).toBe("lata de 15 oz");
  });

  it("returns field errors for invalid bodies", async () => {
    const bad = await shopping({ meals: [{ slug: "nope", servings: 9 }], pantry: { have: ["unicorn"] }, extra: 1 });
    expect(bad.status).toBe(400);
    expect(Object.keys(bad.body.error.fields)).toEqual(
      expect.arrayContaining(["meals.0.slug", "meals.0.servings", "pantry.have.0", "(root)"]),
    );
  });

  it("rejects malformed JSON and oversized plans", async () => {
    expect((await shopping("{not json")).body.error.message).toBe("Request body must be valid JSON.");
    const many = await shopping({ meals: Array.from({ length: 61 }, () => ({ slug: "biryani", servings: 1 })) });
    expect(many.body.error.fields).toEqual({ meals: "At most 60 meals" });
  });
});

describe("handle()", () => {
  it("turns unexpected errors into a logged, generic 500", async () => {
    const { handle } = await import("@/lib/api/http");
    const { vi } = await import("vitest");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handle("TEST", async () => {
      throw new Error("database exploded");
    })();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: { code: "internal_error", message: "Something went wrong." } });
    expect(JSON.parse(log.mock.calls[0][0] as string)).toMatchObject({
      level: "error",
      route: "TEST",
      message: "database exploded",
    });
    log.mockRestore();
  });
});

describe("OpenAPI description", () => {
  it("documents exactly the parameters the endpoints accept", async () => {
    const { OPENAPI } = await import("@/lib/api/openapi");
    const { SEARCH_PARAMS } = await import("@/lib/api/search");
    const { DETAIL_PARAMS } = await import("@/lib/api/recipe-detail");
    const names = (path: "/api/recipes" | "/api/recipes/{slug}") =>
      (OPENAPI.paths[path].get.parameters as readonly { name: string; in: string }[])
        .filter((p) => p.in === "query")
        .map((p) => p.name)
        .sort();
    expect(names("/api/recipes")).toEqual([...SEARCH_PARAMS].sort());
    expect(names("/api/recipes/{slug}")).toEqual([...DETAIL_PARAMS].sort());
  });

  it("documents the shopping-list body fields the endpoint accepts", async () => {
    const { OPENAPI } = await import("@/lib/api/openapi");
    const { shoppingListBodySchema } = await import("@/lib/api/shopping-list");
    const documented = Object.keys(
      OPENAPI.paths["/api/shopping-list"].post.requestBody.content["application/json"].schema.properties,
    ).sort();
    expect(documented).toEqual(Object.keys(shoppingListBodySchema.shape).sort());
  });

  it("is served as JSON", async () => {
    const { GET } = await import("@/app/api/openapi.json/route");
    const res = GET();
    expect(res.status).toBe(200);
    expect((await res.json()).openapi).toBe("3.1.0");
  });
});
