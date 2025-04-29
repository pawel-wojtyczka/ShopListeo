# Test info

- Name: User Registration >> should show validation errors when submitting an empty form
- Location: /home/sendix/projects/ShopListeo/tests/e2e/auth/registration.spec.ts:137:3

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('p.text-destructive').filter({ hasText: 'Nieprawidłowy format adresu email.' })
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('p.text-destructive').filter({ hasText: 'Nieprawidłowy format adresu email.' })

    at /home/sendix/projects/ShopListeo/tests/e2e/auth/registration.spec.ts:147:7
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
  142 |
  143 |     // Assertion: Check for specific validation error messages for empty fields
  144 |     // Instead of checking for a generic "required", check for the actual messages
  145 |     await expect(
  146 |       registrationPage.validationErrorMessages.filter({ hasText: "Nieprawidłowy format adresu email." })
> 147 |     ).toBeVisible();
      |       ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  148 |     await expect(
  149 |       registrationPage.validationErrorMessages.filter({ hasText: "Hasło musi mieć minimum 8 znaków." })
  150 |     ).toBeVisible();
  151 |     await expect(registrationPage.validationErrorMessages.filter({ hasText: "Potwierdź hasło." })).toBeVisible();
  152 |   });
  153 | });
  154 |
```