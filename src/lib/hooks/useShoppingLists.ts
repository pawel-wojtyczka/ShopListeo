import { useState, useEffect } from "react";
import type { ShoppingListSummaryDTO, CreateShoppingListRequest, CreateShoppingListResponse } from "../../types";
import { showSuccessToast, showErrorToast } from "../services/toast-service";
import { supabaseClient } from "../../db/supabase.client";

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
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  } | null;
}

// Hook do zarządzania stanem i logiką związaną z listami zakupów
export function useShoppingLists() {
  // Inicjalizacja stanu
  const [viewModel, setViewModel] = useState<ShoppingListsViewModel>({
    lists: [],
    isLoading: true,
    isCreating: false,
    error: null,
    pagination: null,
  });

  // Funkcja do pobierania list zakupów
  const fetchShoppingLists = async () => {
    setViewModel((prev) => ({ ...prev, isLoading: true, error: null }));
    console.log("[useShoppingLists] Fetching shopping lists..."); // Log start

    try {
      console.log("[useShoppingLists] Attempting to get session..."); // Log before getSession
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();

      // Log the result of getSession
      console.log("[useShoppingLists] getSession result:", { session: sessionData?.session, error: sessionError });

      if (sessionError) {
        console.error("[useShoppingLists] Session error:", sessionError.message);
        throw new Error(`Błąd pobierania sesji: ${sessionError.message}`);
      }

      // Use sessionData.session for the check
      if (!sessionData?.session) {
        console.warn("[useShoppingLists] No active session found.");
        throw new Error("Użytkownik nie jest zalogowany");
      }

      // Now use the session from sessionData
      const session = sessionData.session;
      console.log(
        "[useShoppingLists] Session found, fetching API with token:",
        session.access_token.substring(0, 10) + "..."
      ); // Log only part of the token

      // Construct URL with default query parameters
      const apiUrl = new URL("/api/shopping-lists", window.location.origin);
      apiUrl.searchParams.set("page", "1");
      apiUrl.searchParams.set("pageSize", "20"); // Default page size
      // You can add default sort/order if needed, e.g.:
      // apiUrl.searchParams.set("sort", "createdAt");
      // apiUrl.searchParams.set("order", "desc");

      console.log("[useShoppingLists] Fetching URL:", apiUrl.toString());

      const response = await fetch(apiUrl.toString(), {
        // Use the constructed URL
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Błąd podczas pobierania list (${response.status}): ${errorData.error || response.statusText}`);
      }

      const data = await response.json();

      // Mapowanie danych z API na model widoku
      const mappedLists: ShoppingListItemViewModel[] = data.data.map((list: ShoppingListSummaryDTO) => ({
        ...list,
        isDeleting: false,
      }));

      setViewModel((prev) => ({
        ...prev,
        lists: mappedLists,
        isLoading: false,
        pagination: data.pagination,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas pobierania list zakupów";
      setViewModel((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Wyświetlenie powiadomienia o błędzie
      showErrorToast("Nie udało się pobrać list zakupów", {
        description: errorMessage,
      });
    }
  };

  // Funkcja do tworzenia nowej listy zakupów
  const createList = async (): Promise<string | null> => {
    setViewModel((prev) => ({ ...prev, isCreating: true, error: null }));

    try {
      // Get session inside createList
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();

      if (sessionError) {
        console.error("[useShoppingLists] Session error in createList:", sessionError.message);
        throw new Error(`Błąd pobierania sesji: ${sessionError.message}`);
      }

      if (!sessionData?.session) {
        console.warn("[useShoppingLists] No active session found for createList.");
        throw new Error("Użytkownik nie jest zalogowany");
      }

      const session = sessionData.session;
      console.log("[useShoppingLists] Session found, creating list with token.");

      // Generowanie domyślnego tytułu dla nowej listy (np. z datą)
      const defaultTitle = `Lista zakupów ${new Date().toLocaleDateString("pl-PL")}`;

      const requestData: CreateShoppingListRequest = {
        title: defaultTitle,
      };

      const response = await fetch("/api/shopping-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Błąd podczas tworzenia listy (${response.status}): ${errorData.error || response.statusText}`);
      }

      const data: CreateShoppingListResponse = await response.json();

      // Aktualizacja stanu
      setViewModel((prev) => ({
        ...prev,
        isCreating: false,
      }));

      // Powiadomienie o sukcesie
      showSuccessToast("Lista zakupów została utworzona", {
        description: `Lista "${defaultTitle}" została pomyślnie utworzona.`,
      });

      // Zwrócenie ID nowej listy do przekierowania
      return data.id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas tworzenia listy";
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
    // Znajdź tytuł listy przed usunięciem (do powiadomienia)
    const listToDelete = viewModel.lists.find((list) => list.id === listId);
    const listTitle = listToDelete?.title || "Lista zakupów";

    // Optymistyczna aktualizacja UI - oznaczenie listy jako usuwanej
    setViewModel((prev) => ({
      ...prev,
      lists: prev.lists.map((list) => (list.id === listId ? { ...list, isDeleting: true } : list)),
    }));

    try {
      // Get session inside deleteList
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();

      if (sessionError) {
        console.error("[useShoppingLists] Session error in deleteList:", sessionError.message);
        throw new Error(`Błąd pobierania sesji: ${sessionError.message}`);
      }

      if (!sessionData?.session) {
        console.warn("[useShoppingLists] No active session found for deleteList.");
        throw new Error("Użytkownik nie jest zalogowany");
      }

      const session = sessionData.session;
      console.log("[useShoppingLists] Session found, deleting list with token.");

      const response = await fetch(`/api/shopping-lists/${listId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Błąd podczas usuwania listy (${response.status}): ${errorData.error || response.statusText}`);
      }

      // Usunięcie listy z UI po potwierdzeniu z serwera
      setViewModel((prev) => ({
        ...prev,
        lists: prev.lists.filter((list) => list.id !== listId),
      }));

      // Powiadomienie o sukcesie
      showSuccessToast("Lista zakupów została usunięta", {
        description: `Lista "${listTitle}" została pomyślnie usunięta.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas usuwania listy";

      // Przywrócenie listy w UI w przypadku błędu
      setViewModel((prev) => ({
        ...prev,
        lists: prev.lists.map((list) => (list.id === listId ? { ...list, isDeleting: false } : list)),
        error: errorMessage,
      }));

      // Powiadomienie o błędzie
      showErrorToast("Nie udało się usunąć listy zakupów", {
        description: errorMessage,
      });
    }
  };

  // Pobranie list przy pierwszym renderowaniu
  useEffect(() => {
    fetchShoppingLists();
  }, []);

  // Zwrócenie stanu i funkcji do użycia w komponencie
  return {
    lists: viewModel.lists,
    isLoading: viewModel.isLoading || viewModel.isCreating,
    error: viewModel.error,
    createList,
    deleteList,
  };
}
