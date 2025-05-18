/**
 * Endpoint GET /api/users - pobieranie wszystkich użytkowników
 * Dostępny tylko dla administratorów
 */
import type { APIRoute } from "astro";
import { getAllUsers } from "../../../lib/services/userService";
import { isUserAdmin } from "../../../lib/auth/adminAuth";
import { getAllUsersQuerySchema } from "../../../lib/schemas/userSchemas";
import type { AstroLocals } from "../../../types/locals";

export const GET: APIRoute = async ({ request, locals }) => {
  const isDevelopment = process.env.NODE_ENV === "development";
  // const endpointName = "GET /api/users"; // Usunięto nieużywaną zmienną

  if (isDevelopment) {
    // W przyszłości można dodać logowanie dla trybu deweloperskiego
  }

  try {
    // Pobieranie użytkownika z kontekstu
    const { user, supabase } = locals as AstroLocals;
    const currentUserId = user?.id;

    // Sprawdzenie czy użytkownik jest zalogowany
    if (!currentUserId) {
      return new Response(JSON.stringify({ error: "Brak autoryzacji" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sprawdzenie uprawnień administratora
    const isAdmin = await isUserAdmin(supabase, currentUserId, isDevelopment);

    if (isDevelopment) {
      // W przyszłości można dodać logowanie dla trybu deweloperskiego
    }

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Brak uprawnień administratora" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Pobieranie i walidacja parametrów zapytania
    const url = new URL(request.url);
    const params = {
      page: url.searchParams.get("page"),
      pageSize: url.searchParams.get("pageSize"),
      sort: url.searchParams.get("sort"),
      order: url.searchParams.get("order"),
      emailFilter: url.searchParams.get("emailFilter"),
    };

    // Walidacja parametrów zapytania
    const validationResult = getAllUsersQuerySchema.safeParse({
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
      order: params.order,
      emailFilter: params.emailFilter,
    });

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe parametry zapytania",
          details: validationResult.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validParams = validationResult.data;

    // Pobieranie danych użytkowników
    const result = await getAllUsers(
      supabase,
      validParams.page,
      validParams.pageSize,
      validParams.sort,
      validParams.order,
      validParams.emailFilter || undefined,
      isDevelopment
    );

    // Zwrócenie odpowiedzi
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas przetwarzania żądania",
        message: error instanceof Error ? error.message : "Nieznany błąd",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
