import type { APIRoute } from "astro";
import { supabaseAdminClient } from "@/db/supabase.server"; // Zmieniono ścieżkę importu
import type { ShoppingListDetailResponse, ShoppingListItemDTO, ShoppingListItem } from "@/types"; // Dodaj import ShoppingListItem

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
