import { ShoppingListError } from "./shopping-list.service";
import { logger } from "../logger";

/**
 * Interfejsy i typy dla serwisu OpenRouter
 */
interface ModelParams {
  max_tokens: number;
  temperature: number;
  model_name: string;
}

interface ChatPayload {
  message: string;
  context?: string;
}

interface RequestPayload {
  messages: {
    role: "system" | "user";
    content: string;
  }[];
  model: string;
  max_tokens: number;
  temperature: number;
  response_format?: {
    type: string;
    schema?: Record<string, unknown>;
  };
}

interface LLMResponse {
  content: string;
  error?: string;
}

/**
 * Typ dla poziomów logowania
 */
type LogLevel = "info" | "warn" | "error";

/**
 * Serwis do komunikacji z API OpenRouter
 * Odpowiada za formatowanie żądań, wysyłanie ich do API i przetwarzanie odpowiedzi
 */
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private defaultModelParams: ModelParams;
  private systemMessage: string;
  private userMessage: string;
  private readonly maxRetries: number = 3;
  private retryCount = 0;

  constructor(
    apiKey: string = import.meta.env.OPENROUTER_API_KEY ?? "",
    baseUrl: string = import.meta.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
    defaultModelParams: Partial<ModelParams> = {}
  ) {
    // Logowanie konfiguracji OpenRouter (bez klucza API)
    logger.info("OpenRouter service initialization", {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      baseUrl,
      hasDefaultModelParams: !!Object.keys(defaultModelParams).length
    });

    if (!apiKey) {
      logger.error("OpenRouter API key is missing or empty");
      throw new Error("OpenRouter API key is required");
    }

    // Sprawdzenie formatu klucza API (powinien zaczynać się od "sk-")
    if (!apiKey.startsWith("sk-")) {
      logger.warn("OpenRouter API key format may be incorrect - should start with 'sk-'", {
        apiKeyPrefix: apiKey.substring(0, 5)
      });
    }

    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.defaultModelParams = {
      max_tokens: 512,
      temperature: 0.7,
      model_name: "openai/gpt-4o",
      ...defaultModelParams,
    };
    this.systemMessage = "You are a helpful assistant.";
    this.userMessage = "";

    logger.info("OpenRouter service initialized successfully", {
      baseUrl: this.baseUrl,
      defaultModel: this.defaultModelParams.model_name,
      maxTokens: this.defaultModelParams.max_tokens,
      temperature: this.defaultModelParams.temperature
    });
  }

  /**
   * Przetwarza tekst na listę zakupów
   *
   * @param text Tekst do przetworzenia
   * @returns Lista produktów
   * @throws {ShoppingListError} Gdy wystąpi błąd podczas przetwarzania
   */
  public async parseShoppingList(text: string): Promise<string[]> {
    logger.info(`Parsing shopping list text`, { 
      textLength: text?.length || 0,
      textPreview: text?.substring(0, 100) + (text?.length > 100 ? '...' : '')
    });

    // Ustaw specjalne parametry dla parsowania listy zakupów
    const originalParams = { ...this.defaultModelParams };
    this.setModelParams({
      model_name: "openai/gpt-3.5-turbo",
      temperature: 0.3,
      max_tokens: 512,
    });

    // Ustaw specjalny prompt systemowy
    const originalSystemMessage = this.systemMessage;
    this.updateSystemMessage(
      'You are a shopping list parser. Extract items from the text and return them as a JSON array in the format: {"items": ["item1", "item2"]}. Keep the original quantities if specified.'
    );

    try {
      logger.debug("Preparing request to OpenRouter API", {
        model: "openai/gpt-3.5-turbo",
        temperature: 0.3,
        baseUrl: this.baseUrl
      });

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            { role: "system", content: this.systemMessage },
            { role: "user", content: text },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
      });

      logger.debug("OpenRouter API response received", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("Error fetching from OpenRouter API", { 
          status: response.status, 
          statusText: response.statusText,
          errorText: errorText.substring(0, 500) // Ograniczamy długość logu
        });
        throw new ShoppingListError("Błąd podczas komunikacji z serwisem AI", "AI_REQUEST_FAILED");
      }

      const data = await response.json();
      logger.debug("OpenRouter API response parsed", {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        hasFirstChoice: !!data.choices?.[0],
        hasMessage: !!data.choices?.[0]?.message,
        hasContent: !!data.choices?.[0]?.message?.content
      });

      if (!data.choices || !data.choices[0]) {
        logger.error("Error parsing shopping list: Invalid response structure from AI (no choices)", { data });
        throw new ShoppingListError(
          "Nie udało się przetworzyć listy przez AI - nieprawidłowa odpowiedź",
          "AI_INVALID_RESPONSE"
        );
      }

      if (!data.choices[0].message?.content) {
        logger.error("Error parsing shopping list: Invalid response structure from AI (no message content)", { data });
        throw new ShoppingListError(
          "Nie udało się przetworzyć listy przez AI - nieprawidłowa odpowiedź",
          "AI_INVALID_RESPONSE"
        );
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(data.choices[0].message.content);
        logger.debug("JSON response parsed successfully", { 
          hasItems: !!parsedContent.items,
          itemsLength: parsedContent.items?.length || 0
        });
      } catch (error) {
        logger.error("Error parsing shopping list: Failed to parse JSON response from AI", { 
          content: data.choices[0].message.content,
          error: error instanceof Error ? error.message : "Unknown error" 
        });
        throw new ShoppingListError(
          "Nie udało się przetworzyć listy przez AI - błąd parsowania JSON",
          "AI_JSON_PARSE_ERROR"
        );
      }

      if (!parsedContent.items) {
        logger.error("Error parsing shopping list: Invalid JSON format from AI (missing 'items' array)", { parsedContent });
        throw new ShoppingListError(
          "Nie udało się przetworzyć listy przez AI - nieprawidłowy format JSON",
          "AI_INVALID_JSON_FORMAT"
        );
      }

      logger.info("Parsed items successfully", { 
        itemsCount: parsedContent.items.length,
        items: parsedContent.items 
      });
      return parsedContent.items;
    } catch (error) {
      if (error instanceof ShoppingListError) {
        throw error;
      }

      if (error instanceof Error && error.message.includes("Network")) {
        logger.error("Network error fetching from OpenRouter API", { 
          error: error.message 
        });
        throw new ShoppingListError("Błąd sieci podczas komunikacji z serwisem AI", "AI_NETWORK_ERROR", error);
      }

      if (error instanceof Error && error.message.includes("text is not a function")) {
        logger.error("Error fetching from OpenRouter API", { 
          status: 500, 
          statusText: "Internal Server Error",
          error: error.message 
        });
        throw new ShoppingListError("Błąd podczas komunikacji z serwisem AI", "AI_REQUEST_FAILED");
      }

      logger.error("Error parsing shopping list: Unexpected error", {
        error: error instanceof Error ? error.message : "Unknown error",
        errorType: error?.constructor?.name
      });
      throw new ShoppingListError(
        "Nie udało się przetworzyć listy przez AI - nieoczekiwany błąd",
        "AI_UNEXPECTED_ERROR",
        error
      );
    } finally {
      // Przywróć oryginalne parametry
      this.setModelParams(originalParams);
      this.updateSystemMessage(originalSystemMessage);
      logger.debug("Original model parameters and system message restored");
    }
  }

  /**
   * Wysyła zapytanie do API OpenRouter i zwraca przetworzoną odpowiedź
   */
  public async sendChatRequest(chatPayload: ChatPayload): Promise<LLMResponse> {
    try {
      this.validateChatPayload(chatPayload);

      this.retryCount = 0;
      this.userMessage = chatPayload.message;

      logger.info(`Sending chat request`, { 
        messageLength: chatPayload.message?.length || 0,
        hasContext: !!chatPayload.context,
        contextLength: chatPayload.context?.length || 0
      });
      
      const formattedRequest = this.formatRequest();
      const response = await this.makeRequest(formattedRequest);
      return this.parseResponse(response);
    } catch (error) {
      logger.error(`Error in sendChatRequest`, { 
        error: error instanceof Error ? error.message : "Unknown error",
        retryCount: this.retryCount 
      });

      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        logger.warn(`Retrying request (attempt ${this.retryCount}/${this.maxRetries})`);
        return this.retryRequest(chatPayload);
      }
      return {
        content: "",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Waliduje payload zapytania
   */
  private validateChatPayload(payload: ChatPayload): void {
    if (!payload.message || payload.message.trim().length === 0) {
      throw new Error("Message cannot be empty");
    }

    if (payload.message.length > 4096) {
      throw new Error("Message exceeds maximum length of 4096 characters");
    }

    if (payload.context && payload.context.length > 2048) {
      throw new Error("Context exceeds maximum length of 2048 characters");
    }
  }

  /**
   * Loguje zdarzenia i błędy
   */
  private log(level: LogLevel, message: string, ...args: Record<string, unknown>[]): void {
    switch (level) {
      case "error":
        logger.error(message, ...args);
        break;
      case "warn":
        logger.warn(message, ...args);
        break;
      default:
        logger.info(message, ...args);
    }
  }

  /**
   * Formatuje żądanie zgodnie z wymaganiami API OpenRouter
   */
  private formatRequest(): RequestPayload {
    return {
      messages: [
        {
          role: "system",
          content: this.systemMessage,
        },
        {
          role: "user",
          content: this.userMessage,
        },
      ],
      model: this.defaultModelParams.model_name,
      max_tokens: this.defaultModelParams.max_tokens,
      temperature: this.defaultModelParams.temperature,
      response_format: {
        type: "json_object",
      },
    };
  }

  /**
   * Wysyła żądanie do API OpenRouter
   */
  private async makeRequest(payload: RequestPayload): Promise<Response> {
    try {
      logger.debug("Making request to OpenRouter API", {
        model: payload.model,
        maxTokens: payload.max_tokens,
        temperature: payload.temperature,
        messagesCount: payload.messages.length
      });

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      logger.debug("OpenRouter API response received", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`API request failed with status ${response.status}`, { 
          statusText: response.statusText,
          errorText: errorText.substring(0, 500) // Ograniczamy długość logu
        });
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes("failed to fetch")) {
        logger.error("Network error: Failed to connect to OpenRouter API", { error: error.message });
        throw new Error("Network error: Failed to connect to OpenRouter API");
      }
      throw error;
    }
  }

  /**
   * Przetwarza odpowiedź z API OpenRouter
   */
  private async parseResponse(response: Response): Promise<LLMResponse> {
    try {
      const data = await response.json();

      logger.debug("Parsing OpenRouter API response", {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        hasFirstChoice: !!data.choices?.[0],
        hasMessage: !!data.choices?.[0]?.message,
        hasContent: !!data.choices?.[0]?.message?.content
      });

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        logger.error("Invalid response format from API", { data });
        throw new Error("Invalid response format from API");
      }

      return {
        content: data.choices[0].message.content,
      };
    } catch (error) {
      logger.error(`Error parsing response`, { 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
      throw error;
    }
  }

  /**
   * Ponawia żądanie w przypadku błędu
   */
  private async retryRequest(chatPayload: ChatPayload): Promise<LLMResponse> {
    const delay = Math.pow(2, this.retryCount) * 1000;
    logger.debug(`Waiting ${delay}ms before retry`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return this.sendChatRequest(chatPayload);
  }

  /**
   * Aktualizuje parametry modelu
   */
  public setModelParams(params: Partial<ModelParams>): void {
    logger.debug("Updating model parameters", { 
      oldParams: { ...this.defaultModelParams },
      newParams: params 
    });
    
    this.defaultModelParams = {
      ...this.defaultModelParams,
      ...params,
    };
  }

  /**
   * Aktualizuje wiadomość systemową
   */
  public updateSystemMessage(message: string): void {
    logger.debug("Updating system message", { 
      oldMessage: this.systemMessage,
      newMessage: message 
    });
    this.systemMessage = message;
  }

  /**
   * Aktualizuje wiadomość użytkownika
   */
  public updateUserMessage(message: string): void {
    this.userMessage = message;
  }

  /**
   * Zwraca klucz API (tylko prefix dla bezpieczeństwa)
   */
  public getApiKey(): string {
    return this.apiKey.substring(0, 10) + "...";
  }

  /**
   * Zwraca pełny klucz API (tylko do użytku wewnętrznego)
   */
  public getFullApiKey(): string {
    return this.apiKey;
  }

  /**
   * Zwraca bazowy URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }
}
