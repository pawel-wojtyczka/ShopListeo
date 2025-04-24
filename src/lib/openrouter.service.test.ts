import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OpenRouterService } from "./openrouter.service";

// Mock import.meta.env for testing
vi.stubGlobal("import.meta.env", {
  OPENROUTER_API_KEY: "test-api-key",
  OPENROUTER_BASE_URL: "https://test.openrouter.ai/api/v1",
  NODE_ENV: "test",
  DEV: true,
  PROD: false,
});

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock console methods to prevent test output pollution and allow assertions
vi.spyOn(console, "log").mockImplementation(() => {
  /* no-op */
});
vi.spyOn(console, "warn").mockImplementation(() => {
  /* no-op */
});
vi.spyOn(console, "error").mockImplementation(() => {
  /* no-op */
});

describe("OpenRouterService", () => {
  const apiKey = "test-api-key";
  const baseUrl = "https://test.openrouter.ai/api/v1";
  let service: OpenRouterService;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockFetch.mockClear();
    // Create a new service instance for each test
    service = new OpenRouterService(apiKey, baseUrl);

    // Default successful fetch mock
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: '{"response": "mock data"}' } }] }),
      text: async () => JSON.stringify({ choices: [{ message: { content: '{"response": "mock data"}' } }] }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Restore console mocks etc.
  });

  describe("Constructor", () => {
    it("should initialize with provided API key and base URL", () => {
      expect(service.getApiKey()).toBe(apiKey);
      expect(service.getBaseUrl()).toBe(baseUrl);
      // Check if log was called during init
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("[OpenRouterService] Inicjalizacja"),
        expect.any(Object)
      );
    });

    it("should throw an error if API key is missing", () => {
      // Temporarily clear the mock env var for this test
      vi.stubGlobal("import.meta.env", { ...import.meta.env, OPENROUTER_API_KEY: "" });
      expect(() => new OpenRouterService("", baseUrl)).toThrow("OpenRouter API key is required");
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[OpenRouterService] Brak klucza API"),
        expect.any(Object)
      );
      // Restore env var
      vi.stubGlobal("import.meta.env", { ...import.meta.env, OPENROUTER_API_KEY: "test-api-key" });
    });

    it("should use default model parameters if none are provided", () => {
      // Access private member for testing purposes (consider if this is necessary)
      // Alternative: test through behavior if possible
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const defaultParams = (service as any).defaultModelParams;
      expect(defaultParams.model_name).toBe("openai/gpt-4o");
      expect(defaultParams.max_tokens).toBe(512);
      expect(defaultParams.temperature).toBe(0.7);
    });

    it("should override default model parameters when provided", () => {
      const customParams = { model_name: "custom/model", max_tokens: 1024, temperature: 0.5 };
      const customService = new OpenRouterService(apiKey, baseUrl, customParams);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params = (customService as any).defaultModelParams;
      expect(params.model_name).toBe("custom/model");
      expect(params.max_tokens).toBe(1024);
      expect(params.temperature).toBe(0.5);
    });
  });

  describe("sendChatRequest", () => {
    const chatPayload = { message: "Hello AI" };

    it("should successfully send request and parse response", async () => {
      const response = await service.sendChatRequest(chatPayload);

      expect(response.content).toBe('{"response": "mock data"}');
      expect(response.error).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(`${baseUrl}/chat/completions`, expect.any(Object));
      // Check payload format passed to fetch
      const fetchOptions = mockFetch.mock.calls[0][1];
      const body = JSON.parse(fetchOptions.body);
      expect(body.model).toBe("openai/gpt-4o");
      expect(body.messages).toHaveLength(2);
      expect(body.messages[1].role).toBe("user");
      expect(body.messages[1].content).toBe("Hello AI");
      expect(body.response_format).toEqual({ type: "json_object" });
    });

    it("should throw validation error for empty message", async () => {
      const invalidPayload = { message: " " };
      await expect(service.sendChatRequest(invalidPayload)).resolves.toEqual({
        content: "",
        error: "Message cannot be empty",
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should throw validation error for message exceeding max length", async () => {
      const longMessage = "a".repeat(4097);
      const invalidPayload = { message: longMessage };
      await expect(service.sendChatRequest(invalidPayload)).resolves.toEqual({
        content: "",
        error: "Message exceeds maximum length of 4096 characters",
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should throw validation error for context exceeding max length", async () => {
      const longContext = "c".repeat(2049);
      const invalidPayload = { message: "Valid message", context: longContext };
      // Note: The current implementation doesn't actually use the context in formatRequest
      // The validation logic exists but might be tested differently or adjusted
      // For now, testing the validation logic directly or assuming it blocks the request
      await expect(service.sendChatRequest(invalidPayload)).resolves.toEqual({
        content: "",
        error: "Context exceeds maximum length of 2048 characters",
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should handle API request failure (non-ok response)", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: async () => "Invalid API Key",
      });

      const response = await service.sendChatRequest(chatPayload);

      expect(response.content).toBe("");
      expect(response.error).toContain("API request failed with status 401");
      expect(mockFetch).toHaveBeenCalledTimes(1); // Initial attempt fails
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining("API request failed with status 401"));
      // Retry mechanism is not tested here yet, would require more complex mockFetch setup
    });

    it("should handle invalid JSON response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "this is not json",
        // json: async () => { throw new Error("SyntaxError: Unexpected token"); } // Simulate json parse error
      });

      const response = await service.sendChatRequest(chatPayload);

      expect(response.content).toBe("");
      expect(response.error).toContain("Invalid JSON response");
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Nieprawidłowy format JSON"),
        "this is not json"
      );
    });

    it("should handle JSON response missing choices", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ id: "some-id" }), // Valid JSON, but wrong structure
        json: async () => ({ id: "some-id" }),
      });

      const response = await service.sendChatRequest(chatPayload);

      expect(response.content).toBe("");
      expect(response.error).toContain("API response missing choices array");
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Brak tablicy choices"), { id: "some-id" });
    });

    it("should handle JSON response with empty choices array", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ choices: [] }),
        json: async () => ({ choices: [] }),
      });

      const response = await service.sendChatRequest(chatPayload);

      expect(response.content).toBe("");
      expect(response.error).toContain("API response missing choices array or choices array is empty");
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Brak tablicy choices w odpowiedzi lub jest pusta"),
        { choices: [] }
      );
    });

    it("should handle JSON response missing message in first choice", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ choices: [{ some_other_prop: "value" }] }),
        json: async () => ({ choices: [{ some_other_prop: "value" }] }),
      });

      const response = await service.sendChatRequest(chatPayload);

      expect(response.content).toBe("");
      expect(response.error).toContain("API response missing message in first choice");
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Brak message w pierwszym elemencie choices"),
        { some_other_prop: "value" }
      );
    });

    it("should handle JSON response missing content in first choice message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ choices: [{ message: { role: "assistant" } }] }),
        json: async () => ({ choices: [{ message: { role: "assistant" } }] }),
      });

      const response = await service.sendChatRequest(chatPayload);

      expect(response.content).toBe("");
      expect(response.error).toContain("API response missing content in first choice message");
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Brak content w message"), {
        message: { role: "assistant" },
      });
    });
  });

  describe("Retries", () => {
    const chatPayload = { message: "Retry test" };

    // Mock Date.now for predictable backoff timing if needed
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it("should retry request up to maxRetries on fetch failure", async () => {
      // Fail fetch 3 times, then succeed on the 4th call (initial + 3 retries)
      mockFetch
        .mockRejectedValueOnce(new Error("Network Error 1"))
        .mockRejectedValueOnce(new Error("Network Error 2"))
        .mockRejectedValueOnce(new Error("Network Error 3"))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ choices: [{ message: { content: '{"response": "success after retry"}' } }] }),
          text: async () =>
            JSON.stringify({ choices: [{ message: { content: '{"response": "success after retry"}' } }] }),
        });

      const promise = service.sendChatRequest(chatPayload);

      // Advance timers to allow retries to execute immediately
      await vi.advanceTimersToNextTimerAsync(); // 1st retry delay
      await vi.advanceTimersToNextTimerAsync(); // 2nd retry delay
      await vi.advanceTimersToNextTimerAsync(); // 3rd retry delay

      const response = await promise;

      expect(response.content).toBe('{"response": "success after retry"}');
      expect(response.error).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledTimes(4); // Initial call + 3 retries
      expect(console.warn).toHaveBeenCalledTimes(3); // Logged for each retry
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("Retrying request (attempt 1/3)"));
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("Retrying request (attempt 2/3)"));
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("Retrying request (attempt 3/3)"));
    });

    it("should return error after exceeding maxRetries", async () => {
      // Fail fetch continuously
      mockFetch.mockRejectedValue(new Error("Persistent Network Error"));

      const promise = service.sendChatRequest(chatPayload);

      // Advance timers past all retries
      await vi.advanceTimersToNextTimerAsync();
      await vi.advanceTimersToNextTimerAsync();
      await vi.advanceTimersToNextTimerAsync();
      // Maybe one more for safety?
      await vi.advanceTimersToNextTimerAsync();

      const response = await promise;

      expect(response.content).toBe("");
      expect(response.error).toBe("Persistent Network Error");
      expect(mockFetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(console.warn).toHaveBeenCalledTimes(3);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Error in sendChatRequest: Persistent Network Error")
      );
    });

    it("should retry on non-ok API response", async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 500, text: async () => "Server Error 1" })
        .mockResolvedValueOnce({ ok: false, status: 502, text: async () => "Server Error 2" })
        .mockResolvedValueOnce({ ok: false, status: 503, text: async () => "Server Error 3" })
        .mockResolvedValueOnce({
          // Success on 4th attempt
          ok: true,
          status: 200,
          json: async () => ({ choices: [{ message: { content: '{"response": "success after retry"}' } }] }),
          text: async () =>
            JSON.stringify({ choices: [{ message: { content: '{"response": "success after retry"}' } }] }),
        });

      const promise = service.sendChatRequest(chatPayload);

      await vi.advanceTimersToNextTimerAsync();
      await vi.advanceTimersToNextTimerAsync();
      await vi.advanceTimersToNextTimerAsync();

      const response = await promise;

      expect(response.content).toBe('{"response": "success after retry"}');
      expect(response.error).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledTimes(4);
      expect(console.warn).toHaveBeenCalledTimes(3);
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining("API request failed with status 500"));
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining("API request failed with status 502"));
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining("API request failed with status 503"));
    });
  });

  describe("Helper Methods", () => {
    it("setModelParams should update default parameters", () => {
      const newParams = { model_name: "anthropic/claude-3-opus", max_tokens: 1000 };
      service.setModelParams(newParams);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentParams = (service as any).defaultModelParams;
      expect(currentParams.model_name).toBe("anthropic/claude-3-opus");
      expect(currentParams.max_tokens).toBe(1000);
      expect(currentParams.temperature).toBe(0.7); // Should remain default
    });

    it("updateSystemMessage should update the system message", () => {
      const newMessage = "You are a shopping list assistant.";
      service.updateSystemMessage(newMessage);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((service as any).systemMessage).toBe(newMessage);
    });

    it("updateUserMessage should update the user message for the next request (internal state)", () => {
      const newMessage = "Prepare my shopping list.";
      service.updateUserMessage(newMessage);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((service as any).userMessage).toBe(newMessage);
    });

    it("getApiKey should return the correct API key", () => {
      expect(service.getApiKey()).toBe(apiKey);
    });

    it("getBaseUrl should return the correct base URL", () => {
      expect(service.getBaseUrl()).toBe(baseUrl);
    });
  });
});
