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
    apiKey: string = process.env.OPENROUTER_API_KEY ?? "",
    baseUrl: string = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
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
      model_name: "openrouter-llm-model",
      ...defaultModelParams,
    };
    this.systemMessage = "You are a helpful assistant.";
    this.userMessage = "";
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
  private log(level: LogLevel, message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] OpenRouterService: ${message}`;

    switch (level) {
      case "error":
        console.error(logMessage);
        break;
      case "warn":
        console.warn(logMessage);
        break;
      default:
        console.log(logMessage);
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
        type: "json",
        schema: {
          type: "object",
          properties: {
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                },
                required: ["name"],
              },
            },
          },
          required: ["products"],
        },
      },
    };
  }

  /**
   * Wysyła żądanie do API OpenRouter
   */
  private async makeRequest(payload: RequestPayload): Promise<Response> {
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
  }

  /**
   * Przetwarza odpowiedź z API OpenRouter
   */
  private async parseResponse(response: Response): Promise<LLMResponse> {
    try {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content in response");
      }

      return {
        content,
        error: data.error?.message,
      };
    } catch (error) {
      this.log("error", `Failed to parse API response: ${error instanceof Error ? error.message : "Unknown error"}`);
      return {
        content: "",
        error: "Failed to parse API response",
      };
    }
  }

  /**
   * Ponawia żądanie w przypadku błędu
   */
  private async retryRequest(chatPayload: ChatPayload): Promise<LLMResponse> {
    const delay = Math.pow(2, this.retryCount) * 1000;
    this.log("info", `Waiting ${delay}ms before retry`);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return this.sendChatRequest(chatPayload);
  }

  /**
   * Aktualizuje parametry modelu używane w zapytaniach
   */
  public setModelParams(params: Partial<ModelParams>): void {
    this.defaultModelParams = {
      ...this.defaultModelParams,
      ...params,
    };
  }

  /**
   * Aktualizuje komunikat systemowy
   */
  public updateSystemMessage(message: string): void {
    this.systemMessage = message;
  }

  /**
   * Aktualizuje komunikat użytkownika
   */
  public updateUserMessage(message: string): void {
    this.userMessage = message;
  }
}
