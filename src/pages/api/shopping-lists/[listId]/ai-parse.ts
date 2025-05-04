import type { APIRoute } from "astro";
import { OpenRouterService } from "@/lib/openrouter.service";
import { getErrorMessage } from "@/lib/utils/error";
import { supabaseClient } from "@/db/supabase.client";
import type { AstroLocals } from "@/types/locals";

// Define a basic type for the expected AI response structure
interface AiResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  // Add other potential fields if known
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  // Removed request ID and initial log

  // Odczytujemy zmienną środowiskową wewnątrz handlera używając locals.runtime.env
  const OPENROUTER_API_KEY = locals.runtime?.env?.OPENROUTER_API_KEY;
  // Removed log checking for key source

  try {
    // Sprawdź, czy klucz API OpenRouter jest dostępny
    if (!OPENROUTER_API_KEY) {
      // Keep minimal error log for this critical check
      console.error("[ai-parse] OpenRouter API key is missing or not accessible via locals.runtime.env");
      return new Response(
        JSON.stringify({ error: "Configuration error", details: "OpenRouter API key is not configured" }),
        { status: 500 }
      );
    }
    // Removed success log

    // Pobieramy dane uwierzytelniające bezpośrednio z middleware locals
    const { user, isAuthenticated, authUser } = locals as AstroLocals & { isAuthenticated: boolean };

    // Sprawdź, czy użytkownik jest zalogowany
    if (!isAuthenticated || (!user && !authUser)) {
      // Removed warning log
      return new Response(JSON.stringify({ error: "Unauthorized", details: "Użytkownik niezalogowany" }), {
        status: 401,
      });
    }

    // Ustal ID użytkownika (mogą być dwa źródła: user z Supabase i authUser ze zserializowanego DTO)
    const userId = user?.id || authUser?.id;
    // Removed user ID log

    if (!userId) {
      // Removed error log
      return new Response(JSON.stringify({ error: "Unauthorized", details: "Brak ID użytkownika" }), {
        status: 401,
      });
    }

    // Get list ID from params
    const { listId } = params;
    // Removed list ID log
    if (!listId) {
      // Removed error log
      return new Response(JSON.stringify({ error: "List ID is required" }), {
        status: 400,
      });
    }

    // Użyj supabase z locals jeśli dostępne, w przeciwnym razie użyj globalnego klienta
    const supabase = (locals as AstroLocals).supabase || supabaseClient;
    // Removed supabase client obtained log

    // Verify list exists and belongs to user
    // Removed verification log
    const { data: list, error: listError } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("id", listId)
      .eq("user_id", userId)
      .single();

    if (listError) {
      console.error(`[ai-parse] Error fetching list ${listId}: ${listError.message}`); // Keep minimal error log
      return new Response(JSON.stringify({ error: "List not found or access denied", details: listError.message }), {
        status: 404, // Could be 403 or 404 depending on RLS
      });
    }

    if (!list) {
      // Removed warning log
      return new Response(JSON.stringify({ error: "List not found" }), {
        status: 404,
      });
    }
    // Removed ownership verified log

    // Pobierz istniejące produkty z listy zakupów wraz ze statusem purchased
    // Removed fetching items log
    const { data: existingItems, error: itemsError } = await supabase
      .from("shopping_list_items")
      .select("id, item_name, purchased")
      .eq("shopping_list_id", listId)
      .order("created_at", { ascending: true });

    if (itemsError) {
      console.error(`[ai-parse] Error fetching existing items for list ${listId}: ${itemsError.message}`); // Keep minimal error log
      return new Response(JSON.stringify({ error: "Failed to fetch existing products", details: itemsError.message }), {
        status: 500,
      });
    }
    // Removed found items log

    // Get text content from request body
    let body;
    let text: string | undefined;
    try {
      // Removed parsing log
      body = await request.json();
      text = (body as { text: string }).text;
      // Removed received text log
    } catch (_jsonError) {
      // Use underscore for unused var
      console.error(`[ai-parse] Error parsing request body: ${getErrorMessage(_jsonError)}`); // Keep minimal error log
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
      });
    }

    if (!text || typeof text !== "string") {
      // Removed error log
      return new Response(JSON.stringify({ error: "Text content is required" }), {
        status: 400,
      });
    }

    // Przygotuj obecną listę produktów ze statusem purchased
    const productsWithStatus = existingItems.map((item) => ({
      name: item.item_name,
      purchased: item.purchased,
    }));
    const existingProductsFormatted = JSON.stringify(productsWithStatus);
    // Removed formatted items log

    // Initialize OpenRouter service
    let openRouter: OpenRouterService;
    try {
      // Removed initializing log
      // Używamy klucza ze zmiennej środowiskowej odczytanej przez locals.runtime.env
      openRouter = new OpenRouterService(OPENROUTER_API_KEY);
      // Removed initialized log
    } catch (_initError) {
      // Use underscore for unused var
      console.error(`[ai-parse] Failed to initialize OpenRouterService: ${getErrorMessage(_initError)}`); // Keep minimal error log
      return new Response(JSON.stringify({ error: "AI service initialization failed" }), {
        status: 500,
      });
    }

    // Przygotuj zapytanie ręcznie z wymaganymi parametrami
    const requestPayload = {
      model: "openai/gpt-4o",
      messages: [
        {
          role: "system",
          content: `Jesteś asystentem, który ma pomóc zarządzać listą zakupów. Twoje zadanie to:

1. Analizować nowy tekst użytkownika z informacjami o produktach do dodania lub usunięcia.
2. Uwzględniać istniejące produkty na liście wraz z ich statusem (purchased: true/false).
3. Zwrócić **kompletną i finalną** listę produktów po zastosowaniu wszystkich zmian (dodanie, usunięcie, zachowanie).

Zasady:
- Jeżeli jest mowa o określonej ilości (np. "kilogram czereśni"), dodaj tę informację przy produkcie (np. "1 kg czereśni").
- **Kluczowe:** Gdy użytkownik wspomina o usunięciu produktu (np. "nie kupuj masła", "usuń masło", "bez masła", "już mam masło"), **MUSISZ** usunąć ten produkt z finalnej listy. Nie dołączaj go do odpowiedzi.
- Zachowaj wszystkie istniejące produkty, których użytkownik **nie prosił** o usunięcie. Ich status 'purchased' powinien zostać zachowany.
- Nowo dodane produkty powinny mieć status purchased: false (chyba że użytkownik wyraźnie mówi, że już je kupił).
- Usuń duplikaty (case-insensitive, np. "Mleko" i "mleko" to to samo) i ogranicz listę do 50 pozycji.
- Utrzymuj proste nazwy produktów.

Zwróć odpowiedź **wyłącznie** w formacie JSON z tablicą 'products', gdzie każdy produkt ma właściwości 'name' (string) i 'purchased' (boolean). Upewnij się, że odpowiedź to poprawny JSON.`,
        },
        {
          role: "user",
          content: `Istniejące produkty na mojej liście zakupów (format JSON): ${existingProductsFormatted}\n\nPrzetwórz ten tekst i zaktualizuj moją listę zakupów (dodaj nowe produkty, usuń te, o których napisałem, że nie chcę ich kupować): "${text}"`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 1000,
    };
    // Removed prepared payload log

    // Wykonaj zapytanie do OpenRouter
    let response: Response;
    try {
      // Removed sending request log
      response = await fetch(`${openRouter.getBaseUrl()}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouter.getApiKey()}`,
        },
        body: JSON.stringify(requestPayload),
      });
      // Removed received response log
    } catch (_fetchError) {
      // Use underscore for unused var
      console.error(`[ai-parse] Fetch error calling OpenRouter: ${getErrorMessage(_fetchError)}`); // Keep minimal error log
      return new Response(JSON.stringify({ error: "Failed to communicate with AI service" }), { status: 502 }); // Bad Gateway
    }

    if (!response.ok) {
      // let _errorText = "Unknown API error"; // errorText is not used, removed assignment
      try {
        const errorBody = await response.text();
        console.error(
          `[ai-parse] OpenRouter API error response: ${response.status} - ${errorBody.substring(0, 200)}...`
        ); // Log error body
      } catch (_textError) {
        // Use _textError
        console.error(`[ai-parse] OpenRouter API error response: ${response.status}. Failed to read error body.`);
      }
      return new Response(
        JSON.stringify({ error: "Failed to process text with AI", details: `API error: ${response.status}` }),
        {
          status: 500,
        }
      );
    }

    // Parse the response
    let responseData: AiResponse; // Use the defined interface type
    try {
      // Removed parsing log
      responseData = await response.json();
      // Removed success log
    } catch (_parseError) {
      // Use underscore for unused var
      console.error(`[ai-parse] Failed to parse JSON response from AI: ${getErrorMessage(_parseError)}`); // Keep minimal error log
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
      });
    }

    // Sprawdź, czy odpowiedź ma oczekiwaną strukturę
    if (!responseData.choices || !responseData.choices[0]?.message?.content) {
      console.error(
        `[ai-parse] Invalid structure in AI response: Missing choices or content. Data: ${JSON.stringify(responseData).substring(0, 200)}...`
      ); // Keep minimal error log
      return new Response(
        JSON.stringify({ error: "Invalid response from AI", details: "Missing choices or content" }),
        {
          status: 500,
        }
      );
    }

    // Próba parsowania JSON z zawartości wiadomości
    const contentStr = responseData.choices[0].message.content;
    let contentJson: { products: { name: string; purchased: boolean }[] };
    try {
      // Removed parsing log
      contentJson = JSON.parse(contentStr);
      // Removed success log
    } catch (_jsonError) {
      // Use underscore for unused var
      console.error(
        `[ai-parse] Failed to parse JSON content string from AI message: ${getErrorMessage(_jsonError)}. Content: ${contentStr.substring(0, 200)}...`
      ); // Keep minimal error log
      return new Response(JSON.stringify({ error: "Failed to parse AI response content" }), {
        status: 500,
      });
    }

    // Sprawdź, czy zawiera tablicę produktów
    if (!contentJson.products || !Array.isArray(contentJson.products)) {
      console.error(
        `[ai-parse] Parsed content JSON does not contain 'products' array. Content: ${JSON.stringify(contentJson).substring(0, 200)}...`
      ); // Keep minimal error log
      return new Response(
        JSON.stringify({
          error: "Invalid response format",
          details: "Response does not contain products array",
        }),
        { status: 500 }
      );
    }
    // Removed validation log

    // Sprawdź, czy produkty mają wymagane pola
    for (const product of contentJson.products) {
      if (!Object.prototype.hasOwnProperty.call(product, "name")) {
        product.name = "Produkt bez nazwy"; // Default name
      }
      // Jeśli AI nie określiło statusu purchased, ustaw domyślnie na false
      if (!Object.prototype.hasOwnProperty.call(product, "purchased")) {
        product.purchased = false;
      }
    }
    // Removed normalization log

    // 1. Pobierz ponownie istniejące elementy dla pewności (lub użyj `existingItems` pobranych wcześniej)
    const currentItems = existingItems; // Używamy danych pobranych wcześniej
    const aiItems = contentJson.products as { name: string; purchased: boolean }[];

    // Pomocnicza funkcja do normalizacji i porównywania nazw
    const normalizeName = (name: string) => name.trim().toLowerCase();

    // Mapy do szybkiego wyszukiwania
    const currentItemsMap = new Map(currentItems.map((item) => [normalizeName(item.item_name), item]));
    const aiItemsMap = new Map(aiItems.map((item) => [normalizeName(item.name), item]));

    // 2. Oblicz różnice (Diff)
    const itemsToAdd: { item_name: string; purchased: boolean; shopping_list_id: string }[] = [];
    const itemsToDelete: { id: string }[] = [];

    // Znajdź elementy do dodania (są w AI, nie ma ich w obecnych)
    for (const [normalizedName, aiItem] of aiItemsMap.entries()) {
      if (!currentItemsMap.has(normalizedName)) {
        itemsToAdd.push({
          shopping_list_id: listId,
          item_name: aiItem.name.trim(), // Użyj oryginalnej nazwy z AI, ale przyciętej
          purchased: aiItem.purchased,
        });
      }
    }

    // Znajdź elementy do usunięcia (są w obecnych, nie ma ich w AI)
    for (const [normalizedName, currentItem] of currentItemsMap.entries()) {
      if (!aiItemsMap.has(normalizedName)) {
        itemsToDelete.push({ id: currentItem.id });
      }
    }
    // Removed diff calculation log

    // 3. Wywołaj funkcję RPC w Supabase, aby zastosować zmiany w transakcji
    if (itemsToAdd.length > 0 || itemsToDelete.length > 0) {
      // Removed RPC call log
      const { error: rpcError } = await supabase.rpc("apply_shopping_list_changes", {
        p_list_id: listId,
        p_user_id: userId, // Przekazujemy userId do weryfikacji uprawnień w funkcji SQL
        items_to_add: itemsToAdd,
        items_to_delete: itemsToDelete.map((item) => item.id), // Przekazujemy tylko tablicę ID
      });

      if (rpcError) {
        console.error(`[ai-parse] RPC Error applying changes: ${rpcError.message}`); // Keep minimal error log
        return new Response(
          JSON.stringify({ error: "Failed to apply changes atomically", details: rpcError.message }),
          { status: 500 }
        );
      }
      // Removed RPC success log
    } else {
      // Removed skipping RPC log
    }

    // 4. Zwróć nową listę elementów
    // Removed fetching updated items log
    const { data: updatedItems, error: fetchUpdatedError } = await supabase
      .from("shopping_list_items")
      .select("id, item_name, purchased, created_at, updated_at")
      .eq("shopping_list_id", listId)
      .order("created_at", { ascending: true });

    if (fetchUpdatedError) {
      console.error(`[ai-parse] Error fetching updated items for list ${listId}: ${fetchUpdatedError.message}`); // Keep minimal error log
      return new Response(
        JSON.stringify({
          error: "Failed to fetch updated products after applying changes",
          details: fetchUpdatedError.message,
        }),
        { status: 500 } // Zwróć błąd, ale operacje mogły się powieść
      );
    }
    // Removed fetched items count log

    // Mapujemy na format DTO
    const updatedItemsDTO = updatedItems.map((item) => ({
      id: item.id,
      itemName: item.item_name,
      purchased: item.purchased,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    // Removed sending success log
    return new Response(JSON.stringify({ products: updatedItemsDTO }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    // Keep the final catch-all error log
    console.error(`[ai-parse] Unhandled error in main try block: ${errorMessage}`);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: errorMessage }), {
      status: 500,
    });
  }
};
