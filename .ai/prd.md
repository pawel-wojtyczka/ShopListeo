# Dokument Wymagań Produktu (PRD) - ShopListeo

_Ostatnia aktualizacja: 28.04.2025_

## 1. Przegląd produktu

ShopListeo to nowoczesna aplikacja webowa zaprojektowana w celu uproszczenia procesu tworzenia i zarządzania listami zakupów. Główną cechą aplikacji jest wykorzystanie asystenta AI (poprzez OpenRouter.ai) do inteligentnego parsowania tekstu wprowadzonego przez użytkownika i przekształcania go w uporządkowaną listę produktów. Aplikacja umożliwia użytkownikom nie tylko tworzenie i edycję list, ale także interaktywne oznaczanie zakupionych produktów oraz zarządzanie swoim kontem. Dodatkowo, system zawiera panel administracyjny do zarządzania użytkownikami.

## 2. Problem użytkownika

Tradycyjne metody tworzenia list zakupów (kartka, notatnik, komunikatory) są często nieefektywne, czasochłonne i podatne na błędy. Brak możliwości łatwego oznaczania zakupionych pozycji i dynamicznego zarządzania listą prowadzi do dezorganizacji podczas zakupów. ShopListeo adresuje te problemy, oferując scentralizowane, inteligentne i interaktywne rozwiązanie webowe.

## 3. Wymagania funkcjonalne

### 3.1. Uwierzytelnianie i Zarządzanie Kontem Użytkownika

- **Rejestracja:** Użytkownicy mogą tworzyć nowe konta za pomocą adresu e-mail i hasła. System waliduje poprawność danych i unikalność adresu e-mail.
- **Logowanie:** Zarejestrowani użytkownicy mogą logować się przy użyciu e-maila i hasła.
- **Wylogowywanie:** Użytkownicy mogą bezpiecznie zakończyć sesję.
- **Odzyskiwanie hasła:**
  - Użytkownicy mogą zażądać linku do resetowania hasła na podany adres e-mail.
  - Użytkownicy mogą ustawić nowe hasło, korzystając z otrzymanego linku (tokena).
- **Zarządzanie sesją:** System wykorzystuje mechanizmy sesji (prawdopodobnie oparte na tokenach/ciasteczkach Supabase) do utrzymania stanu zalogowania użytkownika. Middleware weryfikuje sesję dla chronionych tras.
- **Profil użytkownika (niejawny w UI, ale wspierany przez API):** API umożliwia pobieranie i potencjalnie aktualizację danych własnego profilu (np. email).

### 3.2. Zarządzanie Listami Zakupów

- **Tworzenie Listy:** Zalogowani użytkownicy mogą tworzyć nowe listy zakupów. Domyślnie lista może otrzymywać tytuł oparty na dacie utworzenia.
- **Wyświetlanie List:** Zalogowani użytkownicy widzą listę wszystkich swoich list zakupów, posortowaną (domyślnie po dacie utworzenia). Wyświetlana jest nazwa listy oraz liczba elementów.
- **Wyświetlanie Szczegółów Listy:** Użytkownicy mogą przeglądać zawartość konkretnej listy zakupów, w tym jej produkty.
- **Aktualizacja Tytułu Listy:** Użytkownicy mogą edytować tytuł istniejącej listy zakupów (edycja inline).
- **Usuwanie Listy:** Użytkownicy mogą usuwać swoje listy zakupów (z potwierdzeniem). Usunięcie listy powoduje usunięcie wszystkich powiązanych z nią produktów (cascade delete).

### 3.3. Zarządzanie Produktami na Liście Zakupów

- **Dodawanie Produktów (przez AI):** Użytkownicy mogą wprowadzić tekst opisujący produkty w polu tekstowym. Po zatwierdzeniu, tekst jest wysyłany do API (`/api/shopping-lists/:listId/ai-parse`), które wykorzystuje AI (OpenRouterService) do przetworzenia go na listę produktów. Istniejące produkty i ich status `purchased` są brane pod uwagę podczas aktualizacji.
- **Oznaczanie Produktów:** Użytkownicy mogą oznaczać produkty jako zakupione lub niekupione za pomocą checkboxa. Zmiana statusu jest zapisywana i odzwierciedlana w interfejsie (np. stylizacją).
- **Edycja Nazwy Produktu:** Użytkownicy mogą edytować nazwę istniejącego produktu na liście (edycja inline).
- **Usuwanie Produktu:** Użytkownicy mogą usuwać pojedyncze produkty z listy.
- **Czyszczenie Listy:** Istnieje endpoint API (`/api/shopping-lists/:listId/clear-items`) do usuwania wszystkich produktów z listy (funkcjonalność może nie być jeszcze w pełni wyeksponowana w UI).

### 3.4. Panel Administracyjny

- **Dostęp:** Dostępny tylko dla użytkowników z uprawnieniami administratora.
- **Lista Użytkowników:** Administratorzy mogą przeglądać listę wszystkich zarejestrowanych użytkowników z paginacją i podstawowymi informacjami (email, data rejestracji, ostatnie logowanie).
- **Szczegóły Użytkownika:** Administratorzy mogą przeglądać szczegółowe dane wybranego użytkownika.
- **Zarządzanie Użytkownikami:** Administratorzy mogą aktualizować dane użytkownika (email, potencjalnie reset hasła) oraz usuwać konta użytkowników.

### 3.5. Wymagania Niefunkcjonalne

- **Interfejs Użytkownika:** Aplikacja posiadać będzie responsywny interfejs użytkownika oparty na Tailwind CSS i komponentach Shadcn/ui, wspierający tryb jasny i ciemny.
- **Wydajność:** Aplikacja powinna szybko reagować na interakcje użytkownika, zwłaszcza przy ładowaniu list i oznaczaniu produktów.
- **Bezpieczeństwo:** Hasła są hashowane, komunikacja odbywa się przez HTTPS, stosowane są mechanizmy ochrony przed atakami (walidacja danych, autoryzacja).
- **Logowanie Błędów:** System powinien logować błędy występujące w aplikacji (backend/frontend) w celu ułatwienia diagnozy.

## 4. Granice produktu (Zakres MVP i Poza MVP)

### 4.1. W zakresie MVP (na podstawie kodu)

- Pełna funkcjonalność autentykacji (Rejestracja, Logowanie, Wylogowanie, Odzyskiwanie hasła).
- Podstawowe zarządzanie listami zakupów (Tworzenie, Wyświetlanie listy list, Wyświetlanie szczegółów, Aktualizacja tytułu, Usuwanie).
- Zarządzanie produktami: Dodawanie przez AI parsing, Oznaczanie kupionych, Edycja nazw, Usuwanie pojedynczych produktów, Czyszczenie listy (API).
- Panel administracyjny: Wyświetlanie listy użytkowników, Szczegóły użytkownika, Aktualizacja użytkownika (API), Usuwanie użytkownika (API).
- Aplikacja webowa, responsywna.
- Tryb jasny/ciemny.

### 4.2. Poza zakresem MVP (na podstawie `app_specs.md` i braku w kodzie)

- Aplikacje mobilne.
- Integracja z zewnętrznymi usługami logowania (np. Google, Facebook).
- Współdzielenie list zakupów między użytkownikami.
- Dyktowanie treści przez speech-to-text.
- Bardziej zaawansowane funkcje AI (np. kategoryzacja produktów, sugestie).
- Powiadomienia push.
- Funkcjonalność offline.
- Szczegółowe logowanie historii konwersacji AI w tabeli `conversations` (tabela istnieje, ale brak widocznej logiki jej wykorzystania).
- Dedykowana tabela `errors_log` (brak migracji dla niej).

## 5. Historyjki użytkowników

### 5.1. Użytkownik Standardowy

- **US-Auth-01 (Rejestracja):** Jako nowy użytkownik, chcę móc zarejestrować konto używając emaila i bezpiecznego hasła, aby uzyskać dostęp do aplikacji.
- **US-Auth-02 (Logowanie):** Jako zarejestrowany użytkownik, chcę móc zalogować się do aplikacji przy użyciu mojego emaila i hasła.
- **US-Auth-03 (Odzyskiwanie Hasła):** Jako użytkownik, który zapomniał hasła, chcę móc zażądać linku resetującego na mój email, aby odzyskać dostęp do konta.
- **US-Auth-04 (Ustawianie Nowego Hasła):** Jako użytkownik, który otrzymał link resetujący, chcę móc ustawić nowe, bezpieczne hasło dla mojego konta.
- **US-Auth-05 (Wylogowanie):** Jako zalogowany użytkownik, chcę móc się wylogować, aby zakończyć sesję.
- **US-List-01 (Tworzenie Listy):** Jako zalogowany użytkownik, chcę móc szybko utworzyć nową listę zakupów, aby zacząć dodawać produkty.
- **US-List-02 (Przeglądanie List):** Jako zalogowany użytkownik, chcę widzieć wszystkie moje listy zakupów, aby móc łatwo wybrać, którą chcę edytować lub przejrzeć.
- **US-List-03 (Edycja Tytułu):** Jako zalogowany użytkownik, chcę móc zmienić tytuł mojej listy zakupów, aby lepiej odpowiadał jej zawartości.
- **US-List-04 (Usuwanie Listy):** Jako zalogowany użytkownik, chcę móc usunąć listę zakupów, której już nie potrzebuję.
- **US-Item-01 (Dodawanie przez AI):** Jako użytkownik edytujący listę, chcę móc wpisać lub wkleić tekst z produktami, aby AI automatycznie dodało je do mojej listy, uwzględniając istniejące pozycje.
- **US-Item-02 (Oznaczanie Kupionych):** Jako użytkownik przeglądający listę (np. podczas zakupów), chcę móc łatwo oznaczyć produkt jako kupiony (i odznaczyć), aby śledzić postęp.
- **US-Item-03 (Edycja Nazwy Produktu):** Jako użytkownik edytujący listę, chcę móc poprawić lub zmienić nazwę produktu na liście.
- **US-Item-04 (Usuwanie Produktu):** Jako użytkownik edytujący listę, chcę móc usunąć pojedynczy produkt z listy.

### 5.2. Administrator

- **US-Admin-01 (Przeglądanie Użytkowników):** Jako administrator, chcę widzieć listę wszystkich użytkowników systemu z możliwością paginacji, aby móc nimi zarządzać.
- **US-Admin-02 (Szczegóły Użytkownika):** Jako administrator, chcę móc zobaczyć szczegółowe informacje o wybranym użytkowniku.
- **US-Admin-03 (Aktualizacja Użytkownika):** Jako administrator, chcę móc zaktualizować adres e-mail lub zresetować hasło użytkownika.
- **US-Admin-04 (Usuwanie Użytkownika):** Jako administrator, chcę móc usunąć konto użytkownika z systemu.

## 6. Metryki sukcesu

- **Aktywacja Użytkowników:** Procent zarejestrowanych użytkowników, którzy utworzyli co najmniej jedną listę zakupów.
- **Akceptacja AI:** Procent list/produktów dodanych za pomocą AI, które nie zostały natychmiast usunięte lub zmodyfikowane przez użytkownika.
- **Zaangażowanie:** Średnia liczba list na użytkownika, średnia liczba produktów na liście, częstotliwość oznaczania produktów jako kupione.
- **Retencja:** Procent użytkowników powracających do aplikacji po pierwszym tygodniu/miesiącu.
- **Stabilność:** Liczba błędów serwera (5xx) i błędów klienta (4xx) zgłaszanych przez system monitoringu lub logi.
- **Wydajność:** Średni czas odpowiedzi API dla kluczowych operacji (pobieranie list, aktualizacja statusu produktu). Czas ładowania strony.
