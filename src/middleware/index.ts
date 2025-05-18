import { defineMiddleware } from "astro/middleware";
// import { createServerClient } from "@supabase/ssr"; // Zakomentowane
// import type { UserDTO } from "../types"; // Zakomentowane
// import type { SupabaseClient } from "@supabase/supabase-js"; // Zakomentowane

// Ścieżki wymagające autentykacji - usunięto /shopping-lists
// const protectedPaths = ["/dashboard", "/settings"]; // Zakomentowane

// Ścieżki dostępne tylko dla niezalogowanych użytkowników (lub obu stanów)
// const AUTH_ROUTES = ["/login", "/register", "/reset-password", "/set-new-password", "/recover", "/recover-password"]; // Zakomentowane

// Ścieżki API związane z autoryzacją, które powinny być dostępne bez logowania
// const AUTH_API_ROUTES = [ // Zakomentowane
//   "/api/auth/register",
//   "/api/auth/login",
//   "/api/auth/logout",
//   "/api/auth/reset-password",
//   "/api/auth/request-reset",
//   "/api/auth/set-new-password",
// ];

// Ścieżki API związane z listami zakupów - chronione, ale bez przekierowania
// const SHOPPING_LIST_API_ROUTES = ["/api/client/shopping-lists/"]; // Zakomentowane

// Ścieżki dostępne tylko dla administratorów
// const ADMIN_ROUTES = ["/admin"]; // Zakomentowane

// export const prerender = false; // Już zakomentowane

/**
 * Middleware obsługujące uwierzytelnianie, dostęp do Supabase i kontrolę dostępu
 * TYMCZASOWO WYŁĄCZONE DLA STATYCZNEGO BUILDA CAPACITOR
 */
const supabaseMiddleware = defineMiddleware(async (context, next) => {
  // Pobieramy potrzebne właściwości z context
  // const { locals, cookies, redirect, url } = context; // Zakomentowane

  // Pobieramy ścieżkę z URL
  // const pathname = url.pathname; // Zakomentowane

  // Pomijamy sprawdzanie autoryzacji dla statycznych zasobów (ale nie dla endpointów API)
  // if (pathname.includes("_astro") || pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2)$/)) { // Zakomentowane
  //   return next();
  // }

  // --- Inicjalizacja Supabase --- // Zakomentowane całe sekcje
  /*
  const env = locals.runtime?.env ?? {};
  // ... (reszta logiki Supabase, auth, przekierowań)
  */

  // Brak przekierowania, przechodzimy do żądanej strony
  return await next(); // Jedyne co pozostaje aktywne
});

// Eksportujemy bezpośrednio supabaseMiddleware
export const onRequest = supabaseMiddleware;
