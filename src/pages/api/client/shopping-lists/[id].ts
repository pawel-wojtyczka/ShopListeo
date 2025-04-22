import type { APIContext } from "astro";
import type { AstroLocals } from "@/types/locals";
import {
  deleteShoppingList,
  getShoppingListById,
  updateShoppingList,
  ShoppingListError,
} from "@/lib/services/shopping-list.service";
import { logger } from "@/lib/logger";
import { updateShoppingListSchema } from "@/lib/validators/shopping-list.validators";

export const prerender = false;

/**
 * Endpoint for getting shopping list details initiated from the client-side hook.
 * Relies on server-side authentication via Astro.locals.
 */
export async function GET({ params, locals }: APIContext) {
  const requestId = crypto.randomUUID();
  const listId = params.id;

  logger.info(`[API Client Get] Received GET request for list ID: ${listId}`, { requestId });

  if (!listId) {
    logger.warn("[API Client Get] Missing list ID in request path", { requestId });
    return new Response(JSON.stringify({ error: "Brak ID listy" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabase, user } = locals as AstroLocals;

  // 1. Check authentication
  if (!user || !supabase) {
    logger.warn("[API Client Get] Authentication failed", { requestId, listId });
    return new Response(JSON.stringify({ error: "Wymagane uwierzytelnienie" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info("[API Client Get] User authenticated", { requestId, userId: user.id, listId });

  try {
    // 2. Call the service function to get the list details
    const listDetails = await getShoppingListById(supabase, user.id, listId);
    logger.info("[API Client Get] List details fetched successfully", { requestId, userId: user.id, listId });

    // 3. Return success response
    return new Response(JSON.stringify(listDetails), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("[API Client Get] Error fetching list details", { requestId, userId: user.id, listId }, error);

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

/**
 * Endpoint for updating a shopping list initiated from the client-side hook.
 * Relies on server-side authentication via Astro.locals.
 */
export async function PUT({ params, request, locals }: APIContext) {
  const requestId = crypto.randomUUID();
  const listId = params.id;

  logger.info(`[API Client Update] Received PUT request for list ID: ${listId}`, { requestId });

  if (!listId) {
    logger.warn("[API Client Update] Missing list ID in request path", { requestId });
    return new Response(JSON.stringify({ error: "Brak ID listy" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabase, user } = locals as AstroLocals;

  // 1. Check authentication
  if (!user || !supabase) {
    logger.warn("[API Client Update] Authentication failed", { requestId, listId });
    return new Response(JSON.stringify({ error: "Wymagane uwierzytelnienie" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info("[API Client Update] User authenticated", { requestId, userId: user.id, listId });

  try {
    // 2. Parse and validate request body
    const requestData = await request.json();
    const validationResult = updateShoppingListSchema.safeParse(requestData);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.format();
      logger.warn("[API Client Update] Validation failed", { requestId, errors: validationErrors });
      return new Response(JSON.stringify({ error: "Nieprawidłowe dane", details: validationErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Call the service function
    const updatedList = await updateShoppingList(supabase, user.id, listId, validationResult.data);
    logger.info("[API Client Update] List updated successfully", { requestId, userId: user.id, listId });

    // 4. Return success response
    return new Response(JSON.stringify(updatedList), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("[API Client Update] Error updating list", { requestId, userId: user.id, listId }, error);

    if (error instanceof ShoppingListError) {
      // Handle specific errors, e.g., NOT_FOUND or FORBIDDEN
      let statusCode = 500;
      switch (error.code) {
        case "NOT_FOUND":
        case "LIST_NOT_FOUND":
          statusCode = 404;
          break;
        case "FORBIDDEN":
          statusCode = 403;
          break;
        case "DUPLICATE_TITLE":
          statusCode = 409;
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
