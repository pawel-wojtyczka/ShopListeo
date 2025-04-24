import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ShoppingListSummaryDTO, PaginationResponse } from "../../../types";

// Definicje funkcji mockujących
const mockShowSuccessToast = vi.fn();
const mockShowErrorToast = vi.fn();
const mockUseAuth = vi.fn();

// Wracamy do vi.mock (jest hoistowane)
vi.mock("../../services/toast-service", () => ({
  showSuccessToast: mockShowSuccessToast,
  showErrorToast: mockShowErrorToast,
}));

vi.mock("../../auth/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Importujemy hooka PO mockowaniu
import { useShoppingLists } from "../useShoppingLists";
// Nie potrzebujemy importować zamockowanych funkcji
// import { showSuccessToast, showErrorToast } from "../../services/toast-service";

// Mockujemy fetch globalnie
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Helper function to create initial props
const createInitialProps = (overrides = {}) => ({
  initialLists: [],
  initialPagination: null,
  fetchError: null,
  ...overrides,
});

// Mock initial data examples
const mockInitialLists: ShoppingListSummaryDTO[] = [
  {
    id: "list-1",
    title: "Groceries",
    itemCount: 3,
    createdAt: "2023-01-01T10:00:00Z",
    updatedAt: "2023-01-01T11:00:00Z",
  },
  {
    id: "list-2",
    title: "Hardware",
    itemCount: 5,
    createdAt: "2023-01-02T12:00:00Z",
    updatedAt: "2023-01-02T13:00:00Z",
  },
];
const mockInitialPagination: PaginationResponse = {
  currentPage: 1,
  pageSize: 20,
  totalItems: 2,
  totalPages: 1,
};

describe("useShoppingLists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-123", email: "test@test.com" },
      token: "mock-token",
    });
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    mockShowSuccessToast.mockClear();
    mockShowErrorToast.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with empty state when no initial props are provided", () => {
      const props = createInitialProps();
      const { result } = renderHook(() => useShoppingLists(props));

      expect(result.current.lists).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should initialize with initial lists and pagination from props", () => {
      const props = createInitialProps({
        initialLists: mockInitialLists,
        initialPagination: mockInitialPagination,
      });
      const { result } = renderHook(() => useShoppingLists(props));

      expect(result.current.lists).toHaveLength(2);
      expect(result.current.lists[0].id).toBe("list-1");
      expect(result.current.lists[0].isDeleting).toBe(false); // Check mapping
      expect(result.current.lists[1].id).toBe("list-2");
      expect(result.current.pagination).toEqual(mockInitialPagination);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should initialize with fetch error from props", () => {
      const errorMessage = "Failed to fetch initial data";
      const props = createInitialProps({ fetchError: errorMessage });
      const { result } = renderHook(() => useShoppingLists(props));

      expect(result.current.lists).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.pagination).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("refetch", () => {
    it("should fetch lists, update state, and pagination on success", async () => {
      const fetchedLists: ShoppingListSummaryDTO[] = [
        { id: "list-3", title: "Refetched 1", itemCount: 1, createdAt: "2023-02-01", updatedAt: "2023-02-01" },
      ];
      const fetchedPagination: PaginationResponse = {
        currentPage: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: fetchedLists, pagination: fetchedPagination }),
      });

      const props = createInitialProps();
      const { result } = renderHook(() => useShoppingLists(props));

      expect(result.current.isLoading).toBe(false);

      await act(async () => {
        await result.current.refetch(1, 10);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchUrl = mockFetch.mock.calls[0][0];
      const fetchOptions = mockFetch.mock.calls[0][1];
      expect(fetchUrl).toContain("/api/shopping-lists");
      expect(fetchUrl).toContain("page=1");
      expect(fetchUrl).toContain("pageSize=10");
      expect(fetchOptions.headers["Authorization"]).toBe("Bearer mock-token");

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lists).toHaveLength(1);
      expect(result.current.lists[0].id).toBe("list-3");
      expect(result.current.pagination).toEqual(fetchedPagination);
    });

    it("should set error state on fetch failure", async () => {
      const fetchErrorMsg = "Network Error";
      mockFetch.mockRejectedValueOnce(new Error(fetchErrorMsg));

      const props = createInitialProps();
      const { result } = renderHook(() => useShoppingLists(props));

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(fetchErrorMsg);
      expect(result.current.lists).toEqual([]);
      // Check the explicitly defined mock variable
      expect(mockShowErrorToast).toHaveBeenCalledWith(expect.stringContaining("Nie udało się odświeżyć"), {
        description: fetchErrorMsg,
      });
    });

    it("should set error state on non-ok response", async () => {
      const apiErrorMsg = "Invalid request";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ message: apiErrorMsg }),
      });

      const props = createInitialProps();
      const { result } = renderHook(() => useShoppingLists(props));

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toContain(`Błąd podczas pobierania list (400): ${apiErrorMsg}`);
      // Check the explicitly defined mock variable
      expect(mockShowErrorToast).toHaveBeenCalled();
    });

    it("should not fetch if user is not authenticated", async () => {
      mockUseAuth.mockReturnValueOnce({
        isAuthenticated: false,
        user: null,
        token: null,
      });

      const props = createInitialProps();
      const { result } = renderHook(() => useShoppingLists(props));

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("Użytkownik nie jest zalogowany");
    });
  });

  describe("createList", () => {
    it("should set isCreating, call fetch, call refetch and show success toast on successful creation", async () => {
      const newId = "new-list-id";
      const newTitle = "New List";
      const mockCreateResponse = { id: newId };
      const mockRefetchResponseLists: ShoppingListSummaryDTO[] = [
        ...mockInitialLists,
        { id: newId, title: newTitle, itemCount: 0, createdAt: "date", updatedAt: "date" },
      ];

      mockFetch
        .mockResolvedValueOnce({ ok: true, status: 201, json: async () => mockCreateResponse })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            data: mockRefetchResponseLists,
            pagination: { ...mockInitialPagination, totalItems: 3, totalPages: 1 },
          }),
        });

      const props = createInitialProps({ initialLists: mockInitialLists, initialPagination: mockInitialPagination });
      const { result } = renderHook(() => useShoppingLists(props));

      let returnedId: string | null = null;
      await act(async () => {
        returnedId = await result.current.createList(newTitle);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      const createFetchCall = mockFetch.mock.calls[0];
      expect(createFetchCall[0]).toBe("/api/client/shopping-lists");
      expect(createFetchCall[1].method).toBe("POST");
      expect(createFetchCall[1].body).toBe(JSON.stringify({ title: newTitle }));

      expect(result.current.isCreating).toBe(false);
      expect(result.current.lists).toHaveLength(3);
      expect(result.current.lists.find((l) => l.id === newId)).toBeDefined();
      expect(result.current.pagination?.totalItems).toBe(3);
      expect(returnedId).toBe(newId);
      // Check the explicitly defined mock variable
      expect(mockShowSuccessToast).toHaveBeenCalledWith(expect.stringContaining("Lista utworzona"), expect.any(Object));
    });

    it("should show error toast and reset isCreating on creation failure (fetch error)", async () => {
      const errorMsg = "Failed to create";
      const title = "Error List";
      mockFetch.mockRejectedValueOnce(new Error(errorMsg));

      const props = createInitialProps();
      const { result } = renderHook(() => useShoppingLists(props));

      await act(async () => {
        await result.current.createList(title);
      });

      expect(result.current.isCreating).toBe(false);
      expect(result.current.error).toBe(errorMsg);
      expect(result.current.lists).toEqual([]);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      // Check the explicitly defined mock variable
      expect(mockShowErrorToast).toHaveBeenCalledWith("Błąd tworzenia listy", {
        description: errorMsg,
      });
    });

    it("should show error toast and reset isCreating on creation failure (non-201 response)", async () => {
      const apiErrorMsg = "Validation failed";
      const title = "Invalid List";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ message: apiErrorMsg }),
      });

      const props = createInitialProps();
      const { result } = renderHook(() => useShoppingLists(props));

      await act(async () => {
        await result.current.createList(title);
      });

      expect(result.current.isCreating).toBe(false);
      expect(result.current.error).toBe(`Błąd API podczas tworzenia listy (400): ${apiErrorMsg}`);
      expect(result.current.lists).toEqual([]);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      // Check the explicitly defined mock variable
      expect(mockShowErrorToast).toHaveBeenCalledWith("Błąd tworzenia listy", {
        description: `Błąd API podczas tworzenia listy (400): ${apiErrorMsg}`,
      });
    });
  });

  describe("deleteList", () => {
    it("should set isDeleting, call fetch, refetch on success, and show success toast", async () => {
      const listIdToDelete = "list-1";
      const mockRefetchResponseLists = [mockInitialLists[1]]; // Only list-2 remains
      mockFetch
        .mockResolvedValueOnce({ ok: true, status: 204 }) // Mock for DELETE
        .mockResolvedValueOnce({
          // Mock for refetch
          ok: true,
          status: 200,
          json: async () => ({
            data: mockRefetchResponseLists,
            pagination: { ...mockInitialPagination, totalItems: 1 },
          }),
        });

      const props = createInitialProps({ initialLists: mockInitialLists, initialPagination: mockInitialPagination });
      const { result } = renderHook(() => useShoppingLists(props));

      expect(result.current.lists.find((l) => l.id === listIdToDelete)?.isDeleting).toBe(false);

      await act(async () => {
        await result.current.deleteList(listIdToDelete);
      });

      // Check state after deletion (optimistic + refetch)
      expect(result.current.lists.find((l) => l.id === listIdToDelete)).toBeUndefined();
      expect(result.current.lists).toHaveLength(1);
      expect(result.current.pagination?.totalItems).toBe(1);

      // Check fetch calls
      expect(mockFetch).toHaveBeenCalledTimes(2); // DELETE + GET refetch
      const deleteFetchCall = mockFetch.mock.calls[0];
      expect(deleteFetchCall[0]).toBe(`/api/client/shopping-lists/${listIdToDelete}`);
      expect(deleteFetchCall[1].method).toBe("DELETE");

      // Check the explicitly defined mock variable
      expect(mockShowSuccessToast).toHaveBeenCalledWith(expect.stringContaining("Lista usunięta"), expect.any(Object));
    });

    it("should reset isDeleting, show error toast, and not refetch on deletion failure (fetch error)", async () => {
      const listIdToDelete = "list-1";
      const errorMsg = "Delete failed";
      mockFetch.mockRejectedValueOnce(new Error(errorMsg)); // Mock for DELETE failure

      const props = createInitialProps({ initialLists: mockInitialLists });
      const { result } = renderHook(() => useShoppingLists(props));

      await act(async () => {
        await result.current.deleteList(listIdToDelete);
      });

      // Check state after failed deletion
      expect(result.current.lists.find((l) => l.id === listIdToDelete)?.isDeleting).toBe(false);
      expect(result.current.lists).toHaveLength(mockInitialLists.length);
      expect(result.current.error).toBe(errorMsg);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Check the explicitly defined mock variable
      expect(mockShowErrorToast).toHaveBeenCalledWith(expect.stringContaining("Błąd usuwania"), {
        description: errorMsg,
      });
    });

    it("should reset isDeleting, show error toast, and not refetch on deletion failure (non-204 response)", async () => {
      const listIdToDelete = "list-1";
      const apiErrorMsg = "List not found";
      mockFetch.mockResolvedValueOnce({
        // Mock for DELETE failure
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ message: apiErrorMsg }),
      });

      const props = createInitialProps({ initialLists: mockInitialLists });
      const { result } = renderHook(() => useShoppingLists(props));

      await act(async () => {
        await result.current.deleteList(listIdToDelete);
      });

      // Check state after failed deletion
      expect(result.current.lists.find((l) => l.id === listIdToDelete)?.isDeleting).toBe(false);
      expect(result.current.lists).toHaveLength(mockInitialLists.length);
      expect(result.current.error).toBe(`Błąd API podczas usuwania listy (404): ${apiErrorMsg}`);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Check the explicitly defined mock variable
      expect(mockShowErrorToast).toHaveBeenCalledWith(expect.stringContaining("Błąd usuwania"), {
        description: `Błąd API podczas usuwania listy (404): ${apiErrorMsg}`,
      });
    });
  });
});
