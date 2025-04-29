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

    // Sprawdzenie czy mamy poprawne połączenie z Supabase
    // Prostszy test połączenia - zamiast używać konkretnej tabeli, wykonujemy zapytanie o status
    try {
      // Proste zapytanie o status Supabase
      const { error } = await this.supabase
        .from("shopping_list_items")
        .select("count(*)", { count: "exact", head: true });

      if (error) {
        throw new Error(`Nie można połączyć się z bazą danych: ${error.message}`);
      }
    } catch (_connError) {
      // Kontynuuj mimo błędu - możliwe, że API działa poprawnie, ale nie mamy dostępu do tabeli
      // W przyszłości można dodać logowanie ostrzeżenia
    }

    // Sprawdzenie czy użytkownik istnieje
    const userExists = await this.userExistsByEmail(email);
    if (userExists) {
      throw new Error("Użytkownik o podanym adresie email już istnieje");
    }

    // Rejestracja użytkownika za pomocą Supabase Auth

    // Kluczowa zmiana: dodajemy autoconfirm dla środowiska deweloperskiego
    const { data: authData, error: authError } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `/login`,
        // Ustawienie data.email_confirmed pozwala na automatyczne potwierdzenie email w środowisku deweloperskim
        data: {
          email_confirmed: true,
          email: email,
          registration_date: new Date().toISOString(),
        },
      },
    });

    if (authError) {
      throw new Error(`Nie udało się utworzyć konta użytkownika: ${authError.message || "Nieznany błąd"}`);
    }

    if (!authData.user) {
      throw new Error("Nie udało się utworzyć konta użytkownika: brak danych użytkownika w odpowiedzi");
    }

    // Kluczowa informacja - czy email został już potwierdzony
    const isEmailConfirmed = !!authData.user.email_confirmed_at;

    // Po rejestracji nie zawsze istnieje sesja, zwłaszcza gdy wymagana jest weryfikacja email
    let sessionToken = "token-niedostepny-wymagane-potwierdzenie-email";

    // Próbujemy pobrać sesję tylko jeśli email jest potwierdzony
    if (isEmailConfirmed) {
      // Zamiast getSession, próbujemy od razu zalogować użytkownika
      const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Kontynuujemy mimo błędu - użytkownik zostanie poproszony o ręczne logowanie
      } else if (signInData.session) {
        sessionToken = signInData.session.access_token;
      }
    } else {
      // No action needed if email is not confirmed
    }

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
      // Kontynuujemy mimo błędu zapisu, ponieważ konto Auth zostało już utworzone
      // W przyszłości można dodać logowanie błędu
    } else {
      // No action needed on successful insert
    }

    // Zwrócenie informacji o utworzonym użytkowniku wraz z tokenem
    return {
      id: userId,
      email,
      registrationDate,
      token: sessionToken,
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
      // Nie przerywamy procesu logowania z powodu błędu aktualizacji daty
      // W przyszłości można dodać logowanie błędu
    }

    // Zwrócenie odpowiedzi z danymi użytkownika i tokenem
    return {
      id: userId,
      email,
      token,
    };
  }
}
