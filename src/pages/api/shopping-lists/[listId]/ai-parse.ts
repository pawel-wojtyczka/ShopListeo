import type { APIRoute } from "astro";
import { OpenRouterService } from "@/lib/openrouter.service";
import { getErrorMessage } from "@/lib/utils/error";
import { supabaseClient } from "@/db/supabase.client";
import type { AstroLocals } from "@/types/locals";

export const POST: APIRoute = async ({ params, request, locals }) => {
  // Dodaję identyfikator żądania dla łatwiejszego śledzenia
  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] [ai-parse] Otrzymano żądanie POST z ${request.url}`);

  try {
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

    // Initialize OpenRouter service
    console.log(`[${requestId}] [ai-parse] Inicjalizacja serwisu OpenRouter`);
    try {
      const openRouter = new OpenRouterService();

      // Set system message to instruct AI about the task
      openRouter.updateSystemMessage(`You are a helpful shopping list assistant. Your task is to:
1. Analyze the user's input text
2. Extract product names
3. Return them as a JSON array of objects with 'name' property
4. Keep product names simple and clear
5. Remove any duplicates
6. Standardize product names (e.g., lowercase, remove unnecessary details)
7. Return maximum 50 products`);

      // Send request to OpenRouter
      console.log(`[${requestId}] [ai-parse] Wysyłanie zapytania do OpenRouter, długość tekstu: ${text.length} znaków`);
      const response = await openRouter.sendChatRequest({
        message: text,
      });

      if (response.error) {
        console.error(`[${requestId}] [ai-parse] Błąd odpowiedzi OpenRouter: ${response.error}`);
        return new Response(JSON.stringify({ error: "Failed to process text with AI", details: response.error }), {
          status: 500,
        });
      }

      // Parse the response to get products array
      console.log(`[${requestId}] [ai-parse] Przetwarzanie odpowiedzi z OpenRouter`);
      try {
        const parsedContent = JSON.parse(response.content);
        if (!Array.isArray(parsedContent.products)) {
          console.error(`[${requestId}] [ai-parse] Nieprawidłowy format odpowiedzi: products nie jest tablicą`);
          console.error(`[${requestId}] [ai-parse] Otrzymana odpowiedź: ${JSON.stringify(parsedContent)}`);
          throw new Error("Invalid response format");
        }

        console.log(`[${requestId}] [ai-parse] Sukces, znaleziono ${parsedContent.products.length} produktów`);
        return new Response(
          JSON.stringify({
            products: parsedContent.products,
          }),
          {
            status: 200,
          }
        );
      } catch (error) {
        console.error(`[${requestId}] [ai-parse] Błąd parsowania odpowiedzi AI: ${getErrorMessage(error)}`);
        console.error(`[${requestId}] [ai-parse] Surowa odpowiedź: ${response.content}`);
        return new Response(JSON.stringify({ error: "Failed to parse AI response", details: getErrorMessage(error) }), {
          status: 500,
        });
      }
    } catch (error) {
      console.error(`[${requestId}] [ai-parse] Błąd inicjalizacji OpenRouter: ${getErrorMessage(error)}`);
      return new Response(JSON.stringify({ error: "OpenRouter service error", details: getErrorMessage(error) }), {
        status: 500,
      });
    }
  } catch (error) {
    console.error(`[${requestId}] [ai-parse] Nieobsłużony błąd: ${getErrorMessage(error)}`);
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
    });
  }
};
