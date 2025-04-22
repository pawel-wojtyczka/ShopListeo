import type { APIRoute } from "astro";
import { supabaseAdminClient } from "@/db/supabase.server"; // Zmieniono ścieżkę importu
import type {
  ShoppingListDetailResponse,
  ShoppingListItemDTO,
  ShoppingListItem,
  UpdateShoppingListResponse,
} from "@/types"; // Dodaj import ShoppingListItem
import { z } from "zod"; // Import Zod do walidacji

// Schemat walidacji dla PUT
const updateListSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").max(255, "Title too long"),
});

export const GET: APIRoute = async ({ params, request }) => {
  const listId = params.id;

  if (!listId) {
    return new Response(JSON.stringify({ error: "List ID is required" }), { status: 400 });
  }

  // 1. Weryfikacja autentykacji użytkownika
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid token" }), {
      status: 401,
      headers: { "WWW-Authenticate": 'Bearer realm="ShopListeo"' }, // Wskazówka dla klienta
    });
  }
  const token = authHeader.split(" ")[1];

  const { data: userData, error: userError } = await supabaseAdminClient.auth.getUser(token);

  if (userError || !userData.user) {
    console.error("[API GET /shopping-lists/:id] Auth Error:", userError?.message);
    const status = userError?.message.includes("invalid") ? 401 : 500;
    return new Response(JSON.stringify({ error: `Unauthorized: ${userError?.message || "Could not get user"}` }), {
      status,
    });
  }
  const userId = userData.user.id;

  try {
    // 2. Pobranie danych listy zakupów
    const { data: listData, error: listError } = await supabaseAdminClient
      .from("shopping_lists")
      .select("id, title, created_at, updated_at")
      .eq("id", listId)
      .eq("user_id", userId) // Upewnij się, że lista należy do użytkownika
      .single(); // Oczekujemy jednego wyniku

    if (listError) {
      console.error("[API GET /shopping-lists/:id] List Fetch Error:", listError.message);
      // Jeśli błąd to "PGRST116" (PostgREST: Row Not Found), zwróć 404
      if (listError.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Shopping list not found" }), { status: 404 });
      }
      // Inne błędy bazy danych
      return new Response(JSON.stringify({ error: "Database error fetching list" }), { status: 500 });
    }

    if (!listData) {
      // Teoretycznie .single() powinno rzucić błąd PGRST116, ale dla pewności
      return new Response(JSON.stringify({ error: "Shopping list not found" }), { status: 404 });
    }

    // 3. Pobranie elementów listy zakupów
    const { data: itemsData, error: itemsError } = await supabaseAdminClient
      .from("shopping_list_items")
      // Jawnie wybierz pola zgodne z typem ShoppingListItem, aby uniknąć niejawnego 'any'
      .select<string, Omit<ShoppingListItem, "user_id" | "shopping_list_id">>(
        "id, item_name, purchased, created_at, updated_at"
      )
      .eq("shopping_list_id", listId)
      .order("created_at", { ascending: true }); // Sortuj wg daty utworzenia

    if (itemsError) {
      console.error("[API GET /shopping-lists/:id] Items Fetch Error:", itemsError.message);
      return new Response(JSON.stringify({ error: "Database error fetching list items" }), { status: 500 });
    }

    // 4. Formatowanie odpowiedzi zgodnie z ShoppingListDetailResponse
    const responseBody: ShoppingListDetailResponse = {
      id: listData.id,
      title: listData.title,
      createdAt: listData.created_at,
      updatedAt: listData.updated_at,
      items: (itemsData || []).map(
        // Jawne typowanie 'item' na podstawie zdefiniowanego selecta
        (item): ShoppingListItemDTO => ({
          id: item.id,
          itemName: item.item_name, // Mapowanie item_name -> itemName
          purchased: item.purchased,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })
      ),
    };

    // 5. Zwrócenie odpowiedzi
    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[API GET /shopping-lists/:id] Unexpected Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

// --- PUT Handler (Aktualizacja tytułu listy) ---
export const PUT: APIRoute = async ({ params, request }) => {
  const listId = params.id;

  if (!listId) {
    return new Response(JSON.stringify({ error: "List ID is required" }), { status: 400 });
  }

  // 1. Weryfikacja autentykacji
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid token" }), { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const { data: userData, error: userError } = await supabaseAdminClient.auth.getUser(token);
  if (userError || !userData.user) {
    console.error("[API PUT /shopping-lists/:id] Auth Error:", userError?.message);
    return new Response(JSON.stringify({ error: `Unauthorized: ${userError?.message || "Could not get user"}` }), {
      status: userError?.message.includes("invalid") ? 401 : 500,
    });
  }
  const userId = userData.user.id;

  try {
    // 2. Parsowanie i walidacja ciała żądania
    const body = await request.json();
    const validationResult = updateListSchema.safeParse(body);

    if (!validationResult.success) {
      console.warn("[API PUT /shopping-lists/:id] Validation Error:", validationResult.error.format());
      return new Response(JSON.stringify({ error: "Invalid input", details: validationResult.error.format() }), {
        status: 400,
      });
    }

    const { title } = validationResult.data;

    // 3. Aktualizacja listy w bazie danych
    const { data: updatedListData, error: updateError } = await supabaseAdminClient
      .from("shopping_lists")
      .update({ title: title, updated_at: new Date().toISOString() }) // Ustaw nowy tytuł i zaktualizuj datę
      .eq("id", listId)
      .eq("user_id", userId) // Upewnij się, że aktualizujemy listę tego użytkownika
      .select("id, title, created_at, updated_at") // Zwróć zaktualizowane dane
      .single();

    if (updateError) {
      console.error("[API PUT /shopping-lists/:id] Update Error:", updateError.message);
      if (updateError.code === "PGRST116") {
        // Błąd 'Row Not Found' prawdopodobnie oznacza, że listId jest nieprawidłowe lub lista nie należy do użytkownika
        return new Response(JSON.stringify({ error: "Shopping list not found or access denied" }), { status: 404 });
      }
      // Można dodać obsługę potencjalnego błędu unikalności tytułu, jeśli istnieje takie ograniczenie
      // if (updateError.code === '23505') { // Unique violation
      //   return new Response(JSON.stringify({ error: "List title already exists" }), { status: 409 });
      // }
      return new Response(JSON.stringify({ error: "Database error updating list" }), { status: 500 });
    }

    if (!updatedListData) {
      // Dodatkowe zabezpieczenie, chociaż .single() powinno rzucić błąd
      return new Response(JSON.stringify({ error: "Shopping list not found after update" }), { status: 404 });
    }

    // 4. Formatowanie odpowiedzi
    const responseBody: UpdateShoppingListResponse = {
      id: updatedListData.id,
      title: updatedListData.title,
      updatedAt: updatedListData.updated_at,
    };

    // 5. Zwrócenie odpowiedzi
    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Błąd parsowania JSON lub inny nieoczekiwany błąd
    console.error("[API PUT /shopping-lists/:id] Unexpected Error:", error);
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
    }
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

// --- DELETE Handler (Usuwanie listy) ---
export const DELETE: APIRoute = async ({ params, request }) => {
  const listId = params.id;

  if (!listId) {
    return new Response(JSON.stringify({ error: "List ID is required" }), { status: 400 });
  }

  // 1. Weryfikacja autentykacji
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid token" }), { status: 401 });
  }
  const token = authHeader.split(" ")[1];
  const { data: userData, error: userError } = await supabaseAdminClient.auth.getUser(token);
  if (userError || !userData.user) {
    console.error("[API DELETE /shopping-lists/:id] Auth Error:", userError?.message);
    return new Response(JSON.stringify({ error: `Unauthorized: ${userError?.message || "Could not get user"}` }), {
      status: userError?.message.includes("invalid") ? 401 : 500,
    });
  }
  const userId = userData.user.id;

  try {
    // 2. Usuwanie listy z bazy danych
    // Usuwamy tylko jeśli listId i userId się zgadzają
    const { error: deleteError, count } = await supabaseAdminClient
      .from("shopping_lists")
      .delete()
      .eq("id", listId)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("[API DELETE /shopping-lists/:id] Delete Error:", deleteError.message);
      return new Response(JSON.stringify({ error: "Database error deleting list" }), { status: 500 });
    }

    // Sprawdź, czy cokolwiek zostało usunięte. Jeśli nie (count === 0), lista nie została znaleziona lub nie należała do użytkownika.
    if (count === 0) {
      console.warn("[API DELETE /shopping-lists/:id] List not found or access denied for deletion:", {
        listId,
        userId,
      });
      return new Response(JSON.stringify({ error: "Shopping list not found or access denied" }), { status: 404 });
    }

    // 3. Zwrócenie odpowiedzi 204 No Content
    console.log(`[API DELETE /shopping-lists/:id] List ${listId} deleted successfully by user ${userId}`);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[API DELETE /shopping-lists/:id] Unexpected Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
