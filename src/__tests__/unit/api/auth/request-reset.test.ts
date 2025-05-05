import { describe, it, expect, vi, beforeEach } from "vitest";
// Użycie aliasu @/ dla importu
import { POST, RequestResetSchema } from "@/pages/api/auth/request-reset";
import type { APIContext } from "astro";

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    resetPasswordForEmail: vi.fn(),
  },
};

// Mock Astro context
const mockLocals = {
  supabase: mockSupabaseClient,
  user: null,
};

describe("API Endpoint: /api/auth/request-reset", () => {
  // --- RequestResetSchema Tests ---
  describe("RequestResetSchema Validation", () => {
    it("should validate correct email", () => {
      const result = RequestResetSchema.safeParse({ email: "test@example.com" });
      expect(result.success).toBe(true);
    });

    it("should invalidate incorrect email format", () => {
      const result = RequestResetSchema.safeParse({ email: "invalid-email" });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe("Nieprawidłowy format adresu email.");
    });

    it("should invalidate missing email", () => {
      const result = RequestResetSchema.safeParse({});
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.path).toContain("email");
      expect(result.error?.errors[0]?.message).toContain("Required");
    });
  });

  // --- Handler Tests ---
  describe("POST Handler", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("should request password reset successfully", async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });

      const mockRequest = new Request("http://localhost/api/auth/request-reset", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com" }),
        headers: { "Content-Type": "application/json" },
      });

      const context = {
        request: mockRequest,
        locals: mockLocals,
        // Mock request.url for redirectTo generation
        url: new URL("http://localhost/api/auth/request-reset"),
      } as unknown as APIContext;

      const response = await POST(context);
      const body = await response.json();

      expect(response.status).toBe(200);
      // Sprawdź komunikat zwracany przez handler
      expect(body).toHaveProperty(
        "message",
        "Jeśli konto istnieje, link do resetowania hasła został wysłany na podany adres email."
      );
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith("test@example.com", {
        // Sprawdź, czy redirectTo jest poprawnie generowany
        redirectTo: "http://localhost/set-new-password",
      });
    });

    it("should return 400 for invalid input data (Zod validation)", async () => {
      const mockRequest = new Request("http://localhost/api/auth/request-reset", {
        method: "POST",
        body: JSON.stringify({ email: "invalid-email" }),
        headers: { "Content-Type": "application/json" },
      });

      const context = {
        request: mockRequest,
        locals: mockLocals,
        url: new URL("http://localhost/api/auth/request-reset"),
      } as unknown as APIContext;

      const response = await POST(context);
      const body = await response.json();

      expect(response.status).toBe(400);
      // Sprawdź komunikat z handlera
      expect(body).toHaveProperty("message", "Błąd walidacji.");
      expect(body).toHaveProperty("errors");
      expect(mockSupabaseClient.auth.resetPasswordForEmail).not.toHaveBeenCalled();
    });

    it("should return 200 even if Supabase encounters an error (for security)", async () => {
      const supabaseError = { message: "Something failed", status: 500 };
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: supabaseError });

      const mockRequest = new Request("http://localhost/api/auth/request-reset", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com" }),
        headers: { "Content-Type": "application/json" },
      });

      const context = {
        request: mockRequest,
        locals: mockLocals,
        url: new URL("http://localhost/api/auth/request-reset"),
      } as unknown as APIContext;

      const response = await POST(context);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toHaveProperty(
        "message",
        "Jeśli konto istnieje, link do resetowania hasła został wysłany na podany adres email."
      );
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalled();
    });
  });
});
