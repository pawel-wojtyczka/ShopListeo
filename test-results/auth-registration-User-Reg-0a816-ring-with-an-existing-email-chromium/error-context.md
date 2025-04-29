# Test info

- Name: User Registration >> should show an error message when registering with an existing email
- Location: /home/sendix/projects/ShopListeo/tests/e2e/auth/registration.spec.ts:47:3

# Error details

```
Error: Timed out 10000ms waiting for expect(locator).toBeVisible()

Locator: locator('[data-slot="alert-description"]').or(locator('p.text-destructive').filter({ hasText: 'Użytkownik z tym adresem email już istnieje.' }))
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 10000ms
  - waiting for locator('[data-slot="alert-description"]').or(locator('p.text-destructive').filter({ hasText: 'Użytkownik z tym adresem email już istnieje.' }))

    at RegistrationPage.expectErrorMessageToContain (/home/sendix/projects/ShopListeo/tests/poms/RegistrationPage.ts:91:62)
    at /home/sendix/projects/ShopListeo/tests/e2e/auth/registration.spec.ts:70:28
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
   1 | import { type Locator, type Page, expect } from "@playwright/test";
   2 |
   3 | /**
   4 |  * Represents the Registration Page.
   5 |  * Provides methods to interact with the registration form elements.
   6 |  */
   7 | export class RegistrationPage {
   8 |   // Strona (Page) i Lokatory (Locators)
   9 |   readonly page: Page;
   10 |   readonly emailInput: Locator;
   11 |   readonly passwordInput: Locator;
   12 |   readonly confirmPasswordInput: Locator;
   13 |   readonly submitButton: Locator;
   14 |   // Lokatory dla błędów
   15 |   readonly apiErrorAlert: Locator; // Alert dla błędów API (cały kontener)
   16 |   readonly apiErrorDescription: Locator; // Dokładny element z opisem błędu API
   17 |   readonly validationErrorMessages: Locator; // Ogólny selektor dla błędów walidacji pól
   18 |
   19 |   /**
   20 |    * Konstruktor klasy RegistrationPage.
   21 |    * @param page - Instancja strony Playwright.
   22 |    */
   23 |   constructor(page: Page) {
   24 |     this.page = page;
   25 |     // Używamy ID jako bardziej stabilnych selektorów
   26 |     this.emailInput = page.locator('input[id="email"]');
   27 |     this.passwordInput = page.locator('input[id="password"]');
   28 |     this.confirmPasswordInput = page.locator('input[id="confirmPassword"]');
   29 |     this.submitButton = page.locator('button[type="submit"]');
   30 |
   31 |     // Selektory dla komunikatów błędów
   32 |     this.apiErrorAlert = page.locator('[role="alert"][class*="variant-destructive"]'); // Celuje w alert destrukywny
   33 |     // Bardziej bezpośredni selektor dla opisu błędu API
   34 |     this.apiErrorDescription = page.locator('[data-slot="alert-description"]');
   35 |     this.validationErrorMessages = page.locator("p.text-destructive"); // Celuje w paragrafy z błędami walidacji
   36 |   }
   37 |
   38 |   /**
   39 |    * Nawiguje do strony rejestracji.
   40 |    */
   41 |   async goto() {
   42 |     await this.page.goto("/register"); // Ścieżka do strony rejestracji
   43 |   }
   44 |
   45 |   /**
   46 |    * Wypełnia pole adresu e-mail.
   47 |    * @param email - Adres e-mail do wprowadzenia.
   48 |    */
   49 |   async fillEmail(email: string) {
   50 |     await this.emailInput.waitFor({ state: "visible", timeout: 5000 }); // Wait for field
   51 |     await this.emailInput.fill(email);
   52 |   }
   53 |
   54 |   /**
   55 |    * Wypełnia pole hasła.
   56 |    * @param password - Hasło do wprowadzenia.
   57 |    */
   58 |   async fillPassword(password: string) {
   59 |     await this.passwordInput.waitFor({ state: "visible", timeout: 5000 }); // Wait for field
   60 |     await this.passwordInput.fill(password);
   61 |   }
   62 |
   63 |   /**
   64 |    * Wypełnia pole potwierdzenia hasła.
   65 |    * @param password - Hasło do wprowadzenia w polu potwierdzenia.
   66 |    */
   67 |   async fillConfirmPassword(password: string) {
   68 |     await this.confirmPasswordInput.waitFor({ state: "visible", timeout: 5000 }); // Wait for field
   69 |     await this.confirmPasswordInput.fill(password);
   70 |   }
   71 |
   72 |   /**
   73 |    * Klika przycisk wysłania formularza rejestracji.
   74 |    */
   75 |   async submitForm() {
   76 |     await this.submitButton.click();
   77 |   }
   78 |
   79 |   /**
   80 |    * Asersja sprawdzająca, czy widoczny jest komunikat błędu (API lub walidacji)
   81 |    * zawierający oczekiwany tekst.
   82 |    * @param expectedText - Oczekiwany fragment tekstu w komunikacie błędu.
   83 |    */
   84 |   async expectErrorMessageToContain(expectedText: string) {
   85 |     // Sprawdź najpierw błąd API
   86 |     // Czekaj na pojawienie się *jakiegokolwiek* błędu (API lub walidacji)
   87 |     const apiErrorLocator = this.apiErrorDescription; // Użyj precyzyjnego lokatora opisu
   88 |     const validationErrorLocator = this.validationErrorMessages.filter({ hasText: expectedText });
   89 |
   90 |     // Czekaj, aż jeden z typów błędów będzie widoczny
>  91 |     await expect(apiErrorLocator.or(validationErrorLocator)).toBeVisible({ timeout: 10000 }); // Dłuższy timeout dla pewności
      |                                                              ^ Error: Timed out 10000ms waiting for expect(locator).toBeVisible()
   92 |
   93 |     // Sprawdź, który typ błędu się pojawił
   94 |     if (await apiErrorLocator.isVisible()) {
   95 |       // Jeśli to błąd API, sprawdź jego treść
   96 |       await expect(apiErrorLocator).toHaveText(expectedText);
   97 |     } else {
   98 |       // Jeśli to błąd walidacji, jego widoczność została już sprawdzona przez expect(or(...)).toBeVisible()
   99 |       // Można dodać dodatkową asercję, jeśli potrzeba, ale filter({ hasText: ... }) już to robi
  100 |       await expect(validationErrorLocator).toBeVisible(); // Potwierdzenie widoczności
  101 |     }
  102 |   }
  103 | }
  104 |
```