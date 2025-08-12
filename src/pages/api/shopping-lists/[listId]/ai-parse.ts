import type { APIRoute } from "astro";
import { OpenRouterService } from "@/lib/services/openrouter.service";
import { getErrorMessage } from "@/lib/utils/error";
import { supabaseClient } from "@/db/supabase.client";
import type { AstroLocals } from "@/types/locals";
import { logger } from "@/lib/logger";

// Definiuje podstawowy typ dla oczekiwanej struktury odpowiedzi AI
interface AiResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  // Tutaj można dodać inne potencjalne pola, jeśli są znane
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  const requestId = crypto.randomUUID();
  logger.info("[API AI Parse] Received POST request", { 
    requestId,
    listId: params?.listId,
    method: request.method 
  });

  // Odczytujemy zmienną środowiskową z kluczem API OpenRouter.
  // W trybie deweloperskim ('development'), klucz jest pobierany bezpośrednio z `import.meta.env`.
  // W trybie produkcyjnym lub innym, klucz jest pobierany z `locals.runtime.env`,
  // które jest wypełniane przez mechanizmy Astro dla środowisk serverless (np. Cloudflare).
  let OPENROUTER_API_KEY: string | undefined;

  if (import.meta.env.DEV) {
    // Używamy import.meta.env.DEV dla jasności
    OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;
    logger.debug("[API AI Parse] Using development environment", { 
      requestId,
      hasApiKey: !!OPENROUTER_API_KEY,
      apiKeyLength: OPENROUTER_API_KEY?.length || 0
    });
  } else {
    // W środowisku innym niż deweloperskie (np. produkcja na Cloudflare)
    // Astro przekazuje zmienne środowiskowe poprzez locals.runtime.env
    const potentialKey = locals.runtime?.env?.OPENROUTER_API_KEY;
    // Sprawdzamy, czy klucz jest stringiem, aby uniknąć błędów typu.
    if (typeof potentialKey === "string") {
      OPENROUTER_API_KEY = potentialKey;
    }
    logger.debug("[API AI Parse] Using production environment", { 
      requestId,
      hasApiKey: !!OPENROUTER_API_KEY,
      apiKeyLength: OPENROUTER_API_KEY?.length || 0
    });
    // Jeśli klucz nie jest stringiem (np. undefined lub inny typ), OPENROUTER_API_KEY pozostanie undefined.
  }

  try {
    // Sprawdza, czy klucz API OpenRouter został poprawnie załadowany.
    // Jest to krytyczny warunek do dalszego działania funkcji.
    if (!OPENROUTER_API_KEY) {
      // Jeśli klucz API nie jest dostępny, zwracamy błąd 500 (Internal Server Error),
      // wskazując na problem z konfiguracją serwera.
      logger.error("[API AI Parse] CRITICAL: OpenRouter API key is missing", { requestId });
      return new Response(
        JSON.stringify({ error: "Configuration error", details: "OpenRouter API key is not configured" }),
        { status: 500 }
      );
    }

    // Pobieramy dane uwierzytelniające użytkownika z `locals` dostarczonych przez middleware Astro.
    // `isAuthenticated` to flaga wskazująca, czy użytkownik jest zalogowany.
    // `user` to obiekt użytkownika z bazy danych Supabase.
    // `authUser` to obiekt DTO użytkownika, jeśli serializowany w middleware.
    const { user, isAuthenticated, authUser } = locals as AstroLocals & { isAuthenticated: boolean };

    logger.debug("[API AI Parse] Authentication check", { 
      requestId,
      isAuthenticated,
      hasUser: !!user,
      hasAuthUser: !!authUser
    });

    // Sprawdza, czy użytkownik jest zalogowany.
    // Dostęp do tej funkcji jest możliwy tylko dla uwierzytelnionych użytkowników.
    if (!isAuthenticated || (!user && !authUser)) {
      // Jeśli użytkownik nie jest zalogowany, zwracamy błąd 401 (Unauthorized).
      logger.warn("[API AI Parse] Unauthorized access attempt", { requestId });
      return new Response(JSON.stringify({ error: "Unauthorized", details: "Użytkownik niezalogowany" }), {
        status: 401,
      });
    }

    // Ustala ID użytkownika.
    // ID może pochodzić z obiektu `user` (z Supabase) lub `authUser` (zserializowane DTO).
    // Jest to niezbędne do weryfikacji uprawnień do listy zakupów.
    const userId = user?.id || authUser?.id;

    logger.info("[API AI Parse] User authenticated", { 
      requestId,
      userId,
      listId: params?.listId
    });

    // Sprawdza, czy udało się ustalić ID użytkownika.
    // Jest to dodatkowe zabezpieczenie, choć teoretycznie nie powinno wystąpić, jeśli `isAuthenticated` jest true.
    if (!userId) {
      logger.error("[API AI Parse] CRITICAL: Could not determine User ID after authentication check", { requestId });
      return new Response(JSON.stringify({ error: "Unauthorized", details: "Brak ID użytkownika" }), {
        status: 401,
      });
    }

    // Pobiera ID listy zakupów z parametrów ścieżki URL.
    const { listId } = params;
    // Sprawdza, czy ID listy zostało przekazane.
    if (!listId) {
      // Jeśli ID listy brakuje, zwracamy błąd 400 (Bad Request).
      logger.error("[API AI Parse] Missing list ID", { requestId });
      return new Response(JSON.stringify({ error: "List ID is required" }), {
        status: 400,
      });
    }

    // Używa klienta Supabase przekazanego przez `locals` (jeśli jest dostępny),
    // w przeciwnym razie korzysta z globalnego klienta Supabase.
    // `locals.supabase` jest zazwyczaj konfigurowane w middleware.
    const supabaseFromLocals = (locals as App.Locals).supabase; // Używamy App.Locals dla poprawnego typowania
    const supabase = supabaseFromLocals || supabaseClient;

    logger.debug("[API AI Parse] Supabase client check", { 
      requestId,
      hasSupabaseFromLocals: !!supabaseFromLocals,
      hasSupabaseClient: !!supabaseClient
    });

    // Weryfikuje, czy lista zakupów o podanym ID istnieje i należy do zalogowanego użytkownika.
    // Zapobiega to dostępowi do list innych użytkowników.
    const { data: list, error: listError } = await supabase
      .from("shopping_lists")
      .select("id") // Wystarczy wybrać dowolną kolumnę, np. 'id', aby potwierdzić istnienie.
      .eq("id", listId)
      .eq("user_id", userId)
      .single(); // Oczekujemy jednego rekordu lub błędu.

    // Obsługuje błędy podczas pobierania listy z bazy danych.
    if (listError) {
      // Błąd może oznaczać, że lista nie istnieje lub użytkownik nie ma do niej dostępu (zgodnie z RLS).
      logger.error(`[API AI Parse] Error fetching list ${listId} for user ${userId}`, { 
        requestId,
        error: listError.message 
      });
      return new Response(JSON.stringify({ error: "List not found or access denied", details: listError.message }), {
        status: 404, // Status 404 jest odpowiedni, gdy zasób nie został znaleziony.
      });
    }

    // Sprawdza, czy lista została znaleziona.
    // Jeśli `list` jest `null` (a `listError` też był `null`), oznacza to, że zapytanie się powiodło,
    // ale nie znaleziono pasującego rekordu.
    if (!list) {
      logger.warn("[API AI Parse] List not found", { requestId, listId, userId });
      return new Response(JSON.stringify({ error: "List not found" }), {
        status: 404,
      });
    }

    logger.info("[API AI Parse] List access verified", { requestId, listId, userId });

    // Pobiera istniejące produkty z listy zakupów wraz z ich statusem 'purchased'.
    // Te informacje zostaną przekazane do AI, aby mogła uwzględnić aktualny stan listy.
    const { data: existingItems, error: itemsError } = await supabase
      .from("shopping_list_items")
      .select("id, item_name, purchased") // Pobieramy ID, nazwę produktu i status zakupu.
      .eq("shopping_list_id", listId)
      .order("created_at", { ascending: true }); // Sortujemy dla spójności.

    // Obsługuje błędy podczas pobierania produktów z listy.
    if (itemsError) {
      logger.error(`[API AI Parse] Error fetching existing items for list ${listId}`, { 
        requestId,
        error: itemsError.message 
      });
      return new Response(JSON.stringify({ error: "Failed to fetch existing products", details: itemsError.message }), {
        status: 500,
      });
    }

    logger.debug("[API AI Parse] Existing items fetched", { 
      requestId,
      itemsCount: existingItems?.length || 0
    });

    // Przetwarza ciało żądania, aby uzyskać tekst od użytkownika.
    let body;
    let text: string | undefined;
    try {
      // Oczekujemy, że ciało żądania będzie w formacie JSON i będzie zawierać pole 'text'.
      body = await request.json();
      text = (body as { text: string }).text;
      logger.debug("[API AI Parse] Request body parsed", { 
        requestId,
        textLength: text?.length || 0,
        textPreview: text?.substring(0, 100) + (text?.length > 100 ? '...' : '')
      });
    } catch (jsonError) {
      // Jeśli parsowanie JSONa się nie powiedzie, zwracamy błąd 400.
      logger.error(`[API AI Parse] Error parsing request body`, { 
        requestId,
        error: getErrorMessage(jsonError) 
      });
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
      });
    }

    // Sprawdza, czy tekst od użytkownika został przekazany i jest typu string.
    if (!text || typeof text !== "string") {
      // Jeśli tekst jest nieprawidłowy, zwracamy błąd 400.
      logger.error("[API AI Parse] Invalid text content", { requestId });
      return new Response(JSON.stringify({ error: "Text content is required" }), {
        status: 400,
      });
    }

    // Przygotowuje listę istniejących produktów w formacie oczekiwanym przez AI.
    // Tworzymy tablicę obiektów, gdzie każdy obiekt ma nazwę produktu i status 'purchased'.
    const productsWithStatus = existingItems.map((item) => ({
      name: item.item_name,
      purchased: item.purchased,
    }));
    const existingProductsFormatted = JSON.stringify(productsWithStatus);

    logger.debug("[API AI Parse] Existing products formatted", { 
      requestId,
      productsCount: productsWithStatus.length
    });

    // Inicjalizuje serwis OpenRouterService.
    // Ten serwis będzie odpowiedzialny za komunikację z API OpenRouter.
    let openRouter: OpenRouterService;
    try {
      // Przekazujemy klucz API do konstruktora serwisu.
      openRouter = new OpenRouterService(OPENROUTER_API_KEY);
      logger.info("[API AI Parse] OpenRouter service initialized", { requestId });
    } catch (initError) {
      // Jeśli inicjalizacja serwisu się nie powiedzie, zwracamy błąd 500.
      logger.error(`[API AI Parse] Failed to initialize OpenRouterService`, { 
        requestId,
        error: getErrorMessage(initError) 
      });
      return new Response(JSON.stringify({ error: "AI service initialization failed" }), {
        status: 500,
      });
    }

    // Przygotowuje ładunek (payload) zapytania do API OpenRouter.
    // Określamy model AI, komunikaty (systemowy i użytkownika) oraz format odpowiedzi.
    const requestPayload = {
      model: "openai/gpt-4o", // Wybrany model AI
      messages: [
        {
          role: "system", // Komunikat systemowy definiuje rolę i zadania AI.
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
          role: "user", // Komunikat użytkownika zawiera istniejące produkty i nowy tekst do przetworzenia.
          content: `Istniejące produkty na mojej liście zakupów (format JSON): ${existingProductsFormatted}\n\nPrzetwórz ten tekst i zaktualizuj moją listę zakupów (dodaj nowe produkty, usuń te, o których napisałem, że nie chcę ich kupować): "${text}"`,
        },
      ],
      response_format: { type: "json_object" }, // Określamy, że oczekujemy odpowiedzi w formacie JSON.
      temperature: 0.2, // Niska temperatura dla bardziej deterministycznych odpowiedzi.
      max_tokens: 1000,
    };

    logger.debug("[API AI Parse] Preparing OpenRouter request", { 
      requestId,
      model: requestPayload.model,
      temperature: requestPayload.temperature,
      maxTokens: requestPayload.max_tokens
    });

    // Przesyłamy ładunek do API OpenRouter.
    let response: Response;
    try {
      response = await fetch(`${openRouter.getBaseUrl()}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouter.getFullApiKey()}`,
        },
        body: JSON.stringify(requestPayload),
      });

      logger.debug("[API AI Parse] OpenRouter API response received", { 
        requestId,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
    } catch (fetchError) {
      logger.error(`[API AI Parse] Fetch error calling OpenRouter`, { 
        requestId,
        error: getErrorMessage(fetchError) 
      });
      return new Response(JSON.stringify({ error: "Failed to communicate with AI service" }), { status: 502 }); // Bad Gateway
    }

    if (!response.ok) {
      let _errorBodyText = "Could not read error body";
      try {
        _errorBodyText = await response.text();
      } catch (_textError) {
        // ignore
      }

      logger.error("[API AI Parse] OpenRouter API error", { 
        requestId,
        status: response.status,
        statusText: response.statusText,
        errorBody: _errorBodyText.substring(0, 500)
      });

      // Próbujemy przetworzyć błąd jako JSON, jeśli to możliwe
      let errorDetail = `API error: ${response.status}`;
      try {
        if (_errorBodyText && _errorBodyText.trim().startsWith("{")) {
          const errorJson = JSON.parse(_errorBodyText);
          errorDetail = errorJson.message || errorJson.error || errorDetail;
        }
      } catch (_jsonError) {
        // Ignorujemy błędy parsowania - użyjemy oryginalnej wiadomości
      }

      return new Response(JSON.stringify({ error: "Failed to process text with AI", details: errorDetail }), {
        status: 500,
      });
    }

    // Parsujemy odpowiedź z API OpenRouter.
    let responseData: AiResponse;
    let responseText: string;
    try {
      responseText = await response.text();

      if (!responseText || !responseText.trim().startsWith("{")) {
        throw new Error("Response is not a valid JSON: " + responseText.substring(0, 50));
      }

      responseData = JSON.parse(responseText);
      logger.debug("[API AI Parse] OpenRouter response parsed successfully", { 
        requestId,
        hasChoices: !!responseData.choices,
        choicesLength: responseData.choices?.length || 0
      });
    } catch (parseError) {
      logger.error(`[API AI Parse] Failed to parse JSON response from AI`, { 
        requestId,
        error: getErrorMessage(parseError),
        rawResponse: responseText?.substring(0, 200) || "Empty response"
      });
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response",
          details: getErrorMessage(parseError),
          rawResponse: responseText?.substring(0, 200) || "Empty response",
        }),
        { status: 500 }
      );
    }

    // Sprawdza, czy odpowiedź ma oczekiwaną strukturę.
    if (!responseData.choices || !responseData.choices[0]?.message?.content) {
      logger.error(`[API AI Parse] Invalid structure in AI response`, { 
        requestId,
        data: JSON.stringify(responseData).substring(0, 200)
      });
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
      contentJson = JSON.parse(contentStr);
      logger.debug("[API AI Parse] AI response content parsed", { 
        requestId,
        hasProducts: !!contentJson.products,
        productsCount: contentJson.products?.length || 0
      });
    } catch (jsonError) {
      logger.error(`[API AI Parse] Failed to parse JSON content string from AI message`, { 
        requestId,
        error: getErrorMessage(jsonError),
        content: contentStr.substring(0, 200)
      });
      return new Response(JSON.stringify({ error: "Failed to parse AI response content" }), {
        status: 500,
      });
    }

    // Sprawdza, czy zawiera tablicę produktów
    if (!contentJson.products || !Array.isArray(contentJson.products)) {
      logger.error(`[API AI Parse] Parsed content JSON does not contain 'products' array`, { 
        requestId,
        content: JSON.stringify(contentJson).substring(0, 200)
      });
      return new Response(
        JSON.stringify({
          error: "Invalid response format",
          details: "Response does not contain products array",
        }),
        { status: 500 }
      );
    }

    // Sprawdza, czy produkty mają wymagane pola
    for (const product of contentJson.products) {
      if (!Object.prototype.hasOwnProperty.call(product, "name")) {
        product.name = "Produkt bez nazwy"; // Default name
      }
      // Jeśli AI nie określiło statusu purchased, ustaw domyślnie na false
      if (!Object.prototype.hasOwnProperty.call(product, "purchased")) {
        product.purchased = false;
      }
    }

    logger.info("[API AI Parse] AI processing completed successfully", { 
      requestId,
      aiProductsCount: contentJson.products.length
    });

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

    logger.info("[API AI Parse] Changes calculated", { 
      requestId,
      itemsToAdd: itemsToAdd.length,
      itemsToDelete: itemsToDelete.length
    });

    // 3. Wywołaj funkcję RPC w Supabase, aby zastosować zmiany w transakcji
    if (itemsToAdd.length > 0 || itemsToDelete.length > 0) {
      const { error: rpcError } = await supabase.rpc("apply_shopping_list_changes", {
        p_list_id: listId,
        p_user_id: userId, // Przekazujemy userId do weryfikacji uprawnień w funkcji SQL
        items_to_add: itemsToAdd,
        items_to_delete: itemsToDelete.map((item) => item.id), // Przekazujemy tylko tablicę ID
      });

      if (rpcError) {
        logger.error(`[API AI Parse] RPC Error applying changes`, { 
          requestId,
          error: rpcError.message 
        });
        return new Response(
          JSON.stringify({ error: "Failed to apply changes atomically", details: rpcError.message }),
          { status: 500 }
        );
      }

      logger.info("[API AI Parse] Changes applied successfully", { requestId });
    } else {
      logger.debug("[API AI Parse] No changes to apply", { requestId });
    }

    // 4. Zwróć nową listę elementów
    const { data: updatedItems, error: fetchUpdatedError } = await supabase
      .from("shopping_list_items")
      .select("id, item_name, purchased, created_at, updated_at")
      .eq("shopping_list_id", listId)
      .order("created_at", { ascending: true });

    if (fetchUpdatedError) {
      logger.error(`[API AI Parse] Error fetching updated items for list ${listId}`, { 
        requestId,
        error: fetchUpdatedError.message 
      });
      return new Response(
        JSON.stringify({
          error: "Failed to fetch updated products after applying changes",
          details: fetchUpdatedError.message,
        }),
        { status: 500 } // Zwróć błąd, ale operacje mogły się powieść
      );
    }

    // Mapujemy na format DTO
    const updatedItemsDTO = updatedItems.map((item) => ({
      id: item.id,
      itemName: item.item_name,
      purchased: item.purchased,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    logger.info("[API AI Parse] Request completed successfully", { 
      requestId,
      finalItemsCount: updatedItemsDTO.length
    });

    return new Response(JSON.stringify({ products: updatedItemsDTO }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    logger.error(`[API AI Parse] Unhandled error in main try block`, { 
      requestId,
      error: errorMessage 
    });
    return new Response(JSON.stringify({ error: "Internal Server Error", details: errorMessage }), {
      status: 500,
    });
  }
};
