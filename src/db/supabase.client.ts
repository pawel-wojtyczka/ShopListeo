import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Client-side configuration
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// --- Client-side Client (Singleton) ---
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Client-side Supabase URL or Anon Key is missing. Check environment variables (.env file and PUBLIC_ prefix)."
  );
  throw new Error("Supabase client configuration error: Client URL or Anon Key not found.");
}

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }
  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

export const supabaseClient = getSupabaseBrowserClient();

// Server-side admin client logic has been moved to supabase.server.ts
