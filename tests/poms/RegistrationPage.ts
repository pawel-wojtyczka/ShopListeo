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
  readonly apiErrorAlert: Locator; // Alert dla błędów API (cały kontener)
  readonly apiErrorDescription: Locator; // Dokładny element z opisem błędu API
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
    // Bardziej bezpośredni selektor dla opisu błędu API
    this.apiErrorDescription = page.locator('[data-slot="alert-description"]');
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
    // Czekaj na pojawienie się *jakiegokolwiek* błędu (API lub walidacji)
    const apiErrorLocator = this.apiErrorDescription; // Użyj precyzyjnego lokatora opisu
    const validationErrorLocator = this.validationErrorMessages.filter({ hasText: expectedText });

    // Czekaj, aż jeden z typów błędów będzie widoczny
    await expect(apiErrorLocator.or(validationErrorLocator)).toBeVisible({ timeout: 10000 }); // Dłuższy timeout dla pewności

    // Sprawdź, który typ błędu się pojawił
    if (await apiErrorLocator.isVisible()) {
      // Jeśli to błąd API, sprawdź jego treść
      await expect(apiErrorLocator).toHaveText(expectedText);
    } else {
      // Jeśli to błąd walidacji, jego widoczność została już sprawdzona przez expect(or(...)).toBeVisible()
      // Można dodać dodatkową asercję, jeśli potrzeba, ale filter({ hasText: ... }) już to robi
      await expect(validationErrorLocator).toBeVisible(); // Potwierdzenie widoczności
    }
  }
}
