import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/LoginPage";
import { RegistrationPage } from "../page-objects/RegistrationPage";

// Odczytanie wzorca emaila ze zmiennej środowiskowej
const emailPattern = process.env.E2E_EMAIL_TO_TEST || "test_<timestamp>@e2etest.shoplisteo.local";
const timestamp = Date.now();
const TEST_USER_EMAIL = emailPattern.replace("<timestamp>", timestamp.toString());
const TEST_USER_PASSWORD = "Password123!";

// Test suite for authentication (non-authenticated scenarios)
test.describe("Authentication - No Auth", () => {
  test("should allow a new user to register", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const registrationPage = new RegistrationPage(page);

    // 1. Navigate to /login
    await loginPage.navigate();
    await loginPage.waitForLoadState();

    // 2. Click the "No account? Register" link.
    await loginPage.clickRegisterLink();
    await registrationPage.waitForLoadState(); // Wait for registration page to load
    expect(page.url()).toContain("/register");

    // 3. Enter email address
    // 4. Enter password
    // 5. Enter confirm password
    // 6. Click "Sign up" button.
    await registrationPage.register(TEST_USER_EMAIL, TEST_USER_PASSWORD);
    await page.waitForURL("/"); // Wait for redirection to the main page

    // Expected Outcomes / Assertions:
    // - User is redirected to the main shopping list page (127.0.0.1:3000).
    expect(page.url()).toBe("http://127.0.0.1:3000/"); // Assuming 3000 is the dev server port for Astro, adjust if different

    // - A welcome message or user profile indicator (e.g., the user's email) is displayed on the shopping list page.
    // For this, we need a selector on the main page that displays user information.
    // Let's assume there's a [data-testid="user-email-display"]
    // This selector will need to be added to the main page's layout or relevant component.
    // For now, we will check for the presence of the email in the page content as a simpler assertion.
    // This might need refinement once the main page structure is known.
    const userEmailDisplay = page.locator(`text=${TEST_USER_EMAIL}`);
    await expect(userEmailDisplay).toBeVisible();

    // TODO: Add a more robust selector for user profile indicator once available
    // e.g. await expect(page.locator('[data-testid="user-email-display"]')).toHaveText(TEST_USER_EMAIL);

    // Add a delay before closing the browser (e.g., 5 seconds)
    await page.waitForTimeout(5000); // 5000 milliseconds = 5 seconds
  });
});
