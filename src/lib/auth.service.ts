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
    console.log(`AuthService: Rejestracja użytkownika z email: ${email}`);

    // Sprawdzenie czy mamy poprawne połączenie z Supabase
    try {
      // Prostszy test połączenia - zamiast używać konkretnej tabeli, wykonujemy zapytanie o status
      try {
        // Proste zapytanie o status Supabase
        const { error } = await this.supabase
          .from("shopping_list_items")
          .select("count(*)", { count: "exact", head: true });

        if (error) {
          console.error("AuthService: Błąd połączenia z Supabase:", error);
          throw new Error(`Nie można połączyć się z bazą danych: ${error.message}`);
        }

        console.log("AuthService: Połączenie z Supabase nawiązane pomyślnie");
      } catch (connError) {
        console.error("AuthService: Błąd testowania połączenia:", connError);
        // Kontynuuj mimo błędu - możliwe, że API działa poprawnie, ale nie mamy dostępu do tabeli
      }

      // Sprawdzenie czy użytkownik istnieje
      const userExists = await this.userExistsByEmail(email);
      if (userExists) {
        console.log(`AuthService: Użytkownik ${email} już istnieje`);
        throw new Error("Użytkownik o podanym adresie email już istnieje");
      }

      console.log("AuthService: Użytkownik nie istnieje, kontynuuję rejestrację");

      // Rejestracja użytkownika za pomocą Supabase Auth
      console.log("AuthService: Wywołuję supabase.auth.signUp...");

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

      // Pełniejsze logowanie wyników
      console.log("AuthService: Wynik signUp:", {
        success: !authError,
        userId: authData?.user?.id,
        userEmail: authData?.user?.email,
        userCreatedAt: authData?.user?.created_at,
        identities: authData?.user?.identities,
        emailConfirmed: authData?.user?.email_confirmed_at,
        error: authError?.message || null,
        errorStatus: authError?.status || null,
      });

      if (authError) {
        console.error("Błąd podczas rejestracji użytkownika w Supabase Auth:", authError);
        throw new Error(`Nie udało się utworzyć konta użytkownika: ${authError.message || "Nieznany błąd"}`);
      }

      if (!authData.user) {
        console.error("Brak danych użytkownika po rejestracji w Supabase Auth.");
        throw new Error("Nie udało się utworzyć konta użytkownika: brak danych użytkownika w odpowiedzi");
      }

      // Kluczowa informacja - czy email został już potwierdzony
      const isEmailConfirmed = !!authData.user.email_confirmed_at;
      console.log(`AuthService: Stan potwierdzenia email: ${isEmailConfirmed ? "potwierdzony" : "niepotwierdzony"}`);

      // Po rejestracji nie zawsze istnieje sesja, zwłaszcza gdy wymagana jest weryfikacja email
      let sessionToken = "token-niedostepny-wymagane-potwierdzenie-email";

      // Próbujemy pobrać sesję tylko jeśli email jest potwierdzony
      if (isEmailConfirmed) {
        console.log("AuthService: Email potwierdzony, próbuję zalogować użytkownika...");
        // Zamiast getSession, próbujemy od razu zalogować użytkownika
        const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.warn("AuthService: Błąd logowania po rejestracji:", signInError);
          // Kontynuujemy mimo błędu - użytkownik zostanie poproszony o ręczne logowanie
        } else if (signInData.session) {
          console.log("AuthService: Pomyślnie zalogowano po rejestracji");
          sessionToken = signInData.session.access_token;
        }
      } else {
        console.log("AuthService: Email nie jest potwierdzony, użytkownik będzie musiał go potwierdzić");
      }

      const userId = authData.user.id;
      const registrationDate = new Date().toISOString();

      console.log(`AuthService: Pomyślnie utworzono konto dla ${email} z id=${userId}`);

      // Zapisanie dodatkowych danych użytkownika w tabeli users
      console.log("AuthService: Zapisywanie dodatkowych danych użytkownika w tabeli users");
      const { error: insertError } = await this.supabase.from("users").insert({
        id: userId,
        email,
        registration_date: registrationDate,
        password_hash: "Zarządzane przez Supabase Auth", // Hasło jest zarządzane przez Supabase Auth
      });

      if (insertError) {
        console.error("Błąd podczas zapisywania danych użytkownika:", insertError);
        console.error("Szczegóły błędu:", insertError.details, insertError.hint, insertError.code);
        // Kontynuujemy mimo błędu zapisu, ponieważ konto Auth zostało już utworzone
      } else {
        console.log("AuthService: Pomyślnie zapisano dane użytkownika w tabeli users");
      }

      // Zwrócenie informacji o utworzonym użytkowniku wraz z tokenem
      return {
        id: userId,
        email,
        registrationDate,
        token: sessionToken,
      };
    } catch (error) {
      console.error("AuthService: Błąd w procesie rejestracji:", error);
      throw error; // Przekazujemy błąd dalej
    }
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
