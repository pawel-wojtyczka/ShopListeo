/**
 * Serwis do obsługi operacji związanych z użytkownikami
 */
import { SupabaseClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import type { UserDTO, UpdateUserRequest } from "../../types";

/**
 * Pobiera wszystkich użytkowników z bazy danych
 * @param supabase Klient Supabase
 * @param page Numer strony (indeksowany od 1)
 * @param pageSize Liczba elementów na stronę
 * @param sort Pole do sortowania (email, registrationDate)
 * @param order Kolejność sortowania (asc, desc)
 * @param emailFilter Filtr dla adresu email
 * @returns Dane użytkowników i informacje o paginacji
 */
export async function getAllUsers(
  supabase: SupabaseClient,
  page = 1,
  pageSize = 20,
  sort = "email",
  order: "asc" | "desc" = "asc",
  emailFilter?: string
) {
  // Mapowanie nazw pól do kolumn w bazie danych
  const sortMap: Record<string, string> = {
    email: "email",
    registrationDate: "registration_date",
  };

  // Określenie zakresu dla paginacji
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Budowanie zapytania
  let query = supabase.from("users").select("id, email, registration_date, last_login_date, admin", { count: "exact" });

  // Dodanie filtrowania po email, jeśli podano
  if (emailFilter) {
    query = query.ilike("email", `%${emailFilter}%`);
  }

  // Dodanie sortowania
  const sortColumn = sortMap[sort] || "email";
  query = query.order(sortColumn, { ascending: order === "asc" });

  // Wykonanie zapytania z paginacją
  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Błąd podczas pobierania użytkowników:", error);
    return { data: [], pagination: { totalItems: 0, totalPages: 0, currentPage: page, pageSize } };
  }

  // Mapowanie danych do DTO
  const userDTOs = data.map((user) => ({
    id: user.id,
    email: user.email,
    registrationDate: user.registration_date,
    lastLoginDate: user.last_login_date,
  }));

  // Obliczenie informacji o paginacji
  const totalItems = count || 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  return {
    data: userDTOs,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
    },
  };
}

/**
 * Pobiera użytkownika po ID
 * @param supabase Klient Supabase
 * @param userId ID użytkownika
 * @returns Dane użytkownika lub null jeśli nie znaleziono
 */
export async function getUserById(supabase: SupabaseClient, userId: string): Promise<UserDTO | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, registration_date, last_login_date")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("Błąd podczas pobierania użytkownika:", error);
    return null;
  }

  // Mapowanie danych do DTO
  return {
    id: data.id,
    email: data.email,
    registrationDate: data.registration_date,
    lastLoginDate: data.last_login_date,
  };
}

/**
 * Funkcja pomocnicza do sprawdzania czy email jest już używany
 * @param supabase Klient Supabase
 * @param email Adres email do sprawdzenia
 * @param userId ID użytkownika (aby wykluczyć jego własny email)
 * @returns Informacja czy email jest już zajęty
 */
export async function isEmailTaken(supabase: SupabaseClient, email: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase.from("users").select("id").eq("email", email).neq("id", userId).single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = No rows returned
    console.error("Błąd podczas sprawdzania unikalności email:", error);
    // W razie błędu lepiej uznać, że email jest zajęty
    return true;
  }

  return !!data;
}

/**
 * Funkcja pomocnicza do hashowania hasła
 * @param password Hasło w formie plaintext
 * @returns Zahashowane hasło
 */
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

/**
 * Aktualizuje dane użytkownika
 * @param supabase Klient Supabase
 * @param userId ID użytkownika
 * @param userData Dane do aktualizacji
 * @returns Zaktualizowane dane użytkownika lub null w przypadku błędu
 */
export async function updateUser(
  supabase: SupabaseClient,
  userId: string,
  userData: UpdateUserRequest
): Promise<{ id: string; email: string; updatedDate: string; passwordUpdated: boolean } | null> {
  // Przygotowanie danych do aktualizacji
  const updateData: Record<string, unknown> = {
    updated_date: new Date().toISOString(),
  };

  let passwordUpdated = false;

  // Jeśli podano email, sprawdź czy jest unikalny
  if (userData.email) {
    const emailTaken = await isEmailTaken(supabase, userData.email, userId);
    if (emailTaken) {
      throw new Error("Email jest już używany przez innego użytkownika");
    }
    updateData.email = userData.email;
  }

  // Jeśli podano hasło, zahashuj je
  if (userData.password) {
    updateData.password_hash = hashPassword(userData.password);
    passwordUpdated = true;
  }

  // Aktualizacja danych użytkownika
  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId)
    .select("id, email, updated_date")
    .single();

  if (error || !data) {
    console.error("Błąd podczas aktualizacji użytkownika:", error);
    return null;
  }

  // Zwrócenie zaktualizowanych danych
  return {
    id: data.id,
    email: data.email,
    updatedDate: data.updated_date,
    passwordUpdated,
  };
}

/**
 * Usuwa użytkownika z bazy danych
 * @param supabase Klient Supabase
 * @param userId ID użytkownika do usunięcia
 * @returns Informacja, czy usunięcie się powiodło
 */
export async function deleteUser(supabase: SupabaseClient, userId: string): Promise<boolean> {
  // Usunięcie użytkownika z bazy danych
  // Dzięki klauzuli ON DELETE CASCADE w bazie danych,
  // wszystkie powiązane rekordy zostaną automatycznie usunięte
  const { error } = await supabase.from("users").delete().eq("id", userId);

  // Zwrócenie informacji o powodzeniu operacji
  return !error;
}
