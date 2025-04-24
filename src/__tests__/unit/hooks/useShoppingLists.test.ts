import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useShoppingLists } from "../../../lib/hooks/useShoppingLists";
import { showSuccessToast, showErrorToast } from "../../../lib/services/toast-service";
import type { ShoppingListSummaryDTO } from "../../../types";

// Mockowanie modułów
vi.mock("../../../lib/services/toast-service", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

vi.mock("../../../lib/auth/AuthContext", () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: "test-user-id" },
    token: "test-token",
  }),
}));

// Mockowanie @testing-library/react z zachowaniem oryginalnych funkcji
vi.mock("@testing-library/react", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    renderHook: actual.renderHook,
    act: actual.act,
  };
});

describe("useShoppingLists", () => {
  // Dane testowe
  const mockInitialLists: ShoppingListSummaryDTO[] = [
    {
      id: "1",
      title: "Test List 1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      itemCount: 0,
    },
  ];

  const mockPagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 1,
    pageSize: 20,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("powinien zainicjalizować się z dostarczonymi listami i paginacją", () => {
    const { result } = renderHook(() =>
      useShoppingLists({
        initialLists: mockInitialLists,
        initialPagination: mockPagination,
        fetchError: null,
      })
    );

    expect(result.current.lists).toHaveLength(1);
    expect(result.current.lists[0].id).toBe("1");
    expect(result.current.pagination).toEqual(mockPagination);
    expect(result.current.error).toBeNull();
  });

  it("powinien obsłużyć tworzenie nowej listy", async () => {
    // Mockowanie fetch dla createList
    global.fetch = vi.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: "new-list-id" }),
      } as Response)
    );

    const { result } = renderHook(() =>
      useShoppingLists({
        initialLists: mockInitialLists,
        initialPagination: mockPagination,
        fetchError: null,
      })
    );

    await act(async () => {
      const newListId = await result.current.createList();
      expect(newListId).toBe("new-list-id");
    });

    expect(showSuccessToast).toHaveBeenCalled();
  });

  it("powinien obsłużyć błąd podczas tworzenia listy", async () => {
    // Mockowanie fetch dla błędu
    global.fetch = vi.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.resolve({ message: "Server error" }),
      } as Response)
    );

    const { result } = renderHook(() =>
      useShoppingLists({
        initialLists: mockInitialLists,
        initialPagination: mockPagination,
        fetchError: null,
      })
    );

    await act(async () => {
      const newListId = await result.current.createList();
      expect(newListId).toBeNull();
    });

    expect(showErrorToast).toHaveBeenCalled();
  });

  it("should initialize with provided lists", () => {
    const mockLists: ShoppingListSummaryDTO[] = [
      {
        id: "1",
        title: "Test List 1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        itemCount: 0,
      },
      {
        id: "2",
        title: "Test List 2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        itemCount: 0,
      },
    ];

    const mockPagination = {
      currentPage: 1,
      totalPages: 1,
      totalItems: 2,
      pageSize: 10,
    };

    const { result } = renderHook(() =>
      useShoppingLists({
        initialLists: mockLists,
        initialPagination: mockPagination,
        fetchError: null,
      })
    );

    expect(result.current.lists).toHaveLength(2);
    expect(result.current.lists[0].title).toBe("Test List 1");
    expect(result.current.pagination).toEqual(mockPagination);
    expect(result.current.error).toBeNull();
  });
});
