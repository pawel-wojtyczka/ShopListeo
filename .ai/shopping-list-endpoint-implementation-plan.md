# Plan wdrożenia punktu końcowego API: Utworzenie listy zakupów

## 1. Przegląd punktu końcowego
Ten punkt końcowy pozwala uwierzytelnionym użytkownikom na utworzenie nowej listy zakupów. Jego głównym zadaniem jest dodanie nowego rekordu do tabeli shopping_lists, powiązanego z bieżącym użytkownikiem.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Adres URL punktu końcowego:** `/api/shopping-lists`
- **Parametry:**
  - **Wymagane:**
    - `title` (string): Tytuł listy zakupów (nie może być pusty i musi zawierać od 1 do 255 znaków).
  - **Opcjonalne:** Brak
- **Treść żądania:**
  ```json
  {
    "title": "string"
  }
  ```

## 3. Wykorzystywane typy
- **DTO i modele komend:**
  - `CreateShoppingListRequest` – reprezentuje przychodzące żądanie, zawierające pojedyncze pole `title`.
  - `CreateShoppingListResponse` – reprezentuje odpowiedź, zawierającą pola `id`, `title`, `createdAt` oraz `updatedAt`.

Te typy są zdefiniowane w pliku `src/types.ts`.

## 4. Szczegóły odpowiedzi
- **Treść odpowiedzi:**
  ```json
  {
    "id": "uuid",
    "title": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```
- **Kod statusu w przypadku sukcesu:** 201 Created

## 5. Przepływ danych
1. Uwierzytelniony użytkownik wysyła żądanie POST z tytułem listy zakupów.
2. Punkt końcowy waliduje treść żądania przy użyciu schematu Zod (upewniając się, że `title` jest poprawnym ciągiem znaków i spełnia ograniczenia długości).
3. ID użytkownika jest pobierane z kontekstu uwierzytelnienia (przy użyciu `context.locals.supabase` oraz poprawnego typu `SupabaseClient`).
4. Wywoływana jest funkcja warstwy serwisowej, która wykonuje operację wstawienia nowego rekordu do tabeli `shopping_lists`, automatycznie obsługując znaczniki czasu `created_at` i `updated_at`.
5. W przypadku powodzenia, nowo utworzony rekord listy zakupów jest zwracany w odpowiedzi.
6. W przypadku błędów walidacji lub autoryzacji, punkt końcowy zwraca odpowiedni kod błędu HTTP.

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie i autoryzacja:**
  - Dostęp do tego punktu końcowego mają wyłącznie uwierzytelnieni użytkownicy. Token uwierzytelniający jest weryfikowany za pomocą Supabase przy użyciu `context.locals`.
- **Walidacja danych:**
  - Dane wejściowe są walidowane przy użyciu schematu Zod, aby upewnić się, że pole `title` spełnia wymagane kryteria (niepuste, odpowiednia długość).
- **Bezpieczeństwo bazy danych:**
  - Operacje na bazie danych są realizowane przy użyciu klienta Supabase z `context.locals`, co gwarantuje bezpieczne zarządzanie połączeniami oraz właściwą obsługę błędów.

## 7. Obsługa błędów
- **400 Bad Request:** Zwracany, gdy walidacja treści żądania nie powiedzie się (np. brak lub niepoprawne pole `title`).
- **401 Unauthorized:** Zwracany, gdy token uwierzytelniający jest nieobecny lub niepoprawny.
- **500 Internal Server Error:** Zwracany w przypadku nieoczekiwanych błędów po stronie serwera lub bazy danych.
- Wszystkie błędy powinny być logowane z wystarczającą ilością szczegółów, aby ułatwić diagnozowanie problemu, przy jednoczesnym zachowaniu poufności wrażliwych informacji.

## 8. Rozważania dotyczące wydajności
- Operacja polega na pojedynczym wstawieniu rekordu do bazy danych, co zazwyczaj jest szybkie i efektywne.
- Należy zadbać o odpowiednie indeksowanie tabeli `shopping_lists` (szczególnie kolumny `user_id`), aby zoptymalizować przyszłe zapytania.
- Monitorować działanie punktu końcowego pod kątem wydajności wraz ze wzrostem liczby użytkowników i w razie potrzeby dostosowywać indeksowanie oraz optymalizować zapytania.

## 9. Etapy wdrożenia
1. **Konfiguracja uwierzytelnienia:** Upewnić się, że middleware weryfikuje tokeny uwierzytelniające i ogranicza dostęp do punktu końcowego tylko dla uwierzytelnionych użytkowników.
2. **Walidacja danych wejściowych:** Zaimplementować schemat Zod do walidacji pola `title` w treści żądania.
3. **Implementacja warstwy serwisowej:** Utworzyć lub zaktualizować funkcję serwisową, która obsłuży logikę biznesową wstawiania nowej listy zakupów do bazy danych.
4. **Implementacja punktu końcowego API:** Opracować punkt końcowy POST `/api/shopping-lists` w ramach trasy Astro, integrując walidację i warstwę serwisową.
5. **Operacja na bazie danych:** Wykonać operację wstawienia przy użyciu klienta Supabase, zapewniając odpowiednią obsługę błędów podczas transakcji.
6. **Formowanie odpowiedzi:** Zwrócić odpowiedź z kodem 201 Created wraz z danymi nowo utworzonej listy zakupów lub odpowiednio obsłużyć błędy.
7. **Testowanie:** Napisać testy integracyjne, które obejmą scenariusze poprawnego utworzenia, błędy walidacji oraz sytuacje nieautoryzowanego dostępu.
8. **Dokumentacja:** Zaktualizować dokumentację API oraz przewodniki dla deweloperów o nowy punkt końcowy.
9. **Monitorowanie i logowanie:** Skonfigurować logowanie oraz monitorowanie wydajności, aby móc na bieżąco oceniać działanie punktu końcowego w środowisku produkcyjnym. 