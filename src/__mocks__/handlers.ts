import { http, HttpResponse } from "msw";

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

  // Add more handlers as needed for other API endpoints
];
