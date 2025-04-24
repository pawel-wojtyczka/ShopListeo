// Pusty plik implementujący interfejs MSW dla testów, które nie wymagają mockowania API
import { vi } from "vitest";

export const server = {
  listen: vi.fn(),
  resetHandlers: vi.fn(),
  close: vi.fn(),
};
