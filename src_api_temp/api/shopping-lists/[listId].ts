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
 * Endpoint for getting shopping list details by ID.
 * Handles GET requests to /api/shopping-lists/{listId}
 */
export async function GET({ params, locals }: APIContext) {
  const requestId = crypto.randomUUID();
  // Use listId from params, consistent with filename
  const listId = params.listId;

  logger.info(`[API Get List] Received GET request for list ID: ${listId}`, { requestId });

  if (!listId) {
    logger.warn("[API Get List] Missing list ID in request path", { requestId });
    return new Response(JSON.stringify({ error: "Brak ID listy" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabase, user } = locals as AstroLocals;

  // 1. Check authentication
  if (!user || !supabase) {
    logger.warn("[API Get List] Authentication failed", { requestId, listId });
    return new Response(JSON.stringify({ error: "Wymagane uwierzytelnienie" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info("[API Get List] User authenticated", { requestId, userId: user.id, listId });

  try {
    // 2. Call the service function to get the list details
    const listDetails = await getShoppingListById(supabase, user.id, listId);
    logger.info("[API Get List] List details fetched successfully", { requestId, userId: user.id, listId });

    // 3. Return success response
    return new Response(JSON.stringify(listDetails), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("[API Get List] Error fetching list details", { requestId, userId: user.id, listId }, error);

    if (error instanceof ShoppingListError) {
      // Handle specific errors, e.g., NOT_FOUND or FORBIDDEN
      let statusCode = 500;
      switch (error.code) {
        case "NOT_FOUND":
        case "LIST_NOT_FOUND": // Added LIST_NOT_FOUND based on service
          statusCode = 404;
          break;
        case "FORBIDDEN":
          statusCode = 403;
          break;
        case "INVALID_UUID": // Added INVALID_UUID based on service
          statusCode = 400;
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
 * Endpoint for deleting a shopping list by ID.
 * Handles DELETE requests to /api/shopping-lists/{listId}
 */
export async function DELETE({ params, locals }: APIContext) {
  const requestId = crypto.randomUUID();
  // Use listId from params, consistent with filename
  const listId = params.listId;

  logger.info(`[API Delete List] Received DELETE request for list ID: ${listId}`, { requestId });

  if (!listId) {
    logger.warn("[API Delete List] Missing list ID in request path", { requestId });
    return new Response(JSON.stringify({ error: "Brak ID listy" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabase, user } = locals as AstroLocals;

  // 1. Check authentication
  if (!user || !supabase) {
    logger.warn("[API Delete List] Authentication failed", { requestId, listId });
    return new Response(JSON.stringify({ error: "Wymagane uwierzytelnienie" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info("[API Delete List] User authenticated", { requestId, userId: user.id, listId });

  try {
    // 2. Call the service function to delete the list
    await deleteShoppingList(supabase, user.id, listId);
    logger.info("[API Delete List] List deleted successfully", { requestId, userId: user.id, listId });

    // 3. Return success response (No Content)
    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    logger.error("[API Delete List] Error during list deletion", { requestId, userId: user.id, listId }, error);

    if (error instanceof ShoppingListError) {
      // Handle specific errors
      let statusCode = 500;
      switch (error.code) {
        case "NOT_FOUND":
        case "LIST_NOT_FOUND":
          statusCode = 404;
          break;
        case "FORBIDDEN":
          statusCode = 403;
          break;
        case "INVALID_UUID":
          statusCode = 400;
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
 * Endpoint for updating a shopping list by ID.
 * Handles PUT requests to /api/shopping-lists/{listId}
 */
export async function PUT({ params, request, locals }: APIContext) {
  const requestId = crypto.randomUUID();
  // Use listId from params, consistent with filename
  const listId = params.listId;

  logger.info(`[API Update List] Received PUT request for list ID: ${listId}`, { requestId });

  if (!listId) {
    logger.warn("[API Update List] Missing list ID in request path", { requestId });
    return new Response(JSON.stringify({ error: "Brak ID listy" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { supabase, user } = locals as AstroLocals;

  // 1. Check authentication
  if (!user || !supabase) {
    logger.warn("[API Update List] Authentication failed", { requestId, listId });
    return new Response(JSON.stringify({ error: "Wymagane uwierzytelnienie" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info("[API Update List] User authenticated", { requestId, userId: user.id, listId });

  try {
    // 2. Parse and validate request body
    const requestData = await request.json();
    const validationResult = updateShoppingListSchema.safeParse(requestData);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.format();
      logger.warn("[API Update List] Validation failed", { requestId, errors: validationErrors });
      return new Response(JSON.stringify({ error: "Nieprawidłowe dane", details: validationErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Call the service function
    const updatedList = await updateShoppingList(supabase, user.id, listId, validationResult.data);
    logger.info("[API Update List] List updated successfully", { requestId, userId: user.id, listId });

    // 4. Return success response
    return new Response(JSON.stringify(updatedList), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("[API Update List] Error updating list", { requestId, userId: user.id, listId }, error);

    if (error instanceof ShoppingListError) {
      // Handle specific errors
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
        case "INVALID_UUID":
          statusCode = 400;
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
