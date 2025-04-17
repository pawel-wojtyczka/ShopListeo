# Plan implementacji widoku Listy Użytkowników (Admin)

## 1. Przegląd
Widok Listy Użytkowników (`AdminUsersListView`) jest głównym widokiem dla zalogowanego administratora. Wyświetla on listę wszystkich zarejestrowanych użytkowników systemu wraz z podstawowymi informacjami (e-mail, data rejestracji, data ostatniego logowania). Widok obsługuje paginację oraz wybór liczby elementów wyświetlanych na stronie. Umożliwia przejście do szczegółów konkretnego użytkownika. Jest częścią głównego layoutu aplikacji z nawigacją boczną specyficzną dla administratora.

## 2. Routing widoku
- **Ścieżka**: `/admin/users`

## 3. Struktura komponentów
```
AppLayout
└── SideNav (Admin variant)
└── AdminUsersListView (Route: /admin/users)
    ├── PageHeader (np. "Zarządzanie Użytkownikami")
    ├── UserListControls
    │   └── PageSizeSelector (Shadcn Select - 10, 20, 50)
    ├── UsersTable (Shadcn Table)
    │   ├── TableHeader (Kolumny: Email, Data Rejestracji, Ostatnie Logowanie)
    │   └── TableRow (mapped)
    │       ├── UserEmailLink
    │       ├── RegistrationDateCell
    │       └── LastLoginDateCell
    └── PaginationControls (Shadcn Pagination)
```

## 4. Szczegóły komponentów

### `AdminUsersListView`
- **Opis**: Główny kontener widoku. Odpowiedzialny za pobieranie listy użytkowników z paginacją, zarządzanie stanem (ładowanie, błędy, parametry paginacji) oraz przekazywanie danych do komponentów podrzędnych.
- **Główne elementy**: `PageHeader`, `UserListControls`, `UsersTable`, `PaginationControls`.
- **Obsługiwane interakcje**: Inicjuje pobieranie danych przy montowaniu, reaguje na zmiany paginacji i rozmiaru strony.
- **Obsługiwana walidacja**: Brak bezpośredniej walidacji, obsługuje stany błędów z API.
- **Typy**: `AdminUsersListViewModel`, `UserDTO`, `PaginationResponse`.
- **Propsy**: Brak.

### `PageHeader`
- **Opis**: Prosty komponent wyświetlający tytuł strony.
- **Główne elementy**: `<h1>` lub podobny tag semantyczny.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: `title: string`.

### `UserListControls`
- **Opis**: Kontener na kontrolki listy, np. wybór rozmiaru strony.
- **Główne elementy**: `PageSizeSelector`.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: `pageSize: number`, `onPageSizeChange: (newPageSize: number) => void`.

### `PageSizeSelector`
- **Opis**: Komponent `Select` z Shadcn/ui pozwalający wybrać liczbę użytkowników na stronie (10, 20, 50).
- **Główne elementy**: `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` (Shadcn).
- **Obsługiwane interakcje**: Zmiana wybranej wartości.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: `value: number`, `onChange: (newValue: number) => void`.

### `UsersTable`
- **Opis**: Tabela (Shadcn `Table`) wyświetlająca listę użytkowników.
- **Główne elementy**: `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell` (Shadcn). Renderuje `TableRow` dla każdego użytkownika.
- **Obsługiwane interakcje**: Brak bezpośrednich interakcji.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `UserDTO[]`.
- **Propsy**: `users: UserDTO[]`, `isLoading: boolean` (do wyświetlania stanu ładowania w tabeli, np. skeleton rows).

### `TableRow` (wewnątrz `UsersTable`)
- **Opis**: Reprezentuje pojedynczy wiersz w tabeli użytkowników.
- **Główne elementy**: `TableRow`, `TableCell` (Shadcn) dla każdej kolumny, `UserEmailLink`, `RegistrationDateCell`, `LastLoginDateCell`.
- **Obsługiwane interakcje**: Kliknięcie w email użytkownika (nawigacja).
- **Obsługiwana walidacja**: Brak.
- **Typy**: `UserDTO`.
- **Propsy**: `user: UserDTO`.

### `UserEmailLink`
- **Opis**: Wyświetla email użytkownika jako link nawigujący do szczegółów tego użytkownika.
- **Główne elementy**: Komponent Link z Astro/React Router (`<a href={`/admin/users/${userId}`}>`).
- **Obsługiwane interakcje**: Kliknięcie.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: `userId: string`, `email: string`.

### `RegistrationDateCell` / `LastLoginDateCell`
- **Opis**: Komponenty (lub prosta logika w `TableCell`) formatujące i wyświetlające datę.
- **Główne elementy**: `TableCell` (Shadcn).
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: `date: string | null`.

### `PaginationControls`
- **Opis**: Komponent paginacji (Shadcn `Pagination`) umożliwiający nawigację między stronami wyników.
- **Główne elementy**: Komponenty Shadcn `Pagination`.
- **Obsługiwane interakcje**: Kliknięcie na numery stron, przyciski "Następna"/"Poprzednia".
- **Obsługiwana walidacja**: Brak.
- **Typy**: `PaginationResponse`.
- **Propsy**: `pagination: PaginationResponse`, `onPageChange: (newPage: number) => void`.

## 5. Typy

- **Istniejące typy (z `src/types.ts`)**: `UserDTO`, `GetAllUsersResponse`, `PaginationResponse`.

- **Nowe typy ViewModel**:
  ```typescript
  // Model widoku dla widoku listy użytkowników administratora
  interface AdminUsersListViewModel {
    users: UserDTO[];                 // Lista użytkowników na bieżącej stronie
    isLoading: boolean;             // Status ładowania danych
    error: string | null;           // Komunikat błędu API
    pagination: PaginationResponse | null; // Informacje o paginacji
    currentPage: number;            // Aktualnie wybrana strona
    pageSize: number;               // Aktualnie wybrany rozmiar strony
    // Opcjonalnie można dodać sortowanie i filtrowanie, jeśli będzie potrzebne w przyszłości
    // sortField: string | null;
    // sortOrder: 'asc' | 'desc' | null;
    // emailFilter: string | null;
  }
  ```

## 6. Zarządzanie stanem
- **Główny stan widoku** (`AdminUsersListView`):
  - `viewModel: AdminUsersListViewModel` - Przechowuje dane użytkowników, stan UI i parametry paginacji.
  - Będzie zarządzany przez custom hook `useAdminUsersList`.
- **Custom Hook `useAdminUsersList()`**:
  - **Cel**: Hermetyzacja logiki pobierania listy użytkowników, zarządzania paginacją i stanem widoku.
  - **Stan wewnętrzny**: Zarządza `viewModel`, w tym `isLoading`, `error`, `users`, `pagination`, `currentPage`, `pageSize`.
  - **Funkcje API**: Implementuje funkcję do wywoływania endpointu `GET /api/users` z odpowiednimi parametrami zapytania.
  - **Aktualizacje stanu**: Aktualizuje `viewModel` w odpowiedzi na zmiany strony (`onPageChange`), rozmiaru strony (`onPageSizeChange`) oraz po otrzymaniu odpowiedzi z API.
  - **Obsługa błędów**: Przechwytuje błędy API i aktualizuje pole `error` w `viewModel`.
- **Stan lokalny komponentów**: Brak znaczącego stanu lokalnego poza wewnętrznym stanem komponentów Shadcn.

## 7. Integracja API
- **Pobieranie danych**: Hook `useAdminUsersList` wywołuje `GET /api/users` przy montowaniu komponentu oraz przy zmianie strony lub rozmiaru strony. Parametry `page` i `pageSize` są dynamicznie dołączane do zapytania. Oczekiwana odpowiedź typu `GetAllUsersResponse`.
- **Sortowanie/Filtrowanie (przyszłość)**: Jeśli zostaną dodane, hook będzie przekazywał również parametry `sort`, `order`, `emailFilter` do API.
- **Autoryzacja**: Żądanie musi zawierać token JWT. Endpoint API `/api/users` sam weryfikuje uprawnienia administratora.

## 8. Interakcje użytkownika
- **Zmiana rozmiaru strony**: Użytkownik wybiera nową wartość w `PageSizeSelector`. Wywołuje to `onPageSizeChange` -> aktualizacja stanu w hooku -> ponowne pobranie danych z API z nowym `pageSize` (i `page=1`).
- **Zmiana strony**: Użytkownik klika na numer strony lub przycisk w `PaginationControls`. Wywołuje to `onPageChange` -> aktualizacja stanu w hooku -> ponowne pobranie danych z API z nowym `page`.
- **Kliknięcie w email użytkownika**: Nawigacja do widoku `/admin/users/:id`.

## 9. Warunki i walidacja
- **Widok**: Wyświetla stan ładowania (`isLoading`, np. skeletony w tabeli) lub komunikat o błędzie (`error`).
- **Paginacja**: Kontrolki paginacji są aktywne/nieaktywne w zależności od `currentPage` i `totalPages`.
- **Autoryzacja**: Dostęp do całego widoku jest chroniony na poziomie routingu/middleware, tylko dla administratorów.

## 10. Obsługa błędów
- **Błąd pobierania użytkowników (np. 401, 403, 500)**: Wyświetlić dedykowany komunikat błędu zamiast tabeli użytkowników.
- **Błąd parametrów zapytania (np. 400)**: Teoretycznie nie powinien wystąpić przy poprawnym zarządzaniu stanem w hooku, ale na wszelki wypadek można wyświetlić ogólny błąd.

## 11. Kroki implementacji
1.  **Routing**: Skonfigurować routing w Astro, aby ścieżka `/admin/users` renderowała komponent React `AdminUsersListView` i była dostępna tylko dla administratorów.
2.  **Główny komponent (`AdminUsersListView`)**: Stworzyć komponent.
3.  **Custom Hook (`useAdminUsersList`)**: Zaimplementować hook do zarządzania stanem (`viewModel`) i logiką pobierania danych (`GET /api/users`) z obsługą paginacji.
4.  **Renderowanie podstawowe**: W `AdminUsersListView` użyć hooka i renderować `PageHeader`, `UserListControls`, `UsersTable`, `PaginationControls`.
5.  **Komponent `UserListControls` i `PageSizeSelector`**: Zaimplementować wybór rozmiaru strony i podłączyć do funkcji w hooku.
6.  **Komponent `UsersTable`**: Zaimplementować tabelę Shadcn z odpowiednimi kolumnami. Renderować `TableRow` dla każdego użytkownika, przekazując dane. Obsłużyć stan `isLoading`.
7.  **Komponenty komórek tabeli (`UserEmailLink`, `...DateCell`)**: Zaimplementować linkowanie do szczegółów użytkownika i formatowanie dat.
8.  **Komponent `PaginationControls`**: Zaimplementować paginację Shadcn i podłączyć do funkcji zmiany strony w hooku.
9.  **Obsługa błędów**: Zaimplementować wyświetlanie komunikatów o błędach API.
10. **Responsywność i Style**: Dopracować style Tailwind, zapewnić responsywność tabeli i kontrolek.
11. **Tryb Ciemny/Jasny**: Upewnić się, że komponenty poprawnie reagują na zmianę motywu.
12. **Testowanie**: Napisać testy jednostkowe dla logiki hooka oraz testy integracyjne dla całego widoku, w tym paginacji i zmiany rozmiaru strony. 