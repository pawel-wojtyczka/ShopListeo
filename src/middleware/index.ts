import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance, createSupabaseAdminClient } from "../db/supabase.server";
import type { AstroLocals } from "../types/locals";
import type { UserDTO } from "../types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Ścieżki wymagające autentykacji - usunięto /shopping-lists
const PROTECTED_ROUTES = ["/", "/profile"];

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

// Ścieżki API związane z listami zakupów - chronione, ale bez przekierowania
// Usunięto /api/shopping-lists/ z tej listy, ponieważ nie istnieje
const SHOPPING_LIST_API_ROUTES = ["/api/client/shopping-lists/"];

// Ścieżki dostępne tylko dla administratorów
const ADMIN_ROUTES = ["/admin"];

export const prerender = false;

/**
 * Middleware obsługujące uwierzytelnianie, dostęp do Supabase i kontrolę dostępu
 */
export const onRequest = defineMiddleware(async ({ request, locals, cookies, redirect, url }, next) => {
  // Pobieramy ścieżkę z URL
  const pathname = url.pathname;

  // Pomijamy sprawdzanie autoryzacji dla statycznych zasobów (ale nie dla endpointów API)
  if (pathname.includes("_astro") || pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)) {
    return next();
  }

  // --- Inicjalizacja Supabase ---
  // Odczytujemy zmienne środowiskowe z kontekstu wykonania Cloudflare Pages
  const env = locals.runtime?.env ?? {};
  const supabaseUrl = env.PUBLIC_SUPABASE_URL as string;
  const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY as string;
  const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY as string;
  const adminSupabaseUrl = (env.SUPABASE_URL as string) || supabaseUrl;

  // Logowanie zmiennych środowiskowych dla diagnostyki (pojawi się w logach Cloudflare)
  console.log("Middleware: Attempting to read Supabase env vars.");
  console.log("PUBLIC_SUPABASE_URL available:", !!supabaseUrl);
  console.log("PUBLIC_SUPABASE_ANON_KEY available:", !!supabaseAnonKey);
  console.log("SUPABASE_URL available:", !!env.SUPABASE_URL);
  console.log("SUPABASE_SERVICE_ROLE_KEY available:", !!supabaseServiceRoleKey);

  // Sprawdzamy, czy kluczowe zmienne są dostępne
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Middleware Error: PUBLIC Supabase URL or Key is missing from runtime environment!");
  }
  // Sprawdzamy zmienne dla klienta admina (tylko jeśli będą używane)
  const adminCredentialsAvailable = !!adminSupabaseUrl && !!supabaseServiceRoleKey;
  console.log("Admin client credentials available:", adminCredentialsAvailable);

  // Tworzymy standardową instancję klienta Supabase dla tego żądania
  let supabase: SupabaseClient | null = null;
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createSupabaseServerInstance({
      supabaseUrl: supabaseUrl,
      supabaseKey: supabaseAnonKey,
      headers: request.headers,
      cookies,
    });
    (locals as AstroLocals).supabase = supabase;
  } else {
    console.error("Middleware: Failed to create standard Supabase client due to missing URL/Key.");
    (locals as AstroLocals).supabase = null;
  }

  // Tworzymy instancję klienta Supabase z uprawnieniami administratora
  let supabaseAdmin: SupabaseClient | null = null;
  if (adminCredentialsAvailable) {
    try {
      supabaseAdmin = createSupabaseAdminClient({
        supabaseUrl: adminSupabaseUrl,
        supabaseKey: supabaseServiceRoleKey,
      });
      (locals as AstroLocals).supabaseAdmin = supabaseAdmin;
    } catch (error) {
      console.error("Middleware Error: Failed to create Supabase admin client:", error);
      (locals as AstroLocals).supabaseAdmin = null;
    }
  } else {
    console.warn(
      "Middleware: Admin Supabase client cannot be created due to missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
    );
    (locals as AstroLocals).supabaseAdmin = null;
  }

  // Sprawdzamy, czy standardowy klient został poprawnie utworzony przed próbą użycia
  if (!supabase) {
    console.error("Middleware: Cannot proceed with authentication check, Supabase client is not available.");
    // Można zdecydować o przerwaniu lub kontynuacji w zależności od wymagań
    // return new Response("Internal Server Error: Supabase client unavailable", { status: 500 });
    // Na razie pozwalamy kontynuować, aby inne części aplikacji mogły działać
  }

  // --- Sprawdzanie autentykacji --- (Używamy supabase, jeśli jest dostępny)
  let authUser: UserDTO | null = null;
  let isAuthenticated = false;
  let session = null;

  if (supabase) {
    try {
      const { data, error: getUserError } = await supabase.auth.getUser();

      // Pobieramy sesję osobno, ponieważ getUser nie zwraca sesji bezpośrednio
      const { data: sessionData } = await supabase.auth.getSession();
      session = sessionData?.session;

      if (getUserError || !data.user) {
        isAuthenticated = false;
        authUser = null;
        if (getUserError) {
          console.error("Middleware: Error fetching user:", getUserError.message);
        }
      } else {
        // Użytkownik jest zalogowany
        const user = data.user;
        isAuthenticated = true;

        // Jeśli mamy aktywną sesję, ustawiamy token sesji jako cookie
        if (session?.access_token) {
          cookies.set("sb-access-token", session.access_token, {
            path: "/",
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 dni
          });

          if (session.refresh_token) {
            cookies.set("sb-refresh-token", session.refresh_token, {
              path: "/",
              httpOnly: true,
              secure: env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 7, // 7 dni
            });
          }
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
    } catch (error) {
      console.error("Middleware: Unexpected error during authentication check:", error);
      isAuthenticated = false;
      authUser = null;
      (locals as AstroLocals).user = null;
    }
  } else {
    // Jeśli klient Supabase nie jest dostępny, zakładamy, że użytkownik nie jest zalogowany
    isAuthenticated = false;
    authUser = null;
    (locals as AstroLocals).user = null;
  }

  // Ustawiamy userDTO i isAuthenticated niezależnie od błędu klienta Supabase
  (locals as AstroLocals & { userDTO: UserDTO | null; isAuthenticated: boolean }).userDTO = authUser;
  (locals as AstroLocals & { userDTO: UserDTO | null; isAuthenticated: boolean }).isAuthenticated = isAuthenticated;

  // Sprawdzamy reguły przekierowania
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthApiRoute = AUTH_API_ROUTES.some((route) => pathname.startsWith(route));
  const isShoppingListApiRoute = SHOPPING_LIST_API_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  // Przekierowanie na stronę logowania, gdy próbujemy uzyskać dostęp do chronionej strony będąc niezalogowanym
  // (z wyjątkiem ścieżek autoryzacyjnych i API autoryzacji)
  if (isProtectedRoute && !isAuthenticated && !isAuthRoute && !isAuthApiRoute && !isShoppingListApiRoute) {
    return redirect("/login");
  }

  // Przekierowanie na stronę główną, gdy próbujemy uzyskać dostęp do strony autoryzacji będąc zalogowanym
  if (isAuthRoute && isAuthenticated) {
    return redirect("/");
  }

  // Przekierowanie na stronę główną, gdy próbujemy uzyskać dostęp do strony admina bez bycia adminem
  if (isAdminRoute && (!isAuthenticated || !authUser?.isAdmin)) {
    return redirect("/");
  }

  // Brak przekierowania, przechodzimy do żądanej strony
  return await next();
});
