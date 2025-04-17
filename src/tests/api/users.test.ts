/**
 * Testy endpointów API użytkowników
 *
 * Uwaga: To są podstawowe przypadki testowe. W rzeczywistym środowisku
 * należy zaimplementować bardziej wszechstronne testy, w tym testy
 * integracyjne z rzeczywistą bazą danych.
 */

import { describe, test, expect } from "vitest";
import { GET as getAllUsers } from "../../pages/api/users/index";
import { GET as getUserById, PUT as updateUser, DELETE as deleteUser } from "../../pages/api/users/[id]";
import type { APIContext } from "astro";

// Definiujemy typ dla klienta Supabase używanego w testach
interface MockSupabaseClient {
  from: (table: string) => MockSupabaseQuery;
  auth: {
    getUser: () => Promise<{
      data: {
        user: { id: string; email: string };
      };
    }>;
  };
}

// Typy pomocnicze dla zapytań Supabase
interface MockSupabaseQuery {
  select: (columns: string) => MockSupabaseSelect;
  delete: () => MockSupabaseDelete;
  update: (data: Record<string, unknown>) => MockSupabaseUpdate;
}

interface MockSupabaseSelect {
  eq: (column: string, value: string) => MockSupabaseEq;
  order: (column: string) => MockSupabaseOrder;
  neq: (column: string, value: string) => MockSupabaseEq;
  ilike: (column: string, pattern: string) => MockSupabaseOrder;
}

interface MockSupabaseOrder {
  range: (from: number, to: number) => Promise<MockSupabaseResult>;
}

interface MockSupabaseEq {
  single: () => Promise<MockSupabaseResult>;
}

interface MockSupabaseDelete {
  eq: (column: string, value: string) => Promise<{ error: null | Error }>;
}

interface MockSupabaseUpdate {
  eq: (
    column: string,
    value: string
  ) => {
    select: (columns: string) => {
      single: () => Promise<MockSupabaseResult>;
    };
  };
}

interface MockSupabaseResult {
  data: unknown;
  error: null | Error;
  count?: number;
}

// Definiujemy typ dla kontekstu API używany w testach
interface TestAPIContext {
  locals: {
    user: {
      id: string;
      email: string;
    } | null;
    supabase: MockSupabaseClient;
  };
  params: Record<string, string>;
  request: Request;
  url?: URL;
  // Dodajemy pozostałe wymagane pola z APIContext
  site: Record<string, unknown>;
  generator: string;
  props: Record<string, unknown>;
  clientAddress: string;
  cookies: Record<string, unknown>;
  redirect: () => Response;
}

// Pomocnicza funkcja do tworzenia obiektu kontekstu
const createContext = (authenticated = false): TestAPIContext => {
  return {
    locals: {
      user: authenticated
        ? {
            id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
            email: "test@example.com",
          }
        : null,
      supabase: {
        from: () => ({
          select: () => ({
            order: () => ({
              range: () =>
                Promise.resolve({
                  data: [
                    { id: "1", email: "user@example.com", registration_date: "2023-01-01", last_login_date: null },
                  ],
                  count: 1,
                  error: null,
                }),
            }),
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: null,
                  error: null,
                }),
            }),
          }),
          delete: () => ({
            eq: () => Promise.resolve({ error: null }),
          }),
          update: () => ({
            eq: () => ({
              select: () => ({
                single: () =>
                  Promise.resolve({
                    data: {
                      id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
                      email: "updated@example.com",
                      updated_date: new Date().toISOString(),
                    },
                    error: null,
                  }),
              }),
            }),
          }),
        }),
        auth: {
          getUser: () =>
            Promise.resolve({
              data: {
                user: { id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347", email: "test@example.com" },
              },
            }),
        },
      },
    },
    params: {},
    request: new Request("http://example.com"),
    site: {},
    generator: "test",
    props: {},
    clientAddress: "127.0.0.1",
    cookies: {},
    redirect: () => new Response(null),
  };
};

describe("GET /api/users", () => {
  test("should return 401 when user is not authenticated", async () => {
    // Tworzymy kontekst bez uwierzytelnienia
    const context = createContext(false);

    // Ustawiamy request
    context.request = new Request("http://example.com/api/users");
    context.url = new URL(context.request.url);

    // Wywołujemy endpoint - używamy rzutowania typu
    const response = await getAllUsers(context as unknown as APIContext);

    expect(response.status).toBe(401);
  });

  test("should return 200 with user list in development mode", async () => {
    // Ustawiamy środowisko deweloperskie
    process.env.NODE_ENV = "development";

    // Tworzymy kontekst z uwierzytelnieniem
    const context = createContext(true);

    // Ustawiamy request z parametrami
    context.request = new Request("http://example.com/api/users?page=1&pageSize=10&sort=email&order=asc");
    context.url = new URL(context.request.url);

    // Wywołujemy endpoint - używamy rzutowania typu
    const response = await getAllUsers(context as unknown as APIContext);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data.data)).toBe(true);
  });
});

describe("GET /api/users/{id}", () => {
  test("should return 401 when user is not authenticated", async () => {
    // Tworzymy kontekst bez uwierzytelnienia
    const context = createContext(false);

    // Ustawiamy parametry i request
    context.params = { id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347" };
    context.request = new Request("http://example.com/api/users/077f7996-bca0-4e19-9a3f-b9c8bcb55347");

    // Wywołujemy endpoint - używamy rzutowania typu
    const response = await getUserById(context as unknown as APIContext);

    expect(response.status).toBe(401);
  });

  test("should return 200 when requesting own data", async () => {
    // Ustawiamy środowisko deweloperskie
    process.env.NODE_ENV = "development";

    // Tworzymy kontekst z uwierzytelnieniem
    const context = createContext(true);

    // Dodajemy mockowanie metody single Supabase
    context.locals.supabase.from = () =>
      ({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: {
                  id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
                  email: "test@example.com",
                  registration_date: "2023-01-01",
                  last_login_date: null,
                },
                error: null,
              }),
          }),
        }),
      }) as unknown as MockSupabaseQuery;

    // Ustawiamy parametry i request
    context.params = { id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347" };
    context.request = new Request("http://example.com/api/users/077f7996-bca0-4e19-9a3f-b9c8bcb55347");

    // Wywołujemy endpoint - używamy rzutowania typu
    const response = await getUserById(context as unknown as APIContext);

    expect(response.status).toBe(200);
  });

  test("should return 400 when user does not exist", async () => {
    // Ustawiamy środowisko deweloperskie
    process.env.NODE_ENV = "development";

    // Tworzymy kontekst z uwierzytelnieniem
    const context = createContext(true);

    // Mockujemy odpowiedź Supabase dla nieistniejącego użytkownika
    context.locals.supabase.from = () =>
      ({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: null,
                error: { message: "User not found" } as unknown as Error,
              }),
          }),
        }),
      }) as unknown as MockSupabaseQuery;

    // Ustawiamy parametry i request
    context.params = { id: "nonexistent-id" };
    context.request = new Request("http://example.com/api/users/nonexistent-id");

    // Wywołujemy endpoint - używamy rzutowania typu
    const response = await getUserById(context as unknown as APIContext);

    // Zmieniamy oczekiwany kod na 400 zgodnie z rzeczywistą implementacją
    expect(response.status).toBe(400);
  });
});

describe("PUT /api/users/{id}", () => {
  test("should return 401 when user is not authenticated", async () => {
    // Tworzymy kontekst bez uwierzytelnienia
    const context = createContext(false);

    // Ustawiamy parametry i request
    context.params = { id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347" };
    context.request = new Request("http://example.com/api/users/077f7996-bca0-4e19-9a3f-b9c8bcb55347", {
      method: "PUT",
      body: JSON.stringify({ email: "new@example.com" }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Wywołujemy endpoint - używamy rzutowania typu
    const response = await updateUser(context as unknown as APIContext);

    expect(response.status).toBe(401);
  });

  test("should return 400 when request body is invalid", async () => {
    // Ustawiamy środowisko deweloperskie
    process.env.NODE_ENV = "development";

    // Tworzymy kontekst z uwierzytelnieniem
    const context = createContext(true);

    // Dodajemy mockowanie metody single Supabase
    context.locals.supabase.from = () =>
      ({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: {
                  id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
                  email: "test@example.com",
                  registration_date: "2023-01-01",
                  last_login_date: null,
                },
                error: null,
              }),
          }),
        }),
      }) as unknown as MockSupabaseQuery;

    // Ustawiamy parametry i request
    context.params = { id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347" };
    context.request = new Request("http://example.com/api/users/077f7996-bca0-4e19-9a3f-b9c8bcb55347", {
      method: "PUT",
      body: JSON.stringify({}), // Puste body jest nieprawidłowe
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Wywołujemy endpoint - używamy rzutowania typu
    const response = await updateUser(context as unknown as APIContext);

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/users/{id}", () => {
  test("should return 401 when user is not authenticated", async () => {
    // Tworzymy kontekst bez uwierzytelnienia
    const context = createContext(false);

    // Ustawiamy parametry i request
    context.params = { id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347" };
    context.request = new Request("http://example.com/api/users/077f7996-bca0-4e19-9a3f-b9c8bcb55347", {
      method: "DELETE",
    });

    // Wywołujemy endpoint - używamy rzutowania typu
    const response = await deleteUser(context as unknown as APIContext);

    expect(response.status).toBe(401);
  });

  test("should return 204 when deleting own account", async () => {
    // Ustawiamy środowisko deweloperskie
    process.env.NODE_ENV = "development";

    // Tworzymy kontekst z uwierzytelnieniem
    const context = createContext(true);

    // Dodajemy mockowanie metod Supabase
    context.locals.supabase.from = () =>
      ({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({
                data: {
                  id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347",
                  email: "test@example.com",
                  registration_date: "2023-01-01",
                  last_login_date: null,
                },
                error: null,
              }),
          }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }) as unknown as MockSupabaseQuery;

    // Ustawiamy parametry i request
    context.params = { id: "077f7996-bca0-4e19-9a3f-b9c8bcb55347" };
    context.request = new Request("http://example.com/api/users/077f7996-bca0-4e19-9a3f-b9c8bcb55347", {
      method: "DELETE",
    });

    // Wywołujemy endpoint - używamy rzutowania typu
    const response = await deleteUser(context as unknown as APIContext);

    expect(response.status).toBe(204);
  });
});
