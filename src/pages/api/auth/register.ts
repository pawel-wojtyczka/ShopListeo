import type { APIRoute } from "astro";
import { z } from "zod";
import { AuthService } from "@/lib/auth.service";
import { getSupabaseAdmin } from "@/db/supabase.server";

// Schema walidacji dla rejestracji
const registerSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .max(100, "Hasło może mieć maksymalnie 100 znaków"),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log("Otrzymano żądanie rejestracji");

    // Sprawdź, czy zmienne środowiskowe są ustawione
    if (!process.env.PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Brakujące zmienne środowiskowe dla Supabase");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Brak konfiguracji bazy danych. Sprawdź zmienne środowiskowe.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Pobierz dane z żądania
    const body = await request.json();

    // Walidacja danych wejściowych
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      console.log("Błąd walidacji danych:", result.error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Błędne dane wejściowe",
          errors: result.error.errors,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { email, password } = result.data;
    console.log(`Próba rejestracji dla: ${email}`);

    // Inicjalizacja klienta Supabase i usługi autoryzacji
    const supabase = getSupabaseAdmin();
    const authService = new AuthService(supabase);

    // Próba rejestracji
    try {
      const userData = await authService.registerUser({ email, password });

      console.log("Rejestracja zakończona sukcesem:", userData);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Rejestracja zakończona sukcesem",
          user: userData,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Błąd rejestracji:", error);

      // Bardziej szczegółowe komunikaty błędów
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes("connect to database")) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Nie można połączyć się z bazą danych. Sprawdź konfigurację serwera.",
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Sprawdź, czy użytkownik już istnieje
      if (errorMessage.includes("already exists") || errorMessage.includes("already registered")) {
        return new Response(
          JSON.stringify({
            success: false,
            message: "Użytkownik z tym adresem email już istnieje",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: `Błąd rejestracji: ${errorMessage || "Nieznany błąd"}`,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Nieoczekiwany błąd podczas rejestracji:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Wystąpił nieoczekiwany błąd podczas rejestracji",
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
