import "@testing-library/jest-dom";
import { expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { setupServer } from "msw/node";
import { http } from "msw";

declare module "vitest" {
  interface Assertion<T> extends jest.Matchers<void, T>, TestingLibraryMatchers<T, void> {}
}

// Rozszerzenie matcherów Vitest o matchery testing-library
expect.extend(matchers);

// Konfiguracja dla testów
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

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "sessionStorage", { value: sessionStorageMock });

// Mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

// Automatyczne czyszczenie po każdym teście
vi.mock("@testing-library/react", () => ({
  ...vi.importActual("@testing-library/react"),
  cleanup: vi.fn(),
}));

// Setup MSW server
export const server = setupServer();

// Setup
beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

// Reset handlers and cleanup after each test
afterEach(() => {
  server.resetHandlers();
  cleanup();
  vi.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});
