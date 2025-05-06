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
    if (!apiKey) {
      throw new Error("OpenRouter API key is required");
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
  }

  /**
   * Przetwarza tekst na listę zakupów
   *
   * @param text Tekst do przetworzenia
   * @returns Lista produktów
   * @throws {ShoppingListError} Gdy wystąpi błąd podczas przetwarzania
   */
  public async parseShoppingList(text: string): Promise<string[]> {
    this.log("info", `Parsing shopping list text: ${text}`);

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

      if (!response.ok) {
        const errorText = await response.text();
        this.log(
          "error",
          "Error fetching from OpenRouter API",
          { status: response.status, statusText: response.statusText },
          { error: errorText }
        );
        throw new ShoppingListError("Błąd podczas komunikacji z serwisem AI", "AI_REQUEST_FAILED");
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0]) {
        this.log("error", "Error parsing shopping list: Invalid response structure from AI (no choices)", data);
        throw new ShoppingListError(
          "Nie udało się przetworzyć listy przez AI - nieprawidłowa odpowiedź",
          "AI_INVALID_RESPONSE"
        );
      }

      if (!data.choices[0].message?.content) {
        this.log("error", "Error parsing shopping list: Invalid response structure from AI (no message content)", data);
        throw new ShoppingListError(
          "Nie udało się przetworzyć listy przez AI - nieprawidłowa odpowiedź",
          "AI_INVALID_RESPONSE"
        );
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(data.choices[0].message.content);
      } catch (error) {
        this.log(
          "error",
          "Error parsing shopping list: Failed to parse JSON response from AI",
          { content: data.choices[0].message.content },
          { error: error instanceof Error ? error.message : "Unknown error" }
        );
        throw new ShoppingListError(
          "Nie udało się przetworzyć listy przez AI - błąd parsowania JSON",
          "AI_JSON_PARSE_ERROR"
        );
      }

      if (!parsedContent.items) {
        this.log(
          "error",
          "Error parsing shopping list: Invalid JSON format from AI (missing 'items' array)",
          parsedContent
        );
        throw new ShoppingListError(
          "Nie udało się przetworzyć listy przez AI - nieprawidłowy format JSON",
          "AI_INVALID_JSON_FORMAT"
        );
      }

      this.log("info", "Parsed items successfully", parsedContent.items);
      return parsedContent.items;
    } catch (error) {
      if (error instanceof ShoppingListError) {
        throw error;
      }

      if (error instanceof Error && error.message.includes("Network")) {
        this.log(
          "error",
          "Network error fetching from OpenRouter API",
          { error: error.message },
          { originalError: error.message }
        );
        throw new ShoppingListError("Błąd sieci podczas komunikacji z serwisem AI", "AI_NETWORK_ERROR", error);
      }

      if (error instanceof Error && error.message.includes("text is not a function")) {
        this.log(
          "error",
          "Error fetching from OpenRouter API",
          { status: 500, statusText: "Internal Server Error" },
          { error: error.message }
        );
        throw new ShoppingListError("Błąd podczas komunikacji z serwisem AI", "AI_REQUEST_FAILED");
      }

      this.log("error", "Error parsing shopping list: Unexpected error", {
        error: error instanceof Error ? error.message : "Unknown error",
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

      this.log("info", `Sending chat request: ${chatPayload.message}`);
      const formattedRequest = this.formatRequest();
      const response = await this.makeRequest(formattedRequest);
      return this.parseResponse(response);
    } catch (error) {
      this.log("error", `Error in sendChatRequest: ${error instanceof Error ? error.message : "Unknown error"}`);

      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        this.log("warn", `Retrying request (attempt ${this.retryCount}/${this.maxRetries})`);
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
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.log("error", `API request failed with status ${response.status}: ${errorText}`);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message.includes("failed to fetch")) {
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

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from API");
      }

      return {
        content: data.choices[0].message.content,
      };
    } catch (error) {
      this.log("error", `Error parsing response: ${error instanceof Error ? error.message : "Unknown error"}`);
      throw error;
    }
  }

  /**
   * Ponawia żądanie w przypadku błędu
   */
  private async retryRequest(chatPayload: ChatPayload): Promise<LLMResponse> {
    await new Promise((resolve) => setTimeout(resolve, Math.pow(2, this.retryCount) * 1000));
    return this.sendChatRequest(chatPayload);
  }

  /**
   * Aktualizuje parametry modelu
   */
  public setModelParams(params: Partial<ModelParams>): void {
    this.defaultModelParams = {
      ...this.defaultModelParams,
      ...params,
    };
  }

  /**
   * Aktualizuje wiadomość systemową
   */
  public updateSystemMessage(message: string): void {
    this.systemMessage = message;
  }

  /**
   * Aktualizuje wiadomość użytkownika
   */
  public updateUserMessage(message: string): void {
    this.userMessage = message;
  }

  /**
   * Zwraca klucz API
   */
  public getApiKey(): string {
    return this.apiKey;
  }

  /**
   * Zwraca bazowy URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }
}
