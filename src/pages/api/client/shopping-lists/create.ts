import type { APIContext } from "astro";
import type { AstroLocals } from "@/types/locals";
import type { CreateShoppingListRequest } from "@/types";
import { createShoppingListSchema } from "@/lib/validators/shopping-list.validators";
import { createShoppingList, ShoppingListError } from "@/lib/services/shopping-list.service";
import { logger } from "@/lib/logger";

export const prerender = false;

/**
 * Endpoint for creating a new shopping list initiated from the client-side hook.
 * Relies on server-side authentication via Astro.locals.
 */
export async function POST({ request, locals }: APIContext) {
  const requestId = crypto.randomUUID();
  logger.info("[API Client Create] Received POST request", { requestId });

  const { supabase, user } = locals as AstroLocals;

  // 1. Check authentication (using user from locals)
  if (!user || !supabase) {
    logger.warn("[API Client Create] Authentication failed (no user or supabase in locals)", { requestId });
    return new Response(JSON.stringify({ error: "Wymagane uwierzytelnienie" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  logger.info("[API Client Create] User authenticated", { requestId, userId: user.id });

  try {
    // 2. Parse and validate request body
    const requestData = await request.json();
    logger.debug("[API Client Create] Received request data", { requestId, body: requestData });

    const validationResult = createShoppingListSchema.safeParse(requestData);
    if (!validationResult.success) {
      const validationErrors = validationResult.error.format();
      logger.warn("[API Client Create] Validation failed", { requestId, errors: validationErrors });
      return new Response(JSON.stringify({ error: "Nieprawidłowe dane", details: validationErrors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Call the service function
    const shoppingListData: CreateShoppingListRequest = {
      title: validationResult.data.title,
    };

    // Pass the server-side supabase client and validated user ID
    const newList = await createShoppingList(supabase, user.id, shoppingListData);
    logger.info("[API Client Create] List created successfully", { requestId, userId: user.id, listId: newList.id });

    // 4. Return success response
    return new Response(JSON.stringify(newList), {
      status: 201, // Created
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle potential errors from the service function
    logger.error("[API Client Create] Error during list creation", { requestId, userId: user.id }, error);

    if (error instanceof ShoppingListError) {
      // Handle specific shopping list errors (duplicate title, etc.)
      let statusCode = 500;
      switch (error.code) {
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
