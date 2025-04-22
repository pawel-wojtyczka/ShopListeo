import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "./database.types";

// --- Server-side Admin Client (Singleton) ---

// Konfiguracja serwerowa (używa zmiennych środowiskowych bez PUBLIC_)
// Należy zapewnić, że SUPABASE_URL jest również dostępny na serwerze, jeśli nie jest ustawiony globalnie
// Zazwyczaj SUPABASE_URL jest taki sam jak PUBLIC_SUPABASE_URL
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL; // Lub import.meta.env.SUPABASE_URL jeśli jest zdefiniowany
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

// Sprawdzenie krytycznych zmiennych serwerowych
if (!supabaseUrl) {
  console.error(
    "Server-side Supabase URL is missing. Check environment variables (.env file, ensure PUBLIC_SUPABASE_URL or SUPABASE_URL is set)."
  );
  throw new Error("Supabase server configuration error: Server URL not found.");
}
if (!supabaseServiceRoleKey) {
  console.error(
    "Server-side Supabase Service Role Key is missing. Check environment variables (.env file, ensure SUPABASE_SERVICE_ROLE_KEY is set)."
  );
  throw new Error("Supabase server configuration error: Service Role Key not found.");
}

let adminClient: ReturnType<typeof createServerClient<Database>> | null = null;

function getSupabaseAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  // Atrapy funkcji cookies, ponieważ używamy klienta z kluczem service_role,
  // który omija RLS i nie polega na ciasteczkach sesji użytkownika do autoryzacji.
  const cookies = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    get: (_key: string) => undefined,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    set: (_key: string, _value: string, _options: CookieOptions) => {
      // No-op
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    remove: (_key: string, _options: CookieOptions) => {
      // No-op
    },
  };

  adminClient = createServerClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    cookies: cookies,
    // Opcjonalnie: konfiguracja przechowywania sesji, chociaż klucz serwisowy to omija
    auth: {
      persistSession: false, // Zazwyczaj false dla operacji z kluczem serwisowym
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return adminClient;
}

// Eksport funkcji pobierającej instancję klienta admina
export const supabaseAdminClient = getSupabaseAdminClient();
