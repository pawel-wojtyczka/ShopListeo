import { describe, it, expect, vi } from "vitest";
// import type { SupabaseClient } from "@supabase/supabase-js"; // Usunięto nieużywany import
import {
  createShoppingList,
  ShoppingListError,
  getAllShoppingLists,
  getShoppingListById,
} from "@/lib/services/shopping-list.service";
import type { CreateShoppingListRequest, CreateShoppingListResponse, ShoppingListDetailResponse } from "@/types";

// Mock the logger module
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock SupabaseClient - Revert to casting the whole object to any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSupabase: any = {
  from: vi.fn(),
  // Include other methods used across ALL tests in this file to avoid runtime errors
  // Even if mocked specifically in tests, they need to exist on the base mock object
  select: vi.fn(),
  insert: vi.fn(),
  single: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  range: vi.fn(),
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

describe("getAllShoppingLists", () => {
  const userId = "test-user-id";
  const defaultPage = 1;
  const defaultPageSize = 20;

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock behavior for chained calls
    // Need to return 'this' for most intermediate steps
    // Only mock methods directly available on the initial Supabase mock if needed
    vi.mocked(mockSupabase.from).mockReturnThis(); // Keep this if 'from' is always the start
    // vi.mocked(mockSupabase.select).mockReturnThis(); // Remove - select returns different things
    // vi.mocked(mockSupabase.eq).mockReturnThis(); // Remove - error
    // vi.mocked(mockSupabase.order).mockReturnThis(); // Remove - error
    // vi.mocked(mockSupabase.range).mockReturnThis(); // Remove - error
  });

  it("should return shopping lists with pagination defaults successfully", async () => {
    const mockLists = [
      { id: "list-1", title: "List A", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "list-2", title: "List B", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
    const mockTotalCount = 5;
    const mockItemCounts = { "list-1": 3, "list-2": 0 };

    // Mock the necessary Supabase client methods directly for this test case
    const fromMock = vi.mocked(mockSupabase.from);

    // 1. Mock the chain for the total count query
    const totalCountResult = { count: mockTotalCount, error: null };
    const totalCountEqMock = vi.fn().mockResolvedValue(totalCountResult);
    const totalCountSelectMock = vi.fn().mockReturnValue({ eq: totalCountEqMock });

    // 2. Mock the chain for the list fetch query
    const listFetchResult = { data: mockLists, error: null };
    const listRangeMock = vi.fn().mockResolvedValue(listFetchResult);
    const listOrderMock = vi.fn().mockReturnValue({ range: listRangeMock });
    const listEqMock = vi.fn().mockReturnValue({ order: listOrderMock });
    const listSelectMock = vi.fn().mockReturnValue({ eq: listEqMock });

    // 3. Mock the chain for the item count queries (separate mocks for each call)
    const itemFetchResult1 = { count: mockItemCounts["list-1"], error: null };
    const itemEqMock1 = vi.fn().mockResolvedValue(itemFetchResult1);
    const itemSelectMock1 = vi.fn().mockReturnValue({ eq: itemEqMock1 });

    const itemFetchResult2 = { count: mockItemCounts["list-2"], error: null };
    const itemEqMock2 = vi.fn().mockResolvedValue(itemFetchResult2);
    const itemSelectMock2 = vi.fn().mockReturnValue({ eq: itemEqMock2 });

    // Implement `from` to return the correct chain based on the table name and call order
    fromMock
      .mockImplementationOnce((tableName) => {
        // First call: total count
        expect(tableName).toBe("shopping_lists");
        return { select: totalCountSelectMock };
      })
      .mockImplementationOnce((tableName) => {
        // Second call: list fetch
        expect(tableName).toBe("shopping_lists");
        return { select: listSelectMock };
      })
      .mockImplementationOnce((tableName) => {
        // Third call: item count for list-1
        expect(tableName).toBe("shopping_list_items");
        return { select: itemSelectMock1 };
      })
      .mockImplementationOnce((tableName) => {
        // Fourth call: item count for list-2
        expect(tableName).toBe("shopping_list_items");
        return { select: itemSelectMock2 };
      });

    // --- Execute ---
    const result = await getAllShoppingLists(mockSupabase, userId, defaultPage, defaultPageSize);

    // --- Assertions ---
    expect(result.data).toHaveLength(mockLists.length);
    expect(result.data[0].id).toBe(mockLists[0].id);
    expect(result.data[0].itemCount).toBe(mockItemCounts["list-1"]);
    expect(result.data[1].id).toBe(mockLists[1].id);
    expect(result.data[1].itemCount).toBe(mockItemCounts["list-2"]);

    expect(result.pagination.totalItems).toBe(mockTotalCount);
    expect(result.pagination.currentPage).toBe(defaultPage);
    expect(result.pagination.pageSize).toBe(defaultPageSize);
    expect(result.pagination.totalPages).toBe(Math.ceil(mockTotalCount / defaultPageSize));

    // Check Supabase calls - Verify the mocks were configured and called correctly
    expect(fromMock).toHaveBeenCalledTimes(2 + mockLists.length); // 2 for lists, N for items

    // Verify total count call chain details
    expect(totalCountSelectMock).toHaveBeenCalledWith("*", { count: "exact", head: true });
    expect(totalCountEqMock).toHaveBeenCalledWith("user_id", userId);

    // Verify list fetch call chain details
    expect(listSelectMock).toHaveBeenCalledWith("id, title, created_at, updated_at");
    expect(listEqMock).toHaveBeenCalledWith("user_id", userId);
    expect(listOrderMock).toHaveBeenCalledWith("created_at", { ascending: false }); // Default sort
    expect(listRangeMock).toHaveBeenCalledWith(0, defaultPageSize - 1); // Default range

    // Verify item count call chain details for each list
    expect(itemSelectMock1).toHaveBeenCalledWith("*", { count: "exact", head: true });
    expect(itemEqMock1).toHaveBeenCalledWith("shopping_list_id", mockLists[0].id);
    expect(itemSelectMock2).toHaveBeenCalledWith("*", { count: "exact", head: true });
    expect(itemEqMock2).toHaveBeenCalledWith("shopping_list_id", mockLists[1].id);
  });

  it("should handle custom pagination parameters correctly", async () => {
    const customPage = 2;
    const customPageSize = 5;
    const mockListsPage2 = [
      { id: "list-6", title: "List F", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      // Załóżmy, że na stronie 2 jest tylko 1 lista, mimo że pageSize=5
    ];
    const mockTotalCount = 6; // 5 na stronie 1, 1 na stronie 2
    const mockItemCountsPage2 = { "list-6": 10 };
    const expectedOffset = (customPage - 1) * customPageSize;
    const expectedLimit = expectedOffset + customPageSize - 1;

    const fromMock = vi.mocked(mockSupabase.from);

    // 1. Mock total count
    const totalCountResult = { count: mockTotalCount, error: null };
    const totalCountEqMock = vi.fn().mockResolvedValue(totalCountResult);
    const totalCountSelectMock = vi.fn().mockReturnValue({ eq: totalCountEqMock });

    // 2. Mock list fetch for page 2
    const listFetchResult = { data: mockListsPage2, error: null };
    const listRangeMock = vi.fn().mockResolvedValue(listFetchResult);
    const listOrderMock = vi.fn().mockReturnValue({ range: listRangeMock });
    const listEqMock = vi.fn().mockReturnValue({ order: listOrderMock });
    const listSelectMock = vi.fn().mockReturnValue({ eq: listEqMock });

    // 3. Mock item count for list-6
    const itemFetchResult = { count: mockItemCountsPage2["list-6"], error: null };
    const itemEqMock = vi.fn().mockResolvedValue(itemFetchResult);
    const itemSelectMock = vi.fn().mockReturnValue({ eq: itemEqMock });

    // Configure `from` mock
    fromMock
      .mockImplementationOnce((tableName) => {
        // Total count
        expect(tableName).toBe("shopping_lists");
        return { select: totalCountSelectMock };
      })
      .mockImplementationOnce((tableName) => {
        // List fetch
        expect(tableName).toBe("shopping_lists");
        return { select: listSelectMock };
      })
      .mockImplementationOnce((tableName) => {
        // Item count
        expect(tableName).toBe("shopping_list_items");
        return { select: itemSelectMock };
      });

    // --- Execute ---
    const result = await getAllShoppingLists(mockSupabase, userId, customPage, customPageSize);

    // --- Assertions ---
    expect(result.data).toHaveLength(mockListsPage2.length);
    expect(result.data[0].id).toBe(mockListsPage2[0].id);
    expect(result.data[0].itemCount).toBe(mockItemCountsPage2["list-6"]);

    expect(result.pagination.totalItems).toBe(mockTotalCount);
    expect(result.pagination.currentPage).toBe(customPage);
    expect(result.pagination.pageSize).toBe(customPageSize);
    expect(result.pagination.totalPages).toBe(Math.ceil(mockTotalCount / customPageSize));

    // Verify list fetch call chain used correct range
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

    // 1. Mock total count
    const totalCountResult = { count: mockTotalCount, error: null };
    const totalCountEqMock = vi.fn().mockResolvedValue(totalCountResult);
    const totalCountSelectMock = vi.fn().mockReturnValue({ eq: totalCountEqMock });

    // 2. Mock list fetch with custom sort
    const listFetchResult = { data: mockListsSorted, error: null };
    const listRangeMock = vi.fn().mockResolvedValue(listFetchResult);
    const listOrderMock = vi.fn().mockReturnValue({ range: listRangeMock });
    const listEqMock = vi.fn().mockReturnValue({ order: listOrderMock });
    const listSelectMock = vi.fn().mockReturnValue({ eq: listEqMock });

    // 3. Mock item counts
    const itemFetchResult1 = { count: mockItemCountsSorted["list-3"], error: null };
    const itemEqMock1 = vi.fn().mockResolvedValue(itemFetchResult1);
    const itemSelectMock1 = vi.fn().mockReturnValue({ eq: itemEqMock1 });

    const itemFetchResult2 = { count: mockItemCountsSorted["list-1"], error: null };
    const itemEqMock2 = vi.fn().mockResolvedValue(itemFetchResult2);
    const itemSelectMock2 = vi.fn().mockReturnValue({ eq: itemEqMock2 });

    // Configure `from` mock
    fromMock
      .mockImplementationOnce((tableName) => {
        // Total count
        expect(tableName).toBe("shopping_lists");
        return { select: totalCountSelectMock };
      })
      .mockImplementationOnce((tableName) => {
        // List fetch
        expect(tableName).toBe("shopping_lists");
        return { select: listSelectMock };
      })
      .mockImplementationOnce((tableName) => {
        // Item count 1
        expect(tableName).toBe("shopping_list_items");
        return { select: itemSelectMock1 };
      })
      .mockImplementationOnce((tableName) => {
        // Item count 2
        expect(tableName).toBe("shopping_list_items");
        return { select: itemSelectMock2 };
      });

    // --- Execute ---
    const result = await getAllShoppingLists(
      mockSupabase,
      userId,
      defaultPage, // Use default page/pageSize for simplicity
      defaultPageSize,
      customSort, // Custom sort
      customOrder // Custom order
    );

    // --- Assertions ---
    expect(result.data).toHaveLength(mockListsSorted.length);
    expect(result.data[0].id).toBe(mockListsSorted[0].id);
    expect(result.data[1].id).toBe(mockListsSorted[1].id);
    // Basic check that pagination defaults are still correct
    expect(result.pagination.currentPage).toBe(defaultPage);
    expect(result.pagination.totalItems).toBe(mockTotalCount);

    // Verify list fetch call chain used correct sort order
    // Funkcja mapuje 'title' na 'title', a 'asc' na { ascending: true }
    expect(listOrderMock).toHaveBeenCalledWith(customSort, { ascending: true });
  });

  it("should throw ShoppingListError if fetching total count fails", async () => {
    const countError = { message: "Count failed", code: "DB_COUNT_ERR", details: null, hint: null };

    const fromMock = vi.mocked(mockSupabase.from);

    // Mock the total count query to return an error
    const totalCountEqMock = vi.fn().mockResolvedValue({ count: null, error: countError });
    const totalCountSelectMock = vi.fn().mockReturnValue({ eq: totalCountEqMock });

    // Configure `from` mock for the first call (total count)
    fromMock.mockImplementationOnce((tableName) => {
      expect(tableName).toBe("shopping_lists");
      return { select: totalCountSelectMock };
    });

    // --- Execute & Assert ---
    // Call the function once and store the promise
    const getPromise = getAllShoppingLists(mockSupabase, userId, defaultPage, defaultPageSize);

    // Assert on the promise
    await expect(getPromise).rejects.toThrow(ShoppingListError);
    await expect(getPromise).rejects.toMatchObject({
      message: "Nie udało się pobrać liczby list zakupów",
      code: "DATABASE_ERROR",
    });
  });

  it("should throw ShoppingListError if fetching lists fails", async () => {
    const listFetchError = { message: "Fetch failed", code: "DB_FETCH_ERR", details: null, hint: null };
    const mockTotalCount = 5; // Assume count succeeds

    const fromMock = vi.mocked(mockSupabase.from);

    // 1. Mock total count (success)
    const totalCountResult = { count: mockTotalCount, error: null };
    const totalCountEqMock = vi.fn().mockResolvedValue(totalCountResult);
    const totalCountSelectMock = vi.fn().mockReturnValue({ eq: totalCountEqMock });

    // 2. Mock list fetch (error)
    const listRangeMock = vi.fn().mockResolvedValue({ data: null, error: listFetchError }); // Return error here
    const listOrderMock = vi.fn().mockReturnValue({ range: listRangeMock });
    const listEqMock = vi.fn().mockReturnValue({ order: listOrderMock });
    const listSelectMock = vi.fn().mockReturnValue({ eq: listEqMock });

    // Configure `from` mock
    fromMock
      .mockImplementationOnce((tableName) => {
        // Total count
        expect(tableName).toBe("shopping_lists");
        return { select: totalCountSelectMock };
      })
      .mockImplementationOnce((tableName) => {
        // List fetch
        expect(tableName).toBe("shopping_lists");
        return { select: listSelectMock };
      });
    // No need to mock item counts as it won't get there

    // --- Execute & Assert ---
    const getPromise = getAllShoppingLists(mockSupabase, userId, defaultPage, defaultPageSize);

    await expect(getPromise).rejects.toThrow(ShoppingListError);
    await expect(getPromise).rejects.toMatchObject({
      message: "Nie udało się pobrać list zakupów",
      code: "DATABASE_ERROR",
    });
  });

  it("should handle error when fetching item counts gracefully", async () => {
    // Setup similar to success case, but mock item count to fail for one list
    const mockLists = [
      { id: "list-1", title: "List A", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "list-2", title: "List B", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
    const mockTotalCount = 2;
    const itemCountError = { message: "Item count failed", code: "ITEM_COUNT_ERR", details: null, hint: null };

    const fromMock = vi.mocked(mockSupabase.from);

    // 1. Mock total count (success)
    const totalCountResult = { count: mockTotalCount, error: null };
    const totalCountEqMock = vi.fn().mockResolvedValue(totalCountResult);
    const totalCountSelectMock = vi.fn().mockReturnValue({ eq: totalCountEqMock });

    // 2. Mock list fetch (success)
    const listFetchResult = { data: mockLists, error: null };
    const listRangeMock = vi.fn().mockResolvedValue(listFetchResult);
    const listOrderMock = vi.fn().mockReturnValue({ range: listRangeMock });
    const listEqMock = vi.fn().mockReturnValue({ order: listOrderMock });
    const listSelectMock = vi.fn().mockReturnValue({ eq: listEqMock });

    // 3. Mock item counts (success for list-1, error for list-2)
    const itemFetchResult1 = { count: 5, error: null }; // Success for list-1
    const itemEqMock1 = vi.fn().mockResolvedValue(itemFetchResult1);
    const itemSelectMock1 = vi.fn().mockReturnValue({ eq: itemEqMock1 });

    const itemFetchResult2 = { count: null, error: itemCountError }; // Error for list-2
    const itemEqMock2 = vi.fn().mockResolvedValue(itemFetchResult2);
    const itemSelectMock2 = vi.fn().mockReturnValue({ eq: itemEqMock2 });

    // Configure `from` mock
    fromMock
      .mockImplementationOnce((tableName) => {
        // Total count
        expect(tableName).toBe("shopping_lists");
        return { select: totalCountSelectMock };
      })
      .mockImplementationOnce((tableName) => {
        // List fetch
        expect(tableName).toBe("shopping_lists");
        return { select: listSelectMock };
      })
      .mockImplementationOnce((tableName) => {
        // Item count 1 (Success)
        expect(tableName).toBe("shopping_list_items");
        return { select: itemSelectMock1 };
      })
      .mockImplementationOnce((tableName) => {
        // Item count 2 (Error)
        expect(tableName).toBe("shopping_list_items");
        return { select: itemSelectMock2 };
      });

    // --- Execute ---
    const result = await getAllShoppingLists(mockSupabase, userId, defaultPage, defaultPageSize);

    // --- Assertions ---
    // Function should still succeed, but log a warning and return 0 for the failed item count
    expect(result.data).toHaveLength(mockLists.length);
    expect(result.data[0].itemCount).toBe(5); // Success for list-1
    expect(result.data[1].itemCount).toBe(0); // Default to 0 on error for list-2
    // Check pagination is still correct
    expect(result.pagination.totalItems).toBe(mockTotalCount);
  });

  it("should return an empty array and correct pagination if no lists are found", async () => {
    // Define the type explicitly for the empty array
    const mockListsEmpty: { id: string; title: string; created_at: string; updated_at: string }[] = [];
    const mockTotalCount = 0;

    const fromMock = vi.mocked(mockSupabase.from);

    // 1. Mock total count (0)
    const totalCountResult = { count: mockTotalCount, error: null };
    const totalCountEqMock = vi.fn().mockResolvedValue(totalCountResult);
    const totalCountSelectMock = vi.fn().mockReturnValue({ eq: totalCountEqMock });

    // 2. Mock list fetch (empty array)
    const listFetchResult = { data: mockListsEmpty, error: null };
    const listRangeMock = vi.fn().mockResolvedValue(listFetchResult);
    const listOrderMock = vi.fn().mockReturnValue({ range: listRangeMock });
    const listEqMock = vi.fn().mockReturnValue({ order: listOrderMock });
    const listSelectMock = vi.fn().mockReturnValue({ eq: listEqMock });

    // Configure `from` mock
    fromMock
      .mockImplementationOnce((tableName) => {
        // Total count
        expect(tableName).toBe("shopping_lists");
        return { select: totalCountSelectMock };
      })
      .mockImplementationOnce((tableName) => {
        // List fetch
        expect(tableName).toBe("shopping_lists");
        return { select: listSelectMock };
      });
    // No item count calls needed if no lists are fetched

    // --- Execute ---
    const result = await getAllShoppingLists(mockSupabase, userId, defaultPage, defaultPageSize);

    // --- Assertions ---
    expect(result.data).toHaveLength(0);
    expect(result.pagination.totalItems).toBe(0);
    expect(result.pagination.totalPages).toBe(0); // Ceil(0 / 20) = 0
    expect(result.pagination.currentPage).toBe(defaultPage);
    expect(result.pagination.pageSize).toBe(defaultPageSize);
  });

  // TODO: Add more tests for pagination, sorting, errors etc.
});

describe("getShoppingListById", () => {
  const userId = "test-user-id";
  const listId = "target-list-id";

  beforeEach(() => {
    vi.clearAllMocks();
    // Resetting individual mocks might be needed if tests interfere
    // mockSupabase.from.mockClear(); // Keep commented unless needed
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
      items: [],
    };

    const fromMock = vi.mocked(mockSupabase.from);

    // Mock chain for fetching the shopping list details
    const singleListMock = vi.fn().mockResolvedValue({ data: mockList, error: null });
    const listEqUserMock = vi.fn().mockReturnValue({ single: singleListMock });
    const listEqIdMock = vi.fn().mockReturnValue({ eq: listEqUserMock });
    const listSelectMock = vi.fn().mockReturnValue({ eq: listEqIdMock });

    // Mock chain for fetching the shopping list items
    const itemsResult = { data: [], error: null };
    const itemsOrderMock = vi.fn().mockResolvedValue(itemsResult);
    const itemsEqMock = vi.fn().mockReturnValue({ order: itemsOrderMock });
    const itemsSelectMock = vi.fn().mockReturnValue({ eq: itemsEqMock });

    // Configure `from` mock to return the correct starting point of the chain
    fromMock.mockImplementation((tableName) => {
      if (tableName === "shopping_lists") {
        return { select: listSelectMock };
      } else if (tableName === "shopping_list_items") {
        return { select: itemsSelectMock };
      }
      // Fallback (optional, for robustness)
      return { select: vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn() })) })) })) };
    });

    // --- Execute & Debug ---
    try {
      const result = await getShoppingListById(mockSupabase, userId, listId);

      // --- Assertions ---
      expect(result).toEqual(expectedResponse);
      expect(fromMock).toHaveBeenCalledWith("shopping_lists");
      expect(fromMock).toHaveBeenCalledWith("shopping_list_items");

      // Verify the specific calls for list details chain
      expect(listSelectMock).toHaveBeenCalledWith("id, title, created_at, updated_at");
      expect(listEqIdMock).toHaveBeenCalledWith("id", listId);
      expect(listEqUserMock).toHaveBeenCalledWith("user_id", userId);
      expect(singleListMock).toHaveBeenCalledOnce();

      // Verify the specific calls for list items chain
      expect(itemsSelectMock).toHaveBeenCalledWith("id, item_name, purchased, created_at, updated_at");
      expect(itemsEqMock).toHaveBeenCalledWith("shopping_list_id", listId);
      expect(itemsOrderMock).toHaveBeenCalledWith("created_at", { ascending: true });
    } catch (e) {
      console.error("### Test Error Details ###");
      console.error("Caught error in test:", e);
      if (e instanceof ShoppingListError && e.originalError) {
        console.error("Original error caught by service:", e.originalError);
      }
      console.error("##########################");
      // Re-throw to ensure the test fails as expected
      throw e;
    }
  });

  it("should throw ShoppingListError with LIST_NOT_FOUND code if list is not found", async () => {
    // Mock the necessary Supabase client methods directly for this test case
    const fromMock = vi.mocked(mockSupabase.from);

    // Configure `from` to return the entire expected chain with inline mocks
    fromMock.mockImplementationOnce((tableName) => {
      expect(tableName).toBe("shopping_lists");
      return {
        select: vi.fn((selectArg) => {
          // Mock select method
          expect(selectArg).toBe("id, title, created_at, updated_at");
          return {
            eq: vi.fn((col1, val1) => {
              // Mock first eq method
              expect(col1).toBe("id");
              expect(val1).toBe(listId);
              return {
                eq: vi.fn((col2, val2) => {
                  // Mock second eq method
                  expect(col2).toBe("user_id");
                  expect(val2).toBe(userId);
                  return {
                    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                  };
                }),
              };
            }),
          };
        }),
      };
    });

    // --- Execute ---
    const getPromise = getShoppingListById(mockSupabase, userId, listId);

    // --- Assertions ---
    // Use toHaveProperty for more robust checking against the Error object
    await expect(getPromise).rejects.toThrow(ShoppingListError);
    await expect(getPromise).rejects.toHaveProperty("code", "LIST_NOT_FOUND");
    await expect(getPromise).rejects.toHaveProperty("message", "Nie znaleziono listy zakupów o podanym ID");
  });

  // TODO: Add tests for other errors etc.
});
