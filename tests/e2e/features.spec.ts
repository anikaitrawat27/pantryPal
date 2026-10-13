import { expect, test } from "@playwright/test";

test("adding a recipe to the plan builds a shopping list", async ({ page }) => {
  await page.goto("/recipes/creamy-tomato-soup");
  await page.getByRole("button", { name: "Add to plan" }).click();
  await page.getByLabel("Day").selectOption({ label: "Wednesday" });
  await page.getByLabel("Meal").selectOption({ label: "Dinner" });
  await page.getByRole("button", { name: "Add 4 servings" }).click();
  await expect(page.getByText("Added Creamy Tomato Soup to Wednesday (dinner).")).toBeVisible();

  await page.goto("/plan");
  const slot = page.getByRole("region", { name: "Wednesday (dinner)" });
  await expect(slot.getByRole("link", { name: "Creamy Tomato Soup" })).toBeVisible();

  // Doubling the servings doubles the shopping amounts.
  await slot.getByRole("button", { name: "More servings of Creamy Tomato Soup" }).click();
  await slot.getByRole("button", { name: "More servings of Creamy Tomato Soup" }).click();
  await page.getByRole("link", { name: "Shopping list" }).click();
  await expect(page.getByText("3 cans tomato puree")).toBeVisible();
  await expect(page.getByText("1 1/2 cups milk")).toBeVisible();

  // Checking an item off persists.
  await page.getByRole("checkbox", { name: /milk/ }).check();
  await page.reload();
  await expect(page.getByRole("checkbox", { name: /milk/ })).toBeChecked();
});

test("tap to place moves a recipe between slots", async ({ page }) => {
  await page.goto("/plan");
  await page.getByRole("button", { name: /Chinese Fried Rice/ }).click();
  await page.getByRole("button", { name: "Place in Monday (lunch)" }).click();
  const monday = page.getByRole("region", { name: "Monday (lunch)" });
  await expect(monday.getByRole("link", { name: "Chinese Fried Rice" })).toBeVisible();

  await monday.getByRole("button", { name: "Move Chinese Fried Rice", exact: true }).click();
  await page.getByRole("button", { name: "Place in Friday (dinner)" }).click();
  await expect(monday.getByRole("link", { name: "Chinese Fried Rice" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Friday (dinner)" }).getByRole("link", { name: "Chinese Fried Rice" })).toBeVisible();
});

test("the saved pantry marks what each recipe is missing", async ({ page }) => {
  await page.goto("/pantry");
  for (const name of ["tomato puree", "chicken broth", "milk"]) {
    await page.getByRole("button", { name, exact: true }).click();
  }
  await expect(page.getByText("3 items saved")).toBeVisible();

  await page.goto("/recipes?q=creamy%20tomato");
  const card = page.getByRole("article").filter({ hasText: "Creamy Tomato Soup" });
  await expect(card.getByText("You have everything")).toBeVisible();

  await page.goto("/recipes/creamy-tomato-soup");
  await expect(page.getByText("in your pantry").first()).toBeVisible();
});

test("cook mode steps through a recipe and runs a timer", async ({ page }) => {
  await page.goto("/recipes/creamy-tomato-soup");
  await page.getByRole("button", { name: "Start cooking" }).click();
  const dialog = page.getByRole("dialog", { name: "Cooking Creamy Tomato Soup" });
  await expect(dialog.getByText("Step 1 of 6")).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByText("Step 2 of 6")).toBeVisible();
  await dialog.getByRole("button", { name: "Start timer: 10:00" }).click();
  await expect(dialog.getByRole("button", { name: "Timer running" })).toBeDisabled();
  await expect(dialog.getByRole("list", { name: "Timers" })).toContainText(/9:5\d/);

  await dialog.getByRole("button", { name: "Exit" }).click();
  await expect(dialog).toHaveCount(0);
});

test("Spanish pages translate recipes, amounts, and the interface", async ({ page }) => {
  await page.goto("/es/recipes/creamy-tomato-soup");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("tomate");
  await expect(page.getByTestId("ing-milk")).toHaveText("1 taza de leche");
  await expect(page.getByRole("button", { name: "Empezar a cocinar" })).toBeVisible();

  await page.getByRole("link", { name: "View in English" }).click();
  await expect(page).toHaveURL(/\/recipes\/creamy-tomato-soup$/);
  await expect(page.getByTestId("ing-milk")).toHaveText("1 cup milk");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("Spanish ingredient search finds English ingredients", async ({ page }) => {
  await page.goto("/es/recipes");
  const input = page.getByRole("combobox", { name: "¿Qué hay en su despensa?" });
  await input.fill("frijoles negros");
  await input.press("Enter");
  await expect(page).toHaveURL(/have=black-beans/);
  await expect(page.getByRole("button", { name: "Quitar frijoles negros" })).toBeVisible();
});
