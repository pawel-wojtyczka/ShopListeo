import { describe, it, expect, vi, beforeEach } from "vitest";
// Użycie aliasu @/ dla importu
import { POST, LoginSchema } from "@/pages/api/auth/login";
import type { APIContext } from "astro";
import type { User, Session } from "@supabase/supabase-js";

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
  },
};

// Mock Astro context
const mockLocals = {
  supabase: mockSupabaseClient,
  user: null,
};

describe("API Endpoint: /api/auth/login", () => {
  // --- LoginSchema Tests ---
  describe("LoginSchema Validation", () => {
    it("should validate correct data", () => {
      const result = LoginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should validate correct data with rememberMe", () => {
      const result = LoginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        rememberMe: true,
      });
      expect(result.success).toBe(true);
      expect(result.data?.rememberMe).toBe(true);
    });

    it("should invalidate incorrect email format", () => {
      const result = LoginSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe("Nieprawidłowy format adresu email.");
    });

    it("should invalidate missing password", () => {
      const result = LoginSchema.safeParse({ email: "test@example.com" });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.path).toContain("password");
      expect(result.error?.errors[0]?.message).toBe("Required");
    });
  });

  // --- Handler Tests ---
  describe("POST Handler", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("should login user successfully", async () => {
      const mockUser: Partial<User> = { id: "fake-uuid", email: "test@example.com" };
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: {} as Session },
        error: null,
      });

      const mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
        headers: { "Content-Type": "application/json" },
      });

      const context = {
        request: mockRequest,
        locals: mockLocals,
      } as unknown as APIContext;

      const response = await POST(context);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty("id", "fake-uuid");
      expect(body).toHaveProperty("email", "test@example.com");
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should return 400 for invalid input data (Zod validation)", async () => {
      const mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "invalid-email" }),
        headers: { "Content-Type": "application/json" },
      });

      const context = {
        request: mockRequest,
        locals: mockLocals,
      } as unknown as APIContext;

      const response = await POST(context);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toHaveProperty("errors");
      expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it("should return 401 for incorrect credentials (Supabase error)", async () => {
      const supabaseError = { message: "Invalid login credentials", status: 400 };
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: supabaseError,
      });

      const mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "wrongpassword" }),
        headers: { "Content-Type": "application/json" },
      });

      const context = {
        request: mockRequest,
        locals: mockLocals,
      } as unknown as APIContext;

      const response = await POST(context);
      const body = await response.json();

      expect(response.status).toBe(401);
      // Sprawdź komunikat z handlera
      expect(body).toHaveProperty("message", "Nieprawidłowy email lub hasło.");
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalled();
    });

    it("should return 500 for unexpected Supabase error", async () => {
      const supabaseError = { message: "Internal Server Error", status: 500 };
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: supabaseError,
      });

      const mockRequest = new Request("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", password: "password123" }),
        headers: { "Content-Type": "application/json" },
      });

      const context = {
        request: mockRequest,
        locals: mockLocals,
      } as unknown as APIContext;

      const response = await POST(context);
      const body = await response.json();

      // Handler zwraca 401 dla WSZYSTKICH błędów signInWithPassword
      expect(response.status).toBe(401);
      // Sprawdź komunikat z handlera dla błędu 401
      expect(body).toHaveProperty("message", "Nieprawidłowy email lub hasło.");
    });
  });
});
