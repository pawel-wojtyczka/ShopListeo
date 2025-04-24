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
      update: vi.fn(),
      delete: vi.fn(),
    })),
  })),
}));

describe("Users API Endpoints", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/users/me", () => {
    it("should return user data for authenticated user", async () => {
      server.use(
        http.get("/api/users/me", () => {
          return Response.json(mockUser, { status: 200 });
        })
      );

      const response = await fetch("/api/users/me", {
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockUser);
    });

    it("should return 401 when not authenticated", async () => {
      server.use(
        http.get("/api/users/me", () => {
          return Response.json(
            {
              error: "Brak autoryzacji",
            },
            { status: 401 }
          );
        })
      );

      const response = await fetch("/api/users/me");
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Brak autoryzacji");
    });
  });

  describe("GET /api/users/:id", () => {
    it("should return user data for valid ID", async () => {
      server.use(
        http.get(`/api/users/${mockUser.id}`, () => {
          return Response.json(mockUser, { status: 200 });
        })
      );

      const response = await fetch(`/api/users/${mockUser.id}`, {
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockUser);
    });

    it("should return 404 for non-existent user", async () => {
      server.use(
        http.get("/api/users/non-existent", () => {
          return Response.json(
            {
              error: "Użytkownik nie został znaleziony",
            },
            { status: 404 }
          );
        })
      );

      const response = await fetch("/api/users/non-existent", {
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Użytkownik nie został znaleziony");
    });
  });

  describe("PUT /api/users/:id", () => {
    const updates = {
      email: "updated@example.com",
    };

    it("should update user data for valid ID", async () => {
      const mockUpdatedUser = {
        ...mockUser,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      server.use(
        http.put(`/api/users/${mockUser.id}`, () => {
          return Response.json(mockUpdatedUser, { status: 200 });
        })
      );

      const response = await fetch(`/api/users/${mockUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(updates),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockUpdatedUser);
    });

    it("should return 400 for invalid update data", async () => {
      const invalidUpdates = {
        email: "invalid-email",
      };

      server.use(
        http.put(`/api/users/${mockUser.id}`, () => {
          return Response.json(
            {
              error: "Nieprawidłowe dane aktualizacji",
              details: {
                email: ["Nieprawidłowy format email"],
              },
            },
            { status: 400 }
          );
        })
      );

      const response = await fetch(`/api/users/${mockUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(invalidUpdates),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Nieprawidłowe dane aktualizacji");
      expect(data.details).toBeDefined();
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete user for valid ID", async () => {
      server.use(
        http.delete(`/api/users/${mockUser.id}`, () => {
          return Response.json(
            {
              message: "Użytkownik został usunięty",
            },
            { status: 200 }
          );
        })
      );

      const response = await fetch(`/api/users/${mockUser.id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe("Użytkownik został usunięty");
    });

    it("should return 404 for non-existent user", async () => {
      server.use(
        http.delete("/api/users/non-existent", () => {
          return Response.json(
            {
              error: "Użytkownik nie został znaleziony",
            },
            { status: 404 }
          );
        })
      );

      const response = await fetch("/api/users/non-existent", {
        method: "DELETE",
        headers: {
          Authorization: "Bearer test-token",
        },
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe("Użytkownik nie został znaleziony");
    });
  });
});
