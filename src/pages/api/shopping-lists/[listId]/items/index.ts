import type { APIContext } from "astro";
import type { AstroLocals } from "@/types/locals";
import { addItemToShoppingList, ShoppingListError } from "@/lib/services/shopping-list.service";
import { logger } from "@/lib/logger";
import { addItemToShoppingListSchema } from "@/lib/validators/shopping-list.validators";

export const prerender = false;

/**
 * Endpoint for adding an item to a shopping list.
 * Handles POST requests to /api/shopping-lists/{listId}/items
 */
export async function POST({ params, request, locals }: APIContext) {
  const requestId = crypto.randomUUID();
  const { listId } = params;

  logger.info(`[API Add Item] Received POST request for list ID: ${listId}`, { requestId });

  if (!listId) {
    logger.warn("[API Add Item] Missing list ID in request path", { requestId });
    return new Response(JSON.stringify({ error: "Brak ID listy" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabase, user } = locals as AstroLocals;

  // 1. Check authentication
  if (!user || !supabase) {
    logger.warn("[API Add Item] Authentication failed", { requestId, listId });
    return new Response(JSON.stringify({ error: "Wymagane uwierzytelnienie" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info("[API Add Item] User authenticated", { requestId, userId: user.id, listId });

  try {
    // 2. Parse and validate request body
    const requestData = await request.json();
    const validationResult = addItemToShoppingListSchema.safeParse(requestData);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.format();
      logger.warn("[API Add Item] Validation failed", { requestId, errors: validationErrors });
      return new Response(JSON.stringify({ error: "Nieprawidłowe dane", details: validationErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Call the service function
    const newItem = await addItemToShoppingList(supabase, user.id, listId, validationResult.data);
    logger.info("[API Add Item] Item added successfully", { requestId, userId: user.id, listId, itemId: newItem.id });

    // 4. Return success response
    return new Response(JSON.stringify(newItem), {
      status: 201, // Created
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("[API Add Item] Error adding item", { requestId, userId: user.id, listId }, error);

    if (error instanceof ShoppingListError) {
      // Handle specific errors
      let statusCode = 500;
      switch (error.code) {
        case "NOT_FOUND": // e.g., list not found
          statusCode = 404;
          break;
        case "FORBIDDEN": // e.g., user doesn't own the list
          statusCode = 403;
          break;
        // Add other specific error codes if needed
      }
      return new Response(JSON.stringify({ error: error.message, code: error.code }), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generic internal server error
    return new Response(JSON.stringify({ error: "Wystąpił wewnętrzny błąd serwera" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
