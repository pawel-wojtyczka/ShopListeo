import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterService } from "../../../../lib/services/openrouter.service";
import { ShoppingListError } from "../../../../lib/services/shopping-list.service"; // Assuming error handling uses this

// Mock the logger
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Import logger after mock
import { logger } from "../../../../lib/logger";

// Store original fetch and restore it after tests
const originalFetch = global.fetch;

describe("OpenRouterService", () => {
  let service: OpenRouterService;
  const apiKey = "test-api-key";

  beforeEach(() => {
    // Reset mocks and restore fetch before each test
    vi.resetAllMocks();
    global.fetch = vi.fn();
    service = new OpenRouterService(apiKey);
  });

  afterEach(() => {
    // Restore original fetch after each test
    global.fetch = originalFetch;
  });

  describe("parseShoppingList", () => {
    const textInput = "potrzebuję mleko, chleb i 2 jajka";

    it("should successfully parse text and return items", async () => {
      const mockApiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ items: ["mleko", "chleb", "2 jajka"] }),
            },
          },
        ],
      };
      const mockFetchResponse = {
        ok: true,
        json: async () => mockApiResponse,
        status: 200,
      } as Response;

      vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse);

      const items = await service.parseShoppingList(textInput);

      expect(items).toEqual(["mleko", "chleb", "2 jajka"]);
      expect(global.fetch).toHaveBeenCalledOnce();
      expect(global.fetch).toHaveBeenCalledWith("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                'You are a shopping list parser. Extract items from the text and return them as a JSON array in the format: {"items": ["item1", "item2"]}. Keep the original quantities if specified.',
            },
            { role: "user", content: textInput },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
      });
      expect(logger.info).toHaveBeenCalledWith(`Parsing shopping list text: ${textInput}`);
      expect(logger.info).toHaveBeenCalledWith("Parsed items successfully", ["mleko", "chleb", "2 jajka"]);
    });

    it("should handle empty items array from API", async () => {
      const mockApiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ items: [] }),
            },
          },
        ],
      };
      const mockFetchResponse = {
        ok: true,
        json: async () => mockApiResponse,
        status: 200,
      } as Response;

      vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse);

      const items = await service.parseShoppingList(textInput);

      expect(items).toEqual([]);
      expect(logger.info).toHaveBeenCalledWith("Parsed items successfully", []);
    });

    it("should handle API response with no choices", async () => {
      const mockApiResponse = { choices: [] }; // No choices
      const mockFetchResponse = {
        ok: true,
        json: async () => mockApiResponse,
        status: 200,
      } as Response;

      vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse);

      await expect(service.parseShoppingList(textInput)).rejects.toThrow(
        new ShoppingListError(
          "Nie udało się przetworzyć listy przez AI - nieprawidłowa odpowiedź",
          "AI_INVALID_RESPONSE"
        )
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Error parsing shopping list: Invalid response structure from AI (no choices)",
        expect.anything()
      );
    });

    it("should handle API response with no message content", async () => {
      const mockApiResponse = {
        choices: [{ message: {} }], // No content
      };
      const mockFetchResponse = {
        ok: true,
        json: async () => mockApiResponse,
        status: 200,
      } as Response;

      vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse);

      await expect(service.parseShoppingList(textInput)).rejects.toThrow(
        new ShoppingListError(
          "Nie udało się przetworzyć listy przez AI - nieprawidłowa odpowiedź",
          "AI_INVALID_RESPONSE"
        )
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Error parsing shopping list: Invalid response structure from AI (no message content)",
        expect.anything()
      );
    });

    it("should handle API response with invalid JSON content", async () => {
      const mockApiResponse = {
        choices: [
          {
            message: {
              content: "not json",
            },
          },
        ],
      };
      const mockFetchResponse = {
        ok: true,
        json: async () => mockApiResponse,
        status: 200,
      } as Response;

      vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse);

      await expect(service.parseShoppingList(textInput)).rejects.toThrow(
        new ShoppingListError("Nie udało się przetworzyć listy przez AI - błąd parsowania JSON", "AI_JSON_PARSE_ERROR")
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Error parsing shopping list: Failed to parse JSON response from AI",
        { content: "not json" },
        { error: expect.stringContaining("Unexpected token") }
      );
    });

    it("should handle API response with missing 'items' key in JSON", async () => {
      const mockApiResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({ products: ["milk"] }), // Missing 'items'
            },
          },
        ],
      };
      const mockFetchResponse = {
        ok: true,
        json: async () => mockApiResponse,
        status: 200,
      } as Response;

      vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse);

      await expect(service.parseShoppingList(textInput)).rejects.toThrow(
        new ShoppingListError(
          "Nie udało się przetworzyć listy przez AI - nieprawidłowy format JSON",
          "AI_INVALID_JSON_FORMAT"
        )
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Error parsing shopping list: Invalid JSON format from AI (missing 'items' array)",
        { products: ["milk"] }
      );
    });

    it("should handle fetch error (non-ok response)", async () => {
      const mockFetchResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: async () => "AI service unavailable",
      } as Response;

      vi.mocked(global.fetch).mockResolvedValue(mockFetchResponse);

      await expect(service.parseShoppingList(textInput)).rejects.toThrow(
        new ShoppingListError("Błąd podczas komunikacji z serwisem AI", "AI_REQUEST_FAILED")
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Error fetching from OpenRouter API",
        { status: 500, statusText: "Internal Server Error" },
        { error: "AI service unavailable" }
      );
    });

    it("should handle network error during fetch", async () => {
      const networkError = new Error("Network failure");
      vi.mocked(global.fetch).mockRejectedValue(networkError);

      await expect(service.parseShoppingList(textInput)).rejects.toThrow(
        new ShoppingListError("Błąd sieci podczas komunikacji z serwisem AI", "AI_NETWORK_ERROR", networkError)
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Network error fetching from OpenRouter API",
        { error: "Network failure" },
        { originalError: "Network failure" }
      );
    });

    it("should throw error if API key is missing", () => {
      expect(() => new OpenRouterService("")).toThrow("OpenRouter API key is required");
    });
  });
});
