import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import type { CreateShoppingListRequest, CreateShoppingListResponse } from "../../types";
import { logger } from "../logger";

/**
 * Klasa reprezentująca błąd związany z listą zakupów
 */
export class ShoppingListError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: PostgrestError | Error | unknown
  ) {
    super(message);
    this.name = "ShoppingListError";
  }
}

/**
 * Tworzy nową listę zakupów dla użytkownika
 *
 * @param supabase Klient Supabase
 * @param userId ID użytkownika
 * @param data Dane listy zakupów do utworzenia
 * @returns Nowo utworzona lista zakupów
 * @throws {ShoppingListError} Gdy wystąpi błąd podczas tworzenia listy zakupów
 */
export async function createShoppingList(
  supabase: SupabaseClient,
  userId: string,
  data: CreateShoppingListRequest
): Promise<CreateShoppingListResponse> {
  logger.info("Rozpoczęcie tworzenia nowej listy zakupów", { userId, title: data.title });

  try {
    const { data: shoppingList, error } = await supabase
      .from("shopping_lists")
      .insert([
        {
          user_id: userId,
          title: data.title,
        },
      ])
      .select("id, title, created_at, updated_at")
      .single();

    if (error) {
      // Mapowanie błędów Supabase na własne kody błędów
      logger.error("Błąd bazy danych podczas tworzenia listy zakupów", { userId, errorCode: error.code }, error);

      if (error.code === "23505") {
        throw new ShoppingListError("Lista zakupów o podanym tytule już istnieje", "DUPLICATE_TITLE", error);
      } else if (error.code === "23503") {
        throw new ShoppingListError("Nie znaleziono użytkownika o podanym ID", "USER_NOT_FOUND", error);
      } else if (error.code === "42P01") {
        throw new ShoppingListError("Błąd konfiguracji bazy danych: tabela nie istnieje", "TABLE_NOT_FOUND", error);
      } else {
        throw new ShoppingListError("Nie udało się utworzyć listy zakupów", "DATABASE_ERROR", error);
      }
    }

    if (!shoppingList) {
      logger.error("Błąd podczas tworzenia listy zakupów - brak danych zwrotnych", { userId });
      throw new ShoppingListError("Nie udało się utworzyć listy zakupów - brak danych zwrotnych", "NO_DATA_RETURNED");
    }

    // Pomyślnie utworzono listę zakupów
    logger.info("Pomyślnie utworzono nową listę zakupów", {
      userId,
      listId: shoppingList.id,
      title: shoppingList.title,
    });

    // Mapowanie zwróconych danych na format DTO
    return {
      id: shoppingList.id,
      title: shoppingList.title,
      createdAt: shoppingList.created_at,
      updatedAt: shoppingList.updated_at,
    };
  } catch (error) {
    // Przechwytujemy i przekazujemy dalej błędy ShoppingListError
    if (error instanceof ShoppingListError) {
      throw error;
    }

    // Pozostałe błędy opakowujemy w ShoppingListError
    logger.error("Nieoczekiwany błąd podczas tworzenia listy zakupów", { userId }, error);
    throw new ShoppingListError(
      "Wystąpił nieoczekiwany błąd podczas tworzenia listy zakupów",
      "UNEXPECTED_ERROR",
      error
    );
  }
}
