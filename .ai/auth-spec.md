# Specyfikacja modułu autoryzacji i uwierzytelniania

Ta specyfikacja opisuje architekturę funkcjonalności związanych z rejestracją, logowaniem, wylogowywaniem oraz odzyskiwaniem hasła, zgodnie z wymaganiami określonymi w PRD (US-001 i US-006) oraz zgodnie z wykorzystaniem stosu technologicznego (Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui oraz Supabase Auth).

---

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Strony i układy

- Utworzone zostaną dedykowane strony Astro:
  - `/login` – strona logowania
  - `/register` – strona rejestracji
  - `/recover` – strona odzyskiwania hasła
  - Dodatkowo, główny layout (np. `@Layout.astro`) zostanie rozszerzony o komponent widoczny w prawym górnym rogu, odpowiedzialny za wyświetlanie stanu autoryzacji (przyciski logowania/wylogowania).
- Wersje interfejsu będą rozdzielone na tryb auth oraz non-auth, gdzie strony chronione będą wymagały weryfikacji autentyczności użytkownika (mechanizm middleware w Astro).

### 1.2 Komponenty client-side (React) i Astro

- Komponenty formularzy rejestracji, logowania i odzyskiwania hasła będą implementowane jako komponenty React. Dzięki integracji z Shadcn/ui będą posiadały spójny i responsywny design.
- Strony Astro będą odpowiedzialne za nawigację, layout oraz integrację z backendem autentykacji. Formularze React będą osadzane w stronach Astro, dzięki czemu zostanie zachowana izolacja stanu sesji i logiki biznesowej.
- Komponenty React będą wykorzystywać hooki (np. useState, useEffect) oraz kontekst użytkownika, co ułatwi zarządzanie stanem autentykacji w całej aplikacji.

### 1.3 Walidacja i komunikaty błędów

- Formularze rejestracji będą zawierały następującą walidację:
  - Poprawny format adresu email.
  - Wymóg minimalnej długości hasła.
  - Sprawdzenie zgodności pola "hasło" i "potwierdź hasło".
- Formularze logowania i odzyskiwania hasła będą walidowały obecność wymaganych pól oraz format wprowadzonych danych.
- Każdy błąd walidacji wyświetlany będzie użytkownikowi za pomocą czytelnych komunikatów (np. "Nieprawidłowy format email" czy "Hasła nie są zgodne").
- Obsługa stanów: ładowanie, błąd, sukces. Komponenty będą odpowiednio reagować na zmiany stanu (np. wyświetlanie spinnera podczas przetwarzania żądania).

### 1.4 Kluczowe scenariusze użytkownika

- Rejestracja nowego konta przy użyciu emaila, hasła i potwierdzenia hasła.
- Logowanie do systemu za pomocą istniejącego konta.
- Odzyskiwanie hasła poprzez podanie adresu email oraz wysłanie linku/resetu hasła.
- Wylogowywanie z aplikacji przez kliknięcie przycisku wylogowania umieszczonego w głównym layout.
- Obsługa komunikacji błędów, takich jak niepoprawne dane logowania, błędy serwera, przekroczenie limitu prób itp.

---

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura endpointów API

- Utworzone zostaną endpointy w katalogu `./src/pages/api/auth`:
  - `/api/auth/register` – obsługuje rejestrację użytkownika.
  - `/api/auth/login` – obsługuje logowanie użytkownika.
  - `/api/auth/logout` – obsługuje wylogowywanie użytkownika.
  - `/api/auth/recover` – obsługuje proces odzyskiwania hasła.
- Każdy endpoint odpowiada za walidację danych wejściowych, komunikację z Supabase Auth oraz przesyłanie odpowiedzi do klienta.

### 2.2 Modele danych

- Dane użytkownika obejmują:
  - email
  - hasło (przechowywane w postaci zahashowanej)
  - data rejestracji (ISO 8601)
  - data ostatniego logowania (ISO 8601)
  - data ostatniej aktualizacji
- Opcjonalnie dodatkowe pola, jak status weryfikacji konta.

### 2.3 Walidacja i obsługa wyjątków

- Implementacja mechanizmów walidacji przy użyciu bibliotek typu Zod lub Yup:
  - Sprawdzenie poprawności formatu email.
  - Weryfikacja spełnienia kryteriów hasła (np. minimalna długość).
  - Weryfikacja zgodności pól (hasło vs. potwierdzenie hasła).
- Każdy endpoint będzie posiadał blok try-catch, który:
  - Rejestruje szczegóły błędu (np. treść błędu, czas, identyfikator użytkownika) w bazie `errors_log`.
  - Zwraca czytelne komunikaty o błędach do użytkownika.

### 2.4 Aktualizacja renderowania stron server-side

- W oparciu o konfigurację w `astro.config.mjs` zostaną wdrożone mechanizmy sprawdzania stanu autentykacji.
- Strony serwerowe będą renderowane conditionally, zależnie od tego, czy użytkownik jest zalogowany, co zostanie zrealizowane przez dedykowane middleware lub warunki w layoutach Astro.

---

## 3. SYSTEM AUTENTYKACJI

### 3.1 Integracja z Supabase Auth

- System uwierzytelniania będzie oparty o Supabase Auth, który umożliwia:
  - Rejestrację (signup) – tworzenie nowego użytkownika z wykorzystaniem emaila i hasła.
  - Logowanie (signin) – uwierzytelnianie istniejącego użytkownika.
  - Wylogowywanie (signout) – zakończenie sesji użytkownika.
  - Odzyskiwanie hasła – wysyłanie linku resetującego hasło oraz proces zmiany hasła.
- Implementacja wykorzysta istniejący klient Supabase zdefiniowany w katalogu `./src/db`.

### 3.2 Mechanizmy sesji i bezpieczeństwa

- Uwierzytelnianie opiera się na tokenach (np. JWT) lub ciasteczkach sesyjnych, które są bezpiecznie przekazywane między klientem a serwerem.
- Dodatkowe zabezpieczenia obejmują:
  - Szyfrowanie haseł (hashing z wykorzystaniem bezpiecznych algorytmów, np. bcrypt).
  - Ograniczenia liczby prób logowania/rejestracji, aby uniknąć ataków typu brute force.
  - Użycie HTTPS dla transmisji danych.

### 3.3 Integracja z warstwą prezentacji

- Strony Astro oraz komponenty React będą komunikować się z backendem poprzez zdefiniowane endpointy API.
- Stan autentykacji będzie przekazywany do komponentów React za pomocą kontekstu i hooków, umożliwiając dynamiczne aktualizacje interfejsu (np. wyświetlanie odpowiednich przycisków, przekierowania).
- Middleware w Astro będzie sprawdzał stan autentykacji przy próbie dostępu do stron chronionych i w razie potrzeby przekierowywał użytkownika na stronę logowania.

---

## Podsumowanie

Specyfikacja ta przedstawia kompleksowe podejście do wdrożenia modułu autoryzacji i uwierzytelniania w projekcie ShopListeo z zastosowaniem nowoczesnych technologii (Astro, React, TypeScript, Tailwind, Shadcn/ui i Supabase Auth). Podejście to uwzględnia zarówno warstwę interfejsu użytkownika, backendową logikę operacyjną, jak i integrację z systemem autoryzacji, gwarantując spójność działania oraz wysokie bezpieczeństwo przetwarzanych danych.
