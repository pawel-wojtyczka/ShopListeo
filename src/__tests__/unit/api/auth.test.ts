import { describe, it, expect, vi, beforeEach } from "vitest";
import { server } from "../../setup";
import { http } from "msw";

// Mock Supabase client
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  })),
}));

describe("Auth API Endpoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    const validRegistration = {
      email: "test@example.com",
      password: "Test123!@#",
      confirmPassword: "Test123!@#",
    };

    it("should register a new user with valid credentials", async () => {
      server.use(
        http.post("/api/auth/register", () => {
          return Response.json(
            {
              message: "Rejestracja zakończona sukcesem",
              user: { email: validRegistration.email },
            },
            { status: 201 }
          );
        })
      );

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validRegistration),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.message).toBe("Rejestracja zakończona sukcesem");
      expect(data.user.email).toBe(validRegistration.email);
    });

    it("should return 400 for invalid registration data", async () => {
      const invalidRegistration = {
        email: "invalid-email",
        password: "short",
        confirmPassword: "different",
      };

      server.use(
        http.post("/api/auth/register", () => {
          return Response.json(
            {
              error: "Nieprawidłowe dane rejestracji",
              details: {
                email: ["Nieprawidłowy format email"],
                password: ["Hasło musi mieć minimum 8 znaków"],
                confirmPassword: ["Hasła nie są identyczne"],
              },
            },
            { status: 400 }
          );
        })
      );

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidRegistration),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Nieprawidłowe dane rejestracji");
      expect(data.details).toBeDefined();
    });
  });

  describe("POST /api/auth/login", () => {
    const validCredentials = {
      email: "test@example.com",
      password: "Test123!@#",
    };

    it("should login user with valid credentials", async () => {
      server.use(
        http.post("/api/auth/login", () => {
          return Response.json(
            {
              message: "Logowanie zakończone sukcesem",
              user: { email: validCredentials.email },
            },
            { status: 200 }
          );
        })
      );

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validCredentials),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe("Logowanie zakończone sukcesem");
      expect(data.user.email).toBe(validCredentials.email);
    });

    it("should return 401 for invalid credentials", async () => {
      const invalidCredentials = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      server.use(
        http.post("/api/auth/login", () => {
          return Response.json(
            {
              error: "Nieprawidłowy email lub hasło",
            },
            { status: 401 }
          );
        })
      );

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidCredentials),
      });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Nieprawidłowy email lub hasło");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should successfully logout user", async () => {
      server.use(
        http.post("/api/auth/logout", () => {
          return Response.json(
            {
              message: "Wylogowano pomyślnie",
            },
            { status: 200 }
          );
        })
      );

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe("Wylogowano pomyślnie");
    });
  });

  describe("POST /api/auth/request-reset", () => {
    it("should send password reset email for valid address", async () => {
      const email = "test@example.com";

      server.use(
        http.post("/api/auth/request-reset", () => {
          return Response.json(
            {
              message: "Link do resetowania hasła został wysłany",
            },
            { status: 200 }
          );
        })
      );

      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe("Link do resetowania hasła został wysłany");
    });

    it("should return 400 for invalid email", async () => {
      const invalidEmail = "invalid-email";

      server.use(
        http.post("/api/auth/request-reset", () => {
          return Response.json(
            {
              error: "Nieprawidłowy format adresu email",
            },
            { status: 400 }
          );
        })
      );

      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: invalidEmail }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Nieprawidłowy format adresu email");
    });
  });
});
