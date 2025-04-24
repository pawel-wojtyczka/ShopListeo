import type { Page } from "@playwright/test";

/**
 * Loguje użytkownika testowego do aplikacji
 * @param page - Instancja strony Playwright
 */
export async function loginUser(page: Page): Promise<void> {
  // Przejście do strony logowania
  await page.goto("/login");

  // Wypełnienie formularza logowania
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Hasło").fill("test123");

  // Kliknięcie przycisku logowania
  await page.getByRole("button", { name: "Zaloguj się" }).click();

  // Oczekiwanie na przekierowanie po zalogowaniu
  await page.waitForURL("/lists");
}

/**
 * Wylogowuje użytkownika z aplikacji
 * @param page - Instancja strony Playwright
 */
export async function logoutUser(page: Page): Promise<void> {
  // Kliknięcie przycisku wylogowania
  await page.getByRole("button", { name: "Wyloguj" }).click();

  // Oczekiwanie na przekierowanie po wylogowaniu
  await page.waitForURL("/login");
}

/**
 * Tworzy nowego użytkownika testowego
 * @param page - Instancja strony Playwright
 */
export async function createTestUser(page: Page): Promise<void> {
  // Przejście do strony rejestracji
  await page.goto("/register");

  // Wypełnienie formularza rejestracji
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Hasło").fill("test123");
  await page.getByLabel("Powtórz hasło").fill("test123");

  // Kliknięcie przycisku rejestracji
  await page.getByRole("button", { name: "Zarejestruj się" }).click();

  // Oczekiwanie na przekierowanie po rejestracji
  await page.waitForURL("/lists");
}

/**
 * Usuwa użytkownika testowego
 * @param page - Instancja strony Playwright
 */
export async function deleteTestUser(page: Page): Promise<void> {
  // Przejście do ustawień konta
  await page.goto("/settings");

  // Kliknięcie przycisku usuwania konta
  await page.getByRole("button", { name: "Usuń konto" }).click();

  // Potwierdzenie usunięcia konta
  await page.getByRole("button", { name: "Tak, usuń konto" }).click();

  // Oczekiwanie na przekierowanie po usunięciu konta
  await page.waitForURL("/login");
}
