import { describe, it, expect, vi, beforeEach } from "vitest";
// Użycie aliasu @/ dla importu
import { POST, SetNewPasswordSchema } from "@/pages/api/auth/set-new-password";
import type { APIContext } from "astro";
import type { User } from "@supabase/supabase-js"; // Import User type
import type { SupabaseClient } from "@supabase/supabase-js"; // Import SupabaseClient type

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(), // Added mock for getUser used in the handler
    updateUser: vi.fn(),
  },
};

// Mock Astro context
const mockLocals = {
  supabase: mockSupabaseClient as unknown as SupabaseClient, // Correct type casting
  user: null,
};

describe("API Endpoint: /api/auth/set-new-password", () => {
  // --- SetNewPasswordSchema Tests ---
  describe("SetNewPasswordSchema Validation", () => {
    it("should validate correct data", () => {
      const result = SetNewPasswordSchema.safeParse({
        accessToken: "valid-token-123",
        password: "newSecurePassword123",
      });
      expect(result.success).toBe(true);
    });

    it("should invalidate missing accessToken", () => {
      const result = SetNewPasswordSchema.safeParse({
        password: "newSecurePassword123",
      });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.path).toContain("accessToken");
      expect(result.error?.errors[0]?.message).toContain("Required");
    });

    it("should invalidate empty accessToken", () => {
      const result = SetNewPasswordSchema.safeParse({
        accessToken: "",
        password: "newSecurePassword123",
      });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.path).toContain("accessToken");
      expect(result.error?.errors[0]?.message).toBe("Token dostępu jest wymagany.");
    });

    it("should invalidate password shorter than 8 characters", () => {
      const result = SetNewPasswordSchema.safeParse({
        accessToken: "valid-token-123",
        password: "short",
      });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe("Hasło musi mieć co najmniej 8 znaków.");
    });
  });

  // --- Handler Tests ---
  describe("POST Handler", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("should set new password successfully", async () => {
      // Mock getUser succeeding with the token
      const mockUserFromToken: Partial<User> = { id: "user-id-from-token" };
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUserFromToken as User }, error: null });
      // Mock updateUser succeeding
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: { user: { id: "user-id-from-token" } as User },
        error: null,
      });

      const mockRequest = new Request("http://localhost/api/auth/set-new-password", {
        method: "POST",
        body: JSON.stringify({ accessToken: "valid-token-from-email", password: "newSecurePassword123" }),
        headers: { "Content-Type": "application/json" },
      });

      const context = {
        request: mockRequest,
        locals: mockLocals,
      } as unknown as APIContext;

      const response = await POST(context);
      const body = await response.json();

      expect(response.status).toBe(200);
      // Sprawdź komunikat z handlera
      expect(body).toHaveProperty("message", "Password updated successfully.");
      // Verify mocks were called
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledWith("valid-token-from-email");
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({ password: "newSecurePassword123" });
    });

    it("should return 400 for invalid input data (Zod validation)", async () => {
      const mockRequest = new Request("http://localhost/api/auth/set-new-password", {
        method: "POST",
        body: JSON.stringify({ accessToken: "valid-token", password: "short" }), // Invalid password
        headers: { "Content-Type": "application/json" },
      });

      const context = {
        request: mockRequest,
        locals: mockLocals,
      } as unknown as APIContext;

      const response = await POST(context);
      const body = await response.json();

      expect(response.status).toBe(400);
      // Sprawdź komunikat z handlera
      expect(body).toHaveProperty("message", "Błąd walidacji.");
      expect(body).toHaveProperty("errors");
      expect(mockSupabaseClient.auth.getUser).not.toHaveBeenCalled();
      expect(mockSupabaseClient.auth.updateUser).not.toHaveBeenCalled();
    });

    it("should return 401 for invalid or expired token (getUser fails)", async () => {
      const supabaseError = { message: "Token expired or invalid", status: 401 };
      // Mock getUser failing
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: supabaseError });

      const mockRequest = new Request("http://localhost/api/auth/set-new-password", {
        method: "POST",
        body: JSON.stringify({ accessToken: "invalid-or-expired-token", password: "newSecurePassword123" }),
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
      expect(body).toHaveProperty(
        "message",
        "Link do resetowania hasła jest nieprawidłowy lub wygasł. Spróbuj ponownie."
      );
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledWith("invalid-or-expired-token");
      expect(mockSupabaseClient.auth.updateUser).not.toHaveBeenCalled();
    });

    it("should return 500 if updateUser fails after getUser succeeds", async () => {
      // Mock getUser succeeding
      const mockUserFromToken: Partial<User> = { id: "user-id-from-token" };
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUserFromToken as User }, error: null });
      // Mock updateUser failing
      const supabaseError = { message: "Update failed", status: 500 };
      mockSupabaseClient.auth.updateUser.mockResolvedValue({ data: { user: null }, error: supabaseError });

      const mockRequest = new Request("http://localhost/api/auth/set-new-password", {
        method: "POST",
        body: JSON.stringify({ accessToken: "valid-token", password: "newSecurePassword123" }),
        headers: { "Content-Type": "application/json" },
      });

      const context = {
        request: mockRequest,
        locals: mockLocals,
      } as unknown as APIContext;

      const response = await POST(context);
      const body = await response.json();

      expect(response.status).toBe(500);
      // Sprawdź komunikat z handlera
      expect(body).toHaveProperty("message", "Nie udało się zaktualizować hasła po weryfikacji tokenu.");
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledWith("valid-token");
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({ password: "newSecurePassword123" });
    });

    it("should return 500 for unexpected internal error", async () => {
      // Mock getUser succeeding
      const mockUserFromToken: Partial<User> = { id: "user-id-from-token" };
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUserFromToken as User }, error: null });
      // Mock updateUser throwing an unexpected error
      mockSupabaseClient.auth.updateUser.mockRejectedValue(new Error("Unexpected DB error"));

      const mockRequest = new Request("http://localhost/api/auth/set-new-password", {
        method: "POST",
        body: JSON.stringify({ accessToken: "valid-token", password: "newSecurePassword123" }),
        headers: { "Content-Type": "application/json" },
      });

      const context = {
        request: mockRequest,
        locals: mockLocals,
      } as unknown as APIContext;

      const response = await POST(context);
      const body = await response.json();

      expect(response.status).toBe(500);
      // Sprawdź komunikat z handlera
      expect(body).toHaveProperty("message", "Wystąpił nieoczekiwany błąd serwera podczas aktualizacji hasła.");
    });
  });
});
