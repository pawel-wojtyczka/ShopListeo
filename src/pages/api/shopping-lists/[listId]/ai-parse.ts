import type { APIRoute } from "astro";
import { OpenRouterService } from "@/lib/openrouter.service";
import { getErrorMessage } from "@/lib/utils/error";
import { supabaseClient } from "@/db/supabase.client";
import type { AstroLocals } from "@/types/locals";

// Pobieramy klucz API ze zmiennych środowiskowych
const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;

export const POST: APIRoute = async ({ params, request, locals }) => {
  const requestId = crypto.randomUUID().substring(0, 8); // Short ID for logs
  console.log(`[${requestId}] [ai-parse] Received request`);

  try {
    // Sprawdź, czy klucz API OpenRouter jest dostępny
    if (!OPENROUTER_API_KEY) {
      console.error(`[${requestId}] [ai-parse] OpenRouter API key is missing!`);
      return new Response(
        JSON.stringify({ error: "Configuration error", details: "OpenRouter API key is not configured" }),
        { status: 500 }
      );
    }
    console.log(`[${requestId}] [ai-parse] OpenRouter API key check passed.`);

    // Pobieramy dane uwierzytelniające bezpośrednio z middleware locals
    const { user, isAuthenticated, authUser } = locals as AstroLocals & { isAuthenticated: boolean };

    // Sprawdź, czy użytkownik jest zalogowany
    if (!isAuthenticated || (!user && !authUser)) {
      console.warn(`[${requestId}] [ai-parse] Unauthorized access attempt.`);
      return new Response(JSON.stringify({ error: "Unauthorized", details: "Użytkownik niezalogowany" }), {
        status: 401,
      });
    }

    // Ustal ID użytkownika (mogą być dwa źródła: user z Supabase i authUser ze zserializowanego DTO)
    const userId = user?.id || authUser?.id;
    console.log(`[${requestId}] [ai-parse] User ID: ${userId || "Not Found"}`);

    if (!userId) {
      console.error(`[${requestId}] [ai-parse] User ID is missing after auth check.`);
      return new Response(JSON.stringify({ error: "Unauthorized", details: "Brak ID użytkownika" }), {
        status: 401,
      });
    }

    // Get list ID from params
    const { listId } = params;
    console.log(`[${requestId}] [ai-parse] List ID: ${listId}`);
    if (!listId) {
      console.error(`[${requestId}] [ai-parse] List ID is missing from params.`);
      return new Response(JSON.stringify({ error: "List ID is required" }), {
        status: 400,
      });
    }

    // Użyj supabase z locals jeśli dostępne, w przeciwnym razie użyj globalnego klienta
    const supabase = (locals as AstroLocals).supabase || supabaseClient;
    console.log(`[${requestId}] [ai-parse] Supabase client obtained.`);

    // Verify list exists and belongs to user
    console.log(`[${requestId}] [ai-parse] Verifying list ${listId} ownership for user ${userId}...`);
    const { data: list, error: listError } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("id", listId)
      .eq("user_id", userId)
      .single();

    if (listError) {
      console.error(`[${requestId}] [ai-parse] Error fetching list: ${listError.message}`);
      return new Response(JSON.stringify({ error: "List not found or access denied", details: listError.message }), {
        status: 404, // Could be 403 or 404 depending on RLS
      });
    }

    if (!list) {
      console.warn(`[${requestId}] [ai-parse] List ${listId} not found for user ${userId}.`);
      return new Response(JSON.stringify({ error: "List not found" }), {
        status: 404,
      });
    }
    console.log(`[${requestId}] [ai-parse] List ${listId} ownership verified.`);

    // Pobierz istniejące produkty z listy zakupów wraz ze statusem purchased
    console.log(`[${requestId}] [ai-parse] Fetching existing items for list ${listId}...`);
    const { data: existingItems, error: itemsError } = await supabase
      .from("shopping_list_items")
      .select("id, item_name, purchased")
      .eq("shopping_list_id", listId)
      .order("created_at", { ascending: true });

    if (itemsError) {
      console.error(`[${requestId}] [ai-parse] Error fetching existing items: ${itemsError.message}`);
      return new Response(JSON.stringify({ error: "Failed to fetch existing products", details: itemsError.message }), {
        status: 500,
      });
    }
    console.log(`[${requestId}] [ai-parse] Found ${existingItems?.length ?? 0} existing items.`);

    // Get text content from request body
    let body;
    let text: string | undefined;
    try {
      console.log(`[${requestId}] [ai-parse] Parsing request body...`);
      body = await request.json();
      text = (body as { text: string }).text;
      console.log(`[${requestId}] [ai-parse] Received text: "${text ? text.substring(0, 50) + "..." : "undefined"}"`);
    } catch (jsonError) {
      console.error(`[${requestId}] [ai-parse] Error parsing request body: ${getErrorMessage(jsonError)}`);
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
      });
    }

    if (!text || typeof text !== "string") {
      console.error(`[${requestId}] [ai-parse] Text content is missing or invalid.`);
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
    console.log(
      `[${requestId}] [ai-parse] Formatted existing items for AI: ${existingProductsFormatted.substring(0, 100)}...`
    );

    // Initialize OpenRouter service
    let openRouter: OpenRouterService;
    try {
      console.log(`[${requestId}] [ai-parse] Initializing OpenRouterService...`);
      // Używamy klucza ze zmiennej środowiskowej
      openRouter = new OpenRouterService(OPENROUTER_API_KEY);
      console.log(`[${requestId}] [ai-parse] OpenRouterService initialized.`);
    } catch (initError) {
      console.error(`[${requestId}] [ai-parse] Failed to initialize OpenRouterService: ${getErrorMessage(initError)}`);
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
    console.log(`[${requestId}] [ai-parse] Prepared payload for OpenRouter.`);

    // Wykonaj zapytanie do OpenRouter
    let response: Response;
    try {
      console.log(
        `[${requestId}] [ai-parse] Sending request to OpenRouter: ${openRouter.getBaseUrl()}/chat/completions`
      );
      response = await fetch(`${openRouter.getBaseUrl()}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouter.getApiKey()}`,
        },
        body: JSON.stringify(requestPayload),
      });
      console.log(`[${requestId}] [ai-parse] Received response from OpenRouter. Status: ${response.status}`);
    } catch (fetchError) {
      console.error(`[${requestId}] [ai-parse] Fetch error calling OpenRouter: ${getErrorMessage(fetchError)}`);
      return new Response(JSON.stringify({ error: "Failed to communicate with AI service" }), { status: 502 }); // Bad Gateway
    }

    if (!response.ok) {
      let errorText = "Unknown API error";
      try {
        errorText = await response.text();
        console.error(
          `[${requestId}] [ai-parse] OpenRouter API error response: ${response.status} - ${errorText.substring(0, 200)}...`
        );
      } catch (textError) {
        console.error(
          `[${requestId}] [ai-parse] OpenRouter API error response: ${response.status}. Failed to read error body.`
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to process text with AI", details: `API error: ${response.status}` }),
        {
          status: 500, // Keep 500 or use 502?
        }
      );
    }

    // Parse the response
    let responseData: any;
    try {
      console.log(`[${requestId}] [ai-parse] Parsing AI response body...`);
      responseData = await response.json();
      console.log(`[${requestId}] [ai-parse] Parsed AI response successfully.`);
    } catch (parseError) {
      console.error(`[${requestId}] [ai-parse] Failed to parse JSON response from AI: ${getErrorMessage(parseError)}`);
      return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
        status: 500,
      });
    }

    // Sprawdź, czy odpowiedź ma oczekiwaną strukturę
    if (!responseData.choices || !responseData.choices[0]?.message?.content) {
      console.error(
        `[${requestId}] [ai-parse] Invalid structure in AI response: Missing choices or content. Data: ${JSON.stringify(responseData).substring(0, 200)}...`
      );
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
      console.log(`[${requestId}] [ai-parse] Parsing content string from AI message...`);
      contentJson = JSON.parse(contentStr);
      console.log(`[${requestId}] [ai-parse] Parsed content string successfully.`);
    } catch (jsonError) {
      console.error(
        `[${requestId}] [ai-parse] Failed to parse JSON content string from AI message: ${getErrorMessage(jsonError)}. Content: ${contentStr.substring(0, 200)}...`
      );
      return new Response(JSON.stringify({ error: "Failed to parse AI response content" }), {
        status: 500,
      });
    }

    // Sprawdź, czy zawiera tablicę produktów
    if (!contentJson.products || !Array.isArray(contentJson.products)) {
      console.error(
        `[${requestId}] [ai-parse] Parsed content JSON does not contain 'products' array. Content: ${JSON.stringify(contentJson).substring(0, 200)}...`
      );
      return new Response(
        JSON.stringify({
          error: "Invalid response format",
          details: "Response does not contain products array",
        }),
        { status: 500 }
      );
    }
    console.log(`[${requestId}] [ai-parse] Validated 'products' array in AI response.`);

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
    console.log(`[${requestId}] [ai-parse] Normalized products from AI response.`);

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
    console.log(
      `[${requestId}] [ai-parse] Calculated diff: ${itemsToAdd.length} items to add, ${itemsToDelete.length} items to delete.`
    );

    // 3. Wywołaj funkcję RPC w Supabase, aby zastosować zmiany w transakcji
    if (itemsToAdd.length > 0 || itemsToDelete.length > 0) {
      console.log(`[${requestId}] [ai-parse] Calling RPC 'apply_shopping_list_changes'...`);
      const { error: rpcError } = await supabase.rpc("apply_shopping_list_changes", {
        p_list_id: listId,
        p_user_id: userId, // Przekazujemy userId do weryfikacji uprawnień w funkcji SQL
        items_to_add: itemsToAdd,
        items_to_delete: itemsToDelete.map((item) => item.id), // Przekazujemy tylko tablicę ID
      });

      if (rpcError) {
        console.error(`[${requestId}] [ai-parse] RPC Error applying changes: ${rpcError.message}`);
        return new Response(
          JSON.stringify({ error: "Failed to apply changes atomically", details: rpcError.message }),
          { status: 500 }
        );
      }
      console.log(`[${requestId}] [ai-parse] RPC 'apply_shopping_list_changes' successful.`);
    } else {
      console.log(`[${requestId}] [ai-parse] No changes detected, skipping RPC call.`);
    }

    // 4. Zwróć nową listę elementów
    console.log(`[${requestId}] [ai-parse] Fetching updated items list...`);
    const { data: updatedItems, error: fetchUpdatedError } = await supabase
      .from("shopping_list_items")
      .select("id, item_name, purchased, created_at, updated_at")
      .eq("shopping_list_id", listId)
      .order("created_at", { ascending: true });

    if (fetchUpdatedError) {
      console.error(`[${requestId}] [ai-parse] Error fetching updated items: ${fetchUpdatedError.message}`);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch updated products after applying changes",
          details: fetchUpdatedError.message,
        }),
        { status: 500 } // Zwróć błąd, ale operacje mogły się powieść
      );
    }
    console.log(`[${requestId}] [ai-parse] Fetched ${updatedItems?.length ?? 0} updated items.`);

    // Mapujemy na format DTO
    const updatedItemsDTO = updatedItems.map((item) => ({
      id: item.id,
      itemName: item.item_name,
      purchased: item.purchased,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    console.log(`[${requestId}] [ai-parse] Sending successful response with updated items.`);
    return new Response(JSON.stringify({ products: updatedItemsDTO }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error(`[${requestId}] [ai-parse] Unhandled error in main try block: ${errorMessage}`);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: errorMessage }), {
      status: 500,
    });
  }
};
