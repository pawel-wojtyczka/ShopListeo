import { test, expect } from "@playwright/test";
import { ShoppingListPage } from "../page-objects/ShoppingListPage";
import { LoginPage } from "../page-objects/LoginPage";
import { ShoppingListDetailsPage } from "../page-objects/ShoppingListDetailsPage";

test.describe("Shopping List Management - Authenticated", () => {
  test("SCENARIO 1: Create a new shopping list", async ({ page, baseURL }) => {
    const loginPage = new LoginPage(page);
    const shoppingListPage = new ShoppingListPage(page);
    const shoppingListDetailsPage = new ShoppingListDetailsPage(page);

    const username = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!username || !password) {
      throw new Error("E2E_USERNAME and E2E_PASSWORD environment variables must be set.");
    }

    await loginPage.navigate();
    await loginPage.login(username, password);

    await expect(page).not.toHaveURL(loginPage.url, { timeout: 10000 });
    await expect(shoppingListPage.newListButton).toBeVisible({ timeout: 10000 });

    await shoppingListPage.waitForLoadState("domcontentloaded");
    await shoppingListPage.clickNewListButton();

    if (!baseURL) {
      throw new Error("baseURL is not defined in Playwright config or passed to the test.");
    }
    await shoppingListDetailsPage.expectToBeOnListViewPage(baseURL);

    await shoppingListDetailsPage.expectListNameToStartWith("Lista zakupów");
  });

  // Tutaj można dodać implementacje kolejnych scenariuszy (TEST_SCENARIO_2, itd.)
  // np. test("SCENARIO 2: Rename a shopping list", async ({ page }) => { /* ... */ });
});
