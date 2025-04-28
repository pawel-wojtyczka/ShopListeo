import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Klient Supabase z uprawnieniami administratora dla operacji wymagających wyższych uprawnień
export const supabaseAdmin = createClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);
