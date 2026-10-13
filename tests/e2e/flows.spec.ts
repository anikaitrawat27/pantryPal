import { expect, test } from "@playwright/test";
import { RECIPES, toSummary } from "../../src/lib/catalog";
import { EMPTY_FILTERS, filterRecipes } from "../../src/lib/filter";

test("home pantry search lists recipes that use those ingredients", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("combobox", { name: "What's in your pantry?" });
  await input.fill("rice, eggs, peas");
  await input.press("Enter");
  await expect(page.getByRole("button", { name: "Remove rice" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove egg" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove canned peas" })).toBeVisible();
  await page.getByRole("button", { name: "Show me what I can make" }).click();

  await expect(page).toHaveURL(/\/recipes\?have=rice%2Ceggs%2Ccanned-peas&mode=only/);
  await expect(page.getByRole("heading", { name: "Chinese Fried Rice" })).toBeVisible();
});

test("changing servings rescales ingredient amounts", async ({ page }) => {
  await page.goto("/recipes/creamy-tomato-soup");
  await expect(page.getByTestId("servings")).toHaveText("4 servings");
  await expect(page.getByTestId("ing-milk")).toHaveText("1 cup milk");

  await page.getByRole("button", { name: "More servings" }).click();
  await page.getByRole("button", { name: "More servings" }).click();
  await expect(page.getByTestId("servings")).toHaveText("6 servings");
  await expect(page.getByTestId("ing-milk")).toHaveText("1 1/2 cups milk");
  await expect(page.getByRole("button", { name: "More servings" })).toBeDisabled();

  for (let i = 0; i < 5; i++) await page.getByRole("button", { name: "Fewer servings" }).click();
  await expect(page.getByTestId("servings")).toHaveText("1 serving");
  await expect(page.getByTestId("ing-milk")).toHaveText("1/4 cup milk");
  await expect(page.getByRole("button", { name: "Fewer servings" })).toBeDisabled();
});

test("swapping an ingredient rewrites the line and can be undone", async ({ page }) => {
  await page.goto("/recipes/creamy-tomato-soup");
  const oil = page.getByTestId("ing-oil");
  await expect(oil).toContainText("oil");
  await page.getByRole("listitem").filter({ has: oil }).getByRole("button", { name: "swap" }).click();
  await page.getByRole("button", { name: /Use butter/ }).click();
  await expect(oil).toContainText("butter");
  await expect(page.getByTestId("swap-reminder")).toHaveText("Use butter wherever the steps say oil.");

  await page.getByRole("button", { name: "undo swap" }).click();
  await expect(oil).toContainText("oil");
  await expect(page.getByTestId("swap-reminder")).toHaveCount(0);
});

test("filters match the expected recipe count and live in the URL", async ({ page }) => {
  const expected = filterRecipes(RECIPES.map((r) => toSummary(r)), {
    ...EMPTY_FILTERS,
    diets: ["vegan"],
    tools: ["microwave"],
    noExtras: true,
  }).length;

  await page.goto("/recipes");
  await page.getByRole("button", { name: "Vegan", exact: true }).click();
  await page.getByRole("button", { name: "Microwave", exact: true }).click();
  // The checkbox reflects the URL, so it flips once the router has updated.
  const basics = page.getByLabel(/Pantry basics only/);
  await basics.click();
  await expect(basics).toBeChecked();

  await expect(page).toHaveURL(/diet=vegan/);
  await expect(page).toHaveURL(/tools=microwave/);
  await expect(page).toHaveURL(/noextras=1/);
  await expect(page.getByTestId("result-count")).toHaveText(`${expected} ${expected === 1 ? "recipe" : "recipes"}`);

  await page.reload();
  await expect(page.getByTestId("result-count")).toHaveText(`${expected} ${expected === 1 ? "recipe" : "recipes"}`);
});

test("favorites persist across reloads", async ({ page }) => {
  await page.goto("/recipes/creamy-tomato-soup");
  await page.getByRole("button", { name: "Save Creamy Tomato Soup to favorites" }).click();
  await expect(page.getByRole("button", { name: "Remove Creamy Tomato Soup from favorites" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("button", { name: "Remove Creamy Tomato Soup from favorites" })).toBeVisible();

  await page.goto("/favorites");
  await expect(page.getByRole("heading", { name: "Creamy Tomato Soup" })).toBeVisible();
});

test("unknown recipe shows the not-found page", async ({ page }) => {
  const res = await page.goto("/recipes/not-a-real-recipe");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "This shelf is empty" })).toBeVisible();
});
