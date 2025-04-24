// Plik konfiguracyjny dla testów
import { vi } from "vitest";
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/node";

// Uruchomienie serwera MSW przed wszystkimi testami
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Resetowanie handlerów i cleanup po każdym teście
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Zamknięcie serwera po wszystkich testach
afterAll(() => server.close());

// Automatyczne czyszczenie po każdym teście
// afterEach(() => {
//   cleanup();
// });

// Mock dla matchMedia, wymagany przez wiele komponentów
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Dodajemy implementację document.createRange, której używa React Testing Library
if (typeof document !== "undefined") {
  document.createRange = () => {
    const range = new Range();
    range.getBoundingClientRect = vi.fn();
    // Używamy bezpiecznego typu dla getClientRects
    const mockDOMRectList = {
      item: () => null,
      length: 0,
    };
    // Dodajemy Symbol.iterator bez generatora
    Object.defineProperty(mockDOMRectList, Symbol.iterator, {
      enumerable: false,
      value: function () {
        return {
          next: () => ({ done: true, value: undefined }),
        };
      },
    });
    range.getClientRects = vi.fn(() => mockDOMRectList as unknown as DOMRectList);
    return range;
  };

  // Inne potrzebne implementacje
  document.elementFromPoint = vi.fn();
}

// Uciszenie ostrzeżeń konsoli podczas testów - przywrócone
console.error = vi.fn();
console.warn = vi.fn();
