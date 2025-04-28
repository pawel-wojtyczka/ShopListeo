# REST API Plan - AKTUALIZACJA

## 1. Zasoby
- **Authentication** - Obsługuje rejestrację, logowanie, wylogowanie, reset hasła.
- **Users** - Mapuje do tabeli `users`; operacje CRUD na użytkownikach.
- **Shopping Lists** - Mapuje do tabeli `shopping_lists`; operacje CRUD na listach.
- **Shopping List Items** - Mapuje do tabeli `shopping_list_items`; operacje CRUD na elementach list.
- **AI Integration** - Obsługuje przetwarzanie tekstu przez AI dla list zakupów.
- **Client API** - Dedykowane endpointy dla bezpośrednich wywołań z frontendu (korzystające z sesji middleware).

## 2. Endpoints

### Authentication

#### Register User
- **Method**: POST
- **Path**: `/api/auth/register`
- **Description**: Rejestruje nowego użytkownika w systemie (Supabase Auth + tabela `public.users`).
- **Request Body**: (`RegisterUserRequest`)
  ```json
  {
    "email": "string",
    "password": "string" // Musi spełniać wymagania złożoności
  }
  ```
- **Validation**: `RegisterSchema` (Zod) - email, password (min 8 znaków).
- **Response Body**: (`RegisterUserResponse` - bez tokenu)
  ```json
  {
    "id": "uuid",
    "email": "string",
    "registrationDate": "timestamp"
    // Token NIE jest zwracany; sesja zarządzana przez cookie
  }
  ```
- **Success Codes**: 200 OK (po udanej rejestracji i auto-loginie w dev)
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowe dane (błędy walidacji Zod lub błąd Supabase np. email zajęty).
  - 500 Internal Server Error - Błąd serwera.

#### Login User
- **Method**: POST
- **Path**: `/api/auth/login`
- **Description**: Uwierzytelnia użytkownika i ustawia ciasteczka sesji Supabase.
- **Request Body**: (`LoginUserRequest`)
  ```json
  {
    "email": "string",
    "password": "string",
    "rememberMe": "boolean" // Opcjonalne
  }
  ```
- **Validation**: `LoginSchema` (Zod) - email, password.
- **Response Body**: (`LoginUserResponse` - bez tokenu)
  ```json
  {
    "id": "uuid",
    "email": "string"
    // Token NIE jest zwracany; sesja zarządzana przez cookie
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowe dane (błędy walidacji Zod).
  - 401 Unauthorized - Nieprawidłowe dane logowania.
  - 500 Internal Server Error - Błąd serwera.

#### Logout User
- **Method**: POST
- **Path**: `/api/auth/logout`
- **Description**: Wylogowuje użytkownika, usuwając sesję Supabase i czyszcząc ciasteczka.
- **Request Body**: Brak
- **Response Body**: Brak
- **Success Codes**: 204 No Content
- **Error Codes**:
  - 500 Internal Server Error - Błąd serwera podczas wylogowywania.

#### Request Password Reset
- **Method**: POST
- **Path**: `/api/auth/request-reset`
- **Description**: Inicjuje proces resetowania hasła, wysyłając email z linkiem (przez Supabase Auth).
- **Request Body**:
  ```json
  {
    "email": "string"
  }
  ```
- **Validation**: `RequestResetSchema` (Zod) - email.
- **Response Body**:
  ```json
  {
    "message": "string" // Zawsze generyczny komunikat sukcesu dla bezpieczeństwa
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowy format emaila.
  - 500 Internal Server Error - Błąd serwera.

#### Set New Password
- **Method**: POST
- **Path**: `/api/auth/set-new-password`
- **Description**: Ustawia nowe hasło dla użytkownika na podstawie tokenu resetującego (z Supabase Auth).
- **Request Body**:
  ```json
  {
    "accessToken": "string", // Token pobrany przez klienta z URL
    "password": "string"    // Nowe hasło (musi spełniać wymagania)
  }
  ```
- **Validation**: `SetNewPasswordSchema` (Zod) - accessToken, password (min 8 znaków).
- **Response Body**:
  ```json
  {
    "message": "string" // Komunikat o sukcesie
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowe dane (błędy walidacji Zod).
  - 401 Unauthorized - Nieprawidłowy lub wygasły `accessToken`.
  - 500 Internal Server Error - Błąd podczas aktualizacji hasła w Supabase.

### Users

#### Get All Users
- **Method**: GET
- **Path**: `/api/users`
- **Description**: Pobiera listę wszystkich użytkowników (tylko admin).
- **Authorization**: Wymagane uprawnienia administratora (sprawdzane przez `isUserAdmin`).
- **Query Parameters**:
  - `page` (integer, default: 1)
  - `pageSize` (integer, default: 20, max: 100)
  - `sort` (string, enum: `email`, `registrationDate`, default: `email`)
  - `order` (string, enum: `asc`, `desc`, default: `asc`)
  - `emailFilter` (string, optional)
- **Validation**: `getAllUsersQuerySchema` (Zod) dla parametrów zapytania.
- **Response Body**: (`GetAllUsersResponse`)
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "email": "string",
        "registrationDate": "timestamp",
        "lastLoginDate": "timestamp | null",
        "isAdmin": "boolean" // Dodano pole isAdmin
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
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowe parametry zapytania.
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 403 Forbidden - Brak uprawnień administratora.
  - 500 Internal Server Error - Błąd serwera.

#### Get User by ID
- **Method**: GET
- **Path**: `/api/users/{id}`
- **Description**: Pobiera dane konkretnego użytkownika.
- **Authorization**: Użytkownik musi być zalogowany i być właścicielem danych lub administratorem.
- **Validation**: `userIdSchema` (Zod) dla parametru `id`.
- **Response Body**: (`UserDTO`)
  ```json
  {
    "id": "uuid",
    "email": "string",
    "registrationDate": "timestamp",
    "lastLoginDate": "timestamp | null",
    "isAdmin": "boolean" // Dodano pole isAdmin
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowy format ID.
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 403 Forbidden - Brak uprawnień.
  - 404 Not Found - Użytkownik nie znaleziony.
  - 500 Internal Server Error - Błąd serwera.

#### Get Current User
- **Method**: GET
- **Path**: `/api/users/me`
- **Description**: Pobiera dane aktualnie zalogowanego użytkownika (na podstawie sesji middleware).
- **Authorization**: Wymagane uwierzytelnienie (obsługiwane przez middleware).
- **Response Body**: (`UserDTO`)
  ```json
  {
    "id": "uuid",
    "email": "string",
    "registrationDate": "timestamp",
    "lastLoginDate": "timestamp | null",
    "isAdmin": "boolean"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 500 Internal Server Error - Błąd serwera (np. problem z `locals`).

#### Update User
- **Method**: PUT
- **Path**: `/api/users/{id}`
- **Description**: Aktualizuje dane użytkownika (email i/lub hasło).
- **Authorization**: Użytkownik musi być zalogowany i być właścicielem danych lub administratorem.
- **Validation**: `userIdSchema` (Zod) dla `id`, `updateUserSchema` (Zod) dla ciała żądania.
- **Request Body**: (`UpdateUserRequest`)
  ```json
  {
    "email": "string", // opcjonalne
    "password": "string" // opcjonalne (nowe hasło, musi spełniać wymagania)
  }
  ```
- **Response Body**: (`UpdateUserResponse`)
  ```json
  {
    "id": "uuid",
    "email": "string",
    "updatedDate": "timestamp",
    "passwordUpdated": "boolean" // Dodano flagę informującą o zmianie hasła
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowe dane (ID lub ciało żądania).
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 403 Forbidden - Brak uprawnień.
  - 404 Not Found - Użytkownik nie znaleziony.
  - 409 Conflict - Email jest już używany.
  - 500 Internal Server Error - Błąd serwera.

#### Delete User
- **Method**: DELETE
- **Path**: `/api/users/{id}`
- **Description**: Usuwa konto użytkownika.
- **Authorization**: Użytkownik musi być zalogowany i być właścicielem konta lub administratorem.
- **Validation**: `userIdSchema` (Zod) dla `id`.
- **Response Body**: Brak
- **Success Codes**: 204 No Content
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowy format ID.
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 403 Forbidden - Brak uprawnień.
  - 404 Not Found - Użytkownik nie znaleziony.
  - 500 Internal Server Error - Błąd serwera.

### Shopping Lists

#### Get All Shopping Lists (Server-Side / Potentially Client API)
- **Method**: GET
- **Path**: `/api/shopping-lists`
- **Description**: Pobiera wszystkie listy zakupów zalogowanego użytkownika. *Uwaga: Obecnie implementowane głównie server-side w Astro Pages, ten endpoint API może nie być używany bezpośrednio przez klienta do pobierania przeglądu list.*
- **Authorization**: Wymagane uwierzytelnienie.
- **Query Parameters**: (`getAllShoppingListsQuerySchema` Zod)
  - `page` (integer, default: 1)
  - `pageSize` (integer, default: 20, max: 100)
  - `sort` (string, enum: `title`, `createdAt`, `updatedAt`, default: `createdAt`)
  - `order` (string, enum: `asc`, `desc`, default: `desc`)
- **Response Body**: (`GetAllShoppingListsResponse`)
  ```json
  {
    "data": [ // ShoppingListSummaryDTO[]
      {
        "id": "uuid",
        "title": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "itemCount": "integer"
      }
    ],
    "pagination": { /* PaginationResponse */ }
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowe parametry zapytania.
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 500 Internal Server Error - Błąd serwera.

#### Create Shopping List
- **Method**: POST
- **Path**: `/api/shopping-lists`
- **Description**: Tworzy nową listę zakupów.
- **Authorization**: Wymagane uwierzytelnienie.
- **Validation**: `createShoppingListSchema` (Zod) dla ciała żądania.
- **Request Body**: (`CreateShoppingListRequest`)
  ```json
  {
    "title": "string" // Min 1, Max 255 znaków
  }
  ```
- **Response Body**: (`CreateShoppingListResponse`)
  ```json
  {
    "id": "uuid",
    "title": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowe dane (błędy walidacji Zod).
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 409 Conflict - Lista o tym tytule już istnieje dla tego użytkownika.
  - 500 Internal Server Error - Błąd serwera.

#### Get Shopping List by ID
- **Method**: GET
- **Path**: `/api/shopping-lists/{listId}`
- **Description**: Pobiera szczegóły listy zakupów wraz z jej elementami.
- **Authorization**: Wymagane uwierzytelnienie (użytkownik musi być właścicielem listy).
- **Validation**: `shoppingListIdSchema` (Zod) dla `listId`.
- **Response Body**: (`GetShoppingListByIdResponse`)
  ```json
  {
    "id": "uuid",
    "title": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "items": [ /* ShoppingListItemDTO[] */ ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowy format ID.
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 403 Forbidden - Brak uprawnień (nie właściciel).
  - 404 Not Found - Lista nie znaleziona.
  - 500 Internal Server Error - Błąd serwera.

#### Update Shopping List
- **Method**: PUT
- **Path**: `/api/shopping-lists/{listId}`
- **Description**: Aktualizuje tytuł listy zakupów.
- **Authorization**: Wymagane uwierzytelnienie (użytkownik musi być właścicielem listy).
- **Validation**: `shoppingListIdSchema` (Zod) dla `listId`, `updateShoppingListSchema` (Zod) dla ciała żądania.
- **Request Body**: (`UpdateShoppingListRequest`)
  ```json
  {
    "title": "string" // Min 1, Max 255 znaków
  }
  ```
- **Response Body**: (`UpdateShoppingListResponse`)
  ```json
  {
    "id": "uuid",
    "title": "string",
    "updatedAt": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowe dane (ID lub ciało żądania).
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 403 Forbidden - Brak uprawnień.
  - 404 Not Found - Lista nie znaleziona.
  - 409 Conflict - Lista o tym tytule już istnieje.
  - 500 Internal Server Error - Błąd serwera.

#### Delete Shopping List
- **Method**: DELETE
- **Path**: `/api/shopping-lists/{listId}`
- **Description**: Usuwa listę zakupów i wszystkie jej elementy.
- **Authorization**: Wymagane uwierzytelnienie (użytkownik musi być właścicielem listy).
- **Validation**: `shoppingListIdSchema` (Zod) dla `listId`.
- **Response Body**: Brak
- **Success Codes**: 204 No Content
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowy format ID.
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 403 Forbidden - Brak uprawnień.
  - 404 Not Found - Lista nie znaleziona.
  - 500 Internal Server Error - Błąd serwera.

### Shopping List Items

#### Add Item to Shopping List
- **Method**: POST
- **Path**: `/api/shopping-lists/{listId}/items`
- **Description**: Dodaje nowy element do listy zakupów.
- **Authorization**: Wymagane uwierzytelnienie (użytkownik musi być właścicielem listy).
- **Validation**: `shoppingListIdSchema` (Zod) dla `listId`, `addItemToShoppingListSchema` (Zod) dla ciała żądania.
- **Request Body**: (`AddItemToShoppingListRequest`)
  ```json
  {
    "itemName": "string", // Min 1, Max 128 znaków
    "purchased": "boolean" // Opcjonalne, domyślnie false
  }
  ```
- **Response Body**: (`AddItemToShoppingListResponse` - czyli `ShoppingListItemDTO`)
  ```json
  {
    "id": "uuid",
    "itemName": "string",
    "purchased": "boolean",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
  ```
- **Success Codes**: 201 Created
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowe dane (ID listy lub ciało żądania).
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 403 Forbidden - Brak uprawnień.
  - 404 Not Found - Lista nie znaleziona.
  - 500 Internal Server Error - Błąd serwera.

#### Update Shopping List Item
- **Method**: PUT
- **Path**: `/api/shopping-lists/{listId}/items/{itemId}`
- **Description**: Aktualizuje element listy zakupów (nazwę i/lub status zakupu).
- **Authorization**: Wymagane uwierzytelnienie (użytkownik musi być właścicielem listy).
- **Validation**: `shoppingListIdSchema` (Zod) dla `listId`, UUID dla `itemId`, `updateShoppingListItemSchema` (Zod) dla ciała żądania.
- **Request Body**: (`UpdateShoppingListItemRequest`)
  ```json
  {
    "itemName": "string", // Opcjonalne, Min 1, Max 128
    "purchased": "boolean" // Opcjonalne
    // Musi być podane przynajmniej jedno pole
  }
  ```
- **Response Body**: (`UpdateShoppingListItemResponse` - czyli `ShoppingListItemDTO` z `updatedAt`)
  ```json
  {
    "id": "uuid",
    "itemName": "string",
    "purchased": "boolean",
    "updatedAt": "timestamp"
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowe dane (ID lub ciało żądania).
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 403 Forbidden - Brak uprawnień.
  - 404 Not Found - Lista lub element nie znaleziony.
  - 500 Internal Server Error - Błąd serwera.

#### Delete Shopping List Item
- **Method**: DELETE
- **Path**: `/api/shopping-lists/{listId}/items/{itemId}`
- **Description**: Usuwa element z listy zakupów.
- **Authorization**: Wymagane uwierzytelnienie (użytkownik musi być właścicielem listy).
- **Validation**: `shoppingListIdSchema` (Zod) dla `listId`, UUID dla `itemId`.
- **Response Body**: Brak
- **Success Codes**: 204 No Content
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowy format ID.
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 403 Forbidden - Brak uprawnień.
  - 404 Not Found - Lista lub element nie znaleziony.
  - 500 Internal Server Error - Błąd serwera.

#### Clear All Items from List
- **Method**: DELETE
- **Path**: `/api/shopping-lists/{listId}/clear-items`
- **Description**: Usuwa wszystkie elementy z danej listy zakupów.
- **Authorization**: Wymagane uwierzytelnienie (użytkownik musi być właścicielem listy).
- **Validation**: `shoppingListIdSchema` (Zod) dla `listId`.
- **Response Body**:
  ```json
  {
    "success": true
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowy format ID.
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 403 Forbidden - Brak uprawnień.
  - 404 Not Found - Lista nie znaleziona.
  - 500 Internal Server Error - Błąd serwera.

### AI Integration

#### Parse Text and Update List
- **Method**: POST
- **Path**: `/api/shopping-lists/{listId}/ai-parse`
- **Description**: Przetwarza tekst wejściowy za pomocą AI, aby dodać/usunąć produkty z listy zakupów, uwzględniając istniejące elementy i ich status.
- **Authorization**: Wymagane uwierzytelnienie (użytkownik musi być właścicielem listy).
- **Validation**: `shoppingListIdSchema` (Zod) dla `listId`, walidacja ciała żądania (musi zawierać `text`).
- **Request Body**:
  ```json
  {
    "text": "string" // Tekst do przetworzenia przez AI
  }
  ```
- **Response Body**:
  ```json
  {
    "products": [ /* Zaktualizowana lista ShoppingListItemDTO[] */ ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowe dane (ID listy lub brak `text`).
  - 401 Unauthorized - Brak uwierzytelnienia.
  - 403 Forbidden - Brak uprawnień.
  - 404 Not Found - Lista nie znaleziona.
  - 500 Internal Server Error - Błąd serwera, błąd komunikacji z AI, błąd RPC w Supabase.
  - 502 Bad Gateway - Błąd odpowiedzi z serwisu AI.

### Client API

#### Get Shopping List Details (Client-side)
- **Method**: GET
- **Path**: `/api/client/shopping-lists/{listId}`
- **Description**: Pobiera szczegóły listy zakupów (w tym elementy) dla klienta, opierając się na sesji uwierzytelniającej zarządzanej przez middleware.
- **Authorization**: Wymagane uwierzytelnienie (sprawdzane przez middleware na podstawie ciasteczek `sb-*`).
- **Validation**: UUID dla `listId`.
- **Response Body**: (`ShoppingListDetailResponse` - zawiera listę i jej elementy)
  ```json
  {
    "id": "uuid",
    "title": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "items": [ /* ShoppingListItemDTO[] */ ]
  }
  ```
- **Success Codes**: 200 OK
- **Error Codes**:
  - 400 Bad Request - Nieprawidłowy format ID.
  - 401 Unauthorized - Brak ważnej sesji (middleware nie znalazło użytkownika).
  - 403 Forbidden - Brak uprawnień (lista nie należy do użytkownika z sesji).
  - 404 Not Found - Lista nie znaleziona.
  - 500 Internal Server Error - Błąd serwera.

## 3. Authentication and Authorization

- API wykorzystuje sesję zarządzaną przez Supabase i bibliotekę `@supabase/ssr`.
- Middleware (`src/middleware/index.ts`) weryfikuje sesję na podstawie ciasteczek `sb-*` przy każdym żądaniu i udostępnia dane użytkownika oraz klienta Supabase w `Astro.locals`.
- Endpointy API sprawdzają `locals.user` i `locals.isAuthenticated` w celu weryfikacji uwierzytelnienia.
- Autoryzacja opiera się na sprawdzaniu `user_id` w zapytaniach do bazy danych (dla zasobów użytkownika) lub sprawdzaniu flagi `admin` w tabeli `users` (dla zasobów administratora).

## 4. Validation

- Walidacja danych wejściowych (parametry ścieżki, zapytania, ciało żądania) jest realizowana przy użyciu biblioteki `zod`.
- Schematy walidacji znajdują się w `src/lib/validators/` oraz `src/lib/schemas/`.
- Błędy walidacji zwracają status 400 Bad Request wraz ze szczegółami błędów.

## 5. Business Logic Implementation

- Logika biznesowa jest hermetyzowana w serwisach (`src/lib/services/`).
- Endpointy API wywołują odpowiednie funkcje serwisowe.
- Serwisy komunikują się z bazą danych Supabase.
- Usługa `OpenRouterService` obsługuje komunikację z API AI.
- Usługa `toast-service` obsługuje powiadomienia na frontendzie.
- Usługa `logger` obsługuje logowanie zdarzeń i błędów.
- W przypadku usuwania listy zakupów lub użytkownika, wykorzystywane są mechanizmy `ON DELETE CASCADE` w bazie danych do zapewnienia integralności.

## 6. Client-Side Endpoints (`/api/client/*`)

- Endpointy w tym katalogu są przeznaczone do bezpośredniego wywoływania przez komponenty React (np. przez hooki).
- Opierają się one na sesji uwierzytelniającej zarządzanej przez middleware i ciasteczkach `sb-*`, zamiast na tokenie `Bearer`.
- Są one zasadniczo odpowiednikami standardowych endpointów API, ale dostosowane do komunikacji opartej na sesji.
- **Uwaga:** Należy zapewnić spójność między endpointami `/api/*` a `/api/client/*`, jeśli mają realizować te same operacje. Rozważyć, czy dedykowane endpointy klienckie są konieczne, czy standardowe API (z uwzględnieniem obsługi sesji przez middleware) nie są wystarczające. Obecnie wygląda na to, że tylko `GET /api/client/shopping-lists/{listId}` jest zaimplementowany.