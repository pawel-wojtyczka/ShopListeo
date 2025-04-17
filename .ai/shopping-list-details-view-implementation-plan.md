# Plan implementacji widoku Szczegółów Listy Zakupów

## 1. Przegląd
Widok Szczegółów Listy Zakupów (`ShoppingListDetailView`) umożliwia użytkownikom zarządzanie konkretną listą zakupów. Pozwala na edycję tytułu listy, dodawanie nowych produktów (w tym przez planowany mechanizm generowania z opisu tekstowego), edycję nazw istniejących produktów, oznaczanie produktów jako zakupione/niezakupione oraz usuwanie produktów. Widok musi być responsywny, obsługiwać tryb ciemny/jasny i integrować się z systemem nawigacji i powiadomień.

## 2. Routing widoku
- **Ścieżka**: `/shopping-lists/:id`
- `:id` jest dynamicznym parametrem reprezentującym UUID listy zakupów.

## 3. Struktura komponentów
```
AppLayout
└── SideNav
└── ShoppingListDetailView (Route: /shopping-lists/:id)
    ├── EditableShoppingListTitle
    ├── ProductInputArea
    │   ├── Textarea (Shadcn)
    │   └── Button (Shadcn - "Wygeneruj listę zakupów")
    └── ProductList
        └── ProductItem (mapped)
            ├── Checkbox (Shadcn)
            ├── EditableItemName
            └── DeleteButton (Shadcn - Icon Button)
```

## 4. Szczegóły komponentów

### `ShoppingListDetailView`
- **Opis**: Główny kontener widoku. Odpowiedzialny za pobranie danych listy (w tym jej elementów) na podstawie `:id` z URL, zarządzanie ogólnym stanem widoku (ładowanie, błędy) oraz przekazywanie danych i funkcji do komponentów podrzędnych.
- **Główne elementy**: `EditableShoppingListTitle`, `ProductInputArea`, `ProductList`, ewentualnie komponenty do wyświetlania stanu ładowania lub błędu.
- **Obsługiwane interakcje**: Inicjuje pobieranie danych przy montowaniu.
- **Obsługiwana walidacja**: Brak bezpośredniej walidacji, obsługuje stany błędów z API.
- **Typy**: `ShoppingListDetailViewModel`, `ShoppingListItemDTO`.
- **Propsy**: Brak (pobiera `:id` z parametrów routingu Astro/React Router).

### `EditableShoppingListTitle`
- **Opis**: Wyświetla tytuł listy zakupów. Po kliknięciu przechodzi w tryb edycji (input tekstowy). Zapisuje zmiany po utracie fokusa (blur) lub naciśnięciu Enter.
- **Główne elementy**: `<h1>` lub podobny tag semantyczny (tryb wyświetlania), `Input` (Shadcn, tryb edycji).
- **Obsługiwane interakcje**: Kliknięcie na tytuł (rozpoczęcie edycji), `onBlur`, `onKeyDown` (Enter) na inpucie (zapisanie zmian).
- **Obsługiwana walidacja**: Długość tytułu (1-255 znaków).
- **Typy**: `EditableTitleViewModel`, `UpdateShoppingListRequest`, `UpdateShoppingListResponse`.
- **Propsy**: `initialTitle: string`, `listId: string`, `onUpdateTitle: (newTitle: string) => Promise<void>`.

### `ProductInputArea`
- **Opis**: Zawiera pole `Textarea` do wprowadzania opisu produktów oraz przycisk "Wygeneruj listę zakupów". W MVP, przycisk może np. parsować linie z textarea i dodawać je jako nowe produkty.
- **Główne elementy**: `Textarea` (Shadcn), `Button` (Shadcn, wyróżniony kolorem).
- **Obsługiwane interakcje**: Wpisywanie tekstu w `Textarea`, kliknięcie przycisku "Wygeneruj listę zakupów".
- **Obsługiwana walidacja**: Brak bezpośredniej walidacji w MVP (do ustalenia przy implementacji generowania).
- **Typy**: `AddItemToShoppingListRequest`, `AddItemToShoppingListResponse`.
- **Propsy**: `listId: string`, `onGenerateItems: (items: string[]) => Promise<void>`.

### `ProductList`
- **Opis**: Renderuje listę komponentów `ProductItem`. Odpowiada za sortowanie produktów (zakupione na końcu).
- **Główne elementy**: Lista (`<ul>` lub `<div>`), mapowanie `ProductItem`.
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji, renderuje listę.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `ProductItemViewModel[]`.
- **Propsy**: `items: ProductItemViewModel[]`, `listId: string`, `onUpdateItem: (itemId: string, data: UpdateShoppingListItemRequest) => Promise<void>`, `onDeleteItem: (itemId: string) => Promise<void>`.

### `ProductItem`
- **Opis**: Reprezentuje pojedynczy element na liście zakupów. Wyświetla nazwę (edytowalną), checkbox statusu zakupienia oraz przycisk usunięcia.
- **Główne elementy**: `div` kontener, `Checkbox` (Shadcn), `EditableItemName` (komponent wewnętrzny lub logika), `Button` (Shadcn, ikona kosza).
- **Obsługiwane interakcje**: Kliknięcie `Checkbox` (zmiana statusu `purchased`), kliknięcie nazwy (edycja inline), kliknięcie przycisku usuwania.
- **Obsługiwana walidacja**: Długość nazwy produktu (1-128 znaków) podczas edycji.
- **Typy**: `ProductItemViewModel`, `UpdateShoppingListItemRequest`, `UpdateShoppingListItemResponse`.
- **Propsy**: `item: ProductItemViewModel`, `listId: string`, `onUpdateItem: (itemId: string, data: UpdateShoppingListItemRequest) => Promise<void>`, `onDeleteItem: (itemId: string) => Promise<void>`.

### `EditableItemName` (Komponent wewnętrzny `ProductItem` lub logika)
- **Opis**: Logika/komponent do wyświetlania i edycji nazwy produktu.
- **Główne elementy**: `<span>` (tryb wyświetlania), `Input` (Shadcn, tryb edycji).
- **Obsługiwane interakcje**: Kliknięcie na nazwę (rozpoczęcie edycji), `onBlur`, `onKeyDown` (Enter) na inpucie (zapisanie zmian).
- **Obsługiwana walidacja**: Długość nazwy (1-128 znaków).
- **Typy**: - (zarządzane w `ProductItem`)
- **Propsy**: `initialName: string`, `onSave: (newName: string) => void`.

## 5. Typy

- **Istniejące typy (z `src/types.ts`)**: `User`, `ShoppingList`, `ShoppingListItem`, `PaginationResponse`, `ShoppingListItemDTO`, `GetShoppingListByIdResponse`, `CreateShoppingListRequest`, `CreateShoppingListResponse`, `UpdateShoppingListRequest`, `UpdateShoppingListResponse`, `AddItemToShoppingListRequest`, `AddItemToShoppingListResponse`, `UpdateShoppingListItemRequest`, `UpdateShoppingListItemResponse`, `BulkUpdateItemRequest`, `BulkUpdateItemsRequest`, `BulkUpdateItemsResponse`.

- **Nowe typy ViewModel**: 
  ```typescript
  // Model widoku dla szczegółów listy zakupów
  interface ShoppingListDetailViewModel {
    id: string;              // ID listy
    title: string;           // Tytuł listy
    isLoading: boolean;      // Status ładowania danych
    isUpdating: boolean;     // Status aktualizacji (np. tytułu, elementów)
    error: string | null;    // Komunikat błędu API
    items: ProductItemViewModel[]; // Lista elementów (ViewModel)
  }

  // Model widoku dla pojedynczego elementu listy zakupów
  interface ProductItemViewModel extends ShoppingListItemDTO {
    isEditingName: boolean; // Czy nazwa jest aktualnie edytowana?
    isUpdating: boolean;    // Czy element jest aktualnie aktualizowany/usuwany?
  }

  // Model widoku dla edytowalnego tytułu
  interface EditableTitleViewModel {
    initialTitle: string;   // Początkowy tytuł (z API)
    isEditing: boolean;     // Czy trwa edycja?
    currentValue: string;   // Aktualna wartość w inpucie
    isLoading: boolean;     // Czy trwa zapisywanie?
    error: string | null;   // Błąd walidacji lub zapisu
  }
  ```

## 6. Zarządzanie stanem
- **Główny stan widoku** (`ShoppingListDetailView`):
  - `listViewModel: ShoppingListDetailViewModel | null` - Przechowuje wszystkie dane i stany UI dla widoku.
  - Będzie zarządzany przez custom hook `useShoppingListDetail`.
- **Custom Hook `useShoppingListDetail(listId: string)`**:
  - **Cel**: Hermetyzacja logiki pobierania danych, zarządzania stanem i interakcji z API dla widoku szczegółów listy.
  - **Stan wewnętrzny**: Zarządza `listViewModel`, w tym `isLoading`, `isUpdating`, `error` oraz listą `items`.
  - **Funkcje API**: Implementuje funkcje do wywoływania endpointów API (fetch, update title, add item, update item, delete item).
  - **Aktualizacje stanu**: Aktualizuje `listViewModel` w odpowiedzi na akcje użytkownika i odpowiedzi API (rozważając aktualizacje optymistyczne).
  - **Sortowanie**: Implementuje logikę sortowania listy `items`, umieszczając zakupione na końcu.
  - **Obsługa błędów**: Przechwytuje błędy API i aktualizuje pole `error` w `listViewModel`.
- **Stan lokalny komponentów**:
  - `EditableShoppingListTitle`: `isEditing`, `currentValue` (wartość w inpucie podczas edycji).
  - `ProductItem`: `isEditingName`, `currentItemName` (wartość w inpucie podczas edycji).
  - `ProductInputArea`: `textareaValue`.

## 7. Integracja API
- **Pobieranie danych**: Po zamontowaniu komponentu `ShoppingListDetailView`, hook `useShoppingListDetail` wywołuje `GET /api/shopping-lists/:id` używając ID z parametrów routingu. Oczekiwana odpowiedź typu `GetShoppingListByIdResponse`.
- **Aktualizacja tytułu**: Funkcja w hooku wywołuje `PUT /api/shopping-lists/:id`. Oczekiwane żądanie typu `UpdateShoppingListRequest`, odpowiedź `UpdateShoppingListResponse`.
- **Dodawanie produktu**: Funkcja w hooku (wywołana np. z `ProductInputArea`) wywołuje `POST /api/shopping-lists/:listId/items`. Oczekiwane żądanie typu `AddItemToShoppingListRequest`, odpowiedź `AddItemToShoppingListResponse`.
- **Aktualizacja produktu**: Funkcja w hooku wywołuje `PUT /api/shopping-lists/:listId/items/:itemId`. Oczekiwane żądanie typu `UpdateShoppingListItemRequest`, odpowiedź `UpdateShoppingListItemResponse`.
- **Usuwanie produktu**: Funkcja w hooku wywołuje `DELETE /api/shopping-lists/:listId/items/:itemId`. Oczekiwana pusta odpowiedź (204).
- **Autoryzacja**: Wszystkie żądania muszą zawierać token JWT w nagłówku `Authorization: Bearer {token}` (obsługiwane przez globalny interceptor lub klienta API).

## 8. Interakcje użytkownika
- **Kliknięcie tytułu listy**: Rozpoczyna edycję inline (`EditableShoppingListTitle`).
- **Zapis tytułu listy**: Po `blur` lub `Enter` w inpucie tytułu, wywoływana jest funkcja aktualizacji w hooku -> API PUT -> aktualizacja stanu -> notyfikacja.
- **Kliknięcie nazwy produktu**: Rozpoczyna edycję inline (`ProductItem`).
- **Zapis nazwy produktu**: Po `blur` lub `Enter` w inpucie nazwy produktu, wywoływana jest funkcja aktualizacji w hooku -> API PUT -> aktualizacja stanu -> notyfikacja.
- **Kliknięcie Checkbox produktu**: Wywołuje funkcję `toggleItemPurchased` w hooku -> API PUT (zmiana `purchased`) -> aktualizacja stanu (styl, pozycja) -> notyfikacja.
- **Kliknięcie ikony usuwania produktu**: Wywołuje funkcję `deleteItem` w hooku -> API DELETE -> aktualizacja stanu (usunięcie z listy) -> notyfikacja.
- **Wpisanie tekstu w Textarea**: Aktualizuje stan lokalny `textareaValue`.
- **Kliknięcie "Wygeneruj listę zakupów"**: W MVP może parsować linie z `textareaValue` i wywoływać `addItem` w hooku dla każdej linii -> API POST -> aktualizacja stanu -> notyfikacja.

## 9. Warunki i walidacja
- **Edycja tytułu listy**: Musi zawierać 1-255 znaków. Walidacja przed wysłaniem do API. Wyświetlenie błędu walidacji przy inpucie.
- **Edycja nazwy produktu**: Musi zawierać 1-128 znaków. Walidacja przed wysłaniem do API. Wyświetlenie błędu walidacji przy inpucie.
- **Przycisk "Wygeneruj listę zakupów"**: Może być wyłączony, jeśli `textarea` jest pusta.
- **Przyciski/Inputy**: Powinny być wyłączone (disabled) i/lub pokazywać stan ładowania podczas trwania operacji API (kontrolowane przez stany `isLoading`, `isUpdating` w ViewModelach).

## 10. Obsługa błędów
- **Błąd pobierania listy (np. 404, 403, 500)**: Wyświetlić dedykowany komunikat błędu zamiast zawartości widoku.
- **Błąd aktualizacji/dodania/usunięcia (np. 400, 403, 500)**: Wyświetlić powiadomienie (toast) z treścią błędu z API. W przypadku aktualizacji optymistycznej, cofnąć zmiany w UI.
- **Błąd walidacji (klient)**: Wyświetlić komunikat błędu bezpośrednio przy odpowiednim polu formularza/inputa.

## 11. Kroki implementacji
1.  **Routing**: Skonfigurować routing w Astro, aby ścieżka `/shopping-lists/:id` renderowała komponent React `ShoppingListDetailView`.
2.  **Główny komponent (`ShoppingListDetailView`)**: Stworzyć komponent, który pobiera `:id` z routingu.
3.  **Custom Hook (`useShoppingListDetail`)**: Zaimplementować hook do zarządzania stanem (`listViewModel`) i logiką pobierania danych (`GET /api/shopping-lists/:id`). Obsłużyć stany ładowania i błędu.
4.  **Renderowanie podstawowe**: W `ShoppingListDetailView` użyć hooka i renderować podstawowe elementy: `EditableShoppingListTitle`, `ProductInputArea` (początkowo może być statyczne), `ProductList` (początkowo pusta lub z mockowymi danymi).
5.  **Komponent `EditableShoppingListTitle`**: Zaimplementować logikę edycji inline, walidację długości i wywołanie funkcji `updateTitle` z hooka `useShoppingListDetail` (którą trzeba będzie dodać do hooka).
6.  **Komponent `ProductList`**: Zaimplementować renderowanie listy `ProductItem` na podstawie danych z hooka. Dodać logikę sortowania (przenoszenie zakupionych na dół).
7.  **Komponent `ProductItem`**: Zaimplementować wyświetlanie nazwy, checkboxa i przycisku usuwania. Dodać logikę edycji inline dla nazwy (`EditableItemName`), walidację długości.
8.  **Integracja API (Aktualizacje/Usuwanie)**: Zaimplementować w hooku `useShoppingListDetail` funkcje `updateItem`, `deleteItem`, `toggleItemPurchased` wywołujące odpowiednie endpointy API (PUT, DELETE).
9.  **Interakcje `ProductItem`**: Podłączyć interakcje (checkbox, edycja, usuwanie) w `ProductItem` do odpowiednich funkcji z hooka przekazanych przez propsy.
10. **Komponent `ProductInputArea`**: Zaimplementować `Textarea` i przycisk. Dodać logikę (w hooku lub komponencie) do parsowania `textarea` i wywoływania funkcji `addItem` (która wywołuje `POST /api/shopping-lists/:listId/items`).
11. **Powiadomienia**: Zintegrować z globalnym systemem powiadomień (toastów) do wyświetlania sukcesu/błędu operacji API.
12. **Responsywność i Style**: Dopracować style Tailwind, zapewnić responsywność układu.
13. **Tryb Ciemny/Jasny**: Upewnić się, że komponenty poprawnie reagują na zmianę motywu.
14. **Testowanie**: Napisać testy jednostkowe dla logiki hooka, walidacji oraz testy integracyjne dla całego widoku. 