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

| Nazwa | Typ | Wymagane | Opis | Walidacja |
|-------|-----|----------|------|-----------|
| title | string | Tak | Tytuł listy zakupów | Min. 1 znak, maks. 255 znaków |

### Przykładowe żądanie

```http
POST /api/shopping-lists HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Lista zakupów na weekend"
}
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

| Kod | Opis |
|-----|------|
| DUPLICATE_TITLE | Lista zakupów o podanym tytule już istnieje |
| USER_NOT_FOUND | Nie znaleziono użytkownika |
| TABLE_NOT_FOUND | Błąd konfiguracji bazy danych: tabela nie istnieje |
| DATABASE_ERROR | Ogólny błąd bazy danych |
| NO_DATA_RETURNED | Brak danych zwrotnych z bazy danych |
| UNEXPECTED_ERROR | Nieoczekiwany błąd systemowy |

### Uwagi dla deweloperów

- Endpoint jest dostępny tylko dla zalogowanych użytkowników.
- W trybie deweloperskim można testować API bez logowania - w middleware jest zaimplementowany automatyczny mechanizm autoryzacji dla środowiska deweloperskiego.
- Lista zakupów jest zawsze powiązana z użytkownikiem, który ją utworzył.
- Tytuły list zakupów muszą być unikalne dla danego użytkownika.
- Zalecane jest używanie UUID jako identyfikatorów list zakupów w całej aplikacji. 