import { expect, test, type Page } from "@playwright/test";

const PASSWORD = "e2e test passphrase";
const unique = () => `cook_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;

async function signUp(page: Page, username: string): Promise<string[]> {
  await page.goto("/signup");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  const codeCells = page.getByTestId("recovery-codes").locator("code");
  await expect(codeCells).toHaveCount(8);
  const codes = (await codeCells.allTextContents()).map((c) => c.trim());
  expect(codes).toHaveLength(8);
  await expect(page.getByRole("button", { name: "Continue" })).toBeDisabled();
  await page.getByLabel("I saved my recovery codes").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/pantry$/);
  await expect(page.getByTestId("account-link")).toHaveText(username);
  return codes;
}

async function logIn(page: Page, username: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByTestId("account-link")).toHaveText(username);
}

test("guest data merges into a new account and syncs to another device", async ({ page, browser }) => {
  // As a guest, save something.
  await page.goto("/pantry");
  await page.getByRole("button", { name: "milk", exact: true }).click();

  const username = unique();
  await signUp(page, username);
  await expect(page.getByRole("button", { name: "milk", exact: true })).toHaveAttribute("aria-pressed", "true");

  // Signed in: a change saves to the account.
  const saved = page.waitForResponse((r) => r.url().endsWith("/api/me/pantry") && r.status() === 204);
  await page.getByRole("button", { name: "rice", exact: true }).click();
  await saved;

  // A second device sees both items after signing in.
  const other = await browser.newContext();
  const page2 = await other.newPage();
  await logIn(page2, username);
  await page2.goto("/pantry");
  await expect(page2.getByRole("button", { name: "milk", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page2.getByRole("button", { name: "rice", exact: true })).toHaveAttribute("aria-pressed", "true");
  await other.close();
});

test("signing out clears this device's copy", async ({ page }) => {
  await signUp(page, unique());
  await page.getByRole("button", { name: "egg", exact: true }).click();
  await page.waitForResponse((r) => r.url().endsWith("/api/me/pantry"));
  await page.getByTestId("account-link").click();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await page.goto("/pantry");
  await expect(page.getByRole("button", { name: "egg", exact: true })).toHaveAttribute("aria-pressed", "false");
});

test("wrong passwords get one message; a recovery code resets the password and signs out other devices", async ({
  page,
  browser,
}) => {
  const username = unique();
  const codes = await signUp(page, username);

  const other = await browser.newContext();
  const page2 = await other.newPage();
  await page2.goto("/login");
  await page2.getByLabel("Username").fill(username);
  await page2.getByLabel("Password").fill("not the password");
  await page2.getByRole("button", { name: "Sign in" }).click();
  await expect(page2.getByRole("alert").filter({ hasText: "Wrong username or password." })).toBeVisible();

  await page2.goto("/reset");
  await page2.getByLabel("Username").fill(username);
  await page2.getByLabel("Recovery code").fill(codes[3].toUpperCase());
  await page2.getByLabel("New password").fill("a different passphrase");
  await page2.getByRole("button", { name: "Reset your password" }).click();
  await expect(page2.getByRole("status")).toHaveText("Password changed. You have 7 recovery codes left.");

  // The first device's session was ended by the reset.
  await page.reload();
  await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  await logIn(page, username, "a different passphrase");
  await other.close();
});

test("account page regenerates codes and deletes the account", async ({ page }) => {
  const username = unique();
  await signUp(page, username);
  await page.goto("/account");
  await expect(page.getByText("8 of 8 recovery codes left.")).toBeVisible();

  await page.getByRole("button", { name: "Make new recovery codes" }).click();
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Make new recovery codes" }).click();
  await expect(page.getByTestId("recovery-codes").locator("code")).toHaveCount(8);
  await page.getByLabel("I saved my recovery codes").check();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByRole("button", { name: "Delete my account" }).click();
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Delete my account" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Wrong username or password." })).toBeVisible();
});

test("Spanish account pages", async ({ page }) => {
  await page.goto("/es/signup");
  await page.getByLabel("Nombre de usuario").fill("x");
  await page.getByLabel("Contraseña").fill("corta");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByText("Use de 3 a 24 letras, números, - o _.")).toBeVisible();
  await expect(page.getByText("Use al menos 10 caracteres.")).toBeVisible();
});
