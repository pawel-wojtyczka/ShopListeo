# ShopListeo

ShopListeo to nowoczesna aplikacja webowa do zarządzania listami zakupowymi. Dzięki integracji z asystentem AI użytkownicy mogą w łatwy i szybki sposób generować, edytować oraz monitorować swoje listy zakupów. Aplikacja umożliwia oznaczanie produktów jako zakupionych w czasie rzeczywistym, co upraszcza proces robienia zakupów, a cała komunikacja z AI odbywa się w formacie JSON, co pozwala na zapisywanie pełnej historii rozmowy dla celów analitycznych.

## Tech Stack

### Frontend
- Astro 5: Framework do tworzenia szybkich i wydajnych stron.
- React 19: Biblioteka do budowania interaktywnych komponentów.
- TypeScript 5: Zapewnia statyczne typowanie dla lepszej jakości kodu.
- Tailwind CSS 4: Umożliwia stylowanie przy użyciu podejścia utility-first.
- Shadcn/ui: Biblioteka dostępnych komponentów dla React.

### Backend
- Supabase: Rozwiązanie backendowe oferujące bazę danych PostgreSQL, wbudowaną autentykację oraz SDK w wielu językach, co pozwala na szybkie wdrożenie systemu.

### Artificial Intelligence
- Openrouter.ai: Umożliwia komunikację z modelami AI (OpenAI, Anthropic, Google i innymi) w celu przetwarzania danych zakupowych przy zachowaniu niskich kosztów i wysokiej efektywności.

### CI/CD i Hosting
- Github Actions: Do budowy pipeline'ów CI/CD.
- DigitalOcean: Do hostowania aplikacji przy użyciu kontenerów Docker.

## Prerequisites

- Node.js v22.14.0 (zgodnie z plikiem `.nvmrc`)
- npm (dostarczany z Node.js)

## Getting Started

1. Sklonuj repozytorium:
   ```bash
   git clone git@github.com:pawel-wojtyczka/ShopListeo.git
   cd ShopListeo
   ```
2. Zainstaluj zależności:
   ```bash
   npm install
   ```
3. Uruchom serwer deweloperski:
   ```bash
   npm run dev
   ```
4. Zbuduj aplikację do produkcji:
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Uruchamia serwer deweloperski
- `npm run build` - Buduje aplikację do produkcji
- `npm run preview` - Podgląd produkcyjnej wersji aplikacji
- `npm run lint` - Uruchamia ESLint
- `npm run lint:fix` - Naprawia problemy znalezione przez ESLint

## Project Structure

```plaintext
.
├── src/
│   ├── layouts/    # Astro layouts
│   ├── pages/      # Astro pages, w tym API endpoints w src/pages/api
│   ├── components/ # Komponenty UI (Astro i React)
│   └── assets/     # Zasoby statyczne
├── public/         # Zasoby publiczne
```

## Additional Information

- Aplikacja została zaprojektowana zgodnie z wymaganiami produktu (PRD), obejmującymi m.in. uwierzytelnianie użytkownika, zarządzanie listami zakupów, integrację z AI oraz dynamiczne oznaczanie produktów jako zakupionych.
- Cała komunikacja z AI odbywa się w formacie JSON, a pełna historia rozmowy jest zapisywana w bazie danych, co umożliwia analizę i optymalizację funkcjonowania systemu.
- Bezpieczeństwo danych użytkowników jest zapewnione dzięki wbudowanym mechanizmom autoryzacji i najlepszym praktykom wdrożonym na etapie rozwoju aplikacji.

## Contributing

Prosimy o przestrzeganie wytycznych dotyczących stylu kodu oraz zasad prac rozwojowych opisanych w dokumentach konfiguracyjnych (np. w `.cursor/rules/`).

## License

MIT 