import type { SupabaseClient } from "@supabase/supabase-js";
import type { LoginUserRequest, RegisterUserRequest, LoginUserResponse, RegisterUserResponse } from "../types";

/**
 * Serwis obsługujący operacje autoryzacji użytkowników
 */
export class AuthService {
  private supabase: SupabaseClient;

  /**
   * Tworzy nową instancję serwisu autoryzacji
   * @param supabaseClient Klient Supabase do wykonywania operacji na bazie danych
   */
  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Sprawdza czy użytkownik o podanym adresie email istnieje w systemie
   * @param email Adres email do sprawdzenia
   * @returns true jeśli użytkownik istnieje, false w przeciwnym przypadku
   */
  async userExistsByEmail(email: string): Promise<boolean> {
    const { data, error } = await this.supabase.from("users").select("id").eq("email", email).maybeSingle();

    if (error) {
      console.error("Błąd podczas sprawdzania istnienia użytkownika:", error);
      throw new Error(`Nie można sprawdzić czy użytkownik istnieje: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Rejestruje nowego użytkownika w systemie
   * @param userData Dane rejestracyjne użytkownika
   * @returns Dane zarejestrowanego użytkownika wraz z tokenem
   */
  async registerUser(userData: RegisterUserRequest): Promise<RegisterUserResponse> {
    const { email, password } = userData;

    // Sprawdzenie czy użytkownik istnieje
    const userExists = await this.userExistsByEmail(email);
    if (userExists) {
      throw new Error("Użytkownik o podanym adresie email już istnieje");
    }

    // Rejestracja użytkownika za pomocą Supabase Auth
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error("Błąd podczas rejestracji użytkownika w Supabase Auth:", authError);
      throw new Error(`Nie udało się utworzyć konta użytkownika: ${authError?.message || "Nieznany błąd"}`);
    }

    // Pobranie tokenu sesji
    const { data: sessionData, error: sessionError } = await this.supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
      console.error("Błąd podczas pobierania sesji:", sessionError);
      throw new Error(`Nie udało się utworzyć sesji użytkownika: ${sessionError?.message || "Nieznany błąd"}`);
    }

    const token = sessionData.session.access_token;
    const userId = authData.user.id;
    const registrationDate = new Date().toISOString();

    // Zapisanie dodatkowych danych użytkownika w tabeli users
    const { error: insertError } = await this.supabase.from("users").insert({
      id: userId,
      email,
      registration_date: registrationDate,
      password_hash: "Zarządzane przez Supabase Auth", // Hasło jest zarządzane przez Supabase Auth
    });

    if (insertError) {
      console.error("Błąd podczas zapisywania danych użytkownika:", insertError);
      // Kontynuujemy mimo błędu zapisu, ponieważ konto Auth zostało już utworzone
    }

    // Zwrócenie informacji o utworzonym użytkowniku wraz z tokenem
    return {
      id: userId,
      email,
      registrationDate,
      token,
    };
  }

  /**
   * Loguje użytkownika do systemu
   * @param credentials Dane uwierzytelniające użytkownika
   * @returns Dane zalogowanego użytkownika wraz z tokenem
   */
  async loginUser(credentials: LoginUserRequest): Promise<LoginUserResponse> {
    const { email, password } = credentials;

    // Logowanie użytkownika przy użyciu Supabase Auth
    const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user || !authData.session) {
      console.error("Błąd podczas logowania użytkownika:", authError);
      throw new Error("Nieprawidłowy email lub hasło");
    }

    const userId = authData.user.id;
    const token = authData.session.access_token;
    const currentDateTime = new Date().toISOString();

    // Aktualizacja pola last_login_date w tabeli users
    const { error: updateError } = await this.supabase
      .from("users")
      .update({ last_login_date: currentDateTime })
      .eq("id", userId);

    if (updateError) {
      console.error("Błąd podczas aktualizacji daty ostatniego logowania:", updateError);
      // Nie przerywamy procesu logowania z powodu błędu aktualizacji daty
    }

    // Zwrócenie odpowiedzi z danymi użytkownika i tokenem
    return {
      id: userId,
      email,
      token,
    };
  }
}
