import { expect, test } from "@playwright/test";

test("GET /api/recipes filters and paginates over HTTP", async ({ request }) => {
  const res = await request.get("/api/recipes?course=drink&limit=5");
  expect(res.status()).toBe(200);
  expect(res.headers()["cache-control"]).toContain("s-maxage");
  const body = await res.json();
  expect(body.data).toHaveLength(5);
  expect(body.data.every((r: { course: string }) => r.course === "drink")).toBe(true);

  const next = await request.get(`/api/recipes?course=drink&limit=5&cursor=${body.nextCursor}`);
  const page2 = await next.json();
  expect(page2.data[0].slug).not.toBe(body.data[0].slug);
});

test("GET /api/recipes/{slug} scales, swaps, and translates", async ({ request }) => {
  const res = await request.get("/api/recipes/creamy-tomato-soup?servings=2&lang=es&swap=oil:butter");
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.servings).toBe(2);
  expect(body.ingredients.find((i: { id: string }) => i.id === "milk").line).toBe("1/2 taza de leche");
  expect(body.ingredients.find((i: { id: string }) => i.id === "butter").swappedFrom).toBe("oil");
});

test("API errors use one JSON shape", async ({ request }) => {
  const missing = await request.get("/api/recipes/nope");
  expect(missing.status()).toBe(404);
  expect((await missing.json()).error.code).toBe("not_found");

  const bad = await request.post("/api/shopping-list", { data: { meals: [{ slug: "biryani", servings: 0 }] } });
  expect(bad.status()).toBe(400);
  expect((await bad.json()).error.fields).toHaveProperty(["meals.0.servings"]);
});

test("the shopping list page loads its data from the API", async ({ page }) => {
  await page.goto("/recipes/creamy-tomato-soup");
  await page.getByRole("button", { name: "Add to plan" }).click();
  await page.getByRole("button", { name: "Add 4 servings" }).click();

  const response = page.waitForResponse(
    (r) => r.url().endsWith("/api/shopping-list") && r.request().method() === "POST",
  );
  await page.goto("/plan/shopping");
  expect((await response).status()).toBe(200);
  await expect(page.getByText("1 cup milk")).toBeVisible();
});
