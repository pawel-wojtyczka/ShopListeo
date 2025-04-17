import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Database } from "../db/database.types";
import type { SupabaseClient as SupabaseClientGeneric } from "@supabase/supabase-js";

// Definiujemy typ SupabaseClient z naszą typowaną bazą danych
type SupabaseClient = SupabaseClientGeneric<Database>;

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
