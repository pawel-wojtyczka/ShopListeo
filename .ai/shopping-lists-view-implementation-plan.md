# Plan implementacji widoku Listy Zakupów

## 1. Przegląd

Widok Listy Zakupów (`ShoppingListsView`) jest głównym widokiem dla zalogowanego użytkownika. Wyświetla on wszystkie listy zakupów należące do użytkownika, posortowane domyślnie według daty utworzenia (najnowsze na górze). Umożliwia tworzenie nowych list oraz przechodzenie do szczegółów istniejących list, a także ich usuwanie. Widok jest responsywny, obsługuje tryb ciemny/jasny i jest częścią głównego layoutu aplikacji z nawigacją boczną.

## 2. Routing widoku

- **Ścieżka**: `/` (ścieżka główna po zalogowaniu dla zwykłego użytkownika)

## 3. Struktura komponentów

```
AppLayout
└── SideNav
└── ShoppingListsView (Route: /)
    ├── PageHeader (np. "Twoje Listy Zakupów")
    ├── CreateListButton
    └── ShoppingLists
        └── ShoppingListItem (mapped)
            ├── ListTitleLink
            └── DeleteListButton (Shadcn - Icon Button)
```

## 4. Szczegóły komponentów

### `ShoppingListsView`

- **Opis**: Główny kontener widoku. Odpowiedzialny za pobieranie listy zakupów użytkownika, zarządzanie stanem (ładowanie, błędy) oraz przekazywanie danych do komponentów podrzędnych.
- **Główne elementy**: `PageHeader`, `CreateListButton`, `ShoppingLists`.
- **Obsługiwane interakcje**: Inicjuje pobieranie danych przy montowaniu.
- **Obsługiwana walidacja**: Brak bezpośredniej walidacji, obsługuje stany błędów z API.
- **Typy**: `ShoppingListsViewModel`, `ShoppingListSummaryDTO`.
- **Propsy**: Brak.

### `PageHeader`

- **Opis**: Prosty komponent wyświetlający tytuł strony, np. "Twoje Listy Zakupów".
- **Główne elementy**: `<h1>` lub podobny tag semantyczny.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: `title: string`.

### `CreateListButton`

- **Opis**: Przycisk inicjujący proces tworzenia nowej listy zakupów. Po kliknięciu wywołuje funkcję API do utworzenia listy z domyślną nazwą i przekierowuje użytkownika do widoku szczegółów nowo utworzonej listy.
- **Główne elementy**: `Button` (Shadcn, wyróżniony kolorem, np. z ikoną plusa).
- **Obsługiwane interakcje**: `onClick`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `CreateShoppingListRequest`, `CreateShoppingListResponse`.
- **Propsy**: `onCreateList: () => Promise<string | null>` (zwraca ID nowej listy lub null w razie błędu).

### `ShoppingLists`

- **Opis**: Renderuje listę komponentów `ShoppingListItem`. Wyświetla informację, jeśli lista jest pusta lub podczas ładowania.
- **Główne elementy**: Lista (`<ul>` lub `<div>`), mapowanie `ShoppingListItem`, komponent stanu ładowania (np. skeleton), komunikat o braku list.
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `ShoppingListItemViewModel[]`.
- **Propsy**: `lists: ShoppingListItemViewModel[]`, `isLoading: boolean`, `onDeleteList: (listId: string) => Promise<void>`.

### `ShoppingListItem`

- **Opis**: Reprezentuje pojedynczy element na liście list zakupów. Wyświetla tytuł listy (jako link do szczegółów) oraz przycisk usunięcia.
- **Główne elementy**: Kontener (`<li>` lub `<div>`), `ListTitleLink` (komponent wewnętrzny lub link), `DeleteListButton` (Shadcn, ikona kosza).
- **Obsługiwane interakcje**: Kliknięcie tytułu (nawigacja do `/shopping-lists/:id`), kliknięcie przycisku usuwania.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `ShoppingListItemViewModel`.
- **Propsy**: `list: ShoppingListItemViewModel`, `onDeleteList: (listId: string) => Promise<void>`.

### `ListTitleLink` (Komponent wewnętrzny `ShoppingListItem`)

- **Opis**: Wyświetla tytuł listy jako link nawigujący do szczegółów tej listy.
- **Główne elementy**: Komponent Link z Astro/React Router (`<a href={`/shopping-lists/${listId}`}>`).
- **Obsługiwane interakcje**: Kliknięcie.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: `listId: string`, `title: string`.

### `DeleteListButton`

- **Opis**: Przycisk (ikona) inicjujący proces usuwania listy zakupów. Po kliknięciu otwiera modal potwierdzający.
- **Główne elementy**: `Button` (Shadcn, wariant ikony, np. kosz).
- **Obsługiwane interakcje**: `onClick`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: `listId: string`, `listTitle: string`, `onConfirmDelete: (listId: string) => Promise<void>`.

## 5. Typy

- **Istniejące typy (z `src/types.ts`)**: `ShoppingListSummaryDTO`, `GetAllShoppingListsResponse`, `PaginationResponse`, `CreateShoppingListRequest`, `CreateShoppingListResponse`.

- **Nowe typy ViewModel**:

  ```typescript
  // Model widoku dla całego widoku listy zakupów
  interface ShoppingListsViewModel {
    lists: ShoppingListItemViewModel[]; // Lista list zakupów (ViewModel)
    isLoading: boolean; // Status ładowania danych
    isCreating: boolean; // Status tworzenia nowej listy
    error: string | null; // Komunikat błędu API
    pagination: PaginationResponse | null; // Informacje o paginacji (jeśli zaimplementowana)
  }

  // Model widoku dla pojedynczego elementu na liście list zakupów
  interface ShoppingListItemViewModel extends ShoppingListSummaryDTO {
    isDeleting: boolean; // Czy lista jest aktualnie usuwana?
  }
  ```

## 6. Zarządzanie stanem

- **Główny stan widoku** (`ShoppingListsView`):
  - `viewModel: ShoppingListsViewModel` - Przechowuje wszystkie dane i stany UI dla widoku.
  - Będzie zarządzany przez custom hook `useShoppingLists`.
- **Custom Hook `useShoppingLists()`**:
  - **Cel**: Hermetyzacja logiki pobierania listy zakupów, tworzenia nowych list, usuwania istniejących i zarządzania stanem widoku.
  - **Stan wewnętrzny**: Zarządza `viewModel`, w tym `isLoading`, `isCreating`, `error` oraz listą `lists`.
  - **Funkcje API**: Implementuje funkcje do wywoływania endpointów API (`GET /api/shopping-lists`, `POST /api/shopping-lists`, `DELETE /api/shopping-lists/:id`).
  - **Aktualizacje stanu**: Aktualizuje `viewModel` w odpowiedzi na akcje użytkownika i odpowiedzi API (rozważając aktualizacje optymistyczne dla usuwania).
  - **Sortowanie**: Domyślnie sortuje po `createdAt` malejąco (po stronie API lub klienta).
  - **Obsługa błędów**: Przechwytuje błędy API i aktualizuje pole `error` w `viewModel`.
  - **Przekierowanie**: Po pomyślnym utworzeniu listy, hook może zwrócić ID nowej listy, a komponent `ShoppingListsView` obsłuży przekierowanie.
- **Stan lokalny komponentów**:
  - `DeleteListButton`: Stan zarządzania widocznością modala potwierdzającego.

## 7. Integracja API

- **Pobieranie danych**: Po zamontowaniu komponentu `ShoppingListsView`, hook `useShoppingLists` wywołuje `GET /api/shopping-lists` (z ewentualnymi parametrami domyślnej paginacji/sortowania). Oczekiwana odpowiedź typu `GetAllShoppingListsResponse`.
- **Tworzenie listy**: Funkcja `createList` w hooku wywołuje `POST /api/shopping-lists`. Oczekiwane żądanie typu `CreateShoppingListRequest` (tytuł generowany automatycznie wg formatu), odpowiedź `CreateShoppingListResponse`.
- **Usuwanie listy**: Funkcja `deleteList` w hooku wywołuje `DELETE /api/shopping-lists/:id`. Oczekiwana pusta odpowiedź (204).
- **Autoryzacja**: Wszystkie żądania muszą zawierać token JWT.

## 8. Interakcje użytkownika

- **Kliknięcie "Utwórz nową listę zakupów"**: Wywołuje funkcję `createList` w hooku -> API POST -> (po sukcesie) hook zwraca ID -> `ShoppingListsView` przekierowuje do `/shopping-lists/:newId` -> notyfikacja.
- **Kliknięcie tytułu listy**: Nawigacja do `/shopping-lists/:id`.
- **Kliknięcie ikony usuwania listy**: Otwiera modal potwierdzający.
- **Potwierdzenie usunięcia w modalu**: Wywołuje funkcję `deleteList` w hooku -> API DELETE -> aktualizacja stanu (usunięcie z listy, optymistycznie) -> notyfikacja.

## 9. Warunki i walidacja

- **Przycisk "Utwórz nową listę zakupów"**: Może być wyłączony (`disabled`) podczas tworzenia listy (`isCreating` w `viewModel`).
- **Przyciski usuwania**: Mogą być wyłączone (`disabled`) podczas usuwania danej listy (`isDeleting` w `ShoppingListItemViewModel`).
- **Widok**: Wyświetla stan ładowania (`isLoading`) lub komunikat o błędzie (`error`). Wyświetla informację, jeśli użytkownik nie ma żadnych list.

## 10. Obsługa błędów

- **Błąd pobierania list (np. 401, 500)**: Wyświetlić dedykowany komunikat błędu zamiast listy.
- **Błąd tworzenia listy (np. 400, 401, 500)**: Wyświetlić powiadomienie (toast) z treścią błędu z API.
- **Błąd usuwania listy (np. 401, 403, 404, 500)**: Wyświetlić powiadomienie (toast) z treścią błędu z API. W przypadku aktualizacji optymistycznej, przywrócić usunięty element do listy.

## 11. Kroki implementacji

1.  **Routing**: Upewnić się, że ścieżka `/` dla zalogowanego użytkownika (nie admina) renderuje `ShoppingListsView`.
2.  **Główny komponent (`ShoppingListsView`)**: Stworzyć komponent.
3.  **Custom Hook (`useShoppingLists`)**: Zaimplementować hook do zarządzania stanem (`viewModel`) i logiką pobierania danych (`GET /api/shopping-lists`). Obsłużyć stany ładowania i błędu.
4.  **Renderowanie podstawowe**: W `ShoppingListsView` użyć hooka i renderować `PageHeader`, `CreateListButton`, `ShoppingLists` (z obsługą stanu ładowania i braku list).
5.  **Komponent `ShoppingLists`**: Zaimplementować renderowanie listy `ShoppingListItem` na podstawie danych z hooka.
6.  **Komponent `ShoppingListItem`**: Zaimplementować wyświetlanie tytułu jako linku (`ListTitleLink`) i przycisku usuwania (`DeleteListButton`).
7.  **Logika tworzenia listy**: Zaimplementować funkcję `createList` w hooku `useShoppingLists`, która generuje domyślny tytuł, wywołuje `POST /api/shopping-lists` i obsługuje przekierowanie po sukcesie.
8.  **Logika usuwania listy**: Zaimplementować funkcję `deleteList` w hooku `useShoppingLists`, która wywołuje `DELETE /api/shopping-lists/:id`. Zintegrować z komponentem `Modal` wywoływanym przez `DeleteListButton`.
9.  **Powiadomienia**: Zintegrować z globalnym systemem powiadomień (toastów) dla operacji tworzenia i usuwania.
10. **Responsywność i Style**: Dopracować style Tailwind, zapewnić responsywność układu.
11. **Tryb Ciemny/Jasny**: Upewnić się, że komponenty poprawnie reagują na zmianę motywu.
12. **Testowanie**: Napisać testy jednostkowe dla logiki hooka oraz testy integracyjne dla całego widoku.
