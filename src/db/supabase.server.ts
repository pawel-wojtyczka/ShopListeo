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
export const createSupabaseServerInstance = (options: {
  supabaseUrl: string;
  supabaseKey: string;
  headers: Headers;
  cookies: AstroCookies;
}) => {
  const supabase = createServerClient<Database>(options.supabaseUrl, options.supabaseKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(options.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options: cookieOpts }) => options.cookies.set(name, value, cookieOpts));
      },
    },
  });

  return supabase;
};

// Dla operacji wymagających uprawnień administratora
// Używamy service_role key, który pomija RLS (Row Level Security)
export const createSupabaseAdminClient = (options: { supabaseUrl: string; supabaseKey: string }) => {
  // Używamy przekazanych argumentów
  return createServerClient<Database>(options.supabaseUrl, options.supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    cookies: {
      getAll: () => [],
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      setAll: () => {}, // Pusta implementacja jest celowa dla klienta admina
    },
  });
};
