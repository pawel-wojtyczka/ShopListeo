import { test, expect, type Page } from "@playwright/test";
import { ShoppingListPage } from "../page-objects/ShoppingListPage";
import { ShoppingListDetailsPage } from "../page-objects/ShoppingListDetailsPage";

// Helper to format date as DD.MM.YYYY
const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

test.describe.serial("Shopping List Management (Authenticated)", () => {
  let page: Page;
  let shoppingListPage: ShoppingListPage;
  let shoppingListDetailsPage: ShoppingListDetailsPage;

  const MOCKED_DATE_STR = "2025-05-06T10:00:00.000Z";
  const MOCKED_DATE = new Date(MOCKED_DATE_STR);
  const expectedListNameDefault = `List zakupów ${formatDate(MOCKED_DATE)}`;
  const renamedListName = "Lista zakupów na weekend";

  // Products for Scenario 4 & 5
  const productsToAddRaw = "Kup chleb, mleko, kakao i jeszcze sporo jogurtów pitnych dla dzieci, bo jadar tego dużo";
  const expectedProducts = ["chleb", "mleko", "kakao", "k jogurtów pitnych dla dzieci"]; // Based on test plan
  const productToEdit = "k jogurtów pitnych dla dzieci";
  const editedProduct = "6 szt. jogurtów pitnych dla dzieci";
  const productToDelete = "mleko";

  test.beforeAll(async ({ browser }) => {
    // All tests in this suite share the same page context as they are serial and depend on each other state
    // This uses the authenticated state from 'setup-auth-state' project
    page = await browser.newPage();
    shoppingListPage = new ShoppingListPage(page);
    // Details page will be instantiated when needed or after navigating to a specific list
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("SCENARIO 2: should allow creating a new shopping list", async () => {
    await page.clock.setFixedTime(MOCKED_DATE); // Mock date for consistent list naming
    await shoppingListPage.navigate();
    await shoppingListPage.waitForLoadState("networkidle"); // Czekaj na ustabilizowanie się sieci

    // Ensure main page elements for authenticated user are visible
    await expect(shoppingListPage.newListButton).toBeVisible({ timeout: 10000 });

    await shoppingListPage.clickNewListButton();

    // The new list should automatically open its details page, or we might need to click it
    // For now, assume it navigates to a new list page URL, or the list appears on the main page.
    // The test plan says "A new shopping list item appears in the list of shopping lists."
    // And then scenario 3 clicks it.
    await expect(shoppingListPage.getShoppingListItemByName(expectedListNameDefault).first()).toBeVisible();
    // No need to restore clock, mock is scoped to this test or will be overridden/ended by context.
  });

  test("SCENARIO 3: should allow renaming a shopping list", async () => {
    await shoppingListPage.navigate(); // Go back to main list page if needed
    const listToRename = shoppingListPage.getShoppingListItemByName(expectedListNameDefault).first();
    await listToRename.click(); // Navigate to list details

    // Assuming clicking the list navigates to its details page
    // The URL might change, so instantiate/re-evaluate ShoppingListDetailsPage context
    // We need a way to get the list ID if the constructor of ShoppingListDetailsPage requires it
    // For now, assuming the page object handles the current page context correctly if URL changes.
    shoppingListDetailsPage = new ShoppingListDetailsPage(page);

    await shoppingListDetailsPage.setListName(renamedListName);
    await expect(shoppingListDetailsPage.listNameDisplay).toHaveValue(renamedListName); // Or toHaveText if it's not an input after saving

    await shoppingListPage.navigate(); // Go back to main list page
    await expect(shoppingListPage.getShoppingListItemByName(renamedListName).first()).toBeVisible();
    await expect(shoppingListPage.getShoppingListItemByName(expectedListNameDefault).first()).not.toBeVisible();
  });

  test("SCENARIO 4: should allow adding products to a shopping list", async () => {
    await shoppingListPage.navigate();
    await shoppingListPage.getShoppingListItemByName(renamedListName).first().click();
    shoppingListDetailsPage = new ShoppingListDetailsPage(page); // Re-instantiate for current page context

    await shoppingListDetailsPage.addProduct(productsToAddRaw);
    for (const product of expectedProducts) {
      await expect(shoppingListDetailsPage.getProductItemByName(product).first()).toBeVisible();
    }
  });

  test("SCENARIO 5: should allow editing a shopping list item", async () => {
    // Assumes page is still on the details of 'renamedListName' from previous test
    // If not, add navigation: await shoppingListPage.getShoppingListItemByName(renamedListName).first().click();
    // shoppingListDetailsPage = new ShoppingListDetailsPage(page);

    const productItem = shoppingListDetailsPage.getProductItemByName(productToEdit).first();
    // This assumes an inline edit or a modal. The POM needs to reflect the actual edit mechanism.
    // For simplicity, let's assume clicking edit button then filling an input shown for that item.
    await productItem.locator('[data-testid="edit-product-button"]').click();
    // Assume an input field appears with data-testid="edit-product-input" for that item
    await productItem.locator('input[type="text"]').fill(editedProduct); // A more specific selector is needed
    await productItem.locator('input[type="text"]').press("Enter"); // Or click a save button

    await expect(shoppingListDetailsPage.getProductItemByName(editedProduct).first()).toBeVisible();
    await expect(shoppingListDetailsPage.getProductItemByName(productToEdit).first()).not.toBeVisible();
  });

  test("SCENARIO 6: should allow deleting a shopping list item", async () => {
    // Assumes page is still on the details of 'renamedListName'
    const productItemToDelete = shoppingListDetailsPage.getProductItemByName(productToDelete).first();
    await productItemToDelete.locator('[data-testid="delete-product-button"]').click();
    // Handle confirmation dialog if any
    // await shoppingListDetailsPage.clickConfirmDeleteButton(); // If a general confirm button is used

    await expect(shoppingListDetailsPage.getProductItemByName(productToDelete).first()).not.toBeVisible();
  });

  test("SCENARIO 7: should allow deleting a shopping list", async () => {
    await shoppingListPage.navigate();
    const listToDelete = shoppingListPage.getShoppingListItemByName(renamedListName).first();
    await listToDelete.locator('[data-testid="delete-list-button"]').click();

    // Handle confirmation dialog
    // Assuming a general confirm button is used, defined in ShoppingListDetailsPage or BasePage
    // This might need a more specific POM if it's a unique dialog for list deletion.
    // For now, if ShoppingListDetailsPage.confirmDeleteButton is generic enough:
    if (shoppingListDetailsPage) {
      // check if instantiated
      await shoppingListDetailsPage.clickConfirmDeleteButton();
    } else {
      // Fallback or error if details page object not ready for confirm button
      // This implies the confirm button might be part of a global modal.
      // For now, let's assume a general confirm available after click
      await page.locator('[data-testid="confirm-delete-button"]').click();
    }

    await expect(shoppingListPage.getShoppingListItemByName(renamedListName).first()).not.toBeVisible();
  });

  // Hook to add delay after each test in this describe block
  test.afterEach(async () => {
    // `page` is available from the beforeAll hook context
    if (page) {
      await page.waitForTimeout(3000); // 3000 milliseconds = 3 seconds
    }
  });
});
