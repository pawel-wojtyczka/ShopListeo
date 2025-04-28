import type { APIRoute } from "astro";
import { OpenRouterService } from "@/lib/openrouter.service";
import { getErrorMessage } from "@/lib/utils/error";
import { supabaseClient } from "@/db/supabase.client";
import type { AstroLocals } from "@/types/locals";

// Pobieramy klucz API ze zmiennych środowiskowych
const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;

export const POST: APIRoute = async ({ params, request, locals }) => {
  // Dodaję identyfikator żądania dla łatwiejszego śledzenia
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] [ai-parse] Otrzymano żądanie POST z ${request.url}`);

  try {
    // Sprawdź, czy klucz API OpenRouter jest dostępny
    if (!OPENROUTER_API_KEY) {
      console.error(
        `[${requestId}] [ai-parse] Brak klucza API OpenRouter w zmiennych środowiskowych (OPENROUTER_API_KEY)`
      );
      return new Response(
        JSON.stringify({ error: "Configuration error", details: "OpenRouter API key is not configured" }),
        { status: 500 }
      );
    }
    console.log(`[${requestId}] [ai-parse] Klucz API OpenRouter załadowany ze zmiennych środowiskowych.`);

    // Pobieramy dane uwierzytelniające bezpośrednio z middleware locals
    const { user, isAuthenticated, authUser } = locals as AstroLocals & { isAuthenticated: boolean };

    console.log(`[${requestId}] [ai-parse] Dane uwierzytelniające z middleware:`, {
      userExists: !!user,
      isAuthenticated,
      authUserExists: !!authUser,
      userId: user?.id || authUser?.id,
    });

    // Sprawdź, czy użytkownik jest zalogowany
    if (!isAuthenticated || (!user && !authUser)) {
      console.error(`[${requestId}] [ai-parse] Brak uwierzytelnienia, użytkownik niezalogowany`);
      return new Response(JSON.stringify({ error: "Unauthorized", details: "Użytkownik niezalogowany" }), {
        status: 401,
      });
    }

    // Ustal ID użytkownika (mogą być dwa źródła: user z Supabase i authUser ze zserializowanego DTO)
    const userId = user?.id || authUser?.id;

    if (!userId) {
      console.error(`[${requestId}] [ai-parse] Brak ID użytkownika mimo pozytywnej walidacji`);
      return new Response(JSON.stringify({ error: "Unauthorized", details: "Brak ID użytkownika" }), {
        status: 401,
      });
    }

    console.log(`[${requestId}] [ai-parse] Użytkownik zalogowany, userId: ${userId}`);

    // Get list ID from params
    const { listId } = params;
    if (!listId) {
      console.error(`[${requestId}] [ai-parse] Brak ID listy w parametrach`);
      return new Response(JSON.stringify({ error: "List ID is required" }), {
        status: 400,
      });
    }

    // Użyj supabase z locals jeśli dostępne, w przeciwnym razie użyj globalnego klienta
    const supabase = (locals as AstroLocals).supabase || supabaseClient;

    // Verify list exists and belongs to user
    console.log(`[${requestId}] [ai-parse] Weryfikacja czy lista ${listId} należy do użytkownika ${userId}`);
    const { data: list, error: listError } = await supabase
      .from("shopping_lists")
      .select("id")
      .eq("id", listId)
      .eq("user_id", userId)
      .single();

    if (listError) {
      console.error(`[${requestId}] [ai-parse] Błąd pobierania listy: ${listError.message}`);
      return new Response(JSON.stringify({ error: "List not found", details: listError.message }), {
        status: 404,
      });
    }

    if (!list) {
      console.error(`[${requestId}] [ai-parse] Lista nie istnieje lub nie należy do użytkownika`);
      return new Response(JSON.stringify({ error: "List not found" }), {
        status: 404,
      });
    }

    // Pobierz istniejące produkty z listy zakupów wraz ze statusem purchased
    console.log(`[${requestId}] [ai-parse] Pobieranie istniejących produktów z listy ${listId}`);
    const { data: existingItems, error: itemsError } = await supabase
      .from("shopping_list_items")
      .select("id, item_name, purchased")
      .eq("shopping_list_id", listId)
      .order("created_at", { ascending: true });

    if (itemsError) {
      console.error(`[${requestId}] [ai-parse] Błąd pobierania produktów: ${itemsError.message}`);
      return new Response(JSON.stringify({ error: "Failed to fetch existing products", details: itemsError.message }), {
        status: 500,
      });
    }

    // Get text content from request body
    console.log(`[${requestId}] [ai-parse] Parsowanie danych z ciała żądania`);
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error(`[${requestId}] [ai-parse] Błąd parsowania JSON z ciała żądania: ${getErrorMessage(error)}`);
      return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
        status: 400,
      });
    }

    const { text } = body as { text: string };

    if (!text || typeof text !== "string") {
      console.error(`[${requestId}] [ai-parse] Brak tekstu lub nieprawidłowy format tekstu w żądaniu`);
      return new Response(JSON.stringify({ error: "Text content is required" }), {
        status: 400,
      });
    }

    // Przygotuj obecną listę produktów ze statusem purchased
    const productsWithStatus = existingItems.map((item) => ({
      name: item.item_name,
      purchased: item.purchased,
    }));

    // Initialize OpenRouter service
    console.log(`[${requestId}] [ai-parse] Inicjalizacja serwisu OpenRouter z kluczem API ze zmiennych środowiskowych`);
    try {
      // Używamy klucza ze zmiennej środowiskowej
      const openRouter = new OpenRouterService(OPENROUTER_API_KEY);

      // Formatowanie istniejących produktów do przekazania asystentowi AI
      const existingProductsFormatted = JSON.stringify(productsWithStatus);

      // Przygotuj zapytanie ręcznie z wymaganymi parametrami
      console.log(`[${requestId}] [ai-parse] Przygotowywanie zapytania do OpenRouter`);
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
            content: `Istniejące produkty na mojej liście zakupów (format JSON): ${existingProductsFormatted}

Przetwórz ten tekst i zaktualizuj moją listę zakupów (dodaj nowe produkty, usuń te, o których napisałem, że nie chcę ich kupować): "${text}"`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 1000,
      };

      console.log(`[${requestId}] [ai-parse] Wysyłanie zapytania do OpenRouter, długość tekstu: ${text.length} znaków`);
      const response = await fetch(`${openRouter.getBaseUrl()}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouter.getApiKey()}`,
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${requestId}] [ai-parse] Błąd API OpenRouter: ${response.status} ${errorText}`);
        return new Response(
          JSON.stringify({ error: "Failed to process text with AI", details: `API error: ${response.status}` }),
          {
            status: 500,
          }
        );
      }

      // Parse the response
      console.log(`[${requestId}] [ai-parse] Otrzymano odpowiedź z OpenRouter, status: ${response.status}`);
      try {
        const responseData = await response.json();
        console.log(`[${requestId}] [ai-parse] Odpowiedź OpenRouter:`, JSON.stringify(responseData, null, 2));

        // Sprawdź, czy odpowiedź ma oczekiwaną strukturę
        if (!responseData.choices || !responseData.choices[0]?.message?.content) {
          console.error(`[${requestId}] [ai-parse] Nieprawidłowa struktura odpowiedzi:`, responseData);
          return new Response(
            JSON.stringify({ error: "Invalid response from AI", details: "Missing choices or content" }),
            {
              status: 500,
            }
          );
        }

        // Próba parsowania JSON z zawartości wiadomości
        const contentStr = responseData.choices[0].message.content;
        try {
          const contentJson = JSON.parse(contentStr);

          // Sprawdź, czy zawiera tablicę produktów
          if (!contentJson.products || !Array.isArray(contentJson.products)) {
            console.error(`[${requestId}] [ai-parse] Brak tablicy products w odpowiedzi:`, contentJson);
            return new Response(
              JSON.stringify({
                error: "Invalid response format",
                details: "Response does not contain products array",
              }),
              { status: 500 }
            );
          }

          // Sprawdź, czy produkty mają wymagane pola
          for (const product of contentJson.products) {
            if (!Object.prototype.hasOwnProperty.call(product, "name")) {
              product.name = "Produkt bez nazwy";
            }
            // Jeśli AI nie określiło statusu purchased, ustaw domyślnie na false
            if (!Object.prototype.hasOwnProperty.call(product, "purchased")) {
              product.purchased = false;
            }
          }

          // 1. Pobierz ponownie istniejące elementy dla pewności (lub użyj `existingItems` pobranych wcześniej)
          //    Dla uproszczenia na razie użyjemy `existingItems` pobranych na początku.
          //    W bardziej złożonym scenariuszu warto byłoby pobrać je ponownie tuż przed transakcją.
          console.log(`[${requestId}] [ai-parse] Przygotowywanie zmian na podstawie odpowiedzi AI.`);
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
          // Potencjalnie: const itemsToUpdate: { id: string; purchased?: boolean; item_name?: string }[] = [];

          // Znajdź elementy do dodania (są w AI, nie ma ich w obecnych)
          for (const [normalizedName, aiItem] of aiItemsMap.entries()) {
            if (!currentItemsMap.has(normalizedName)) {
              itemsToAdd.push({
                shopping_list_id: listId,
                item_name: aiItem.name.trim(), // Użyj oryginalnej nazwy z AI, ale przyciętej
                purchased: aiItem.purchased,
              });
            }
            // Opcjonalnie: obsługa aktualizacji, jeśli nazwa pasuje, ale np. status 'purchased' się zmienił
            // else {
            //   const currentItem = currentItemsMap.get(normalizedName)!;
            //   if (currentItem.purchased !== aiItem.purchased || currentItem.item_name !== aiItem.name.trim()) {
            //     // Dodaj do listy do aktualizacji
            //   }
            // }
          }

          // Znajdź elementy do usunięcia (są w obecnych, nie ma ich w AI)
          for (const [normalizedName, currentItem] of currentItemsMap.entries()) {
            if (!aiItemsMap.has(normalizedName)) {
              itemsToDelete.push({ id: currentItem.id });
            }
          }

          console.log(`[${requestId}] [ai-parse] Zidentyfikowano zmiany:`, {
            toAdd: itemsToAdd.length,
            toDelete: itemsToDelete.length,
            // toUpdate: itemsToUpdate.length (jeśli zaimplementowano)
          });

          // 3. Wywołaj funkcję RPC w Supabase, aby zastosować zmiany w transakcji
          if (itemsToAdd.length > 0 || itemsToDelete.length > 0 /*|| itemsToUpdate.length > 0*/) {
            console.log(`[${requestId}] [ai-parse] Wywoływanie funkcji RPC 'apply_shopping_list_changes'`);
            const { error: rpcError } = await supabase.rpc("apply_shopping_list_changes", {
              p_list_id: listId,
              p_user_id: userId, // Przekazujemy userId do weryfikacji uprawnień w funkcji SQL
              items_to_add: itemsToAdd,
              items_to_delete: itemsToDelete.map((item) => item.id), // Przekazujemy tylko tablicę ID
              // items_to_update: itemsToUpdate, // Przekaż, jeśli zaimplementowano
            });

            if (rpcError) {
              console.error(
                `[${requestId}] [ai-parse] Błąd podczas wywoływania RPC 'apply_shopping_list_changes': ${rpcError.message}`
              );
              return new Response(
                JSON.stringify({ error: "Failed to apply changes atomically", details: rpcError.message }),
                { status: 500 }
              );
            }
            console.log(`[${requestId}] [ai-parse] Pomyślnie zastosowano zmiany przez RPC.`);
          } else {
            console.log(`[${requestId}] [ai-parse] Brak zmian do zastosowania w bazie danych.`);
          }

          // 4. Zwróć nową listę elementów (można pobrać zaktualizowaną listę lub zwrócić tę z AI)
          //    Dla spójności i pewności, pobierzmy zaktualizowaną listę z bazy.
          console.log(`[${requestId}] [ai-parse] Pobieranie zaktualizowanej listy produktów po zmianach`);
          const { data: updatedItems, error: fetchUpdatedError } = await supabase
            .from("shopping_list_items")
            .select("id, item_name, purchased, created_at, updated_at")
            .eq("shopping_list_id", listId)
            .order("created_at", { ascending: true });

          if (fetchUpdatedError) {
            console.error(
              `[${requestId}] [ai-parse] Błąd pobierania zaktualizowanych produktów: ${fetchUpdatedError.message}`
            );
            // Zwróć błąd, ale operacje mogły się powieść
            return new Response(
              JSON.stringify({
                error: "Failed to fetch updated products after applying changes",
                details: fetchUpdatedError.message,
              }),
              { status: 500 }
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

          console.log(
            `[${requestId}] [ai-parse] Zwracanie zaktualizowanej listy (${updatedItemsDTO.length} produktów).`
          );
          return new Response(JSON.stringify({ products: updatedItemsDTO }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (jsonError) {
          console.error(
            `[${requestId}] [ai-parse] Błąd parsowania JSON z odpowiedzi AI: ${getErrorMessage(jsonError)}`,
            contentStr
          );
          return new Response(JSON.stringify({ error: "Failed to parse AI response" }), {
            status: 500,
          });
        }
      } catch (internalError) {
        console.error(`[${requestId}] [ai-parse] Błąd wewnętrzny przy obsłudze odpowiedzi AI: ${internalError}`);
        return new Response(JSON.stringify({ error: "Internal error processing AI response" }), {
          status: 500,
        });
      }
    } catch (error) {
      console.error(`[${requestId}] [ai-parse] Nieoczekiwany błąd inicjalizacji serwisu OpenRouter: ${error}`);
      return new Response(JSON.stringify({ error: "AI service initialization failed" }), {
        status: 500,
      });
    }
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error(`[${requestId}] [ai-parse] Nadrzędny błąd: ${errorMessage}`);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: errorMessage }), {
      status: 500,
    });
  }
};
