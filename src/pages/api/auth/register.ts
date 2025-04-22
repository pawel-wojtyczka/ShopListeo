import type { APIRoute } from "astro";
import { z } from "zod";
import type { AstroLocals } from "src/types/locals";
import type { RegisterUserResponse } from "src/types";

export const prerender = false;

// Schema do walidacji danych wejściowych
const RegisterSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email."),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków."),
});

export const POST: APIRoute = async ({ request, locals }) => {
  // Sprawdzanie dostępności klienta Supabase
  const supabase = (locals as AstroLocals)?.supabase;
  if (!supabase) {
    console.error("API /auth/register: Supabase client not found in locals");
    return new Response(JSON.stringify({ message: "Błąd serwera - brak połączenia z usługą autoryzacji." }), {
      status: 500,
    });
  }

  // Pobieranie i parsowanie danych JSON z żądania
  let requestData;
  try {
    requestData = await request.json();
  } catch (error) {
    console.error("API /auth/register: Invalid JSON", error);
    return new Response(JSON.stringify({ message: "Nieprawidłowy format danych." }), { status: 400 });
  }

  // Walidacja danych wejściowych
  const validationResult = RegisterSchema.safeParse(requestData);
  if (!validationResult.success) {
    const formattedErrors = validationResult.error.format();
    console.error("API /auth/register: Validation error", formattedErrors);
    return new Response(
      JSON.stringify({
        message: "Błąd walidacji danych.",
        errors: formattedErrors,
      }),
      { status: 400 }
    );
  }

  const { email, password } = validationResult.data;
  console.log(`API /auth/register: Registration attempt for ${email}`);

  try {
    // Rejestracja nowego użytkownika przez Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Opcja auto-potwierdzenia emaila w środowisku deweloperskim
        emailRedirectTo: `${new URL(request.url).origin}/login`,
        data: {
          email_confirmed: !import.meta.env.PROD, // Auto-potwierdzenie tylko w dev
          registration_date: new Date().toISOString(),
        },
      },
    });

    // Obsługa błędu rejestracji
    if (error) {
      console.error("API /auth/register: Supabase auth error", error);

      // Sprawdzanie typowych błędów
      if (error.message.includes("already registered")) {
        return new Response(JSON.stringify({ message: "Użytkownik z tym adresem email już istnieje." }), {
          status: 400,
        });
      }

      return new Response(JSON.stringify({ message: `Błąd rejestracji: ${error.message}` }), { status: 400 });
    }

    // Sprawdzenie czy mamy poprawne dane użytkownika
    if (!data.user) {
      console.error("API /auth/register: Missing user data");
      return new Response(JSON.stringify({ message: "Błąd rejestracji - brak danych użytkownika." }), { status: 500 });
    }

    console.log(`API /auth/register: Registration successful for user: ${data.user.email}`);

    // Po pomyślnej rejestracji automatycznie logujemy użytkownika
    let sessionToken = "";
    if (!import.meta.env.PROD && data.user.email) {
      console.log("API /auth/register: Auto-login after registration (dev mode)");
      const { data: loginData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("API /auth/register: Auto-login failed", signInError);
      } else {
        console.log("API /auth/register: Auto-login successful");
        sessionToken = loginData.session?.access_token || "";
      }
    }

    // Przygotowanie odpowiedzi
    const responseBody: RegisterUserResponse = {
      id: data.user.id,
      email: data.user.email || "",
      registrationDate: data.user.created_at || new Date().toISOString(),
      token: sessionToken || data.session?.access_token || "",
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API /auth/register: Unexpected error during registration", error);
    return new Response(JSON.stringify({ message: "Wystąpił nieoczekiwany błąd podczas rejestracji." }), {
      status: 500,
    });
  }
};
