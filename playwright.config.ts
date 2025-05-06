import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Construct the absolute path to the root .env file
const envPath = path.resolve(__dirname, ".env"); // Poprawiona ścieżka do .env

// Load environment variables from the absolute path
dotenv.config({ path: envPath });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Force sequential execution by using only 1 worker */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  globalTeardown: "./e2e/global.teardown.ts", // Path to global teardown script

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://127.0.0.1:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Global headless setting - tests will override if needed */
    headless: false,

    /* Slow down execution - moved here */
    launchOptions: {
      slowMo: process.env.CI ? 0 : 250, // Slower locally for observation, faster on CI
    },

    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup-auth-state", // Renamed for clarity - runs registration and saves state
      testMatch: /authentication\.noauth\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "authenticated-tests",
      testMatch: /.*\.auth\.spec\.ts/,
      dependencies: ["setup-auth-state"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "./e2e/.auth/user.json", // Use saved authentication state
      },
    },
    // Legacy setup project, can be removed if not used for other .setup.ts files
    // {
    //   name: "setup",
    //   testMatch: /.*\.setup\.ts/,
    // },

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
