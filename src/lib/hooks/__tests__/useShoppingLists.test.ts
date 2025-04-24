import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { renderHook, act, waitFor } from "../../test-utils";
import { useShoppingLists } from "../useShoppingLists";
import { showSuccessToast, showErrorToast } from "../../services/toast-service";
import { supabaseClient } from "../../../db/supabase.client"; // Import original

// Mock dla modułu serwisu toastów
vi.mock("../../services/toast-service", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

// Mock dla supabaseClient
vi.mock("../../../db/supabase.client", () => ({
  supabaseClient: {
    auth: {
      getSession: vi.fn(), // Mock getSession
    },
  },
}));

// Tworzenie mocka dla globalnego fetch przed mockowanie obiektu
const fetchMock = vi.fn();
// Mock dla globalnego fetch
global.fetch = fetchMock;

describe("useShoppingLists", () => {
  // Tworzymy sztuczny obiekt sesji do użycia w testach
  const mockSession = {
    access_token: "fake-access-token",
    refresh_token: "fake-refresh-token",
    user: { id: "fake-user-id" /* inne pola użytkownika */ },
    expires_at: Date.now() + 3600 * 1000, // Przykładowa data wygaśnięcia
  };

  // Zwiększamy domyślny timeout dla waitFor, na wszelki wypadek
  afterAll(() => {
    vi.setConfig({ testTimeout: 5000 }); // Reset do domyślnego po testach
  });

  beforeEach(() => {
    vi.setConfig({ testTimeout: 10000 }); // Ustawiamy timeout na 10s dla każdego testu
    vi.clearAllMocks();

    // Resetujemy mock fetcha
    fetchMock.mockReset();

    // Konfigurujemy mock getSession, aby zwracał naszą sztuczną sesję
    (supabaseClient.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    // Domyślny, bardziej elastyczny mock dla fetch
    fetchMock.mockImplementation(async (url, options) => {
      const urlString = url.toString();
      // Domyślna odpowiedź dla GET /api/shopping-lists
      if (urlString.includes("/api/shopping-lists") && options?.method !== "POST" && options?.method !== "DELETE") {
        console.log(`[Mock Fetch] GET ${urlString}`); // Log dla debugowania
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: "1",
                title: "Lista 1 (Mock)",
                createdAt: "2023-01-01T12:00:00Z",
                updatedAt: "2023-01-01T12:00:00Z",
                itemCount: 3,
              },
              {
                id: "2",
                title: "Lista 2 (Mock)",
                createdAt: "2023-01-02T12:00:00Z",
                updatedAt: "2023-01-02T12:00:00Z",
                itemCount: 0,
              },
            ],
            pagination: { totalItems: 2, totalPages: 1, currentPage: 1, pageSize: 10 },
          }),
        };
      }
      // Domyślna odpowiedź dla innych zapytań - powinna być nadpisana w testach
      console.log(`[Mock Fetch] Unhandled: ${options?.method || "GET"} ${urlString}`); // Log dla debugowania
      return { ok: false, status: 501, json: async () => ({ error: "Mock not implemented for this request" }) };
    });
  });

  it("powinien pobrać listy zakupów podczas inicjalizacji", async () => {
    const { result } = renderHook(() => useShoppingLists());
    expect(result.current.isLoading).toBe(true);

    // Czekamy na stabilny stan końcowy (załadowane i bez błędu)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/shopping-lists?page=1&pageSize=20"),
      expect.objectContaining({ headers: { Authorization: `Bearer ${mockSession.access_token}` } })
    );
    expect(result.current.lists.length).toBe(2);
    expect(result.current.lists[0].title).toBe("Lista 1 (Mock)"); // Sprawdzamy tytuł z mocka
  });

  it("powinien obsłużyć błąd podczas pobierania list", async () => {
    // Nadpisujemy implementację fetch dla tego testu
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(async (url) => {
      console.log(`[Mock Fetch - Error Case] GET ${url}`);
      return {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({ error: "Database connection failed" }),
      };
    });

    const { result } = renderHook(() => useShoppingLists());
    expect(result.current.isLoading).toBe(true);

    // Czekamy na stabilny stan końcowy (nie ładuje i jest błąd)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).not.toBeNull();
    });

    expect(result.current.error).toContain("Database connection failed");
    expect(showErrorToast).toHaveBeenCalledWith(
      "Nie udało się pobrać list zakupów",
      expect.objectContaining({ description: expect.stringContaining("Database connection failed") })
    );
  });

  it("powinien utworzyć nową listę zakupów", async () => {
    // Mock fetch dla POST i GET (po utworzeniu)
    const newListItem = {
      id: "3",
      title: `Lista zakupów ${new Date().toLocaleDateString("pl-PL")}`,
      createdAt: "2023-01-03T12:00:00Z",
      updatedAt: "2023-01-03T12:00:00Z",
    };
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url, options) => {
      const urlString = url.toString();
      if (urlString === "/api/shopping-lists" && options?.method === "POST") {
        console.log(`[Mock Fetch] POST ${urlString}`);
        return { ok: true, json: async () => newListItem };
      }
      // Domyślna odpowiedź dla GET (pusta lista dla tego testu)
      if (urlString.includes("/api/shopping-lists")) {
        console.log(`[Mock Fetch] GET (create test) ${urlString}`);
        return {
          ok: true,
          json: async () => ({ data: [], pagination: { totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 } }),
        };
      }
      console.log(`[Mock Fetch] Unhandled (create test): ${options?.method || "GET"} ${urlString}`);
      return { ok: false, status: 501, json: async () => ({ error: "Mock not implemented" }) };
    });

    const { result } = renderHook(() => useShoppingLists());

    // Czekamy na zakończenie inicjalnego pobierania (pustej listy)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.lists.length).toBe(0); // Powinna być pusta na początku
    });

    let newListId: string | null = null;
    // Wywołujemy i czekamy na zakończenie createList
    await act(async () => {
      newListId = await result.current.createList();
    });

    expect(newListId).toBe("3");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/shopping-lists",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ title: newListItem.title }) })
    );
    expect(showSuccessToast).toHaveBeenCalledWith(
      "Lista zakupów została utworzona",
      expect.objectContaining({ description: expect.stringContaining(newListItem.title) })
    );
    // Nie sprawdzamy stanu listy po utworzeniu, bo hook nie odświeża automatycznie
  });

  it("powinien usunąć listę zakupów", async () => {
    // Mock fetch dla GET (zwraca 1 listę) i DELETE
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url, options) => {
      const urlString = url.toString();
      if (urlString === "/api/shopping-lists/1" && options?.method === "DELETE") {
        console.log(`[Mock Fetch] DELETE ${urlString}`);
        return { ok: true, status: 204 };
      }
      // GET - zwraca jedną listę
      if (urlString.includes("/api/shopping-lists")) {
        console.log(`[Mock Fetch] GET (delete test) ${urlString}`);
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: "1",
                title: "Lista do usunięcia",
                createdAt: "2023-01-01T12:00:00Z",
                updatedAt: "2023-01-01T12:00:00Z",
                itemCount: 3,
              },
            ],
            pagination: { totalItems: 1, totalPages: 1, currentPage: 1, pageSize: 10 },
          }),
        };
      }
      console.log(`[Mock Fetch] Unhandled (delete test): ${options?.method || "GET"} ${urlString}`);
      return { ok: false, status: 501, json: async () => ({ error: "Mock not implemented" }) };
    });

    const { result } = renderHook(() => useShoppingLists());

    // Czekamy na załadowanie początkowej listy
    await waitFor(() => {
      expect(result.current.lists.length).toBe(1);
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.lists[0].id).toBe("1");

    // Wywołujemy i czekamy na zakończenie deleteList
    await act(async () => {
      await result.current.deleteList("1");
    });

    // Sprawdzamy stan *po* zakończeniu deleteList
    expect(result.current.lists.length).toBe(0); // Lista powinna być pusta
    expect(global.fetch).toHaveBeenCalledWith("/api/shopping-lists/1", expect.objectContaining({ method: "DELETE" }));
    expect(showSuccessToast).toHaveBeenCalledWith(
      "Lista zakupów została usunięta",
      expect.objectContaining({ description: expect.stringContaining("Lista do usunięcia") })
    );
  });

  it("powinien obsłużyć błąd podczas usuwania listy", async () => {
    // Mock fetch dla GET (zwraca 1 listę) i DELETE (zwraca błąd)
    (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url, options) => {
      const urlString = url.toString();
      if (urlString === "/api/shopping-lists/1" && options?.method === "DELETE") {
        console.log(`[Mock Fetch - Error Case] DELETE ${urlString}`);
        return { ok: false, status: 404, statusText: "Not Found", json: async () => ({ error: "List not found" }) };
      }
      // GET - zwraca jedną listę
      if (urlString.includes("/api/shopping-lists")) {
        console.log(`[Mock Fetch] GET (delete error test) ${urlString}`);
        return {
          ok: true,
          json: async () => ({
            data: [
              {
                id: "1",
                title: "Lista (błąd)",
                createdAt: "2023-01-01T12:00:00Z",
                updatedAt: "2023-01-01T12:00:00Z",
                itemCount: 3,
              },
            ],
            pagination: { totalItems: 1, totalPages: 1, currentPage: 1, pageSize: 10 },
          }),
        };
      }
      console.log(`[Mock Fetch] Unhandled (delete error test): ${options?.method || "GET"} ${urlString}`);
      return { ok: false, status: 501, json: async () => ({ error: "Mock not implemented" }) };
    });

    const { result } = renderHook(() => useShoppingLists());

    // Czekamy na załadowanie początkowej listy
    await waitFor(() => {
      expect(result.current.lists.length).toBe(1);
      expect(result.current.isLoading).toBe(false);
    });

    // Wywołujemy i czekamy na zakończenie deleteList (które rzuci błąd wewnątrz hooka)
    await act(async () => {
      await result.current.deleteList("1");
    });

    // Sprawdzamy stan *po* zakończeniu deleteList
    expect(result.current.error).toContain("List not found");
    expect(result.current.lists.length).toBe(1); // Lista nie powinna być usunięta
    expect(result.current.lists[0].isDeleting).toBe(false); // Flaga isDeleting powinna zostać zresetowana
    expect(showErrorToast).toHaveBeenCalledWith(
      "Nie udało się usunąć listy zakupów",
      expect.objectContaining({ description: expect.stringContaining("List not found") })
    );
  });

  it("powinien obsłużyć brak sesji podczas inicjalizacji", async () => {
    // Nadpisujemy mock getSession
    (supabaseClient.auth.getSession as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    // Resetujemy fetch mock, żeby upewnić się, że nie będzie wołany
    (global.fetch as ReturnType<typeof vi.fn>).mockReset();

    const { result } = renderHook(() => useShoppingLists());

    // Czekamy na stan końcowy (nie ładuje, jest błąd)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).not.toBeNull();
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.error).toBe("Użytkownik nie jest zalogowany");
    expect(showErrorToast).toHaveBeenCalledWith(
      "Nie udało się pobrać list zakupów",
      expect.objectContaining({ description: "Użytkownik nie jest zalogowany" })
    );
  });
});
