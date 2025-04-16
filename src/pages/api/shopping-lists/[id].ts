import { shoppingListIdSchema, updateShoppingListSchema } from "../../../lib/validators/shopping-list.validators";
import {
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
  ShoppingListError,
} from "../../../lib/services/shopping-list.service";
import type { APIContext } from "astro";
import type { AstroLocals } from "../../../types/locals";
import type { UpdateShoppingListRequest } from "../../../types";
import { logger } from "../../../lib/logger";

export const prerender = false;

/**
 * Endpoint do pobierania pojedynczej listy zakupów wraz z jej elementami
 *
 * @param context Kontekst API Astro
 * @returns Odpowiedź HTTP
 */
export async function GET({ params, locals }: APIContext) {
  // Identyfikator żądania dla śledzenia logów
  const requestId = crypto.randomUUID();
  const listId = params.id;

  try {
    logger.info("Otrzymano żądanie GET /api/shopping-lists/:id", { requestId, listId });

    // Sprawdzenie autoryzacji
    const { supabase, user } = locals as AstroLocals;

    if (!user) {
      logger.warn("Próba dostępu bez uwierzytelnienia", { requestId, listId });
      return new Response(
        JSON.stringify({
          error: "Wymagane uwierzytelnienie",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Upewnij się, że ID jest zdefiniowane
    if (!listId) {
      logger.warn("Brak identyfikatora listy zakupów", { requestId, userId: user.id });
      return new Response(
        JSON.stringify({
          error: "Brak identyfikatora listy zakupów",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Walidacja identyfikatora listy zakupów
    const validationResult = shoppingListIdSchema.safeParse(listId);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.format();
      logger.warn("Błąd walidacji identyfikatora listy zakupów", {
        requestId,
        userId: user.id,
        listId,
        errors: validationErrors,
      });

      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format identyfikatora listy zakupów",
          details: validationErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Pobieranie szczegółów listy zakupów
    const shoppingList = await getShoppingListById(supabase, user.id, listId);

    logger.info("Pomyślnie pobrano szczegóły listy zakupów przez API", {
      requestId,
      userId: user.id,
      listId,
      title: shoppingList.title,
      itemsCount: shoppingList.items.length,
    });

    // Zwracanie odpowiedzi ze szczegółami listy zakupów
    return new Response(JSON.stringify(shoppingList), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Obsługa błędów specyficznych dla listy zakupów
    if (error instanceof ShoppingListError) {
      const errorCode = error.code;

      // Mapowanie kodów błędów na odpowiednie kody HTTP i komunikaty
      let statusCode = 500;
      let errorMessage = error.message;

      switch (errorCode) {
        case "INVALID_UUID":
          statusCode = 400; // Bad Request
          break;
        case "LIST_NOT_FOUND":
          statusCode = 404; // Not Found
          break;
        case "USER_NOT_FOUND":
          statusCode = 400; // Bad Request
          break;
        case "DATABASE_ERROR":
        case "UNEXPECTED_ERROR":
          statusCode = 500; // Internal Server Error
          break;
        default:
          statusCode = 500;
          errorMessage = "Wystąpił błąd podczas przetwarzania żądania";
      }

      logger.error(
        "Obsłużony błąd ShoppingListError",
        {
          requestId,
          listId,
          errorCode,
          statusCode,
        },
        error
      );

      return new Response(
        JSON.stringify({
          error: errorMessage,
          code: errorCode,
        }),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obsługa innych, nieoczekiwanych błędów
    logger.error(
      "Nieobsłużony błąd podczas przetwarzania żądania GET /api/shopping-lists/:id",
      {
        requestId,
        listId,
      },
      error
    );

    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas przetwarzania żądania",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Endpoint do aktualizacji listy zakupów
 *
 * @param context Kontekst API Astro
 * @returns Odpowiedź HTTP
 */
export async function PUT({ request, params, locals }: APIContext) {
  // Identyfikator żądania dla śledzenia logów
  const requestId = crypto.randomUUID();
  const listId = params.id;

  try {
    logger.info("Otrzymano żądanie PUT /api/shopping-lists/:id", { requestId, listId });

    // Sprawdzenie autoryzacji
    const { supabase, user } = locals as AstroLocals;

    if (!user) {
      logger.warn("Próba dostępu bez uwierzytelnienia", { requestId, listId });
      return new Response(
        JSON.stringify({
          error: "Wymagane uwierzytelnienie",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Upewnij się, że ID jest zdefiniowane
    if (!listId) {
      logger.warn("Brak identyfikatora listy zakupów", { requestId, userId: user.id });
      return new Response(
        JSON.stringify({
          error: "Brak identyfikatora listy zakupów",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Walidacja identyfikatora listy zakupów
    const idValidationResult = shoppingListIdSchema.safeParse(listId);

    if (!idValidationResult.success) {
      const validationErrors = idValidationResult.error.format();
      logger.warn("Błąd walidacji identyfikatora listy zakupów", {
        requestId,
        userId: user.id,
        listId,
        errors: validationErrors,
      });

      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format identyfikatora listy zakupów",
          details: validationErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parsowanie danych wejściowych
    const requestData = await request.json();
    logger.debug("Odebrane dane żądania", { requestId, userId: user.id, listId, body: requestData });

    // Walidacja danych wejściowych
    const dataValidationResult = updateShoppingListSchema.safeParse(requestData);

    if (!dataValidationResult.success) {
      const validationErrors = dataValidationResult.error.format();
      logger.warn("Błąd walidacji danych wejściowych", {
        requestId,
        userId: user.id,
        listId,
        errors: validationErrors,
      });

      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          details: validationErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Aktualizacja listy zakupów
    const shoppingListData: UpdateShoppingListRequest = {
      title: dataValidationResult.data.title,
    };

    const updatedList = await updateShoppingList(supabase, user.id, listId, shoppingListData);

    logger.info("Pomyślnie zaktualizowano listę zakupów przez API", {
      requestId,
      userId: user.id,
      listId,
      title: updatedList.title,
    });

    // Zwracanie odpowiedzi z zaktualizowaną listą zakupów
    return new Response(JSON.stringify(updatedList), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Obsługa błędów specyficznych dla listy zakupów
    if (error instanceof ShoppingListError) {
      const errorCode = error.code;

      // Mapowanie kodów błędów na odpowiednie kody HTTP i komunikaty
      let statusCode = 500;
      let errorMessage = error.message;

      switch (errorCode) {
        case "INVALID_UUID":
          statusCode = 400; // Bad Request
          break;
        case "LIST_NOT_FOUND":
          statusCode = 404; // Not Found
          break;
        case "DUPLICATE_TITLE":
          statusCode = 409; // Conflict
          break;
        case "USER_NOT_FOUND":
          statusCode = 400; // Bad Request
          break;
        case "DATABASE_ERROR":
        case "UNEXPECTED_ERROR":
          statusCode = 500; // Internal Server Error
          break;
        default:
          statusCode = 500;
          errorMessage = "Wystąpił błąd podczas przetwarzania żądania";
      }

      logger.error(
        "Obsłużony błąd ShoppingListError",
        {
          requestId,
          listId,
          errorCode,
          statusCode,
        },
        error
      );

      return new Response(
        JSON.stringify({
          error: errorMessage,
          code: errorCode,
        }),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obsługa innych, nieoczekiwanych błędów
    logger.error(
      "Nieobsłużony błąd podczas przetwarzania żądania PUT /api/shopping-lists/:id",
      {
        requestId,
        listId,
      },
      error
    );

    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas przetwarzania żądania",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

/**
 * Endpoint do usuwania listy zakupów wraz z jej elementami
 *
 * @param context Kontekst API Astro
 * @returns Odpowiedź HTTP
 */
export async function DELETE({ params, locals }: APIContext) {
  // Identyfikator żądania dla śledzenia logów
  const requestId = crypto.randomUUID();
  const listId = params.id;

  try {
    logger.info("Otrzymano żądanie DELETE /api/shopping-lists/:id", { requestId, listId });

    // Sprawdzenie autoryzacji
    const { supabase, user } = locals as AstroLocals;

    if (!user) {
      logger.warn("Próba dostępu bez uwierzytelnienia", { requestId, listId });
      return new Response(
        JSON.stringify({
          error: "Wymagane uwierzytelnienie",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Upewnij się, że ID jest zdefiniowane
    if (!listId) {
      logger.warn("Brak identyfikatora listy zakupów", { requestId, userId: user.id });
      return new Response(
        JSON.stringify({
          error: "Brak identyfikatora listy zakupów",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Walidacja identyfikatora listy zakupów
    const validationResult = shoppingListIdSchema.safeParse(listId);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.format();
      logger.warn("Błąd walidacji identyfikatora listy zakupów", {
        requestId,
        userId: user.id,
        listId,
        errors: validationErrors,
      });

      return new Response(
        JSON.stringify({
          error: "Nieprawidłowy format identyfikatora listy zakupów",
          details: validationErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Usuwanie listy zakupów
    await deleteShoppingList(supabase, user.id, listId);

    logger.info("Pomyślnie usunięto listę zakupów przez API", {
      requestId,
      userId: user.id,
      listId,
    });

    // Zwracanie pustej odpowiedzi z kodem 204 (No Content)
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // Obsługa błędów specyficznych dla listy zakupów
    if (error instanceof ShoppingListError) {
      const errorCode = error.code;

      // Mapowanie kodów błędów na odpowiednie kody HTTP i komunikaty
      let statusCode = 500;
      let errorMessage = error.message;

      switch (errorCode) {
        case "INVALID_UUID":
          statusCode = 400; // Bad Request
          break;
        case "LIST_NOT_FOUND":
          statusCode = 404; // Not Found
          break;
        case "USER_NOT_FOUND":
          statusCode = 400; // Bad Request
          break;
        case "DATABASE_ERROR":
        case "UNEXPECTED_ERROR":
          statusCode = 500; // Internal Server Error
          break;
        default:
          statusCode = 500;
          errorMessage = "Wystąpił błąd podczas przetwarzania żądania";
      }

      logger.error(
        "Obsłużony błąd ShoppingListError",
        {
          requestId,
          listId,
          errorCode,
          statusCode,
        },
        error
      );

      return new Response(
        JSON.stringify({
          error: errorMessage,
          code: errorCode,
        }),
        {
          status: statusCode,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Obsługa innych, nieoczekiwanych błędów
    logger.error(
      "Nieobsłużony błąd podczas przetwarzania żądania DELETE /api/shopping-lists/:id",
      {
        requestId,
        listId,
      },
      error
    );

    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas przetwarzania żądania",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
