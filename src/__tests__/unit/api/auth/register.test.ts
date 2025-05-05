import { describe, it, expect, vi, beforeEach } from "vitest";
// Użycie aliasu @/ dla importu
import { POST, RegisterSchema } from "@/pages/api/auth/register";
import type { APIContext } from "astro";
import type { User, Session } from "@supabase/supabase-js";

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
  },
};

// Mock Astro context
const mockLocals = {
  supabase: mockSupabaseClient,
  user: null,
};

describe("API Endpoint: /api/auth/register", () => {
  // --- RegisterSchema Tests ---
  describe("RegisterSchema Validation", () => {
    it("should validate correct data", () => {
      const result = RegisterSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should invalidate incorrect email format", () => {
      const result = RegisterSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe("Nieprawidłowy format adresu email.");
    });

    it("should invalidate password shorter than 8 characters", () => {
      const result = RegisterSchema.safeParse({
        email: "test@example.com",
        password: "short",
      });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe("Hasło musi mieć minimum 8 znaków.");
    });

    it("should invalidate missing fields", () => {
      const result = RegisterSchema.safeParse({ email: "test@example.com" });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.path).toContain("password");
      expect(result.error?.errors[0]?.message).toContain("Required");
    });
  });

  // --- Handler Tests ---
  describe("POST Handler", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("should register user successfully", async () => {
      const mockUser: Partial<User> = { id: "fake-uuid", email: "test@example.com" };
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: {} as Session },
        error: null,
      });
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: {} as Session },
        error: null,
      });

      const mockRequest = new Request("http://localhost/api/auth/register", {
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
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: {
          emailRedirectTo: expect.stringContaining("/login"),
          data: {
            email_confirmed: true,
            registration_date: expect.any(String),
          },
        },
      });
    });

    it("should return 400 for invalid input data (Zod validation)", async () => {
      const mockRequest = new Request("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email: "invalid-email", password: "short" }),
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
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it("should return 400 if email already exists (Supabase error)", async () => {
      const supabaseError = { message: "User already registered", status: 400 };
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: supabaseError,
      });

      const mockRequest = new Request("http://localhost/api/auth/register", {
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

      expect(response.status).toBe(400);
      // Sprawdź komunikat błędu zwracany przez Twój handler
      expect(body).toHaveProperty("message", "Użytkownik z tym adresem email już istnieje.");
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalled();
    });

    it("should return 500 for unexpected Supabase error", async () => {
      const supabaseError = { message: "Internal Server Error", status: 500 };
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: supabaseError,
      });

      const mockRequest = new Request("http://localhost/api/auth/register", {
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

      // Handler zwraca 400 dla błędów signUp innych niż "already registered"
      expect(response.status).toBe(400);
      // Sprawdź komunikat błędu zwracany przez Twój handler
      expect(body).toHaveProperty("message", "Błąd rejestracji: Internal Server Error");
    });
  });
});
