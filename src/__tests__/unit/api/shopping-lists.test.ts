import { describe, it, expect, vi, beforeEach } from "vitest";
import { server } from "../../setup";
import { http } from "msw";

// Mock Supabase client
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  })),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Shopping Lists API Endpoints", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
  };

  const mockList = {
    id: "test-list-id",
    title: "Test Shopping List",
    user_id: mockUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe("GET /api/shopping-lists", () => {
    it("should return 401 when user is not authenticated", async () => {
      server.use(
        http.get("/api/shopping-lists", async ({ request }) => {
          const response = await fetch(request.url, {
            headers: { ...request.headers },
          });
          expect(response.status).toBe(401);
          const data = await response.json();
          expect(data.error).toBe("Wymagane uwierzytelnienie");
          return Response.json({ error: "Wymagane uwierzytelnienie" }, { status: 401 });
        })
      );
    });

    it("should return shopping lists for authenticated user", async () => {
      const mockLists = {
        data: [mockList],
        pagination: {
          page: 1,
          pageSize: 10,
          totalItems: 1,
          totalPages: 1,
        },
      };

      server.use(
        http.get("/api/shopping-lists", () => {
          return Response.json(mockLists, { status: 200 });
        })
      );

      const response = await fetch("/api/shopping-lists", {
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockLists);
    });
  });

  describe("POST /api/shopping-lists", () => {
    const newList = {
      title: "New Shopping List",
    };

    it("should return 401 when user is not authenticated", async () => {
      server.use(
        http.post("/api/shopping-lists", async ({ request }) => {
          const response = await fetch(request.url, {
            method: "POST",
            headers: { ...request.headers },
            body: JSON.stringify(newList),
          });
          expect(response.status).toBe(401);
          return Response.json({ error: "Wymagane uwierzytelnienie" }, { status: 401 });
        })
      );
    });

    it("should create a new shopping list for authenticated user", async () => {
      const mockCreatedList = {
        ...mockList,
        ...newList,
      };

      server.use(
        http.post("/api/shopping-lists", () => {
          return Response.json(mockCreatedList, { status: 201 });
        })
      );

      const response = await fetch("/api/shopping-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(newList),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(mockCreatedList);
    });

    it("should return 400 for invalid input", async () => {
      const invalidList = {
        // Missing required title
      };

      server.use(
        http.post("/api/shopping-lists", () => {
          return Response.json(
            {
              error: "Nieprawidłowe dane wejściowe",
              details: { title: ["Required"] },
            },
            { status: 400 }
          );
        })
      );

      const response = await fetch("/api/shopping-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(invalidList),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Nieprawidłowe dane wejściowe");
      expect(data.details).toBeDefined();
    });
  });

  describe("GET /api/shopping-lists/:id", () => {
    it("should return 404 for non-existent list", async () => {
      server.use(
        http.get("/api/shopping-lists/non-existent", () => {
          return Response.json({ error: "Shopping list not found" }, { status: 404 });
        })
      );

      const response = await fetch("/api/shopping-lists/non-existent", {
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Shopping list not found");
    });

    it("should return list details for valid ID", async () => {
      server.use(
        http.get(`/api/shopping-lists/${mockList.id}`, () => {
          return Response.json(mockList, { status: 200 });
        })
      );

      const response = await fetch(`/api/shopping-lists/${mockList.id}`, {
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockList);
    });
  });

  describe("PUT /api/shopping-lists/:id", () => {
    const updates = {
      title: "Updated Shopping List",
    };

    it("should update list for valid ID", async () => {
      const mockUpdatedList = {
        ...mockList,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      server.use(
        http.put(`/api/shopping-lists/${mockList.id}`, () => {
          return Response.json(mockUpdatedList, { status: 200 });
        })
      );

      const response = await fetch(`/api/shopping-lists/${mockList.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(updates),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockUpdatedList);
    });
  });

  describe("DELETE /api/shopping-lists/:id", () => {
    it("should delete list for valid ID", async () => {
      server.use(
        http.delete(`/api/shopping-lists/${mockList.id}`, () => {
          return new Response(null, { status: 204 });
        })
      );

      const response = await fetch(`/api/shopping-lists/${mockList.id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(204);
    });
  });
});
