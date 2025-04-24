import { OpenRouterService } from "../openrouter.service";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock dla fetch API
global.fetch = vi.fn();

// Mock dla setTimeout
vi.useFakeTimers();

describe("OpenRouterService", () => {
  let service: OpenRouterService;
  const mockApiKey = "test-api-key";
  const mockBaseUrl = "https://test.api.com";

  beforeEach(() => {
    // Reset mocks przed każdym testem
    vi.clearAllMocks();
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();
    vi.clearAllTimers();

    // Inicjalizacja serwisu z mockami
    service = new OpenRouterService(mockApiKey, mockBaseUrl);

    // Mock dla console methods
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    // Przywróć oryginalne metody console
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("constructor", () => {
    it("should throw error when API key is not provided", () => {
      expect(() => new OpenRouterService("")).toThrow("OpenRouter API key is required");
    });

    it("should initialize with default values", () => {
      const service = new OpenRouterService(mockApiKey);
      expect(service).toBeInstanceOf(OpenRouterService);
    });

    it("should accept custom model parameters", () => {
      const customParams = {
        max_tokens: 1000,
        temperature: 0.5,
        model_name: "custom-model",
      };
      const service = new OpenRouterService(mockApiKey, mockBaseUrl, customParams);
      expect(service).toBeInstanceOf(OpenRouterService);
    });
  });

  describe("message management", () => {
    it("should update system message", async () => {
      const newSystemMessage = "You are a specialized assistant";
      service.updateSystemMessage(newSystemMessage);

      // Wywołaj zapytanie, aby sprawdzić, czy nowa wiadomość systemowa jest używana
      await service.sendChatRequest({ message: "test" });

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody.messages[0]).toEqual({
        role: "system",
        content: newSystemMessage,
      });
    });

    it("should update user message", async () => {
      const newUserMessage = "Custom user message";
      service.updateUserMessage(newUserMessage);

      // Wywołaj zapytanie, aby sprawdzić, czy nowa wiadomość użytkownika jest używana
      await service.sendChatRequest({ message: "test" });

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody.messages[1]).toEqual({
        role: "user",
        content: "test", // Powinno użyć wiadomości z sendChatRequest, nie updateUserMessage
      });
    });
  });

  describe("request formatting", () => {
    it("should format request with correct structure", async () => {
      await service.sendChatRequest({ message: "test message" });

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody).toMatchObject({
        messages: [
          {
            role: "system",
            content: expect.any(String),
          },
          {
            role: "user",
            content: "test message",
          },
        ],
        model: expect.any(String),
        max_tokens: expect.any(Number),
        temperature: expect.any(Number),
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "llm_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                content: { type: "string" },
                error: { type: "string", optional: true },
              },
              required: ["content"],
            },
          },
        },
      });
    });

    it("should include context in user message when provided", async () => {
      const message = "test message";
      const context = "some context";
      await service.sendChatRequest({ message, context });

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody.messages[1].content).toContain(context);
      expect(requestBody.messages[1].content).toContain(message);
    });
  });

  describe("logging functionality", () => {
    it("should log info messages", async () => {
      await service.sendChatRequest({ message: "test" });
      expect(console.log).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] OpenRouterService:/)
      );
    });

    it("should log warnings on retry", async () => {
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error("First failure"))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ choices: [{ message: { content: "Success" } }] }),
        });

      await service.sendChatRequest({ message: "test" });
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[WARN\] OpenRouterService:/)
      );
    });

    it("should log errors on API failure", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal Server Error"),
      });

      await service.sendChatRequest({ message: "test" });
      expect(console.error).toHaveBeenCalledWith(
        expect.stringMatching(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[ERROR\] OpenRouterService:/)
      );
    });
  });

  describe("sendChatRequest", () => {
    const mockMessage = "Test message";
    const mockResponse = {
      choices: [
        {
          message: {
            content: "Test response",
          },
        },
      ],
    };

    beforeEach(() => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
    });

    it("should send chat request successfully", async () => {
      const response = await service.sendChatRequest({ message: mockMessage });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/chat/completions`,
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${mockApiKey}`,
          },
        })
      );
      expect(response).toEqual({
        content: "Test response",
        error: undefined,
      });
    });

    it("should validate empty message", async () => {
      await expect(service.sendChatRequest({ message: "" })).rejects.toThrow("Message cannot be empty");
    });

    it("should validate message length", async () => {
      const longMessage = "a".repeat(4097);
      await expect(service.sendChatRequest({ message: longMessage })).rejects.toThrow(
        "Message exceeds maximum length of 4096 characters"
      );
    });

    it("should validate context length", async () => {
      const longContext = "a".repeat(2049);
      await expect(
        service.sendChatRequest({
          message: "test",
          context: longContext,
        })
      ).rejects.toThrow("Context exceeds maximum length of 2048 characters");
    });
  });

  describe("error handling", () => {
    it("should handle API errors", async () => {
      const errorMessage = "API Error";
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve(errorMessage),
      });

      const response = await service.sendChatRequest({ message: "test" });

      expect(response.error).toContain("API request failed");
      expect(console.error).toHaveBeenCalled();
    });

    it("should handle network errors", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));

      const response = await service.sendChatRequest({ message: "test" });

      expect(response.error).toBe("Network error");
      expect(console.error).toHaveBeenCalled();
    });

    it("should retry on failure", async () => {
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error("First failure"))
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              choices: [{ message: { content: "Success after retry" } }],
            }),
        });

      const response = await service.sendChatRequest({ message: "test" });

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(response.content).toBe("Success after retry");
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("Retrying request (attempt 1/3)"));
    });
  });

  describe("model parameters", () => {
    it("should update model parameters", () => {
      const newParams = {
        max_tokens: 2000,
        temperature: 0.8,
        model_name: "new-model",
      };

      service.setModelParams(newParams);

      // Sprawdź, czy parametry są używane w żądaniu
      service.sendChatRequest({ message: "test" });

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody).toMatchObject({
        model: "new-model",
        max_tokens: 2000,
        temperature: 0.8,
      });
    });
  });

  describe("edge cases in request formatting", () => {
    it("should handle special characters in messages", async () => {
      const messageWithSpecialChars = "Test 🚀 with emoji and \n newlines \t tabs";
      await service.sendChatRequest({ message: messageWithSpecialChars });

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody.messages[1].content).toBe(messageWithSpecialChars);
    });

    it("should handle empty context", async () => {
      await service.sendChatRequest({ message: "test", context: "" });

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody.messages[1].content).toBe("test");
    });

    it("should handle undefined context", async () => {
      await service.sendChatRequest({ message: "test", context: undefined });

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody.messages[1].content).toBe("test");
    });

    it("should handle very long system messages", async () => {
      const longSystemMessage = "a".repeat(2000);
      service.updateSystemMessage(longSystemMessage);

      await service.sendChatRequest({ message: "test" });

      const requestBody = JSON.parse((global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body);
      expect(requestBody.messages[0].content).toBe(longSystemMessage);
    });
  });

  describe("API response formats", () => {
    it("should handle empty choices array", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [] }),
      });

      const response = await service.sendChatRequest({ message: "test" });
      expect(response).toEqual({
        content: "",
        error: undefined,
      });
    });

    it("should handle missing message content", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: {} }],
          }),
      });

      const response = await service.sendChatRequest({ message: "test" });
      expect(response).toEqual({
        content: "",
        error: undefined,
      });
    });

    it("should handle malformed JSON response", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      const response = await service.sendChatRequest({ message: "test" });
      expect(response).toEqual({
        content: "",
        error: "Failed to parse API response",
      });
    });

    it("should handle unexpected response structure", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            unexpected: "structure",
          }),
      });

      const response = await service.sendChatRequest({ message: "test" });
      expect(response).toEqual({
        content: "",
        error: undefined,
      });
    });
  });

  describe("timeout handling", () => {
    it("should timeout after default period", async () => {
      // Symuluj długie zapytanie
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(resolve, 31000); // Dłużej niż domyślny timeout
          })
      );

      const sendPromise = service.sendChatRequest({ message: "test" });

      // Przewiń czas o 31 sekund
      vi.advanceTimersByTime(31000);

      const response = await sendPromise;
      expect(response.error).toContain("Request timeout");
      expect(console.error).toHaveBeenCalledWith(expect.stringMatching(/timeout/));
    });

    it("should handle multiple retries with increasing delays", async () => {
      (global.fetch as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(new Error("Timeout"))
        .mockRejectedValueOnce(new Error("Timeout"))
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              choices: [{ message: { content: "Success" } }],
            }),
        });

      const sendPromise = service.sendChatRequest({ message: "test" });

      // Pierwszy retry (2^1 * 1000 = 2000ms)
      vi.advanceTimersByTime(2000);
      // Drugi retry (2^2 * 1000 = 4000ms)
      vi.advanceTimersByTime(4000);

      const response = await sendPromise;
      expect(response.content).toBe("Success");
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it("should handle concurrent requests", async () => {
      const requests = [
        service.sendChatRequest({ message: "test1" }),
        service.sendChatRequest({ message: "test2" }),
        service.sendChatRequest({ message: "test3" }),
      ];

      const responses = await Promise.all(requests);
      expect(responses).toHaveLength(3);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});
