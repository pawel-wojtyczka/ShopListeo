import type { MiddlewareHandler } from "astro";
import type { AstroLocals } from "../types/locals";
import { supabaseClient } from "../db/supabase.client";
import type { UserDTO } from "../types";

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

  // Przypisanie klienta Supabase do context.locals
  (locals as AstroLocals).supabase = supabaseClient;

  // Pobieramy ścieżkę z URL
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Skip static files AND API routes from auth checks/redirects
  if (
    pathname.startsWith("/api/") ||
    pathname.includes("_astro") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)
  ) {
    console.log(`Middleware: Skipping auth checks for path: ${pathname}`);
    return await next();
  }

  /* DEV MODE OVERRIDE IS COMMENTED OUT */

  // --- AUTHENTICATION FLOW ---
  let authUser: UserDTO | null = null;
  let isAuthenticated = false;
  let supabaseUser = null; // Variable to hold the raw Supabase user

  // 1. Get token
  const token = cookies.get("authToken")?.value || request.headers.get("Authorization")?.replace("Bearer ", "");

  // 2. Verify token if it exists
  if (token) {
    console.log("Middleware: Token found, verifying...");
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser(token);

    if (error || !user) {
      // Token invalid or expired
      console.log("Middleware: Token verification failed or user not found.", error?.message);
      isAuthenticated = false;
      authUser = null;
      supabaseUser = null;
      // Clear the invalid cookie
      cookies.delete("authToken", { path: "/" });
      console.log("Middleware: Invalid cookie cleared.");
    } else {
      // Token is valid
      console.log(`Middleware: Token verified for user: ${user.email}`);
      isAuthenticated = true;
      supabaseUser = user; // Store the raw user object
      // Map to UserDTO
      authUser = {
        id: user.id,
        email: user.email || "",
        registrationDate: user.created_at || "",
        lastLoginDate: user.last_sign_in_at || null,
        isAdmin: user.app_metadata?.isAdmin || false,
      };
    }
  } else {
    console.log("Middleware: No token found.");
    isAuthenticated = false;
    authUser = null;
    supabaseUser = null;
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
