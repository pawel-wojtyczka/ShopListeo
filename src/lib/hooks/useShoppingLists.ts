import { useState, useCallback, useEffect } from "react";
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
  initialLists?: ShoppingListSummaryDTO[];
  initialPagination?: PaginationResponse | null;
  fetchError?: string | null;
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
    const mappedInitialLists = initialLists.map((list) => ({ ...list, isDeleting: false }));
    // Ustaw isLoading na true, jeśli nie ma list początkowych i nie ma błędu z serwera
    // Oznacza to, że dane muszą zostać pobrane po stronie klienta
    const clientSideFetchNeeded = initialLists.length === 0 && !fetchError;
    return {
      lists: mappedInitialLists,
      isLoading: clientSideFetchNeeded, // Zaktualizowana logika dla isLoading
      isCreating: false,
      error: fetchError,
      pagination: initialPagination,
    };
  });

  const { isAuthenticated, user } = useAuth();

  // fetchShoppingLists zdefiniowane PRZED useEffect, który go używa
  const fetchShoppingLists = useCallback(
    async (page = 1, pageSize = 20) => {
      if (!isAuthenticated || !user) {
        setViewModel((prev) => ({ ...prev, isLoading: false, error: "Użytkownik nie jest zalogowany" }));
        return;
      }

      setViewModel((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const apiUrl = new URL("/api/shopping-lists", window.location.origin);
        apiUrl.searchParams.set("page", page.toString());
        apiUrl.searchParams.set("pageSize", pageSize.toString());

        const response = await fetch(apiUrl.toString(), {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: response.statusText }));
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
    [isAuthenticated, user]
  );

  useEffect(() => {
    if (initialLists.length === 0 && !fetchError && isAuthenticated && user) {
      // Nie ma potrzeby ustawiać isLoading tutaj, bo jest już ustawione w useState
      fetchShoppingLists();
    }
  }, [initialLists, fetchError, isAuthenticated, user, fetchShoppingLists]);

  // Create and Delete functions remain largely the same,
  // they rely on cookies (via fetch) or token from context for auth,
  // and useAuth() provides the necessary user.id.

  const createList = async (): Promise<string | null> => {
    // Auth check removed
    setViewModel((prev) => ({ ...prev, isCreating: true, error: null }));

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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        if (response.status === 401) {
          throw new Error("Sesja wygasła lub użytkownik nie jest zalogowany.");
        }
        throw new Error(
          `Błąd podczas tworzenia listy (${response.status}): ${errorData.message || errorData.error || "Nieznany błąd API"}`
        );
      }

      // Assuming the new endpoint returns the same CreateShoppingListResponse shape
      const data: CreateShoppingListResponse = await response.json();

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
      setViewModel((prev) => ({ ...prev, isCreating: false, error: errorMessage }));
      showErrorToast("Nie udało się utworzyć listy zakupów", { description: errorMessage });
      return null;
    }
  };

  // Funkcja do usuwania listy zakupów
  const deleteList = useCallback(
    async (listId: string): Promise<void> => {
      // Auth check removed
      const listToDelete = viewModel.lists.find((list) => list.id === listId);
      const listTitle = listToDelete?.title || "Lista zakupów";
      setViewModel((prev) => ({
        ...prev,
        lists: prev.lists.map((list) => (list.id === listId ? { ...list, isDeleting: true } : list)),
      }));

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
          } catch (_) {
            /* Ignore parsing error - fix linter */
          }

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
        setViewModel((prev) => ({
          ...prev,
          lists: prev.lists.filter((list) => list.id !== listId),
          pagination: prev.pagination ? { ...prev.pagination, totalItems: prev.pagination.totalItems - 1 } : null,
        }));
        showSuccessToast("Lista zakupów została usunięta", {
          description: `Lista "${listTitle}" została pomyślnie usunięta.`,
          duration: 3000, // Standardowa długość dla powiadomień o sukcesie
        });
      } catch (_err) {
        // Revert optimistic update on error
        setViewModel((prev) => ({
          ...prev,
          lists: prev.lists.map((list) => (list.id === listId ? { ...list, isDeleting: false } : list)),
          error: _err instanceof Error ? _err.message : "Nieznany błąd podczas usuwania listy",
        }));
        showErrorToast("Nie udało się usunąć listy zakupów", {
          description: _err instanceof Error ? _err.message : "Nieznany błąd podczas usuwania listy",
          duration: 5000, // Dłuższy czas dla błędów
        });
      }
    },
    [viewModel, setViewModel]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDeleteList = useCallback(
    async (listId: string) => {
      // Optymistyczna aktualizacja - usuń listę z UI
      setViewModel((prev) => ({
        ...prev,
        lists: prev.lists.filter((list) => list.id !== listId),
      }));

      try {
        // Wywołaj usuwanie z API
        await deleteList(listId);
      } catch (_err) {
        // W przypadku błędu, przywróć listę do UI
        setViewModel((prev) => ({
          ...prev,
          lists: [
            ...prev.lists,
            {
              id: listId,
              title: "Lista zakupów",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              itemCount: 0,
              isDeleting: false,
            },
          ],
        }));
      }
    },
    [deleteList]
  );

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
