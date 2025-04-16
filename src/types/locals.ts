import type { SupabaseClient, User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Typ reprezentujący dane dostępne w kontekście lokalnym Astro
 */
export interface AstroLocals {
  /**
   * Klient Supabase do wykonywania operacji na bazie danych
   */
  supabase: SupabaseClient;

  /**
   * Zalogowany użytkownik (null jeśli nie jest zalogowany)
   */
  user: SupabaseUser | null;
}
