# Dokumentacja endpointów API autoryzacji

## Rejestracja użytkownika

- **URL:** `/api/auth/register`
- **Metoda:** `POST`
- **Dostęp:** Publiczny
- **Body (JSON):**
  ```json
  {
    "email": "przyklad@example.com",
    "password": "Haslo123!"
  }
  ```

### Wymagania dotyczące hasła:

- Minimum 8 znaków
- Przynajmniej jedna wielka litera
- Przynajmniej jedna mała litera
- Przynajmniej jedna cyfra
- Przynajmniej jeden znak specjalny (!@#$%^&\*()\_+{}[]:;<>,.?~\\/-)

### Przykłady wywołania

#### cURL

```bash
curl -X POST "https://shoplisteo.example.com/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nowy@example.com",
    "password": "Haslo123!"
  }'
```

#### Postman

1. Ustaw metodę na **POST**
2. Wprowadź URL: `https://shoplisteo.example.com/api/auth/register`
3. Przejdź do zakładki **Body**
4. Wybierz format **raw** i typ **JSON**
5. Wprowadź dane:

```json
{
  "email": "nowy@example.com",
  "password": "Haslo123!"
}
```

6. Kliknij przycisk **Send**

#### Fetch API (JavaScript)

```javascript
fetch("https://shoplisteo.example.com/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "nowy@example.com",
    password: "Haslo123!",
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Błąd:", error));
```

### Przykładowa odpowiedź (sukces - 201 Created)

```json
{
  "id": "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
  "email": "nowy@example.com",
  "registrationDate": "2023-05-20T14:30:00Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Przykładowa odpowiedź (błąd walidacji - 400 Bad Request)

```json
{
  "error": "Nieprawidłowe dane rejestracji",
  "details": ["Hasło musi zawierać co najmniej 8 znaków", "Hasło musi zawierać co najmniej jedną wielką literę"]
}
```

### Przykładowa odpowiedź (konflikt - 409 Conflict)

```json
{
  "error": "Użytkownik o podanym adresie email już istnieje"
}
```

### Kody odpowiedzi

- **201 Created** - Użytkownik został pomyślnie zarejestrowany
- **400 Bad Request** - Nieprawidłowe dane wejściowe (np. brak wymaganych pól, nieprawidłowy format email)
- **409 Conflict** - Email jest już zajęty przez innego użytkownika
- **500 Internal Server Error** - Błąd serwera

## Logowanie użytkownika

- **URL:** `/api/auth/login`
- **Metoda:** `POST`
- **Dostęp:** Publiczny
- **Body (JSON):**
  ```json
  {
    "email": "przyklad@example.com",
    "password": "Haslo123!"
  }
  ```

### Przykłady wywołania

#### cURL

```bash
curl -X POST "https://shoplisteo.example.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Haslo123!"
  }'
```

#### Postman

1. Ustaw metodę na **POST**
2. Wprowadź URL: `https://shoplisteo.example.com/api/auth/login`
3. Przejdź do zakładki **Body**
4. Wybierz format **raw** i typ **JSON**
5. Wprowadź dane:

```json
{
  "email": "user@example.com",
  "password": "Haslo123!"
}
```

6. Kliknij przycisk **Send**

#### Fetch API (JavaScript)

```javascript
fetch("https://shoplisteo.example.com/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "Haslo123!",
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Błąd:", error));
```

### Przykładowa odpowiedź (sukces - 200 OK)

```json
{
  "id": "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
  "email": "user@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Przykładowa odpowiedź (błąd walidacji - 400 Bad Request)

```json
{
  "error": "Nieprawidłowe dane logowania",
  "details": ["Podaj poprawny adres email", "Podaj hasło"]
}
```

### Przykładowa odpowiedź (nieprawidłowe dane logowania - 401 Unauthorized)

```json
{
  "error": "Nieprawidłowy email lub hasło"
}
```

### Kody odpowiedzi

- **200 OK** - Logowanie zakończone sukcesem
- **400 Bad Request** - Nieprawidłowe dane wejściowe (np. brak wymaganych pól, nieprawidłowy format email)
- **401 Unauthorized** - Nieprawidłowy email lub hasło
- **500 Internal Server Error** - Błąd serwera

## Wykorzystanie tokenu

Po pomyślnym zalogowaniu lub rejestracji, otrzymany token JWT należy dołączać do każdego żądania wymagającego autoryzacji. Token należy umieścić w nagłówku Authorization w formacie:

```
Authorization: Bearer {token}
```

### Przykład wykorzystania tokenu

#### cURL

```bash
curl -X GET "https://shoplisteo.example.com/api/shopping-lists" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Postman

1. Ustaw metodę na **GET**
2. Wprowadź URL: `https://shoplisteo.example.com/api/shopping-lists`
3. Przejdź do zakładki **Headers**
4. Dodaj nagłówek:
   - Key: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
5. Kliknij przycisk **Send**

#### Fetch API (JavaScript)

```javascript
fetch("https://shoplisteo.example.com/api/shopping-lists", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Błąd:", error));
```

## Ważność tokenu

Token JWT jest ważny przez określony czas (zazwyczaj 24 godziny od momentu wydania). Po wygaśnięciu tokenu, użytkownik musi zalogować się ponownie, aby uzyskać nowy token.

## Obsługa błędów

W przypadku nieprawidłowego lub wygasłego tokenu, serwer zwróci odpowiedź z kodem błędu 401 Unauthorized:

```json
{
  "error": "Nieprawidłowy token uwierzytelniający"
}
```
