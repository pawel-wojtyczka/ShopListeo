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

  // Add more handlers as needed for other API endpoints
];
