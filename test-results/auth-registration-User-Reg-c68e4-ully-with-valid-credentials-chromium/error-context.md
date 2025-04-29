# Test info

- Name: User Registration >> should allow a user to register successfully with valid credentials
- Location: /home/sendix/projects/ShopListeo/tests/e2e/auth/registration.spec.ts:20:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)

Locator: locator(':root')
Expected string: "http://localhost:3000/"
Received string: "http://localhost:3000/register?email=test-user-0v9rk%40e2etest.shoplisteo.local&password=password123&confirmPassword=password123"
Call log:
  - expect.toHaveURL with timeout 5000ms
  - waiting for locator(':root')
    9 × locator resolved to <html lang="pl" class="h-full">…</html>
      - unexpected value "http://localhost:3000/register?email=test-user-0v9rk%40e2etest.shoplisteo.local&password=password123&confirmPassword=password123"

    at /home/sendix/projects/ShopListeo/tests/e2e/auth/registration.spec.ts:41:24
```

# Page snapshot

```yaml
- main:
  - heading "Utwórz konto" [level=1]
  - text: Email
  - textbox "Email"
  - text: Hasło
  - textbox "Hasło"
  - text: Potwierdź hasło
  - textbox "Potwierdź hasło"
  - button "Zarejestruj się"
  - paragraph:
    - text: Masz już konto?
    - link "Zaloguj się":
      - /url: /login
- text: Zarejestruj się
```

# Test source

```ts
   1 | import { test, expect, type Page } from "@playwright/test";
   2 | import { RegistrationPage } from "../../poms/RegistrationPage";
   3 |
   4 | // Test suite for user registration functionality
   5 | test.describe("User Registration", () => {
   6 |   let registrationPage: RegistrationPage;
   7 |
   8 |   // Before each test, navigate to the registration page
   9 |   test.beforeEach(async ({ page }: { page: Page }) => {
   10 |     registrationPage = new RegistrationPage(page);
   11 |     await registrationPage.goto();
   12 |   });
   13 |
   14 |   // After each test, wait for 3 seconds before closing the browser
   15 |   test.afterEach(async ({ page }: { page: Page }) => {
   16 |     await page.waitForTimeout(3000); // Wait for 3000 milliseconds (3 seconds)
   17 |   });
   18 |
   19 |   // Test case for successful registration (Happy Path)
   20 |   test("should allow a user to register successfully with valid credentials", async ({ page }: { page: Page }) => {
   21 |     // Generate a unique email with timestamp and random digits
   22 |     const randomId = Math.random().toString(36).substring(7);
   23 |     const testEmail = `test-user-${randomId}@e2etest.shoplisteo.local`;
   24 |     const testPassword = "password123";
   25 |
   26 |     // Log the email being used
   27 |
   28 |     // Fill the registration form
   29 |     await registrationPage.fillEmail(testEmail);
   30 |     await registrationPage.fillPassword(testPassword);
   31 |     await registrationPage.fillConfirmPassword(testPassword);
   32 |
   33 |     // Submit the form
   34 |     await registrationPage.submitForm();
   35 |
   36 |     // Pause after submitting to investigate lack of redirect
   37 |     // console.log("Pausing after submitting successful form. Check why redirect didn't happen.");
   38 |     // await page.pause(); // Remove pause
   39 |
   40 |     // Assertion: Check if the user is redirected to the expected page after successful registration
>  41 |     await expect(page).toHaveURL("/"); // Expect redirection to the homepage
      |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveURL(expected)
   42 |     // Można też sprawdzić, czy pojawił się komunikat o sukcesie, jeśli taki istnieje:
   43 |     // await expect(page.locator('.success-message')).toBeVisible();
   44 |   });
   45 |
   46 |   // Test case for attempting registration with an existing email
   47 |   test("should show an error message when registering with an existing email", async () => {
   48 |     const existingEmail = process.env.E2E_USERNAME; // Get existing email from .env.test
   49 |     const password = "SomePassword123";
   50 |
   51 |     // Ensure the environment variable is loaded
   52 |     if (!existingEmail) {
   53 |       throw new Error("E2E_USERNAME environment variable is not set. Make sure to load .env.test");
   54 |     }
   55 |
   56 |     // Fill the form with the existing email
   57 |     await registrationPage.fillEmail(existingEmail);
   58 |     await registrationPage.fillPassword(password);
   59 |     await registrationPage.fillConfirmPassword(password);
   60 |
   61 |     // Submit the form
   62 |     await registrationPage.submitForm();
   63 |
   64 |     // Pause after submitting to inspect the error message
   65 |     // console.log("Pausing after submitting existing email form. Check the page for the error message.");
   66 |     // await registrationPage.page.pause(); // Remove pause
   67 |
   68 |     // Assertion: Check for the specific error message from the API
   69 |     // Use the exact error message provided by the user
   70 |     await registrationPage.expectErrorMessageToContain("Użytkownik z tym adresem email już istnieje.");
   71 |   });
   72 |
   73 |   // Test case for attempting registration with an invalid email format
   74 |   test("should show an error message for invalid email format", async () => {
   75 |     // Fill the form with an invalid email
   76 |     await registrationPage.fillEmail("invalid-email-format");
   77 |     await registrationPage.fillPassword("SomePassword123"); // Fill other fields to allow submission attempt
   78 |     await registrationPage.fillConfirmPassword("SomePassword123");
   79 |
   80 |     // Attempt to submit the form - this might be blocked by native validation
   81 |     await registrationPage.submitButton.click();
   82 |
   83 |     // Assertion: Check the native browser validation message on the email input
   84 |     const emailInput = registrationPage.emailInput;
   85 |     // Get the validation message directly from the input element
   86 |     const validationMessage = await emailInput.evaluate((e) => (e as HTMLInputElement).validationMessage);
   87 |
   88 |     // Expect the native validation message (adjust text based on browser if needed)
   89 |     // Using the text from the screenshot
   90 |     expect(validationMessage).toContain("Please include an '@' in the email address.");
   91 |
   92 |     // Remove the old assertion that checked for Zod/custom message
   93 |     // await registrationPage.expectErrorMessageToContain("Nieprawidłowy format adresu email.");
   94 |   });
   95 |
   96 |   // Test case for attempting registration with a short password
   97 |   test("should show an error message for a password that is too short", async () => {
   98 |     const shortPassword = "short";
   99 |
  100 |     // Generate a unique email with timestamp and random digits
  101 |     const randomId = Math.random().toString(36).substring(7);
  102 |     const testEmail = `test-user-${randomId}@e2etest.shoplisteo.local`;
  103 |
  104 |     // Fill the form
  105 |     await registrationPage.fillEmail(testEmail);
  106 |     await registrationPage.fillPassword(shortPassword);
  107 |     await registrationPage.fillConfirmPassword(shortPassword);
  108 |
  109 |     // Submit the form
  110 |     await registrationPage.submitForm();
  111 |
  112 |     // Assertion: Check for the validation error message
  113 |     // Update the expected error message to the correct Polish version
  114 |     await registrationPage.expectErrorMessageToContain("Hasło musi mieć minimum 8 znaków.");
  115 |   });
  116 |
  117 |   // Test case for attempting registration with mismatching passwords
  118 |   test("should show an error message when passwords do not match", async () => {
  119 |     // Generate a unique email with timestamp and random digits
  120 |     const randomId = Math.random().toString(36).substring(7);
  121 |     const testEmail = `test-user-${randomId}@e2etest.shoplisteo.local`;
  122 |
  123 |     // Fill the form with mismatching passwords
  124 |     await registrationPage.fillEmail(testEmail);
  125 |     await registrationPage.fillPassword("ValidPassword123");
  126 |     await registrationPage.fillConfirmPassword("DifferentPassword123");
  127 |
  128 |     // Submit the form
  129 |     await registrationPage.submitForm();
  130 |
  131 |     // Assertion: Check for the error message
  132 |     // Update the expected error message based on user feedback
  133 |     await registrationPage.expectErrorMessageToContain("Hasła nie są zgodne.");
  134 |   });
  135 |
  136 |   // Test case for attempting registration with an empty form
  137 |   test("should show validation errors when submitting an empty form", async () => {
  138 |     // Do not fill any fields
  139 |
  140 |     // Submit the form
  141 |     await registrationPage.submitForm();
```