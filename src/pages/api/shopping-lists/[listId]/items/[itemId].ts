import type { APIRoute } from "astro";
import { supabaseAdminClient } from "@/db/supabase.server";
import type {
  UpdateShoppingListItemRequest,
  UpdateShoppingListItemResponse,
  // ShoppingListItemDTO,
  // ShoppingListItem,
} from "@/types";
import { z } from "zod";

// Schemat walidacji dla PUT (aktualizacja elementu)
const updateItemSchema = z
  .object({
    // Używamy .optional(), bo możemy aktualizować tylko nazwę lub tylko status, lub oba
    itemName: z.string().trim().min(1, "Item name cannot be empty").max(128, "Item name too long").optional(),
    purchased: z.boolean().optional(),
  })
  .refine((data) => data.itemName !== undefined || data.purchased !== undefined, {
    message: "At least one field (itemName or purchased) must be provided for update",
  });

// Funkcja pomocnicza do weryfikacji, czy lista należy do użytkownika
async function verifyListOwnership(listId: string, userId: string): Promise<boolean> {
  const { error, count } = await supabaseAdminClient
    .from("shopping_lists")
    .select("id", { count: "exact" })
    .eq("id", listId)
    .eq("user_id", userId);

  if (error) {
    console.error("[API Item] Error verifying list ownership:", error.message);
    return false; // Zwracamy false przy błędzie zapytania
  }
  return count !== null && count > 0;
}

// --- PUT Handler (Aktualizacja elementu listy) ---
export const PUT: APIRoute = async ({ params, request }) => {
  const { listId, itemId } = params;

  if (!listId || !itemId) {
    return new Response(JSON.stringify({ error: "List ID and Item ID are required" }), { status: 400 });
  }

  // 1. Weryfikacja autentykacji
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid token" }), { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const { data: userData, error: userError } = await supabaseAdminClient.auth.getUser(token);
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: `Unauthorized: ${userError?.message || "Could not get user"}` }), {
      status: userError?.message.includes("invalid") ? 401 : 500,
    });
  }
  const userId = userData.user.id;

  try {
    // 2. Weryfikacja, czy lista należy do użytkownika
    const isOwner = await verifyListOwnership(listId, userId);
    if (!isOwner) {
      console.warn(`[API PUT Item] User ${userId} attempt to modify item ${itemId} in list ${listId} they don't own.`);
      return new Response(JSON.stringify({ error: "Forbidden: You do not own the parent list" }), { status: 403 });
    }

    // 3. Parsowanie i walidacja ciała żądania
    const body = await request.json();
    const validationResult = updateItemSchema.safeParse(body);

    if (!validationResult.success) {
      console.warn("[API PUT Item] Validation Error:", validationResult.error.format());
      return new Response(JSON.stringify({ error: "Invalid input", details: validationResult.error.format() }), {
        status: 400,
      });
    }

    // Przygotuj dane do aktualizacji (tylko te pola, które przyszły w żądaniu)
    const updateData: Partial<UpdateShoppingListItemRequest> = {};
    if (validationResult.data.itemName !== undefined) {
      updateData.itemName = validationResult.data.itemName;
    }
    if (validationResult.data.purchased !== undefined) {
      updateData.purchased = validationResult.data.purchased;
    }

    // Przygotuj obiekt z poprawnymi nazwami kolumn dla bazy danych
    const dbUpdatePayload: { updated_at: string; item_name?: string; purchased?: boolean } = {
      updated_at: new Date().toISOString(),
    };
    if (updateData.itemName !== undefined) {
      dbUpdatePayload.item_name = updateData.itemName;
    }
    if (updateData.purchased !== undefined) {
      dbUpdatePayload.purchased = updateData.purchased;
    }

    // 4. Aktualizacja elementu w bazie danych
    const { data: updatedItemData, error: updateError } = await supabaseAdminClient
      .from("shopping_list_items")
      .update(dbUpdatePayload) // Użyj obiektu z poprawnymi nazwami kolumn
      .eq("id", itemId)
      .eq("shopping_list_id", listId) // Upewnij się, że aktualizujemy element w tej liście
      .select("id, item_name, purchased, created_at, updated_at")
      .single();

    if (updateError) {
      console.error("[API PUT Item] Update Error:", updateError.message);
      if (updateError.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Shopping list item not found" }), { status: 404 });
      }
      return new Response(JSON.stringify({ error: "Database error updating item" }), { status: 500 });
    }

    if (!updatedItemData) {
      return new Response(JSON.stringify({ error: "Shopping list item not found after update" }), { status: 404 });
    }

    // 5. Formatowanie odpowiedzi
    const responseBody: UpdateShoppingListItemResponse = {
      id: updatedItemData.id,
      itemName: updatedItemData.item_name, // Mapowanie powrotne
      purchased: updatedItemData.purchased,
      // createdAt nie jest częścią UpdateShoppingListItemResponse
      updatedAt: updatedItemData.updated_at,
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[API PUT Item] Unexpected Error:", error);
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

// --- DELETE Handler (Usuwanie elementu listy) ---
export const DELETE: APIRoute = async ({ params, request }) => {
  const { listId, itemId } = params;

  if (!listId || !itemId) {
    return new Response(JSON.stringify({ error: "List ID and Item ID are required" }), { status: 400 });
  }

  // 1. Weryfikacja autentykacji
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid token" }), { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const { data: userData, error: userError } = await supabaseAdminClient.auth.getUser(token);
  if (userError || !userData.user) {
    return new Response(JSON.stringify({ error: `Unauthorized: ${userError?.message || "Could not get user"}` }), {
      status: userError?.message.includes("invalid") ? 401 : 500,
    });
  }
  const userId = userData.user.id;

  try {
    // 2. Weryfikacja, czy lista należy do użytkownika (ważne dla bezpieczeństwa DELETE)
    const isOwner = await verifyListOwnership(listId, userId);
    if (!isOwner) {
      console.warn(
        `[API DELETE Item] User ${userId} attempt to delete item ${itemId} from list ${listId} they don't own.`
      );
      return new Response(JSON.stringify({ error: "Forbidden: You do not own the parent list" }), { status: 403 });
    }

    // 3. Usuwanie elementu z bazy danych
    const { error: deleteError, count } = await supabaseAdminClient
      .from("shopping_list_items")
      .delete()
      .eq("id", itemId)
      .eq("shopping_list_id", listId);

    if (deleteError) {
      console.error("[API DELETE Item] Delete Error:", deleteError.message);
      return new Response(JSON.stringify({ error: "Database error deleting item" }), { status: 500 });
    }

    // Sprawdź, czy cokolwiek zostało usunięte.
    if (count === 0) {
      console.warn("[API DELETE Item] Item not found for deletion:", { listId, itemId });
      // Zwracamy 404, bo element o podanym ID w tej liście nie istnieje
      return new Response(JSON.stringify({ error: "Shopping list item not found" }), { status: 404 });
    }

    // 4. Zwrócenie odpowiedzi 204 No Content
    console.log(`[API DELETE Item] Item ${itemId} from list ${listId} deleted successfully by user ${userId}`);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[API DELETE Item] Unexpected Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
