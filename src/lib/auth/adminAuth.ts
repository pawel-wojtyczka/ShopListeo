/**
 * Funkcje pomocnicze do sprawdzania uprawnień administratora
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";

// Definiujemy typ SupabaseClient lokalnie
type SupabaseClient = ReturnType<typeof createClient<Database>>;

/**
 * Sprawdza, czy użytkownik ma uprawnienia administratora
 * @param supabase Klient Supabase
 * @param userId ID użytkownika
 * @param isDevelopment Czy aplikacja działa w trybie deweloperskim
 * @returns Informacja, czy użytkownik ma uprawnienia administratora
 */
export async function isUserAdmin(supabase: SupabaseClient, userId: string, isDevelopment = false): Promise<boolean> {
  // W trybie deweloperskim wszyscy użytkownicy mają uprawnienia administratora
  if (isDevelopment) {
    console.log(`🔧 Tryb deweloperski: użytkownik ${userId} ma automatyczne uprawnienia administratora`);
    return true;
  }

  // W trybie produkcyjnym sprawdzamy uprawnienia w bazie danych
  try {
    // Ponieważ kolumna 'admin' nie istnieje w tabeli 'users',
    // pobieramy użytkownika po ID i sprawdzamy czy jest administratorem
    // Na tę chwilę w trybie produkcyjnym tylko określone ID użytkowników są administratorami
    const { data, error } = await supabase.from("users").select("id").eq("id", userId).single();

    if (error || !data) {
      console.error("Błąd podczas sprawdzania uprawnień administratora:", error);
      return false;
    }

    // Lista ID użytkowników z uprawnieniami administratora
    const adminUserIds = ["4e0a9b6a-b416-48e6-8d35-5700bd1d674a"]; // ID deweloperskie jako przykład
    return adminUserIds.includes(data.id);
  } catch (error) {
    console.error("Wyjątek podczas sprawdzania uprawnień administratora:", error);
    return false;
  }
}
