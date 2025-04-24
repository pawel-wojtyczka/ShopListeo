import type { APIRoute } from "astro";
import { z } from "zod";
import type { AstroLocals } from "src/types/locals";
import type { LoginUserResponse } from "src/types";

export const prerender = false;

// Schema do walidacji danych wejściowych
const LoginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email."),
  password: z.string().min(1, "Hasło jest wymagane."),
  rememberMe: z.boolean().optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  // Sprawdzanie dostępności klienta Supabase
  const supabase = (locals as AstroLocals)?.supabase;
  if (!supabase) {
    console.error("API /auth/login: Supabase client not found in locals");
    return new Response(JSON.stringify({ message: "Błąd serwera - brak połączenia z usługą autoryzacji." }), {
      status: 500,
    });
  }

  // Pobieranie i parsowanie danych JSON z żądania
  let requestData;
  try {
    requestData = await request.json();
  } catch (error) {
    console.error("API /auth/login: Invalid JSON", error);
    return new Response(JSON.stringify({ message: "Nieprawidłowy format danych." }), { status: 400 });
  }

  // Walidacja danych wejściowych
  const validationResult = LoginSchema.safeParse(requestData);
  if (!validationResult.success) {
    const formattedErrors = validationResult.error.format();
    console.error("API /auth/login: Validation error", formattedErrors);
    return new Response(
      JSON.stringify({
        message: "Błąd walidacji danych.",
        errors: formattedErrors,
      }),
      { status: 400 }
    );
  }

  const { email, password } = validationResult.data;
  console.log(`API /auth/login: Login attempt for ${email}`);

  try {
    // Próba logowania przez Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Obsługa błędu logowania
    if (error) {
      console.error("API /auth/login: Supabase auth error", error);

      // Zwracamy ogólny komunikat dla bezpieczeństwa
      return new Response(JSON.stringify({ message: "Nieprawidłowy email lub hasło." }), { status: 401 });
    }

    // Sprawdzenie czy mamy poprawne dane użytkownika i sesji
    if (!data.user || !data.session) {
      console.error("API /auth/login: Missing user or session data");
      return new Response(JSON.stringify({ message: "Błąd autoryzacji - brak danych użytkownika." }), { status: 500 });
    }

    // Logowanie pomyślne - budujemy odpowiedź
    console.log(`API /auth/login: Login successful for user: ${data.user.email}`);

    // Przygotowanie odpowiedzi - usunięto zwracanie tokenu
    const responseBody: Omit<LoginUserResponse, "token"> = {
      id: data.user.id,
      email: data.user.email || "",
      // token: data.session.access_token, // Token nie jest już zwracany
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API /auth/login: Unexpected error during login", error);
    return new Response(JSON.stringify({ message: "Wystąpił nieoczekiwany błąd podczas logowania." }), { status: 500 });
  }
};
