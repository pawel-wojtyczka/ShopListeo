import { type Locator, type Page, expect } from "@playwright/test";

/**
 * Represents the Registration Page.
 * Provides methods to interact with the registration form elements.
 */
export class RegistrationPage {
  // Strona (Page) i Lokatory (Locators)
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  // Lokatory dla błędów
  readonly apiErrorAlert: Locator; // Alert dla błędów API
  readonly validationErrorMessages: Locator; // Ogólny selektor dla błędów walidacji pól

  /**
   * Konstruktor klasy RegistrationPage.
   * @param page - Instancja strony Playwright.
   */
  constructor(page: Page) {
    this.page = page;
    // Używamy ID jako bardziej stabilnych selektorów
    this.emailInput = page.locator('input[id="email"]');
    this.passwordInput = page.locator('input[id="password"]');
    this.confirmPasswordInput = page.locator('input[id="confirmPassword"]');
    this.submitButton = page.locator('button[type="submit"]');

    // Selektory dla komunikatów błędów
    this.apiErrorAlert = page.locator('[role="alert"][class*="variant-destructive"]'); // Celuje w alert destrukywny
    this.validationErrorMessages = page.locator("p.text-destructive"); // Celuje w paragrafy z błędami walidacji
  }

  /**
   * Nawiguje do strony rejestracji.
   */
  async goto() {
    await this.page.goto("/register"); // Ścieżka do strony rejestracji
  }

  /**
   * Wypełnia pole adresu e-mail.
   * @param email - Adres e-mail do wprowadzenia.
   */
  async fillEmail(email: string) {
    await this.emailInput.waitFor({ state: "visible", timeout: 5000 }); // Wait for field
    await this.emailInput.fill(email);
  }

  /**
   * Wypełnia pole hasła.
   * @param password - Hasło do wprowadzenia.
   */
  async fillPassword(password: string) {
    await this.passwordInput.waitFor({ state: "visible", timeout: 5000 }); // Wait for field
    await this.passwordInput.fill(password);
  }

  /**
   * Wypełnia pole potwierdzenia hasła.
   * @param password - Hasło do wprowadzenia w polu potwierdzenia.
   */
  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.waitFor({ state: "visible", timeout: 5000 }); // Wait for field
    await this.confirmPasswordInput.fill(password);
  }

  /**
   * Klika przycisk wysłania formularza rejestracji.
   */
  async submitForm() {
    await this.submitButton.click();
  }

  /**
   * Asersja sprawdzająca, czy widoczny jest komunikat błędu (API lub walidacji)
   * zawierający oczekiwany tekst.
   * @param expectedText - Oczekiwany fragment tekstu w komunikacie błędu.
   */
  async expectErrorMessageToContain(expectedText: string) {
    // Sprawdź najpierw błąd API
    const apiErrorVisible = await this.apiErrorAlert.isVisible();
    if (apiErrorVisible) {
      await expect(this.apiErrorAlert).toContainText(expectedText);
    } else {
      // Jeśli nie ma błędu API, sprawdź błędy walidacji
      // Sprawdź, czy *którykolwiek* z błędów walidacji zawiera tekst
      await expect(this.validationErrorMessages.filter({ hasText: expectedText })).toBeVisible();
    }
  }
}
