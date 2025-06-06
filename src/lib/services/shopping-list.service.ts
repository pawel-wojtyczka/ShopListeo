import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import type {
  CreateShoppingListRequest,
  CreateShoppingListResponse,
  ShoppingListSummaryDTO,
  GetAllShoppingListsResponse,
  PaginationResponse,
  GetShoppingListByIdResponse,
  ShoppingListItemDTO,
  UpdateShoppingListRequest,
  UpdateShoppingListResponse,
  ShoppingListDetailResponse,
  UpdateShoppingListItemResponse,
} from "../../types";
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
        throw new ShoppingListError("Błąd konfiguracji bazy danych: tabela nie istnieje", "DATABASE_ERROR", error);
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

/**
 * Pobiera wszystkie listy zakupów dla użytkownika
 *
 * @param supabase Klient Supabase
 * @param userId ID użytkownika
 * @param page Numer strony (domyślnie: 1)
 * @param pageSize Liczba elementów na stronę (domyślnie: 20)
 * @param sort Pole, według którego sortowane są wyniki (domyślnie: "createdAt")
 * @param order Kolejność sortowania (domyślnie: "desc")
 * @returns Listy zakupów z informacjami o paginacji
 * @throws {ShoppingListError} Gdy wystąpi błąd podczas pobierania list zakupów
 */
export async function getAllShoppingLists(
  supabase: SupabaseClient,
  userId: string,
  page = 1,
  pageSize = 20,
  sort = "createdAt",
  order: "asc" | "desc" = "desc"
): Promise<GetAllShoppingListsResponse> {
  logger.info("Rozpoczęcie pobierania list zakupów", { userId, page, pageSize, sort, order });

  try {
    // Mapowanie pól sortowania z camelCase na snake_case używane w bazie danych
    const sortFieldMap: Record<string, string> = {
      title: "title",
      createdAt: "created_at",
      updatedAt: "updated_at",
    };

    const sortField = sortFieldMap[sort] || "created_at";

    // Obliczanie offsetu dla paginacji
    const offset = (page - 1) * pageSize;

    // 1. Pobieranie całkowitej liczby list zakupów użytkownika
    const { count, error: countError } = await supabase
      .from("shopping_lists")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      logger.error("Błąd podczas liczenia list zakupów", { userId, errorCode: countError.code }, countError);
      throw new ShoppingListError("Nie udało się pobrać liczby list zakupów", "DATABASE_ERROR", countError);
    }

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    // 2. Pobieranie list zakupów z paginacją i sortowaniem
    const { data: lists, error: listsError } = await supabase
      .from("shopping_lists")
      .select("id, title, created_at, updated_at")
      .eq("user_id", userId)
      .order(sortField, { ascending: order === "asc" })
      .range(offset, offset + pageSize - 1);

    if (listsError) {
      logger.error("Błąd podczas pobierania list zakupów", { userId, errorCode: listsError.code }, listsError);
      throw new ShoppingListError("Nie udało się pobrać list zakupów", "DATABASE_ERROR", listsError);
    }

    // 3. Pobieranie liczby elementów dla każdej listy
    const listsWithCounts: ShoppingListSummaryDTO[] = await Promise.all(
      (lists || []).map(async (list) => {
        const { count: itemCount, error: itemCountError } = await supabase
          .from("shopping_list_items")
          .select("*", { count: "exact", head: true })
          .eq("shopping_list_id", list.id);

        if (itemCountError) {
          logger.warn(
            "Błąd podczas liczenia elementów listy",
            { userId, listId: list.id, errorCode: itemCountError.code },
            itemCountError
          );
          // W przypadku błędu przy liczeniu elementów, zakładamy 0
          return {
            id: list.id,
            title: list.title,
            createdAt: list.created_at,
            updatedAt: list.updated_at,
            itemCount: 0,
          };
        }

        return {
          id: list.id,
          title: list.title,
          createdAt: list.created_at,
          updatedAt: list.updated_at,
          itemCount: itemCount || 0,
        };
      })
    );

    // 4. Przygotowanie informacji o paginacji
    const pagination: PaginationResponse = {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize,
    };

    logger.info("Pomyślnie pobrano listy zakupów", {
      userId,
      page,
      pageSize,
      totalItems,
      totalPages,
      listsCount: listsWithCounts.length,
    });

    // 5. Zwrócenie wyników
    return {
      data: listsWithCounts,
      pagination,
    };
  } catch (error) {
    // Przechwytujemy i przekazujemy dalej błędy ShoppingListError
    if (error instanceof ShoppingListError) {
      throw error;
    }

    // Pozostałe błędy opakowujemy w ShoppingListError
    logger.error("Nieoczekiwany błąd podczas pobierania list zakupów", { userId }, error);
    throw new ShoppingListError(
      "Wystąpił nieoczekiwany błąd podczas pobierania list zakupów",
      "UNEXPECTED_ERROR",
      error
    );
  }
}

/**
 * Pobiera szczegóły pojedynczej listy zakupów wraz z elementami
 *
 * @param supabase Klient Supabase
 * @param userId ID użytkownika
 * @param listId ID listy zakupów
 * @returns Szczegóły listy zakupów wraz z elementami
 * @throws {ShoppingListError} Gdy wystąpi błąd podczas pobierania listy zakupów
 */
export async function getShoppingListById(
  supabase: SupabaseClient,
  userId: string,
  listId: string
): Promise<GetShoppingListByIdResponse> {
  logger.info("Rozpoczęcie pobierania szczegółów listy zakupów", { userId, listId });

  try {
    // 1. Pobieranie informacji o liście zakupów
    const { data: shoppingList, error: listError } = await supabase
      .from("shopping_lists")
      .select("id, title, created_at, updated_at")
      .eq("id", listId)
      .eq("user_id", userId)
      .single();

    if (listError) {
      // Przypadek specjalny dla PGSQL code 22P02 (nieprawidłowy UUID)
      if (listError.code === "22P02") {
        logger.warn("Próba dostępu z nieprawidłowym formatem UUID", { userId, listId });
        throw new ShoppingListError("Nieprawidłowy format identyfikatora listy zakupów", "INVALID_UUID", listError);
      }

      // Przypadek specjalny dla "błąd PGRST116" (nie znaleziono rekordu)
      if (listError.code === "PGRST116") {
        logger.warn("Próba dostępu do nieistniejącej listy zakupów", { userId, listId });
        throw new ShoppingListError("Nie znaleziono listy zakupów o podanym ID", "LIST_NOT_FOUND", listError);
      }

      logger.error("Błąd podczas pobierania listy zakupów", { userId, listId, errorCode: listError.code }, listError);
      throw new ShoppingListError("Nie udało się pobrać listy zakupów", "DATABASE_ERROR", listError);
    }

    if (!shoppingList) {
      logger.warn("Nie znaleziono listy zakupów", { userId, listId });
      throw new ShoppingListError("Nie znaleziono listy zakupów o podanym ID", "LIST_NOT_FOUND");
    }

    // 2. Pobieranie elementów listy zakupów
    const { data: items, error: itemsError } = await supabase
      .from("shopping_list_items")
      .select("id, item_name, purchased, created_at, updated_at")
      .eq("shopping_list_id", listId)
      .order("created_at", { ascending: true });

    if (itemsError) {
      logger.error(
        "Błąd podczas pobierania elementów listy zakupów",
        { userId, listId, errorCode: itemsError.code },
        itemsError
      );
      throw new ShoppingListError("Nie udało się pobrać elementów listy zakupów", "DATABASE_ERROR", itemsError);
    }

    // 3. Mapowanie elementów na format DTO
    const itemsDto: ShoppingListItemDTO[] = (items || []).map((item) => ({
      id: item.id,
      itemName: item.item_name,
      purchased: item.purchased,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    // 4. Przygotowanie odpowiedzi
    const result: GetShoppingListByIdResponse = {
      id: shoppingList.id,
      title: shoppingList.title,
      createdAt: shoppingList.created_at,
      updatedAt: shoppingList.updated_at,
      items: itemsDto,
    };

    logger.info("Pomyślnie pobrano szczegóły listy zakupów", {
      userId,
      listId,
      title: shoppingList.title,
      itemsCount: itemsDto.length,
    });

    return result;
  } catch (error) {
    // Przechwytujemy i przekazujemy dalej błędy ShoppingListError
    if (error instanceof ShoppingListError) {
      throw error;
    }

    // Pozostałe błędy opakowujemy w ShoppingListError
    logger.error("Nieoczekiwany błąd podczas pobierania szczegółów listy zakupów", { userId, listId }, error);
    throw new ShoppingListError(
      "Wystąpił nieoczekiwany błąd podczas pobierania szczegółów listy zakupów",
      "UNEXPECTED_ERROR",
      error
    );
  }
}

/**
 * Aktualizuje tytuł listy zakupów
 *
 * @param supabase Klient Supabase
 * @param userId ID użytkownika
 * @param listId ID listy zakupów
 * @param data Dane do aktualizacji
 * @returns Zaktualizowana lista zakupów
 * @throws {ShoppingListError} Gdy wystąpi błąd podczas aktualizacji listy zakupów
 */
export async function updateShoppingList(
  supabase: SupabaseClient,
  userId: string,
  listId: string,
  data: UpdateShoppingListRequest
): Promise<UpdateShoppingListResponse> {
  logger.info("Rozpoczęcie aktualizacji listy zakupów", { userId, listId, title: data.title });

  try {
    // 1. Sprawdzenie czy lista istnieje i należy do użytkownika
    const { error: listError } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("id", listId)
      .eq("user_id", userId)
      .single();

    if (listError) {
      // Przypadek specjalny dla PGSQL code 22P02 (nieprawidłowy UUID)
      if (listError.code === "22P02") {
        logger.warn("Próba aktualizacji z nieprawidłowym formatem UUID", { userId, listId });
        throw new ShoppingListError("Nieprawidłowy format identyfikatora listy zakupów", "INVALID_UUID", listError);
      }

      // Przypadek specjalny dla "błąd PGRST116" (nie znaleziono rekordu)
      if (listError.code === "PGRST116") {
        logger.warn("Próba aktualizacji nieistniejącej listy zakupów", { userId, listId });
        throw new ShoppingListError("Nie znaleziono listy zakupów o podanym ID", "LIST_NOT_FOUND", listError);
      }

      logger.error("Błąd podczas sprawdzania listy zakupów", { userId, listId, errorCode: listError.code }, listError);
      throw new ShoppingListError("Nie udało się zweryfikować listy zakupów", "DATABASE_ERROR", listError);
    }

    // 2. Aktualizacja listy zakupów
    const { data: updatedList, error: updateError } = await supabase
      .from("shopping_lists")
      .update({
        title: data.title,
        updated_at: new Date().toISOString(), // Jawne ustawienie daty aktualizacji
      })
      .eq("id", listId)
      .eq("user_id", userId)
      .select("id, title, updated_at")
      .single();

    if (updateError) {
      logger.error(
        "Błąd podczas aktualizacji listy zakupów",
        { userId, listId, errorCode: updateError.code },
        updateError
      );

      if (updateError.code === "23505") {
        throw new ShoppingListError("Lista zakupów o podanym tytule już istnieje", "DUPLICATE_TITLE", updateError);
      } else {
        throw new ShoppingListError("Nie udało się zaktualizować listy zakupów", "DATABASE_ERROR", updateError);
      }
    }

    if (!updatedList) {
      logger.error("Błąd podczas aktualizacji listy zakupów - brak danych zwrotnych", { userId, listId });
      throw new ShoppingListError(
        "Nie udało się zaktualizować listy zakupów - brak danych zwrotnych",
        "NO_DATA_RETURNED"
      );
    }

    // 3. Przygotowanie odpowiedzi
    const result: UpdateShoppingListResponse = {
      id: updatedList.id,
      title: updatedList.title,
      updatedAt: updatedList.updated_at,
    };

    logger.info("Pomyślnie zaktualizowano listę zakupów", {
      userId,
      listId,
      title: updatedList.title,
    });

    return result;
  } catch (error) {
    // Przechwytujemy i przekazujemy dalej błędy ShoppingListError
    if (error instanceof ShoppingListError) {
      throw error;
    }

    // Pozostałe błędy opakowujemy w ShoppingListError
    logger.error("Nieoczekiwany błąd podczas aktualizacji listy zakupów", { userId, listId }, error);
    throw new ShoppingListError(
      "Wystąpił nieoczekiwany błąd podczas aktualizacji listy zakupów",
      "UNEXPECTED_ERROR",
      error
    );
  }
}

/**
 * Usuwa listę zakupów wraz z jej elementami
 *
 * @param supabase Klient Supabase
 * @param userId ID użytkownika
 * @param listId ID listy zakupów
 * @throws {ShoppingListError} Gdy wystąpi błąd podczas usuwania listy zakupów
 */
export async function deleteShoppingList(supabase: SupabaseClient, userId: string, listId: string): Promise<void> {
  logger.info("Rozpoczęcie usuwania listy zakupów", { userId, listId });

  try {
    // 1. Sprawdzenie czy lista istnieje i należy do użytkownika
    const { data: existingList, error: checkError } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("id", listId)
      .eq("user_id", userId)
      .single();

    if (checkError) {
      // Przypadek specjalny dla PGSQL code 22P02 (nieprawidłowy UUID)
      if (checkError.code === "22P02") {
        logger.warn("Próba usunięcia z nieprawidłowym formatem UUID", { userId, listId });
        throw new ShoppingListError("Nieprawidłowy format identyfikatora listy zakupów", "INVALID_UUID", checkError);
      }

      // Przypadek specjalny dla "błąd PGRST116" (nie znaleziono rekordu)
      if (checkError.code === "PGRST116") {
        logger.warn("Próba usunięcia nieistniejącej listy zakupów", { userId, listId });
        throw new ShoppingListError("Nie znaleziono listy zakupów o podanym ID", "LIST_NOT_FOUND", checkError);
      }

      logger.error(
        "Błąd podczas sprawdzania listy zakupów do usunięcia",
        { userId, listId, errorCode: checkError.code },
        checkError
      );
      throw new ShoppingListError("Nie udało się zweryfikować listy zakupów", "DATABASE_ERROR", checkError);
    }

    if (!existingList) {
      logger.warn("Próba usunięcia nieistniejącej listy zakupów", { userId, listId });
      throw new ShoppingListError("Nie znaleziono listy zakupów o podanym ID", "LIST_NOT_FOUND");
    }

    // 2. Usuwanie listy zakupów - elementy zostaną usunięte automatycznie dzięki ON DELETE CASCADE
    const { error: deleteError } = await supabase
      .from("shopping_lists")
      .delete()
      .eq("id", listId)
      .eq("user_id", userId);

    if (deleteError) {
      logger.error("Błąd podczas usuwania listy zakupów", { userId, listId, errorCode: deleteError.code }, deleteError);
      throw new ShoppingListError("Nie udało się usunąć listy zakupów", "DATABASE_ERROR", deleteError);
    }

    logger.info("Pomyślnie usunięto listę zakupów", { userId, listId });

    // Zwracamy void, ponieważ DELETE nie potrzebuje zwracać danych
    return;
  } catch (error) {
    // Przechwytujemy i przekazujemy dalej błędy ShoppingListError
    if (error instanceof ShoppingListError) {
      throw error;
    }

    // Pozostałe błędy opakowujemy w ShoppingListError
    logger.error("Nieoczekiwany błąd podczas usuwania listy zakupów", { userId, listId }, error);
    throw new ShoppingListError(
      "Wystąpił nieoczekiwany błąd podczas usuwania listy zakupów",
      "UNEXPECTED_ERROR",
      error
    );
  }
}

/**
 * Pobiera szczegóły listy zakupów do wyświetlenia w interfejsie
 *
 * @param supabase Klient Supabase
 * @param userId ID użytkownika
 * @param listId ID listy zakupów
 * @returns Szczegóły listy zakupów w formacie odpowiednim dla interfejsu
 * @throws {ShoppingListError} Gdy wystąpi błąd podczas pobierania listy zakupów
 */
export async function getShoppingListDetails(
  supabase: SupabaseClient,
  userId: string,
  listId: string
): Promise<ShoppingListDetailResponse> {
  logger.info("Pobieranie szczegółów listy zakupów dla klienta", { userId, listId });

  try {
    // Wykorzystujemy istniejącą funkcję getShoppingListById
    const listData = await getShoppingListById(supabase, userId, listId);

    // Konwertujemy do formatu ShoppingListDetailResponse
    const response: ShoppingListDetailResponse = {
      id: listData.id,
      title: listData.title,
      createdAt: listData.createdAt,
      updatedAt: listData.updatedAt,
      items: listData.items,
    };

    logger.info("Pomyślnie pobrano szczegóły listy zakupów dla klienta", { userId, listId });
    return response;
  } catch (error) {
    logger.error("Błąd podczas pobierania szczegółów listy zakupów dla klienta", { userId, listId }, error);

    // Przekazujemy dalej błędy ShoppingListError
    if (error instanceof ShoppingListError) {
      throw error;
    }

    // Inne błędy opakowujemy
    throw new ShoppingListError(
      "Wystąpił nieoczekiwany błąd podczas pobierania szczegółów listy zakupów",
      "UNEXPECTED_ERROR",
      error
    );
  }
}

/**
 * Dodaje nowy element do listy zakupów
 *
 * @param supabase Klient Supabase
 * @param userId ID użytkownika
 * @param listId ID listy zakupów
 * @param data Dane elementu do dodania
 * @returns Nowo dodany element listy zakupów
 * @throws {ShoppingListError} Gdy wystąpi błąd podczas dodawania elementu
 */
export async function addItemToShoppingList(
  supabase: SupabaseClient,
  userId: string,
  listId: string,
  data: { itemName: string; purchased?: boolean }
): Promise<ShoppingListItemDTO> {
  logger.info("Rozpoczęcie dodawania elementu do listy zakupów", { userId, listId, itemName: data.itemName });

  try {
    // 1. Sprawdź, czy lista istnieje i należy do użytkownika
    const { error: listError } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("id", listId)
      .eq("user_id", userId)
      .single();

    if (listError) {
      logger.error("Błąd podczas sprawdzania listy zakupów", { userId, listId, errorCode: listError.code }, listError);
      if (listError.code === "PGRST116") {
        throw new ShoppingListError("Lista zakupów nie istnieje lub brak dostępu", "NOT_FOUND", listError);
      }
      throw new ShoppingListError("Nie udało się zweryfikować listy zakupów", "DATABASE_ERROR", listError);
    }

    // 2. Dodaj element do listy
    const { data: newItem, error: insertError } = await supabase
      .from("shopping_list_items")
      .insert([
        {
          shopping_list_id: listId,
          item_name: data.itemName,
          purchased: data.purchased || false,
        },
      ])
      .select("id, item_name, purchased, created_at, updated_at")
      .single();

    if (insertError) {
      logger.error(
        "Błąd podczas dodawania elementu do listy zakupów",
        { userId, listId, itemName: data.itemName, errorCode: insertError.code },
        insertError
      );
      throw new ShoppingListError("Nie udało się dodać elementu do listy zakupów", "DATABASE_ERROR", insertError);
    }

    logger.info("Pomyślnie dodano element do listy zakupów", {
      userId,
      listId,
      itemId: newItem.id,
      itemName: data.itemName,
    });

    // 3. Zwróć dodany element w formacie DTO
    return {
      id: newItem.id,
      itemName: newItem.item_name,
      purchased: newItem.purchased,
      createdAt: newItem.created_at,
      updatedAt: newItem.updated_at,
    };
  } catch (error) {
    // Przechwytujemy i przekazujemy dalej błędy ShoppingListError
    if (error instanceof ShoppingListError) {
      throw error;
    }

    // Pozostałe błędy opakowujemy w ShoppingListError
    logger.error("Nieoczekiwany błąd podczas dodawania elementu do listy zakupów", { userId, listId }, error);
    throw new ShoppingListError(
      "Wystąpił nieoczekiwany błąd podczas dodawania elementu do listy zakupów",
      "UNEXPECTED_ERROR",
      error
    );
  }
}

/**
 * Aktualizuje element listy zakupów
 *
 * @param supabase Klient Supabase
 * @param userId ID użytkownika
 * @param listId ID listy zakupów
 * @param itemId ID elementu do aktualizacji
 * @param data Dane do aktualizacji
 * @returns Zaktualizowany element listy zakupów
 * @throws {ShoppingListError} Gdy wystąpi błąd podczas aktualizacji elementu
 */
export async function updateShoppingListItem(
  supabase: SupabaseClient,
  userId: string,
  listId: string,
  itemId: string,
  data: { itemName?: string; purchased?: boolean }
): Promise<UpdateShoppingListItemResponse> {
  logger.info("Rozpoczęcie aktualizacji elementu listy zakupów", { userId, listId, itemId, data });

  try {
    // 1. Sprawdź, czy lista istnieje i należy do użytkownika
    const { data: list, error: listError } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("id", listId)
      .eq("user_id", userId)
      .single();

    if (listError) {
      logger.error("Błąd podczas sprawdzania listy zakupów", { userId, listId, errorCode: listError.code }, listError);
      throw new ShoppingListError("Nie znaleziono listy zakupów lub brak uprawnień", "NOT_FOUND", listError);
    }

    if (!list) {
      logger.warn("Lista zakupów nie istnieje lub brak dostępu", { userId, listId });
      throw new ShoppingListError("Nie znaleziono listy zakupów lub brak uprawnień", "NOT_FOUND");
    }

    // 2. Przygotuj dane do aktualizacji
    const updateData: { item_name?: string; purchased?: boolean; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (data.itemName !== undefined) {
      updateData.item_name = data.itemName;
    }

    if (data.purchased !== undefined) {
      updateData.purchased = data.purchased;
    }

    // 3. Wykonaj aktualizację
    const { data: updatedItem, error: updateError } = await supabase
      .from("shopping_list_items")
      .update(updateData)
      .eq("id", itemId)
      .eq("shopping_list_id", listId)
      .select("id, item_name, purchased, updated_at")
      .single();

    if (updateError) {
      logger.error(
        "Błąd podczas aktualizacji elementu listy zakupów",
        { userId, listId, itemId, errorCode: updateError.code },
        updateError
      );
      throw new ShoppingListError("Nie udało się zaktualizować elementu listy zakupów", "DATABASE_ERROR", updateError);
    }

    if (!updatedItem) {
      logger.warn("Element nie istnieje lub brak dostępu", { userId, listId, itemId });
      throw new ShoppingListError("Element nie istnieje lub brak dostępu do jego aktualizacji", "NOT_FOUND");
    }

    logger.info("Pomyślnie zaktualizowano element listy zakupów", {
      userId,
      listId,
      itemId,
      data,
    });

    // 4. Zwróć zaktualizowany element w formacie DTO
    return {
      id: updatedItem.id,
      itemName: updatedItem.item_name,
      purchased: updatedItem.purchased,
      updatedAt: updatedItem.updated_at,
    };
  } catch (error) {
    // Przechwytujemy i przekazujemy dalej błędy ShoppingListError
    if (error instanceof ShoppingListError) {
      throw error;
    }

    // Pozostałe błędy opakowujemy w ShoppingListError
    logger.error("Nieoczekiwany błąd podczas aktualizacji elementu listy zakupów", { userId, listId, itemId }, error);
    throw new ShoppingListError(
      "Wystąpił nieoczekiwany błąd podczas aktualizacji elementu listy zakupów",
      "UNEXPECTED_ERROR",
      error
    );
  }
}

/**
 * Usuwa element z listy zakupów
 *
 * @param supabase Klient Supabase
 * @param userId ID użytkownika
 * @param listId ID listy zakupów
 * @param itemId ID elementu do usunięcia
 * @throws {ShoppingListError} Gdy wystąpi błąd podczas usuwania elementu
 */
export async function deleteShoppingListItem(
  supabase: SupabaseClient,
  userId: string,
  listId: string,
  itemId: string
): Promise<void> {
  logger.info("Rozpoczęcie usuwania elementu z listy zakupów", { userId, listId, itemId });

  try {
    // Usuń element
    const { error: deleteError, count } = await supabase
      .from("shopping_list_items")
      .delete()
      .eq("id", itemId)
      .eq("shopping_list_id", listId);

    if (deleteError) {
      logger.error(
        "Błąd podczas usuwania elementu z listy zakupów",
        { userId, listId, itemId, errorCode: deleteError.code },
        deleteError
      );
      throw new ShoppingListError("Nie udało się usunąć elementu z listy zakupów", "DATABASE_ERROR", deleteError);
    }

    // Sprawdź, czy element został usunięty
    if (count === 0) {
      logger.warn("Element nie został usunięty - nie znaleziono lub brak uprawnień", { userId, listId, itemId });
      throw new ShoppingListError("Element nie istnieje lub brak dostępu do jego usunięcia", "NOT_FOUND");
    }

    logger.info("Pomyślnie usunięto element z listy zakupów", { userId, listId, itemId });
  } catch (error) {
    // Przechwytujemy i przekazujemy dalej błędy ShoppingListError
    if (error instanceof ShoppingListError) {
      throw error;
    }

    // Pozostałe błędy opakowujemy w ShoppingListError
    logger.error("Nieoczekiwany błąd podczas usuwania elementu z listy zakupów", { userId, listId, itemId }, error);
    throw new ShoppingListError(
      "Wystąpił nieoczekiwany błąd podczas usuwania elementu z listy zakupów",
      "UNEXPECTED_ERROR",
      error
    );
  }
}
