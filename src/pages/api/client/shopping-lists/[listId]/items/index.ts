import type { APIContext } from "astro";
import type { AstroLocals } from "@/types/locals";
import { addItemToShoppingList, ShoppingListError } from "@/lib/services/shopping-list.service";
import { logger } from "@/lib/logger";
import { addItemToShoppingListSchema } from "@/lib/validators/shopping-list.validators";

export const prerender = false;

/**
 * Endpoint dla dodawania elementu do listy zakupów inicjowany z hooka po stronie klienta.
 * Opiera się na autentykacji na stronie serwera za pomocą Astro.locals.
 */
export async function POST({ params, request, locals }: APIContext) {
  const requestId = crypto.randomUUID();
  const { listId } = params;

  logger.info(`[API Client Items POST] Received request for list ID: ${listId}`, { requestId });

  if (!listId) {
    logger.warn("[API Client Items POST] Missing list ID in request path", { requestId });
    return new Response(JSON.stringify({ error: "Brak ID listy" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabase, user } = locals as AstroLocals;

  // 1. Sprawdź autentykację
  if (!user || !supabase) {
    logger.warn("[API Client Items POST] Authentication failed", { requestId, listId });
    return new Response(JSON.stringify({ error: "Wymagane uwierzytelnienie" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info("[API Client Items POST] User authenticated", { requestId, userId: user.id, listId });

  try {
    // 2. Parsuj i waliduj dane żądania
    const requestData = await request.json();
    const validationResult = addItemToShoppingListSchema.safeParse(requestData);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.format();
      logger.warn("[API Client Items POST] Validation failed", { requestId, errors: validationErrors });
      return new Response(JSON.stringify({ error: "Nieprawidłowe dane", details: validationErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Wywołaj funkcję serwisową
    const newItem = await addItemToShoppingList(supabase, user.id, listId, validationResult.data);
    logger.info("[API Client Items POST] Item added successfully", { requestId, userId: user.id, listId });

    // 4. Zwróć odpowiedź sukcesu
    return new Response(JSON.stringify(newItem), {
      status: 201, // Created
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("[API Client Items POST] Error adding item", { requestId, userId: user.id, listId }, error);

    if (error instanceof ShoppingListError) {
      // Obsłuż konkretne błędy, np. NOT_FOUND lub FORBIDDEN
      let statusCode = 500;
      switch (error.code) {
        case "NOT_FOUND":
          statusCode = 404;
          break;
        case "FORBIDDEN":
          statusCode = 403;
          break;
        // Dodaj inne kody błędów, jeśli są potrzebne
      }
      return new Response(JSON.stringify({ error: error.message, code: error.code }), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Ogólny wewnętrzny błąd serwera
    return new Response(JSON.stringify({ error: "Wystąpił wewnętrzny błąd serwera" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
