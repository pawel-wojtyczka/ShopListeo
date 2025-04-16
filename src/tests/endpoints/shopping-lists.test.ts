/**
 * Testy integracyjne dla endpointu /api/shopping-lists
 *
 * Te testy sprawdzają poprawne działanie endpointu tworzenia listy zakupów,
 * w tym obsługę uwierzytelniania, walidację danych oraz interakcję z bazą danych.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST } from "../../pages/api/shopping-lists/index";
import type { MockAPIContext, MockAPIParams, MockSupabaseClient } from "../../types/api";

// Mock dla klienta Supabase
const mockSupabaseClient: MockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

// Mock dla crypto.randomUUID
vi.stubGlobal("crypto", {
  randomUUID: () => "test-uuid-123",
});

// Mock dla loggera
vi.mock("../../lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("POST /api/shopping-lists", () => {
  let mockRequest: Request;
  let mockParams: MockAPIParams;

  beforeEach(() => {
    // Reset mocków przed każdym testem
    vi.clearAllMocks();

    // Ustawienie domyślnego mockRequest
    mockRequest = new Request("http://localhost/api/shopping-lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "Testowa lista zakupów" }),
    });

    // Ustawienie domyślnych params dla API
    mockParams = {
      request: mockRequest,
      locals: {
        supabase: mockSupabaseClient,
        user: {
          id: "test-user-id",
          email: "test@example.com",
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: "2023-01-01T00:00:00Z",
          role: "authenticated",
        },
      },
    };

    // Domyślna pozytywna odpowiedź Supabase
    mockSupabaseClient.single?.mockResolvedValue({
      data: {
        id: "test-list-id",
        title: "Testowa lista zakupów",
        created_at: "2023-01-01T12:00:00Z",
        updated_at: "2023-01-01T12:00:00Z",
      },
      error: null,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("powinien utworzyć nową listę zakupów i zwrócić kod 201", async () => {
    // Wykonanie żądania
    const response = await POST(mockParams as unknown as MockAPIContext);

    // Sprawdzenie odpowiedzi
    expect(response.status).toBe(201);

    // Parsowanie odpowiedzi JSON
    const responseBody = await response.json();

    // Sprawdzenie poprawności zwróconych danych
    expect(responseBody).toEqual({
      id: "test-list-id",
      title: "Testowa lista zakupów",
      createdAt: "2023-01-01T12:00:00Z",
      updatedAt: "2023-01-01T12:00:00Z",
    });

    // Sprawdzenie czy Supabase zostało wywołane z poprawnymi danymi
    expect(mockSupabaseClient.from).toHaveBeenCalledWith("shopping_lists");
    expect(mockSupabaseClient.insert).toHaveBeenCalledWith([
      {
        user_id: "test-user-id",
        title: "Testowa lista zakupów",
      },
    ]);
  });

  it("powinien zwrócić kod 401 dla nieuwierzytelnionego użytkownika", async () => {
    // Usunięcie użytkownika z kontekstu
    mockParams.locals.user = null;

    // Wykonanie żądania
    const response = await POST(mockParams as unknown as MockAPIContext);

    // Sprawdzenie odpowiedzi
    expect(response.status).toBe(401);

    // Parsowanie odpowiedzi JSON
    const responseBody = await response.json();

    // Sprawdzenie poprawności zwróconych danych
    expect(responseBody).toEqual({
      error: "Wymagane uwierzytelnienie",
    });

    // Sprawdzenie czy Supabase nie zostało wywołane
    expect(mockSupabaseClient.from).not.toHaveBeenCalled();
  });

  it("powinien zwrócić kod 400 dla nieprawidłowych danych wejściowych", async () => {
    // Ustawienie pustego tytułu
    mockRequest = new Request("http://localhost/api/shopping-lists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: "" }),
    });

    // Aktualizacja requestu w parametrach
    mockParams.request = mockRequest;

    // Wykonanie żądania
    const response = await POST(mockParams as unknown as MockAPIContext);

    // Sprawdzenie odpowiedzi
    expect(response.status).toBe(400);

    // Parsowanie odpowiedzi JSON
    const responseBody = await response.json();

    // Sprawdzenie poprawności zwróconych danych
    expect(responseBody.error).toBe("Nieprawidłowe dane wejściowe");
    expect(responseBody.details).toBeDefined();

    // Sprawdzenie czy Supabase nie zostało wywołane
    expect(mockSupabaseClient.from).not.toHaveBeenCalled();
  });

  it("powinien zwrócić kod 409 dla zduplikowanego tytułu", async () => {
    // Symulacja błędu duplikatu
    mockSupabaseClient.from = vi.fn().mockReturnThis();
    mockSupabaseClient.insert = vi.fn().mockReturnThis();
    mockSupabaseClient.select = vi.fn().mockReturnThis();
    mockSupabaseClient.single = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: "23505",
        message: "Duplicate key violation",
      },
    });

    // Wykonanie żądania
    const response = await POST(mockParams as unknown as MockAPIContext);

    // Sprawdzenie odpowiedzi
    expect(response.status).toBe(409);

    // Parsowanie odpowiedzi JSON
    const responseBody = await response.json();

    // Sprawdzenie poprawności zwróconych danych
    expect(responseBody.error).toBe("Lista zakupów o podanym tytule już istnieje");
    expect(responseBody.code).toBe("DUPLICATE_TITLE");
  });

  it("powinien zwrócić kod 500 dla błędu bazy danych", async () => {
    // Symulacja ogólnego błędu bazy danych
    mockSupabaseClient.from = vi.fn().mockReturnThis();
    mockSupabaseClient.insert = vi.fn().mockReturnThis();
    mockSupabaseClient.select = vi.fn().mockReturnThis();
    mockSupabaseClient.single = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: "42P01",
        message: "Relation not found",
      },
    });

    // Wykonanie żądania
    const response = await POST(mockParams as unknown as MockAPIContext);

    // Sprawdzenie odpowiedzi
    expect(response.status).toBe(500);

    // Parsowanie odpowiedzi JSON
    const responseBody = await response.json();

    // Sprawdzenie poprawności zwróconych danych
    expect(responseBody.error).toBe("Błąd konfiguracji bazy danych: tabela nie istnieje");
    expect(responseBody.code).toBe("DATABASE_ERROR");
  });
});
