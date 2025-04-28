import type { APIContext, AstroLocals } from "astro";
import { getShoppingListById } from "../../../lib/services/shopping-list.service";
import { ShoppingListError } from "../../../lib/errors/ShoppingListError";
import { logger } from "../../../lib/logger"; // Assuming logger is configured

/**
 * Endpoint for getting shopping list details by ID.
 * Handles GET requests to /api/client/shopping-lists/{listId}
 * Relies on server-side authentication via Astro.locals.
 */
export async function GET({ params, locals }: APIContext) {
  const requestId = crypto.randomUUID();
  // Use listId from params, consistent with filename
  const listId = params.listId;

  logger.info(`[API Client Get List] Received GET request for list ID: ${listId}`, { requestId });

  if (!listId) {
    logger.warn("[API Client Get List] Missing list ID in request path", { requestId });
    return new Response(JSON.stringify({ error: "Brak ID listy" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabase, user } = locals as AstroLocals;

  // 1. Check authentication (crucial for client-side endpoint)
  if (!user || !supabase) {
    logger.warn("[API Client Get List] Authentication failed", { requestId, listId });
    return new Response(JSON.stringify({ error: "Wymagane uwierzytelnienie" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info("[API Client Get List] User authenticated", { requestId, userId: user.id, listId });

  try {
    // 2. Call the service function to get the list details
    // We use getShoppingListById which fetches details including items
    const listDetails = await getShoppingListById(supabase, user.id, listId);
    logger.info("[API Client Get List] List details fetched successfully", { requestId, userId: user.id, listId });

    // 3. Return success response
    return new Response(JSON.stringify(listDetails), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("[API Client Get List] Error fetching list details", { requestId, userId: user.id, listId, error });

    if (error instanceof ShoppingListError) {
      // Handle specific errors from the service layer
      let statusCode = 500; // Default to internal server error
      switch (error.code) {
        case "LIST_NOT_FOUND":
        case "NOT_FOUND": // Keep both for potential variations
          statusCode = 404;
          break;
        case "FORBIDDEN":
          statusCode = 403; // User doesn't own this list
          break;
        case "INVALID_UUID":
          statusCode = 400; // Bad request due to invalid ID format
          break;
        case "DATABASE_ERROR":
          // Keep 500 for database errors
          break;
        // Add other specific error codes if needed
      }
      logger.warn(`[API Client Get List] Returning ${statusCode} due to ShoppingListError`, {
        requestId,
        listId,
        errorCode: error.code,
        errorMessage: error.message,
      });
      return new Response(JSON.stringify({ error: error.message, code: error.code }), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generic internal server error for unexpected issues
    logger.error("[API Client Get List] Returning 500 due to unexpected error", { requestId, listId, error });
    return new Response(JSON.stringify({ error: "Wystąpił wewnętrzny błąd serwera" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Note: We might need PUT and DELETE handlers here as well,
// depending on how the frontend interacts with this endpoint for updates/deletions.
// For now, only GET is implemented as requested by the user's problem description.
