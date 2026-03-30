import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.test", quiet: true });

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3001";
const webServerEnv = Object.fromEntries(
  Object.entries(process.env).filter((entry): entry is [string, string] => {
    const [, value] = entry;
    return value !== undefined;
  }),
);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  globalSetup: "./tests/setup/playwright.global-setup.ts",
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  use: {
    baseURL,
    screenshot: process.env.CI ? "only-on-failure" : "off",
    trace: "on-first-retry",
    video: process.env.CI ? "retain-on-failure" : "off",
  },
  webServer: {
    command: "pnpm exec next dev --port 3001",
    env: webServerEnv,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: baseURL,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
