import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import type { ShoppingListDetailResponse } from "../../../types";

// Definicje funkcji mockujących
const mockShowSuccessToast = vi.fn();
const mockShowErrorToast = vi.fn();
const mockUseAuth = vi.fn();

// Wracamy do vi.mock (jest hoistowane)
vi.mock("../services/toast-service", () => ({
  showSuccessToast: mockShowSuccessToast,
  showErrorToast: mockShowErrorToast,
}));

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Importujemy hooka PO mockowaniu
import { useShoppingListDetail } from "../useShoppingListDetail";
// Nie potrzebujemy importować zamockowanych funkcji
// import { showSuccessToast, showErrorToast } from "../services/toast-service";

// Mockujemy fetch globalnie
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock data
const listId = "list-abc-123";
const mockApiResponse: ShoppingListDetailResponse = {
  id: listId,
  title: "Initial List Title",
  createdAt: "2023-01-01T10:00:00Z",
  updatedAt: "2023-01-01T11:00:00Z",
  items: [
    {
      id: "item-1",
      itemName: "Milk",
      purchased: false,
      createdAt: "2023-01-01T10:05:00Z",
      updatedAt: "2023-01-01T10:05:00Z",
    },
    {
      id: "item-2",
      itemName: "Bread",
      purchased: true,
      createdAt: "2023-01-01T10:06:00Z",
      updatedAt: "2023-01-01T10:06:00Z",
    },
  ],
};

describe("useShoppingListDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: "user-123", email: "test@test.com" },
      token: "mock-token",
    });
    mockFetch.mockResolvedValue({ ok: true, status: 200, json: async () => mockApiResponse });
    mockShowSuccessToast.mockClear();
    mockShowErrorToast.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization and Initial Fetch", () => {
    it("should be in loading state initially and return null/empty values", async () => {
      const { result } = renderHook(() => useShoppingListDetail(listId));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.id).toBe(listId);
      expect(result.current.title).toBe("");
      expect(result.current.items).toEqual([]);
      expect(result.current.error).toBeNull();

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should populate destructured state with fetched data on successful fetch", async () => {
      const { result } = renderHook(() => useShoppingListDetail(listId));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.id).toBe(listId);
      expect(result.current.title).toBe(mockApiResponse.title);
      expect(result.current.items).toHaveLength(mockApiResponse.items.length);
      expect(result.current.items[0].itemName).toBe("Milk");
      expect(result.current.items[0].isEditingName).toBe(false);
      expect(result.current.items[0].isUpdating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should set error state and return initial values if fetch fails (non-auth error)", async () => {
      const errorMsg = "Internal Server Error";
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Server Error",
        json: async () => ({ error: errorMsg }),
      });

      const { result } = renderHook(() => useShoppingListDetail(listId));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.id).toBe(listId);
      expect(result.current.title).toBe("");
      expect(result.current.items).toEqual([]);
      expect(result.current.error).toBe(`Błąd API (500): ${errorMsg}`);
      expect(mockShowErrorToast).toHaveBeenCalledWith("Błąd pobierania listy", {
        description: `Błąd API (500): ${errorMsg}`,
      });
    });

    it("should retry fetch on auth-related errors (401) and succeed on retry", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
          json: async () => ({ error: "Invalid session" }),
        })
        .mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockApiResponse });

      const { result } = renderHook(() => useShoppingListDetail(listId));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.current.error).toBeNull();
      expect(result.current.title).toBe(mockApiResponse.title);
      expect(result.current.items).toHaveLength(mockApiResponse.items.length);
      expect(mockShowErrorToast).not.toHaveBeenCalled();
    });

    it("should set error state after exceeding max retries for auth errors", async () => {
      const errorMsg = "Invalid session";
      mockFetch.mockReset();
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({ error: errorMsg }),
      });

      const { result } = renderHook(() => useShoppingListDetail(listId));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(500);
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockFetch).toHaveBeenCalledTimes(4);
      expect(result.current.title).toBe("");
      expect(result.current.items).toEqual([]);
      expect(result.current.error).toBe(`Błąd API (401): ${errorMsg}`);
      expect(mockShowErrorToast).toHaveBeenCalledTimes(1);
      expect(mockShowErrorToast).toHaveBeenCalledWith("Błąd pobierania listy", {
        description: `Błąd API (401): ${errorMsg}`,
      });
    });

    it("should handle invalid listId gracefully", () => {
      const { result } = renderHook(() => useShoppingListDetail(""));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.title).toBe("");
      expect(result.current.items).toEqual([]);
      expect(result.current.id).toBe("");
      expect(result.current.error).toBe("Invalid List ID");
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("updateTitle", () => {
    const newTitle = "Updated List Title";
    const mockUpdateResponse = { ...mockApiResponse, title: newTitle, updatedAt: new Date().toISOString() };

    beforeEach(async () => {
      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it("should call fetch with PUT request, update title, updatedAt and show success toast", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockUpdateResponse,
      });

      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.updateTitle(newTitle);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      const updateFetchCall = mockFetch.mock.calls[1];
      expect(updateFetchCall[0]).toBe(`/api/client/shopping-lists/${listId}`);
      expect(updateFetchCall[1].method).toBe("PUT");
      expect(updateFetchCall[1].credentials).toBe("include");
      expect(updateFetchCall[1].body).toBe(JSON.stringify({ title: newTitle }));

      expect(result.current.title).toBe(newTitle);
      expect(result.current.updatedAt).toBe(mockUpdateResponse.updatedAt);
      expect(result.current.error).toBeNull();
      expect(result.current.isUpdating).toBe(false);

      expect(mockShowSuccessToast).toHaveBeenCalledWith(
        "Tytuł zaktualizowany",
        expect.objectContaining({ description: expect.stringContaining(newTitle) })
      );
    });

    it("should show error toast and not call fetch for empty title", async () => {
      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.updateTitle("  ");
        })
      ).rejects.toThrow("Invalid title length");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockShowErrorToast).toHaveBeenCalledWith("Nieprawidłowy tytuł", expect.any(Object));
      expect(result.current.title).toBe(mockApiResponse.title);
    });

    it("should show error toast and not call fetch for title exceeding max length", async () => {
      const longTitle = "a".repeat(256);
      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.updateTitle(longTitle);
        })
      ).rejects.toThrow("Invalid title length");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockShowErrorToast).toHaveBeenCalledWith("Nieprawidłowy tytuł", expect.any(Object));
      expect(result.current.title).toBe(mockApiResponse.title);
    });

    it("should set error state and show error toast on update failure (API error)", async () => {
      const errorMsg = "Failed to update";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: errorMsg }),
      });

      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.updateTitle(newTitle);
        })
      ).rejects.toThrow(`Błąd API (500): ${errorMsg}`);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.current.title).toBe(mockApiResponse.title);
      expect(result.current.error).toBe(`Błąd API (500): ${errorMsg}`);
      expect(result.current.isUpdating).toBe(false);
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        "Błąd aktualizacji tytułu",
        expect.objectContaining({ description: `Błąd API (500): ${errorMsg}` })
      );
    });
  });

  describe("toggleItemPurchased", () => {
    const itemIdToToggle = "item-1";
    const mockItemUpdateResponse = {
      ...mockApiResponse.items.find((i) => i.id === itemIdToToggle),
      purchased: true,
      updatedAt: new Date().toISOString(),
    };

    beforeEach(async () => {
      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));
    });

    it("should optimistically update item, call fetch, confirm update", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockItemUpdateResponse,
      });

      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const initialItem = result.current.items.find((i) => i.id === itemIdToToggle);
      expect(initialItem?.purchased).toBe(false);

      await act(async () => {
        await result.current.toggleItemPurchased(itemIdToToggle);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      const updateFetchCall = mockFetch.mock.calls[1];
      expect(updateFetchCall[0]).toBe(`/api/client/shopping-lists/${listId}/items/${itemIdToToggle}`);
      expect(updateFetchCall[1].method).toBe("PUT");
      expect(updateFetchCall[1].credentials).toBe("include");
      expect(updateFetchCall[1].body).toBe(JSON.stringify({ purchased: true }));

      await waitFor(() => {
        const finalItem = result.current.items.find((i) => i.id === itemIdToToggle);
        expect(finalItem?.purchased).toBe(true);
        expect(finalItem?.isUpdating).toBe(false);
        if (mockItemUpdateResponse.updatedAt) {
          expect(finalItem?.updatedAt).toBe(mockItemUpdateResponse.updatedAt);
        }
      });
      expect(result.current.error).toBeNull();
      expect(mockShowSuccessToast).not.toHaveBeenCalled();
    });

    it("should show error toast and not call fetch if item ID is not found", async () => {
      const nonExistentItemId = "item-999";
      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.toggleItemPurchased(nonExistentItemId);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        "Błąd",
        expect.objectContaining({ description: "Nie znaleziono produktu do zaktualizowania." })
      );
      expect(result.current.items[0].purchased).toBe(false);
      expect(result.current.items[1].purchased).toBe(true);
    });

    it("should revert optimistic update, set error, and show toast on toggle failure", async () => {
      const errorMsg = "Failed to update item";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: errorMsg }),
      });

      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const initialItemState = result.current.items.find((i) => i.id === itemIdToToggle)?.purchased;
      expect(initialItemState).toBe(false);

      await act(async () => {
        await result.current.toggleItemPurchased(itemIdToToggle);
      });

      await waitFor(() => {
        expect(result.current.error).toBe(`Błąd API (500): ${errorMsg}`);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);

      expect(result.current.items.find((i) => i.id === itemIdToToggle)?.purchased).toBe(initialItemState);
      expect(result.current.items.find((i) => i.id === itemIdToToggle)?.isUpdating).toBe(false);
      expect(mockShowErrorToast).toHaveBeenCalledWith("Błąd aktualizacji produktu", {
        description: `Błąd API (500): ${errorMsg}`,
      });
    });
  });

  describe("deleteItem", () => {
    const itemIdToDelete = "item-1";

    it("should optimistically remove item, call fetch, and confirm removal", async () => {
      mockFetch
        .mockReset()
        .mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockApiResponse })
        .mockResolvedValueOnce({ ok: true, status: 204 });

      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const initialItemCount = result.current.items.length;
      expect(result.current.items.some((i) => i.id === itemIdToDelete)).toBe(true);

      await act(async () => {
        await result.current.deleteItem(itemIdToDelete);
      });

      expect(result.current.items.some((i) => i.id === itemIdToDelete)).toBe(false);
      expect(result.current.items).toHaveLength(initialItemCount - 1);
      expect(result.current.error).toBeNull();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      const deleteFetchCall = mockFetch.mock.calls[1];
      expect(deleteFetchCall[0]).toBe(`/api/client/shopping-lists/${listId}/items/${itemIdToDelete}`);
      expect(deleteFetchCall[1].method).toBe("DELETE");
      expect(deleteFetchCall[1].credentials).toBe("include");

      expect(mockShowSuccessToast).not.toHaveBeenCalled();
    });

    it("should show error toast and not call fetch if item ID is not found", async () => {
      const nonExistentItemId = "item-999";
      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const initialItemCount = result.current.items.length;

      await act(async () => {
        await result.current.deleteItem(nonExistentItemId);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockShowErrorToast).toHaveBeenCalledWith(
        "Błąd",
        expect.objectContaining({ description: "Nie znaleziono produktu do usunięcia." })
      );
      expect(result.current.items).toHaveLength(initialItemCount);
    });

    it("should revert optimistic removal, set error, and show toast on delete failure", async () => {
      const errorMsg = "Deletion Forbidden";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: errorMsg }),
      });

      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const initialItems = [...result.current.items];
      const initialItemCount = initialItems.length;

      await act(async () => {
        await result.current.deleteItem(itemIdToDelete);
      });

      expect(result.current.error).toBe(`Błąd API (403): ${errorMsg}`);
      expect(result.current.items).toEqual(initialItems);
      expect(result.current.items).toHaveLength(initialItemCount);

      expect(mockFetch).toHaveBeenCalledTimes(2);

      expect(mockShowErrorToast).toHaveBeenCalledWith("Błąd usuwania produktu", {
        description: `Błąd API (403): ${errorMsg}`,
      });
    });
  });

  describe("updateItemName", () => {
    const itemIdToUpdate = "item-1";
    const originalName = "Milk";
    const newName = "Almond Milk";
    const mockItemUpdateResponse = {
      id: itemIdToUpdate,
      itemName: newName,
      purchased: false,
      createdAt: "date",
      updatedAt: new Date().toISOString(),
    };

    beforeEach(async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockApiResponse });
    });

    it("should optimistically update name, call fetch, confirm update", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockItemUpdateResponse,
      });

      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.items.find((i) => i.id === itemIdToUpdate)?.itemName).toBe(originalName);

      await act(async () => {
        await result.current.updateItemName(itemIdToUpdate, newName);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      const updateCall = mockFetch.mock.calls[1];
      expect(updateCall[0]).toBe(`/api/client/shopping-lists/${listId}/items/${itemIdToUpdate}`);
      expect(updateCall[1].method).toBe("PUT");
      expect(updateCall[1].body).toBe(JSON.stringify({ itemName: newName }));

      await waitFor(() => {
        const finalItem = result.current.items.find((i) => i.id === itemIdToUpdate);
        expect(finalItem?.itemName).toBe(newName);
        expect(finalItem?.isUpdating).toBe(false);
        expect(finalItem?.updatedAt).toBe(mockItemUpdateResponse.updatedAt);
      });
      expect(result.current.error).toBeNull();
      expect(mockShowSuccessToast).not.toHaveBeenCalled();
    });

    it("should show error toast and not call fetch for empty name", async () => {
      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.updateItemName(itemIdToUpdate, "  ");
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockShowErrorToast).toHaveBeenCalledWith("Nieprawidłowa nazwa", expect.any(Object));
      expect(result.current.items.find((i) => i.id === itemIdToUpdate)?.itemName).toBe(originalName);
    });

    it("should not call fetch if name has not changed", async () => {
      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.updateItemName(itemIdToUpdate, originalName);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockShowErrorToast).not.toHaveBeenCalled();
      expect(mockShowSuccessToast).not.toHaveBeenCalled();
    });

    it("should revert optimistic update, set error, and show toast on update failure", async () => {
      const errorMsg = "Update Forbidden";
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: errorMsg }),
      });

      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.updateItemName(itemIdToUpdate, newName);
      });

      await waitFor(() => {
        expect(result.current.error).toBe(`Błąd API (403): ${errorMsg}`);
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      const revertedItem = result.current.items.find((i) => i.id === itemIdToUpdate);
      expect(revertedItem?.itemName).toBe(originalName);
      expect(revertedItem?.isUpdating).toBe(false);
      expect(mockShowErrorToast).toHaveBeenCalledWith("Błąd aktualizacji nazwy", expect.any(Object));
    });
  });

  describe("addItems", () => {
    const itemsToAdd = [
      { name: " Apples ", purchased: false },
      { name: "", purchased: false },
      { name: "Bananas", purchased: true },
    ];
    const validItemsToAdd = [
      { name: "Apples", purchased: false },
      { name: "Bananas", purchased: true },
    ];
    const mockAddedItem1 = {
      id: "new-item-1",
      itemName: "Apples",
      purchased: false,
      createdAt: "date1",
      updatedAt: "date1",
    };
    const mockAddedItem2 = {
      id: "new-item-2",
      itemName: "Bananas",
      purchased: true,
      createdAt: "date2",
      updatedAt: "date2",
    };

    beforeEach(async () => {
      mockFetch.mockReset();
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => mockApiResponse });
    });

    it("should optimistically add items, call fetch for each valid item, update state, show success toast", async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, status: 201, json: async () => mockAddedItem1 })
        .mockResolvedValueOnce({ ok: true, status: 201, json: async () => mockAddedItem2 });

      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const initialItemCount = result.current.items.length;

      await act(async () => {
        await result.current.addItems(itemsToAdd);
      });

      expect(result.current.items.length).toBe(initialItemCount + validItemsToAdd.length);
      expect(result.current.items.some((i) => i.itemName === "Apples" && i.id.startsWith("temp-"))).toBe(true);
      expect(result.current.items.some((i) => i.itemName === "Bananas" && i.id.startsWith("temp-"))).toBe(true);
      expect(result.current.isUpdating).toBe(false);

      expect(mockFetch).toHaveBeenCalledTimes(1 + validItemsToAdd.length);
      const postCall1 = mockFetch.mock.calls[1];
      const postCall2 = mockFetch.mock.calls[2];
      expect(postCall1[0]).toBe(`/api/client/shopping-lists/${listId}/items`);
      expect(postCall1[1].method).toBe("POST");
      expect(JSON.parse(postCall1[1].body)).toEqual({ itemName: "Apples", purchased: false });
      expect(postCall2[0]).toBe(`/api/client/shopping-lists/${listId}/items`);
      expect(postCall2[1].method).toBe("POST");
      expect(JSON.parse(postCall2[1].body)).toEqual({ itemName: "Bananas", purchased: true });

      await waitFor(() => {
        expect(result.current.items.length).toBe(initialItemCount + validItemsToAdd.length);
        expect(result.current.items.some((i) => i.id === "new-item-1")).toBe(true);
        expect(result.current.items.some((i) => i.id === "new-item-2")).toBe(true);
        expect(result.current.items.every((i) => !i.id.startsWith("temp-"))).toBe(true);
      });

      expect(mockShowSuccessToast).toHaveBeenCalledWith("Dodano produkty", expect.any(Object));
      expect(mockShowErrorToast).not.toHaveBeenCalled();
    });

    it("should handle partial success and show both success and error toasts", async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, status: 201, json: async () => mockAddedItem1 })
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: "Failed Banana" }) });

      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const initialItemCount = result.current.items.length;

      await act(async () => {
        await result.current.addItems(itemsToAdd);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1 + validItemsToAdd.length);

      await waitFor(() => {
        expect(result.current.items.length).toBe(initialItemCount + 1);
        expect(result.current.items.some((i) => i.id === "new-item-1")).toBe(true);
        expect(result.current.items.every((i) => !i.id.startsWith("temp-"))).toBe(true);
      });

      expect(mockShowSuccessToast).toHaveBeenCalledWith("Dodano produkty", expect.any(Object));
      expect(mockShowErrorToast).toHaveBeenCalledWith("Nie udało się dodać wszystkich produktów", expect.any(Object));
    });

    it("should handle complete failure and show error toast", async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: "Failed Apple" }) })
        .mockResolvedValueOnce({ ok: false, status: 400, json: async () => ({ error: "Failed Banana" }) });

      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const initialItemCount = result.current.items.length;

      await act(async () => {
        await result.current.addItems(itemsToAdd);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1 + validItemsToAdd.length);

      await waitFor(() => {
        expect(result.current.items.length).toBe(initialItemCount);
        expect(result.current.items.every((i) => !i.id.startsWith("temp-"))).toBe(true);
      });

      expect(mockShowSuccessToast).not.toHaveBeenCalled();
      expect(mockShowErrorToast).toHaveBeenCalledWith("Nie udało się dodać wszystkich produktów", expect.any(Object));
    });

    it("should not call fetch if no valid items are provided", async () => {
      const onlyEmptyItems = [
        { name: " ", purchased: false },
        { name: "", purchased: true },
      ];
      const { result } = renderHook(() => useShoppingListDetail(listId));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.addItems(onlyEmptyItems);
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.current.items).toHaveLength(mockApiResponse.items.length);
      expect(mockShowSuccessToast).not.toHaveBeenCalled();
      expect(mockShowErrorToast).not.toHaveBeenCalled();
    });
  });
});
