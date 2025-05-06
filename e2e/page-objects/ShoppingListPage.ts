import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ShoppingListPage extends BasePage {
  readonly newListButton: Locator;
  readonly shoppingListItems: Locator;
  readonly userEmailDisplay: Locator; // For verifying user identity, as per scenario 1
  readonly signOutButton: Locator;

  constructor(page: Page) {
    super(page, "/"); // URL path for the main shopping lists page

    this.newListButton = page.locator('[data-testid="new-list-button"]');
    // Selector for individual list items - assuming each has a data-testid or a common parent
    // This might need refinement based on actual HTML structure
    this.shoppingListItems = page.locator('[data-testid^="shopping-list-item-"]'); // Example: data-testid="shopping-list-item-LIST_ID"
    this.userEmailDisplay = page.locator('[data-testid="user-email-display"]');
    this.signOutButton = page.locator('[data-testid="sign-out-button"]');
  }

  async clickNewListButton(): Promise<void> {
    await this.newListButton.click();
  }

  getShoppingListItemByName(name: string): Locator {
    // Assuming the list name is directly visible and can be used for locating
    // This might need adjustment if list items are complex components
    return this.page.locator('[data-testid^="shopping-list-item-"]', { hasText: name });
  }

  getShoppingListItemTitle(name: string): Locator {
    return this.page.locator('[data-testid="shopping-list-title"]_DLA_LISTY_O_NAZWIE_' + name); // TODO: Adjust selector
  }

  getDeleteButtonForList(listName: string): Locator {
    // Assuming a structure like: <div data-testid="shopping-list-item-XYZ"><button data-testid="delete-list-button">...</button></div>
    return this.getShoppingListItemByName(listName).locator('[data-testid="delete-list-button"]');
  }

  async clickSignOutButton(): Promise<void> {
    await this.signOutButton.click();
  }
}
