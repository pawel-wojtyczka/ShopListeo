import { test, expect, type Page } from "@playwright/test";
import { ShoppingListPage } from "../page-objects/ShoppingListPage";
import { LoginPage } from "../page-objects/LoginPage";

test.describe("Authentication - Sign Out (Authenticated)", () => {
  let page: Page;
  let shoppingListPage: ShoppingListPage;
  let loginPage: LoginPage;

  test.beforeAll(async ({ browser }) => {
    // This uses the authenticated state from 'setup-auth-state' project
    page = await browser.newPage();
    shoppingListPage = new ShoppingListPage(page);
    loginPage = new LoginPage(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("SCENARIO 8: should allow a logged-in user to sign out", async () => {
    await shoppingListPage.navigate(); // Navigate to a page where sign out is available
    await shoppingListPage.waitForLoadState("networkidle"); // Czekaj na ustabilizowanie się sieci

    // Verify user is on the main page and essential elements are visible
    await expect(shoppingListPage.newListButton).toBeVisible({ timeout: 10000 }); // Wskaźnik, że strona list jest załadowana

    // Verify user is initially logged in (e.g., sign out button is visible)
    // This could also be checking for user email display if that component is robust
    await expect(shoppingListPage.signOutButton).toBeVisible();

    await shoppingListPage.clickSignOutButton();

    // Wait for redirection to the login page
    await loginPage.waitForLoadState("domcontentloaded"); // Wait for login page elements to be ready
    await expect(page).toHaveURL(new RegExp(`^${loginPage.url}(\\?.*)?$`), { timeout: 10000 });

    // Verify that elements specific to logged-out state are present
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.registerLink).toBeVisible();
  });

  // Hook to add delay after each test in this describe block
  test.afterEach(async () => {
    // `page` is available from the beforeAll hook context
    if (page) {
      await page.waitForTimeout(3000); // 3000 milliseconds = 3 seconds
    }
  });
});
