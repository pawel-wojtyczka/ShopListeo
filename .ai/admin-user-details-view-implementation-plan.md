# Plan implementacji widoku Szczegółów Użytkownika (Admin)

## 1. Przegląd
Widok Szczegółów Użytkownika (`AdminUserDetailView`) jest przeznaczony dla administratorów systemu. Pozwala na przeglądanie szczegółowych informacji o wybranym użytkowniku (e-mail, data rejestracji, data ostatniego logowania) oraz na edycję jego adresu e-mail i hasła. Umożliwia również usunięcie konta użytkownika. Widok jest częścią głównego layoutu aplikacji z nawigacją boczną specyficzną dla administratora.

## 2. Routing widoku
- **Ścieżka**: `/admin/users/:id`
- `:id` jest dynamicznym parametrem reprezentującym UUID użytkownika.

## 3. Struktura komponentów
```
AppLayout
└── SideNav (Admin variant)
└── AdminUserDetailView (Route: /admin/users/:id)
    ├── PageHeader (np. "Szczegóły Użytkownika: {email}")
    ├── UserInfoSection
    │   ├── DataField (Email)
    │   ├── DataField (Data Rejestracji)
    │   └── DataField (Ostatnie Logowanie)
    ├── EditUserForm
    │   ├── EmailInput (Shadcn Input)
    │   ├── PasswordInput (Shadcn Input - type="password")
    │   └── SubmitButton (Shadcn Button - "Aktualizuj Dane")
    └── DeleteUserSection
        └── DeleteUserButton (Shadcn Button - wariant destructive)
```

## 4. Szczegóły komponentów

### `AdminUserDetailView`
- **Opis**: Główny kontener widoku. Odpowiedzialny za pobranie danych użytkownika na podstawie `:id` z URL, zarządzanie stanem (ładowanie, błędy, edycja, usuwanie) oraz koordynację między komponentami podrzędnymi.
- **Główne elementy**: `PageHeader`, `UserInfoSection`, `EditUserForm`, `DeleteUserSection`, komponenty stanu ładowania/błędu.
- **Obsługiwane interakcje**: Inicjuje pobieranie danych przy montowaniu.
- **Obsługiwana walidacja**: Brak bezpośredniej, obsługuje błędy API.
- **Typy**: `AdminUserDetailViewModel`, `UserDTO`.
- **Propsy**: Brak (pobiera `:id` z parametrów routingu).

### `PageHeader`
- **Opis**: Wyświetla tytuł strony, dynamicznie wstawiając email edytowanego użytkownika.
- **Główne elementy**: `<h1>` lub podobny tag semantyczny.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: `email: string | undefined`.

### `UserInfoSection`
- **Opis**: Sekcja wyświetlająca statyczne informacje o użytkowniku.
- **Główne elementy**: Komponenty `DataField` dla E-maila, Daty Rejestracji, Ostatniego Logowania.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `UserDTO`.
- **Propsy**: `user: UserDTO | null`.

### `DataField`
- **Opis**: Prosty komponent do wyświetlania etykiety i wartości pola danych.
- **Główne elementy**: `div`, `span` (etykieta), `span` (wartość).
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: `label: string`, `value: string | null | undefined`.

### `EditUserForm`
- **Opis**: Formularz umożliwiający edycję adresu e-mail i hasła użytkownika. Powinien być zarządzany np. przez `react-hook-form`.
- **Główne elementy**: `form`, `EmailInput`, `PasswordInput`, `SubmitButton`.
- **Obsługiwane interakcje**: Wprowadzanie danych, `onSubmit`.
- **Obsługiwana walidacja**: Format adresu e-mail, złożoność hasła (jeśli jest wprowadzane).
- **Typy**: `UserDTO`, `UpdateUserRequest`, `UpdateUserResponse`.
- **Propsy**: `user: UserDTO`, `onSubmit: (data: UpdateUserRequest) => Promise<void>`, `isSubmitting: boolean`.

### `EmailInput` / `PasswordInput`
- **Opis**: Kontrolowane komponenty `Input` (Shadcn) zintegrowane z `react-hook-form`, wyświetlające błędy walidacji.
- **Główne elementy**: `Label`, `Input`, komunikat błędu (Shadcn).
- **Obsługiwane interakcje**: Wprowadzanie tekstu.
- **Obsługiwana walidacja**: Specyficzna dla pola (email/password).
- **Typy**: Zintegrowane z `react-hook-form`.
- **Propsy**: Rejestracja z `react-hook-form`, `label`.

### `SubmitButton`
- **Opis**: Przycisk wysyłający formularz edycji.
- **Główne elementy**: `Button` (Shadcn).
- **Obsługiwane interakcje**: `onClick` (wywołuje submit formularza).
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: `isSubmitting: boolean` (do wyłączania przycisku).

### `DeleteUserSection`
- **Opis**: Sekcja zawierająca przycisk do usuwania użytkownika.
- **Główne elementy**: `DeleteUserButton`.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: `userId: string`, `userEmail: string`, `onDeleteUser: (userId: string) => Promise<void>`.

### `DeleteUserButton`
- **Opis**: Przycisk inicjujący proces usuwania użytkownika. Otwiera modal potwierdzający.
- **Główne elementy**: `Button` (Shadcn, wariant `destructive`).
- **Obsługiwane interakcje**: `onClick`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: Brak.
- **Propsy**: `userId: string`, `userEmail: string`, `onConfirmDelete: (userId: string) => Promise<void>`, `isDeleting: boolean`.

## 5. Typy

- **Istniejące typy (z `src/types.ts`)**: `UserDTO`, `GetUserByIdResponse`, `UpdateUserRequest`, `UpdateUserResponse`.

- **Nowe typy ViewModel**:
  ```typescript
  // Model widoku dla szczegółów użytkownika (Admin)
  interface AdminUserDetailViewModel {
    user: UserDTO | null;       // Dane użytkownika lub null jeśli nie załadowano
    isLoading: boolean;         // Status ładowania danych
    isUpdating: boolean;        // Status aktualizacji danych
    isDeleting: boolean;        // Status usuwania użytkownika
    error: string | null;       // Komunikat błędu API (ogólny lub z operacji)
    updateFormError: string | null; // Błąd specyficzny dla formularza aktualizacji
  }
  ```

## 6. Zarządzanie stanem
- **Główny stan widoku** (`AdminUserDetailView`):
  - `viewModel: AdminUserDetailViewModel` - Przechowuje dane użytkownika i stany UI.
  - Będzie zarządzany przez custom hook `useAdminUserDetail`.
- **Custom Hook `useAdminUserDetail(userId: string)`**:
  - **Cel**: Hermetyzacja logiki pobierania danych użytkownika, aktualizacji, usuwania i zarządzania stanem.
  - **Stan wewnętrzny**: Zarządza `viewModel`.
  - **Funkcje API**: Implementuje funkcje do wywoływania endpointów API (`GET /api/users/:id`, `PUT /api/users/:id`, `DELETE /api/users/:id`).
  - **Aktualizacje stanu**: Aktualizuje `viewModel` w odpowiedzi na akcje administratora i odpowiedzi API.
  - **Obsługa błędów**: Przechwytuje błędy API i aktualizuje pola `error` lub `updateFormError`.
  - **Przekierowanie**: Po usunięciu użytkownika, hook może sygnalizować potrzebę przekierowania (np. do listy użytkowników).
- **Stan formularza** (`EditUserForm`):
  - Zarządzany przez `react-hook-form` do obsługi wartości pól, walidacji i stanu przesyłania.
- **Stan lokalny komponentów**:
  - `DeleteUserButton`: Stan zarządzania widocznością modala potwierdzającego.

## 7. Integracja API
- **Pobieranie danych**: Po zamontowaniu komponentu, hook `useAdminUserDetail` wywołuje `GET /api/users/:id` używając ID z parametrów routingu. Oczekiwana odpowiedź typu `GetUserByIdResponse`.
- **Aktualizacja danych**: Funkcja `updateUser` w hooku (wywołana po submicie `EditUserForm`) wywołuje `PUT /api/users/:id`. Oczekiwane żądanie typu `UpdateUserRequest`, odpowiedź `UpdateUserResponse`. Tylko zmienione pola (email i/lub password) powinny być wysyłane.
- **Usuwanie użytkownika**: Funkcja `deleteUser` w hooku (wywołana po potwierdzeniu w modalu) wywołuje `DELETE /api/users/:id`. Oczekiwana pusta odpowiedź (204).
- **Autoryzacja**: Wszystkie żądania muszą zawierać token JWT. Endpointy API same weryfikują uprawnienia administratora.

## 8. Interakcje użytkownika
- **Wprowadzanie danych w formularzu**: Aktualizuje stan `react-hook-form`.
- **Wysyłanie formularza edycji**: Wywołuje funkcję `updateUser` w hooku -> API PUT -> aktualizacja stanu -> notyfikacja sukcesu lub błędu.
- **Kliknięcie przycisku usuwania**: Otwiera modal potwierdzający.
- **Potwierdzenie usunięcia w modalu**: Wywołuje funkcję `deleteUser` w hooku -> API DELETE -> (po sukcesie) przekierowanie np. do `/admin/users` -> notyfikacja.

## 9. Warunki i walidacja
- **Formularz edycji**: Walidacja formatu e-maila, złożoności hasła (jeśli podane) przy użyciu `react-hook-form` i schematu Zod (zdefiniowanego w planie implementacji endpointów). Błędy wyświetlane przy polach.
- **Unikalność Emaila**: Walidacja po stronie serwera (API zwróci 409 Conflict).
- **Przyciski**: Przycisk "Aktualizuj Dane" wyłączony podczas wysyłania (`isSubmitting`). Przycisk "Usuń użytkownika" wyłączony podczas usuwania (`isDeleting`).
- **Widok**: Wyświetla stan ładowania (`isLoading`) lub komunikat o błędzie (`error`).
- **Autoryzacja**: Dostęp do widoku chroniony na poziomie routingu/middleware.

## 10. Obsługa błędów
- **Błąd pobierania użytkownika (np. 404, 401, 403, 500)**: Wyświetlić dedykowany komunikat błędu zamiast zawartości widoku.
- **Błąd aktualizacji (np. 400, 401, 403, 404, 409, 500)**: Wyświetlić powiadomienie (toast) z treścią błędu z API. W przypadku błędu walidacji (400) lub konfliktu (409), błąd powinien być również powiązany z formularzem (`updateFormError`).
- **Błąd usuwania (np. 401, 403, 404, 500)**: Wyświetlić powiadomienie (toast) z treścią błędu z API.

## 11. Kroki implementacji
1.  **Routing**: Skonfigurować routing w Astro, aby ścieżka `/admin/users/:id` renderowała komponent React `AdminUserDetailView` i była dostępna tylko dla administratorów.
2.  **Główny komponent (`AdminUserDetailView`)**: Stworzyć komponent, który pobiera `:id` z routingu.
3.  **Custom Hook (`useAdminUserDetail`)**: Zaimplementować hook do zarządzania stanem (`viewModel`) i logiką pobierania danych (`GET /api/users/:id`). Obsłużyć stany ładowania i błędu.
4.  **Renderowanie podstawowe**: W `AdminUserDetailView` użyć hooka i renderować `PageHeader`, `UserInfoSection`, `EditUserForm`, `DeleteUserSection`. Obsłużyć stan ładowania/błędu.
5.  **Komponent `UserInfoSection`**: Zaimplementować wyświetlanie statycznych danych użytkownika.
6.  **Komponent `EditUserForm`**: Zaimplementować formularz z `react-hook-form`, polami `EmailInput`, `PasswordInput` (pozostawienie pustego hasła nie powinno go zmieniać) i przyciskiem `SubmitButton`. Podłączyć walidację Zod. Podłączyć `onSubmit` do funkcji `updateUser` w hooku.
7.  **Logika aktualizacji**: Zaimplementować funkcję `updateUser` w hooku, która wywołuje `PUT /api/users/:id` tylko z polami, które zostały zmienione.
8.  **Komponent `DeleteUserSection` i `DeleteUserButton`**: Zaimplementować przycisk usuwania i integrację z modalem potwierdzającym.
9.  **Logika usuwania**: Zaimplementować funkcję `deleteUser` w hooku, która wywołuje `DELETE /api/users/:id` i obsługuje przekierowanie po sukcesie.
10. **Powiadomienia**: Zintegrować z globalnym systemem powiadomień (toastów) dla operacji aktualizacji i usuwania.
11. **Responsywność i Style**: Dopracować style Tailwind.
12. **Tryb Ciemny/Jasny**: Upewnić się, że komponenty poprawnie reagują na zmianę motywu.
13. **Testowanie**: Napisać testy jednostkowe dla logiki hooka, walidacji formularza oraz testy integracyjne dla całego widoku. 