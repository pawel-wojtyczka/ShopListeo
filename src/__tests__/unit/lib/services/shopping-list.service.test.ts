import { describe, it, expect, vi } from "vitest";
// import type { SupabaseClient } from "@supabase/supabase-js"; // Usunięto nieużywany import
import { createShoppingList, ShoppingListError } from "@/lib/services/shopping-list.service";
import type { CreateShoppingListRequest, CreateShoppingListResponse } from "@/types";

// Mock SupabaseClient
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSupabase: any = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

describe("Shopping List Service", () => {
  describe("createShoppingList", () => {
    const userId = "test-user-id";
    const listData: CreateShoppingListRequest = { title: "Nowa Lista" };

    // Reset mock before each test
    beforeEach(() => {
      vi.clearAllMocks();
      // Reset specific mock behaviors
      vi.mocked(mockSupabase.from).mockReturnThis();
      vi.mocked(mockSupabase.insert).mockReturnThis();
      vi.mocked(mockSupabase.select).mockReturnThis();
    });

    it("should create a shopping list successfully", async () => {
      // Mock response data matching the database structure (snake_case)
      const mockDbResponse = {
        id: "new-list-id",
        title: listData.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      // Expected response after service mapping (camelCase)
      const expectedServiceResponse: CreateShoppingListResponse = {
        id: mockDbResponse.id,
        title: mockDbResponse.title,
        createdAt: mockDbResponse.created_at,
        updatedAt: mockDbResponse.updated_at,
      };

      // Configure mock Supabase response for success using db structure
      vi.mocked(mockSupabase.single).mockResolvedValueOnce({ data: mockDbResponse, error: null });

      const result = await createShoppingList(mockSupabase, userId, listData);

      expect(result).toEqual(expectedServiceResponse);
      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_lists");
      expect(mockSupabase.insert).toHaveBeenCalledWith([{ user_id: userId, title: listData.title }]);
      expect(mockSupabase.select).toHaveBeenCalledWith("id, title, created_at, updated_at");
      expect(mockSupabase.single).toHaveBeenCalledOnce();
    });

    it("should throw ShoppingListError with DUPLICATE_TITLE code for duplicate title error (23505)", async () => {
      const duplicateError = {
        message: "Duplicate key value violates unique constraint",
        code: "23505",
        details: "Key (user_id, title)=(...) already exists.",
        hint: null,
      };

      // Configure mock Supabase response for duplicate error
      vi.mocked(mockSupabase.single).mockResolvedValueOnce({ data: null, error: duplicateError });

      // Call the function once and store the promise
      const createPromise = createShoppingList(mockSupabase, userId, listData);

      // Assert on the promise
      await expect(createPromise).rejects.toThrow(ShoppingListError);
      await expect(createPromise).rejects.toMatchObject({
        message: "Lista zakupów o podanym tytule już istnieje",
        code: "DUPLICATE_TITLE",
      });
    });

    it("should throw ShoppingListError with DATABASE_ERROR code for other database errors", async () => {
      const dbError = {
        message: "Something went wrong",
        code: "XYZ123", // Some generic error code
        details: null,
        hint: null,
      };

      // Configure mock Supabase response for generic error
      vi.mocked(mockSupabase.single).mockResolvedValueOnce({ data: null, error: dbError });

      // Call the function once and store the promise
      const createPromise = createShoppingList(mockSupabase, userId, listData);

      // Assert on the promise
      await expect(createPromise).rejects.toThrow(ShoppingListError);
      await expect(createPromise).rejects.toMatchObject({
        message: "Nie udało się utworzyć listy zakupów",
        code: "DATABASE_ERROR",
      });
    });

    it("should throw ShoppingListError with NO_DATA_RETURNED code if Supabase returns no data and no error", async () => {
      // Configure mock Supabase response for no data/no error
      vi.mocked(mockSupabase.single).mockResolvedValueOnce({ data: null, error: null });

      // Call the function once and store the promise
      const createPromise = createShoppingList(mockSupabase, userId, listData);

      // Assert on the promise
      await expect(createPromise).rejects.toThrow(ShoppingListError);
      await expect(createPromise).rejects.toMatchObject({
        message: "Nie udało się utworzyć listy zakupów - brak danych zwrotnych",
        code: "NO_DATA_RETURNED",
      });
    });

    it("should throw ShoppingListError with UNEXPECTED_ERROR code for non-database errors", async () => {
      const unexpectedError = new Error("Network Failure");

      // Configure mock Supabase to throw an unexpected error
      vi.mocked(mockSupabase.single).mockRejectedValueOnce(unexpectedError);

      // Call the function once and store the promise
      const createPromise = createShoppingList(mockSupabase, userId, listData);

      // Assert on the promise
      await expect(createPromise).rejects.toThrow(ShoppingListError);
      await expect(createPromise).rejects.toMatchObject({
        message: "Wystąpił nieoczekiwany błąd podczas tworzenia listy zakupów",
        code: "UNEXPECTED_ERROR",
      });
    });
  });

  // TODO: Add tests for other service functions (getAllShoppingLists, etc.)
});
