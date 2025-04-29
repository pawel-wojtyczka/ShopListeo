# ShopListeo

Aplikacja webowa zaprojektowana w celu uproszczenia procesu tworzenia i zarządzania listami zakupów. Główną cechą aplikacji jest wykorzystanie asystenta AI do inteligentnego parsowania tekstu wprowadzonego przez użytkownika i przekształcania go w uporządkowaną listę produktów. Umożliwia tworzenie, edycję list, oznaczanie zakupionych produktów oraz zarządzanie kontem. Zawiera również panel administracyjny.

## Tech Stack

### Główne Technologie

- **[Astro](https://astro.build/) v5.5.5**: Nowoczesny web framework do budowy szybkich stron (SSR/SSG).
- **[React](https://react.dev/) v19.0.0**: Biblioteka UI do budowy interaktywnych komponentów.
- **[TypeScript](https://www.typescriptlang.org/) v5**: Statyczne typowanie dla JavaScript.
- **[Tailwind CSS](https://tailwindcss.com/) v4.0.17**: Framework CSS typu utility-first.
- **[Shadcn/ui](https://ui.shadcn.com/)**: Biblioteka komponentów UI oparta na Radix UI i Tailwind CSS.

### Backend & Baza Danych

- **[Supabase](https://supabase.com/)**: Platforma Backend-as-a-Service (BaaS) z bazą danych PostgreSQL, uwierzytelnianiem i API.

### Sztuczna Inteligencja

- **[OpenRouter.ai](https://openrouter.ai/)**: Agregator API modeli językowych (LLM) do przetwarzania list zakupów.

### Narzędzia Deweloperskie

- **[ESLint](https://eslint.org/) v9**: Lintowanie kodu.
- **[Prettier](https://prettier.io/)**: Formatowanie kodu.
- **[Zod](https://zod.dev/)**: Walidacja schematów danych.
- **[React Hook Form](https://react-hook-form.com/)**: Zarządzanie formularzami w React.
- **[Husky](https://typicode.github.io/husky/) & [lint-staged](https://github.com/okonet/lint-staged)**: Git hooks do automatyzacji sprawdzania jakości kodu.

### Narzędzia Testowe

- **[Vitest](https://vitest.dev/)**: Framework do testów jednostkowych i integracyjnych.
- **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)**: Biblioteka do testowania komponentów React.
- **[Playwright](https://playwright.dev/)**: Framework do testów End-to-End (E2E).
- **[Mock Service Worker (MSW)](https://mswjs.io/)**: Biblioteka do mockowania API w testach.

## Wymagania Wstępne

- Node.js v22.14.0 (zgodnie z `.nvmrc`)
- npm (dostarczany z Node.js)
- Dostęp do instancji Supabase (lokalnej lub zdalnej)
- Klucz API dla OpenRouter.ai

## Rozpoczęcie Pracy Lokalnej

1.  Sklonuj repozytorium:
    ```bash
    git clone git@github.com:pawel-wojtyczka/ShopListeo.git
    cd ShopListeo
    ```
2.  Zainstaluj zależności:
    ```bash
    npm install
    ```
3.  Skonfiguruj zmienne środowiskowe (utwórz plik `.env` na podstawie `.env.example` i uzupełnij wartości):
    ```bash
    cp .env.example .env
    # Edytuj plik .env z własnymi kluczami Supabase i OpenRouter
    ```
4.  Uruchom serwer deweloperski:
    ```bash
    npm run dev
    ```
5.  Aplikacja będzie dostępna pod adresem `http://localhost:3000` (lub innym skonfigurowanym portem).

## Dostępne Skrypty

- `npm run dev`: Uruchamia serwer deweloperski Astro.
- `npm run build`: Buduje aplikację do wdrożenia produkcyjnego.
- `npm run preview`: Uruchamia podgląd zbudowanej aplikacji produkcyjnej.
- `npm run astro`: Dostęp do komend CLI Astro.
- `npm run lint`: Uruchamia ESLint do sprawdzenia jakości kodu.
- `npm run lint:fix`: Uruchamia ESLint z automatycznym poprawianiem błędów.
- `npm run format`: Uruchamia Prettier do formatowania kodu.
- `npm run test`: Uruchamia testy jednostkowe i integracyjne (Vitest).
- `npm run test:watch`: Uruchamia Vitest w trybie watch.
- `npm run test:coverage`: Uruchamia testy z generowaniem raportu pokrycia.
- `npm run test:ui`: Uruchamia interfejs graficzny Vitest UI.
  _(Uwaga: Skrypty dla Playwright (`test:e2e_`) nie są zdefiniowane w `package.json`)\*

## Wsparcie Rozwoju z AI

Projekt jest skonfigurowany do współpracy z narzędziami AI w celu usprawnienia procesu deweloperskiego:

- **Cursor IDE:** Reguły AI w katalogu `.cursor/rules/` pomagają IDE zrozumieć strukturę projektu i dostarczać lepsze sugestie kodu.
- **GitHub Copilot:** Instrukcje dla Copilota znajdują się w `.github/copilot-instructions.md`.
- **Windsurf:** Plik `.windsurfrules` zawiera konfigurację AI dla Windsurf.

## Testowanie

Projekt ShopListeo wykorzystuje kompleksowe podejście do testowania:

### Testy Jednostkowe i Integracyjne (Vitest)

Oparte na [Vitest](https://vitest.dev/) i [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/). Testują poszczególne komponenty React, hooki, funkcje pomocnicze i logikę serwisów w izolacji lub w małych grupach. Do mockowania API używany jest [MSW](https://mswjs.io/).

Aby uruchomić testy jednostkowe/integracyjne:

```bash
# Jednorazowe uruchomienie
npm run test

# Uruchomienie w trybie watch
npm run test:watch

# Uruchomienie z raportem pokrycia
npm run test:coverage

# Uruchomienie z interfejsem graficznym
npm run test:ui

### Testy End-to-End (Playwright)

Oparte na Playwright. Testują aplikację jako całość z perspektywy użytkownika końcowego, symulując interakcje w przeglądarce.
(Aktualnie brak zdefiniowanych skryptów npm run test:e2e* w package.json. Należy je dodać, aby uruchomić testy E2E.)

### Struktura Testów

src/__tests__/unit/: Testy jednostkowe dla komponentów, hooków, serwisów.
src/__tests__/integration/: Testy integracyjne (np. interakcji komponentów, API).
src/__tests__/e2e/: Testy End-to-End z Playwright.
src/__tests__/helpers/: Funkcje pomocnicze dla testów (np. auth.ts).
src/__tests__/setup.ts: Globalna konfiguracja dla Vitest (np. mockowanie, rozszerzenia matcherów).

### Contributing

Proszę o przestrzeganie wytycznych AI i praktyk kodowania zdefiniowanych w plikach konfiguracyjnych AI podczas pracy nad projektem. Używaj npm run lint i npm run format przed commitem.

### Licencja

MIT

## Konfiguracja Supabase Webhooks

Aby poprawnie synchronizować użytkowników między Supabase Auth a tabelą `public.users`,
należy skonfigurować webhook w panelu Supabase:

1. Przejdź do Supabase Dashboard → Project Settings → API → Auth Hooks
2. W sekcji "Webhooks" skonfiguruj:
   - URL: `https://twoja-domena.com/api/auth-webhook`
   - Events: wybierz "User Created"
   - Secret: wygeneruj losowy ciąg znaków i zapisz go jako zmienną środowiskową `WEBHOOK_SECRET`

3. Dodaj następujące zmienne środowiskowe do projektu:
```

PUBLIC_SUPABASE_URL=https://twój-projekt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=twój-klucz-service-role
WEBHOOK_SECRET=twój-losowy-secret

```

```
