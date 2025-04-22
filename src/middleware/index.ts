import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.server";
import type { AstroLocals } from "../types/locals";
import type { UserDTO } from "../types";

// Ścieżki wymagające autentykacji
const PROTECTED_ROUTES = ["/", "/shopping-lists", "/profile"];

// Ścieżki dostępne tylko dla niezalogowanych użytkowników (lub obu stanów)
const AUTH_ROUTES = ["/login", "/register", "/reset-password", "/set-new-password", "/recover", "/recover-password"];

// Ścieżki API związane z autoryzacją, które powinny być dostępne bez logowania
const AUTH_API_ROUTES = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/reset-password",
  "/api/auth/request-reset",
  "/api/auth/set-new-password",
];

// Ścieżki dostępne tylko dla administratorów
const ADMIN_ROUTES = ["/admin"];

export const prerender = false;

/**
 * Middleware obsługujące uwierzytelnianie, dostęp do Supabase i kontrolę dostępu
 */
export const onRequest = defineMiddleware(async ({ request, locals, cookies, redirect }, next) => {
  // Pobieramy ścieżkę z URL
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Pomijamy sprawdzanie autoryzacji dla statycznych zasobów (ale nie dla endpointów API)
  if (pathname.includes("_astro") || pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)) {
    return next();
  }

  console.log(`Middleware: Running auth checks for path: ${pathname}`);

  // Tworzymy instancję klienta Supabase dla tego żądania
  const supabase = createSupabaseServerInstance({
    headers: request.headers,
    cookies,
  });

  // Zapisujemy instancję klienta w lokalnym kontekście żądania
  (locals as AstroLocals).supabase = supabase;

  // Sprawdzamy, czy użytkownik jest zalogowany
  let authUser: UserDTO | null = null;
  let isAuthenticated = false;

  console.log("Middleware: Attempting to get user via supabase.auth.getUser()...");
  const { data, error: getUserError } = await supabase.auth.getUser();

  // Pobieramy sesję osobno, ponieważ getUser nie zwraca sesji bezpośrednio
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData?.session;

  if (getUserError || !data.user) {
    console.log("Middleware: User not found or error. Auth session missing!");
    isAuthenticated = false;
    authUser = null;
  } else {
    // Użytkownik jest zalogowany
    const user = data.user;
    console.log(`Middleware: User verified: ${user.email}`);
    isAuthenticated = true;

    // Jeśli mamy aktywną sesję, ustawiamy token sesji jako cookie
    if (session?.access_token) {
      console.log("Middleware: Setting authToken cookie with session token");
      cookies.set("authToken", session.access_token, {
        path: "/",
        httpOnly: false, // Musi być false, aby JavaScript mógł dostać się do tego cookie
        secure: import.meta.env.PROD, // true w produkcji, false w środowisku deweloperskim
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 dni
      });
    }

    // Mapujemy dane użytkownika do UserDTO
    authUser = {
      id: user.id,
      email: user.email || "",
      registrationDate: user.created_at || "",
      lastLoginDate: user.last_sign_in_at || null,
      isAdmin: user.app_metadata?.isAdmin || false,
    };
  }

  // Ustawiamy dane autoryzacyjne w kontekście lokalnym
  (locals as AstroLocals).user = data.user;
  (locals as AstroLocals & { authUser: UserDTO | null; isAuthenticated: boolean }).authUser = authUser;
  (locals as AstroLocals & { authUser: UserDTO | null; isAuthenticated: boolean }).isAuthenticated = isAuthenticated;
  console.log("Middleware: Locals set", { isAuthenticated, userId: authUser?.id });

  // Sprawdzamy reguły przekierowania
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthApiRoute = AUTH_API_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  console.log("Middleware: Checking redirects for path:", pathname, {
    isProtectedRoute,
    isAuthRoute,
    isAuthApiRoute,
    isAdminRoute,
    isAuthenticated,
  });

  // Przekierowanie na stronę logowania, gdy próbujemy uzyskać dostęp do chronionej strony będąc niezalogowanym
  // (z wyjątkiem ścieżek autoryzacyjnych i API autoryzacji)
  if (isProtectedRoute && !isAuthenticated && !isAuthRoute && !isAuthApiRoute) {
    console.log("Middleware: Redirecting to /login (protected route, not authenticated, not auth route)");
    return redirect("/login");
  }

  // Przekierowanie na stronę główną, gdy próbujemy uzyskać dostęp do strony autoryzacji będąc zalogowanym
  if (isAuthRoute && isAuthenticated) {
    console.log("Middleware: Redirecting to / (auth route, authenticated)");
    return redirect("/");
  }

  // Przekierowanie na stronę główną, gdy próbujemy uzyskać dostęp do strony admina bez bycia adminem
  if (isAdminRoute && (!isAuthenticated || !authUser?.isAdmin)) {
    console.log("Middleware: Redirecting to / (admin route, not admin or not authenticated)");
    return redirect("/");
  }

  // Brak przekierowania, przechodzimy do żądanej strony
  console.log("Middleware: No redirect needed, calling next()");
  return await next();
});
