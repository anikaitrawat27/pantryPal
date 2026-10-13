import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "list" : [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // Stands in for the Anthropic API so chat tests run offline and free.
      command: "npx tsx tests/e2e/mock-anthropic.ts",
      url: "http://localhost:3199/health",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npx next build && npx next start -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      timeout: 300_000,
      reuseExistingServer: !process.env.CI,
      env: {
        NEXT_DIST_DIR: ".next-e2e",
        PGLITE_DIR: "memory://",
        ANTHROPIC_BASE_URL: "http://localhost:3199",
        ANTHROPIC_API_KEY: "test-key-for-mock-server",
      },
    },
  ],
});
