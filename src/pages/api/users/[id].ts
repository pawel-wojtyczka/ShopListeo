/**
 * Endpointy do zarządzania pojedynczym użytkownikiem:
 * GET /api/users/{id} - pobieranie użytkownika
 * PUT /api/users/{id} - aktualizacja użytkownika
 * DELETE /api/users/{id} - usuwanie użytkownika
 */
import type { APIRoute } from "astro";
import { getUserById, updateUser, deleteUser } from "../../../lib/services/userService";
import { isUserAdmin } from "../../../lib/auth/adminAuth";
import { userIdSchema, updateUserSchema } from "../../../lib/schemas/userSchemas";
import type { AstroLocals } from "../../../types/locals";

/**
 * Endpoint GET /api/users/{id} - pobieranie użytkownika według ID
 * Użytkownik może pobrać własne dane lub administrator może pobrać dane dowolnego użytkownika
 */
export const GET: APIRoute = async ({ params, locals }) => {
  const isDevelopment = process.env.NODE_ENV === "development";

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

    // Walidacja parametru id
    const userId = params.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Brak ID użytkownika" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validationResult = userIdSchema.safeParse(userId);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format ID użytkownika",
          details: validationResult.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sprawdzenie czy użytkownik ma uprawnienia
    const isAdmin = await isUserAdmin(supabase, currentUserId, isDevelopment);
    const isSelfAccess = currentUserId === userId;

    if (!isAdmin && !isSelfAccess) {
      return new Response(JSON.stringify({ error: "Brak uprawnień" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Pobieranie danych użytkownika
    const userData = await getUserById(supabase, userId, isDevelopment);

    if (!userData) {
      return new Response(JSON.stringify({ error: "Użytkownik nie został znaleziony" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Zwrócenie odpowiedzi
    return new Response(JSON.stringify(userData), {
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

/**
 * Endpoint PUT /api/users/{id} - aktualizacja użytkownika
 * Użytkownik może aktualizować własne dane lub administrator może aktualizować dane dowolnego użytkownika
 */
export const PUT: APIRoute = async ({ params, request, locals }) => {
  const isDevelopment = process.env.NODE_ENV === "development";

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

    // Walidacja parametru ID
    const { id } = params;
    const idValidation = userIdSchema.safeParse(id);

    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format ID użytkownika",
          details: idValidation.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const targetUserId = idValidation.data;

    // Sprawdzenie autoryzacji:
    // 1. Użytkownik zawsze może aktualizować własne dane
    // 2. Administrator może aktualizować dane dowolnego użytkownika
    const isOwnData = currentUserId === targetUserId;
    const isAdmin = await isUserAdmin(supabase, currentUserId, isDevelopment);

    if (!isOwnData && !isAdmin) {
      return new Response(JSON.stringify({ error: "Brak uprawnień do aktualizacji danych tego użytkownika" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sprawdzenie czy użytkownik istnieje
    const existingUser = await getUserById(supabase, targetUserId);
    if (!existingUser) {
      return new Response(JSON.stringify({ error: "Nie znaleziono użytkownika o podanym ID" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Walidacja danych wejściowych
    const requestBody = await request.json().catch(() => ({}));
    const validationResult = updateUserSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane aktualizacji",
          details: validationResult.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const updateData = validationResult.data;

    // Aktualizacja danych użytkownika
    try {
      const updatedUser = await updateUser(supabase, targetUserId, updateData);

      if (!updatedUser) {
        return new Response(JSON.stringify({ error: "Nie udało się zaktualizować użytkownika" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Zwrócenie odpowiedzi
      return new Response(JSON.stringify(updatedUser), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // Obsługa konfliktu adresu email
      if (error instanceof Error && error.message.includes("Email jest już używany")) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 409,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw error;
    }
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

/**
 * Endpoint DELETE /api/users/{id} - usuwanie użytkownika
 * Użytkownik może usunąć swoje konto lub administrator może usunąć konto dowolnego użytkownika
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  const isDevelopment = process.env.NODE_ENV === "development";

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

    // Walidacja parametru ID
    const { id } = params;
    const idValidation = userIdSchema.safeParse(id);

    if (!idValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format ID użytkownika",
          details: idValidation.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const targetUserId = idValidation.data;

    // Sprawdzenie autoryzacji:
    // 1. Użytkownik zawsze może usunąć własne konto
    // 2. Administrator może usunąć konto dowolnego użytkownika
    const isOwnData = currentUserId === targetUserId;
    const isAdmin = await isUserAdmin(supabase, currentUserId, isDevelopment);

    if (!isOwnData && !isAdmin) {
      return new Response(JSON.stringify({ error: "Brak uprawnień do usunięcia tego użytkownika" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Sprawdzenie czy użytkownik istnieje
    const existingUser = await getUserById(supabase, targetUserId);
    if (!existingUser) {
      return new Response(JSON.stringify({ error: "Nie znaleziono użytkownika o podanym ID" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Usunięcie użytkownika
    const success = await deleteUser(supabase, targetUserId);

    if (!success) {
      return new Response(JSON.stringify({ error: "Nie udało się usunąć użytkownika" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Zwrócenie odpowiedzi (pusta odpowiedź z kodem 204)
    return new Response(null, {
      status: 204,
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
