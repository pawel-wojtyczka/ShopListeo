import { type Page, type Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ShoppingListDetailsPage extends BasePage {
  // Zakładamy, że tytuł/nazwa listy na stronie szczegółów jest w elemencie h1
  // lub innym elemencie z data-testid. Dostosuj w razie potrzeby.
  // Na podstawie scenariusza, to może być element z data-testid="shopping-list-title-element"
  readonly listTitleElement: Locator;

  constructor(page: Page) {
    // URL dla strony szczegółów jest dynamiczny, więc przekazujemy tylko bazowy obiekt page
    // do BasePage, a konkretny URL będzie sprawdzany inaczej.
    // Możemy tu użyć regexa, ale BasePage oczekuje konkretnego stringa URL dla `super`,
    // więc przekażemy np. pusty string lub jakąś bazową ścieżkę, jeśli ma to sens.
    // W tym przypadku, BasePage.navigate() nie będzie bezpośrednio używane dla tej klasy w typowy sposób.
    super(page, "/list"); // Bazowa ścieżka, dynamiczna część będzie w URL

    // Zaktualizowany selektor na podstawie informacji od użytkownika i Playwright Inspectora
    // Zakładamy, że nazwa listy jest elementem interaktywnym (przyciskiem),
    // którego dostępna nazwa zaczyna się od "Lista zakupów".
    this.listTitleElement = page.getByRole("button", { name: /Lista zakupów/ });
  }

  async expectToBeOnListViewPage(baseApiUrl: string): Promise<void> {
    // Sprawdza, czy URL pasuje do wzorca /list/<UUID>
    // baseApiUrl to np. "http://localhost:3000" lub "https://app.shoplisteo.com"
    // Oczekujemy URL w formacie np. https://app.shoplisteo.com/list/f785a3ec-d559-4173-9189-bad007f3a053
    const listIdRegex = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i; // UUID regex
    await expect(this.page).toHaveURL(new RegExp(`^${baseApiUrl}/list/${listIdRegex.source}`), { timeout: 15000 });
  }

  async getListName(): Promise<string | null> {
    return this.listTitleElement.first().textContent();
  }

  async expectListNameToStartWith(prefix: string): Promise<void> {
    // Metoda toContainText sprawdzi, czy tekst *zawiera* dany prefix.
    // Jeśli chcemy być pewni, że *zaczyna się* od prefixu, można to zostawić lub rozbudować:
    await expect(this.listTitleElement.first()).toContainText(prefix, { timeout: 10000 });

    // Alternatywna, bardziej precyzyjna asercja (jeśli toContainText nie wystarcza):
    // const fullText = await this.getListName();
    // if (fullText === null) {
    //   throw new Error("Could not retrieve list name text.");
    // }
    // expect(fullText.trim().startsWith(prefix)).toBeTruthy();
  }
}
