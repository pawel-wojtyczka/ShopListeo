import type { APIRoute } from "astro";
import { supabaseClient } from "@/db/supabase.client";
import type { AstroLocals } from "@/types/locals";
import { getErrorMessage } from "@/lib/utils/error";

/**
 * Endpoint do usuwania wszystkich elementów z listy zakupów
 *
 * @method DELETE
 * @path /api/shopping-lists/[listId]/clear-items
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  // Dodaję identyfikator żądania dla łatwiejszego śledzenia
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] [clear-items] Otrzymano żądanie DELETE dla listy ${params.listId}`);

  try {
    // Pobieramy dane uwierzytelniające bezpośrednio z middleware locals
    const { user, isAuthenticated, authUser } = locals as AstroLocals & { isAuthenticated: boolean };

    console.log(`[${requestId}] [clear-items] Dane uwierzytelniające z middleware:`, {
      userExists: !!user,
      isAuthenticated,
      authUserExists: !!authUser,
      userId: user?.id || authUser?.id,
    });

    // Sprawdź, czy użytkownik jest zalogowany
    if (!isAuthenticated || (!user && !authUser)) {
      console.error(`[${requestId}] [clear-items] Brak uwierzytelnienia, użytkownik niezalogowany`);
      return new Response(JSON.stringify({ error: "Unauthorized", details: "Użytkownik niezalogowany" }), {
        status: 401,
      });
    }

    // Ustal ID użytkownika (mogą być dwa źródła: user z Supabase i authUser ze zserializowanego DTO)
    const userId = user?.id || authUser?.id;

    if (!userId) {
      console.error(`[${requestId}] [clear-items] Brak ID użytkownika mimo pozytywnej walidacji`);
      return new Response(JSON.stringify({ error: "Unauthorized", details: "Brak ID użytkownika" }), {
        status: 401,
      });
    }

    // Get list ID from params
    const { listId } = params;
    if (!listId) {
      console.error(`[${requestId}] [clear-items] Brak ID listy w parametrach`);
      return new Response(JSON.stringify({ error: "List ID is required" }), {
        status: 400,
      });
    }

    // Użyj supabase z locals jeśli dostępne, w przeciwnym razie użyj globalnego klienta
    const supabase = (locals as AstroLocals).supabase || supabaseClient;

    // Verify list exists and belongs to user
    console.log(`[${requestId}] [clear-items] Weryfikacja czy lista ${listId} należy do użytkownika ${userId}`);
    const { data: list, error: listError } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("id", listId)
      .eq("user_id", userId)
      .single();

    if (listError) {
      console.error(`[${requestId}] [clear-items] Błąd pobierania listy: ${listError.message}`);
      return new Response(JSON.stringify({ error: "List not found", details: listError.message }), {
        status: 404,
      });
    }

    if (!list) {
      console.error(`[${requestId}] [clear-items] Lista nie istnieje lub nie należy do użytkownika`);
      return new Response(JSON.stringify({ error: "List not found" }), {
        status: 404,
      });
    }

    // Usuwanie wszystkich elementów z listy zakupów
    console.log(`[${requestId}] [clear-items] Usuwanie wszystkich elementów z listy ${listId}`);
    const { error: deleteError } = await supabase.from("shopping_list_items").delete().eq("shopping_list_id", listId);

    if (deleteError) {
      console.error(`[${requestId}] [clear-items] Błąd usuwania elementów: ${deleteError.message}`);
      return new Response(
        JSON.stringify({ error: "Failed to clear shopping list items", details: deleteError.message }),
        { status: 500 }
      );
    }

    console.log(`[${requestId}] [clear-items] Pomyślnie usunięto wszystkie elementy z listy ${listId}`);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch (error) {
    console.error(`[${requestId}] [clear-items] Nieobsłużony błąd: ${getErrorMessage(error)}`);
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
    });
  }
};
