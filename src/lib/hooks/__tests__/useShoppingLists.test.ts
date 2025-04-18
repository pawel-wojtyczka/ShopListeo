import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "../../test-utils";
import { useShoppingLists } from "../useShoppingLists";
import { showSuccessToast, showErrorToast } from "../../services/toast-service";

// Mock dla modułu serwisu toastów
vi.mock("../../services/toast-service", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

// Mock dla globalnego fetch
global.fetch = vi.fn();

describe("useShoppingLists", () => {
  // Czyścimy mocki przed każdym testem
  beforeEach(() => {
    vi.clearAllMocks();

    // Resetujemy mock fetcha
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();

    // Mock dla fetch podczas pobierania list
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "1",
            title: "Lista zakupów 1",
            createdAt: "2023-01-01T12:00:00Z",
            updatedAt: "2023-01-01T12:00:00Z",
            itemCount: 3,
          },
          {
            id: "2",
            title: "Lista zakupów 2",
            createdAt: "2023-01-02T12:00:00Z",
            updatedAt: "2023-01-02T12:00:00Z",
            itemCount: 0,
          },
        ],
        pagination: {
          totalItems: 2,
          totalPages: 1,
          currentPage: 1,
          pageSize: 10,
        },
      }),
    });
  });

  it("powinien pobrać listy zakupów podczas inicjalizacji", async () => {
    // Renderujemy hook
    const { result, rerender } = renderHook(() => useShoppingLists());

    // Sprawdzamy, czy na początku isLoading jest true
    expect(result.current.isLoading).toBe(true);

    // Czekamy na zakończenie pobierania
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wymuszamy ponowne renderowanie, aby uzyskać zaktualizowany stan
    rerender();

    // Sprawdzamy, czy fetch został wywołany
    expect(global.fetch).toHaveBeenCalledWith("/api/shopping-lists");

    // Sprawdzamy, czy stan został zaktualizowany
    expect(result.current.isLoading).toBe(false);
    expect(result.current.lists.length).toBe(2);
    expect(result.current.lists[0].id).toBe("1");
    expect(result.current.lists[1].id).toBe("2");
    expect(result.current.error).toBeNull();
  });

  it("powinien obsłużyć błąd podczas pobierania list", async () => {
    // Resetujemy mock fetcha
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();

    // Mock dla fetch z błędem
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    // Renderujemy hook
    const { result, rerender } = renderHook(() => useShoppingLists());

    // Czekamy na zakończenie pobierania
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wymuszamy ponowne renderowanie, aby uzyskać zaktualizowany stan
    rerender();

    // Sprawdzamy, czy fetch został wywołany
    expect(global.fetch).toHaveBeenCalledWith("/api/shopping-lists");

    // Sprawdzamy, czy stan został zaktualizowany
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).not.toBeNull();

    // Sprawdzamy, czy toast o błędzie został wyświetlony
    expect(showErrorToast).toHaveBeenCalledWith(
      "Nie udało się pobrać list zakupów",
      expect.objectContaining({
        description: expect.any(String),
      })
    );
  });

  it("powinien utworzyć nową listę zakupów", async () => {
    // Resetujemy mock fetcha
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();

    // Mock dla fetch podczas pobierania list
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [],
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
        },
      }),
    });

    // Mock dla fetch podczas tworzenia listy
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: "3",
        title: "Lista zakupów 3",
        createdAt: "2023-01-03T12:00:00Z",
        updatedAt: "2023-01-03T12:00:00Z",
      }),
    });

    // Renderujemy hook
    const { result, rerender } = renderHook(() => useShoppingLists());

    // Czekamy na zakończenie pobierania
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wywołujemy funkcję createList
    let newListId: string | null = null;
    await act(async () => {
      newListId = await result.current.createList();
    });

    // Wymuszamy ponowne renderowanie, aby uzyskać zaktualizowany stan
    rerender();

    // Sprawdzamy, czy fetch został wywołany odpowiednio
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/shopping-lists",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: expect.any(String),
      })
    );

    // Sprawdzamy, czy ID nowej listy zostało zwrócone
    expect(newListId).toBe("3");

    // Sprawdzamy, czy toast o sukcesie został wyświetlony
    expect(showSuccessToast).toHaveBeenCalledWith(
      "Lista zakupów została utworzona",
      expect.objectContaining({
        description: expect.stringContaining("Lista"),
      })
    );
  });

  it("powinien usunąć listę zakupów", async () => {
    // Resetujemy mock fetcha
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();

    // Mock dla fetch podczas pobierania list
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "1",
            title: "Lista zakupów 1",
            createdAt: "2023-01-01T12:00:00Z",
            updatedAt: "2023-01-01T12:00:00Z",
            itemCount: 3,
          },
        ],
        pagination: {
          totalItems: 1,
          totalPages: 1,
          currentPage: 1,
          pageSize: 10,
        },
      }),
    });

    // Mock dla fetch podczas usuwania listy
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    // Renderujemy hook
    const { result, rerender } = renderHook(() => useShoppingLists());

    // Czekamy na zakończenie pobierania
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wymuszamy ponowne renderowanie, aby uzyskać zaktualizowany stan
    rerender();

    // Sprawdzamy, czy lista jest w stanie
    expect(result.current.lists.length).toBe(1);

    // Wywołujemy funkcję deleteList
    await act(async () => {
      await result.current.deleteList("1");
    });

    // Wymuszamy ponowne renderowanie, aby uzyskać zaktualizowany stan
    rerender();

    // Sprawdzamy, czy fetch został wywołany odpowiednio
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/shopping-lists/1",
      expect.objectContaining({
        method: "DELETE",
      })
    );

    // Sprawdzamy, czy lista została usunięta ze stanu
    expect(result.current.lists.length).toBe(0);

    // Sprawdzamy, czy toast o sukcesie został wyświetlony
    expect(showSuccessToast).toHaveBeenCalledWith(
      "Lista zakupów została usunięta",
      expect.objectContaining({
        description: expect.any(String),
      })
    );
  });

  it("powinien obsłużyć błąd podczas usuwania listy", async () => {
    // Resetujemy mock fetcha
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();

    // Mock dla fetch podczas pobierania list
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          {
            id: "1",
            title: "Lista zakupów 1",
            createdAt: "2023-01-01T12:00:00Z",
            updatedAt: "2023-01-01T12:00:00Z",
            itemCount: 3,
          },
        ],
        pagination: {
          totalItems: 1,
          totalPages: 1,
          currentPage: 1,
          pageSize: 10,
        },
      }),
    });

    // Mock dla fetch z błędem podczas usuwania listy
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    // Renderujemy hook
    const { result, rerender } = renderHook(() => useShoppingLists());

    // Czekamy na zakończenie pobierania
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Wymuszamy ponowne renderowanie, aby uzyskać zaktualizowany stan
    rerender();

    // Wywołujemy funkcję deleteList
    await act(async () => {
      await result.current.deleteList("1");
    });

    // Wymuszamy ponowne renderowanie, aby uzyskać zaktualizowany stan
    rerender();

    // Sprawdzamy, czy lista nadal jest w stanie (usunięcie powinno zostać cofnięte)
    expect(result.current.lists.length).toBe(1);
    expect(result.current.lists[0].isDeleting).toBe(false);

    // Sprawdzamy, czy toast o błędzie został wyświetlony
    expect(showErrorToast).toHaveBeenCalledWith(
      "Nie udało się usunąć listy zakupów",
      expect.objectContaining({
        description: expect.any(String),
      })
    );
  });
});
