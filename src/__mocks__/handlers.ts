import { http, HttpResponse } from "msw";

// Przykładowa odpowiedź AI dla mocka
const mockAiResponseJson = { products: [{ name: "Mleko", purchased: false }] };
const mockAiApiResponse = {
  choices: [
    {
      message: {
        content: JSON.stringify(mockAiResponseJson), // Symulacja stringa JSON w odpowiedzi
      },
    },
  ],
};

// Define handlers array to store all API mocks
export const handlers = [
  // Example handler for shopping list creation
  http.post("/api/shopping-lists", () => {
    return HttpResponse.json({ id: "new-list-id" });
  }),

  // Example handler for shopping list error
  http.post("/api/shopping-lists/error", () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: "Server error",
    });
  }),

  // Auth handlers
  http.get("/api/users/me", () => {
    return HttpResponse.json({
      id: "test-user-id",
      email: "test@example.com",
      registrationDate: "2024-01-01T00:00:00Z",
      lastLoginDate: "2024-04-01T00:00:00Z",
      isAdmin: false,
    });
  }),

  http.post("/api/auth/logout", () => {
    return HttpResponse.json({ success: true });
  }),

  http.post("/api/auth/login", () => {
    return HttpResponse.json({
      success: true,
      user: {
        id: "test-user-id",
        email: "test@example.com",
      },
    });
  }),

  http.post("/api/auth/register", () => {
    return HttpResponse.json({
      success: true,
      user: {
        id: "new-user-id",
        email: "new@example.com",
      },
    });
  }),

  // Handler for OpenRouter chat completions
  http.post("https://openrouter.ai/api/v1/chat/completions", () => {
    return HttpResponse.json(mockAiApiResponse, { status: 200 });
  }),

  // Add more handlers as needed for other API endpoints
];
