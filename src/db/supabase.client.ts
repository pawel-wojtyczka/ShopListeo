import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Client-side configuration
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Client-side Supabase URL or Anon Key is missing. Check environment variables (.env file and PUBLIC_ prefix)."
  );
  throw new Error("Supabase client configuration error: Client URL or Anon Key not found.");
}

// Create a singleton instance of the browser client
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Zwraca instancję klienta Supabase do użytku po stronie przeglądarki
 * Implementacja wzorca singleton zapobiega tworzeniu wielu instancji
 */
export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }
  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

// Export the singleton instance
export const supabaseClient = getSupabaseBrowserClient();

// Server-side admin client logic has been moved to supabase.server.ts
