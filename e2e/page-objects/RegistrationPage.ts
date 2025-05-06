import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class RegistrationPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly signUpButton: Locator;
  readonly loginLink: Locator; // Link to login page, as per test plan

  constructor(page: Page) {
    super(page, "/register"); // URL path for the registration page

    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.confirmPasswordInput = page.locator('[data-testid="confirm-password-input"]');
    this.signUpButton = page.locator('[data-testid="signup-button"]');
    this.loginLink = page.locator('[data-testid="login-link"]');
  }

  async register(email: string, password: string, confirmPassword?: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    // Confirm password might not always be needed if it's the same as password, but good to have flexibility
    if (confirmPassword !== undefined) {
      await this.confirmPasswordInput.fill(confirmPassword);
    } else {
      await this.confirmPasswordInput.fill(password); // Default to filling with password if not provided
    }
    await this.signUpButton.click();
  }

  async clickLoginLink(): Promise<void> {
    await this.loginLink.click();
  }
}
