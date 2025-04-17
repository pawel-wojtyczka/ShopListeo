# API Endpoint Implementation Plan: Rejestracja i Logowanie Użytkownika

## 1. Przegląd punktów końcowych

### Endpoint rejestracji (`/api/auth/register`)
Endpoint służący do rejestracji nowych użytkowników w systemie. Przyjmuje dane rejestracyjne, waliduje je, tworzy nowe konto użytkownika i zwraca token dostępowy.

### Endpoint logowania (`/api/auth/login`)
Endpoint służący do uwierzytelniania istniejących użytkowników. Przyjmuje dane logowania, weryfikuje je i zwraca token dostępowy.

## 2. Szczegóły żądania

### Rejestracja użytkownika
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/auth/register`
- **Parametry**: Brak
- **Request Body**:
  ```typescript
  {
    email: string;    // Adres email użytkownika
    password: string; // Hasło użytkownika
  }
  ```

### Logowanie użytkownika
- **Metoda HTTP**: POST
- **Struktura URL**: `/api/auth/login`
- **Parametry**: Brak
- **Request Body**:
  ```typescript
  {
    email: string;    // Adres email użytkownika
    password: string; // Hasło użytkownika
  }
  ```

## 3. Wykorzystywane typy

```typescript
// Requestu rejestracji
export interface RegisterUserRequest {
  email: string;
  password: string;
}

// Odpowiedzi rejestracji
export interface RegisterUserResponse {
  id: string;
  email: string;
  registrationDate: string;
  token: string;
}

// Requestu logowania
export interface LoginUserRequest {
  email: string;
  password: string;
}

// Odpowiedzi logowania
export interface LoginUserResponse {
  id: string;
  email: string;
  token: string;
}

// Schemat walidacji Zod dla rejestracji
const registerUserSchema = z.object({
  email: z.string().email({ message: "Podaj poprawny adres email" }),
  password: z
    .string()
    .min(8, { message: "Hasło musi zawierać co najmniej 8 znaków" })
    .regex(/.*[A-Z].*/, { message: "Hasło musi zawierać co najmniej jedną wielką literę" })
    .regex(/.*[a-z].*/, { message: "Hasło musi zawierać co najmniej jedną małą literę" })
    .regex(/.*\d.*/, { message: "Hasło musi zawierać co najmniej jedną cyfrę" })
    .regex(/.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-].*/, { 
      message: "Hasło musi zawierać co najmniej jeden znak specjalny" 
    })
});

// Schemat walidacji Zod dla logowania
const loginUserSchema = z.object({
  email: z.string().email({ message: "Podaj poprawny adres email" }),
  password: z.string().min(1, { message: "Podaj hasło" })
});
```

## 4. Szczegóły odpowiedzi

### Rejestracja użytkownika (sukces)
- **Kod statusu**: 201 Created
- **Odpowiedź**:
  ```typescript
  {
    id: string;              // UUID nowego użytkownika
    email: string;           // Potwierdzenie adresu email
    registrationDate: string; // Data rejestracji w formacie ISO 8601
    token: string;           // JWT token uwierzytelniający
  }
  ```

### Rejestracja użytkownika (błąd)
- **Kod statusu**: 400 Bad Request (nieprawidłowe dane) lub 409 Conflict (email już istnieje)
- **Odpowiedź**:
  ```typescript
  {
    error: string;           // Ogólny opis błędu
    details?: string[];      // Opcjonalne szczegóły błędów walidacji
  }
  ```

### Logowanie użytkownika (sukces)
- **Kod statusu**: 200 OK
- **Odpowiedź**:
  ```typescript
  {
    id: string;              // UUID użytkownika
    email: string;           // Adres email użytkownika
    token: string;           // JWT token uwierzytelniający
  }
  ```

### Logowanie użytkownika (błąd)
- **Kod statusu**: 400 Bad Request (nieprawidłowe dane) lub 401 Unauthorized (nieprawidłowe dane logowania)
- **Odpowiedź**:
  ```typescript
  {
    error: string;           // Opis błędu
    details?: string[];      // Opcjonalne szczegóły błędów walidacji
  }
  ```

## 5. Przepływ danych

### Rejestracja użytkownika
1. Endpoint `/api/auth/register` otrzymuje żądanie POST z danymi rejestracyjnymi
2. Walidacja danych przy użyciu schematu Zod
3. Sprawdzenie, czy użytkownik o podanym adresie email już istnieje w bazie danych
4. Utworzenie nowego użytkownika przy użyciu Supabase Auth
5. Zapisanie dodatkowych danych użytkownika w tabeli `users`
6. Wygenerowanie JWT tokenu
7. Zwrócenie danych nowego użytkownika wraz z tokenem

### Logowanie użytkownika
1. Endpoint `/api/auth/login` otrzymuje żądanie POST z danymi logowania
2. Walidacja danych przy użyciu schematu Zod
3. Uwierzytelnienie użytkownika przy użyciu Supabase Auth
4. Aktualizacja pola `last_login_date` w tabeli `users`
5. Wygenerowanie JWT tokenu
6. Zwrócenie danych użytkownika wraz z tokenem

## 6. Względy bezpieczeństwa

1. **Bezpieczne przechowywanie haseł**
   - Wykorzystanie Supabase Auth do bezpiecznego hashowania haseł
   - Nigdy nie przechowuj haseł w plaintext

2. **Bezpieczeństwo tokenów JWT**
   - Ustaw odpowiedni czas wygaśnięcia tokenu (np. 1 dzień)
   - Zawieraj tylko niezbędne informacje w tokenie
   - Używaj HTTPS dla wszystkich endpointów API

3. **Ograniczanie liczby zapytań**
   - Zastosuj limit prób logowania (np. 5 prób w ciągu 15 minut)
   - Rozważ blokadę czasową po zbyt wielu nieudanych próbach logowania

4. **Walidacja danych wejściowych**
   - Używaj Zod do dokładnej walidacji schematów
   - Sanityzuj wszystkie dane wejściowe, aby zapobiec atakom wstrzykiwania

5. **Komplikacja hasła**
   - Wymagaj złożonych haseł (duże i małe litery, cyfry, znaki specjalne)
   - Minimalna długość hasła: 8 znaków

## 7. Obsługa błędów

### Rejestracja użytkownika
- **400 Bad Request**
  - Brakujące wymagane pola
  - Nieprawidłowy format adresu email
  - Niedostatecznie bezpieczne hasło
- **409 Conflict**
  - Email już istnieje w systemie
- **500 Internal Server Error**
  - Błąd podczas tworzenia użytkownika w Supabase
  - Błąd podczas generowania tokenu JWT

### Logowanie użytkownika
- **400 Bad Request**
  - Brakujące wymagane pola
  - Nieprawidłowy format adresu email
- **401 Unauthorized**
  - Nieprawidłowe dane logowania (email i/lub hasło)
- **500 Internal Server Error**
  - Błąd podczas uwierzytelniania w Supabase
  - Błąd podczas generowania tokenu JWT

## 8. Rozważania dotyczące wydajności

1. **Indeksowanie bazy danych**
   - Upewnij się, że pole `email` w tabeli `users` jest zindeksowane dla szybkiego wyszukiwania

2. **Buforowanie**
   - Rozważ buforowanie tokenów JWT dla aktywnych sesji

3. **Walidacja po stronie klienta**
   - Zaimplementuj podstawową walidację po stronie klienta, aby zmniejszyć liczbę niepotrzebnych zapytań do serwera

4. **Asynchroniczne przetwarzanie logów**
   - Używaj asynchronicznego przetwarzania do zapisywania logów i śledzenia aktywności logowania

## 9. Etapy wdrożenia

### Implementacja endpointu rejestracji
1. Utwórz plik `src/pages/api/auth/register.ts`
2. Zaimplementuj schemat walidacji Zod
3. Obsłuż walidację danych wejściowych
4. Sprawdź czy użytkownik już istnieje
5. Zaimplementuj logikę tworzenia użytkownika przy użyciu Supabase Auth
6. Zapisz dodatkowe dane użytkownika do tabeli `users`
7. Wygeneruj i zwróć token JWT
8. Zaimplementuj obsługę błędów

### Implementacja endpointu logowania
1. Utwórz plik `src/pages/api/auth/login.ts`
2. Zaimplementuj schemat walidacji Zod
3. Obsłuż walidację danych wejściowych
4. Zaimplementuj logikę uwierzytelniania przy użyciu Supabase Auth
5. Zaktualizuj pole `last_login_date` w tabeli `users`
6. Wygeneruj i zwróć token JWT
7. Zaimplementuj obsługę błędów

### Testowanie
1. Utwórz testy jednostkowe dla walidacji danych
2. Utwórz testy integracyjne dla endpointów
3. Przetestuj scenariusze błędów i przypadki brzegowe
4. Przeprowadź testy bezpieczeństwa (np. próby ataków brute force)

### Dokumentacja
1. Zaktualizuj dokumentację API dla obu endpointów
2. Dodaj przykłady użycia do dokumentacji
3. Opisz kody statusów i komunikaty błędów

### Wdrożenie
1. Przegląd kodu przed wdrożeniem
2. Wdrożenie na środowisku testowym
3. Testy akceptacyjne
4. Wdrożenie na środowisku produkcyjnym
5. Monitoring po wdrożeniu 