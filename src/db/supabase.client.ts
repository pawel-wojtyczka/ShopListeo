import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Use public environment variables for the client-side client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Check if the variables are loaded correctly
if (!supabaseUrl || !supabaseAnonKey) {
  // In development, you might want to throw a more specific error
  // In production, you might log this error without exposing details to the client
  console.error(
    "Client-side Supabase URL or Anon Key is missing. Check environment variables (.env file and PUBLIC_ prefix)."
  );
  // Depending on the context, you might throw an error or handle this case gracefully
  // For now, we'll throw an error during initialization to make the issue obvious
  throw new Error("Supabase client configuration error: URL or Anon Key not found.");
}

// Create a singleton instance of the Supabase client for the browser
// It will automatically handle cookies
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

  return browserClient;
}

// Export the function to get the client instance
export const supabaseClient = getSupabaseBrowserClient();
