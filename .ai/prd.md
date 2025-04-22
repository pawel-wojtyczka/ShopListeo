# Dokument wymagań produktu (PRD) - ShopListeo
## 1. Przegląd produktu
ShopListeo to aplikacja webowa umożliwiająca łatwe tworzenie, zarządzanie i edycję list zakupowych. System integruje się z asystentem AI, który przetwarza swobodnie wprowadzony tekst na uporządkowaną listę zakupów. Aplikacja umożliwia również oznaczanie produktów jako zakupionych w czasie rzeczywistym, co ułatwia monitorowanie postępów podczas zakupów. Dodatkowo, cała komunikacja z AI odbywa się w formacie JSON, a pełna historia rozmowy jest zapisywana w bazie danych dla celów analitycznych.

## 2. Problem użytkownika
Obecne metody tworzenia list zakupowych (np. zapisywanie na kartce, w notatniku lub wysyłanie przez WhatsApp) są nieefektywne. Użytkownicy nie mogą w łatwy sposób odznaczać zakupionych produktów, co prowadzi do błędów i nieporządku podczas robienia zakupów. Aplikacja ma na celu rozwiązanie tych problemów poprzez elektroniczne zarządzanie listami zakupów.

## 3. Wymagania funkcjonalne
- Uwierzytelnianie użytkownika: Rejestracja i logowanie przy użyciu e-maila oraz hasła (zaszyfrowanego). Dane rejestracyjne obejmują datę rejestracji, ostatnie logowanie oraz datę ostatniej aktualizacji, zapisywane w formacie ISO 8601.
- Zarządzanie listami zakupów: Tworzenie, edycja i usuwanie list zakupów. Użytkownik może wprowadzić listę w formie wolnego tekstu, która zostanie przetworzona przez AI, a także ręcznie dodawać lub modyfikować poszczególne produkty.
- Integracja z AI: Przetwarzanie swobodnie wprowadzonej treści przez asystenta AI, który generuje uporządkowaną listę zakupów. Cała komunikacja odbywa się w formacie JSON, z zachowaniem historii rozmowy w ramach jednego wątku.
- Oznaczanie produktów jako zakupione: Mechanizm przełączania (toggle) umożliwiający oznaczenie produktów jako zakupionych (produkt staje się wyszarzony i przekreślony) oraz cofnięcie tej akcji.
- Finalizacja listy: Użytkownik zatwierdza listę zakupów jako kompletną, co powoduje zapisanie pełnej historii korespondencji z AI w bazie danych.
- Obsługa błędów: System wyświetla jasne komunikaty o błędach użytkownikowi oraz rejestruje szczegółowe dane o błędach (treść błędu, czas wystąpienia, identyfikator użytkownika, typ błędu, poziom krytyczności) w bazie danych `errors_log`.
- Bezpieczny dostęp: Zapewnienie bezpieczeństwa poprzez odpowiednie mechanizmy uwierzytelniania i autoryzacji użytkowników.

## 4. Granice produktu
- MVP obejmuje wyłącznie wersję webową aplikacji.
- Brak integracji z zewnętrznymi usługami (np. OAuth) na etapie MVP.
- Funkcjonalności takie jak współdzielenie list zakupów, dyktowanie treści przez speech-to-text oraz dedykowana aplikacja mobilna są planowane na przyszłość, nie będą jednak częścią pierwszej wersji produktu.

## 5. Historyjki użytkowników
### US-001
- Tytuł: Rejestracja i logowanie
- Opis: Jako użytkownik chcę się zarejestrować i zalogować do systemu używając e-maila oraz hasła, aby uzyskać dostęp do funkcjonalności aplikacji.
- Kryteria akceptacji: System musi zapisać e-mail, zaszyfrowane hasło, datę rejestracji, ostatnie logowanie oraz datę ostatniej aktualizacji (w formacie ISO 8601). Użytkownik musi mieć możliwość logowania przy użyciu tych danych.

### US-002
- Tytuł: Tworzenie listy zakupów przez AI
- Opis: Jako użytkownik chcę wprowadzić swobodny tekst zawierający produkty, aby asystent AI przekształcił go w uporządkowaną listę zakupów.
- Kryteria akceptacji: Po wprowadzeniu tekstu, system przesyła dane w formacie JSON do AI, a otrzymana lista jest wyświetlana użytkownikowi.

### US-003
- Tytuł: Ręczna edycja listy zakupów
- Opis: Jako użytkownik chcę mieć możliwość dodawania nowych produktów oraz edycji już istniejących elementów listy, aby dostosować ją do moich potrzeb.
- Kryteria akceptacji: Użytkownik musi mieć możliwość dodania nowych bloczków z produktami oraz modyfikacji treści istniejących bez dodatkowych walidacji.

### US-004
- Tytuł: Oznaczanie produktów jako zakupione
- Opis: Jako użytkownik chcę móc oznaczać produkty jako zakupione poprzez kliknięcie, aby wizualnie rozróżniać te, które już zostały kupione.
- Kryteria akceptacji: Po kliknięciu produktu, element powinien stać się wyszarzony i przekreślony; kolejne kliknięcie powinno cofnąć tę akcję.

### US-005
- Tytuł: Finalizacja listy zakupów i zapis konwersacji
- Opis: Jako użytkownik chcę zatwierdzić listę zakupów jako kompletną, aby zakończyć proces tworzenia listy i zapisać pełną historię rozmowy z asystentem AI.
- Kryteria akceptacji: Po zatwierdzeniu, system zapisuje pełną historię konwersacji (w formacie JSON) i powiązuje ją z zatwierdzoną listą zakupów w bazie danych.

### US-006
- Tytuł: Bezpieczny dostęp i uwierzytelnianie
- Opis: Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych.
- Kryteria akceptacji:
  - Logowanie i rejestracja odbywają się na dedykowanych stronach.
  - Logowanie wymaga podania adresu email i hasła.
  - Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
  - Użytkownik MOŻE korzystać z tworzenia reguł "ad-hoc" bez logowania się do systemu (US-001).
  - Użytkownik NIE MOŻE korzystać z funkcji tworzenia i edycji list zakupów bez logowania się do systemu (US-002, US-003, US-004, US-005).
  - Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
  - Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
  - Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
  - Odzyskiwanie hasła powinno być możliwe.

## 6. Metryki sukcesu
- Procent list zakupów generowanych przez AI, które zostały zatwierdzone jako kompletne przez użytkowników.
- Liczba zarejestrowanych użytkowników oraz ich aktywność w systemie.
- Dokładność i możliwość odtworzenia pełnej historii rozmowy między użytkownikiem a asystentem AI.
- Szybkość reakcji systemu przy oznaczaniu produktów jako zakupione oraz finalizacji listy.
- Liczba zarejestrowanych błędów oraz efektywność procesu obsługi błędów (na podstawie danych zapisanych w bazie `errors_log`). 


