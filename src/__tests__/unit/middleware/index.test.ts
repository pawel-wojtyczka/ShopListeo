import { describe, it, expect, vi, beforeEach } from "vitest";
import type { APIContext, MiddlewareNext, AstroCookies } from "astro";
import { onRequest } from "@/middleware/index"; // Import the middleware
import { createServerClient } from "@supabase/ssr"; // Import to mock
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import type { AstroLocals } from "@/types/locals";
// import type { UserDTO } from "@/types"; // Removed unused import

// Mock dependencies
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

// Helper to create a mock APIContext
const createMockContext = (
  pathname: string,
  method = "GET",
  env: Record<string, string | undefined> = {}, // Use string | undefined for env
  cookies: Record<string, string> = {}
) => {
  const mockCookies = {
    get: vi.fn((key) => (key in cookies ? { value: cookies[key] } : undefined)),
    set: vi.fn(),
    delete: vi.fn(),
    getAll: vi.fn(() => Object.entries(cookies).map(([name, value]) => ({ name, value }))),
    has: vi.fn((key) => key in cookies),
    headers: new Headers(),
  } as unknown as AstroCookies; // Use AstroCookies type

  // Define a more specific type for locals if possible, but keep flexibility
  interface MockLocals extends Partial<AstroLocals> {
    runtime?: {
      env: Record<string, string | undefined>;
    };
    supabaseAdmin: SupabaseClient<Database> | null;
    [key: string]: unknown;
  }

  const locals: MockLocals = {
    runtime: {
      env: {
        PUBLIC_SUPABASE_URL: "http://test-supabase.co",
        PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
        SUPABASE_URL: "http://admin-supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
        ...env,
      },
    },
    supabase: null,
    supabaseAdmin: null,
    user: null,
    isAuthenticated: false,
  };

  const context = {
    request: new Request(`http://localhost:4321${pathname}`, { method }),
    url: new URL(`http://localhost:4321${pathname}`),
    cookies: mockCookies,
    redirect: vi.fn((path) => new Response(null, { status: 302, headers: { Location: path } })),
    locals: locals,
    // other potential properties if needed
  } as unknown as APIContext;

  const next: MiddlewareNext = vi.fn(async () => new Response("OK from next"));

  return { context, next, mockCookies };
};

// Helper to setup Supabase mocks
const setupSupabaseMocks = (mockContext: APIContext, isAuthenticated: boolean, isAdmin = false) => {
  const mockGetUser = vi.fn();
  const mockGetSession = vi.fn();
  const mockSupabaseClient: Partial<SupabaseClient<Database>> = {
    auth: {
      getUser: mockGetUser,
      getSession: mockGetSession,
    } as unknown as SupabaseClient<Database>["auth"],
  };
  const mockSupabaseAdminClient: Partial<SupabaseClient<Database>> = {
    /* Similar structure if admin methods needed */
  };

  if (isAuthenticated) {
    const userId = "user-auth-id";
    const userEmail = isAdmin ? "admin@test.com" : "user@test.com";
    const fakeUser = {
      id: userId,
      email: userEmail,
      created_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: { isAdmin: isAdmin },
    };
    const fakeSession = {
      access_token: "fake-access-token",
      refresh_token: "fake-refresh-token",
      user: fakeUser,
    };
    mockGetUser.mockResolvedValue({ data: { user: fakeUser }, error: null });
    mockGetSession.mockResolvedValue({ data: { session: fakeSession }, error: null });
  } else {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  }

  vi.mocked(createServerClient).mockImplementation((url) => {
    // Distinguish between standard and admin client based on URL or key if needed
    if (mockContext.locals.runtime?.env && url === mockContext.locals.runtime.env.SUPABASE_URL) {
      return mockSupabaseAdminClient;
    }
    return mockSupabaseClient;
  });

  return { mockGetUser, mockGetSession, mockSupabaseClient, mockSupabaseAdminClient };
};

describe("Middleware onRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Static Assets ---
  it("should bypass middleware for static assets (.css)", async () => {
    const { context, next } = createMockContext("/assets/style.css");
    await onRequest(context, next);
    expect(next).toHaveBeenCalledOnce();
    expect(vi.mocked(createServerClient)).not.toHaveBeenCalled();
  });

  it("should bypass middleware for _astro folder", async () => {
    const { context, next } = createMockContext("/_astro/component.js");
    await onRequest(context, next);
    expect(next).toHaveBeenCalledOnce();
    expect(vi.mocked(createServerClient)).not.toHaveBeenCalled();
  });

  // --- Supabase Initialization ---
  it("should initialize Supabase clients and set them in locals", async () => {
    const { context, next } = createMockContext("/login");
    const { mockSupabaseClient, mockSupabaseAdminClient } = setupSupabaseMocks(context, false);
    await onRequest(context, next);
    expect(vi.mocked(createServerClient)).toHaveBeenCalledTimes(2); // Standard + Admin
    expect(context.locals.supabase).toBe(mockSupabaseClient);
    expect(context.locals.supabaseAdmin).toBe(mockSupabaseAdminClient);
    expect(next).toHaveBeenCalledOnce();
  });

  it("should handle missing PUBLIC Supabase env vars and return 500", async () => {
    const { context, next } = createMockContext("/", "GET", { PUBLIC_SUPABASE_URL: undefined });
    const response = await onRequest(context, next);
    expect(response).toBeInstanceOf(Response);
    if (response instanceof Response) {
      expect(response.status).toBe(500);
      expect(await response.text()).toContain("Supabase configuration missing");
    }
    expect(next).not.toHaveBeenCalled();
  });

  it("should set supabaseAdmin to null if SERVICE_ROLE_KEY is missing", async () => {
    const { context, next } = createMockContext("/", "GET", { SUPABASE_SERVICE_ROLE_KEY: undefined });
    setupSupabaseMocks(context, false);
    const response = await onRequest(context, next);
    expect(vi.mocked(createServerClient)).toHaveBeenCalledTimes(1); // Only standard client
    expect(context.locals.supabase).toBeDefined();
    expect(context.locals.supabaseAdmin).toBeNull();
    expect(context.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
  });

  // --- Authentication ---
  it("should set userDTO and isAuthenticated for authenticated user", async () => {
    const { context, next, mockCookies } = createMockContext("/dashboard");
    setupSupabaseMocks(context, true, false);
    await onRequest(context, next);

    expect(context.locals.isAuthenticated).toBe(true);
    expect(context.locals.userDTO).toEqual(
      expect.objectContaining({ id: "user-auth-id", email: "user@test.com", isAdmin: false })
    );
    expect(context.locals.user).toBeDefined();
    expect(mockCookies.set).toHaveBeenCalledWith("sb-access-token", "fake-access-token", expect.any(Object));
    expect(mockCookies.set).toHaveBeenCalledWith("sb-refresh-token", "fake-refresh-token", expect.any(Object));
    expect(next).toHaveBeenCalledOnce();
  });

  it("should set userDTO null and isAuthenticated false for unauthenticated user", async () => {
    const { context, next, mockCookies } = createMockContext("/login");
    const { mockGetUser } = setupSupabaseMocks(context, false);
    await onRequest(context, next);

    expect(context.locals.isAuthenticated).toBe(false);
    expect(context.locals.userDTO).toBeNull();
    expect(context.locals.user).toBeNull();
    expect(mockGetUser).toHaveBeenCalledOnce();
    expect(mockCookies.set).not.toHaveBeenCalledWith(
      expect.stringContaining("sb-"),
      expect.any(String),
      expect.any(Object)
    );
    expect(next).toHaveBeenCalledOnce();
  });

  it("should handle error during getUser and set user as unauthenticated", async () => {
    const { context, next } = createMockContext("/dashboard");
    const { mockGetUser } = setupSupabaseMocks(context, false); // Setup mocks first
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error("GetUser failed") }); // Override mock

    const response = await onRequest(context, next);

    expect(context.locals.isAuthenticated).toBe(false);
    expect(context.locals.userDTO).toBeNull();
    expect(context.locals.user).toBeNull();
    // Should still call next, but redirect based on path rules
    expect(context.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled(); // Redirect happens before next()
    // Check response only if redirect happened
    expect(response).toBeInstanceOf(Response);
    if (response instanceof Response) {
      expect(response.status).toBe(302);
    }
  });

  // --- Redirection ---
  it("should redirect unauthenticated user from protected route (/dashboard) to /login", async () => {
    const { context, next } = createMockContext("/dashboard");
    setupSupabaseMocks(context, false);
    const response = await onRequest(context, next);
    expect(context.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
    if (response instanceof Response) {
      expect(response.status).toBe(302);
    }
  });

  it("should NOT redirect authenticated user from protected route (/dashboard)", async () => {
    const { context, next } = createMockContext("/dashboard");
    setupSupabaseMocks(context, true);
    await onRequest(context, next);
    expect(context.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("should redirect authenticated user from auth route (/login) to /", async () => {
    const { context, next } = createMockContext("/login");
    setupSupabaseMocks(context, true);
    const response = await onRequest(context, next);
    expect(context.redirect).toHaveBeenCalledWith("/");
    expect(next).not.toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
    if (response instanceof Response) {
      expect(response.status).toBe(302);
    }
  });

  it("should NOT redirect unauthenticated user from auth route (/login)", async () => {
    const { context, next } = createMockContext("/login");
    setupSupabaseMocks(context, false);
    await onRequest(context, next);
    expect(context.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("should redirect non-admin user from admin route (/admin) to /", async () => {
    const { context, next } = createMockContext("/admin");
    setupSupabaseMocks(context, true, false); // Authenticated, but not admin
    const response = await onRequest(context, next);
    expect(context.redirect).toHaveBeenCalledWith("/");
    expect(next).not.toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
    if (response instanceof Response) {
      expect(response.status).toBe(302);
    }
  });

  it("should redirect unauthenticated user from admin route (/admin) to /", async () => {
    const { context, next } = createMockContext("/admin");
    setupSupabaseMocks(context, false);
    const response = await onRequest(context, next);
    // Unauthenticated user hits admin route -> gets redirected by admin rule first
    expect(context.redirect).toHaveBeenCalledWith("/");
    expect(next).not.toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
    if (response instanceof Response) {
      expect(response.status).toBe(302);
    }
  });

  it("should NOT redirect admin user from admin route (/admin)", async () => {
    const { context, next } = createMockContext("/admin");
    setupSupabaseMocks(context, true, true); // Authenticated AND admin
    await onRequest(context, next);
    expect(context.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("should NOT redirect unauthenticated user from auth API route (/api/auth/login)", async () => {
    const { context, next } = createMockContext("/api/auth/login", "POST");
    setupSupabaseMocks(context, false);
    await onRequest(context, next);
    expect(context.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("should NOT redirect unauthenticated user from shopping list API route (/api/client/shopping-lists/)", async () => {
    // Authentication for this route should be handled within the API endpoint itself
    const { context, next } = createMockContext("/api/client/shopping-lists/some-id", "GET");
    setupSupabaseMocks(context, false);
    await onRequest(context, next);
    expect(context.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});
