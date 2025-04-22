import type { APIContext } from "astro";
import type { AstroLocals } from "@/types/locals";
import { deleteShoppingList, ShoppingListError } from "@/lib/services/shopping-list.service";
import { logger } from "@/lib/logger";

export const prerender = false;

/**
 * Endpoint for deleting a shopping list initiated from the client-side hook.
 * Relies on server-side authentication via Astro.locals.
 */
export async function DELETE({ params, locals }: APIContext) {
  const requestId = crypto.randomUUID();
  const listId = params.id;

  logger.info(`[API Client Delete] Received DELETE request for list ID: ${listId}`, { requestId });

  if (!listId) {
    logger.warn("[API Client Delete] Missing list ID in request path", { requestId });
    return new Response(JSON.stringify({ error: "Brak ID listy" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabase, user } = locals as AstroLocals;

  // 1. Check authentication
  if (!user || !supabase) {
    logger.warn("[API Client Delete] Authentication failed", { requestId, listId });
    return new Response(JSON.stringify({ error: "Wymagane uwierzytelnienie" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info("[API Client Delete] User authenticated", { requestId, userId: user.id, listId });

  try {
    // 2. Call the service function to delete the list
    // Ensure deleteShoppingList exists and accepts these parameters
    await deleteShoppingList(supabase, user.id, listId);
    logger.info("[API Client Delete] List deleted successfully", { requestId, userId: user.id, listId });

    // 3. Return success response (No Content)
    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    logger.error("[API Client Delete] Error during list deletion", { requestId, userId: user.id, listId }, error);

    if (error instanceof ShoppingListError) {
      // Handle specific errors, e.g., NOT_FOUND or FORBIDDEN
      let statusCode = 500;
      switch (error.code) {
        case "NOT_FOUND":
          statusCode = 404;
          break;
        case "FORBIDDEN":
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
