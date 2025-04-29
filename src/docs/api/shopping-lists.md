# API Endpoint: Shopping Lists

Ten dokument zawiera informacje o endpointach API związanych z zarządzaniem listami zakupów.

## Endpoint: Tworzenie listy zakupów

Endpoint pozwala na utworzenie nowej listy zakupów dla zalogowanego użytkownika.

### Szczegóły żądania

- **Metoda HTTP:** POST
- **URL:** `/api/shopping-lists`
- **Wymagane uwierzytelnienie:** Tak
- **Format danych:** JSON

### Parametry żądania

| Nazwa | Typ    | Wymagane | Opis                | Walidacja                     |
| ----- | ------ | -------- | ------------------- | ----------------------------- |
| title | string | Tak      | Tytuł listy zakupów | Min. 1 znak, maks. 255 znaków |

### Przykładowe żądanie

```http
POST /api/shopping-lists HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Lista zakupów na weekend"
}
```

### Przykład curl

```bash
curl -X POST "https://example.com/api/shopping-lists" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title": "Lista zakupów na weekend"}'
```

### Odpowiedzi

#### Powodzenie (201 Created)

```json
{
  "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "title": "Lista zakupów na weekend",
  "createdAt": "2023-07-01T14:30:45Z",
  "updatedAt": "2023-07-01T14:30:45Z"
}
```

#### Błąd: Nieprawidłowe dane wejściowe (400 Bad Request)

```json
{
  "error": "Nieprawidłowe dane wejściowe",
  "details": {
    "title": {
      "_errors": ["Tytuł listy zakupów nie może być pusty"]
    }
  }
}
```

#### Błąd: Brak uwierzytelnienia (401 Unauthorized)

```json
{
  "error": "Wymagane uwierzytelnienie"
}
```

#### Błąd: Konflikt (409 Conflict)

```json
{
  "error": "Lista zakupów o podanym tytule już istnieje",
  "code": "DUPLICATE_TITLE"
}
```

#### Błąd serwera (500 Internal Server Error)

```json
{
  "error": "Wystąpił błąd podczas przetwarzania żądania"
}
```

### Kody błędów biznesowych

| Kod              | Opis                                               |
| ---------------- | -------------------------------------------------- |
| DUPLICATE_TITLE  | Lista zakupów o podanym tytule już istnieje        |
| USER_NOT_FOUND   | Nie znaleziono użytkownika                         |
| TABLE_NOT_FOUND  | Błąd konfiguracji bazy danych: tabela nie istnieje |
| DATABASE_ERROR   | Ogólny błąd bazy danych                            |
| NO_DATA_RETURNED | Brak danych zwrotnych z bazy danych                |
| UNEXPECTED_ERROR | Nieoczekiwany błąd systemowy                       |

### Uwagi dla deweloperów

- Endpoint jest dostępny tylko dla zalogowanych użytkowników.
- W trybie deweloperskim można testować API bez logowania - w middleware jest zaimplementowany automatyczny mechanizm autoryzacji dla środowiska deweloperskiego.
- Lista zakupów jest zawsze powiązana z użytkownikiem, który ją utworzył.
- Tytuły list zakupów muszą być unikalne dla danego użytkownika.
- Zalecane jest używanie UUID jako identyfikatorów list zakupów w całej aplikacji.

---

## Endpoint: Pobieranie wszystkich list zakupów

Endpoint umożliwia pobieranie wszystkich list zakupów należących do zalogowanego użytkownika z obsługą paginacji i sortowania.

### Szczegóły żądania

- **Metoda HTTP:** GET
- **URL:** `/api/shopping-lists`
- **Wymagane uwierzytelnienie:** Tak
- **Format danych:** JSON

### Parametry zapytania (query)

| Nazwa    | Typ    | Wymagane | Opis                       | Domyślna wartość | Walidacja                                                |
| -------- | ------ | -------- | -------------------------- | ---------------- | -------------------------------------------------------- |
| page     | number | Nie      | Numer strony               | 1                | Liczba całkowita > 0                                     |
| pageSize | number | Nie      | Liczba elementów na stronę | 20               | Liczba całkowita > 0, maks. 100                          |
| sort     | string | Nie      | Pole do sortowania         | "createdAt"      | Dopuszczalne wartości: "title", "createdAt", "updatedAt" |
| order    | string | Nie      | Kierunek sortowania        | "desc"           | Dopuszczalne wartości: "asc", "desc"                     |

### Przykładowe żądanie

```http
GET /api/shopping-lists?page=1&pageSize=10&sort=updatedAt&order=desc HTTP/1.1
Authorization: Bearer <token>
```

### Przykład curl

```bash
curl -X GET "https://example.com/api/shopping-lists?page=1&pageSize=10&sort=updatedAt&order=desc" \
  -H "Authorization: Bearer <token>"
```

### Odpowiedzi

#### Powodzenie (200 OK)

```json
{
  "data": [
    {
      "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
      "title": "Lista zakupów na weekend",
      "createdAt": "2023-07-01T14:30:45Z",
      "updatedAt": "2023-07-01T15:20:10Z",
      "itemCount": 5
    },
    {
      "id": "2a3b4c5d-6e7f-8g9h-0i1j-2k3l4m5n6o7p",
      "title": "Zakupy na przyjęcie",
      "createdAt": "2023-06-28T10:15:30Z",
      "updatedAt": "2023-06-29T12:45:22Z",
      "itemCount": 12
    }
  ],
  "pagination": {
    "totalItems": 25,
    "totalPages": 3,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

#### Błąd: Nieprawidłowe parametry zapytania (400 Bad Request)

```json
{
  "error": "Nieprawidłowe parametry zapytania",
  "details": {
    "pageSize": {
      "_errors": ["Liczba elementów na stronę nie może przekraczać 100"]
    }
  }
}
```

#### Błąd: Brak uwierzytelnienia (401 Unauthorized)

```json
{
  "error": "Wymagane uwierzytelnienie"
}
```

#### Błąd serwera (500 Internal Server Error)

```json
{
  "error": "Wystąpił błąd podczas przetwarzania żądania"
}
```

### Kody błędów biznesowych

| Kod              | Opis                         |
| ---------------- | ---------------------------- |
| USER_NOT_FOUND   | Nie znaleziono użytkownika   |
| DATABASE_ERROR   | Ogólny błąd bazy danych      |
| UNEXPECTED_ERROR | Nieoczekiwany błąd systemowy |

### Uwagi dla deweloperów

- Endpoint jest dostępny tylko dla zalogowanych użytkowników.
- Uwzględniana jest paginacja wyników dla optymalizacji wydajności.
- Pole `itemCount` zawiera liczbę elementów na każdej liście zakupów.
- Sortowanie jest dostępne według tytułu, daty utworzenia i daty aktualizacji.
- Dla każdego użytkownika zwracane są tylko jego własne listy zakupów.

---

## Endpoint: Pobieranie pojedynczej listy zakupów

Endpoint umożliwia pobieranie szczegółowych informacji o konkretnej liście zakupów wraz ze wszystkimi jej elementami.

### Szczegóły żądania

- **Metoda HTTP:** GET
- **URL:** `/api/shopping-lists/{id}`
- **Wymagane uwierzytelnienie:** Tak
- **Format danych:** JSON

### Parametry ścieżki (path)

| Nazwa | Typ           | Wymagane | Opis                        | Walidacja              |
| ----- | ------------- | -------- | --------------------------- | ---------------------- |
| id    | string (UUID) | Tak      | Identyfikator listy zakupów | Prawidłowy format UUID |

### Przykładowe żądanie

```http
GET /api/shopping-lists/1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p HTTP/1.1
Authorization: Bearer <token>
```

### Przykład curl

```bash
curl -X GET "https://example.com/api/shopping-lists/1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p" \
  -H "Authorization: Bearer <token>"
```

### Odpowiedzi

#### Powodzenie (200 OK)

```json
{
  "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "title": "Lista zakupów na weekend",
  "createdAt": "2023-07-01T14:30:45Z",
  "updatedAt": "2023-07-01T15:20:10Z",
  "items": [
    {
      "id": "7a8b9c0d-1e2f-3g4h-5i6j-7k8l9m0n1o2p",
      "itemName": "Chleb",
      "purchased": true,
      "createdAt": "2023-07-01T14:31:20Z",
      "updatedAt": "2023-07-01T15:20:10Z"
    },
    {
      "id": "8a9b0c1d-2e3f-4g5h-6i7j-8k9l0m1n2o3p",
      "itemName": "Mleko",
      "purchased": false,
      "createdAt": "2023-07-01T14:32:15Z",
      "updatedAt": "2023-07-01T14:32:15Z"
    }
  ]
}
```

#### Błąd: Nieprawidłowy format identyfikatora (400 Bad Request)

```json
{
  "error": "Nieprawidłowy format identyfikatora listy zakupów",
  "details": {
    "_errors": ["Nieprawidłowy format identyfikatora listy zakupów"]
  }
}
```

#### Błąd: Brak uwierzytelnienia (401 Unauthorized)

```json
{
  "error": "Wymagane uwierzytelnienie"
}
```

#### Błąd: Nie znaleziono listy (404 Not Found)

```json
{
  "error": "Nie znaleziono listy zakupów o podanym ID",
  "code": "LIST_NOT_FOUND"
}
```

#### Błąd serwera (500 Internal Server Error)

```json
{
  "error": "Wystąpił błąd podczas przetwarzania żądania"
}
```

### Kody błędów biznesowych

| Kod              | Opis                                              |
| ---------------- | ------------------------------------------------- |
| INVALID_UUID     | Nieprawidłowy format identyfikatora listy zakupów |
| LIST_NOT_FOUND   | Nie znaleziono listy zakupów o podanym ID         |
| USER_NOT_FOUND   | Nie znaleziono użytkownika                        |
| DATABASE_ERROR   | Ogólny błąd bazy danych                           |
| UNEXPECTED_ERROR | Nieoczekiwany błąd systemowy                      |

### Uwagi dla deweloperów

- Endpoint jest dostępny tylko dla zalogowanych użytkowników.
- Użytkownik może pobierać tylko własne listy zakupów.
- Wraz z listą zakupów zwracane są wszystkie elementy należące do tej listy.
- Elementy są sortowane według daty utworzenia (od najstarszych).

---

## Endpoint: Aktualizacja listy zakupów

Endpoint umożliwia aktualizację tytułu istniejącej listy zakupów.

### Szczegóły żądania

- **Metoda HTTP:** PUT
- **URL:** `/api/shopping-lists/{id}`
- **Wymagane uwierzytelnienie:** Tak
- **Format danych:** JSON

### Parametry ścieżki (path)

| Nazwa | Typ           | Wymagane | Opis                        | Walidacja              |
| ----- | ------------- | -------- | --------------------------- | ---------------------- |
| id    | string (UUID) | Tak      | Identyfikator listy zakupów | Prawidłowy format UUID |

### Parametry żądania

| Nazwa | Typ    | Wymagane | Opis                     | Walidacja                     |
| ----- | ------ | -------- | ------------------------ | ----------------------------- |
| title | string | Tak      | Nowy tytuł listy zakupów | Min. 1 znak, maks. 255 znaków |

### Przykładowe żądanie

```http
PUT /api/shopping-lists/1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Zakupy na weekend - zaktualizowane"
}
```

### Przykład curl

```bash
curl -X PUT "https://example.com/api/shopping-lists/1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"title": "Zakupy na weekend - zaktualizowane"}'
```

### Odpowiedzi

#### Powodzenie (200 OK)

```json
{
  "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "title": "Zakupy na weekend - zaktualizowane",
  "updatedAt": "2023-07-02T10:15:30Z"
}
```

#### Błąd: Nieprawidłowy format identyfikatora (400 Bad Request)

```json
{
  "error": "Nieprawidłowy format identyfikatora listy zakupów",
  "details": {
    "_errors": ["Nieprawidłowy format identyfikatora listy zakupów"]
  }
}
```

#### Błąd: Nieprawidłowe dane wejściowe (400 Bad Request)

```json
{
  "error": "Nieprawidłowe dane wejściowe",
  "details": {
    "title": {
      "_errors": ["Tytuł listy zakupów nie może być pusty"]
    }
  }
}
```

#### Błąd: Brak uwierzytelnienia (401 Unauthorized)

```json
{
  "error": "Wymagane uwierzytelnienie"
}
```

#### Błąd: Nie znaleziono listy (404 Not Found)

```json
{
  "error": "Nie znaleziono listy zakupów o podanym ID",
  "code": "LIST_NOT_FOUND"
}
```

#### Błąd: Konflikt (409 Conflict)

```json
{
  "error": "Lista zakupów o podanym tytule już istnieje",
  "code": "DUPLICATE_TITLE"
}
```

#### Błąd serwera (500 Internal Server Error)

```json
{
  "error": "Wystąpił błąd podczas przetwarzania żądania"
}
```

### Kody błędów biznesowych

| Kod              | Opis                                              |
| ---------------- | ------------------------------------------------- |
| INVALID_UUID     | Nieprawidłowy format identyfikatora listy zakupów |
| LIST_NOT_FOUND   | Nie znaleziono listy zakupów o podanym ID         |
| DUPLICATE_TITLE  | Lista zakupów o podanym tytule już istnieje       |
| USER_NOT_FOUND   | Nie znaleziono użytkownika                        |
| DATABASE_ERROR   | Ogólny błąd bazy danych                           |
| NO_DATA_RETURNED | Brak danych zwrotnych z bazy danych               |
| UNEXPECTED_ERROR | Nieoczekiwany błąd systemowy                      |

### Uwagi dla deweloperów

- Endpoint jest dostępny tylko dla zalogowanych użytkowników.
- Użytkownik może aktualizować tylko własne listy zakupów.
- Tytuły list zakupów muszą być unikalne dla danego użytkownika.
- Data aktualizacji (`updatedAt`) jest automatycznie ustawiana na bieżący czas.

---

## Endpoint: Usuwanie listy zakupów

Endpoint umożliwia usunięcie listy zakupów wraz ze wszystkimi jej elementami.

### Szczegóły żądania

- **Metoda HTTP:** DELETE
- **URL:** `/api/shopping-lists/{id}`
- **Wymagane uwierzytelnienie:** Tak

### Parametry ścieżki (path)

| Nazwa | Typ           | Wymagane | Opis                        | Walidacja              |
| ----- | ------------- | -------- | --------------------------- | ---------------------- |
| id    | string (UUID) | Tak      | Identyfikator listy zakupów | Prawidłowy format UUID |

### Przykładowe żądanie

```http
DELETE /api/shopping-lists/1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p HTTP/1.1
Authorization: Bearer <token>
```

### Przykład curl

```bash
curl -X DELETE "https://example.com/api/shopping-lists/1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p" \
  -H "Authorization: Bearer <token>"
```

### Odpowiedzi

#### Powodzenie (204 No Content)

_Brak treści odpowiedzi_

#### Błąd: Nieprawidłowy format identyfikatora (400 Bad Request)

```json
{
  "error": "Nieprawidłowy format identyfikatora listy zakupów",
  "details": {
    "_errors": ["Nieprawidłowy format identyfikatora listy zakupów"]
  }
}
```

#### Błąd: Brak uwierzytelnienia (401 Unauthorized)

```json
{
  "error": "Wymagane uwierzytelnienie"
}
```

#### Błąd: Nie znaleziono listy (404 Not Found)

```json
{
  "error": "Nie znaleziono listy zakupów o podanym ID",
  "code": "LIST_NOT_FOUND"
}
```

#### Błąd serwera (500 Internal Server Error)

```json
{
  "error": "Wystąpił błąd podczas przetwarzania żądania"
}
```

### Kody błędów biznesowych

| Kod              | Opis                                              |
| ---------------- | ------------------------------------------------- |
| INVALID_UUID     | Nieprawidłowy format identyfikatora listy zakupów |
| LIST_NOT_FOUND   | Nie znaleziono listy zakupów o podanym ID         |
| USER_NOT_FOUND   | Nie znaleziono użytkownika                        |
| DATABASE_ERROR   | Ogólny błąd bazy danych                           |
| UNEXPECTED_ERROR | Nieoczekiwany błąd systemowy                      |

### Uwagi dla deweloperów

- Endpoint jest dostępny tylko dla zalogowanych użytkowników.
- Użytkownik może usuwać tylko własne listy zakupów.
- Wraz z listą zakupów usuwane są wszystkie elementy należące do tej listy (kaskadowe usuwanie).
- Operacja usuwania jest nieodwracalna - po usunięciu danych nie można ich odzyskać.
- Endpoint zwraca status 204 No Content bez treści odpowiedzi w przypadku powodzenia, zgodnie z konwencją REST.
