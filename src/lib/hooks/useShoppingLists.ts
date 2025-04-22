import { useState, useEffect, useCallback } from "react";
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
  const { isAuthenticated, user, token } = useAuth();

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
        const apiUrl = new URL("/api/shopping-lists", window.location.origin);
        apiUrl.searchParams.set("page", page.toString());
        apiUrl.searchParams.set("pageSize", pageSize.toString());

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(apiUrl.toString(), { headers });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
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
    [isAuthenticated, user, token]
  ); // Dependencies for the refetch function

  // Create and Delete functions remain largely the same,
  // they rely on cookies (via fetch) or token from context for auth,
  // and useAuth() provides the necessary user.id.

  const createList = async (): Promise<string | null> => {
    if (!isAuthenticated || !user) {
      showErrorToast("Nie można utworzyć listy", { description: "Musisz być zalogowany." });
      return null;
    }

    setViewModel((prev) => ({ ...prev, isCreating: true, error: null }));
    console.log("[useShoppingLists] Creating new list..."); // Log start

    try {
      // Generowanie domyślnego tytułu dla nowej listy (np. z datą)
      const defaultTitle = `Lista zakupów ${new Date().toLocaleDateString("pl-PL")}`;

      const requestData: CreateShoppingListRequest = {
        title: defaultTitle,
      };

      // Prepare headers using token from context if available
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        console.log("[useShoppingLists] Using token from AuthContext for createList.");
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        console.log("[useShoppingLists] No token in AuthContext for createList, relying on cookies.");
      }

      const response = await fetch("/api/shopping-lists", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestData),
      });

      console.log(`[useShoppingLists] Create list response status: ${response.status}`); // Log status

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error(`[useShoppingLists] Error creating list (${response.status}):`, errorData);
        throw new Error(
          `Błąd podczas tworzenia listy (${response.status}): ${errorData.message || errorData.error || response.statusText}`
        );
      }

      const data: CreateShoppingListResponse = await response.json();
      console.log("[useShoppingLists] List created successfully:", data); // Log success

      // Aktualizacja stanu
      setViewModel((prev) => ({
        ...prev,
        isCreating: false,
      }));

      // Powiadomienie o sukcesie
      showSuccessToast("Lista zakupów została utworzona", {
        description: `Lista "${defaultTitle}" została pomyślnie utworzona.`,
      });

      // Manually refetch lists after creation to show the new list
      fetchShoppingLists();

      // Zwrócenie ID nowej listy do przekierowania
      return data.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas tworzenia listy";
      console.error("[useShoppingLists] Create list catch block error:", errorMessage); // Log catch errors
      setViewModel((prev) => ({
        ...prev,
        isCreating: false,
        error: errorMessage,
      }));

      // Powiadomienie o błędzie
      showErrorToast("Nie udało się utworzyć listy zakupów", {
        description: errorMessage,
      });

      return null;
    }
  };

  // Funkcja do usuwania listy zakupów
  const deleteList = async (listId: string): Promise<void> => {
    if (!isAuthenticated || !user) {
      showErrorToast("Nie można usunąć listy", { description: "Musisz być zalogowany." });
      return;
    }

    // Znajdź tytuł listy przed usunięciem (do powiadomienia)
    const listToDelete = viewModel.lists.find((list) => list.id === listId);
    const listTitle = listToDelete?.title || "Lista zakupów";

    // Optymistyczna aktualizacja UI - oznaczenie listy jako usuwanej
    setViewModel((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => (list.id === listId ? { ...list, isDeleting: true } : list)),
    }));
    console.log(`[useShoppingLists] Attempting to delete list ${listId}...`); // Log start

    try {
      // Prepare headers using token from context if available
      const headers: Record<string, string> = {};
      if (token) {
        console.log("[useShoppingLists] Using token from AuthContext for deleteList.");
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        console.log("[useShoppingLists] No token in AuthContext for deleteList, relying on cookies.");
      }

      const response = await fetch(`/api/shopping-lists/${listId}`, {
        method: "DELETE",
        headers: headers,
      });

      console.log(`[useShoppingLists] Delete list response status: ${response.status}`); // Log status

      if (!response.ok) {
        // If deletion failed, revert the optimistic update
        setViewModel((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => (list.id === listId ? { ...list, isDeleting: false } : list)),
        }));
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        console.error(`[useShoppingLists] Error deleting list ${listId} (${response.status}):`, errorData);
        throw new Error(
          `Błąd podczas usuwania listy (${response.status}): ${errorData.message || errorData.error || response.statusText}`
        );
      }

      console.log(`[useShoppingLists] List ${listId} deleted successfully.`); // Log success

      // Usunięcie listy z modelu widoku po pomyślnym usunięciu na serwerze
      setViewModel((prev) => ({
        ...prev,
        lists: prev.lists.filter((list) => list.id !== listId),
        pagination: prev.pagination ? { ...prev.pagination, totalItems: prev.pagination.totalItems - 1 } : null, // Update pagination count
      }));

      // Powiadomienie o sukcesie
      showSuccessToast("Lista zakupów została usunięta", {
        description: `Lista "${listTitle}" została pomyślnie usunięta.`,
      });
    } catch (err) {
      // Revert optimistic update on error
      setViewModel((prev) => ({
        ...prev,
        lists: prev.lists.map((list) => (list.id === listId ? { ...list, isDeleting: false } : list)),
      }));
      const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas usuwania listy";
      console.error(`[useShoppingLists] Delete list ${listId} catch block error:`, errorMessage); // Log catch errors
      setViewModel((prev) => ({
        ...prev,
        error: errorMessage, // Show error in the view model maybe?
      }));

      // Powiadomienie o błędzie
      showErrorToast("Nie udało się usunąć listy zakupów", {
        description: errorMessage,
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
