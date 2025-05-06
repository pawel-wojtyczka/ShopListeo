import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page, "/login"); // Zakładamy, że strona logowania jest pod "/login"

    // Używamy selektorów opartych na roli i nazwie, zgodnie z sugestiami Playwright Inspectora
    this.emailInput = page.getByRole("textbox", { name: "Email" });
    this.passwordInput = page.getByRole("textbox", { name: "Hasło" });
    this.loginButton = page.getByRole("button", { name: "Zaloguj się" });
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectToBeOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(this.url);
    await expect(this.loginButton).toBeVisible();
  }
}
