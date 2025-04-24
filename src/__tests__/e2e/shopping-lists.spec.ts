import { test, expect } from "@playwright/test";
import { loginUser } from "../helpers/auth";

test.describe("Lista zakupów - podstawowe operacje", () => {
  test.beforeEach(async ({ page }) => {
    // Logowanie użytkownika przed każdym testem
    await loginUser(page);
  });

  test("powinien wyświetlić pusty stan gdy nie ma list", async ({ page }) => {
    await page.goto("/lists");

    // Sprawdzenie czy wyświetla się komunikat o braku list
    const emptyState = page.getByText("Nie masz jeszcze żadnych list zakupów");
    await expect(emptyState).toBeVisible();

    // Sprawdzenie czy przycisk tworzenia nowej listy jest widoczny
    const createButton = page.getByRole("button", { name: "Nowa lista" });
    await expect(createButton).toBeVisible();
  });

  test("powinien utworzyć nową listę zakupów", async ({ page }) => {
    await page.goto("/lists");

    // Kliknięcie przycisku tworzenia nowej listy
    await page.getByRole("button", { name: "Nowa lista" }).click();

    // Oczekiwanie na pojawienie się nowej listy
    const newList = page.getByRole("article").filter({ hasText: new Date().toLocaleDateString("pl-PL") });
    await expect(newList).toBeVisible();

    // Sprawdzenie czy wyświetla się toast z potwierdzeniem
    const toast = page.getByText("Lista zakupów została utworzona");
    await expect(toast).toBeVisible();

    // Zrzut ekranu po utworzeniu listy
    await expect(page).toHaveScreenshot("new-list-created.png");
  });

  test("powinien obsłużyć błędy sieciowe", async ({ page }) => {
    // Symulacja braku połączenia z internetem
    await page.route("**/api/shopping-lists/**", (route) => {
      route.abort();
    });

    await page.goto("/lists");

    // Próba utworzenia nowej listy
    await page.getByRole("button", { name: "Nowa lista" }).click();

    // Sprawdzenie czy wyświetla się komunikat o błędzie
    const errorToast = page.getByText("Nie udało się utworzyć listy zakupów");
    await expect(errorToast).toBeVisible();

    // Zrzut ekranu błędu
    await expect(page).toHaveScreenshot("network-error.png");
  });
});
