/**
 * Testy endpointów API użytkowników
 *
 * Uwaga: To są podstawowe przypadki testowe. W rzeczywistym środowisku
 * należy zaimplementować bardziej wszechstronne testy, w tym testy
 * integracyjne z rzeczywistą bazą danych.
 */

import { expect, test, describe, vi, beforeEach } from "vitest";
import { GET as getAllUsers } from "../../pages/api/users/index";
import { GET as getUserById, PUT as updateUser, DELETE as deleteUser } from "../../pages/api/users/[id]";

// Mock dla context.locals
const mockLocals = {
  user: {
    id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
    email: "test@example.com",
  },
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn(),
  },
};

// Mock dla parametrów zapytania
const mockUrl = new URL("http://example.com/api/users");

// Resetowanie mocków przed każdym testem
beforeEach(() => {
  vi.resetAllMocks();
  process.env.NODE_ENV = "development";

  // Resetowanie i domyślne ustawienie mocka single
  mockLocals.supabase.single.mockReset();
});

describe("GET /api/users", () => {
  test("should return 401 when user is not authenticated", async () => {
    const response = await getAllUsers({
      locals: { supabase: mockLocals.supabase },
      request: { url: mockUrl.toString() },
      url: mockUrl,
    } as any);

    expect(response.status).toBe(401);
  });

  test("should return 200 with user list in development mode", async () => {
    mockLocals.supabase.range.mockResolvedValue({
      data: [{ id: "1", email: "user@example.com", registration_date: "2023-01-01", last_login_date: null }],
      count: 1,
    });

    const response = await getAllUsers({
      locals: mockLocals,
      request: { url: mockUrl.toString() },
      url: mockUrl,
    } as any);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.data).toHaveLength(1);
    expect(data.pagination.totalItems).toBe(1);
  });
});

describe("GET /api/users/{id}", () => {
  test("should return 401 when user is not authenticated", async () => {
    const response = await getUserById({
      params: { id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347" },
      locals: { supabase: mockLocals.supabase },
    } as any);

    expect(response.status).toBe(401);
  });

  test("should return 200 when requesting own data", async () => {
    mockLocals.supabase.single.mockResolvedValue({
      data: {
        id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
        email: "test@example.com",
        registration_date: "2023-01-01",
        last_login_date: null,
      },
      error: null,
    });

    const response = await getUserById({
      params: { id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347" },
      locals: mockLocals,
    } as any);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("isAdmin");
  });

  test("should return 404 when user does not exist", async () => {
    mockLocals.supabase.single.mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await getUserById({
      params: { id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347" },
      locals: mockLocals,
    } as any);

    expect(response.status).toBe(404);
  });
});

describe("PUT /api/users/{id}", () => {
  test("should return 401 when user is not authenticated", async () => {
    const response = await updateUser({
      params: { id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347" },
      locals: { supabase: mockLocals.supabase },
      request: new Request("http://example.com/api/users/077f7996-bca0-4e19-9a3f-b9c8bcb55347", {
        method: "PUT",
        body: JSON.stringify({ email: "new@example.com" }),
      }),
    } as any);

    expect(response.status).toBe(401);
  });

  test("should return 400 when request body is invalid", async () => {
    mockLocals.supabase.single.mockResolvedValueOnce({
      // dla getUserById
      data: {
        id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
        email: "test@example.com",
        registration_date: "2023-01-01",
        last_login_date: null,
      },
      error: null,
    });

    const response = await updateUser({
      params: { id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347" },
      locals: mockLocals,
      request: new Request("http://example.com/api/users/077f7996-bca0-4e19-9a3f-b9c8bcb55347", {
        method: "PUT",
        body: JSON.stringify({}), // Puste body jest nieprawidłowe
      }),
    } as any);

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/users/{id}", () => {
  test("should return 401 when user is not authenticated", async () => {
    const response = await deleteUser({
      params: { id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347" },
      locals: { supabase: mockLocals.supabase },
    } as any);

    expect(response.status).toBe(401);
  });

  test("should return 204 when deleting own account", async () => {
    // Mock dla getUserById
    mockLocals.supabase.single.mockResolvedValueOnce({
      data: {
        id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
        email: "test@example.com",
        registration_date: "2023-01-01",
        last_login_date: null,
      },
      error: null,
    });

    // Mock dla deleteUser
    mockLocals.supabase.eq.mockResolvedValueOnce({ error: null });

    const response = await deleteUser({
      params: { id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347" },
      locals: mockLocals,
    } as any);

    expect(response.status).toBe(204);
  });
});
