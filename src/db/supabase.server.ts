import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types";

// Konfiguracja plików cookie, zwłaszcza dla bezpieczeństwa w środowisku produkcyjnym
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: import.meta.env.PROD, // true w produkcji, false w środowisku deweloperskim
  httpOnly: true,
  sameSite: "lax",
};

/**
 * Parsuje nagłówek Cookie do formatu wymaganego przez @supabase/ssr
 */
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

/**
 * Tworzy instancję klienta Supabase do użytku po stronie serwera,
 * zgodnie z dokumentacją @supabase/ssr dla Astro
 */
export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      // Implementacja getAll zamiast get/set/remove zgodnie z zaleceniami
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};

// Dla operacji wymagających uprawnień administratora
// Używamy service_role key, który pomija RLS (Row Level Security)
export const createSupabaseAdminClient = () => {
  if (!import.meta.env.SUPABASE_URL || !import.meta.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Brak wymaganych zmiennych środowiskowych dla klienta administratora Supabase");
  }

  return createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_SERVICE_ROLE_KEY, {
    cookieOptions,
    cookies: {
      getAll: () => [],
      setAll: () => {
        // Administrator nie potrzebuje zapisywać ciasteczek sesji użytkownika
        // To celowo pusta metoda, ponieważ admin działa poza kontekstem sesji użytkownika
      },
    },
  });
};
