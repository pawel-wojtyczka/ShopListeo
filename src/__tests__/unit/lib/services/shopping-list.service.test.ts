import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js";
import {
  createShoppingList,
  getAllShoppingLists,
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
  addItemToShoppingList,
  updateShoppingListItem,
  deleteShoppingListItem,
} from "@/lib/services/shopping-list.service";
import type {
  CreateShoppingListRequest,
  CreateShoppingListResponse,
  ShoppingListItemDTO,
  UpdateShoppingListRequest,
  UpdateShoppingListResponse,
  ShoppingListDetailResponse,
  UpdateShoppingListItemRequest,
  UpdateShoppingListItemResponse,
} from "@/types";
import { ShoppingListError } from "@/lib/services/shopping-list.service";

// Mock the logger module
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Import logger after mocking
import { logger } from "@/lib/logger";

// Helper to create a mock Supabase client with chainable methods
const createMockSupabaseClient = (): any => {
  const mock: any = {
    from: vi.fn(),
    auth: {
      // Add auth mocks if needed by any test in this file
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    },
  };

  const queryBuilderMock: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    throwOnError: vi.fn().mockResolvedValue({ data: null, error: null }), // Mock for delete
  };

  // Make 'from' return the chainable mock object
  mock.from.mockReturnValue(queryBuilderMock);

  // Allow individual methods on the queryBuilder to be overridden in tests
  Object.assign(mock, queryBuilderMock); // Also attach methods directly for simplicity?

  return mock as SupabaseClient;
};

describe("Shopping List Service", () => {
  describe("createShoppingList", () => {
    let mockSupabase: ReturnType<typeof createMockSupabaseClient>; // Declare here
    const userId = "test-user-id";
    const listData: CreateShoppingListRequest = { title: "Nowa Lista" };

    // Initialize mockSupabase before each test in this suite
    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
      vi.clearAllMocks(); // Clear mocks specifically

      // Specific mock setup for insert().select().single()
      const singleMock = vi.fn();
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnValue({ select: selectMock });
      vi.mocked(mockSupabase.from).mockReturnValue({ insert: insertMock } as any);
      // We will set the resolved value of singleMock in each test
    });

    it("should create a shopping list successfully", async () => {
      const mockDbResponse = {
        id: "new-list-id",
        title: listData.title,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const expectedServiceResponse: CreateShoppingListResponse = {
        id: mockDbResponse.id,
        title: mockDbResponse.title,
        createdAt: mockDbResponse.created_at,
        updatedAt: mockDbResponse.updated_at,
      };

      // Configure the final 'single' call for this test
      const insertChain = mockSupabase.from("shopping_lists").insert([{}]); // Get the chain
      vi.mocked(insertChain.select("").single).mockResolvedValueOnce({ data: mockDbResponse, error: null });

      const result = await createShoppingList(mockSupabase, userId, listData);

      expect(result).toEqual(expectedServiceResponse);
      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_lists");
      const insertMock = vi.mocked(mockSupabase.from).mock.results[0].value.insert;
      expect(insertMock).toHaveBeenCalledWith([{ user_id: userId, title: listData.title }]);
      const selectMock = vi.mocked(insertMock).mock.results[0].value.select;
      expect(selectMock).toHaveBeenCalledWith("id, title, created_at, updated_at");
      const singleMock = vi.mocked(selectMock).mock.results[0].value.single;
      expect(singleMock).toHaveBeenCalledOnce();
    });

    it("should throw ShoppingListError with DUPLICATE_TITLE code for duplicate title error (23505)", async () => {
      const duplicateError = {
        message: "Duplicate key value violates unique constraint",
        code: "23505",
        details: "Key (user_id, title)=(...) already exists.",
        hint: null,
      } as PostgrestError;

      // Configure the final 'single' call for this test
      const insertChain = mockSupabase.from("shopping_lists").insert([{}]); // Get the chain
      vi.mocked(insertChain.select("").single).mockResolvedValueOnce({ data: null, error: duplicateError });

      const createPromise = createShoppingList(mockSupabase, userId, listData);

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
      } as unknown as PostgrestError;

      // Configure the final 'single' call for this test
      const insertChain = mockSupabase.from("shopping_lists").insert([{}]); // Get the chain
      vi.mocked(insertChain.select("").single).mockResolvedValueOnce({ data: null, error: dbError });

      const createPromise = createShoppingList(mockSupabase, userId, listData);

      await expect(createPromise).rejects.toThrow(ShoppingListError);
      await expect(createPromise).rejects.toMatchObject({
        message: "Nie udało się utworzyć listy zakupów",
        code: "DATABASE_ERROR",
      });
    });

    it("should throw ShoppingListError with NO_DATA_RETURNED code if Supabase returns no data and no error", async () => {
      // Configure the final 'single' call for this test
      const insertChain = mockSupabase.from("shopping_lists").insert([{}]); // Get the chain
      vi.mocked(insertChain.select("").single).mockResolvedValueOnce({ data: null, error: null });

      const createPromise = createShoppingList(mockSupabase, userId, listData);

      await expect(createPromise).rejects.toThrow(ShoppingListError);
      await expect(createPromise).rejects.toMatchObject({
        message: "Nie udało się utworzyć listy zakupów - brak danych zwrotnych",
        code: "NO_DATA_RETURNED",
      });
    });

    it("should throw ShoppingListError with UNEXPECTED_ERROR code for non-database errors", async () => {
      const unexpectedError = new Error("Network Failure");

      // Configure the final 'single' call for this test
      const insertChain = mockSupabase.from("shopping_lists").insert([{}]); // Get the chain
      vi.mocked(insertChain.select("").single).mockRejectedValueOnce(unexpectedError);

      const createPromise = createShoppingList(mockSupabase, userId, listData);

      await expect(createPromise).rejects.toThrow(ShoppingListError);
      await expect(createPromise).rejects.toMatchObject({
        message: "Wystąpił nieoczekiwany błąd podczas tworzenia listy zakupów",
        code: "UNEXPECTED_ERROR",
      });
    });
  });

  describe("getAllShoppingLists", () => {
    let mockSupabase: ReturnType<typeof createMockSupabaseClient>; // Declare here
    const userId = "test-user-id";
    const defaultPage = 1;
    const defaultPageSize = 20;

    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
      vi.clearAllMocks();
    });

    it("should return shopping lists with pagination defaults successfully", async () => {
      const mockLists = [
        { id: "list-1", title: "List A", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: "list-2", title: "List B", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      const mockTotalCount = 5;
      const mockItemCounts = { "list-1": 3, "list-2": 0 };

      const fromMock = vi.mocked(mockSupabase.from);

      // 1. Mock for total count query
      const totalCountEqMock = vi.fn().mockResolvedValue({ count: mockTotalCount, error: null });
      const totalCountSelectMock = vi.fn().mockReturnValue({ eq: totalCountEqMock });

      // 2. Mock for list fetch query
      const listRangeMock = vi.fn().mockResolvedValue({ data: mockLists, error: null });
      const listOrderMock = vi.fn().mockReturnValue({ range: listRangeMock });
      const listEqMock = vi.fn().mockReturnValue({ order: listOrderMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqMock });

      // 3. Mock for item count queries
      const itemEqMock1 = vi.fn().mockResolvedValue({ count: mockItemCounts["list-1"], error: null });
      const itemSelectCountMock1 = vi.fn().mockReturnValue({ eq: itemEqMock1 });
      const itemEqMock2 = vi.fn().mockResolvedValue({ count: mockItemCounts["list-2"], error: null });
      const itemSelectCountMock2 = vi.fn().mockReturnValue({ eq: itemEqMock2 });

      // Configure `from` to return the correct chain based on table name
      fromMock.mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          // First call is total count, second is list fetch
          if (totalCountSelectMock.mock.calls.length === 0) {
            return { select: totalCountSelectMock };
          } else {
            return { select: listSelectMock };
          }
        } else if (tableName === "shopping_list_items") {
          // Item count calls
          if (itemSelectCountMock1.mock.calls.length === 0) {
            return { select: itemSelectCountMock1 };
          } else {
            return { select: itemSelectCountMock2 };
          }
        }
        return { select: vi.fn() }; // Fallback
      });

      const result = await getAllShoppingLists(mockSupabase, userId, defaultPage, defaultPageSize);

      expect(result.data).toHaveLength(mockLists.length);
      expect(result.data[0].itemCount).toBe(mockItemCounts["list-1"]);
      expect(result.data[1].itemCount).toBe(mockItemCounts["list-2"]);
      expect(result.pagination.totalItems).toBe(mockTotalCount);

      // Verify calls
      expect(totalCountSelectMock).toHaveBeenCalledWith("*", { count: "exact", head: true });
      expect(listSelectMock).toHaveBeenCalledWith("id, title, created_at, updated_at");
      expect(listEqMock).toHaveBeenCalledWith("user_id", userId);
      expect(listOrderMock).toHaveBeenCalledWith("created_at", { ascending: false });
      expect(listRangeMock).toHaveBeenCalledWith(0, defaultPageSize - 1);
      expect(itemSelectCountMock1).toHaveBeenCalledWith("*", { count: "exact", head: true });
      expect(itemEqMock1).toHaveBeenCalledWith("shopping_list_id", mockLists[0].id);
      expect(itemSelectCountMock2).toHaveBeenCalledWith("*", { count: "exact", head: true });
      expect(itemEqMock2).toHaveBeenCalledWith("shopping_list_id", mockLists[1].id);
    });

    it("should handle custom pagination parameters correctly", async () => {
      const customPage = 2;
      const customPageSize = 5;
      const mockListsPage2 = [
        { id: "list-6", title: "List F", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      const mockTotalCount = 6;
      const mockItemCountsPage2 = { "list-6": 10 };
      const expectedOffset = (customPage - 1) * customPageSize;
      const expectedLimit = expectedOffset + customPageSize - 1;

      const fromMock = vi.mocked(mockSupabase.from);
      const totalCountEqMock = vi.fn().mockResolvedValue({ count: mockTotalCount, error: null });
      const totalCountSelectMock = vi.fn().mockReturnValue({ eq: totalCountEqMock });
      const listRangeMock = vi.fn().mockResolvedValue({ data: mockListsPage2, error: null });
      const listOrderMock = vi.fn().mockReturnValue({ range: listRangeMock });
      const listEqMock = vi.fn().mockReturnValue({ order: listOrderMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqMock });
      const itemEqMock = vi.fn().mockResolvedValue({ count: mockItemCountsPage2["list-6"], error: null });
      const itemSelectCountMock = vi.fn().mockReturnValue({ eq: itemEqMock });

      fromMock.mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return totalCountSelectMock.mock.calls.length === 0
            ? { select: totalCountSelectMock }
            : { select: listSelectMock };
        } else if (tableName === "shopping_list_items") {
          return { select: itemSelectCountMock };
        }
        return { select: vi.fn() };
      });

      const result = await getAllShoppingLists(mockSupabase, userId, customPage, customPageSize);

      expect(result.data).toHaveLength(mockListsPage2.length);
      expect(result.data[0].itemCount).toBe(mockItemCountsPage2["list-6"]);
      expect(result.pagination.currentPage).toBe(customPage);
      expect(result.pagination.pageSize).toBe(customPageSize);
      expect(listRangeMock).toHaveBeenCalledWith(expectedOffset, expectedLimit);
    });

    it("should handle custom sorting parameters correctly", async () => {
      const customSort = "title";
      const customOrder = "asc";
      const mockListsSorted = [
        { id: "list-3", title: "AAA List", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: "list-1", title: "BBB List", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      const mockTotalCount = 2;
      const mockItemCountsSorted = { "list-3": 1, "list-1": 5 };

      const fromMock = vi.mocked(mockSupabase.from);
      const totalCountEqMock = vi.fn().mockResolvedValue({ count: mockTotalCount, error: null });
      const totalCountSelectMock = vi.fn().mockReturnValue({ eq: totalCountEqMock });
      const listRangeMock = vi.fn().mockResolvedValue({ data: mockListsSorted, error: null });
      const listOrderMock = vi.fn().mockReturnValue({ range: listRangeMock });
      const listEqMock = vi.fn().mockReturnValue({ order: listOrderMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqMock });
      const itemEqMock1 = vi.fn().mockResolvedValue({ count: mockItemCountsSorted["list-3"], error: null });
      const itemSelectCountMock1 = vi.fn().mockReturnValue({ eq: itemEqMock1 });
      const itemEqMock2 = vi.fn().mockResolvedValue({ count: mockItemCountsSorted["list-1"], error: null });
      const itemSelectCountMock2 = vi.fn().mockReturnValue({ eq: itemEqMock2 });

      fromMock.mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return totalCountSelectMock.mock.calls.length === 0
            ? { select: totalCountSelectMock }
            : { select: listSelectMock };
        } else if (tableName === "shopping_list_items") {
          return itemSelectCountMock1.mock.calls.length === 0
            ? { select: itemSelectCountMock1 }
            : { select: itemSelectCountMock2 };
        }
        return { select: vi.fn() };
      });

      await getAllShoppingLists(mockSupabase, userId, defaultPage, defaultPageSize, customSort, customOrder);

      expect(listOrderMock).toHaveBeenCalledWith(customSort, { ascending: true });
    });

    it("should throw ShoppingListError if fetching total count fails", async () => {
      const countError = { message: "Count failed", code: "DB_COUNT_ERR" } as PostgrestError;
      const fromMock = vi.mocked(mockSupabase.from);
      const totalCountEqMock = vi.fn().mockResolvedValue({ count: null, error: countError });
      const totalCountSelectMock = vi.fn().mockReturnValue({ eq: totalCountEqMock });

      fromMock.mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: totalCountSelectMock };
        }
        return { select: vi.fn() };
      });

      await expect(getAllShoppingLists(mockSupabase, userId, defaultPage, defaultPageSize)).rejects.toThrow(
        new ShoppingListError("Nie udało się pobrać liczby list zakupów", "DATABASE_ERROR", countError)
      );
    });

    it("should throw ShoppingListError if fetching lists fails", async () => {
      const listFetchError = { message: "Fetch failed", code: "DB_FETCH_ERR" } as PostgrestError;
      const mockTotalCount = 5;
      const fromMock = vi.mocked(mockSupabase.from);
      const totalCountEqMock = vi.fn().mockResolvedValue({ count: mockTotalCount, error: null });
      const totalCountSelectMock = vi.fn().mockReturnValue({ eq: totalCountEqMock });
      const listRangeMock = vi.fn().mockResolvedValue({ data: null, error: listFetchError });
      const listOrderMock = vi.fn().mockReturnValue({ range: listRangeMock });
      const listEqMock = vi.fn().mockReturnValue({ order: listOrderMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqMock });

      fromMock.mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return totalCountSelectMock.mock.calls.length === 0
            ? { select: totalCountSelectMock }
            : { select: listSelectMock };
        }
        return { select: vi.fn() };
      });

      await expect(getAllShoppingLists(mockSupabase, userId, defaultPage, defaultPageSize)).rejects.toThrow(
        new ShoppingListError("Nie udało się pobrać list zakupów", "DATABASE_ERROR", listFetchError)
      );
    });

    it("should handle error when fetching item counts gracefully", async () => {
      const mockLists = [
        { id: "list-1", title: "List A", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: "list-2", title: "List B", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];
      const mockTotalCount = 2;
      const itemCountError = { message: "Item count failed", code: "ITEM_COUNT_ERR" } as PostgrestError;

      const fromMock = vi.mocked(mockSupabase.from);
      const totalCountEqMock = vi.fn().mockResolvedValue({ count: mockTotalCount, error: null });
      const totalCountSelectMock = vi.fn().mockReturnValue({ eq: totalCountEqMock });
      const listRangeMock = vi.fn().mockResolvedValue({ data: mockLists, error: null });
      const listOrderMock = vi.fn().mockReturnValue({ range: listRangeMock });
      const listEqMock = vi.fn().mockReturnValue({ order: listOrderMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqMock });
      const itemEqMock1 = vi.fn().mockResolvedValue({ count: 5, error: null }); // Success for list-1
      const itemSelectCountMock1 = vi.fn().mockReturnValue({ eq: itemEqMock1 });
      const itemEqMock2 = vi.fn().mockResolvedValue({ count: null, error: itemCountError }); // Error for list-2
      const itemSelectCountMock2 = vi.fn().mockReturnValue({ eq: itemEqMock2 });

      fromMock.mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return totalCountSelectMock.mock.calls.length === 0
            ? { select: totalCountSelectMock }
            : { select: listSelectMock };
        } else if (tableName === "shopping_list_items") {
          return itemSelectCountMock1.mock.calls.length === 0
            ? { select: itemSelectCountMock1 }
            : { select: itemSelectCountMock2 };
        }
        return { select: vi.fn() };
      });

      const result = await getAllShoppingLists(mockSupabase, userId, defaultPage, defaultPageSize);

      expect(result.data).toHaveLength(mockLists.length);
      expect(result.data[0].itemCount).toBe(5);
      expect(result.data[1].itemCount).toBe(0); // Default to 0 on error
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Błąd podczas liczenia elementów listy"),
        expect.anything(),
        itemCountError
      );
    });

    it("should return an empty array and correct pagination if no lists are found", async () => {
      const mockListsEmpty: { id: string; title: string; created_at: string; updated_at: string }[] = [];
      const mockTotalCount = 0;
      const fromMock = vi.mocked(mockSupabase.from);
      const totalCountEqMock = vi.fn().mockResolvedValue({ count: mockTotalCount, error: null });
      const totalCountSelectMock = vi.fn().mockReturnValue({ eq: totalCountEqMock });
      const listRangeMock = vi.fn().mockResolvedValue({ data: mockListsEmpty, error: null });
      const listOrderMock = vi.fn().mockReturnValue({ range: listRangeMock });
      const listEqMock = vi.fn().mockReturnValue({ order: listOrderMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqMock });

      fromMock.mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return totalCountSelectMock.mock.calls.length === 0
            ? { select: totalCountSelectMock }
            : { select: listSelectMock };
        }
        return { select: vi.fn() };
      });

      const result = await getAllShoppingLists(mockSupabase, userId, defaultPage, defaultPageSize);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.totalItems).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });
  });

  describe("getShoppingListById", () => {
    let mockSupabase: ReturnType<typeof createMockSupabaseClient>; // Declare here
    const userId = "test-user-id";
    const listId = "target-list-id";

    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
      vi.clearAllMocks();
    });

    it("should return shopping list details successfully", async () => {
      const mockList = {
        id: listId,
        title: "Target List",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const expectedResponse: ShoppingListDetailResponse = {
        id: mockList.id,
        title: mockList.title,
        createdAt: mockList.created_at,
        updatedAt: mockList.updated_at,
        items: [], // Expecting empty items as mocked below
      };

      const fromMock = vi.mocked(mockSupabase.from);

      // Mock chain for fetching the shopping list details
      const singleListMock = vi.fn().mockResolvedValue({ data: mockList, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: singleListMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });

      // FIX: Mock chain for fetching the shopping list items (empty array)
      const itemsResult = { data: [], error: null };
      const itemsOrderMock = vi.fn().mockResolvedValue(itemsResult);
      const itemsEqMock = vi.fn().mockReturnValue({ order: itemsOrderMock }); // Ensure order returns the mock
      const itemsSelectMock = vi.fn().mockReturnValue({ eq: itemsEqMock });

      fromMock.mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: listSelectMock };
        } else if (tableName === "shopping_list_items") {
          return { select: itemsSelectMock };
        }
        return { select: vi.fn() }; // Fallback
      });

      const result = await getShoppingListById(mockSupabase, userId, listId);

      expect(result).toEqual(expectedResponse);
      expect(fromMock).toHaveBeenCalledWith("shopping_lists");
      expect(fromMock).toHaveBeenCalledWith("shopping_list_items");
      expect(listSelectMock).toHaveBeenCalledWith("id, title, created_at, updated_at");
      expect(listEqIdMock).toHaveBeenCalledWith("id", listId);
      expect(listEqUserMock).toHaveBeenCalledWith("user_id", userId);
      expect(singleListMock).toHaveBeenCalledOnce();
      expect(itemsSelectMock).toHaveBeenCalledWith("id, item_name, purchased, created_at, updated_at");
      expect(itemsEqMock).toHaveBeenCalledWith("shopping_list_id", listId);
      expect(itemsOrderMock).toHaveBeenCalledWith("created_at", { ascending: true }); // Check order call
    });

    it("should throw ShoppingListError with LIST_NOT_FOUND code if list is not found", async () => {
      const fromMock = vi.mocked(mockSupabase.from);

      // Mock chain for fetching the shopping list details - returns null
      const singleListMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: singleListMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });

      // No need to mock items query as it won't be reached

      fromMock.mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: listSelectMock };
        }
        return { select: vi.fn() }; // Fallback
      });

      const getPromise = getShoppingListById(mockSupabase, userId, listId);

      await expect(getPromise).rejects.toThrow(ShoppingListError);
      await expect(getPromise).rejects.toHaveProperty("code", "LIST_NOT_FOUND");
    });
  });

  // --- Test Suite for updateShoppingList ---
  describe("updateShoppingList", () => {
    let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
    const userId = "user-test-id";
    const listId = "list-test-id";
    const updateData: UpdateShoppingListRequest = { title: "Updated Groceries" };

    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
      vi.clearAllMocks();
    });

    it("should update the shopping list title successfully", async () => {
      const updatedList = {
        id: listId,
        title: updateData.title,
        updated_at: new Date().toISOString(),
      };
      const expectedResponse: UpdateShoppingListResponse = {
        id: updatedList.id,
        title: updatedList.title,
        updatedAt: updatedList.updated_at,
      };

      const singleMock = vi.fn().mockResolvedValue({ data: updatedList, error: null });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqUserMock = vi.fn().mockReturnValue({ select: selectMock });
      const eqListMock = vi.fn().mockReturnValue({ eq: eqUserMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqListMock });
      vi.mocked(mockSupabase.from).mockImplementation(() => ({ update: updateMock }) as any); // Simple mock for this chain

      const result = await updateShoppingList(mockSupabase, userId, listId, updateData);

      expect(result).toEqual(expectedResponse);
      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_lists");
      expect(updateMock).toHaveBeenCalledWith({ title: updateData.title });
      expect(eqListMock).toHaveBeenCalledWith("id", listId);
      expect(eqUserMock).toHaveBeenCalledWith("user_id", userId);
      expect(selectMock).toHaveBeenCalledWith("id, title, updated_at");
      expect(singleMock).toHaveBeenCalledOnce();
    });

    it("should throw ShoppingListError if update fails", async () => {
      const dbError = { code: "500", message: "Database update error" } as PostgrestError;
      const singleMock = vi.fn().mockResolvedValue({ data: null, error: dbError });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqUserMock = vi.fn().mockReturnValue({ select: selectMock });
      const eqListMock = vi.fn().mockReturnValue({ eq: eqUserMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqListMock });
      vi.mocked(mockSupabase.from).mockImplementation(() => ({ update: updateMock }) as any);

      await expect(updateShoppingList(mockSupabase, userId, listId, updateData)).rejects.toThrow(
        new ShoppingListError("Nie udało się zaktualizować listy zakupów", "DATABASE_ERROR", dbError)
      );
    });

    it("should throw ShoppingListError if list not found (no data returned)", async () => {
      const singleMock = vi.fn().mockResolvedValue({ data: null, error: null }); // Simulate no data returned
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqUserMock = vi.fn().mockReturnValue({ select: selectMock });
      const eqListMock = vi.fn().mockReturnValue({ eq: eqUserMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqListMock });
      vi.mocked(mockSupabase.from).mockImplementation(() => ({ update: updateMock }) as any);

      await expect(updateShoppingList(mockSupabase, userId, listId, updateData)).rejects.toThrow(
        new ShoppingListError("Nie znaleziono listy zakupów lub brak uprawnień", "NOT_FOUND_OR_FORBIDDEN")
      );
    });

    it("should re-throw ShoppingListError if caught", async () => {
      const customError = new ShoppingListError("Custom error", "CUSTOM_CODE");
      const singleMock = vi.fn().mockRejectedValue(customError); // Simulate error within the chain
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqUserMock = vi.fn().mockReturnValue({ select: selectMock });
      const eqListMock = vi.fn().mockReturnValue({ eq: eqUserMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqListMock });
      vi.mocked(mockSupabase.from).mockImplementation(() => ({ update: updateMock }) as any);

      await expect(updateShoppingList(mockSupabase, userId, listId, updateData)).rejects.toThrow(customError);
    });

    it("should wrap unexpected errors in ShoppingListError", async () => {
      const unexpectedError = new Error("Something went wrong");
      const singleMock = vi.fn().mockRejectedValue(unexpectedError);
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqUserMock = vi.fn().mockReturnValue({ select: selectMock });
      const eqListMock = vi.fn().mockReturnValue({ eq: eqUserMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqListMock });
      vi.mocked(mockSupabase.from).mockImplementation(() => ({ update: updateMock }) as any);

      await expect(updateShoppingList(mockSupabase, userId, listId, updateData)).rejects.toThrow(
        new ShoppingListError(
          "Wystąpił nieoczekiwany błąd podczas aktualizacji listy zakupów",
          "UNEXPECTED_ERROR",
          unexpectedError
        )
      );
    });
  });

  // --- Test Suite for deleteShoppingList ---
  describe("deleteShoppingList", () => {
    let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
    const userId = "user-delete-id";
    const listId = "list-delete-id";

    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
      vi.clearAllMocks();
    });

    it("should delete the shopping list successfully", async () => {
      const throwOnErrorMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const eqUserMock = vi.fn().mockReturnValue({ throwOnError: throwOnErrorMock });
      const eqListMock = vi.fn().mockReturnValue({ eq: eqUserMock });
      const deleteMock = vi.fn().mockReturnValue({ eq: eqListMock });
      vi.mocked(mockSupabase.from).mockImplementation(() => ({ delete: deleteMock }) as any);

      await expect(deleteShoppingList(mockSupabase, userId, listId)).resolves.toBeUndefined();

      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_lists");
      expect(deleteMock).toHaveBeenCalledOnce();
      expect(eqListMock).toHaveBeenCalledWith("id", listId);
      expect(eqUserMock).toHaveBeenCalledWith("user_id", userId);
      expect(throwOnErrorMock).toHaveBeenCalledOnce();
    });

    it("should throw ShoppingListError if delete fails", async () => {
      const dbError = { code: "500", message: "Database delete error" } as PostgrestError;
      const throwOnErrorMock = vi.fn().mockResolvedValue({ data: null, error: dbError });
      const eqUserMock = vi.fn().mockReturnValue({ throwOnError: throwOnErrorMock });
      const eqListMock = vi.fn().mockReturnValue({ eq: eqUserMock });
      const deleteMock = vi.fn().mockReturnValue({ eq: eqListMock });
      vi.mocked(mockSupabase.from).mockImplementation(() => ({ delete: deleteMock }) as any);

      await expect(deleteShoppingList(mockSupabase, userId, listId)).rejects.toThrow(
        new ShoppingListError("Nie udało się usunąć listy zakupów", "DATABASE_ERROR", dbError)
      );
    });

    it("should wrap unexpected errors in ShoppingListError", async () => {
      const unexpectedError = new Error("Network issue");
      const throwOnErrorMock = vi.fn().mockRejectedValue(unexpectedError);
      const eqUserMock = vi.fn().mockReturnValue({ throwOnError: throwOnErrorMock });
      const eqListMock = vi.fn().mockReturnValue({ eq: eqUserMock });
      const deleteMock = vi.fn().mockReturnValue({ eq: eqListMock });
      vi.mocked(mockSupabase.from).mockImplementation(() => ({ delete: deleteMock }) as any);

      await expect(deleteShoppingList(mockSupabase, userId, listId)).rejects.toThrow(
        new ShoppingListError(
          "Wystąpił nieoczekiwany błąd podczas usuwania listy zakupów",
          "UNEXPECTED_ERROR",
          unexpectedError
        )
      );
    });
  });

  // --- Test Suite for addItemToShoppingList ---
  describe("addItemToShoppingList", () => {
    let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
    const userId = "user-add-item-id";
    const listId = "list-add-item-id";
    const itemData = { itemName: "Milk" };

    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
      vi.clearAllMocks();
    });

    it("should add an item to the shopping list successfully", async () => {
      const newItem = {
        id: "item-new-id",
        item_name: itemData.itemName,
        purchased: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        shopping_list_id: listId,
      };
      const expectedResponse: ShoppingListItemDTO = {
        id: newItem.id,
        itemName: newItem.item_name,
        purchased: newItem.purchased,
        createdAt: newItem.created_at,
        updatedAt: newItem.updated_at,
      };

      // Mock check list exists chain
      const listExistsSingleMock = vi.fn().mockResolvedValue({ data: { id: listId }, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: listExistsSingleMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });

      // Mock insert item chain
      const itemInsertSingleMock = vi.fn().mockResolvedValue({ data: newItem, error: null });
      const itemSelectMock = vi.fn().mockReturnValue({ single: itemInsertSingleMock });
      const itemInsertMock = vi.fn().mockReturnValue({ select: itemSelectMock });

      vi.mocked(mockSupabase.from).mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: listSelectMock } as any;
        }
        if (tableName === "shopping_list_items") {
          return { insert: itemInsertMock } as any;
        }
        return { select: vi.fn(), insert: vi.fn() } as any; // Fallback
      });

      const result = await addItemToShoppingList(mockSupabase, userId, listId, itemData);

      expect(result).toEqual(expectedResponse);
      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_lists");
      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_list_items");
      expect(listSelectMock).toHaveBeenCalledWith("id");
      expect(itemInsertMock).toHaveBeenCalledWith([
        { shopping_list_id: listId, item_name: itemData.itemName, purchased: false },
      ]);
      expect(itemSelectMock).toHaveBeenCalledWith("id, item_name, purchased, created_at, updated_at");
    });

    it("should throw ShoppingListError if the list does not exist or user has no permission", async () => {
      const listExistsSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: listExistsSingleMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });

      vi.mocked(mockSupabase.from).mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: listSelectMock } as any;
        }
        return { select: vi.fn() } as any; // Fallback
      });

      await expect(addItemToShoppingList(mockSupabase, userId, listId, itemData)).rejects.toThrow(
        new ShoppingListError("Nie znaleziono listy zakupów lub brak uprawnień", "LIST_NOT_FOUND_OR_FORBIDDEN")
      );
    });

    it("should throw ShoppingListError if checking list existence fails", async () => {
      const dbError = { code: "DB_ERR", message: "DB error" } as PostgrestError;
      const listExistsSingleMock = vi.fn().mockResolvedValue({ data: null, error: dbError });
      const listEqUserMock = vi.fn().mockReturnValue({ single: listExistsSingleMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });

      vi.mocked(mockSupabase.from).mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: listSelectMock } as any;
        }
        return { select: vi.fn() } as any; // Fallback
      });

      await expect(addItemToShoppingList(mockSupabase, userId, listId, itemData)).rejects.toThrow(
        new ShoppingListError("Błąd podczas sprawdzania dostępu do listy", "DATABASE_ERROR", dbError)
      );
    });

    it("should throw ShoppingListError if item insert fails", async () => {
      const dbError = { code: "INSERT_ERR", message: "Insert failed" } as PostgrestError;
      const listExistsSingleMock = vi.fn().mockResolvedValue({ data: { id: listId }, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: listExistsSingleMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });
      const itemInsertSingleMock = vi.fn().mockResolvedValue({ data: null, error: dbError });
      const itemSelectMock = vi.fn().mockReturnValue({ single: itemInsertSingleMock });
      const itemInsertMock = vi.fn().mockReturnValue({ select: itemSelectMock });

      vi.mocked(mockSupabase.from).mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: listSelectMock } as any;
        }
        if (tableName === "shopping_list_items") {
          return { insert: itemInsertMock } as any;
        }
        return { select: vi.fn(), insert: vi.fn() } as any;
      });

      await expect(addItemToShoppingList(mockSupabase, userId, listId, itemData)).rejects.toThrow(
        new ShoppingListError("Nie udało się dodać elementu do listy zakupów", "DATABASE_ERROR", dbError)
      );
    });

    it("should throw ShoppingListError if item insert returns no data", async () => {
      const listExistsSingleMock = vi.fn().mockResolvedValue({ data: { id: listId }, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: listExistsSingleMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });
      const itemInsertSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const itemSelectMock = vi.fn().mockReturnValue({ single: itemInsertSingleMock });
      const itemInsertMock = vi.fn().mockReturnValue({ select: itemSelectMock });

      vi.mocked(mockSupabase.from).mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: listSelectMock } as any;
        }
        if (tableName === "shopping_list_items") {
          return { insert: itemInsertMock } as any;
        }
        return { select: vi.fn(), insert: vi.fn() } as any;
      });

      await expect(addItemToShoppingList(mockSupabase, userId, listId, itemData)).rejects.toThrow(
        new ShoppingListError(
          "Nie udało się dodać elementu do listy zakupów - brak danych zwrotnych",
          "NO_DATA_RETURNED"
        )
      );
    });
  });

  // --- Test Suite for updateShoppingListItem ---
  describe("updateShoppingListItem", () => {
    let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
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
      const expectedResponse: UpdateShoppingListItemResponse = {
        id: updatedItem.id,
        itemName: updatedItem.item_name,
        purchased: updatedItem.purchased,
        updatedAt: updatedItem.updated_at,
      };

      // Mock check list exists chain
      const listExistsSingleMock = vi.fn().mockResolvedValue({ data: { id: listId }, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: listExistsSingleMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });

      // Mock update item chain
      const itemUpdateSingleMock = vi.fn().mockResolvedValue({ data: updatedItem, error: null });
      const itemSelectMock = vi.fn().mockReturnValue({ single: itemUpdateSingleMock });
      const itemEqIdMock = vi.fn().mockReturnValue({ select: itemSelectMock });
      const itemEqListMock = vi.fn().mockReturnValue({ eq: itemEqIdMock });
      const itemUpdateMock = vi.fn().mockReturnValue({ eq: itemEqListMock });

      vi.mocked(mockSupabase.from).mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: listSelectMock } as any;
        }
        if (tableName === "shopping_list_items") {
          return { update: itemUpdateMock } as any;
        }
        return { select: vi.fn(), update: vi.fn() } as any;
      });

      const result = await updateShoppingListItem(mockSupabase, userId, listId, itemId, updateData);

      expect(result).toEqual(expectedResponse);
      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_lists");
      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_list_items");
      expect(itemUpdateMock).toHaveBeenCalledWith({ item_name: updateData.itemName, purchased: updateData.purchased });
      expect(itemSelectMock).toHaveBeenCalledWith("id, item_name, purchased, updated_at");
    });

    it("should throw ShoppingListError if the list does not exist or user has no permission", async () => {
      const listExistsSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: listExistsSingleMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });

      vi.mocked(mockSupabase.from).mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: listSelectMock } as any;
        }
        return { select: vi.fn() } as any;
      });

      await expect(updateShoppingListItem(mockSupabase, userId, listId, itemId, updateData)).rejects.toThrow(
        new ShoppingListError("Nie znaleziono listy zakupów lub brak uprawnień", "LIST_NOT_FOUND_OR_FORBIDDEN")
      );
    });

    it("should throw ShoppingListError if item update fails", async () => {
      const dbError = { code: "UPDATE_ERR", message: "Update failed" } as PostgrestError;
      const listExistsSingleMock = vi.fn().mockResolvedValue({ data: { id: listId }, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: listExistsSingleMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });
      const itemUpdateSingleMock = vi.fn().mockResolvedValue({ data: null, error: dbError });
      const itemSelectMock = vi.fn().mockReturnValue({ single: itemUpdateSingleMock });
      const itemEqIdMock = vi.fn().mockReturnValue({ select: itemSelectMock });
      const itemEqListMock = vi.fn().mockReturnValue({ eq: itemEqIdMock });
      const itemUpdateMock = vi.fn().mockReturnValue({ eq: itemEqListMock });

      vi.mocked(mockSupabase.from).mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: listSelectMock } as any;
        }
        if (tableName === "shopping_list_items") {
          return { update: itemUpdateMock } as any;
        }
        return { select: vi.fn(), update: vi.fn() } as any;
      });

      await expect(updateShoppingListItem(mockSupabase, userId, listId, itemId, updateData)).rejects.toThrow(
        new ShoppingListError("Nie udało się zaktualizować elementu listy zakupów", "DATABASE_ERROR", dbError)
      );
    });

    it("should throw ShoppingListError if item update returns no data", async () => {
      const listExistsSingleMock = vi.fn().mockResolvedValue({ data: { id: listId }, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: listExistsSingleMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });
      const itemUpdateSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const itemSelectMock = vi.fn().mockReturnValue({ single: itemUpdateSingleMock });
      const itemEqIdMock = vi.fn().mockReturnValue({ select: itemSelectMock });
      const itemEqListMock = vi.fn().mockReturnValue({ eq: itemEqIdMock });
      const itemUpdateMock = vi.fn().mockReturnValue({ eq: itemEqListMock });

      vi.mocked(mockSupabase.from).mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: listSelectMock } as any;
        }
        if (tableName === "shopping_list_items") {
          return { update: itemUpdateMock } as any;
        }
        return { select: vi.fn(), update: vi.fn() } as any;
      });

      await expect(updateShoppingListItem(mockSupabase, userId, listId, itemId, updateData)).rejects.toThrow(
        new ShoppingListError(
          "Nie znaleziono elementu lub nie należy on do tej listy zakupów",
          "ITEM_NOT_FOUND_OR_WRONG_LIST"
        )
      );
    });

    it("should handle partial updates (only itemName)", async () => {
      const partialUpdateData = { itemName: "Skim Milk" };
      const updatedItem = {
        id: itemId,
        item_name: partialUpdateData.itemName,
        purchased: false,
        updated_at: new Date().toISOString(),
        shopping_list_id: listId,
      };
      const listExistsSingleMock = vi.fn().mockResolvedValue({ data: { id: listId }, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: listExistsSingleMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });
      const itemUpdateSingleMock = vi.fn().mockResolvedValue({ data: updatedItem, error: null });
      const itemSelectMock = vi.fn().mockReturnValue({ single: itemUpdateSingleMock });
      const itemEqIdMock = vi.fn().mockReturnValue({ select: itemSelectMock });
      const itemEqListMock = vi.fn().mockReturnValue({ eq: itemEqIdMock });
      const itemUpdateMock = vi.fn().mockReturnValue({ eq: itemEqListMock });

      vi.mocked(mockSupabase.from).mockImplementation((tableName) => {
        if (tableName === "shopping_lists") return { select: listSelectMock } as any;
        if (tableName === "shopping_list_items") return { update: itemUpdateMock } as any;
        return { select: vi.fn(), update: vi.fn() } as any;
      });

      await updateShoppingListItem(mockSupabase, userId, listId, itemId, partialUpdateData);

      expect(itemUpdateMock).toHaveBeenCalledWith({ item_name: partialUpdateData.itemName });
    });

    it("should handle partial updates (only purchased)", async () => {
      const partialUpdateData = { purchased: true };
      const updatedItem = {
        id: itemId,
        item_name: "Existing Item",
        purchased: partialUpdateData.purchased,
        updated_at: new Date().toISOString(),
        shopping_list_id: listId,
      };
      const listExistsSingleMock = vi.fn().mockResolvedValue({ data: { id: listId }, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: listExistsSingleMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });
      const itemUpdateSingleMock = vi.fn().mockResolvedValue({ data: updatedItem, error: null });
      const itemSelectMock = vi.fn().mockReturnValue({ single: itemUpdateSingleMock });
      const itemEqIdMock = vi.fn().mockReturnValue({ select: itemSelectMock });
      const itemEqListMock = vi.fn().mockReturnValue({ eq: itemEqIdMock });
      const itemUpdateMock = vi.fn().mockReturnValue({ eq: itemEqListMock });

      vi.mocked(mockSupabase.from).mockImplementation((tableName) => {
        if (tableName === "shopping_lists") return { select: listSelectMock } as any;
        if (tableName === "shopping_list_items") return { update: itemUpdateMock } as any;
        return { select: vi.fn(), update: vi.fn() } as any;
      });

      await updateShoppingListItem(mockSupabase, userId, listId, itemId, partialUpdateData);

      expect(itemUpdateMock).toHaveBeenCalledWith({ purchased: partialUpdateData.purchased });
    });
  });

  // --- Test Suite for deleteShoppingListItem ---
  describe("deleteShoppingListItem", () => {
    let mockSupabase: ReturnType<typeof createMockSupabaseClient>;
    const userId = "user-delete-item-id";
    const listId = "list-delete-item-id";
    const itemId = "item-delete-id";

    beforeEach(() => {
      mockSupabase = createMockSupabaseClient();
      vi.clearAllMocks();
    });

    it("should delete an item successfully", async () => {
      const listExistsSingleMock = vi.fn().mockResolvedValue({ data: { id: listId }, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: listExistsSingleMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });
      const itemThrowOnErrorMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const itemEqIdMock = vi.fn().mockReturnValue({ throwOnError: itemThrowOnErrorMock });
      const itemEqListMock = vi.fn().mockReturnValue({ eq: itemEqIdMock });
      const itemDeleteMock = vi.fn().mockReturnValue({ eq: itemEqListMock });

      vi.mocked(mockSupabase.from).mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: listSelectMock } as any;
        }
        if (tableName === "shopping_list_items") {
          return { delete: itemDeleteMock } as any;
        }
        return { select: vi.fn(), delete: vi.fn() } as any;
      });

      await expect(deleteShoppingListItem(mockSupabase, userId, listId, itemId)).resolves.toBeUndefined();

      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_lists");
      expect(mockSupabase.from).toHaveBeenCalledWith("shopping_list_items");
      expect(itemDeleteMock).toHaveBeenCalledOnce();
      expect(itemEqListMock).toHaveBeenCalledWith("shopping_list_id", listId);
      expect(itemEqIdMock).toHaveBeenCalledWith("id", itemId);
      expect(itemThrowOnErrorMock).toHaveBeenCalledOnce();
    });

    it("should throw ShoppingListError if the list does not exist or user has no permission", async () => {
      const listExistsSingleMock = vi.fn().mockResolvedValue({ data: null, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: listExistsSingleMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });

      vi.mocked(mockSupabase.from).mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: listSelectMock } as any;
        }
        return { select: vi.fn() } as any;
      });

      await expect(deleteShoppingListItem(mockSupabase, userId, listId, itemId)).rejects.toThrow(
        new ShoppingListError("Nie znaleziono listy zakupów lub brak uprawnień", "LIST_NOT_FOUND_OR_FORBIDDEN")
      );
    });

    it("should throw ShoppingListError if item delete fails", async () => {
      const dbError = { code: "DELETE_ERR", message: "Delete failed" } as PostgrestError;
      const listExistsSingleMock = vi.fn().mockResolvedValue({ data: { id: listId }, error: null });
      const listEqUserMock = vi.fn().mockReturnValue({ single: listExistsSingleMock });
      const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
      const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });
      const itemThrowOnErrorMock = vi.fn().mockResolvedValue({ data: null, error: dbError });
      const itemEqIdMock = vi.fn().mockReturnValue({ throwOnError: itemThrowOnErrorMock });
      const itemEqListMock = vi.fn().mockReturnValue({ eq: itemEqIdMock });
      const itemDeleteMock = vi.fn().mockReturnValue({ eq: itemEqListMock });

      vi.mocked(mockSupabase.from).mockImplementation((tableName) => {
        if (tableName === "shopping_lists") {
          return { select: listSelectMock } as any;
        }
        if (tableName === "shopping_list_items") {
          return { delete: itemDeleteMock } as any;
        }
        return { select: vi.fn(), delete: vi.fn() } as any;
      });

      await expect(deleteShoppingListItem(mockSupabase, userId, listId, itemId)).rejects.toThrow(
        new ShoppingListError("Nie udało się usunąć elementu listy zakupów", "DATABASE_ERROR", dbError)
      );
    });
  });
});
