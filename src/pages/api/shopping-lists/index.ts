import { createShoppingListSchema } from "../../../lib/validators/shopping-list.validators";
import { createShoppingList, ShoppingListError } from "../../../lib/services/shopping-list.service";
import type { APIContext } from "astro";
import type { AstroLocals } from "../../../types/locals";
import type { CreateShoppingListRequest } from "../../../types";
import { logger } from "../../../lib/logger";

export const prerender = false;

/**
 * Endpoint do tworzenia nowej listy zakupów
 *
 * @param context Kontekst API Astro
 * @returns Odpowiedź HTTP
 */
export async function POST({ request, locals }: APIContext) {
  // Identyfikator żądania dla śledzenia logów
  const requestId = crypto.randomUUID();

  try {
    logger.info("Otrzymano żądanie POST /api/shopping-lists", { requestId });

    // Sprawdzenie autoryzacji
    const { supabase, user } = locals as AstroLocals;

    if (!user) {
      logger.warn("Próba dostępu bez uwierzytelnienia", { requestId });
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

    // Parsowanie danych wejściowych
    const requestData = await request.json();
    logger.debug("Odebrane dane żądania", { requestId, userId: user.id, body: requestData });

    // Walidacja danych wejściowych
    const validationResult = createShoppingListSchema.safeParse(requestData);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.format();
      logger.warn("Błąd walidacji danych wejściowych", {
        requestId,
        userId: user.id,
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

    // Tworzenie listy zakupów - zapewniamy, że title jest zdefiniowane
    const shoppingListData: CreateShoppingListRequest = {
      title: validationResult.data.title,
    };

    const shoppingList = await createShoppingList(supabase, user.id, shoppingListData);

    logger.info("Pomyślnie utworzono listę zakupów przez API", {
      requestId,
      userId: user.id,
      listId: shoppingList.id,
    });

    // Zwracanie odpowiedzi z nowo utworzoną listą zakupów
    return new Response(JSON.stringify(shoppingList), {
      status: 201,
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
        case "DUPLICATE_TITLE":
          statusCode = 409; // Conflict
          break;
        case "USER_NOT_FOUND":
          statusCode = 400;
          break;
        case "DATABASE_ERROR":
        case "UNEXPECTED_ERROR":
          statusCode = 500;
          break;
        default:
          statusCode = 500;
          errorMessage = "Wystąpił błąd podczas przetwarzania żądania";
      }

      logger.error(
        "Obsłużony błąd ShoppingListError",
        {
          requestId,
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
      "Nieobsłużony błąd podczas przetwarzania żądania POST /api/shopping-lists",
      {
        requestId,
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
