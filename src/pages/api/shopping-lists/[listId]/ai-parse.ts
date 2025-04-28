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

          // Usuwamy wszystkie istniejące elementy z listy zakupów
          console.log(`[${requestId}] [ai-parse] Usuwanie istniejących elementów z listy ${listId}`);
          const { error: deleteError } = await supabase
            .from("shopping_list_items")
            .delete()
            .eq("shopping_list_id", listId);

          if (deleteError) {
            console.error(`[${requestId}] [ai-parse] Błąd usuwania istniejących produktów: ${deleteError.message}`);
            return new Response(
              JSON.stringify({ error: "Failed to clear existing products", details: deleteError.message }),
              { status: 500 }
            );
          }

          // Dodajemy nowe/zaktualizowane elementy do listy zakupów
          console.log(
            `[${requestId}] [ai-parse] Dodawanie ${contentJson.products.length} przetworzonych produktów do listy ${listId}`
          );
          if (contentJson.products.length > 0) {
            const newItems = contentJson.products.map((item: { name: string; purchased: boolean }) => ({
              shopping_list_id: listId,
              item_name: item.name.trim(),
              purchased: item.purchased,
            }));

            const { data: insertedItems, error: insertError } = await supabase
              .from("shopping_list_items")
              .insert(newItems)
              .select("id, item_name, purchased, created_at, updated_at");

            if (insertError) {
              console.error(`[${requestId}] [ai-parse] Błąd dodawania nowych produktów: ${insertError.message}`);
              return new Response(
                JSON.stringify({ error: "Failed to add parsed products", details: insertError.message }),
                {
                  status: 500,
                }
              );
            }

            console.log(`[${requestId}] [ai-parse] Pomyślnie dodano produkty.`);
            // Mapujemy na format DTO dla spójności
            const insertedItemsDTO = insertedItems.map((item) => ({
              id: item.id,
              itemName: item.item_name,
              purchased: item.purchased,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
            }));

            // Return the updated list of items
            return new Response(JSON.stringify({ products: insertedItemsDTO }), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            });
          } else {
            console.log(`[${requestId}] [ai-parse] Brak produktów do dodania po przetworzeniu.`);
            // Jeśli AI zwróciło pustą listę (bo np. wszystkie zostały usunięte), zwróć pustą tablicę
            return new Response(JSON.stringify({ products: [] }), {
              status: 200,
              headers: {
                "Content-Type": "application/json",
              },
            });
          }
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
