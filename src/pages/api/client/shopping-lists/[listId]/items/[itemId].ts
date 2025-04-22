import type { APIContext } from "astro";
import type { AstroLocals } from "@/types/locals";
import {
  updateShoppingListItem,
  deleteShoppingListItem,
  ShoppingListError,
} from "@/lib/services/shopping-list.service";
import { logger } from "@/lib/logger";
import { updateShoppingListItemSchema } from "@/lib/validators/shopping-list.validators";

export const prerender = false;

/**
 * Endpoint dla aktualizacji elementu listy zakupów inicjowany z hooka po stronie klienta.
 * Opiera się na autentykacji na stronie serwera za pomocą Astro.locals.
 */
export async function PUT({ params, request, locals }: APIContext) {
  const requestId = crypto.randomUUID();
  const { listId, itemId } = params;

  logger.info(`[API Client Items PUT] Received request for list ID: ${listId}, item ID: ${itemId}`, { requestId });

  if (!listId || !itemId) {
    logger.warn("[API Client Items PUT] Missing list ID or item ID in request path", { requestId });
    return new Response(JSON.stringify({ error: "Brak ID listy lub ID elementu" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabase, user } = locals as AstroLocals;

  // 1. Sprawdź autentykację
  if (!user || !supabase) {
    logger.warn("[API Client Items PUT] Authentication failed", { requestId, listId, itemId });
    return new Response(JSON.stringify({ error: "Wymagane uwierzytelnienie" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info("[API Client Items PUT] User authenticated", { requestId, userId: user.id, listId, itemId });

  try {
    // 2. Parsuj i waliduj dane żądania
    const requestData = await request.json();
    const validationResult = updateShoppingListItemSchema.safeParse(requestData);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.format();
      logger.warn("[API Client Items PUT] Validation failed", { requestId, errors: validationErrors });
      return new Response(JSON.stringify({ error: "Nieprawidłowe dane", details: validationErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Wywołaj funkcję serwisową
    const updatedItem = await updateShoppingListItem(supabase, user.id, listId, itemId, validationResult.data);
    logger.info("[API Client Items PUT] Item updated successfully", { requestId, userId: user.id, listId, itemId });

    // 4. Zwróć odpowiedź sukcesu
    return new Response(JSON.stringify(updatedItem), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("[API Client Items PUT] Error updating item", { requestId, userId: user.id, listId, itemId }, error);

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

/**
 * Endpoint dla usuwania elementu listy zakupów inicjowany z hooka po stronie klienta.
 * Opiera się na autentykacji na stronie serwera za pomocą Astro.locals.
 */
export async function DELETE({ params, locals }: APIContext) {
  const requestId = crypto.randomUUID();
  const { listId, itemId } = params;

  logger.info(`[API Client Items DELETE] Received request for list ID: ${listId}, item ID: ${itemId}`, { requestId });

  if (!listId || !itemId) {
    logger.warn("[API Client Items DELETE] Missing list ID or item ID in request path", { requestId });
    return new Response(JSON.stringify({ error: "Brak ID listy lub ID elementu" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabase, user } = locals as AstroLocals;

  // 1. Sprawdź autentykację
  if (!user || !supabase) {
    logger.warn("[API Client Items DELETE] Authentication failed", { requestId, listId, itemId });
    return new Response(JSON.stringify({ error: "Wymagane uwierzytelnienie" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info("[API Client Items DELETE] User authenticated", { requestId, userId: user.id, listId, itemId });

  try {
    // 2. Wywołaj funkcję serwisową do usunięcia elementu
    await deleteShoppingListItem(supabase, user.id, listId, itemId);
    logger.info("[API Client Items DELETE] Item deleted successfully", { requestId, userId: user.id, listId, itemId });

    // 3. Zwróć odpowiedź sukcesu (No Content)
    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    logger.error(
      "[API Client Items DELETE] Error deleting item",
      { requestId, userId: user.id, listId, itemId },
      error
    );

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
