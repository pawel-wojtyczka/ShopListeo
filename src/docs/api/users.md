# Dokumentacja endpointów API użytkowników

## Pobieranie wszystkich użytkowników

- **URL:** `/api/users`
- **Metoda:** `GET`
- **Dostęp:** Tylko administrator
- **Parametry zapytania:**
  - `page` (opcjonalny, domyślnie: 1) - Numer strony wyników
  - `pageSize` (opcjonalny, domyślnie: 20) - Liczba elementów na stronę
  - `sort` (opcjonalny) - Pole, po którym sortowane są wyniki (email, registrationDate)
  - `order` (opcjonalny) - Kolejność sortowania (asc, desc)
  - `emailFilter` (opcjonalny) - Filtrowanie po wzorcu email

### Przykłady wywołania

#### cURL
```bash
curl -X GET "https://shoplisteo.example.com/api/users?page=1&pageSize=10&sort=email&order=asc" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Postman
```
GET /api/users?page=1&pageSize=10&sort=email&order=asc HTTP/1.1
Host: shoplisteo.example.com
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Przykładowa odpowiedź (Status: 200 OK)

```json
{
  "data": [
    {
      "id": "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
      "email": "user@example.com",
      "registrationDate": "2023-01-15T12:00:00Z",
      "lastLoginDate": "2023-02-20T15:30:00Z"
    }
  ],
  "pagination": {
    "totalItems": 50,
    "totalPages": 3,
    "currentPage": 1,
    "pageSize": 20
  }
}
```

### Kody błędów

- **400 Bad Request** - Nieprawidłowe parametry zapytania
- **401 Unauthorized** - Brak autoryzacji
- **403 Forbidden** - Brak uprawnień administratora
- **500 Internal Server Error** - Błąd serwera

## Pobieranie użytkownika według ID

- **URL:** `/api/users/{id}`
- **Metoda:** `GET`
- **Dostęp:** Własne dane użytkownika lub administrator
- **Parametry ścieżki:**
  - `id` (wymagany) - ID użytkownika (UUID)

### Przykłady wywołania

#### cURL
```bash
curl -X GET "https://shoplisteo.example.com/api/users/077f7996-bca0-4e19-9a3f-b9c8bcb55347" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Postman
```
GET /api/users/077f7996-bca0-4e19-9a3f-b9c8bcb55347 HTTP/1.1
Host: shoplisteo.example.com
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Przykładowa odpowiedź (Status: 200 OK)

```json
{
  "id": "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
  "email": "user@example.com",
  "registrationDate": "2023-01-15T12:00:00Z",
  "lastLoginDate": "2023-02-20T15:30:00Z"
}
```

### Kody błędów

- **400 Bad Request** - Nieprawidłowy format ID
- **401 Unauthorized** - Brak autoryzacji
- **403 Forbidden** - Brak uprawnień do pobrania danych tego użytkownika
- **404 Not Found** - Nie znaleziono użytkownika
- **500 Internal Server Error** - Błąd serwera

## Aktualizacja użytkownika

- **URL:** `/api/users/{id}`
- **Metoda:** `PUT`
- **Dostęp:** Własne dane użytkownika lub administrator
- **Parametry ścieżki:**
  - `id` (wymagany) - ID użytkownika (UUID)
- **Body:**
  ```json
  {
    "email": "new-email@example.com", // opcjonalny
    "password": "newPassword123" // opcjonalny
  }
  ```
  Wymagane jest podanie co najmniej jednego pola.

### Przykłady wywołania

#### cURL
```bash
curl -X PUT "https://shoplisteo.example.com/api/users/077f7996-bca0-4e19-9a3f-b9c8bcb55347" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new-email@example.com",
    "password": "newSecurePassword123"
  }'
```

#### Postman
```
PUT /api/users/077f7996-bca0-4e19-9a3f-b9c8bcb55347 HTTP/1.1
Host: shoplisteo.example.com
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "email": "new-email@example.com",
  "password": "newSecurePassword123"
}
```

### Przykładowa odpowiedź (Status: 200 OK)

```json
{
  "id": "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
  "email": "new-email@example.com",
  "updatedDate": "2023-06-15T14:30:00Z",
  "passwordUpdated": true
}
```

### Kody błędów

- **400 Bad Request** - Nieprawidłowy format ID lub dane aktualizacji
- **401 Unauthorized** - Brak autoryzacji
- **403 Forbidden** - Brak uprawnień do aktualizacji danych tego użytkownika
- **404 Not Found** - Nie znaleziono użytkownika
- **409 Conflict** - Email jest już używany przez innego użytkownika
- **500 Internal Server Error** - Błąd serwera

## Usuwanie użytkownika

- **URL:** `/api/users/{id}`
- **Metoda:** `DELETE`
- **Dostęp:** Własne konto użytkownika lub administrator
- **Parametry ścieżki:**
  - `id` (wymagany) - ID użytkownika (UUID)

### Przykłady wywołania

#### cURL
```bash
curl -X DELETE "https://shoplisteo.example.com/api/users/077f7996-bca0-4e19-9a3f-b9c8bcb55347" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Postman
```
DELETE /api/users/077f7996-bca0-4e19-9a3f-b9c8bcb55347 HTTP/1.1
Host: shoplisteo.example.com
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Odpowiedź w przypadku sukcesu (Status: 204 No Content)

Pusta odpowiedź.

### Kody błędów

- **400 Bad Request** - Nieprawidłowy format ID
- **401 Unauthorized** - Brak autoryzacji
- **403 Forbidden** - Brak uprawnień do usunięcia tego użytkownika
- **404 Not Found** - Nie znaleziono użytkownika
- **500 Internal Server Error** - Błąd serwera 