# Plan Testów dla Projektu "ShopListeo"

## 1. Wprowadzenie i cele testowania

### 1.1. Wprowadzenie

Niniejszy dokument przedstawia kompleksowy plan testów dla aplikacji webowej "ShopListeo", zbudowanej w oparciu o nowoczesny stack technologiczny включающий Astro, React, TypeScript, Supabase oraz integrację z AI (OpenRouter). Aplikacja umożliwia użytkownikom zarządzanie listami zakupów, w tym ich tworzenie, edycję, usuwanie oraz dodawanie i zarządzanie produktami na listach, z wykorzystaniem inteligentnego parsowania danych wejściowych.

Plan ten definiuje strategię, zakres, zasoby, harmonogram oraz kryteria akceptacji dla procesu testowania projektu, mając na celu zapewnienie wysokiej jakości, niezawodności, bezpieczeństwa i użyteczności aplikacji przed jej wdrożeniem.

### 1.2. Cele testowania

Główne cele procesu testowania obejmują:

- **Weryfikacja funkcjonalności:** Potwierdzenie, że wszystkie zaimplementowane funkcje (autoryzacja, zarządzanie listami i produktami, integracja AI) działają zgodnie ze specyfikacją i dokumentacją API.
- **Identyfikacja i eliminacja błędów:** Wykrycie defektów oprogramowania na jak najwcześniejszym etapie cyklu rozwoju.
- **Ocena jakości:** Zapewnienie, że aplikacja spełnia ustalone standardy jakości, wydajności, bezpieczeństwa i użyteczności.
- **Weryfikacja integracji:** Sprawdzenie poprawnej współpracy pomiędzy komponentami front-endowymi (React/Astro), back-endowymi (API endpoints, Supabase), middleware oraz usługami zewnętrznymi (OpenRouter).
- **Zapewnienie bezpieczeństwa:** Weryfikacja mechanizmów autoryzacji, autentykacji oraz ochrony danych użytkowników, w tym Row Level Security (RLS) w Supabase.
- **Ocena wydajności:** Wstępna ocena czasu odpowiedzi aplikacji i jej zachowania pod obciążeniem (w zakresie określonym w planie).
- **Walidacja dokumentacji API:** Sprawdzenie zgodności działania endpointów API z dostarczoną dokumentacją (`docs/api/`).

## 2. Zakres testów

### 2.1. Funkcjonalności objęte testami

Testowaniu podlegają następujące moduły i funkcjonalności:

- **Moduł Autoryzacji:**
  - Rejestracja użytkownika (formularz, walidacja, API, proces Supabase).
  - Logowanie użytkownika (formularz, walidacja, API, zarządzanie sesją/tokenem).
  - Wylogowywanie użytkownika (interfejs, czyszczenie sesji/tokenu, API).
  - Odzyskiwanie hasła (formularz żądania resetu, wysyłka emaila przez Supabase, formularz ustawiania nowego hasła, walidacja tokenu, API).
  - Zarządzanie stanem autoryzacji (`AuthContext`, middleware).
  - Mechanizmy przekierowań dla użytkowników zalogowanych/niezalogowanych (Middleware).
- **Moduł List Zakupów (CRUD):**
  - Tworzenie nowej listy zakupów (przycisk, API klienta, API serwera, usługa).
  - Wyświetlanie listy wszystkich list zakupów (komponent `ShoppingListsView`, hook `useShoppingLists`, paginacja, sortowanie, API).
  - Wyświetlanie szczegółów pojedynczej listy zakupów (komponent `ShoppingListDetailView`, hook `useShoppingListDetail`, API).
  - Aktualizacja tytułu listy zakupów (komponent `EditableShoppingListTitle`, API klienta, API serwera, usługa).
  - Usuwanie listy zakupów (przycisk, dialog potwierdzający, API klienta, API serwera, usługa, usuwanie kaskadowe elementów).
- **Moduł Produktów na Liście Zakupów (CRUD):**
  - Dodawanie produktu do listy (ręcznie - niezaimplementowane w pełni, ale planowane).
  - Dodawanie produktów za pomocą AI (komponent `ProductInputArea`, API `/ai-parse`, `OpenRouterService`, aktualizacja listy).
  - Oznaczanie produktu jako kupiony/niekupiony (checkbox, hook `useShoppingListDetail`, API klienta, API serwera, usługa).
  - Edycja nazwy produktu (interfejs w `ProductItem`, hook `useShoppingListDetail`, API klienta, API serwera, usługa).
  - Usuwanie produktu z listy (przycisk, hook `useShoppingListDetail`, API klienta, API serwera, usługa).
  - Czyszczenie wszystkich produktów z listy (API `/clear-items`).
- **Moduł Zarządzania Użytkownikami (Admin & User):**
  - Pobieranie danych własnego użytkownika (`/api/users/me`).
  - Pobieranie danych użytkownika po ID (API `/api/users/[id]`, sprawdzanie uprawnień).
  - Pobieranie listy wszystkich użytkowników (API `/api/users/index`, tylko admin, paginacja, sortowanie, filtrowanie).
  - Aktualizacja danych użytkownika (API `/api/users/[id]`, własne dane lub admin).
  - Usuwanie użytkownika (API `/api/users/[id]`, własne konto lub admin).
  - Mechanizm sprawdzania uprawnień administratora (`adminAuth.ts`).
- **Komponenty UI:**
  - Poprawność renderowania i działania podstawowych komponentów UI (`components/ui`).
  - Działanie powiadomień (`ToastProvider`, `toast-service`).
  - Layouty (`AuthLayout`, `MainLayout`).
- **Middleware:**
  - Obsługa żądań, wstrzykiwanie klienta Supabase (`locals.supabase`).
  - Ustawianie danych użytkownika i stanu autoryzacji (`locals.user`, `locals.authUser`, `locals.isAuthenticated`).
  - Logika przekierowań dla ścieżek chronionych, autoryzacyjnych i administracyjnych.
  - Obsługa plików statycznych.
  - Zarządzanie cookies sesji (`authToken`, `sb-*`).
- **API Endpoints:**
  - Walidacja danych wejściowych (Zod).
  - Poprawność odpowiedzi (kody statusu, format JSON).
  - Obsługa błędów (walidacja, autoryzacja, błędy serwera).
  - Zgodność z dokumentacją (`docs/api/`).
  - Weryfikacja działania endpointów klienckich (`/api/client/*`) opartych na sesji middleware.
- **Integracja z Supabase:**
  - Poprawność zapytań do bazy danych.
  - Działanie Row Level Security (RLS) - weryfikacja, czy użytkownik ma dostęp tylko do swoich danych.
  - Obsługa logowania i rejestracji przez Supabase Auth.
  - Obsługa resetowania hasła przez Supabase Auth.
- **Integracja z OpenRouter:**
  - Poprawność wysyłania zapytań do API AI.
  - Poprawność parsowania odpowiedzi AI.
  - Obsługa błędów komunikacji z API AI.
  - Bezpieczeństwo klucza API (uwaga na `HARDCODED_API_KEY`!).

### 2.2. Funkcjonalności wyłączone z testów

- Testowanie samego frameworka Astro i biblioteki React (zakładamy ich poprawność).
- Testowanie infrastruktury Supabase (np. dostępność serwerów, wewnętrzne mechanizmy bazy danych).
- Testowanie wewnętrznych mechanizmów modelu AI OpenRouter (testujemy tylko integrację i przetwarzanie odpowiedzi).
- Kompleksowe testy penetracyjne (mogą być przeprowadzone osobno).
- Testowanie kompatybilności ze starszymi lub niszowymi przeglądarkami (skupiamy się na najnowszych wersjach popularnych przeglądarek).
- Testowanie specyficznych problemów związanych z React 19 wspomnianych w `ShoppingListItem.test.tsx` (wymaga dalszej analizy i potencjalnego rozwiązania problemu przed pełnym testowaniem komponentu).

## 3. Typy testów do przeprowadzenia

- **Testy Jednostkowe (Unit Tests):**
  - **Cel:** Weryfikacja poprawności działania izolowanych fragmentów kodu (funkcje, komponenty React, hooki, serwisy, walidatory).
  - **Narzędzia:** Vitest, React Testing Library.
  - **Zakres:** Funkcje pomocnicze (`lib/utils`, `lib/auth/adminAuth`), walidatory Zod (`lib/validators`, `lib/schemas`), komponenty UI (renderowanie, podstawowe interakcje), logika w hookach (mockując API/kontekst), serwisy (mockując Supabase/OpenRouter), logika formatowania daty (`ShoppingListItem.test.tsx`).
- **Testy Integracyjne (Integration Tests):**
  - **Cel:** Weryfikacja poprawnej współpracy pomiędzy różnymi modułami aplikacji.
  - **Narzędzia:** Vitest, React Testing Library, Mock Service Worker (MSW) lub mocki `fetch`.
  - **Zakres:** Interakcja komponentów React z hookami i kontekstem (`AuthContext`), wywołania API z komponentów/hooków (mockując `fetch`), współpraca formularzy (React Hook Form) z logiką walidacji i wysyłki, interakcja serwisów (np. `AuthService` z `userService`). Testowanie API endpointów (`tests/api`, `tests/endpoints`) z mockowanym Supabase.
- **Testy End-to-End (E2E Tests):**
  - **Cel:** Symulacja rzeczywistych scenariuszy użytkownika w przeglądarce, weryfikacja przepływów pracy obejmujących UI, API i bazę danych.
  - **Narzędzia:** Playwright lub Cypress.
  - **Zakres:** Pełny przepływ rejestracji, logowania i wylogowania. Pełny cykl życia listy zakupów (tworzenie, dodawanie/edycja/usuwanie elementów, usuwanie listy). Scenariusze związane z AI parsing. Podstawowe scenariusze odzyskiwania hasła. Testowanie działania middleware (przekierowania).
- **Testy API:**
  - **Cel:** Bezpośrednia weryfikacja działania endpointów API (request/response, walidacja, kody statusu, obsługa błędów, autoryzacja).
  - **Narzędzia:** Postman, Insomnia, Vitest (dla testów programistycznych API jak w `tests/endpoints`).
  - **Zakres:** Wszystkie endpointy w `pages/api/`, weryfikacja zgodności z dokumentacją (`docs/api/`). Testowanie zarówno standardowych API, jak i klienckich (`/api/client/*`).
- **Testy Bezpieczeństwa (Podstawowe):**
  - **Cel:** Identyfikacja podstawowych luk bezpieczeństwa.
  - **Narzędzia:** Ręczna weryfikacja, narzędzia deweloperskie przeglądarki, Supabase Studio (RLS).
  - **Zakres:** Weryfikacja logiki autoryzacji (dostęp do danych innych użytkowników - testy negatywne), sprawdzanie działania RLS w Supabase, walidacja danych wejściowych (zapobieganie XSS/injection - podstawowo), weryfikacja bezpieczeństwa obsługi tokenów/sesji (cookies `httpOnly`, `secure`), sprawdzenie mechanizmu resetu hasła pod kątem podatności, weryfikacja usunięcia `HARDCODED_API_KEY`.
- **Testy Wydajnościowe (Wstępne):**
  - **Cel:** Wstępna ocena czasu odpowiedzi aplikacji i zużycia zasobów przy podstawowych operacjach.
  - **Narzędzia:** Narzędzia deweloperskie przeglądarki (Lighthouse, Performance), `console.time`.
  - **Zakres:** Czas ładowania kluczowych stron (lista list, szczegóły listy), czas odpowiedzi API dla typowych zapytań (pobieranie list, dodawanie/aktualizacja elementów), czas przetwarzania przez AI.
- **Testy Użyteczności (Manualne):**
  - **Cel:** Ocena łatwości obsługi i intuicyjności interfejsu użytkownika.
  - **Narzędzia:** Manualna eksploracja aplikacji.
  - **Zakres:** Przejrzystość przepływów (rejestracja, dodawanie listy/produktu), zrozumiałość komunikatów (błędy, toasty), responsywność interfejsu na różnych urządzeniach (desktop/mobile).
- **Testy Dokumentacji API:**
  - **Cel:** Weryfikacja zgodności działania API z dokumentacją w `docs/api/`.
  - **Narzędzia:** Manualne porównanie, Postman/Insomnia (na podstawie dokumentacji).
  - **Zakres:** Sprawdzenie poprawności URL, metod HTTP, parametrów, formatów body, kodów odpowiedzi i struktur odpowiedzi dla endpointów opisanych w plikach `.md`.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

Poniżej przedstawiono wysokopoziomowe scenariusze testowe. Szczegółowe przypadki testowe zostaną opracowane na ich podstawie.

### 4.1. Autoryzacja i Dostęp

- **Rejestracja:**
  - Pomyślna rejestracja nowego użytkownika z poprawnymi danymi.
  - Próba rejestracji z nieprawidłowym formatem emaila.
  - Próba rejestracji ze zbyt krótkim hasłem.
  - Próba rejestracji z już istniejącym adresem email.
- **Logowanie:**
  - Pomyślne logowanie z poprawnymi danymi.
  - Próba logowania z błędnym hasłem.
  - Próba logowania z nieistniejącym adresem email.
  - Próba logowania z pustym emailem lub hasłem.
  - Pomyślne logowanie z opcją "Zapamiętaj mnie" (weryfikacja trwałości sesji/tokenu).
- **Wylogowanie:**
  - Pomyślne wylogowanie i przekierowanie na stronę logowania.
  - Próba dostępu do chronionej strony po wylogowaniu.
- **Odzyskiwanie Hasła:**
  - Poprawne wysłanie linku resetującego dla istniejącego użytkownika.
  - Komunikat zwrotny przy próbie resetu dla nieistniejącego emaila (bez ujawniania istnienia).
  - Poprawne ustawienie nowego hasła po kliknięciu w link z emaila.
  - Próba użycia nieprawidłowego lub wygasłego tokenu resetującego.
  - Próba ustawienia nowego hasła, które nie spełnia wymagań bezpieczeństwa.
- **Kontrola Dostępu (Middleware):**
  - Próba dostępu do `/shopping-lists` przez niezalogowanego użytkownika (oczekiwane przekierowanie do `/login`).
  - Próba dostępu do `/login` przez zalogowanego użytkownika (oczekiwane przekierowanie do `/`).
  - Próba dostępu do `/api/shopping-lists` bez tokenu (oczekiwany błąd 401).
  - Próba dostępu do `/api/client/shopping-lists` bez ważnej sesji (oczekiwany błąd 401).

### 4.2. Zarządzanie Listami Zakupów

- **Tworzenie Listy:**
  - Pomyślne utworzenie nowej listy z domyślnym tytułem.
  - Weryfikacja, czy nowa lista pojawia się na widoku list.
- **Wyświetlanie List:**
  - Poprawne wyświetlanie listy posiadanych list zakupów.
  - Poprawne działanie paginacji (jeśli list jest więcej niż `pageSize`).
  - Poprawne działanie sortowania (po tytule, dacie utworzenia, dacie modyfikacji).
  - Wyświetlanie informacji o liczbie produktów na każdej liście.
  - Wyświetlanie komunikatu o braku list, gdy użytkownik ich nie posiada.
- **Wyświetlanie Szczegółów Listy:**
  - Poprawne wyświetlanie tytułu i produktów dla wybranej listy.
  - Poprawne wyświetlanie statusu "kupiony/niekupiony" dla produktów.
  - Wyświetlanie komunikatu o pustej liście.
  - Próba dostępu do nieistniejącej listy (oczekiwany błąd 404 lub komunikat).
  - Próba dostępu do listy innego użytkownika (oczekiwany błąd 403/404).
- **Aktualizacja Tytułu:**
  - Pomyślna zmiana tytułu listy przez edytowalny komponent.
  - Próba ustawienia pustego tytułu (oczekiwany błąd walidacji).
  - Próba ustawienia zbyt długiego tytułu (oczekiwany błąd walidacji).
- **Usuwanie Listy:**
  - Pomyślne usunięcie listy po potwierdzeniu w dialogu.
  - Weryfikacja, czy lista zniknęła z widoku list.
  - Anulowanie usuwania w dialogu potwierdzającym.
  - Weryfikacja (manualna lub przez API), czy produkty powiązane z listą zostały usunięte (cascade delete).

### 4.3. Zarządzanie Produktami na Liście

- **Dodawanie przez AI:**
  - Wprowadzenie prostego tekstu (np. "mleko, chleb, jajka") i weryfikacja dodania produktów.
  - Wprowadzenie tekstu z ilościami (np. "2kg jabłek, litr mleka") i weryfikacja poprawności nazw.
  - Wprowadzenie tekstu z prośbą o usunięcie (np. "kup masło, ale nie kupuj mleka") i weryfikacja wyniku.
  - Wprowadzenie tekstu wskazującego na już kupione produkty.
  - Wprowadzenie bardzo długiego tekstu (test limitów).
  - Wprowadzenie tekstu niejasnego lub błędnego (oczekiwane rozsądne zachowanie AI lub błąd).
  - Obsługa błędu, gdy API OpenRouter jest niedostępne lub zwraca błąd.
  - Obsługa błędu, gdy odpowiedź AI ma nieprawidłowy format JSON.
- **Zmiana Statusu:**
  - Oznaczenie produktu jako kupiony (checkbox) i weryfikacja zmiany statusu (UI i ewentualnie API).
  - Odznaczenie produktu jako kupiony i weryfikacja zmiany statusu.
- **Edycja Nazwy:**
  - Pomyślna zmiana nazwy produktu.
  - Próba ustawienia pustej nazwy (oczekiwany błąd walidacji).
  - Próba ustawienia zbyt długiej nazwy (oczekiwany błąd walidacji).
  - Anulowanie edycji (np. przez Esc).
- **Usuwanie Produktu:**
  - Pomyślne usunięcie produktu z listy.
  - Weryfikacja, czy produkt zniknął z widoku szczegółów listy.
- **Czyszczenie Listy:**
  - Wywołanie API `/clear-items` i weryfikacja, czy lista jest pusta.

### 4.4. Uprawnienia i Bezpieczeństwo

- **Dostęp do Danych:**
  - Użytkownik A próbuje uzyskać dostęp (przez API lub UI, jeśli możliwe) do listy zakupów użytkownika B (oczekiwany błąd 403/404).
  - Użytkownik A próbuje zaktualizować/usunąć listę/produkt użytkownika B (oczekiwany błąd 403/404).
- **Uprawnienia Admina:**
  - Administrator próbuje pobrać listę wszystkich użytkowników (oczekiwany sukces).
  - Zwykły użytkownik próbuje pobrać listę wszystkich użytkowników (oczekiwany błąd 403).
  - Administrator próbuje pobrać/zaktualizować/usunąć dane innego użytkownika (oczekiwany sukces).
- **Bezpieczeństwo API Key:**
  - Weryfikacja, czy klucz API OpenRouter nie jest publicznie dostępny w kodzie front-endowym.
  - Weryfikacja, czy `HARDCODED_API_KEY` został usunięty i zastąpiony bezpiecznym mechanizmem (np. zmienna środowiskowa po stronie serwera).

## 5. Środowisko testowe

- **Środowisko Deweloperskie (Lokalne):** Do przeprowadzania testów jednostkowych i integracyjnych przez deweloperów podczas kodowania. Wymaga lokalnej instancji aplikacji i połączenia z deweloperską instancją Supabase.
- **Środowisko Testowe/Staging:** Odizolowane środowisko, jak najbardziej zbliżone do produkcyjnego. Będzie używane do testów E2E, testów API, testów regresji i UAT.
  - **Baza Danych:** Oddzielna instancja Supabase przeznaczona wyłącznie do celów testowych, z możliwością łatwego resetowania danych.
  - **Usługi Zewnętrzne:** Dostęp do API OpenRouter (możliwe użycie klucza testowego lub mockowanie na poziomie środowiska).
  - **Konfiguracja:** Zmienne środowiskowe skonfigurowane dla środowiska testowego (np. `NODE_ENV=staging`, klucze API).
- **Środowisko Produkcyjne:** Używane tylko do testów dymnych (smoke tests) po wdrożeniu nowej wersji.

## 6. Narzędzia do testowania

- **Framework Testowy:** Vitest (do testów jednostkowych i integracyjnych).
- **Biblioteka Testowania Komponentów:** React Testing Library (do testowania komponentów React).
- **Narzędzia E2E:** Playwright (preferowany) lub Cypress.
- **Testowanie API:** Postman / Insomnia (do manualnego testowania i eksploracji API), Vitest (do automatycznych testów API).
- **Mockowanie:** Vi.fn() (Vitest), Mock Service Worker (MSW) (do mockowania API w testach integracyjnych/E2E).
- **Zarządzanie Bazą Danych:** Supabase Studio (do inspekcji i zarządzania danymi w bazie testowej).
- **Analiza Kodu:** ESLint, Prettier (już w projekcie, do utrzymania jakości kodu).
- **Raportowanie Błędów:** GitHub Issues lub dedykowane narzędzie (np. Jira).
- **Przeglądarki:** Najnowsze wersje Chrome, Firefox, Safari, Edge. Narzędzia deweloperskie wbudowane w przeglądarki.

## 7. Harmonogram testów

Harmonogram będzie powiązany z cyklem rozwoju aplikacji.

- **Faza 1: Przygotowanie i Testy Jednostkowe/Integracyjne (Ciągłe):**
  - Konfiguracja środowiska testowego.
  - Rozbudowa istniejących testów jednostkowych i integracyjnych (developers + QA).
  - Pisanie nowych testów jednostkowych i integracyjnych równolegle z rozwojem nowych funkcji.
  - Integracja testów z procesem CI/CD.
- **Faza 2: Testy Systemowe i E2E (Po zakończeniu głównych funkcjonalności / Per Sprint):**
  - Wykonanie scenariuszy testowych E2E dla kluczowych przepływów.
  - Wykonanie testów API.
  - Przeprowadzenie podstawowych testów bezpieczeństwa i użyteczności.
- **Faza 3: Testy Regresji (Przed każdym wydaniem / Po dużych zmianach):**
  - Ponowne wykonanie kluczowych testów (jednostkowych, integracyjnych, E2E) w celu zapewnienia, że nowe zmiany nie zepsuły istniejących funkcjonalności.
- **Faza 4: User Acceptance Testing (UAT) (Przed wdrożeniem na produkcję):**
  - Testy przeprowadzane przez Product Ownera lub wyznaczonych użytkowników końcowych.
- **Faza 5: Testy Dymne (Po wdrożeniu na produkcję):**
  - Szybkie sprawdzenie kluczowych funkcjonalności na środowisku produkcyjnym.

## 8. Kryteria akceptacji testów

### 8.1. Kryteria Wejścia

- Kod źródłowy dla testowanych funkcjonalności jest dostępny w repozytorium.
- Build aplikacji dla środowiska testowego zakończył się sukcesem.
- Środowisko testowe jest dostępne i skonfigurowane.
- Dokumentacja API (jeśli dotyczy) jest dostępna i aktualna.
- Kluczowe zależności (Supabase, OpenRouter) są dostępne w środowisku testowym.

### 8.2. Kryteria Wyjścia

- **Pokrycie Testami:** Osiągnięcie zdefiniowanego poziomu pokrycia kodu testami jednostkowymi i integracyjnymi (np. > 70% dla kluczowych modułów).
- **Wyniki Testów:** Przynajmniej 95% zdefiniowanych przypadków testowych (manualnych i automatycznych) zakończonych sukcesem.
- **Błędy Krytyczne:** Brak otwartych błędów o statusie Krytyczny (Blocker) lub Wysoki (High) związanych z testowaną wersją.
- **Dokumentacja:** Raport z przeprowadzonych testów jest gotowy i zaakceptowany.
- **Akceptacja UAT:** Testy akceptacyjne użytkownika (UAT) zakończone pomyślnie.

## 9. Role i odpowiedzialności w procesie testowania

- **Inżynier QA (Ty):**
  - Opracowanie i utrzymanie planu testów.
  - Projektowanie i implementacja przypadków testowych (manualnych i automatycznych E2E/API).
  - Wykonanie testów systemowych, regresji, wydajnościowych, bezpieczeństwa.
  - Raportowanie i śledzenie błędów.
  - Przygotowanie raportów z testów.
  - Współpraca z deweloperami w celu rozwiązywania błędów.
  - Konfiguracja i utrzymanie środowiska testowego (we współpracy z deweloperami).
- **Deweloperzy:**
  - Pisanie i utrzymanie testów jednostkowych i integracyjnych dla swojego kodu.
  - Naprawa błędów zgłoszonych przez QA.
  - Wsparcie w konfiguracji środowiska testowego.
  - Przeglądanie przypadków testowych.
  - Utrzymanie jakości kodu (ESLint, Prettier).
- **Product Owner / Menedżer Projektu:**
  - Definiowanie wymagań i kryteriów akceptacji.
  - Priorytetyzacja testów i błędów.
  - Przeprowadzenie testów akceptacyjnych użytkownika (UAT).
  - Ostateczna decyzja o wdrożeniu wersji.

## 10. Procedury raportowania błędów

- **Narzędzie:** GitHub Issues (lub dedykowane narzędzie jak Jira, jeśli dostępne).
- **Format Zgłoszenia Błędu:** Każde zgłoszenie powinno zawierać co najmniej:
  - **Tytuł:** Krótki, zwięzły opis problemu.
  - **Środowisko:** Wersja aplikacji, przeglądarka, system operacyjny, środowisko (Test/Staging, Dev).
  - **Kroki do Reprodukcji:** Szczegółowa lista kroków pozwalająca jednoznacznie odtworzyć błąd.
  - **Obserwowane Zachowanie:** Co faktycznie się stało.
  - **Oczekiwane Zachowanie:** Co powinno się stać zgodnie ze specyfikacją.
  - **Priorytet/Waga (Severity):** (np. Krytyczny, Wysoki, Średni, Niski) - ustalane przez QA, weryfikowane przez PO.
  - **Zrzuty Ekranu/Nagrania Wideo:** Jeśli to możliwe, dołączone w celu lepszego zrozumienia problemu.
  - **Logi:** Istotne logi z konsoli przeglądarki lub serwera, jeśli dostępne.
- **Cykl Życia Błędu:**
  1.  QA zgłasza błąd (Status: Nowy/Open).
  2.  PO/Team Lead weryfikuje i priorytetyzuje błąd.
  3.  Deweloper przypisuje błąd do siebie i rozpoczyna pracę (Status: W toku/In Progress).
  4.  Deweloper naprawia błąd i oznacza go jako rozwiązany (Status: Rozwiązany/Resolved, Gotowy do Testów/Ready for Testing).
  5.  QA weryfikuje poprawkę w środowisku testowym.
  6.  Jeśli poprawka działa: QA zamyka błąd (Status: Zamknięty/Closed).
  7.  Jeśli poprawka nie działa: QA ponownie otwiera błąd (Status: Ponownie Otwarty/Reopened) z komentarzem.
