import { type Page, type Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ShoppingListDetailsPage extends BasePage {
  readonly listNameInput: Locator;
  readonly listNameDisplay: Locator; // For displaying the list name/title
  readonly addProductInput: Locator;
  readonly addProductButton: Locator;
  readonly productItems: Locator; // Selector for all product items in the list
  readonly confirmDeleteButton: Locator; // General confirm button, e.g. in a dialog

  constructor(page: Page, listId?: string) {
    // The URL might be dynamic, e.g., /list/[id] or /shopping-lists/[id]
    // If listId is provided, navigate directly. Otherwise, assume page is already on details page.
    super(page, listId ? `/list/${listId}` : page.url());
    // TODO: Adjust the base URL path if your route is different, e.g., /shopping-lists/

    this.listNameInput = page.locator('[data-testid="shopping-list-name-input"]');
    this.listNameDisplay = page.locator('[data-testid="shopping-list-title"]'); // Title on details page
    this.addProductInput = page.locator('[data-testid="add-product-input"]');
    this.addProductButton = page.locator('[data-testid="add-product-button"]');
    this.productItems = page.locator('[data-testid^="product-item-"]'); // e.g., data-testid="product-item-PRODUCT_ID"
    this.confirmDeleteButton = page.locator('[data-testid="confirm-delete-button"]');
  }

  async setListName(name: string): Promise<void> {
    await this.listNameInput.fill(name);
    // Assuming pressing Enter or Tab, or an explicit save button might be needed
    await this.listNameInput.press("Enter"); // Or blur, or click a save button
  }

  async addProduct(productText: string): Promise<void> {
    await this.addProductInput.fill(productText);
    await this.addProductButton.click();
  }

  getProductItemByName(name: string): Locator {
    return this.productItems.filter({ hasText: name });
  }

  getEditButtonForProduct(productName: string): Locator {
    return this.getProductItemByName(productName).locator('[data-testid="edit-product-button"]');
  }

  getDeleteButtonForProduct(productName: string): Locator {
    return this.getProductItemByName(productName).locator('[data-testid="delete-product-button"]');
  }

  async clickConfirmDeleteButton(): Promise<void> {
    await this.confirmDeleteButton.click();
  }

  // Method to navigate to a specific list's details page if not already there
  // This might be better placed in ShoppingListPage or as a static method if listId is known
  async navigateToList(listId: string): Promise<void> {
    await this.page.goto(`/list/${listId}`); // TODO: Adjust path as needed
    await this.waitForLoadState();
  }
}
