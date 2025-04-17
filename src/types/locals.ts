import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Database } from "../db/database.types";
import type { SupabaseClient as SupabaseClientGeneric } from "@supabase/supabase-js";
import type { UserDTO } from "../types";

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
   * Zalogowany użytkownik z Supabase (null jeśli nie jest zalogowany)
   */
  user: SupabaseUser | null;

  /**
   * Zalogowany użytkownik w formacie UserDTO (null jeśli nie jest zalogowany)
   */
  authUser?: UserDTO | null;

  /**
   * Informacja czy użytkownik jest zalogowany
   */
  isAuthenticated?: boolean;
}
