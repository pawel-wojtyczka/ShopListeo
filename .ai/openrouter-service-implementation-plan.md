# OpenRouter Service Implementation Plan

## 1. Opis usługi

Usługa OpenRouter ma na celu integrację interfejsu API OpenRouter z systemem czatu w ShopListeo, umożliwiając wykorzystanie modeli LLM do wzbogacania komunikacji. Usługa odpowiada za:

1. Przyjmowanie wiadomości od użytkownika oraz systemowych.
2. Formatowanie żądań zgodnie z wymaganym schematem, w tym ustawienie:
   - Komunikatu systemowego (np. "You are a helpful assistant.")
   - Komunikatu użytkownika (np. "Enter your query here")
   - Ustrukturyzowanej odpowiedzi poprzez response_format, np. `{ type: 'json_schema', json_schema: { name: 'llm_response', strict: true, schema: { /* JSON Schema Object */ } } }`
   - Nazwy modelu (np. "openai/chatgpt-4o-latest")
   - Parametrów modelu (np. `{ max_tokens: 512, temperature: 0.7 }`)
3. Wysyłanie żądań do API OpenRouter oraz przetwarzanie odpowiedzi zgodnie z ustalonym schematem.
4. Obsługę błędów i logowanie zdarzeń, zapewniając stabilność i bezpieczeństwo komunikacji.

## 2. Opis konstruktora

Konstruktor usługi powinien przyjmować konfigurację obejmującą:

- Klucz API (przechowywany bezpiecznie jako zmienna środowiskowa).
- Bazowy URL API OpenRouter.
- Domyślne parametry modelu (np. nazwa modelu, max_tokens, temperature).

Przykładowe pola konstruktora:

- `apiKey: string`
- `baseUrl: string`
- `defaultModelParams: ModelParams`

Konstruktor inicjuje również pola odpowiedzialne za ustawienia komunikatów:

- `systemMessage: string`
- `userMessage: string`

## 3. Publiczne metody i pola

### Metody

1. `sendChatRequest(chatPayload: ChatPayload): Promise<LLMResponse>`
   - Wysyła sformatowane żądanie do API OpenRouter i przetwarza odpowiedź.
2. `setModelParams(params: ModelParams): void`
   - Umożliwia aktualizację parametrów modelu wykorzystywanych przy kolejnych zapytaniach.
3. `updateSystemMessage(message: string): void`
   - Aktualizuje komunikat systemowy dla żądań wysyłanych do API.
4. `updateUserMessage(message: string): void`
   - Aktualizuje treść komunikatu użytkownika.

### Pola

- `apiKey: string`
- `baseUrl: string`
- `defaultModelParams: ModelParams`
- `systemMessage: string`
- `userMessage: string`

## 4. Prywatne metody i pola

### Metody

1. `formatRequest(): RequestPayload`
   - Łączy komunikaty systemowy i użytkownika w jeden sformatowany obiekt zgodny z wymaganiami API OpenRouter.
2. `parseResponse(response: any): LLMResponse`
   - Waliduje i przekształca odpowiedź z API zgodnie z ustalonym response_format.
3. `handleError(error: any): void`
   - Przetwarza błędy, loguje szczegóły oraz inicjuje mechanizm ponowienia lub odpowiedniego reagowania na błąd.
4. `retryRequest(request: RequestPayload): Promise<LLMResponse>`
   - Implementuje mechanizm ponawiania zapytania w przypadku błędów komunikacji lub ograniczeń API.

### Pola

- `retryCount: number` – bieżąca liczba prób ponowienia
- `maxRetries: number` – maksymalna liczba dozwolonych prób

## 5. Obsługa błędów

Potencjalne scenariusze błędów i proponowane rozwiązania:

1. **Błąd połączenia (Network Errors):**
   - Rozwiązanie: Implementacja mechanizmu ponawiania zapytania z eksponencjalnym opóźnieniem oraz zaawansowane logowanie błędów.
2. **Błąd odpowiedzi HTTP (HTTP 4xx/5xx):**
   - Rozwiązanie: Walidacja kodu statusu, zwracanie czytelnych komunikatów błędów oraz analiza przyczyn niepowodzenia.
3. **Błąd walidacji schematu JSON (Schema Validation Errors):**
   - Rozwiązanie: Porównanie odpowiedzi z zdefiniowanym `response_format` i zwrócenie szczegółowych informacji o niezgodnościach.
4. **Timeout zapytania:**
   - Rozwiązanie: Konfiguracja limitu czasu dla zapytań oraz obsługa scenariuszy przekroczenia tego limitu z odpowiednim powiadomieniem użytkownika.

## 6. Kwestie bezpieczeństwa

1. Przechowywanie klucza API wyłącznie w zmiennych środowiskowych, aby zapobiec jego przypadkowemu ujawnieniu w kodzie źródłowym.
2. Używanie HTTPS do komunikacji z API OpenRouter w celu szyfrowania przesyłanych danych.
3. Implementacja mechanizmów limitowania zapytań, aby zabezpieczyć się przed nadużyciami i atakami typu DoS.
4. Walidacja danych wejściowych i wyjściowych, aby zapewnić zgodność z ustalonym schematem oraz zapobiec potencjalnym atakom wstrzyknięć danych.
5. Logowanie zdarzeń i błędów bez ujawniania wrażliwych informacji, co zwiększa bezpieczeństwo całej aplikacji.

## 7. Plan wdrożenia krok po kroku

1. **Przygotowanie środowiska:**
   - Skonfigurowanie zmiennych środowiskowych (API key, URL API).
   - Instalacja niezbędnych zależności przy użyciu npm.
2. **Implementacja modułu usługi OpenRouter:**
   - Stworzenie konstruktora zgodnie z wymaganiami konfiguracji.
   - Implementacja metod formatowania żądań, łączenia komunikatów systemowego i użytkownika.
3. **Integracja z API OpenRouter:**
   - Implementacja metody `sendChatRequest` do wysyłania żądań z odpowiednio sformatowanym payloadem.
   - Konfiguracja `response_format` według wzoru, np.:
     ```json
     {
       "type": "json_schema",
       "json_schema": {
         "name": "llm_response",
         "strict": true,
         "schema": {
           /* JSON Schema Object */
         }
       }
     }
     ```
   - Ustawienie właściwej nazwy modelu (np. "openrouter-llm-model") oraz model parameters (np. `{ max_tokens: 512, temperature: 0.7 }`).
4. **Implementacja obsługi błędów:**
   - Dodanie mechanizmów ponawiania zapytań w przypadku wystąpienia błędów.
   - Walidacja odpowiedzi oraz implementacja odpowiednich komunikatów w przypadku wystąpienia błędów.
