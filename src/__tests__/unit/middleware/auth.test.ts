import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient, type User, type Session } from "@supabase/supabase-js";
import type { AstroGlobal } from "astro";
import { onRequest as authMiddleware } from "@/middleware";
import type { AstroCookies } from "astro";
import type { AstroLocals } from "@/types/locals";

// Mock next function for middleware
const mockNext = vi.fn(async () => new Response());

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
    },
  })),
}));

describe("Auth Middleware", () => {
  let mockContext: Partial<AstroGlobal>;
  const mockUser: User = {
    id: "test-user-id",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    role: "",
    updated_at: new Date().toISOString(),
  };

  const mockSession: Session = {
    access_token: "test-token",
    refresh_token: "test-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNext.mockClear();

    // Reset mock context before each test
    const mockCookies: Partial<AstroCookies> = {
      get: vi.fn(),
      has: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    };

    // Create Supabase client instance
    const supabase = createClient("", "");

    // Create mock locals with required properties
    const mockLocals = {
      supabase,
      user: null,
      authUser: null,
      isAuthenticated: false,
    } satisfies AstroLocals;

    mockContext = {
      url: new URL("http://localhost:3000"),
      cookies: mockCookies as AstroCookies,
      locals: mockLocals,
      redirect: vi.fn(),
      request: new Request("http://localhost:3000"),
    };
  });

  describe("Authentication checks", () => {
    it("should set isAuthenticated to true for authenticated user", async () => {
      const supabase = createClient("", "");
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      await authMiddleware(mockContext as AstroGlobal, mockNext);

      expect(mockContext.locals?.isAuthenticated).toBe(true);
      expect(mockContext.locals?.user?.id).toBe(mockUser.id);
    });

    it("should set isAuthenticated to false for unauthenticated user", async () => {
      const supabase = createClient("", "");
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      await authMiddleware(mockContext as AstroGlobal, mockNext);

      expect(mockContext.locals?.isAuthenticated).toBe(false);
      expect(mockContext.locals?.user).toBeNull();
    });

    it("should handle authentication errors gracefully", async () => {
      const supabase = createClient("", "");
      vi.mocked(supabase.auth.getUser).mockRejectedValueOnce(new Error("Auth service unavailable"));
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      await authMiddleware(mockContext as AstroGlobal, mockNext);

      expect(mockContext.locals?.isAuthenticated).toBe(false);
      expect(mockContext.locals?.user).toBeNull();
    });
  });

  describe("Route protection", () => {
    it("should redirect unauthenticated users from protected routes to login", async () => {
      mockContext.url = new URL("http://localhost:3000/shopping-lists");
      const supabase = createClient("", "");
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const response = await authMiddleware(mockContext as AstroGlobal, mockNext);

      expect(mockContext.redirect).toHaveBeenCalledWith("/login");
      expect(response).toBeInstanceOf(Response);
    });

    it("should allow authenticated users to access protected routes", async () => {
      mockContext.url = new URL("http://localhost:3000/shopping-lists");
      const supabase = createClient("", "");
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      await authMiddleware(mockContext as AstroGlobal, mockNext);

      expect(mockContext.redirect).not.toHaveBeenCalled();
    });

    it("should redirect authenticated users from auth routes to home", async () => {
      mockContext.url = new URL("http://localhost:3000/auth/login");
      const supabase = createClient("", "");
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      await authMiddleware(mockContext as AstroGlobal, mockNext);

      expect(mockContext.redirect).toHaveBeenCalledWith("/");
    });

    it("should allow unauthenticated users to access public routes", async () => {
      mockContext.url = new URL("http://localhost:3000/about");
      const supabase = createClient("", "");
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      await authMiddleware(mockContext as AstroGlobal, mockNext);

      expect(mockContext.redirect).not.toHaveBeenCalled();
    });
  });

  describe("API routes", () => {
    it("should return 401 for unauthenticated API requests", async () => {
      mockContext.url = new URL("http://localhost:3000/api/shopping-lists");
      const supabase = createClient("", "");
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const response = await authMiddleware(mockContext as AstroGlobal, mockNext);

      expect(response).toBeInstanceOf(Response);
      if (response instanceof Response) {
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({
          error: "Wymagane uwierzytelnienie",
        });
      }
    });

    it("should allow authenticated API requests", async () => {
      mockContext.url = new URL("http://localhost:3000/api/shopping-lists");
      const supabase = createClient("", "");
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      const response = await authMiddleware(mockContext as AstroGlobal, mockNext);

      expect(response).toBeUndefined(); // Middleware passes through
    });
  });

  describe("Token handling", () => {
    it("should set auth token cookie when token is present", async () => {
      const mockToken = "test-auth-token";
      const mockCookies = mockContext.cookies as AstroCookies;
      mockCookies.set = vi.fn();
      const supabase = createClient("", "");
      vi.mocked(supabase.auth.getUser).mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      await authMiddleware(mockContext as AstroGlobal, mockNext);

      expect(mockCookies.set).toHaveBeenCalledWith("authToken", mockToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });
    });

    it("should clear auth token cookie on logout", async () => {
      mockContext.url = new URL("http://localhost:3000/auth/logout");
      const mockCookies = mockContext.cookies as AstroCookies;
      mockCookies.delete = vi.fn();

      await authMiddleware(mockContext as AstroGlobal, mockNext);

      expect(mockCookies.delete).toHaveBeenCalledWith("authToken");
    });
  });
});
