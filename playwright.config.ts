import { defineConfig, devices } from "@playwright/test";

/**
 * Konfiguracja Playwright dla testów e2e
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Katalog z testami
  testDir: "./src/__tests__/e2e",

  // Maksymalny czas wykonywania pojedynczego testu
  timeout: 30000,

  // Oczekiwanie na zakończenie wszystkich asercji
  expect: {
    timeout: 5000,
  },

  // Wyłącz równoległe wykonywanie testów dla lepszej przewidywalności
  workers: 1,

  // Reporter
  reporter: [["html"], ["json", { outputFile: "playwright-report/test-results.json" }]],

  // Współdzielone ustawienia dla wszystkich projektów
  use: {
    // Przechwytywanie zrzutów ekranu tylko dla niepowodzeń
    screenshot: "only-on-failure",

    // Nagrywanie wideo tylko dla niepowodzeń
    video: "retain-on-failure",

    // Przechwytuj ślad dla każdego testu
    trace: "retain-on-failure",

    // Ustawienia dla kontekstu przeglądarki
    baseURL: "http://localhost:4321",

    // Oczekiwanie na załadowanie strony
    actionTimeout: 5000,
  },

  // Projekty testowe - używamy tylko Chromium zgodnie z wymaganiami
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Uruchomienie lokalnego serwera przed testami
  webServer: {
    command: "npm run dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },

  // Katalogi z artefaktami testów
  outputDir: "test-results/",
  snapshotDir: "__snapshots__",
});
