import type { MiddlewareHandler } from "astro";
import type { AstroLocals } from "../types/locals";
import { supabaseClient } from "../db/supabase.client";
import type { User } from "@supabase/supabase-js";
import type { UserDTO } from "../types";

// Sprawdzenie czy środowisko jest developmentem
const isDevelopment = process.env.NODE_ENV === "development";

// Ścieżki wymagające autentykacji
const PROTECTED_ROUTES = ["/", "/shopping-lists", "/profile"];

// Ścieżki dostępne tylko dla niezalogowanych użytkowników
const AUTH_ROUTES = ["/login", "/register", "/reset-password", "/set-new-password"];

// Ścieżki dostępne tylko dla administratorów
const ADMIN_ROUTES = ["/admin"];

export const prerender = false;

// Funkcja pomocnicza do weryfikacji tokenu JWT
async function verifyToken(token: string): Promise<UserDTO | null> {
  try {
    // W rzeczywistej aplikacji, powinniśmy wywołać endpoint API
    // do weryfikacji tokenu, tu używamy klienta Supabase
    const { data, error } = await supabaseClient.auth.getUser(token);

    if (error || !data.user) {
      return null;
    }

    // Konwersja User z Supabase na nasze UserDTO
    // W rzeczywistej aplikacji pobralibyśmy więcej danych z bazy
    const userDTO: UserDTO = {
      id: data.user.id,
      email: data.user.email || "",
      registrationDate: data.user.created_at || "",
      lastLoginDate: data.user.last_sign_in_at || null,
      isAdmin: data.user.app_metadata?.isAdmin || false,
    };

    return userDTO;
  } catch (error) {
    console.error("Błąd weryfikacji tokenu:", error);
    return null;
  }
}

/**
 * Middleware obsługujące uwierzytelnianie, dostęp do Supabase i kontrolę dostępu
 */
export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, locals, cookies, redirect } = context;

  // Przypisanie klienta Supabase do context.locals
  (locals as AstroLocals).supabase = supabaseClient;

  // Pomijamy pliki statyczne
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname.includes("_astro") || pathname.includes(".") || pathname.includes("/api/")) {
    return await next();
  }

  // Tryb developerski
  if (isDevelopment) {
    console.log("🔧 Tryb deweloperski: używanie testowego użytkownika");

    // Testowy użytkownik deweloperski dla łatwiejszego testowania API
    const devUser: User = {
      id: "4e0a9b6a-b416-48e6-8d35-5700bd1d674a",
      app_metadata: { isAdmin: true },
      user_metadata: {},
      aud: "authenticated",
      email: "dev@example.com",
      created_at: new Date().toISOString(),
      role: "authenticated",
    };

    (locals as AstroLocals).user = devUser;

    // W trybie dev przyjmujemy że użytkownik jest zalogowany dla łatwiejszego testowania
    const devUserDTO: UserDTO = {
      id: devUser.id,
      email: devUser.email || "",
      registrationDate: devUser.created_at,
      lastLoginDate: new Date().toISOString(),
      isAdmin: true,
    };

    (locals as any).authUser = devUserDTO;
    (locals as any).isAuthenticated = true;

    return await next();
  }

  // Pobieramy token z ciasteczka lub nagłówka
  const token = cookies.get("authToken")?.value || request.headers.get("Authorization")?.replace("Bearer ", "");

  // Stan autentykacji
  let authUser: UserDTO | null = null;
  let isAuthenticated = false;

  // Jeśli mamy token, weryfikujemy go
  if (token) {
    authUser = await verifyToken(token);
    isAuthenticated = !!authUser;

    // Standardowa weryfikacja uwierzytelnienia
    const {
      data: { user },
    } = await supabaseClient.auth.getUser(token);
    (locals as AstroLocals).user = user;
  }

  // Zapisujemy dane użytkownika w locals dla widoków
  (locals as any).authUser = authUser;
  (locals as any).isAuthenticated = isAuthenticated;

  // Sprawdzamy, czy ścieżka wymaga autentykacji
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // Sprawdzamy, czy ścieżka jest dla niezalogowanych
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Sprawdzamy, czy ścieżka jest dla administratorów
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  // Jeśli użytkownik próbuje dostać się do chronionej ścieżki bez autoryzacji
  if (isProtectedRoute && !isAuthenticated) {
    return redirect("/login");
  }

  // Jeśli zalogowany użytkownik próbuje dostać się do ścieżki autoryzacji
  if (isAuthRoute && isAuthenticated) {
    return redirect("/");
  }

  // Jeśli użytkownik próbuje dostać się do ścieżki admina i nie jest adminem
  if (isAdminRoute && (!isAuthenticated || !authUser?.isAdmin)) {
    return redirect("/");
  }

  // Przekazanie do następnego middleware lub handlera
  return await next();
};
