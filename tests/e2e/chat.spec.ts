import { expect, test, type Page } from "@playwright/test";

async function signUp(page: Page) {
  const username = `chat_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
  await page.goto("/signup");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill("chat test passphrase");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByTestId("recovery-codes").locator("code")).toHaveCount(8);
  await page.getByLabel("I saved my recovery codes").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByTestId("account-link")).toHaveText(username);
}

test("guests are asked to sign in", async ({ page }) => {
  await page.goto("/chat");
  await expect(page.getByText("Sign in to use the kitchen helper.")).toBeVisible();
});

test("a question streams a reply with recipe cards, and the chat reloads the same way", async ({ page }) => {
  await signUp(page);
  await page.goto("/chat");
  await page.getByLabel("Message").fill("What can I make with chickpeas?");
  await page.getByLabel("Message").press("Enter");

  await expect(page.getByText("Here are a few good options for you.")).toBeVisible();
  await expect(page.getByText(/Searching recipes/)).toBeVisible();
  const cards = page.locator("a[href^='/recipes/']").filter({ hasText: "min" });
  await expect(cards).toHaveCount(3);
  await expect(page).toHaveURL(/\/chat\?c=/);

  await page.reload();
  const thread = page.getByRole("region", { name: "Kitchen helper" });
  await expect(thread.getByText("What can I make with chickpeas?")).toBeVisible();
  await expect(page.getByText("Here are a few good options for you.")).toBeVisible();
  await expect(cards).toHaveCount(3);
  await expect(page.getByRole("link", { name: "What can I make with chickpeas?" })).toBeVisible();
});

test("a generated recipe passes validation, can be saved, and opens in My recipes", async ({ page }) => {
  await signUp(page);
  await page.goto("/chat");
  await page.getByRole("button", { name: "Write me a recipe with chickpeas, rice, and tomato" }).click();

  await expect(page.getByRole("heading", { name: "Chickpea Tomato Skillet" })).toBeVisible();
  await expect(page.getByText("Checked: pantry ingredients only, no oven")).toBeVisible();
  await page.getByRole("button", { name: "Save to my recipes" }).click();
  await expect(page.getByRole("button", { name: "Saved to my recipes" })).toBeVisible();

  await page.goto("/my-recipes");
  await page.getByRole("link", { name: /Chickpea Tomato Skillet/ }).click();
  await expect(page.getByTestId("ing-chickpeas")).toHaveText("1 can chickpeas");
  await page.getByRole("button", { name: "More servings" }).click();
  await page.getByRole("button", { name: "More servings" }).click();
  await expect(page.getByTestId("ing-chickpeas")).toHaveText("2 cans chickpeas");
  await expect(page.getByRole("button", { name: "Add to plan" })).toHaveCount(0);
});
