# ShopListeo

## 1. Project Name

ShopListeo

## 2. Project Description

ShopListeo is a web application designed to simplify the creation, management, and editing of shopping lists. The application leverages an AI assistant to convert free-form text input into a structured shopping list. Users can interact with the system by manually editing the list, as well as toggling items to mark them as purchased in real time. All AI interactions are conducted via JSON, and the complete conversation history is logged to enable detailed analysis.

## 3. Tech Stack

### Frontend

- **Astro 5**: Enables building fast and efficient websites with minimal JavaScript.
- **React 19**: Provides interactive components where needed.
- **TypeScript 5**: Offers static type checking for improved code quality and IDE support.
- **Tailwind CSS 4**: Facilitates rapid styling using a utility-first approach.
- **Shadcn/ui**: A library of accessible React components to serve as the UI foundation.

### Backend

- **Supabase**: Provides a comprehensive backend solution with PostgreSQL, multi-language SDKs (Backend-as-a-Service), built-in authentication, and flexible hosting options.

### Artificial Intelligence

- **Openrouter.ai**: Allows communication with various AI models (such as OpenAI, Anthropic, and Google) to process shopping data efficiently while maintaining low costs. It also supports setting financial limits on API keys.

### CI/CD and Hosting

- **Github Actions**: Used to create CI/CD pipelines.
- **DigitalOcean**: Hosts the application using Docker containers.

### Testing

- **Vitest**: A blazing fast unit testing framework that replaces Jest, providing a better developer experience with features like watch mode and UI.
- **React Testing Library**: Utilities for testing React components in a way that simulates user behavior.
- **Playwright**: End-to-end testing framework for testing web applications across all modern browsers.
- **MSW (Mock Service Worker)**: API mocking library that intercepts requests for testing isolated components.
- **Storybook**: Tool for developing and testing UI components in isolation.
- **Lighthouse CI**: Tool for measuring web performance metrics.
- **Axe**: Automated tool for testing accessibility compliance.

## 4. Getting Started Locally

### Prerequisites

- Node.js v22.14.0 (as specified in the `.nvmrc` file)
- npm (included with Node.js)

### Steps

1. Clone the repository:
   ```bash
   git clone git@github.com:pawel-wojtyczka/ShopListeo.git
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
4. Build the application for production:
   ```bash
   npm run build
   ```

## 5. Available Scripts

- `npm run dev` – Starts the development server.
- `npm run build` – Builds the application for production.
- `npm run preview` – Previews the production build.
- `npm run lint` – Runs ESLint to check code quality.
- `npm run lint:fix` – Automatically fixes linting issues.
- `npm run test` – Runs unit tests with Vitest.
- `npm run test:ui` – Runs Vitest with UI for interactive testing.
- `npm run test:coverage` – Runs tests with coverage report.
- `npm run test:e2e` – Runs end-to-end tests with Playwright.
- `npm run storybook` – Starts Storybook for component development and testing.

## 6. Project Scope

The initial MVP of ShopListeo focuses on the core functionality:

- **User Authentication:** Registration and login via email and password, with data stored in ISO 8601 format.
- **Shopping List Management:** Create, edit, and delete shopping lists. Users can input free text which is processed by the AI, and then manually adjust the list.
- **AI Integration:** Convert free-form text into a structured shopping list using an AI assistant. All communication is done via JSON, preserving conversation history.
- **Item Toggle Functionality:** Real-time marking of items as purchased (which changes their appearance) and the ability to reverse the action.
- **Finalization:** Users can finalize the shopping list, which triggers logging of the entire AI conversation for analytical purposes.

Additional features (such as advanced error handling, admin panels, or mobile support) are not part of the MVP and are planned for future releases.

## 7. Project Status

The project is currently in the MVP stage and under active development. Future enhancements will include additional functionalities such as sharing lists, voice-to-text input, and mobile application support.

## 8. License

MIT
