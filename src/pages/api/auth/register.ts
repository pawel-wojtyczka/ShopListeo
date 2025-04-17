import { z } from "zod";
import type { APIRoute } from "astro";
import type { RegisterUserRequest } from "../../../types";
import { AuthService } from "../../../lib/auth.service";

// Schemat walidacji Zod dla rejestracji
const registerUserSchema = z.object({
  email: z.string().email({ message: "Podaj poprawny adres email" }),
  password: z
    .string()
    .min(8, { message: "Hasło musi zawierać co najmniej 8 znaków" })
    .regex(/.*[A-Z].*/, { message: "Hasło musi zawierać co najmniej jedną wielką literę" })
    .regex(/.*[a-z].*/, { message: "Hasło musi zawierać co najmniej jedną małą literę" })
    .regex(/.*\d.*/, { message: "Hasło musi zawierać co najmniej jedną cyfrę" })
    .regex(/.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-].*/, {
      message: "Hasło musi zawierać co najmniej jeden znak specjalny",
    }),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Pobieranie danych z żądania
    const requestData = (await request.json()) as RegisterUserRequest;

    // Walidacja danych wejściowych
    const validationResult = registerUserSchema.safeParse(requestData);

    if (!validationResult.success) {
      // Błąd walidacji - zwróć odpowiedni komunikat błędu
      const errorDetails = validationResult.error.errors.map((err) => err.message);
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane rejestracji",
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

    // Rejestracja użytkownika przy użyciu serwisu
    try {
      const registerResponse = await authService.registerUser(validationResult.data);

      // Zwrócenie informacji o utworzonym użytkowniku
      return new Response(JSON.stringify(registerResponse), {
        status: 201, // Created
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      // Obsługa błędów z warstwy serwisowej
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Nieznany błąd rejestracji";

      // Jeśli błąd dotyczy istniejącego użytkownika, zwróć 409 Conflict
      if (errorMessage.includes("już istnieje")) {
        return new Response(
          JSON.stringify({
            error: errorMessage,
          }),
          {
            status: 409,
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
    console.error("Błąd podczas rejestracji użytkownika:", error);

    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas przetwarzania żądania rejestracji",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
