import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage"; // Import z tego samego katalogu page-objects

export class ShoppingListPage extends BasePage {
  readonly newListButton: Locator;
  // Selektor dla elementu listy zakupów, który zawiera jej nazwę.
  // Upewnij się, że w aplikacji używasz data-testid="shopping-list-item-name" dla nazw list.
  readonly shoppingListItemNameSelector = '[data-testid="shopping-list-item-name"]';

  constructor(page: Page) {
    // Zakładamy, że główna strona list zakupów jest dostępna pod ścieżką "/" (względem baseURL)
    super(page, "/");
    // Aktualizujemy selektor dla przycisku "Nowa Lista" na podstawie sugestii Inspectora
    this.newListButton = page.getByRole("button", { name: "Nowa lista" });
  }

  async clickNewListButton(): Promise<void> {
    await this.newListButton.click();
  }

  async getShoppingListItemByName(name: string): Promise<Locator> {
    // Zwraca lokator do elementu listy, który wyświetla konkretną nazwę.
    // Używamy :text-is() dla dokładnego dopasowania tekstu nazwy listy.
    return this.page.locator(`${this.shoppingListItemNameSelector}:text-is("${name}")`);
  }

  async expectListToExist(name: string, timeout = 10000): Promise<void> {
    const listLocator = await this.getShoppingListItemByName(name);
    // Oczekujemy, że pierwszy znaleziony element z daną nazwą będzie widoczny.
    await expect(listLocator.first()).toBeVisible({ timeout });
  }
}
