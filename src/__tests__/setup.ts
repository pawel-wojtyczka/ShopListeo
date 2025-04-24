import "@testing-library/jest-dom";
import { expect, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
  interface Assertion<T> extends jest.Matchers<void, T>, TestingLibraryMatchers<T, void> {}
}

// Rozszerzenie matcherów Vitest o matchery testing-library
expect.extend(matchers);

// Konfiguracja dla testów
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
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

// Mockowanie localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mockowanie sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock });

// Mockowanie fetch
Object.defineProperty(window, "fetch", {
  writable: true,
  value: vi.fn(),
});

// Automatyczne czyszczenie po każdym teście
vi.mock("@testing-library/react", () => ({
  ...vi.importActual("@testing-library/react"),
  cleanup: vi.fn(),
}));
