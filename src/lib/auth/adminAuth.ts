/**
 * Funkcje pomocnicze do sprawdzania uprawnień administratora
 */
import { SupabaseClient } from "@supabase/supabase-js";

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
  const { data, error } = await supabase.from("users").select("admin").eq("id", userId).single();

  if (error || !data) {
    console.error("Błąd podczas sprawdzania uprawnień administratora:", error);
    return false;
  }

  return data.admin === true;
}
