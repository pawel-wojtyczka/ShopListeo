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

# Plan wdrożenia punktu końcowego API: Pobieranie wszystkich list zakupów

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia uwierzytelnionym użytkownikom pobieranie wszystkich swoich list zakupów wraz z podstawowymi informacjami o każdej liście, w tym liczbą elementów. Obsługuje paginację, sortowanie i porządkowanie danych zgodnie z preferencjami użytkownika.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Adres URL punktu końcowego:** `/api/shopping-lists`
- **Parametry:**
  - **Opcjonalne:**
    - `page` (integer, domyślnie: 1): Numer strony wyników
    - `pageSize` (integer, domyślnie: 20): Liczba elementów na stronę
    - `sort` (string, opcjonalnie): Pole, według którego sortowane są wyniki (title, createdAt, updatedAt)
    - `order` (string, opcjonalnie): Kolejność sortowania (asc, desc)

## 3. Wykorzystywane typy
- **DTO i modele komend:**
  - `ShoppingListSummaryDTO` – reprezentuje podsumowanie pojedynczej listy zakupów w odpowiedzi
  - `GetAllShoppingListsResponse` – reprezentuje pełną odpowiedź z danymi list zakupów i informacjami o paginacji
  - `PaginationResponse` – reprezentuje informacje o paginacji

Te typy są zdefiniowane w pliku `src/types.ts`.

## 4. Szczegóły odpowiedzi
- **Treść odpowiedzi:**
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "title": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "itemCount": "integer"
      }
    ],
    "pagination": {
      "totalItems": "integer",
      "totalPages": "integer",
      "currentPage": "integer",
      "pageSize": "integer"
    }
  }
  ```
- **Kod statusu w przypadku sukcesu:** 200 OK

## 5. Przepływ danych
1. Uwierzytelniony użytkownik wysyła żądanie GET z opcjonalnymi parametrami zapytania (page, pageSize, sort, order).
2. Punkt końcowy waliduje parametry zapytania (używając schematu Zod do sprawdzenia poprawności typów i zakresów wartości).
3. ID użytkownika jest pobierane z kontekstu uwierzytelniania (przy użyciu `context.locals.supabase`).
4. Wywoływana jest funkcja warstwy serwisowej, która:
   - Pobiera listy zakupów należące do użytkownika, uwzględniając parametry paginacji i sortowania
   - Wykonuje zapytanie liczące elementy dla każdej listy zakupów (lub wykorzystuje relację)
   - Oblicza informacje o paginacji (całkowita liczba elementów, liczba stron itp.)
5. W przypadku powodzenia, dane list zakupów wraz z informacjami o paginacji są zwracane w odpowiedzi.
6. W przypadku błędów uwierzytelniania, punkt końcowy zwraca odpowiedni kod błędu HTTP.

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie i autoryzacja:**
  - Dostęp do tego punktu końcowego mają wyłącznie uwierzytelnieni użytkownicy. Token uwierzytelniający jest weryfikowany za pomocą Supabase przy użyciu `context.locals`.
  - Użytkownik może pobierać tylko własne listy zakupów, co jest zapewnione przez filtrowanie po `user_id` w zapytaniu do bazy danych.
- **Walidacja danych:**
  - Parametry zapytania są walidowane przy użyciu schematu Zod, aby zapewnić, że są odpowiedniego typu i mieszczą się w dozwolonych zakresach.
- **Bezpieczeństwo bazy danych:**
  - Zapytania do bazy danych są parametryzowane, aby zapobiec atakom SQL injection.
  - Operacje na bazie danych są realizowane przy użyciu klienta Supabase z `context.locals`, co zapewnia bezpieczne zarządzanie połączeniami.

## 7. Obsługa błędów
- **400 Bad Request:** Zwracany, gdy walidacja parametrów zapytania nie powiedzie się (np. nieprawidłowy format parametru).
- **401 Unauthorized:** Zwracany, gdy token uwierzytelniający jest nieobecny lub niepoprawny.
- **500 Internal Server Error:** Zwracany w przypadku nieoczekiwanych błędów po stronie serwera lub bazy danych.
- Wszystkie błędy powinny być logowane z wystarczającą ilością szczegółów, aby ułatwić diagnozowanie problemu, przy jednoczesnym zachowaniu poufności wrażliwych informacji.

## 8. Rozważania dotyczące wydajności
- Paginacja jest kluczowa dla optymalizacji wydajności, szczególnie gdy użytkownik ma wiele list zakupów.
- Zapytanie liczące elementy dla każdej listy zakupów może obciążać bazę danych; należy rozważyć zoptymalizowanie tego przez:
  - Agregowanie liczby elementów w jednym zapytaniu dla wszystkich list na stronie
  - Wykorzystanie relacji w Supabase do efektywnego pobierania liczby elementów
- Indeksy bazy danych powinny być zoptymalizowane dla zapytań sortowania (na kolumnach `user_id`, `title`, `created_at`, `updated_at`).
- Rozważyć wprowadzenie pamięci podręcznej (caching) dla często używanych list zakupów, aby zmniejszyć obciążenie bazy danych.

## 9. Etapy wdrożenia
1. **Konfiguracja uwierzytelnienia:** Upewnić się, że middleware weryfikuje tokeny uwierzytelniające i ogranicza dostęp do punktu końcowego tylko dla uwierzytelnionych użytkowników.
2. **Walidacja parametrów zapytania:** Zaimplementować schemat Zod do walidacji parametrów zapytania.
3. **Implementacja warstwy serwisowej:** Utworzyć lub zaktualizować funkcję serwisową, która obsłuży logikę biznesową pobierania list zakupów z paginacją i sortowaniem.
4. **Implementacja punktu końcowego API:** Opracować punkt końcowy GET `/api/shopping-lists` w ramach trasy Astro, integrując walidację i warstwę serwisową.
5. **Obsługa paginacji i sortowania:** Zaimplementować logikę do obsługi parametrów paginacji i sortowania w zapytaniach do bazy danych.
6. **Liczenie elementów list:** Zaimplementować efektywną metodę liczenia elementów dla każdej listy zakupów.
7. **Formowanie odpowiedzi:** Odpowiednio formatować odpowiedź z wykorzystaniem typów DTO i uwzględniać informacje o paginacji.
8. **Testowanie:** Napisać testy integracyjne, które obejmą różne scenariusze paginacji, sortowania oraz obsługę błędów.
9. **Optymalizacja wydajności:** Przeanalizować wydajność zapytań i zoptymalizować indeksy bazy danych.
10. **Dokumentacja:** Zaktualizować dokumentację API oraz przewodniki dla deweloperów o nowy punkt końcowy.
11. **Monitorowanie:** Skonfigurować monitorowanie wydajności punktu końcowego, aby identyfikować i rozwiązywać potencjalne problemy.

# Plan wdrożenia punktu końcowego API: Pobieranie listy zakupów według ID

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia uwierzytelnionym użytkownikom pobieranie szczegółowych informacji o konkretnej liście zakupów wraz ze wszystkimi jej elementami. Użytkownik może uzyskać dostęp tylko do własnych list zakupów.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Adres URL punktu końcowego:** `/api/shopping-lists/{id}`
- **Parametry:**
  - **Wymagane:**
    - `id` (UUID): Identyfikator listy zakupów (jako parametr ścieżki)
  - **Opcjonalne:** Brak

## 3. Wykorzystywane typy
- **DTO i modele komend:**
  - `GetShoppingListByIdResponse` – reprezentuje odpowiedź zawierającą szczegóły listy zakupów i jej elementy
  - `ShoppingListItemDTO` – reprezentuje pojedynczy element listy zakupów w odpowiedzi

Te typy są zdefiniowane w pliku `src/types.ts`.

## 4. Szczegóły odpowiedzi
- **Treść odpowiedzi:**
  ```json
  {
    "id": "uuid",
    "title": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "items": [
      {
        "id": "uuid",
        "itemName": "string",
        "purchased": "boolean",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    ]
  }
  ```
- **Kod statusu w przypadku sukcesu:** 200 OK

## 5. Przepływ danych
1. Uwierzytelniony użytkownik wysyła żądanie GET z identyfikatorem listy zakupów jako parametrem ścieżki.
2. Punkt końcowy waliduje format identyfikatora (UUID).
3. ID użytkownika jest pobierane z kontekstu uwierzytelniania (przy użyciu `context.locals.supabase`).
4. Wywoływana jest funkcja warstwy serwisowej, która:
   - Pobiera listę zakupów o określonym ID, należącą do użytkownika
   - Sprawdza, czy lista istnieje i czy należy do bieżącego użytkownika
   - Pobiera wszystkie elementy powiązane z tą listą zakupów
5. W przypadku znalezienia listy, jej dane wraz z elementami są zwracane w odpowiedzi.
6. W przypadku gdy lista nie zostanie znaleziona lub nie należy do bieżącego użytkownika, zwracany jest odpowiedni kod błędu.

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie i autoryzacja:**
  - Dostęp do tego punktu końcowego mają wyłącznie uwierzytelnieni użytkownicy. Token uwierzytelniający jest weryfikowany za pomocą Supabase przy użyciu `context.locals`.
  - Autoryzacja jest implementowana przez sprawdzenie, czy lista zakupów należy do bieżącego użytkownika (`user_id` w rekordzie listy zakupów).
- **Walidacja danych:**
  - Parametr identyfikatora jest walidowany, aby zapewnić, że jest poprawnym UUID.
- **Bezpieczeństwo bazy danych:**
  - Zapytania do bazy danych są parametryzowane, aby zapobiec atakom SQL injection.
  - Operacje na bazie danych są realizowane przy użyciu klienta Supabase z `context.locals`, co zapewnia bezpieczne zarządzanie połączeniami.

## 7. Obsługa błędów
- **400 Bad Request:** Zwracany, gdy format identyfikatora jest nieprawidłowy.
- **401 Unauthorized:** Zwracany, gdy token uwierzytelniający jest nieobecny lub niepoprawny.
- **403 Forbidden:** Zwracany, gdy lista zakupów istnieje, ale nie należy do bieżącego użytkownika.
- **404 Not Found:** Zwracany, gdy lista zakupów o podanym identyfikatorze nie istnieje.
- **500 Internal Server Error:** Zwracany w przypadku nieoczekiwanych błędów po stronie serwera lub bazy danych.
- Wszystkie błędy powinny być logowane z wystarczającą ilością szczegółów, aby ułatwić diagnozowanie problemu, przy jednoczesnym zachowaniu poufności wrażliwych informacji.

## 8. Rozważania dotyczące wydajności
- Zapytanie powinno wykorzystywać relacje w bazie danych, aby efektywnie pobierać listę zakupów wraz z jej elementami.
- Dla list z dużą liczbą elementów może być potrzebna paginacja elementów, choć nie jest to wymagane w bieżącej specyfikacji.
- Indeksy bazy danych powinny być zoptymalizowane dla szybkiego wyszukiwania po `id` oraz `user_id`.
- Rozważyć wprowadzenie pamięci podręcznej (caching) dla często przeglądanych list zakupów, aby zmniejszyć obciążenie bazy danych.

## 9. Etapy wdrożenia
1. **Konfiguracja uwierzytelnienia:** Upewnić się, że middleware weryfikuje tokeny uwierzytelniające i ogranicza dostęp do punktu końcowego tylko dla uwierzytelnionych użytkowników.
2. **Walidacja parametru identyfikatora:** Zaimplementować walidację formatu UUID dla parametru ścieżki.
3. **Implementacja warstwy serwisowej:** Utworzyć lub zaktualizować funkcję serwisową, która obsłuży logikę biznesową pobierania listy zakupów wraz z jej elementami.
4. **Implementacja weryfikacji właściciela:** Upewnić się, że punktu końcowy sprawdza, czy lista należy do bieżącego użytkownika.
5. **Implementacja punktu końcowego API:** Opracować punkt końcowy GET `/api/shopping-lists/{id}` w ramach trasy Astro, integrując walidację i warstwę serwisową.
6. **Obsługa relacji bazy danych:** Zaimplementować efektywne zapytania wykorzystujące relacje między tabelami `shopping_lists` i `shopping_list_items`.
7. **Formowanie odpowiedzi:** Odpowiednio formatować odpowiedź z wykorzystaniem typów DTO.
8. **Testowanie:** Napisać testy integracyjne, które obejmą różne scenariusze, w tym pobieranie istniejącej listy, nieautoryzowany dostęp, nieistniejącą listę itp.
9. **Optymalizacja wydajności:** Przeanalizować wydajność zapytań i zoptymalizować indeksy bazy danych.
10. **Dokumentacja:** Zaktualizować dokumentację API oraz przewodniki dla deweloperów o nowy punkt końcowy.
11. **Monitorowanie:** Skonfigurować monitorowanie wydajności punktu końcowego, aby identyfikować i rozwiązywać potencjalne problemy.

# Plan wdrożenia punktu końcowego API: Aktualizacja listy zakupów

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia uwierzytelnionym użytkownikom aktualizację tytułu istniejącej listy zakupów. Użytkownik może aktualizować tylko własne listy zakupów.

## 2. Szczegóły żądania
- **Metoda HTTP:** PUT
- **Adres URL punktu końcowego:** `/api/shopping-lists/{id}`
- **Parametry:**
  - **Wymagane:**
    - `id` (UUID): Identyfikator listy zakupów (jako parametr ścieżki)
  - **Opcjonalne:** Brak
- **Treść żądania:**
  ```json
  {
    "title": "string"
  }
  ```

## 3. Wykorzystywane typy
- **DTO i modele komend:**
  - `UpdateShoppingListRequest` – reprezentuje przychodzące żądanie, zawierające pole `title`
  - `UpdateShoppingListResponse` – reprezentuje odpowiedź, zawierającą pola `id`, `title` oraz `updatedAt`

Te typy są zdefiniowane w pliku `src/types.ts`.

## 4. Szczegóły odpowiedzi
- **Treść odpowiedzi:**
  ```json
  {
    "id": "uuid",
    "title": "string",
    "updatedAt": "timestamp"
  }
  ```
- **Kod statusu w przypadku sukcesu:** 200 OK

## 5. Przepływ danych
1. Uwierzytelniony użytkownik wysyła żądanie PUT z identyfikatorem listy zakupów jako parametrem ścieżki i nowym tytułem w treści żądania.
2. Punkt końcowy waliduje format identyfikatora (UUID) oraz treść żądania (upewniając się, że pole `title` jest poprawnym ciągiem znaków i spełnia ograniczenia długości).
3. ID użytkownika jest pobierane z kontekstu uwierzytelniania (przy użyciu `context.locals.supabase`).
4. Wywoływana jest funkcja warstwy serwisowej, która:
   - Sprawdza, czy lista zakupów o podanym ID istnieje i należy do bieżącego użytkownika
   - Aktualizuje tytuł listy zakupów w bazie danych
   - Automatycznie aktualizuje znacznik czasu `updated_at`
5. W przypadku powodzenia, zaktualizowane dane listy zakupów są zwracane w odpowiedzi.
6. W przypadku błędów walidacji, autoryzacji lub gdy lista nie zostanie znaleziona, zwracany jest odpowiedni kod błędu.

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie i autoryzacja:**
  - Dostęp do tego punktu końcowego mają wyłącznie uwierzytelnieni użytkownicy. Token uwierzytelniający jest weryfikowany za pomocą Supabase przy użyciu `context.locals`.
  - Autoryzacja jest implementowana przez sprawdzenie, czy lista zakupów należy do bieżącego użytkownika (`user_id` w rekordzie listy zakupów).
- **Walidacja danych:**
  - Parametr identyfikatora jest walidowany, aby zapewnić, że jest poprawnym UUID.
  - Dane wejściowe są walidowane przy użyciu schematu Zod, aby upewnić się, że pole `title` spełnia wymagane kryteria (niepuste, odpowiednia długość).
- **Bezpieczeństwo bazy danych:**
  - Zapytania do bazy danych są parametryzowane, aby zapobiec atakom SQL injection.
  - Operacje na bazie danych są realizowane przy użyciu klienta Supabase z `context.locals`, co zapewnia bezpieczne zarządzanie połączeniami.

## 7. Obsługa błędów
- **400 Bad Request:** Zwracany, gdy format identyfikatora jest nieprawidłowy lub walidacja treści żądania nie powiedzie się.
- **401 Unauthorized:** Zwracany, gdy token uwierzytelniający jest nieobecny lub niepoprawny.
- **403 Forbidden:** Zwracany, gdy lista zakupów istnieje, ale nie należy do bieżącego użytkownika.
- **404 Not Found:** Zwracany, gdy lista zakupów o podanym identyfikatorze nie istnieje.
- **500 Internal Server Error:** Zwracany w przypadku nieoczekiwanych błędów po stronie serwera lub bazy danych.
- Wszystkie błędy powinny być logowane z wystarczającą ilością szczegółów, aby ułatwić diagnozowanie problemu, przy jednoczesnym zachowaniu poufności wrażliwych informacji.

## 8. Rozważania dotyczące wydajności
- Operacja polega na pojedynczej aktualizacji rekordu w bazie danych, co zazwyczaj jest szybkie i efektywne.
- Indeksy bazy danych powinny być zoptymalizowane dla szybkiego wyszukiwania po `id` oraz `user_id`.
- Monitorować działanie punktu końcowego pod kątem wydajności wraz ze wzrostem liczby użytkowników i w razie potrzeby dostosowywać indeksowanie oraz optymalizować zapytania.

## 9. Etapy wdrożenia
1. **Konfiguracja uwierzytelnienia:** Upewnić się, że middleware weryfikuje tokeny uwierzytelniające i ogranicza dostęp do punktu końcowego tylko dla uwierzytelnionych użytkowników.
2. **Walidacja parametru identyfikatora:** Zaimplementować walidację formatu UUID dla parametru ścieżki.
3. **Walidacja danych wejściowych:** Zaimplementować schemat Zod do walidacji pola `title` w treści żądania.
4. **Implementacja warstwy serwisowej:** Utworzyć lub zaktualizować funkcję serwisową, która obsłuży logikę biznesową aktualizacji listy zakupów.
5. **Implementacja weryfikacji właściciela:** Upewnić się, że punktu końcowy sprawdza, czy lista należy do bieżącego użytkownika.
6. **Implementacja punktu końcowego API:** Opracować punkt końcowy PUT `/api/shopping-lists/{id}` w ramach trasy Astro, integrując walidację i warstwę serwisową.
7. **Operacja na bazie danych:** Wykonać operację aktualizacji przy użyciu klienta Supabase, zapewniając odpowiednią obsługę błędów podczas transakcji.
8. **Formowanie odpowiedzi:** Zwrócić odpowiedź z kodem 200 OK wraz z zaktualizowanymi danymi listy zakupów lub odpowiednio obsłużyć błędy.
9. **Testowanie:** Napisać testy integracyjne, które obejmą różne scenariusze aktualizacji, błędy walidacji, nieautoryzowany dostęp, nieistniejącą listę itp.
10. **Dokumentacja:** Zaktualizować dokumentację API oraz przewodniki dla deweloperów o nowy punkt końcowy.
11. **Monitorowanie:** Skonfigurować monitorowanie wydajności punktu końcowego, aby identyfikować i rozwiązywać potencjalne problemy.

# Plan wdrożenia punktu końcowego API: Usuwanie listy zakupów

## 1. Przegląd punktu końcowego
Ten punkt końcowy umożliwia uwierzytelnionym użytkownikom usuwanie istniejącej listy zakupów wraz ze wszystkimi jej elementami. Użytkownik może usuwać tylko własne listy zakupów.

## 2. Szczegóły żądania
- **Metoda HTTP:** DELETE
- **Adres URL punktu końcowego:** `/api/shopping-lists/{id}`
- **Parametry:**
  - **Wymagane:**
    - `id` (UUID): Identyfikator listy zakupów (jako parametr ścieżki)
  - **Opcjonalne:** Brak
- **Treść żądania:** Brak

## 3. Wykorzystywane typy
Dla tego punktu końcowego nie są definiowane specjalne typy DTO, ponieważ nie przekazuje ani nie zwraca danych.

## 4. Szczegóły odpowiedzi
- **Treść odpowiedzi:** Brak (pusta odpowiedź)
- **Kod statusu w przypadku sukcesu:** 204 No Content

## 5. Przepływ danych
1. Uwierzytelniony użytkownik wysyła żądanie DELETE z identyfikatorem listy zakupów jako parametrem ścieżki.
2. Punkt końcowy waliduje format identyfikatora (UUID).
3. ID użytkownika jest pobierane z kontekstu uwierzytelniania (przy użyciu `context.locals.supabase`).
4. Wywoływana jest funkcja warstwy serwisowej, która:
   - Sprawdza, czy lista zakupów o podanym ID istnieje i należy do bieżącego użytkownika
   - Usuwa wszystkie elementy powiązane z listą zakupów (dzięki klauzuli ON DELETE CASCADE w bazie danych)
   - Usuwa samą listę zakupów
5. W przypadku powodzenia, zwracana jest pusta odpowiedź z kodem 204 No Content.
6. W przypadku błędów autoryzacji lub gdy lista nie zostanie znaleziona, zwracany jest odpowiedni kod błędu.

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie i autoryzacja:**
  - Dostęp do tego punktu końcowego mają wyłącznie uwierzytelnieni użytkownicy. Token uwierzytelniający jest weryfikowany za pomocą Supabase przy użyciu `context.locals`.
  - Autoryzacja jest implementowana przez sprawdzenie, czy lista zakupów należy do bieżącego użytkownika (`user_id` w rekordzie listy zakupów).
- **Walidacja danych:**
  - Parametr identyfikatora jest walidowany, aby zapewnić, że jest poprawnym UUID.
- **Bezpieczeństwo bazy danych:**
  - Zapytania do bazy danych są parametryzowane, aby zapobiec atakom SQL injection.
  - Operacje na bazie danych są realizowane przy użyciu klienta Supabase z `context.locals`, co zapewnia bezpieczne zarządzanie połączeniami.
  - Klauzula ON DELETE CASCADE w bazie danych zapewnia integralność danych przez automatyczne usuwanie powiązanych elementów listy.

## 7. Obsługa błędów
- **400 Bad Request:** Zwracany, gdy format identyfikatora jest nieprawidłowy.
- **401 Unauthorized:** Zwracany, gdy token uwierzytelniający jest nieobecny lub niepoprawny.
- **403 Forbidden:** Zwracany, gdy lista zakupów istnieje, ale nie należy do bieżącego użytkownika.
- **404 Not Found:** Zwracany, gdy lista zakupów o podanym identyfikatorze nie istnieje.
- **500 Internal Server Error:** Zwracany w przypadku nieoczekiwanych błędów po stronie serwera lub bazy danych.
- Wszystkie błędy powinny być logowane z wystarczającą ilością szczegółów, aby ułatwić diagnozowanie problemu, przy jednoczesnym zachowaniu poufności wrażliwych informacji.

## 8. Rozważania dotyczące wydajności
- Operacja usuwania powinna wykorzystywać klauzulę ON DELETE CASCADE w bazie danych, aby efektywnie usuwać wszystkie powiązane elementy listy w jednej transakcji.
- Dla list z dużą liczbą elementów, operacja usuwania może być bardziej obciążająca; należy monitorować wydajność.
- Indeksy bazy danych powinny być zoptymalizowane dla szybkiego wyszukiwania po `id` oraz `user_id`.

## 9. Etapy wdrożenia
1. **Konfiguracja uwierzytelnienia:** Upewnić się, że middleware weryfikuje tokeny uwierzytelniające i ogranicza dostęp do punktu końcowego tylko dla uwierzytelnionych użytkowników.
2. **Walidacja parametru identyfikatora:** Zaimplementować walidację formatu UUID dla parametru ścieżki.
3. **Implementacja warstwy serwisowej:** Utworzyć lub zaktualizować funkcję serwisową, która obsłuży logikę biznesową usuwania listy zakupów.
4. **Implementacja weryfikacji właściciela:** Upewnić się, że punktu końcowy sprawdza, czy lista należy do bieżącego użytkownika.
5. **Implementacja punktu końcowego API:** Opracować punkt końcowy DELETE `/api/shopping-lists/{id}` w ramach trasy Astro, integrując walidację i warstwę serwisową.
6. **Operacja na bazie danych:** Wykonać operację usuwania przy użyciu klienta Supabase, zapewniając odpowiednią obsługę błędów podczas transakcji.
7. **Formowanie odpowiedzi:** Zwrócić odpowiedź z kodem 204 No Content w przypadku powodzenia lub odpowiednio obsłużyć błędy.
8. **Testowanie:** Napisać testy integracyjne, które obejmą różne scenariusze usuwania, nieautoryzowany dostęp, nieistniejącą listę itp.
9. **Dokumentacja:** Zaktualizować dokumentację API oraz przewodniki dla deweloperów o nowy punkt końcowy.
10. **Monitorowanie:** Skonfigurować monitorowanie wydajności punktu końcowego, aby identyfikować i rozwiązywać potencjalne problemy.

# Wytyczne dla środowiska deweloperskiego

## Obsługa autoryzacji w wersji deweloperskiej

Zgodnie z istniejącą implementacją w `src/middleware/index.ts`, wszystkie opisane w dokumencie endpointy powinny automatycznie działać w środowisku deweloperskim **bez konieczności ręcznej autoryzacji**. Obecne rozwiązanie działa w następujący sposób:

1. **Wykrywanie środowiska deweloperskiego:**
   ```typescript
   // Sprawdzenie czy środowisko jest developmentem
   const isDevelopment = process.env.NODE_ENV === "development";
   ```

2. **Automatyczne przypisanie testowego użytkownika w trybie deweloperskim:**
   ```typescript
   // W środowisku deweloperskim automatycznie przypisujemy testowego użytkownika
   if (isDevelopment) {
     console.log("🔧 Tryb deweloperski: używanie testowego użytkownika");

     // Testowy użytkownik deweloperski dla łatwiejszego testowania API
     const devUser: User = {
       id: "4e0a9b6a-b416-48e6-8d35-5700bd1d674a",
       app_metadata: {},
       user_metadata: {},
       aud: "authenticated",
       email: "dev@example.com",
       created_at: new Date().toISOString(),
       role: "authenticated",
     };

     (context.locals as AstroLocals).user = devUser;
   } else {
     // W środowisku produkcyjnym standardowa weryfikacja uwierzytelnienia
     const {
       data: { user },
     } = await supabaseClient.auth.getUser();
     (context.locals as AstroLocals).user = user;
   }
   ```

3. **Zapewnienie dostępu do klienta Supabase:**
   ```typescript
   // Przypisanie klienta Supabase do context.locals
   context.locals.supabase = supabaseClient;
   ```

## Stosowanie w endpointach

Każdy z opisanych endpointów powinien wykorzystywać ten mechanizm poprzez:

1. **Pobieranie informacji o użytkowniku z kontekstu:**
   ```typescript
   const { user } = context.locals;
   const userId = user?.id;
   
   // Sprawdzenie czy użytkownik jest dostępny
   if (!userId) {
     return new Response(JSON.stringify({ error: 'Brak autoryzacji' }), {
       status: 401,
       headers: { 'Content-Type': 'application/json' }
     });
   }
   ```

2. **Wykorzystanie klienta Supabase z kontekstu:**
   ```typescript
   const { supabase } = context.locals;
   
   // Przykład operacji na bazie danych
   const { data, error } = await supabase
     .from('shopping_lists')
     .select('*')
     .eq('user_id', userId);
   ```

## Uwagi implementacyjne

1. **Identyfikator użytkownika deweloperskiego:**
   Istniejący identyfikator użytkownika deweloperskiego to `4e0a9b6a-b416-48e6-8d35-5700bd1d674a`. Należy upewnić się, że ten sam identyfikator jest używany we wszystkich endpointach oraz testach.

2. **Weryfikacja właściciela zasobów:**
   Pomimo automatycznego uwierzytelniania w trybie deweloperskim, nadal należy implementować sprawdzanie, czy użytkownik jest właścicielem zasobu. Dzięki temu:
   - Kod będzie spójny między środowiskami deweloperskimi i produkcyjnymi
   - Łatwiejsze będzie wykrycie potencjalnych problemów z autoryzacją
   - Zapewniona zostanie integralność danych testowych

3. **Logowanie:**
   Zachować komunikat logujący informujący o pracy w trybie deweloperskim, co ułatwi diagnostykę podczas testowania:
   ```typescript
   if (isDevelopment) {
     console.log(`🔧 Endpoint ${endpointName} działa w trybie deweloperskim`);
   }
   ```

4. **Testowanie:**
   Testy integracyjne powinny uwzględniać zarówno scenariusze z włączonym trybem deweloperskim, jak i z symulowaną autoryzacją produkcyjną, aby zapewnić pełne pokrycie testami. 