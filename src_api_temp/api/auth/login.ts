import type { APIRoute } from "astro";
import { z } from "zod";
import type { AstroLocals } from "src/types/locals";
import type { LoginUserResponse } from "src/types";

export const prerender = false;

// Schema do walidacji danych wejściowych
export const LoginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email."),
  password: z.string().nonempty("Hasło jest wymagane."),
  rememberMe: z.boolean().optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  // Sprawdzanie dostępności klienta Supabase
  const supabase = (locals as AstroLocals)?.supabase;
  if (!supabase) {
    return new Response(JSON.stringify({ message: "Błąd serwera - brak połączenia z usługą autoryzacji." }), {
      status: 500,
    });
  }

  // Pobieranie i parsowanie danych JSON z żądania
  let requestData;
  try {
    requestData = await request.json();
  } catch (_error) {
    return new Response(JSON.stringify({ message: "Invalid JSON" }), { status: 400 });
  }

  // Walidacja danych wejściowych
  const validationResult = LoginSchema.safeParse(requestData);
  if (!validationResult.success) {
    const formattedErrors = validationResult.error.format();
    return new Response(
      JSON.stringify({
        message: "Błąd walidacji danych.",
        errors: formattedErrors,
      }),
      { status: 400 }
    );
  }

  const { email, password } = validationResult.data;

  try {
    // Próba logowania przez Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Obsługa błędu logowania
    if (error) {
      // Zwracamy ogólny komunikat dla bezpieczeństwa
      return new Response(JSON.stringify({ message: "Nieprawidłowy email lub hasło." }), { status: 401 });
    }

    // Sprawdzenie czy mamy poprawne dane użytkownika i sesji
    if (!data.user || !data.session) {
      return new Response(JSON.stringify({ message: "Błąd autoryzacji - brak danych użytkownika." }), { status: 500 });
    }

    // Logowanie pomyślne - budujemy odpowiedź

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
  } catch (_error) {
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};
