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
  const validationResult = RegisterSchema.safeParse(requestData);
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
    // Rejestracja nowego użytkownika przez Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Opcja auto-potwierdzenia emaila w środowisku deweloperskim
        emailRedirectTo: `${new URL(request.url).origin}/login`,
        data: {
          // Auto-potwierdzenie tylko w dev
          email_confirmed: process.env.NODE_ENV !== "production",
          registration_date: new Date().toISOString(),
        },
      },
    });

    // Obsługa błędu rejestracji
    if (error) {
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
      return new Response(JSON.stringify({ message: "Błąd rejestracji - brak danych użytkownika." }), { status: 500 });
    }

    // Po pomyślnej rejestracji automatycznie logujemy użytkownika, aby ustawić ciasteczka sesji
    if (process.env.NODE_ENV !== "production" && data.user.email) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Kontynuujemy mimo błędu auto-logowania, rejestracja się powiodła
      } else {
        // Nie potrzebujemy już tokenu z loginData.session?.access_token
      }
    }

    // Przygotowanie odpowiedzi - usunięto zwracanie tokenu
    const responseBody: Omit<RegisterUserResponse, "token"> = {
      id: data.user.id,
      email: data.user.email || "",
      registrationDate: data.user.created_at || new Date().toISOString(),
      // token: sessionToken || data.session?.access_token || "", // Token nie jest już zwracany
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (_error) {
    // Globalna obsługa błędów
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};
