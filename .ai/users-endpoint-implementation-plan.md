# Plan wdrożenia punktów końcowych API: Zarządzanie użytkownikami

## 1. Przegląd punktu końcowego
Punkty końcowe API związane z użytkownikami umożliwiają wykonywanie operacji CRUD na użytkownikach systemu. Obejmują one pobieranie listy wszystkich użytkowników (tylko dla administratorów), pobieranie szczegółów konkretnego użytkownika, aktualizację informacji o użytkowniku (w tym hasła) oraz usuwanie konta użytkownika.

## 2. Szczegóły żądania

### 2.1. Pobieranie wszystkich użytkowników
- **Metoda HTTP:** GET
- **Adres URL punktu końcowego:** `/api/users`
- **Parametry:**
  - **Opcjonalne:**
    - `page` (integer, domyślnie: 1) - Numer strony wyników
    - `pageSize` (integer, domyślnie: 20) - Liczba elementów na stronę
    - `sort` (string, opcjonalnie) - Pole, według którego sortowane są wyniki (email, registrationDate)
    - `order` (string, opcjonalnie) - Kolejność sortowania (asc, desc)
    - `emailFilter` (string, opcjonalnie) - Filtrowanie według wzorca w adresie email
- **Treść żądania:** Brak

### 2.2. Pobieranie użytkownika według ID
- **Metoda HTTP:** GET
- **Adres URL punktu końcowego:** `/api/users/{id}`
- **Parametry:**
  - **Wymagane:**
    - `id` (UUID): Identyfikator użytkownika (jako parametr ścieżki)
  - **Opcjonalne:** Brak
- **Treść żądania:** Brak

### 2.3. Aktualizacja użytkownika
- **Metoda HTTP:** PUT
- **Adres URL punktu końcowego:** `/api/users/{id}`
- **Parametry:**
  - **Wymagane:**
    - `id` (UUID): Identyfikator użytkownika (jako parametr ścieżki)
  - **Opcjonalne:** Brak
- **Treść żądania:**
  ```json
  {
    "email": "string",
    "password": "string"  // Opcjonalne - przekazane tylko jeśli aktualizujemy hasło
  }
  ```

### 2.4. Usuwanie użytkownika
- **Metoda HTTP:** DELETE
- **Adres URL punktu końcowego:** `/api/users/{id}`
- **Parametry:**
  - **Wymagane:**
    - `id` (UUID): Identyfikator użytkownika (jako parametr ścieżki)
  - **Opcjonalne:** Brak
- **Treść żądania:** Brak

## 3. Wykorzystywane typy
- **DTO i modele komend:**
  - `UserDTO` – reprezentuje podstawowe informacje o użytkowniku
  - `GetAllUsersResponse` – reprezentuje odpowiedź z listą użytkowników i informacjami o paginacji
  - `GetUserByIdResponse` – reprezentuje odpowiedź zawierającą szczegóły użytkownika
  - `UpdateUserRequest` – reprezentuje przychodzące żądanie aktualizacji danych użytkownika
  - `UpdateUserResponse` – reprezentuje odpowiedź po aktualizacji danych użytkownika
  - `PaginationResponse` – reprezentuje informacje o paginacji

Te typy są zdefiniowane w pliku `src/types.ts`.

## 4. Szczegóły odpowiedzi

### 4.1. Pobieranie wszystkich użytkowników
- **Treść odpowiedzi:**
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "email": "string",
        "registrationDate": "string",
        "lastLoginDate": "string"
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

### 4.2. Pobieranie użytkownika według ID
- **Treść odpowiedzi:**
  ```json
  {
    "id": "uuid",
    "email": "string",
    "registrationDate": "string",
    "lastLoginDate": "string",
    "isAdmin": "boolean"
  }
  ```
- **Kod statusu w przypadku sukcesu:** 200 OK

### 4.3. Aktualizacja użytkownika
- **Treść odpowiedzi:**
  ```json
  {
    "id": "uuid",
    "email": "string",
    "updatedDate": "string",
    "passwordUpdated": "boolean"  // Informacja, czy hasło zostało zaktualizowane
  }
  ```
- **Kod statusu w przypadku sukcesu:** 200 OK

### 4.4. Usuwanie użytkownika
- **Treść odpowiedzi:** Brak (pusta odpowiedź)
- **Kod statusu w przypadku sukcesu:** 204 No Content

## 5. Przepływ danych

### 5.1. Pobieranie wszystkich użytkowników
1. Uwierzytelniony użytkownik z uprawnieniami administratora wysyła żądanie GET z opcjonalnymi parametrami zapytania (page, pageSize, sort, order, emailFilter).
2. Punkt końcowy waliduje parametry zapytania przy użyciu schematu Zod (sprawdzając poprawność typów i zakresów wartości).
3. Punkt końcowy weryfikuje, czy użytkownik ma uprawnienia administratora, sprawdzając wartość kolumny `admin` dla bieżącego użytkownika.
4. Wywoływana jest funkcja warstwy serwisowej, która:
   - Pobiera użytkowników z bazy danych, uwzględniając parametry paginacji, sortowania i filtrowania
   - Oblicza informacje o paginacji (całkowita liczba elementów, liczba stron itp.)
5. W przypadku powodzenia, dane użytkowników wraz z informacjami o paginacji są zwracane w odpowiedzi.
6. W przypadku błędów uwierzytelniania lub autoryzacji, punkt końcowy zwraca odpowiedni kod błędu HTTP.

### 5.2. Pobieranie użytkownika według ID
1. Uwierzytelniony użytkownik wysyła żądanie GET z identyfikatorem użytkownika jako parametrem ścieżki.
2. Punkt końcowy waliduje format identyfikatora (UUID).
3. Punkt końcowy sprawdza, czy żądający użytkownik ma uprawnienia do pobierania danych wskazanego użytkownika:
   - Użytkownik może zawsze pobierać własne dane
   - Jeśli żądający posiada uprawnienia administratora, może pobierać dane dowolnego użytkownika
4. Wywoływana jest funkcja warstwy serwisowej, która:
   - Pobiera użytkownika o określonym ID z bazy danych
   - Sprawdza, czy użytkownik istnieje
   - Określa, czy użytkownik ma uprawnienia administratora, sprawdzając czy jego ID znajduje się na liście administratorów
5. W przypadku znalezienia użytkownika, jego dane wraz z informacją o uprawnieniach administratora są zwracane w odpowiedzi.
6. W przypadku gdy użytkownik nie zostanie znaleziony lub żądający nie ma odpowiednich uprawnień, zwracany jest odpowiedni kod błędu.

### 5.3. Aktualizacja użytkownika
1. Uwierzytelniony użytkownik wysyła żądanie PUT z identyfikatorem użytkownika jako parametrem ścieżki i nowymi danymi w treści żądania.
2. Punkt końcowy waliduje format identyfikatora (UUID) oraz treść żądania (sprawdzając poprawność pól email i password, jeśli są obecne).
3. Punkt końcowy sprawdza, czy żądający użytkownik ma uprawnienia do aktualizacji danych wskazanego użytkownika:
   - Użytkownik może zawsze aktualizować własne dane
   - Jeśli żądający posiada wartość `true` w kolumnie `admin`, może aktualizować dane dowolnego użytkownika
4. W przypadku aktualizacji adresu email, punkt końcowy sprawdza, czy nowy adres email nie jest już używany przez innego użytkownika.
5. Wywoływana jest funkcja warstwy serwisowej, która:
   - Aktualizuje dane użytkownika w bazie danych
   - Automatycznie aktualizuje znacznik czasu `updated_date`
   - W przypadku zmiany hasła, przeprowadza odpowiednie hashowanie hasła i zapisuje hash w polu `password_hash` w bazie danych
6. W przypadku powodzenia, zaktualizowane dane użytkownika są zwracane w odpowiedzi (bez zahaszowanego hasła ze względów bezpieczeństwa).
7. W przypadku błędów walidacji, autoryzacji lub konfliktu adresu email, zwracany jest odpowiedni kod błędu.

### 5.4. Usuwanie użytkownika
1. Uwierzytelniony użytkownik wysyła żądanie DELETE z identyfikatorem użytkownika jako parametrem ścieżki.
2. Punkt końcowy waliduje format identyfikatora (UUID).
3. Punkt końcowy sprawdza, czy żądający użytkownik ma uprawnienia do usunięcia wskazanego użytkownika:
   - Użytkownik może zawsze usunąć własne konto
   - Jeśli żądający posiada wartość `true` w kolumnie `admin`, może usunąć konto dowolnego użytkownika
4. Wywoływana jest funkcja warstwy serwisowej, która:
   - Usuwa użytkownika z bazy danych
   - Dzięki klauzuli ON DELETE CASCADE w bazie danych, wszystkie powiązane dane (listy zakupów, elementy list itp.) są również usuwane
5. W przypadku powodzenia, zwracana jest pusta odpowiedź z kodem 204 No Content.
6. W przypadku błędów autoryzacji lub gdy użytkownik nie zostanie znaleziony, zwracany jest odpowiedni kod błędu.

## 6. Względy bezpieczeństwa
- **Uwierzytelnienie i autoryzacja:**
  - Dostęp do punktów końcowych mają wyłącznie uwierzytelnieni użytkownicy. Token uwierzytelniający jest weryfikowany za pomocą Supabase przy użyciu `context.locals`.
  - Punkt końcowy pobierania wszystkich użytkowników jest dostępny tylko dla administratorów (użytkowników, których ID znajduje się na zdefiniowanej liście administratorów).
  - Użytkownicy mogą pobierać, aktualizować i usuwać tylko własne dane, chyba że posiadają uprawnienia administratora.
  - Informacja o uprawnieniach administratora jest zwracana w odpowiedzi API dla endpointu pobierania użytkownika po ID.
- **Walidacja danych:**
  - Parametry zapytania i treść żądania są walidowane przy użyciu schematu Zod, aby zapewnić, że są odpowiedniego typu i spełniają wymagane kryteria.
  - Adres email jest walidowany pod kątem poprawności formatu i unikalności w systemie.
  - Hasło jest walidowane pod kątem minimalnej długości i złożoności zgodnie z wymaganiami bezpieczeństwa.
- **Bezpieczeństwo bazy danych:**
  - Zapytania do bazy danych są parametryzowane, aby zapobiec atakom SQL injection.
  - Operacje na bazie danych są realizowane przy użyciu klienta Supabase z `context.locals`, co zapewnia bezpieczne zarządzanie połączeniami.
  - Hasła są przechowywane w postaci bezpiecznych skrótów w kolumnie `password_hash`, nie jako zwykły tekst.
  - Hasła nigdy nie są zwracane w odpowiedziach API, nawet w zahaszowanej formie.

## 7. Obsługa błędów
- **400 Bad Request:** Zwracany, gdy walidacja parametrów zapytania lub treści żądania nie powiedzie się (np. nieprawidłowy format parametru, brakujące wymagane pola).
- **401 Unauthorized:** Zwracany, gdy token uwierzytelniający jest nieobecny lub niepoprawny.
- **403 Forbidden:** Zwracany, gdy użytkownik nie ma wystarczających uprawnień do wykonania operacji (np. próba pobrania wszystkich użytkowników przez nie-administratora lub manipulacja danymi innego użytkownika).
- **404 Not Found:** Zwracany, gdy użytkownik o podanym identyfikatorze nie istnieje.
- **409 Conflict:** Zwracany podczas aktualizacji, gdy nowy adres email jest już używany przez innego użytkownika.
- **500 Internal Server Error:** Zwracany w przypadku nieoczekiwanych błędów po stronie serwera lub bazy danych.
- Wszystkie błędy powinny być logowane z wystarczającą ilością szczegółów, aby ułatwić diagnozowanie problemu, przy jednoczesnym zachowaniu poufności wrażliwych informacji.

## 8. Rozważania dotyczące wydajności
- Paginacja jest kluczowa dla optymalizacji wydajności punktu końcowego pobierania wszystkich użytkowników, szczególnie gdy system ma wielu użytkowników.
- Zapytania do bazy danych powinny wykorzystywać indeksy na kolumnach `id` i `email` dla szybkiego wyszukiwania i sortowania.
- Filtrowanie przez wzorzec email powinno korzystać z indeksu tekstowego, jeśli jest dostępny w Supabase.
- Rozważyć implementację pamięci podręcznej (caching) dla często pobieranych danych użytkowników, aby zmniejszyć obciążenie bazy danych.
- Monitorować operację usuwania konta użytkownika, ponieważ może ona być bardziej złożona ze względu na kaskadowe usuwanie powiązanych danych w wielu tabelach.

## 9. Etapy wdrożenia

### 9.1. Pobieranie wszystkich użytkowników
1. **Konfiguracja uwierzytelnienia:** Upewnić się, że middleware weryfikuje tokeny uwierzytelniające i ogranicza dostęp do punktu końcowego tylko dla uwierzytelnionych użytkowników.
2. **Walidacja parametrów zapytania:** Zaimplementować schemat Zod do walidacji parametrów zapytania (page, pageSize, sort, order, emailFilter).
3. **Implementacja warstwy serwisowej:** Utworzyć funkcję serwisową `getUserService.getAllUsers()`, która obsłuży logikę biznesową pobierania użytkowników z paginacją, sortowaniem i filtrowaniem.
4. **Implementacja autoryzacji administratora:** Dodać logikę sprawdzającą, czy żądający użytkownik ma wartość `true` w kolumnie `admin`.
5. **Implementacja punktu końcowego API:** Opracować punkt końcowy GET `/api/users` w ramach trasy Astro, integrując walidację, autoryzację i warstwę serwisową.
6. **Obsługa paginacji i sortowania:** Zaimplementować logikę do obsługi parametrów paginacji i sortowania w zapytaniach do bazy danych.
7. **Formowanie odpowiedzi:** Odpowiednio formatować odpowiedź z wykorzystaniem typów DTO i uwzględniać informacje o paginacji.
8. **Testowanie:** Napisać testy integracyjne, które obejmą różne scenariusze paginacji, sortowania, filtrowania oraz obsługę błędów.
9. **Optymalizacja wydajności:** Przeanalizować wydajność zapytań i zoptymalizować indeksy bazy danych.
10. **Dokumentacja:** Zaktualizować dokumentację API oraz przewodniki dla deweloperów o nowy punkt końcowy.

### 9.2. Pobieranie użytkownika według ID
1. **Konfiguracja uwierzytelnienia:** Upewnić się, że middleware weryfikuje tokeny uwierzytelniające i ogranicza dostęp do punktu końcowego tylko dla uwierzytelnionych użytkowników.
2. **Walidacja parametru identyfikatora:** Zaimplementować walidację formatu UUID dla parametru ścieżki.
3. **Implementacja warstwy serwisowej:** Utworzyć funkcję serwisową `userService.getUserById()`, która obsłuży logikę biznesową pobierania użytkownika o określonym ID.
4. **Implementacja określania uprawnień administratora:** Dodać mechanizm określający, czy użytkownik ma uprawnienia administratora na podstawie jego ID.
5. **Implementacja autoryzacji:** Dodać logikę sprawdzającą, czy żądający użytkownik jest właścicielem konta lub ma uprawnienia administratora.
6. **Implementacja punktu końcowego API:** Opracować punkt końcowy GET `/api/users/{id}` w ramach trasy Astro, integrując walidację, autoryzację i warstwę serwisową.
7. **Formowanie odpowiedzi:** Odpowiednio formatować odpowiedź z wykorzystaniem typu UserDTO, włączając informację o uprawnieniach administratora.
8. **Testowanie:** Napisać testy integracyjne, które obejmą różne scenariusze, w tym pobieranie istniejącego użytkownika, nieautoryzowany dostęp, nieistniejącego użytkownika itp.
9. **Dokumentacja:** Zaktualizować dokumentację API oraz przewodniki dla deweloperów o nowy punkt końcowy, jasno dokumentując pole isAdmin w odpowiedzi API.

### 9.3. Aktualizacja użytkownika
1. **Konfiguracja uwierzytelnienia:** Upewnić się, że middleware weryfikuje tokeny uwierzytelniające i ogranicza dostęp do punktu końcowego tylko dla uwierzytelnionych użytkowników.
2. **Walidacja parametru identyfikatora:** Zaimplementować walidację formatu UUID dla parametru ścieżki.
3. **Walidacja danych wejściowych:** Zaimplementować schemat Zod do walidacji pól email i password w treści żądania.
4. **Implementacja warstwy serwisowej:** Utworzyć funkcję serwisową `userService.updateUser()`, która obsłuży logikę biznesową aktualizacji danych użytkownika, wraz z bezpiecznym hashowaniem hasła.
5. **Implementacja bezpiecznego hashowania hasła:** Zaimplementować funkcję, która bezpiecznie haszuje hasło przed zapisaniem go w bazie danych.
6. **Implementacja autoryzacji:** Dodać logikę sprawdzającą, czy żądający użytkownik jest właścicielem konta lub ma wartość `true` w kolumnie `admin`.
7. **Implementacja sprawdzania unikalności emaila:** Dodać logikę sprawdzającą, czy nowy adres email nie jest już używany przez innego użytkownika.
8. **Implementacja punktu końcowego API:** Opracować punkt końcowy PUT `/api/users/{id}` w ramach trasy Astro, integrując walidację, autoryzację i warstwę serwisową.
9. **Operacja na bazie danych:** Wykonać operację aktualizacji przy użyciu klienta Supabase, zapewniając odpowiednią obsługę błędów podczas transakcji.
10. **Formowanie odpowiedzi:** Zwrócić odpowiedź z kodem 200 OK wraz z zaktualizowanymi danymi użytkownika lub odpowiednio obsłużyć błędy. Upewnić się, że odpowiedź nie zawiera zahaszowanego hasła.
11. **Testowanie:** Napisać testy integracyjne, które obejmą różne scenariusze aktualizacji, błędy walidacji, konflikt adresu email, nieautoryzowany dostęp, nieistniejącego użytkownika itp.
12. **Dokumentacja:** Zaktualizować dokumentację API oraz przewodniki dla deweloperów o nowy punkt końcowy.

### 9.4. Usuwanie użytkownika
1. **Konfiguracja uwierzytelnienia:** Upewnić się, że middleware weryfikuje tokeny uwierzytelniające i ogranicza dostęp do punktu końcowego tylko dla uwierzytelnionych użytkowników.
2. **Walidacja parametru identyfikatora:** Zaimplementować walidację formatu UUID dla parametru ścieżki.
3. **Implementacja warstwy serwisowej:** Utworzyć funkcję serwisową `userService.deleteUser()`, która obsłuży logikę biznesową usuwania użytkownika.
4. **Implementacja autoryzacji:** Dodać logikę sprawdzającą, czy żądający użytkownik jest właścicielem konta lub ma wartość `true` w kolumnie `admin`.
5. **Implementacja punktu końcowego API:** Opracować punkt końcowy DELETE `/api/users/{id}` w ramach trasy Astro, integrując walidację, autoryzację i warstwę serwisową.
6. **Operacja na bazie danych:** Wykonać operację usuwania przy użyciu klienta Supabase, zapewniając odpowiednią obsługę błędów podczas transakcji.
7. **Formowanie odpowiedzi:** Zwrócić odpowiedź z kodem 204 No Content w przypadku powodzenia lub odpowiednio obsłużyć błędy.
8. **Testowanie:** Napisać testy integracyjne, które obejmą różne scenariusze usuwania, nieautoryzowany dostęp, nieistniejącego użytkownika itp.
9. **Dokumentacja:** Zaktualizować dokumentację API oraz przewodniki dla deweloperów o nowy punkt końcowy.
10. **Monitorowanie:** Skonfigurować monitorowanie wydajności punktu końcowego, szczególnie w kontekście kaskadowego usuwania powiązanych danych.

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
       id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
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

2. **Sprawdzanie uprawnień administratora:**
   ```typescript
   // Sprawdzenie czy użytkownik ma uprawnienia administratora
   const { data: userData, error: userError } = await supabase
     .from('users')
     .select('admin')
     .eq('id', userId)
     .single();

   // Weryfikacja uprawnień administratora
   if (userError || !userData || !userData.admin) {
     return new Response(JSON.stringify({ error: 'Brak uprawnień' }), {
       status: 403,
       headers: { 'Content-Type': 'application/json' }
     });
   }
   ```

3. **Wykorzystanie klienta Supabase z kontekstu:**
   ```typescript
   const { supabase } = context.locals;
   
   // Przykład operacji na bazie danych
   const { data, error } = await supabase
     .from('users')
     .select('*')
     .eq('id', userId);
   ```

## Uwagi implementacyjne

1. **Identyfikator użytkownika deweloperskiego:**
   Istniejący identyfikator użytkownika deweloperskiego to `077f7996-bca0-4e19-9a3f-b9c8bcb55347`. Należy upewnić się, że ten sam identyfikator jest używany we wszystkich endpointach oraz testach.

2. **Weryfikacja uprawnień administratora:**
   W środowisku deweloperskim należy upewnić się, że testowy użytkownik ma wartość `true` w kolumnie `admin` w bazie danych. Można to ustawić podczas inicjalizacji środowiska deweloperskiego lub poprzez dodatkową logikę w endpointach, która w trybie deweloperskim automatycznie przyznaje uprawnienia administratora:
   ```typescript
   // Automatyczne przyznanie uprawnień administratora w trybie deweloperskim
   let isAdmin = false;
   if (isDevelopment) {
     isAdmin = true; // Testowy użytkownik zawsze ma uprawnienia administratora w trybie deweloperskim
   } else {
     // Sprawdzenie uprawnień w bazie danych
     const { data: userData, error: userError } = await supabase
       .from('users')
       .select('admin')
       .eq('id', userId)
       .single();
     
     isAdmin = userData?.admin || false;
   }
   ```

3. **Logowanie:**
   Zachować komunikat logujący informujący o pracy w trybie deweloperskim, co ułatwi diagnostykę podczas testowania:
   ```typescript
   if (isDevelopment) {
     console.log(`🔧 Endpoint ${endpointName} działa w trybie deweloperskim (uprawnienia administratora: ${isAdmin})`);
   }
   ```

4. **Testowanie:**
   Testy integracyjne powinny uwzględniać zarówno scenariusze z włączonym trybem deweloperskim, jak i z symulowaną autoryzacją produkcyjną, aby zapewnić pełne pokrycie testami. Dodatkowo, testy powinny obejmować scenariusze z użytkownikami posiadającymi różne wartości kolumny `admin`, aby sprawdzić poprawność mechanizmu autoryzacji. Testy powinny też sprawdzać proces aktualizacji hasła, weryfikując czy system poprawnie zapisuje zahaszowane hasło w bazie danych. 