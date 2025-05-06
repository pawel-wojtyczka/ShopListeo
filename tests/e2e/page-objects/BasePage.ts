import { type Page } from "@playwright/test";

export abstract class BasePage {
  readonly page: Page;
  readonly url: string; // Ścieżka względna, np. "/login" lub "/"

  // Przykładowy wspólny element - zakomentowany, aby uniknąć błędów, jeśli nie istnieje
  // readonly userMenu: Locator;

  constructor(page: Page, url: string) {
    this.page = page;
    this.url = url;
    // Jeśli posiadasz globalny element menu użytkownika, możesz go tutaj zainicjalizować
    // this.userMenu = page.locator('[data-testid="user-menu-button"]');
  }

  async navigate(): Promise<void> {
    // Zakłada, że baseURL jest skonfigurowany w playwright.config.ts
    // i this.url jest ścieżką (np. "/" dla strony głównej)
    await this.page.goto(this.url);
  }

  async waitForLoadState(state: "load" | "domcontentloaded" | "networkidle" = "networkidle"): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  // Tutaj można dodać inne wspólne metody, np. logout, etc.
}
