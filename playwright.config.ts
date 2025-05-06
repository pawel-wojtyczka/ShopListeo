import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the absolute path to the root .env file
const envPath = path.resolve(__dirname, "../.env"); // Zakładając, że playwright.config.ts jest w głównym katalogu

// Load environment variables from the absolute path
dotenv.config({ path: envPath });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e", // Katalog z testami E2E
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Force sequential execution by using only 1 worker */
  workers: 1, // Używaj tylko jednego workera
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000", // Ustaw bazowy URL

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Run tests in headed mode */
    headless: false, // Uruchamiaj w tle

    /* Slow down execution - moved here */
    launchOptions: {
      slowMo: 500, // Spowolnienie każdej akcji Playwright o 500ms
    },
  },

  /* Configure projects for major browsers */
  projects: [
    // Projekt setup (może być pusty lub zawierać global.setup.ts jeśli potrzebny)
    // Jest wymagany do zdefiniowania zależności i teardown
    {
      name: "setup",
      testMatch: /global\.setup\.ts/, // Wskaż plik setup, jeśli istnieje. Używamy podwójnego backslasha dla regexa w JS.
      teardown: "cleanup db", // Nazwa projektu teardown
    },
    // Projekt teardown
    {
      name: "cleanup db",
      testMatch: /global\.teardown\.ts/, // Wskaż plik teardown. Używamy podwójnego backslasha dla regexa w JS.
    },
    // Główny projekt testowy
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"], // Zależność od projektu setup
    },

    // Możesz odkomentować poniższe, aby testować na innych przeglądarkach
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Optional: Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000, // Zwiększ timeout, jeśli serwer startuje wolno
  //   stdout: 'pipe', // Przekieruj output serwera
  //   stderr: 'pipe',
  // },
});
