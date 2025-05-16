import { test, expect, type Page } from "@playwright/test";
import { RegistrationPage } from "../../poms/RegistrationPage";

// Test suite for user registration functionality
test.describe("User Registration", () => {
  let registrationPage: RegistrationPage;

  // Before each test, navigate to the registration page
  test.beforeEach(async ({ page }: { page: Page }) => {
    registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
  });

  // After each test, wait for 3 seconds before closing the browser
  test.afterEach(async ({ page }: { page: Page }) => {
    await page.waitForTimeout(3000); // Wait for 3000 milliseconds (3 seconds)
  });

  // Test case for successful registration (Happy Path)
  test("should allow a user to register successfully with valid credentials", async ({ page }: { page: Page }) => {
    // Generate a unique email with timestamp and random digits
    const randomId = Math.random().toString(36).substring(7);
    const testEmail = `test-user-${randomId}@e2etest.shoplisteo.local`;
    const testPassword = "password123";

    // Log the email being used

    // Fill the registration form
    await registrationPage.fillEmail(testEmail);
    await registrationPage.fillPassword(testPassword);
    await registrationPage.fillConfirmPassword(testPassword);

    // Submit the form
    await registrationPage.submitForm();

    // Pause after submitting to investigate lack of redirect
    // console.log("Pausing after submitting successful form. Check why redirect didn't happen.");
    // await page.pause(); // Remove pause

    // Assertion: Check if the user is redirected to the expected page after successful registration
    await expect(page).toHaveURL("/auth/registration-pending"); // Expect redirection to registration pending page
    // Można też sprawdzić, czy pojawił się komunikat o sukcesie, jeśli taki istnieje:
    // await expect(page.locator('.success-message')).toBeVisible();
  });

  // Test case for attempting registration with an existing email
  test("should show an error message when registering with an existing email", async () => {
    const existingEmail = process.env.E2E_USERNAME; // Get existing email from .env.test
    const password = "SomePassword123";

    // Ensure the environment variable is loaded
    if (!existingEmail) {
      throw new Error("E2E_USERNAME environment variable is not set. Make sure to load .env.test");
    }

    // Fill the form with the existing email
    await registrationPage.fillEmail(existingEmail);
    await registrationPage.fillPassword(password);
    await registrationPage.fillConfirmPassword(password);

    // Submit the form
    await registrationPage.submitForm();

    // Pause after submitting to inspect the error message
    // console.log("Pausing after submitting existing email form. Check the page for the error message.");
    // await registrationPage.page.pause(); // Remove pause

    // Assertion: Check for the specific error message from the API
    // Use the exact error message provided by the user
    await registrationPage.expectErrorMessageToContain("Użytkownik z tym adresem email już istnieje.");
  });

  // Test case for attempting registration with an invalid email format
  test("should show an error message for invalid email format", async () => {
    // Fill the form with an invalid email
    await registrationPage.fillEmail("invalid-email-format");
    await registrationPage.fillPassword("SomePassword123"); // Fill other fields to allow submission attempt
    await registrationPage.fillConfirmPassword("SomePassword123");

    // Attempt to submit the form - this might be blocked by native validation
    await registrationPage.submitButton.click();

    // Assertion: Check the native browser validation message on the email input
    const emailInput = registrationPage.emailInput;
    // Get the validation message directly from the input element
    const validationMessage = await emailInput.evaluate((e) => (e as HTMLInputElement).validationMessage);

    // Expect the native validation message (adjust text based on browser if needed)
    // Using the text from the screenshot
    expect(validationMessage).toContain("Please include an '@' in the email address.");

    // Remove the old assertion that checked for Zod/custom message
    // await registrationPage.expectErrorMessageToContain("Nieprawidłowy format adresu email.");
  });

  // Test case for attempting registration with a short password
  test("should show an error message for a password that is too short", async () => {
    const shortPassword = "short";

    // Generate a unique email with timestamp and random digits
    const randomId = Math.random().toString(36).substring(7);
    const testEmail = `test-user-${randomId}@e2etest.shoplisteo.local`;

    // Fill the form
    await registrationPage.fillEmail(testEmail);
    await registrationPage.fillPassword(shortPassword);
    await registrationPage.fillConfirmPassword(shortPassword);

    // Submit the form
    await registrationPage.submitForm();

    // Assertion: Check for the validation error message
    // Update the expected error message to the correct Polish version
    await registrationPage.expectErrorMessageToContain("Hasło musi mieć minimum 8 znaków.");
  });

  // Test case for attempting registration with mismatching passwords
  test("should show an error message when passwords do not match", async () => {
    // Generate a unique email with timestamp and random digits
    const randomId = Math.random().toString(36).substring(7);
    const testEmail = `test-user-${randomId}@e2etest.shoplisteo.local`;

    // Fill the form with mismatching passwords
    await registrationPage.fillEmail(testEmail);
    await registrationPage.fillPassword("ValidPassword123");
    await registrationPage.fillConfirmPassword("DifferentPassword123");

    // Submit the form
    await registrationPage.submitForm();

    // Assertion: Check for the error message
    // Update the expected error message based on user feedback
    await registrationPage.expectErrorMessageToContain("Hasła nie są zgodne.");
  });

  // Test case for attempting registration with an empty form
  test("should show validation errors when submitting an empty form", async () => {
    // Do not fill any fields

    // Submit the form
    await registrationPage.submitForm();

    // Assertion: Check for specific validation error messages for empty fields
    // Instead of checking for a generic "required", check for the actual messages
    await expect(
      registrationPage.validationErrorMessages.filter({ hasText: "Nieprawidłowy format adresu email." })
    ).toBeVisible();
    await expect(
      registrationPage.validationErrorMessages.filter({ hasText: "Hasło musi mieć minimum 8 znaków." })
    ).toBeVisible();
    await expect(registrationPage.validationErrorMessages.filter({ hasText: "Potwierdź hasło." })).toBeVisible();
  });
});
