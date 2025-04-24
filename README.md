# 10x Astro Starter

A modern, opinionated starter template for building fast, accessible, and AI-friendly web applications.

## Tech Stack

- [Astro](https://astro.build/) v5.5.5 - Modern web framework for building fast, content-focused websites
- [React](https://react.dev/) v19.0.0 - UI library for building interactive components
- [TypeScript](https://www.typescriptlang.org/) v5 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v4.0.17 - Utility-first CSS framework

### Testing Tools
- [Vitest](https://vitest.dev/) - Unit testing framework
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) - Testing utilities for React components
- [Playwright](https://playwright.dev/) - End-to-end testing framework
- [MSW](https://mswjs.io/) - API mocking library for tests

## Prerequisites

- Node.js v22.14.0 (as specified in `.nvmrc`)
- npm (comes with Node.js)

## Getting Started

1. Clone the repository:

```bash
git git@github.com:pawel-wojtyczka/ShopListeo.git
cd ShopListeo
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run test` - Run unit tests with Vitest
- `npm run test:ui` - Run Vitest with UI
- `npm run test:e2e` - Run end-to-end tests with Playwright

## Project Structure

```md
.
├── src/
│   ├── layouts/    # Astro layouts
│   ├── pages/      # Astro pages
│   │   └── api/    # API endpoints
│   ├── components/ # UI components (Astro & React)
│   └── assets/     # Static assets
├── public/         # Public assets
├── tests/          # Test files
│   ├── unit/       # Unit tests
│   └── e2e/        # End-to-end tests
```

## AI Development Support

This project is configured with AI development tools to enhance the development experience, providing guidelines for:

- Project structure
- Coding practices
- Frontend development
- Styling with Tailwind
- Accessibility best practices
- Astro and React guidelines

### Cursor IDE

The project includes AI rules in `.cursor/rules/` directory that help Cursor IDE understand the project structure and provide better code suggestions.

### GitHub Copilot

AI instructions for GitHub Copilot are available in `.github/copilot-instructions.md`

### Windsurf

The `.windsurfrules` file contains AI configuration for Windsurf.

## Contributing

Please follow the AI guidelines and coding practices defined in the AI configuration files when contributing to this project.

## License

MIT

## Testowanie

Projekt ShopListeo używa dwóch głównych podejść do testowania:

### Testy jednostkowe (Vitest)

Testy jednostkowe są oparte na Vitest i React Testing Library. Pozwalają na testowanie poszczególnych komponentów i funkcji w izolacji.

Aby uruchomić testy jednostkowe:

```bash
# Jednorazowe uruchomienie wszystkich testów
npm run test

# Uruchomienie testów w trybie watch (automatyczne uruchamianie po zmianach)
npm run test:watch

# Uruchomienie testów z generowaniem raportów pokrycia
npm run test:coverage

# Uruchomienie testów w UI Vitest
npm run test:ui
```

### Testy End-to-End (Playwright)

Testy E2E są oparte na Playwright i testują aplikację jako całość z perspektywy użytkownika końcowego.

Aby uruchomić testy E2E:

```bash
# Instalacja przeglądarek potrzebnych do testów
npx playwright install chromium

# Jednorazowe uruchomienie wszystkich testów E2E
npm run test:e2e

# Uruchomienie testów E2E w trybie UI
npm run test:e2e:ui

# Uruchomienie testów E2E w trybie debug
npm run test:e2e:debug
```

### Struktura testów

- `src/**/*.test.ts(x)` - Testy jednostkowe dla komponentów i funkcji
- `tests/e2e/*.spec.ts` - Testy E2E z Playwright
- `tests/e2e/pages/` - Page Object Models dla testów E2E
- `src/mocks/` - Mocki dla API do testów jednostkowych z MSW

### Technologie testowe

- Vitest - Framework do testów jednostkowych i integracyjnych
- React Testing Library - Biblioteka do testowania komponentów React
- MSW (Mock Service Worker) - Biblioteka do mockowania API
- Playwright - Framework do testów E2E
- Snapshot Testing - Do testowania UI
