# Plan implementacji widoków Autentykacji

## 1. Przegląd
Zestaw widoków autentykacji (`LoginView`, `RegisterView`, `RequestPasswordResetView`, `SetNewPasswordView`) odpowiada za proces logowania, rejestracji oraz odzyskiwania hasła przez użytkownika. Widoki te są zazwyczaj dostępne dla niezalogowanych użytkowników i stanowią punkt wejścia do aplikacji. Wykorzystują minimalistyczny design zgodny z resztą aplikacji i integrują się z endpointami API `/api/auth`.

## 2. Routing widoków
- **Logowanie**: `/login`
- **Rejestracja**: `/register`
- **Żądanie resetowania hasła**: `/reset-password`
- **Ustawienie nowego hasła**: `/set-new-password` (Ta ścieżka może wymagać tokenu resetującego jako parametru zapytania, np. `/set-new-password?token=...`, co zależy od implementacji Supabase Auth)

## 3. Struktura komponentów

Widoki te zazwyczaj składają się z prostego layoutu i formularza.

```
AuthLayout (prosty layout bez nawigacji bocznej)
├── LoginView (Route: /login)
│   ├── PageHeader ("Zaloguj się")
│   └── LoginForm
│       ├── EmailInput
│       ├── PasswordInput
│       ├── RememberMeCheckbox
│       ├── SubmitButton ("Zaloguj")
│       └── Links (do /register i /reset-password)
├── RegisterView (Route: /register)
│   ├── PageHeader ("Zarejestruj się")
│   └── RegisterForm
│       ├── EmailInput
│       ├── PasswordInput
│       ├── ConfirmPasswordInput
│       ├── SubmitButton ("Zarejestruj")
│       └── Link (do /login)
├── RequestPasswordResetView (Route: /reset-password)
│   ├── PageHeader ("Resetuj hasło")
│   └── RequestPasswordResetForm
│       ├── EmailInput
│       ├── SubmitButton ("Wyślij link")
│       └── Link (do /login)
└── SetNewPasswordView (Route: /set-new-password)
    ├── PageHeader ("Ustaw nowe hasło")
    └── SetNewPasswordForm
        ├── PasswordInput
        ├── ConfirmPasswordInput
        └── SubmitButton ("Ustaw hasło")
```

## 4. Szczegóły komponentów

### `AuthLayout`
- **Opis**: Prosty kontener dla widoków autentykacji, zazwyczaj centrujący zawartość na stronie, bez nawigacji bocznej.
- **Główne elementy**: `div` lub `main`.
- **Propsy**: `children`.

### `LoginView` / `RegisterView` / `RequestPasswordResetView` / `SetNewPasswordView`
- **Opis**: Główne komponenty dla każdej ze stron autentykacji. Renderują odpowiedni nagłówek i formularz.
- **Główne elementy**: `PageHeader`, odpowiedni komponent formularza (`LoginForm`, `RegisterForm`, etc.).
- **Propsy**: Brak (mogą pobierać dane z kontekstu lub hooków).

### `PageHeader`
- **Opis**: Wyświetla tytuł strony (np. "Zaloguj się").
- **Główne elementy**: `<h1>`.
- **Propsy**: `title: string`.

### `LoginForm`
- **Opis**: Formularz logowania zarządzany przez `react-hook-form`.
- **Główne elementy**: `form`, `EmailInput`, `PasswordInput`, `RememberMeCheckbox`, `SubmitButton`, `Links`.
- **Obsługiwane interakcje**: `onSubmit`.
- **Obsługiwana walidacja**: Email (poprawny format), Hasło (niepuste).
- **Typy**: `LoginUserRequest`, `LoginUserResponse`.
- **Propsy**: `onSubmit: (data: LoginUserRequest) => Promise<void>`, `isSubmitting: boolean`, `apiError: string | null`.

### `RegisterForm`
- **Opis**: Formularz rejestracji zarządzany przez `react-hook-form`.
- **Główne elementy**: `form`, `EmailInput`, `PasswordInput`, `ConfirmPasswordInput`, `SubmitButton`, `Link` (do logowania).
- **Obsługiwane interakcje**: `onSubmit`.
- **Obsługiwana walidacja**: Email (format, unikalność - po stronie API), Hasło (złożoność, min. 8 znaków, zgodność z potwierdzeniem).
- **Typy**: `RegisterUserRequest`, `RegisterUserResponse`.
- **Propsy**: `onSubmit: (data: RegisterUserRequest) => Promise<void>`, `isSubmitting: boolean`, `apiError: string | null`.

### `RequestPasswordResetForm`
- **Opis**: Formularz do żądania linku resetującego hasło.
- **Główne elementy**: `form`, `EmailInput`, `SubmitButton`, `Link` (do logowania).
- **Obsługiwane interakcje**: `onSubmit`.
- **Obsługiwana walidacja**: Email (poprawny format).
- **Typy**: Brak specyficznych DTO (wysyła email).
- **Propsy**: `onSubmit: (email: string) => Promise<void>`, `isSubmitting: boolean`, `apiError: string | null`, `successMessage: string | null`.

### `SetNewPasswordForm`
- **Opis**: Formularz do ustawienia nowego hasła.
- **Główne elementy**: `form`, `PasswordInput`, `ConfirmPasswordInput`, `SubmitButton`.
- **Obsługiwane interakcje**: `onSubmit`.
- **Obsługiwana walidacja**: Hasło (złożoność, zgodność z potwierdzeniem).
- **Typy**: Brak specyficznych DTO (operacja Supabase Auth).
- **Propsy**: `onSubmit: (password: string) => Promise<void>`, `isSubmitting: boolean`, `apiError: string | null`, `token: string` (pobrany z URL).

### Wspólne komponenty formularzy (`EmailInput`, `PasswordInput`, `ConfirmPasswordInput`, `RememberMeCheckbox`, `SubmitButton`, `Links`)
- **Opis**: Standardowe komponenty formularza (Shadcn `Input`, `Checkbox`, `Button`, `Label`) zintegrowane z `react-hook-form`, wyświetlające etykiety i błędy walidacji. `Links` zawiera linki do innych stron autentykacji.
- **Obsługiwana walidacja**: Na poziomie formularza nadrzędnego.
- **Propsy**: Rejestracja `react-hook-form`, `label`, ewentualnie `type` dla inputów.

## 5. Typy
- **Istniejące typy (z `src/types.ts`)**: `RegisterUserRequest`, `RegisterUserResponse`, `LoginUserRequest`, `LoginUserResponse`.
- **Nowe typy ViewModel**: Zazwyczaj nie są potrzebne złożone ViewModele dla tych widoków; stan jest zarządzany głównie przez `react-hook-form` i proste stany hooków (`isLoading`, `error`, `successMessage`).

## 6. Zarządzanie stanem
- **Stan formularzy**: Zarządzany przez `react-hook-form` w każdym komponencie formularza (`LoginForm`, `RegisterForm`, etc.). Hook ten obsługuje wartości pól, walidację i stan przesyłania (`isSubmitting`).
- **Stan widoku**: Proste stany zarządzane przez `useState` w głównych komponentach widoku (`LoginView`, `RegisterView`, etc.) do obsługi ogólnych błędów API (`apiError`) lub komunikatów sukcesu (`successMessage`).
- **Stan autentykacji (globalny)**: Po pomyślnym zalogowaniu lub rejestracji, stan autentykacji użytkownika (np. dane użytkownika, token) powinien być zapisany w globalnym stanie aplikacji (np. w kontekście React, Zustand store) i potencjalnie w `localStorage` (dla opcji "Zapamiętaj mnie"). Należy również obsłużyć przekierowanie do odpowiedniego widoku (`/` lub `/admin/users`).

## 7. Integracja API
- **Logowanie (`LoginForm`)**: Wywołuje `POST /api/auth/login` z danymi typu `LoginUserRequest`. Oczekuje odpowiedzi `LoginUserResponse`.
- **Rejestracja (`RegisterForm`)**: Wywołuje `POST /api/auth/register` z danymi typu `RegisterUserRequest`. Oczekuje odpowiedzi `RegisterUserResponse`.
- **Resetowanie hasła (`RequestPasswordResetForm`)**: Wywołuje funkcję Supabase Auth (`supabase.auth.resetPasswordForEmail`) bezpośrednio (lub przez dedykowany endpoint API, jeśli logika ma być po stronie serwera) do wysłania emaila resetującego.
- **Ustawienie nowego hasła (`SetNewPasswordForm`)**: Wywołuje funkcję Supabase Auth (`supabase.auth.updateUser`) bezpośrednio (lub przez dedykowany endpoint API) z nowym hasłem i tokenem resetującym.
- **Obsługa tokenu**: Po zalogowaniu/rejestracji, otrzymany token JWT jest zapisywany (np. w `localStorage` dla "Zapamiętaj mnie", lub w stanie globalnym/pamięci dla sesji) i używany do autoryzacji kolejnych zapytań API.

## 8. Interakcje użytkownika
- **Wprowadzanie danych**: Standardowe interakcje z polami formularzy.
- **Wysyłanie formularza**: Wywołuje odpowiednią funkcję API/Supabase.
- **Klikanie linków**: Nawigacja między widokami logowania, rejestracji, resetowania hasła.
- **Zaznaczenie "Zapamiętaj mnie"**: Wpływa na sposób przechowywania tokenu JWT.

## 9. Warunki i walidacja
- **Walidacja pól**: Implementowana w `react-hook-form` z użyciem schematów Zod (zdefiniowanych w planie implementacji endpointów) lub reguł walidacji `react-hook-form`. Błędy wyświetlane przy polach.
- **Zgodność haseł**: Walidacja w `RegisterForm` i `SetNewPasswordForm`.
- **Przyciski Submit**: Wyłączone (`disabled`) podczas wysyłania (`isSubmitting`).
- **Wyświetlanie błędów API**: Ogólne błędy API (np. "Nieprawidłowe dane logowania", "Email już istnieje") wyświetlane w obrębie formularza.

## 10. Obsługa błędów
- **Błędy walidacji klienta**: Obsługiwane przez `react-hook-form`, wyświetlane przy polach.
- **Błędy API (4xx, 5xx)**: Wyświetlane jako ogólny komunikat błędu w formularzu (`apiError`).
- **Sukces (Rejestracja/Reset)**: Po udanej rejestracji następuje automatyczne logowanie i przekierowanie. Po udanym żądaniu resetu hasła lub ustawieniu nowego hasła, wyświetlany jest komunikat sukcesu (`successMessage`) i/lub następuje przekierowanie do logowania.

## 11. Kroki implementacji
1.  **Routing**: Skonfigurować routing w Astro dla ścieżek `/login`, `/register`, `/reset-password`, `/set-new-password` renderujących odpowiednie komponenty React.
2.  **Layout (`AuthLayout`)**: Stworzyć prosty layout centrujący zawartość.
3.  **Komponent `LoginView` i `LoginForm`**: Zaimplementować formularz logowania z `react-hook-form`, walidacją, integracją z `POST /api/auth/login`, obsługą "Zapamiętaj mnie", zapisem tokenu, globalnym stanem autentykacji i przekierowaniem.
4.  **Komponent `RegisterView` i `RegisterForm`**: Zaimplementować formularz rejestracji z `react-hook-form`, walidacją (w tym zgodności haseł), integracją z `POST /api/auth/register`, automatycznym logowaniem i przekierowaniem.
5.  **Komponent `RequestPasswordResetView` i `RequestPasswordResetForm`**: Zaimplementować formularz żądania resetu, integrację z funkcją wysyłania emaila Supabase Auth, obsługę komunikatów sukcesu/błędu.
6.  **Komponent `SetNewPasswordView` i `SetNewPasswordForm`**: Zaimplementować formularz ustawiania nowego hasła, pobieranie tokenu z URL, integrację z funkcją aktualizacji hasła Supabase Auth, obsługę komunikatów sukcesu/błędu i przekierowanie do logowania.
7.  **Wspólne Komponenty Formularzy**: Stworzyć reużywalne komponenty dla inputów, checkboxa, przycisków i linków, zintegrowane z Shadcn/ui i `react-hook-form`.
8.  **Globalny Stan Autentykacji**: Zaimplementować mechanizm (np. Context API, Zustand) do zarządzania stanem zalogowania użytkownika i tokenem JWT.
9.  **Obsługa Błędów API**: Zaimplementować spójny sposób wyświetlania błędów API w formularzach.
10. **Styling**: Dopracować style Tailwind zgodnie z minimalistycznym designem i paletą niebieskich kolorów.
11. **Testowanie**: Napisać testy jednostkowe dla walidacji formularzy oraz testy integracyjne dla całych przepływów autentykacji. 