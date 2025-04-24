// Dla niestandardowych importów w testach lub obsługi React 19

// Konfiguracja dla Vitest
import { vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";

// Ustaw globalne mock funkcje
if (!global.fetch) {
  global.fetch = vi.fn();
}

// Eksportujemy potrzebne funkcje
export { beforeEach, afterEach, beforeAll, afterAll };

// Obsługa brakujących funkcji z przeglądarki
if (typeof window !== "undefined") {
  // Mock dla window.scrollTo
  window.scrollTo = vi.fn();

  // Mock dla localStorage
  if (!window.localStorage) {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
    });
  }
}

// Dodaj obsługę formatu date-fns (często używany w projektach)
if (!Intl.DateTimeFormat) {
  Object.defineProperty(Intl, "DateTimeFormat", {
    value: class DateTimeFormat {
      format() {
        return "01.01.2023";
      }
    },
  });
}
