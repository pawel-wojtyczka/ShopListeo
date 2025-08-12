# GitHub Copilot Instructions for ShopListeo

## Project Overview
ShopListeo is a web application designed to simplify the process of creating and managing shopping lists. The main feature is using AI assistant to intelligently parse user-entered text and transform it into an organized product list.

## Tech Stack
- **Astro 5.12.9**: Modern web framework for building fast sites (SSR/SSG)
- **React 19.0.0**: UI library for building interactive components
- **TypeScript 5.8.3**: Static typing for JavaScript
- **Tailwind CSS 4.1.5**: Utility-first CSS framework
- **Shadcn/ui**: UI component library based on Radix UI and Tailwind CSS
- **Supabase**: Backend-as-a-Service (BaaS) platform with PostgreSQL database, authentication, and API
- **OpenRouter.ai**: LLM API aggregator for shopping list processing
- **Vitest 3.1.2**: Unit and integration testing framework
- **Playwright 1.52.0**: End-to-End (E2E) testing framework

## Coding Guidelines

### General Practices
- Use feedback from linters to improve the code when making changes
- Prioritize error handling and edge cases
- Handle errors and edge cases at the beginning of functions
- Use early returns for error conditions to avoid deeply nested if statements
- Place the happy path last in the function for improved readability
- Avoid unnecessary else statements; use if-return pattern instead
- Use guard clauses to handle preconditions and invalid states early
- Implement proper error logging and user-friendly error messages
- Consider using custom error types or error factories for consistent error handling
- I am new at programming. Make comments with details to let me better understand the code
- Write comments in Polish language

### Astro Guidelines
- Leverage View Transitions API for smooth page transitions (use ClientRouter)
- Use content collections with type safety for blog posts, documentation, etc.
- Leverage Server Endpoints for API routes
- Use POST, GET - uppercase format for endpoint handlers
- Use `export const prerender = false` for API routes
- Use zod for input validation in API routes
- Extract logic into services in `src/lib/services`
- Implement middleware for request/response modification
- Use image optimization with the Astro Image integration
- Implement hybrid rendering with server-side rendering where needed
- Use Astro.cookies for server-side cookie management
- Leverage import.meta.env for environment variables

### React Guidelines
- Use functional components with hooks instead of class components
- Never use "use client" and other Next.js directives as we use React with Astro
- Extract logic into custom hooks in `src/components/hooks`
- Implement React.memo() for expensive components that render often with the same props
- Utilize React.lazy() and Suspense for code-splitting and performance optimization
- Use the useCallback hook for event handlers passed to child components to prevent unnecessary re-renders
- Prefer useMemo for expensive calculations to avoid recomputation on every render
- Implement useId() for generating unique IDs for accessibility attributes
- Consider using the new useOptimistic hook for optimistic UI updates in forms
- Use useTransition for non-urgent state updates to keep the UI responsive

### Testing Guidelines
- Use Vitest for unit and integration tests
- Use React Testing Library for component testing
- Use Playwright for E2E testing
- Use MSW for API mocking in tests
- Write tests that focus on user behavior rather than implementation details
- Use descriptive test names that explain what is being tested
- Group related tests with describe blocks
- Use setup and teardown functions for test preparation and cleanup

### Project Structure
- `./src` - source code
- `./src/layouts` - Astro layouts
- `./src/pages` - Astro pages
- `./src/pages/api` - API endpoints
- `./src/middleware/index.ts` - Astro middleware
- `./src/db` - Supabase clients and types
- `./src/types.ts` - Shared types for backend and frontend (Entities, DTOs)
- `./src/components` - Client-side components written in Astro (static) and React (dynamic)
- `./src/components/ui` - Client-side components from Shadcn/ui
- `./src/lib` - Services and helpers 
- `./src/assets` - static internal assets
- `./public` - public assets

## Environment Variables
Required environment variables (see .env.example):
- SUPABASE_URL, SUPABASE_KEY
- PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY
- OPENROUTER_API_KEY
- E2E_USERNAME, E2E_PASSWORD (for testing)

## Available Scripts
- `npm run dev`: Start Astro development server
- `npm run build`: Build application for production
- `npm run preview`: Preview built application
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Run ESLint with auto-fix
- `npm run format`: Run Prettier
- `npm run test`: Run unit/integration tests (Vitest)
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage report
- `npm run test:ui`: Run Vitest UI
- `npm run test:e2e`: Run E2E tests (Playwright)
- `npm run test:e2e:ui`: Run Playwright UI

When suggesting code, always consider the project structure and follow the established patterns.
