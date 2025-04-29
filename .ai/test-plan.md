# Plan Testów - ShopListeo

## 1. Wprowadzenie i Cele Testowania

Celem testowania jest zapewnienie wysokiej jakości aplikacji, sprawnego działania kluczowych funkcjonalności oraz stabilności systemu. Testy mają na celu wykrycie błędów na wczesnym etapie, zapewnienie spójności komponentów aplikacji oraz wsparcie procesu ciągłej integracji i wdrażania.

## 2. Zakres Testów

- Testy jednostkowe: sprawdzają poprawność działania pojedynczych funkcji i komponentów (m.in. moduły React, funkcje w Astro, narzędzia pomocnicze w `./src/lib`).
- Testy integracyjne: weryfikują współdziałanie między komponentami oraz komunikację z API (np. `./src/pages/api`).
- Testy end-to-end: symulują rzeczywiste scenariusze użytkownika, obejmujące interakcje UI oraz nawigację po stronie.
- Testy wydajnościowe: oceniają obciążenie systemu, czas odpowiedzi oraz reakcję aplikacji przy dużym ruchu.
- Testy dostępności: sprawdzają zgodność aplikacji z wytycznymi WCAG i ogólną dostępność dla różnych grup użytkowników.
- Testy bezpieczeństwa: identyfikują potencjalne luki w zabezpieczeniach i problemy z ochroną danych.
- Testy wizualne: wykrywają niezamierzone zmiany w interfejsie użytkownika.

## 3. Typy Testów

- **Testy jednostkowe**: użycie Vitest (zamiast Jest) i React Testing Library do testowania pojedynczych funkcji i komponentów.
- **Testy integracyjne**: weryfikacja poprawnej komunikacji między warstwami aplikacji, w tym specjalne testy komponentów Astro oraz połączenia API z bazą danych (Supabase).
- **Testy end-to-end**: wykorzystanie Playwright do symulacji pełnych ścieżek użytkownika.
- **Testy wydajnościowe**: analiza czasu odpowiedzi i obciążenia systemu przy użyciu Lighthouse CI (dla metryki Web Vitals) oraz k6 (dla testów obciążeniowych).
- **Testy dostępności**: automatyczna analiza zgodności z WCAG przy użyciu narzędzia Axe.
- **Testy bezpieczeństwa**: skanowanie pod kątem typowych luk bezpieczeństwa przy użyciu OWASP ZAP.
- **Testy wizualne**: wykrywanie regresji wizualnych przy użyciu Percy lub Chromatic.
- **Testy kontraktowe**: sprawdzanie zgodności API z oczekiwaniami przy użyciu Pactum.js.

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

- **Renderowanie i interakcje UI**: testowanie poprawności renderowania komponentów (React, Astro, Shadcn/ui) oraz ich interakcji (np. walidacja formularzy, obsługa zdarzeń kliknięć).
- **Działanie API**: sprawdzenie operacji CRUD w punktach końcowych (`./src/pages/api`) oraz poprawności komunikacji z bazą danych. Użycie MSW (Mock Service Worker) do mockowania odpowiedzi API w testach.
- **Scenariusze użytkownika**: symulacja logowania, przeglądania produktów, wyszukiwania, filtrowania oraz dodawania produktów do koszyka.
- **Responsywność i kompatybilność**: testowanie działania aplikacji na różnych urządzeniach i przeglądarkach.
- **Specyfika Astro**: testowanie hydracji, routing oraz Islands Architecture w komponentach Astro.

## 5. Środowisko Testowe

- **Środowisko deweloperskie**: lokalne maszyny programistów z pełną konfiguracją projektu.
- **Środowisko staging**: serwer symulujący ustawienia produkcyjne, wykorzystywany do testów integracyjnych oraz end-to-end.
- **Testowa baza danych**: oddzielna instancja Supabase do testowania operacji na danych bez wpływu na środowisko produkcyjne.
- **Storybook**: izolowane środowisko do testowania i dokumentowania komponentów UI.

## 6. Narzędzia do Testowania

- **Frameworki testowe**: Vitest, React Testing Library, Playwright.
- **Testowanie komponentów UI**: Storybook z addonsami dla Astro/React.
- **Mockowanie API**: MSW (Mock Service Worker), Pactum.js dla testów kontraktowych.
- **Narzędzia do analizy kodu**: ESLint, Prettier.
- **Narzędzia do pokrycia kodu testami**: Vitest UI, Codecov lub SonarQube.
- **Testowanie wizualne**: Percy lub Chromatic dla testów regresji wizualnej.
- **Testowanie dostępności**: Axe.
- **Testowanie bezpieczeństwa**: OWASP ZAP.
- **Testowanie wydajności**: Lighthouse CI, k6.
- **Systemy CI/CD**: GitHub Actions do automatyzacji uruchamiania testów.
- **Narzędzia do raportowania błędów**: GitHub Issues, JIRA lub inny system zarządzania błędami.

## 7. Harmonogram Testów

- **Testy jednostkowe i integracyjne**: uruchamiane automatycznie przy każdym commicie oraz w ramach pipeline CI/CD.
- **Testy end-to-end**: wykonywane regularnie, np. raz w tygodniu na środowisku staging.
- **Testy wydajnościowe**: przeprowadzane przy większych zmianach w krytycznych komponentach oraz przed wydaniem nowej wersji aplikacji.
- **Testy dostępności i bezpieczeństwa**: przeprowadzane w cyklach miesięcznych oraz przed większymi wydaniami.
- **Testy wizualne**: uruchamiane przy każdym pull requeście zmieniającym komponent UI.

## 8. Kryteria Akceptacji Testów

- Wszystkie testy jednostkowe i integracyjne muszą przechodzić bez błędów.
- Minimalne pokrycie testami kluczowych modułów (zalecane minimum: 80%).
- Brak krytycznych błędów wpływających na funkcjonalność aplikacji.
- Pozytywne wyniki testów end-to-end na środowisku staging.
- Zgodność z podstawowymi standardami dostępności (poziom AA WCAG).
- Brak wykrytych krytycznych luk bezpieczeństwa.
- Metryki Web Vitals w dopuszczalnym zakresie.

## 9. Role i Odpowiedzialności

- **Zespół deweloperski**: tworzenie i utrzymanie testów jednostkowych oraz integracyjnych.
- **Inżynierowie QA**: prowadzenie testów end-to-end, testów wydajnościowych oraz nadzór nad poprawnością wdrożeń.
- **Specjaliści ds. dostępności**: weryfikacja zgodności z wytycznymi WCAG.
- **Specjaliści ds. bezpieczeństwa**: prowadzenie testów bezpieczeństwa i analiza zagrożeń.
- **Menedżerowie projektów**: koordynacja harmonogramu testów oraz monitorowanie raportowania błędów.

## 10. Procedury Raportowania Błędów

- Zgłaszanie błędów poprzez systemy takie jak GitHub Issues lub JIRA.
- Klasyfikacja błędów według krytyczności (krytyczne, średnie, niskie).
- Dokumentacja kroków do reprodukcji błędu, załączanie logów i zrzutów ekranu.
- Regularne przeglądy zgłoszonych błędów oraz ustalanie priorytetów napraw.
- Automatyczne powiadomienia o niepowodzeniach testów w pipeline CI/CD.
