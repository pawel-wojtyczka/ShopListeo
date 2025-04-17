import { z } from "zod";
import type { APIRoute } from "astro";
import type { LoginUserRequest } from "../../../types";
import { AuthService } from "../../../lib/auth.service";

// Schemat walidacji Zod dla logowania
const loginUserSchema = z.object({
  email: z.string().email({ message: "Podaj poprawny adres email" }),
  password: z.string().min(1, { message: "Podaj hasło" }),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Pobieranie danych z żądania
    const requestData = (await request.json()) as LoginUserRequest;

    // Walidacja danych wejściowych
    const validationResult = loginUserSchema.safeParse(requestData);

    if (!validationResult.success) {
      // Błąd walidacji - zwróć odpowiedni komunikat błędu
      const errorDetails = validationResult.error.errors.map((err) => err.message);
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane logowania",
          details: errorDetails,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Pobieranie klienta Supabase z kontekstu
    const supabase = locals.supabase;

    // Utworzenie instancji serwisu autentykacji
    const authService = new AuthService(supabase);

    // Logowanie użytkownika przy użyciu serwisu
    try {
      const loginResponse = await authService.loginUser(validationResult.data);

      // Zwrócenie informacji o zalogowanym użytkowniku
      return new Response(JSON.stringify(loginResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      // Obsługa błędów z warstwy serwisowej
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Nieznany błąd logowania";

      // Dla błędów uwierzytelniania zwróć 401 Unauthorized
      if (errorMessage.includes("Nieprawidłowy email lub hasło")) {
        return new Response(
          JSON.stringify({
            error: errorMessage,
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Dla pozostałych błędów serwisowych zwróć 500 Internal Server Error
      return new Response(
        JSON.stringify({
          error: errorMessage,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Błąd podczas logowania użytkownika:", error);

    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas przetwarzania żądania logowania",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
