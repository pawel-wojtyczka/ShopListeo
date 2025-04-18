import type { MiddlewareHandler } from "astro";
import type { AstroLocals } from "../types/locals";
import type { UserDTO } from "../types";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "../db/database.types";

// Ścieżki wymagające autentykacji
const PROTECTED_ROUTES = ["/", "/shopping-lists", "/profile"];

// Ścieżki dostępne tylko dla niezalogowanych użytkowników
const AUTH_ROUTES = ["/login", "/register", "/reset-password", "/set-new-password"];

// Ścieżki dostępne tylko dla administratorów
const ADMIN_ROUTES = ["/admin"];

export const prerender = false;

/**
 * Middleware obsługujące uwierzytelnianie, dostęp do Supabase i kontrolę dostępu
 */
export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, locals, cookies, redirect } = context;

  // Pobieramy ścieżkę z URL
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip auth checks ONLY for static assets, not API routes
  if (pathname.includes("_astro") || pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)) {
    console.log(`Middleware: Skipping auth checks for static asset: ${pathname}`);
  } else {
    console.log(`Middleware: Running auth checks for path: ${pathname}`);
  }

  // Create Supabase client using @supabase/ssr for server-side context
  const supabase = createServerClient<Database>(
    import.meta.env.SUPABASE_URL, // Use non-public URL
    import.meta.env.SUPABASE_KEY, // Use non-public Anon Key
    {
      cookies: {
        // Get cookies from Astro context
        get(key: string) {
          return cookies.get(key)?.value;
        },
        // Set cookies using Astro context
        set(key: string, value: string, options: CookieOptions) {
          cookies.set(key, value, options);
        },
        // Remove cookies using Astro context
        remove(key: string, options: CookieOptions) {
          cookies.delete(key, options);
        },
      },
    }
  );

  // Assign the ssr-configured client to locals
  (locals as AstroLocals).supabase = supabase;

  // --- AUTHENTICATION FLOW ---
  let authUser: UserDTO | null = null;
  let isAuthenticated = false;
  let supabaseUser = null;

  // 1. Get User / Session using the ssr client
  // No need to manually handle token, getUser() will use the cookie handler
  console.log("Middleware: Attempting to get user via supabase.auth.getUser()...");
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  // 2. Handle verification result
  if (getUserError || !user) {
    console.log("Middleware: User not found or error.", getUserError?.message);
    isAuthenticated = false;
    authUser = null;
    supabaseUser = null;
    // No need to manually delete cookies here, Supabase client handles expiration
  } else {
    // User is valid
    console.log(`Middleware: User verified: ${user.email}`);
    isAuthenticated = true;
    supabaseUser = user;
    // Map to UserDTO
    authUser = {
      id: user.id,
      email: user.email || "",
      registrationDate: user.created_at || "",
      lastLoginDate: user.last_sign_in_at || null,
      isAdmin: user.app_metadata?.isAdmin || false,
    };
  }

  // 3. Set locals based on verification result
  (locals as AstroLocals).user = supabaseUser; // Store raw Supabase user or null
  (locals as AstroLocals & { authUser: UserDTO | null; isAuthenticated: boolean }).authUser = authUser;
  (locals as AstroLocals & { authUser: UserDTO | null; isAuthenticated: boolean }).isAuthenticated = isAuthenticated;
  console.log("Middleware: Locals set", { isAuthenticated, userId: authUser?.id });

  // 4. Apply redirection rules
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  console.log("Middleware: Checking redirects for path:", pathname, {
    isProtectedRoute,
    isAuthRoute,
    isAdminRoute,
    isAuthenticated,
  });

  // Redirect to login if trying to access protected route while logged out
  if (isProtectedRoute && !isAuthenticated && pathname !== "/login") {
    console.log("Middleware: Redirecting to /login (protected route, not authenticated, not already on /login)");
    return redirect("/login");
  }

  // --- RE-ENABLED ---
  // Redirect to home if trying to access auth route while logged in
  if (isAuthRoute && isAuthenticated) {
    console.log("Middleware: Redirecting to / (auth route, authenticated)");
    return redirect("/");
  }
  // --- END RE-ENABLED ---

  // Redirect to home if trying to access admin route without being an admin
  if (isAdminRoute && (!isAuthenticated || !authUser?.isAdmin)) {
    console.log("Middleware: Redirecting to / (admin route, not admin or not authenticated)");
    return redirect("/");
  }

  // 5. No redirect needed, proceed to the requested page
  console.log("Middleware: No redirect needed, calling next()");
  return await next();
};
