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
 * Endpoint for updating a specific shopping list item.
 * Handles PUT requests to /api/shopping-lists/{listId}/items/{itemId}
 */
// --- PUT Handler (Aktualizacja elementu listy) ---
export async function PUT({ params, request, locals }: APIContext) {
  const requestId = crypto.randomUUID();
  const { listId, itemId } = params;

  logger.info(`[API Update Item] Received PUT request for list ID: ${listId}, item ID: ${itemId}`, { requestId });

  if (!listId || !itemId) {
    logger.warn("[API Update Item] Missing list ID or item ID in request path", { requestId });
    return new Response(JSON.stringify({ error: "Brak ID listy lub ID elementu" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabase, user } = locals as AstroLocals;

  // 1. Check authentication
  if (!user || !supabase) {
    logger.warn("[API Update Item] Authentication failed", { requestId, listId, itemId });
    return new Response(JSON.stringify({ error: "Wymagane uwierzytelnienie" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info("[API Update Item] User authenticated", { requestId, userId: user.id, listId, itemId });

  try {
    // 2. Parse and validate request body
    const requestData = await request.json();
    const validationResult = updateShoppingListItemSchema.safeParse(requestData);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.format();
      logger.warn("[API Update Item] Validation failed", { requestId, errors: validationErrors });
      return new Response(JSON.stringify({ error: "Nieprawidłowe dane", details: validationErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Call the service function
    const updatedItem = await updateShoppingListItem(supabase, user.id, listId, itemId, validationResult.data);
    logger.info("[API Update Item] Item updated successfully", { requestId, userId: user.id, listId, itemId });

    // 4. Return success response
    return new Response(JSON.stringify(updatedItem), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("[API Update Item] Error updating item", { requestId, userId: user.id, listId, itemId }, error);

    if (error instanceof ShoppingListError) {
      // Handle specific errors
      let statusCode = 500;
      switch (error.code) {
        case "NOT_FOUND": // e.g., item or list not found
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

/**
 * Endpoint for deleting a specific shopping list item.
 * Handles DELETE requests to /api/shopping-lists/{listId}/items/{itemId}
 */
// --- DELETE Handler (Usuwanie elementu listy) ---
export async function DELETE({ params, locals }: APIContext) {
  const requestId = crypto.randomUUID();
  const { listId, itemId } = params;

  logger.info(`[API Delete Item] Received DELETE request for list ID: ${listId}, item ID: ${itemId}`, { requestId });

  if (!listId || !itemId) {
    logger.warn("[API Delete Item] Missing list ID or item ID in request path", { requestId });
    return new Response(JSON.stringify({ error: "Brak ID listy lub ID elementu" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabase, user } = locals as AstroLocals;

  // 1. Check authentication
  if (!user || !supabase) {
    logger.warn("[API Delete Item] Authentication failed", { requestId, listId, itemId });
    return new Response(JSON.stringify({ error: "Wymagane uwierzytelnienie" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info("[API Delete Item] User authenticated", { requestId, userId: user.id, listId, itemId });

  try {
    // 2. Call the service function to delete the item
    await deleteShoppingListItem(supabase, user.id, listId, itemId);
    logger.info("[API Delete Item] Item deleted successfully", { requestId, userId: user.id, listId, itemId });

    // 3. Return success response (No Content)
    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    logger.error("[API Delete Item] Error deleting item", { requestId, userId: user.id, listId, itemId }, error);

    if (error instanceof ShoppingListError) {
      // Handle specific errors
      let statusCode = 500;
      switch (error.code) {
        case "NOT_FOUND": // e.g., item or list not found
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
