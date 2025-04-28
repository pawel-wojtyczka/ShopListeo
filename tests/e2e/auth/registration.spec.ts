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

  // Test case for successful registration (Happy Path)
  test.only("should allow a user to register successfully with valid credentials", async ({ page }: { page: Page }) => {
    // Get the email template from environment variables
    const emailTemplate = process.env.E2E_EMAIL_TO_TEST;

    // Ensure the environment variable is loaded
    if (!emailTemplate) {
      throw new Error("E2E_EMAIL_TO_TEST environment variable is not set. Make sure to load .env.test");
    }

    // Generate a timestamp and replace the placeholder in the email template
    const timestamp = Date.now();
    const uniqueEmail = emailTemplate.replace("<timestamp>", timestamp.toString());

    // Log the email being used
    console.log(`Attempting registration with email: ${uniqueEmail}`);

    const password = "ValidPassword123"; // Use a valid password

    // Fill the registration form
    await registrationPage.fillEmail(uniqueEmail);
    await registrationPage.fillPassword(password);
    await registrationPage.fillConfirmPassword(password);

    // Submit the form
    await registrationPage.submitForm();

    // Assertion: Check if the user is redirected to the expected page after successful registration
    // Adjust the URL or success indicator based on your application's flow
    await expect(page).toHaveURL("/"); // Expect redirection to the homepage
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

    // Assertion: Check for the specific error message
    // Dostosuj tekst błędu do komunikatu wyświetlanego przez Twoją aplikację
    await registrationPage.expectErrorMessageToContain("Email already exists");
  });

  // Test case for attempting registration with an invalid email format
  test("should show an error message for invalid email format", async () => {
    // Fill the form with an invalid email
    await registrationPage.fillEmail("invalid-email-format");
    await registrationPage.fillPassword("SomePassword123");
    await registrationPage.fillConfirmPassword("SomePassword123");

    // Submit the form
    await registrationPage.submitForm();

    // Assertion: Check for the validation error message
    // Dostosuj tekst błędu do komunikatu walidacji w Twojej aplikacji
    await registrationPage.expectErrorMessageToContain("Invalid email format");
  });

  // Test case for attempting registration with a short password
  test("should show an error message for a password that is too short", async () => {
    const shortPassword = "short";

    // Fill the form
    await registrationPage.fillEmail(`test_${Date.now()}@example.com`);
    await registrationPage.fillPassword(shortPassword);
    await registrationPage.fillConfirmPassword(shortPassword);

    // Submit the form
    await registrationPage.submitForm();

    // Assertion: Check for the validation error message
    // Dostosuj tekst błędu do komunikatu walidacji w Twojej aplikacji
    await registrationPage.expectErrorMessageToContain("Password must be at least 8 characters long"); // Przykładowy komunikat
  });

  // Test case for attempting registration with mismatching passwords
  test("should show an error message when passwords do not match", async () => {
    // Fill the form with mismatching passwords
    await registrationPage.fillEmail(`test_${Date.now()}@example.com`);
    await registrationPage.fillPassword("ValidPassword123");
    await registrationPage.fillConfirmPassword("DifferentPassword123");

    // Submit the form
    await registrationPage.submitForm();

    // Assertion: Check for the error message
    // Dostosuj tekst błędu do komunikatu w Twojej aplikacji
    await registrationPage.expectErrorMessageToContain("Passwords do not match");
  });

  // Test case for attempting registration with an empty form
  test("should show validation errors when submitting an empty form", async () => {
    // Do not fill any fields

    // Submit the form
    await registrationPage.submitForm();

    // Assertion: Check for multiple validation error messages or a general error
    // To zależy od implementacji - może być jeden ogólny błąd lub błędy przy każdym polu.
    // Poniżej przykład sprawdzania ogólnego błędu.
    // Dostosuj tekst błędu do komunikatu w Twojej aplikacji
    await registrationPage.expectErrorMessageToContain("required"); // Sprawdź, czy pojawia się słowo "required" lub inny wskaźnik błędu walidacji
    // Można też dodać bardziej szczegółowe asercje dla każdego pola, jeśli są osobne komunikaty błędów
    // await expect(registrationPage.emailInput.locator(' + .error-message')).toBeVisible(); // Przykład
  });
});
