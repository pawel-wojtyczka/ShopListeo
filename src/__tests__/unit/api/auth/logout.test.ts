import { describe, it, expect, vi, beforeEach } from "vitest";
// Użycie aliasu @/ dla importu
import { POST } from "@/pages/api/auth/logout";
import type { APIContext } from "astro";

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    signOut: vi.fn(),
  },
};

// Mock Astro context
const mockLocals = {
  supabase: mockSupabaseClient,
  user: { id: "fake-user-id" }, // Mock logged-in user
};

// Mock cookies object
const mockCookies = {
  delete: vi.fn(),
};

describe("API Endpoint: /api/auth/logout", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Reset mock cookies delete calls
    mockCookies.delete.mockClear();
  });

  it("should logout user successfully", async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

    const mockRequest = new Request("http://localhost/api/auth/logout", {
      method: "POST",
    });

    // Dodaj mock cookies do kontekstu
    const context = {
      request: mockRequest,
      locals: mockLocals,
      cookies: mockCookies,
    } as unknown as APIContext;

    const response = await POST(context);

    expect(response.status).toBe(204); // Oczekuj 204
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    // Sprawdź czy cookies.delete zostało wywołane
    expect(mockCookies.delete).toHaveBeenCalledTimes(2);
    expect(mockCookies.delete).toHaveBeenCalledWith("sb-access-token", { path: "/" });
    expect(mockCookies.delete).toHaveBeenCalledWith("sb-refresh-token", { path: "/" });
  });

  it("should return 204 even if Supabase signOut fails (handler ignores error)", async () => {
    const supabaseError = { message: "Sign out failed", status: 500 };
    // Mock signOut returning an error
    mockSupabaseClient.auth.signOut.mockResolvedValue({ error: supabaseError });

    const mockRequest = new Request("http://localhost/api/auth/logout", {
      method: "POST",
    });

    const context = {
      request: mockRequest,
      locals: mockLocals,
      cookies: mockCookies,
    } as unknown as APIContext;

    const response = await POST(context);

    // Handler should still return 204 according to its logic
    expect(response.status).toBe(204);
    // Verify signOut was called
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    // Verify cookies were still attempted to be deleted
    expect(mockCookies.delete).toHaveBeenCalledTimes(2);
    expect(mockCookies.delete).toHaveBeenCalledWith("sb-access-token", { path: "/" });
    expect(mockCookies.delete).toHaveBeenCalledWith("sb-refresh-token", { path: "/" });
    // No body to parse or check
  });

  it("should return 500 if Supabase client is missing", async () => {
    const contextWithoutSupabase = {
      request: new Request("http://localhost/api/auth/logout", { method: "POST" }),
      locals: { user: { id: "fake-user-id" } }, // Supabase is missing
      cookies: mockCookies,
    } as unknown as APIContext;

    const response = await POST(contextWithoutSupabase);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toHaveProperty("error", "Internal server error: Supabase client missing");
    expect(mockSupabaseClient.auth.signOut).not.toHaveBeenCalled();
    expect(mockCookies.delete).not.toHaveBeenCalled();
  });
});
