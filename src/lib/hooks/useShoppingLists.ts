import { useState, useEffect } from "react";
import type { ShoppingListSummaryDTO, CreateShoppingListRequest, CreateShoppingListResponse } from "../../types";
import { showSuccessToast, showErrorToast } from "../services/toast-service";

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

    try {
      const response = await fetch("/api/shopping-lists");

      if (!response.ok) {
        throw new Error(`Błąd podczas pobierania list: ${response.status}`);
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
      // Generowanie domyślnego tytułu dla nowej listy (np. z datą)
      const defaultTitle = `Lista zakupów ${new Date().toLocaleDateString("pl-PL")}`;

      const requestData: CreateShoppingListRequest = {
        title: defaultTitle,
      };

      const response = await fetch("/api/shopping-lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Błąd podczas tworzenia listy: ${response.status}`);
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
      const response = await fetch(`/api/shopping-lists/${listId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Błąd podczas usuwania listy: ${response.status}`);
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
