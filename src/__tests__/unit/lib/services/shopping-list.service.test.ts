import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import { updateShoppingListItem, ShoppingListError } from "@/lib/services/shopping-list.service";
import type { UpdateShoppingListItemRequest } from "@/types";

// Mock the logger module
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Define a type for the Supabase mock client
interface MockQueryBuilder {
  select: Mock;
  insert: Mock;
  update: Mock;
  delete: Mock;
  eq: Mock;
  order: Mock;
  range: Mock;
  single: Mock;
  throwOnError: Mock;
}

type MockSupabaseClient = SupabaseClient & {
  from: Mock;
  _mocks: MockQueryBuilder;
};

// Helper to create a mock Supabase client
const createMockSupabaseClient = (): MockSupabaseClient => {
  const singleMock = vi.fn();
  const throwOnErrorMock = vi.fn();
  const eqMock = vi.fn();
  const orderMock = vi.fn();
  const rangeMock = vi.fn();
  const selectMock = vi.fn();
  const insertMock = vi.fn();
  const updateMock = vi.fn();
  const deleteMock = vi.fn();

  const queryBuilderMock: MockQueryBuilder = {
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
    eq: eqMock,
    order: orderMock,
    range: rangeMock,
    single: singleMock,
    throwOnError: throwOnErrorMock,
  };

  selectMock.mockReturnValue(queryBuilderMock);
  insertMock.mockReturnValue(queryBuilderMock);
  updateMock.mockReturnValue(queryBuilderMock);
  deleteMock.mockReturnValue(queryBuilderMock);
  eqMock.mockReturnValue(queryBuilderMock);
  orderMock.mockReturnValue(queryBuilderMock);
  rangeMock.mockReturnValue(queryBuilderMock);

  const mockSupabase = {
    from: vi.fn().mockReturnValue(queryBuilderMock),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
    _mocks: queryBuilderMock,
  } as unknown as MockSupabaseClient;

  return mockSupabase;
};

describe("Shopping List Service", () => {
  describe("updateShoppingListItem", () => {
    let mockSupabase: MockSupabaseClient;
    const userId = "user-update-item-id";
    const listId = "list-update-item-id";
    const itemId = "item-update-id";
    const updateData: UpdateShoppingListItemRequest = { itemName: "Whole Milk", purchased: true };

    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
      vi.clearAllMocks();
    });

    it("should update an item successfully", async () => {
      const updatedItem = {
        id: itemId,
        item_name: updateData.itemName,
        purchased: updateData.purchased,
        updated_at: new Date().toISOString(),
        shopping_list_id: listId,
      };

      // Setup mock responses
      const listResponse = { data: { id: listId }, error: null };
      const itemResponse = { data: updatedItem, error: null };

      // Mock the list check
      mockSupabase.from.mockImplementation((table) => {
        const mock = mockSupabase._mocks;
        if (table === "shopping_lists") {
          mock.select.mockReturnValueOnce(mock);
          mock.eq.mockReturnValueOnce(mock);
          mock.eq.mockReturnValueOnce(mock);
          mock.single.mockResolvedValueOnce(listResponse);
        } else if (table === "shopping_list_items") {
          mock.update.mockReturnValueOnce(mock);
          mock.eq.mockReturnValueOnce(mock);
          mock.eq.mockReturnValueOnce(mock);
          mock.select.mockReturnValueOnce(mock);
          mock.single.mockResolvedValueOnce(itemResponse);
        }
        return mock;
      });

      const result = await updateShoppingListItem(mockSupabase, userId, listId, itemId, updateData);

      expect(result).toEqual({
        id: itemId,
        itemName: updatedItem.item_name,
        purchased: updatedItem.purchased,
        updatedAt: updatedItem.updated_at,
      });

      // Verify shopping_lists table operations
      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_lists");
      expect(mockSupabase._mocks.select).toHaveBeenCalledWith("id");
      expect(mockSupabase._mocks.eq).toHaveBeenCalledWith("id", listId);
      expect(mockSupabase._mocks.eq).toHaveBeenCalledWith("user_id", userId);
      expect(mockSupabase._mocks.single).toHaveBeenCalled();

      // Verify shopping_list_items table operations
      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_list_items");
      expect(mockSupabase._mocks.update).toHaveBeenCalledWith({
        item_name: updateData.itemName,
        purchased: updateData.purchased,
        updated_at: expect.any(String),
      });
      expect(mockSupabase._mocks.eq).toHaveBeenCalledWith("id", itemId);
      expect(mockSupabase._mocks.eq).toHaveBeenCalledWith("shopping_list_id", listId);
      expect(mockSupabase._mocks.select).toHaveBeenCalledWith("id, item_name, purchased, updated_at");
      expect(mockSupabase._mocks.single).toHaveBeenCalled();
    });

    it("should throw ShoppingListError if list not found", async () => {
      // Setup mock responses
      const listResponse = { data: null, error: null };

      // Mock the list check to return null (list not found)
      mockSupabase.from.mockImplementation((table) => {
        const mock = mockSupabase._mocks;
        if (table === "shopping_lists") {
          mock.select.mockReturnValueOnce(mock);
          mock.eq.mockReturnValueOnce(mock);
          mock.eq.mockReturnValueOnce(mock);
          mock.single.mockResolvedValueOnce(listResponse);
        }
        return mock;
      });

      const updatePromise = updateShoppingListItem(mockSupabase, userId, listId, itemId, updateData);

      await expect(updatePromise).rejects.toThrow(ShoppingListError);
      await expect(updatePromise).rejects.toThrow("Nie znaleziono listy zakupów lub brak uprawnień");

      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_lists");
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });

    it("should throw ShoppingListError if update fails", async () => {
      const dbError = { code: "UPDATE_ERR", message: "Update failed", details: "", hint: "" } as PostgrestError;

      // Setup mock responses
      const listResponse = { data: { id: listId }, error: null };
      const itemResponse = { data: null, error: dbError };

      // Mock both operations
      mockSupabase.from.mockImplementation((table) => {
        const mock = mockSupabase._mocks;
        if (table === "shopping_lists") {
          mock.select.mockReturnValueOnce(mock);
          mock.eq.mockReturnValueOnce(mock);
          mock.eq.mockReturnValueOnce(mock);
          mock.single.mockResolvedValueOnce(listResponse);
        } else if (table === "shopping_list_items") {
          mock.update.mockReturnValueOnce(mock);
          mock.eq.mockReturnValueOnce(mock);
          mock.eq.mockReturnValueOnce(mock);
          mock.select.mockReturnValueOnce(mock);
          mock.single.mockResolvedValueOnce(itemResponse);
        }
        return mock;
      });

      const updatePromise = updateShoppingListItem(mockSupabase, userId, listId, itemId, updateData);

      await expect(updatePromise).rejects.toThrow(ShoppingListError);
      await expect(updatePromise).rejects.toThrow("Nie udało się zaktualizować elementu listy zakupów");

      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_lists");
      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_list_items");
    });
  });
});
