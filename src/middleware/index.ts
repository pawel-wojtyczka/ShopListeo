import { defineMiddleware } from "astro/middleware";
import { createServerClient } from "@supabase/ssr";
import type { UserDTO } from "../types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { logger } from "../lib/logger";

// Ścieżki wymagające autentykacji - usunięto /shopping-lists
const protectedPaths = ["/dashboard", "/settings"];

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
const supabaseMiddleware = defineMiddleware(async (context, next) => {
  // Pobieramy potrzebne właściwości z context
  const { locals, cookies, redirect, url } = context;

  // Pobieramy ścieżkę z URL
  const pathname = url.pathname;

  // Logowanie informacji o żądaniu
  logger.info(`Middleware processing request`, { 
    pathname, 
    method: context.request.method,
    userAgent: context.request.headers.get('user-agent')?.substring(0, 100) 
  });

  // Pomijamy sprawdzanie autoryzacji dla statycznych zasobów (ale nie dla endpointów API)
  if (pathname.includes("_astro") || pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)) {
    logger.debug(`Skipping middleware for static resource`, { pathname });
    return next();
  }

  // --- Inicjalizacja Supabase ---
  // Odczytujemy zmienne środowiskowe - w środowisku deweloperskim z import.meta.env,
  // w produkcji z locals.runtime?.env (Cloudflare Pages)
  const env = locals.runtime?.env ?? {};
  
  // Logowanie dostępnych zmiennych środowiskowych (bez wartości)
  logger.info(`Environment variables check`, {
    hasRuntimeEnv: !!locals.runtime?.env,
    hasImportMetaEnv: !!import.meta.env,
    availableEnvKeys: Object.keys(env),
    availableImportMetaKeys: Object.keys(import.meta.env).filter(key => key.includes('SUPABASE') || key.includes('OPENROUTER'))
  });

  const supabaseUrl = (env.PUBLIC_SUPABASE_URL as string) || import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = (env.PUBLIC_SUPABASE_ANON_KEY as string) || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = (env.SUPABASE_SERVICE_ROLE_KEY as string) || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminSupabaseUrl = (env.SUPABASE_URL as string) || import.meta.env.SUPABASE_URL || supabaseUrl;

  // Logowanie konfiguracji Supabase (bez kluczy)
  logger.info(`Supabase configuration check`, {
    hasSupabaseUrl: !!supabaseUrl,
    hasSupabaseAnonKey: !!supabaseAnonKey,
    hasSupabaseServiceRoleKey: !!supabaseServiceRoleKey,
    hasAdminSupabaseUrl: !!adminSupabaseUrl,
    supabaseUrlLength: supabaseUrl?.length || 0,
    supabaseAnonKeyLength: supabaseAnonKey?.length || 0,
    supabaseServiceRoleKeyLength: supabaseServiceRoleKey?.length || 0
  });

  // Sprawdzamy, czy kluczowe zmienne są dostępne
  if (!supabaseUrl || !supabaseAnonKey) {
    logger.error("Middleware Error: PUBLIC Supabase URL or Key is missing from runtime environment!", {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseAnonKey: !!supabaseAnonKey,
      supabaseUrl: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
      supabaseAnonKey: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 10)}...` : 'undefined'
    });
    // Zamiast rzucać błędem lub logować, zwracamy odpowiedź błędu, co jest bezpieczniejsze
    return new Response("Internal Server Error: Supabase configuration missing", {
      status: 500,
    });
  }
  
  // Sprawdzamy zmienne dla klienta admina (tylko jeśli będą używane)
  const adminCredentialsAvailable = !!adminSupabaseUrl && !!supabaseServiceRoleKey;
  logger.info("Admin client credentials available:", { adminCredentialsAvailable });

  // Tworzymy standardową instancję klienta Supabase dla tego żądania
  let supabase: SupabaseClient | null = null;
  if (supabaseUrl && supabaseAnonKey) {
    try {
      supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get(key) {
            return cookies.get(key)?.value;
          },
          set(key, value, options) {
            cookies.set(key, value, options);
          },
          remove(key, options) {
            cookies.delete(key, options);
          },
        },
      });
      (locals as App.Locals).supabase = supabase;
      logger.info("Standard Supabase client created successfully");
    } catch (error) {
      logger.error("Failed to create standard Supabase client", { error: error instanceof Error ? error.message : 'Unknown error' });
      (locals as App.Locals).supabase = null;
    }
  } else {
    logger.error("Middleware: Failed to create standard Supabase client due to missing URL/Key.");
    // Jeśli klient nie mógł zostać utworzony, przypisujemy null.
    (locals as App.Locals).supabase = null;
  }

  // Tworzymy instancję klienta Supabase z uprawnieniami administratora
  let supabaseAdmin: SupabaseClient | null = null;
  if (adminCredentialsAvailable) {
    try {
      supabaseAdmin = createServerClient(adminSupabaseUrl, supabaseServiceRoleKey, {
        cookies: {
          get(key) {
            return cookies.get(key)?.value;
          },
          set(key, value, options) {
            cookies.set(key, value, options);
          },
          remove(key, options) {
            cookies.delete(key, options);
          },
        },
      });
      (locals as App.Locals).supabaseAdmin = supabaseAdmin;
      logger.info("Admin Supabase client created successfully");
    } catch (error) {
      logger.error("Middleware Error: Failed to create Supabase admin client:", { error: error instanceof Error ? error.message : 'Unknown error' });
      (locals as App.Locals).supabaseAdmin = null;
    }
  } else {
    logger.warn("Middleware: Admin Supabase client cannot be created due to missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    (locals as App.Locals).supabaseAdmin = null;
  }

  // Sprawdzamy, czy standardowy klient Supabase jest dostępny w locals
  const currentSupabase = (locals as App.Locals).supabase;
  if (!currentSupabase) {
    logger.error("Middleware: Cannot proceed with authentication check, Supabase client is not available.");
    // Można zdecydować, czy zwrócić błąd, czy kontynuować bez uwierzytelniania
    // return new Response("Internal Server Error: Supabase client unavailable", { status: 500 });
    // Na razie pozwalamy kontynuować, aby inne części aplikacji mogły działać
  }

  // --- Sprawdzanie autentykacji --- (Używamy supabase, jeśli jest dostępny)
  let authUser: UserDTO | null = null;
  let isAuthenticated = false;
  let session = null;

  if (currentSupabase) {
    try {
      logger.debug("Attempting to get user from Supabase");
      const { data, error: getUserError } = await currentSupabase.auth.getUser();

      // Pobieramy sesję osobno, ponieważ getUser nie zwraca sesji bezpośrednio
      const { data: sessionData } = await currentSupabase.auth.getSession();
      session = sessionData?.session;

      if (getUserError || !data.user) {
        isAuthenticated = false;
        authUser = null;
        if (getUserError) {
          logger.warn("Middleware: Error fetching user:", { error: getUserError.message });
        } else {
          logger.debug("No user found - user not authenticated");
        }
      } else {
        // Użytkownik jest zalogowany
        const user = data.user;
        isAuthenticated = true;
        logger.info("User authenticated successfully", { 
          userId: user.id, 
          email: user.email,
          isAdmin: user.app_metadata?.isAdmin || false 
        });

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
          logger.debug("Session tokens set as cookies");
        }

        // Mapujemy dane użytkownika do UserDTO
        authUser = {
          id: user.id,
          email: user.email || "",
          registrationDate: user.created_at || "",
          lastLoginDate: user.last_sign_in_at || null,
          isAdmin: user.app_metadata?.isAdmin || false,
        };

        // Jeśli jest sesja i użytkownik, ustawiamy go w locals
        isAuthenticated = true;
        (locals as App.Locals).user = data.user;
      }
    } catch (error) {
      logger.error("Middleware: Unexpected error during authentication check:", { error: error instanceof Error ? error.message : 'Unknown error' });
      isAuthenticated = false;
      authUser = null;
      (locals as App.Locals).user = null;
    }
  } else {
    // Jeśli klient Supabase nie jest dostępny, zakładamy, że użytkownik nie jest zalogowany
    logger.warn("Supabase client not available, assuming user is not authenticated");
    isAuthenticated = false;
    authUser = null;
    (locals as App.Locals).user = null;
  }

  // Ustawiamy userDTO i isAuthenticated niezależnie od błędu klienta Supabase
  (locals as App.Locals & { userDTO: UserDTO | null; isAuthenticated: boolean }).userDTO = authUser;
  (locals as App.Locals & { userDTO: UserDTO | null; isAuthenticated: boolean }).isAuthenticated = isAuthenticated;

  // Sprawdzamy reguły przekierowania
  const isProtectedRoute = protectedPaths.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthApiRoute = AUTH_API_ROUTES.some((route) => pathname.startsWith(route));
  const isShoppingListApiRoute = SHOPPING_LIST_API_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  logger.debug("Route analysis", {
    pathname,
    isProtectedRoute,
    isAuthRoute,
    isAuthApiRoute,
    isShoppingListApiRoute,
    isAdminRoute,
    isAuthenticated
  });

  // Przekierowanie na stronę logowania, gdy próbujemy uzyskać dostęp do chronionej strony będąc niezalogowanym
  // (z wyjątkiem ścieżek autoryzacyjnych i API autoryzacji)
  if (isProtectedRoute && !isAuthenticated && !isAuthRoute && !isAuthApiRoute && !isShoppingListApiRoute) {
    logger.info("Redirecting to login - protected route accessed without authentication", { pathname });
    return redirect("/login");
  }

  // Przekierowanie niezalogowanych użytkowników na stronę logowania, gdy próbują uzyskać dostęp do strony głównej
  if (pathname === "/" && !isAuthenticated && !isAuthRoute && !isAuthApiRoute) {
    logger.info("Redirecting to login - root path accessed without authentication");
    return redirect("/login");
  }

  // Przekierowanie na stronę główną, gdy próbujemy uzyskać dostęp do strony autoryzacji będąc zalogowanym
  if (isAuthRoute && isAuthenticated) {
    logger.info("Redirecting to home - auth route accessed while authenticated", { pathname });
    return redirect("/");
  }

  // Przekierowanie na stronę główną, gdy próbujemy uzyskać dostęp do strony admina bez bycia adminem
  if (isAdminRoute && (!isAuthenticated || !authUser?.isAdmin)) {
    logger.info("Redirecting to home - admin route accessed without admin privileges", { 
      pathname, 
      isAuthenticated, 
      isAdmin: authUser?.isAdmin 
    });
    return redirect("/");
  }

  // Brak przekierowania, przechodzimy do żądanej strony
  logger.debug("Middleware completed successfully, proceeding to requested page", { pathname });
  return await next();
});

// Eksportujemy bezpośrednio supabaseMiddleware
export const onRequest = supabaseMiddleware;
