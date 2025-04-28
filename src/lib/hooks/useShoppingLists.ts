import { useState, useCallback } from "react";
import type {
  ShoppingListSummaryDTO,
  CreateShoppingListRequest,
  CreateShoppingListResponse,
  PaginationResponse,
} from "../../types";
import { showSuccessToast, showErrorToast } from "../services/toast-service";
import { useAuth } from "../auth/AuthContext";

// Define the shape of the props expected by the hook
interface UseShoppingListsProps {
  initialLists: ShoppingListSummaryDTO[];
  initialPagination: PaginationResponse | null;
  fetchError: string | null;
}

// Typ dla modelu widoku pojedynczego elementu list zakupów
interface ShoppingListItemViewModel extends ShoppingListSummaryDTO {
  isDeleting: boolean;
}

// Typ dla całego modelu widoku list zakupów
interface ShoppingListsViewModel {
  lists: ShoppingListItemViewModel[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  pagination: PaginationResponse | null;
}

// Hook now accepts initial props
export function useShoppingLists({
  initialLists = [],
  initialPagination = null,
  fetchError = null,
}: UseShoppingListsProps) {
  // Initialize state using the props passed from the server-side fetch
  const [viewModel, setViewModel] = useState<ShoppingListsViewModel>(() => {
    // Map initialLists to add isDeleting flag
    const mappedInitialLists = initialLists.map((list) => ({ ...list, isDeleting: false }));
    return {
      lists: mappedInitialLists,
      isLoading: false, // Initial load happened on server
      isCreating: false,
      error: fetchError, // Use error from server fetch
      pagination: initialPagination, // Use pagination from server fetch
    };
  });

  // We still need auth context for user ID in create/delete actions
  const { isAuthenticated, user } = useAuth();

  // REMOVED the useEffect that was responsible for the initial client-side fetch
  // The initial data is now provided via props.

  // Define fetchShoppingLists for potential future use (e.g., manual refresh)
  // but it's not called automatically on load anymore.
  const fetchShoppingLists = useCallback(
    async (page = 1, pageSize = 20) => {
      if (!isAuthenticated || !user) {
        console.warn("[useShoppingLists] fetchShoppingLists called but user not authenticated.");
        setViewModel((prev) => ({ ...prev, isLoading: false, error: "Użytkownik nie jest zalogowany" }));
        return;
      }

      setViewModel((prev) => ({ ...prev, isLoading: true, error: null }));
      console.log(`[useShoppingLists] Refetching shopping lists (Page: ${page})...`);

      try {
        // Zmieniamy URL na endpoint klienta - Updated to new path
        const apiUrl = new URL("/api/shopping-lists", window.location.origin);
        apiUrl.searchParams.set("page", page.toString());
        apiUrl.searchParams.set("pageSize", pageSize.toString());

        // Usuwamy logikę dodawania nagłówka Authorization Bearer
        // const headers: Record<string, string> = { "Content-Type": "application/json" };
        // if (token) {
        //   headers["Authorization"] = `Bearer ${token}`;
        // }

        // Wywołujemy fetch bez nagłówka Authorization, ale z credentials: "include"
        const response = await fetch(apiUrl.toString(), {
          headers: { "Content-Type": "application/json" }, // Content-Type jest nadal potrzebny
          credentials: "include", // Kluczowe dla używania sesji/ciasteczek
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
          // Dodajemy obsługę statusu 401 (Unauthorized)
          if (response.status === 401) {
            throw new Error("Sesja wygasła lub użytkownik nie jest zalogowany.");
          }
          throw new Error(
            `Błąd podczas pobierania list (${response.status}): ${errorData.message || errorData.error || response.statusText}`
          );
        }

        const data: { data: ShoppingListSummaryDTO[]; pagination: PaginationResponse } = await response.json();
        const mappedLists: ShoppingListItemViewModel[] = data.data.map((list) => ({ ...list, isDeleting: false }));

        setViewModel((prev) => ({
          ...prev,
          lists: mappedLists,
          isLoading: false,
          pagination: data.pagination,
        }));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas pobierania list zakupów";
        setViewModel((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        showErrorToast("Nie udało się odświeżyć list zakupów", { description: errorMessage });
      }
    },
    // Usuwamy token z zależności, bo już go nie używamy
    [isAuthenticated, user] // Only need isAuthenticated and user now
  ); // Dependencies for the refetch function

  // Create and Delete functions remain largely the same,
  // they rely on cookies (via fetch) or token from context for auth,
  // and useAuth() provides the necessary user.id.

  const createList = async (): Promise<string | null> => {
    // Auth check removed
    setViewModel((prev) => ({ ...prev, isCreating: true, error: null }));
    console.log("[useShoppingLists] Creating new list via client endpoint...");

    try {
      const defaultTitle = `Lista zakupów ${new Date().toLocaleDateString("pl-PL")}`;
      const requestData: CreateShoppingListRequest = { title: defaultTitle };
      // Headers: Remove Authorization header logic
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      /* 
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      */

      // Use the NEW client-specific endpoint - Corrected path to match backend
      const response = await fetch("/api/shopping-lists/", {
        // Remove /create
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestData),
        credentials: "include", // Keep this
      });

      console.log(`[useShoppingLists] Create list (client endpoint) response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error(`[useShoppingLists] Error creating list (${response.status}):`, errorData);
        if (response.status === 401) {
          throw new Error("Sesja wygasła lub użytkownik nie jest zalogowany.");
        }
        throw new Error(
          `Błąd podczas tworzenia listy (${response.status}): ${errorData.message || errorData.error || "Nieznany błąd API"}`
        );
      }

      // Assuming the new endpoint returns the same CreateShoppingListResponse shape
      const data: CreateShoppingListResponse = await response.json();
      console.log("[useShoppingLists] List created successfully:", data);

      // Przygotuj nowy element listy w formacie ViewModel
      const newListViewModel: ShoppingListItemViewModel = {
        id: data.id,
        title: defaultTitle, // Użyj domyślnego tytułu użytego w żądaniu
        createdAt: new Date().toISOString(), // Przybliżona data utworzenia
        updatedAt: new Date().toISOString(), // Przybliżona data aktualizacji
        itemCount: 0, // Nowa lista nie ma jeszcze elementów
        isDeleting: false,
      };

      setViewModel((prev) => ({
        ...prev,
        isCreating: false,
        // Dodaj nową listę na początek istniejącej listy
        lists: [newListViewModel, ...prev.lists],
        // Opcjonalnie: Zaktualizuj paginację, jeśli jest używana
        pagination: prev.pagination ? { ...prev.pagination, totalItems: prev.pagination.totalItems + 1 } : null, // Możesz potrzebować bardziej złożonej logiki, jeśli listy są sortowane inaczej niż wg daty utworzenia
      }));

      showSuccessToast("Lista zakupów została utworzona", {
        description: `Lista "${defaultTitle}" została pomyślnie utworzona.`,
      });
      return data.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas tworzenia listy";
      console.error("[useShoppingLists] Create list catch block error:", errorMessage);
      setViewModel((prev) => ({ ...prev, isCreating: false, error: errorMessage }));
      showErrorToast("Nie udało się utworzyć listy zakupów", { description: errorMessage });
      return null;
    }
  };

  // Funkcja do usuwania listy zakupów
  const deleteList = async (listId: string): Promise<void> => {
    // Auth check removed
    const listToDelete = viewModel.lists.find((list) => list.id === listId);
    const listTitle = listToDelete?.title || "Lista zakupów";
    setViewModel((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => (list.id === listId ? { ...list, isDeleting: true } : list)),
    }));
    console.log(`[useShoppingLists] Attempting to delete list ${listId} via client endpoint...`);

    try {
      // Headers: Remove Authorization header logic
      const headers: Record<string, string> = {};
      /*
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      */

      // Use the NEW client-specific endpoint - Updated to new path
      const response = await fetch(`/api/shopping-lists/${listId}`, {
        method: "DELETE",
        headers: headers,
        credentials: "include", // Keep this
      });

      console.log(`[useShoppingLists] Delete list (client endpoint) response status: ${response.status}`);

      if (!response.ok) {
        // Revert optimistic update
        setViewModel((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => (list.id === listId ? { ...list, isDeleting: false } : list)),
        }));

        // Try to parse error, default to status text
        let errorJson = { message: response.statusText };
        try {
          errorJson = await response.json();
        } catch (
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          _
        ) {
          /* Ignore parsing error - fix linter */
        }

        console.error(`[useShoppingLists] Error deleting list ${listId} (${response.status}):`, errorJson);
        if (response.status === 401) {
          throw new Error("Sesja wygasła lub użytkownik nie jest zalogowany.");
        }
        if (response.status === 404) {
          throw new Error("Nie znaleziono listy do usunięcia.");
        }
        throw new Error(
          `Błąd podczas usuwania listy (${response.status}): ${errorJson.message || "Nieznany błąd API"}`
        );
      }

      // Status 204 No Content on successful delete
      console.log(`[useShoppingLists] List ${listId} deleted successfully.`);
      setViewModel((prev) => ({
        ...prev,
        lists: prev.lists.filter((list) => list.id !== listId),
        pagination: prev.pagination ? { ...prev.pagination, totalItems: prev.pagination.totalItems - 1 } : null,
      }));
      showSuccessToast("Lista zakupów została usunięta", {
        description: `Lista "${listTitle}" została pomyślnie usunięta.`,
        duration: 3000, // Standardowa długość dla powiadomień o sukcesie
      });
    } catch (err) {
      // Revert optimistic update on error
      setViewModel((prev) => ({
        ...prev,
        lists: prev.lists.map((list) => (list.id === listId ? { ...list, isDeleting: false } : list)),
        error: err instanceof Error ? err.message : "Nieznany błąd podczas usuwania listy",
      }));
      console.error(`[useShoppingLists] Delete list ${listId} catch block error:`, err);
      showErrorToast("Nie udało się usunąć listy zakupów", {
        description: err instanceof Error ? err.message : "Nieznany błąd podczas usuwania listy",
        duration: 5000, // Dłuższy czas dla błędów
      });
    }
  };

  // Return state and actions
  return {
    lists: viewModel.lists,
    // isLoading now primarily reflects the creating/deleting state or manual refresh
    isLoading: viewModel.isLoading || viewModel.isCreating,
    isCreating: viewModel.isCreating, // Keep this for specific create button state
    error: viewModel.error,
    pagination: viewModel.pagination,
    createList,
    deleteList,
    refetch: fetchShoppingLists, // Expose refetch if manual refresh is needed
  };
}
