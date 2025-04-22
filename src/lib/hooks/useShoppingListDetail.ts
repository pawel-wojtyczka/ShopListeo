import { useState, useEffect, useCallback } from "react";
import type {
  ShoppingListItemDTO,
  UpdateShoppingListRequest,
  UpdateShoppingListResponse,
  UpdateShoppingListItemRequest,
  UpdateShoppingListItemResponse,
  AddItemToShoppingListRequest,
  AddItemToShoppingListResponse,
  ShoppingListDetailResponse,
} from "@/types";
// Importuj klienta Supabase i usługi toast
import { supabaseClient } from "@/db/supabase.client";
import { showSuccessToast, showErrorToast } from "@/lib/services/toast-service";

// Model widoku dla pojedynczego elementu listy zakupów (zgodnie z planem)
export interface ProductItemViewModel extends ShoppingListItemDTO {
  isEditingName: boolean; // Czy nazwa jest aktualnie edytowana?
  isUpdating: boolean; // Czy element jest aktualnie aktualizowany/usuwany?
}

// Model widoku dla szczegółów listy zakupów (zgodnie z planem)
interface ShoppingListDetailViewModel {
  id: string; // ID listy
  title: string; // Tytuł listy
  items: ProductItemViewModel[]; // Lista elementów (ViewModel)
  createdAt: string; // Dodaj datę utworzenia
  updatedAt: string; // Dodaj datę aktualizacji
}

// Hook do zarządzania stanem i logiką widoku szczegółów listy zakupów
export function useShoppingListDetail(listId: string) {
  const [viewModel, setViewModel] = useState<ShoppingListDetailViewModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false); // Ogólny stan aktualizacji
  const [error, setError] = useState<string | null>(null);

  // Funkcja do pobierania szczegółów listy
  const fetchListDetails = useCallback(async () => {
    console.log(`[useShoppingListDetail] Fetching details for list ID: ${listId}`);
    setIsLoading(true);
    setError(null);
    setViewModel(null); // Wyczyść poprzednie dane na czas ładowania

    try {
      // Pobierz sesję i token
      const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
      if (sessionError || !sessionData?.session) {
        throw new Error(sessionError?.message || "User not authenticated");
      }
      const token = sessionData.session.access_token;

      // Wywołaj API
      const response = await fetch(`/api/shopping-lists/${listId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Błąd API (${response.status}): ${errorData.error || response.statusText}`);
      }

      const data: ShoppingListDetailResponse = await response.json();

      // Zmapuj odpowiedź API na ViewModel
      const fetchedViewModel: ShoppingListDetailViewModel = {
        id: data.id,
        title: data.title,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        items: data.items.map((item: ShoppingListItemDTO) => ({
          ...item,
          isEditingName: false, // Domyślny stan dla widoku
          isUpdating: false, // Domyślny stan dla widoku
        })),
      };

      setViewModel(fetchedViewModel);
      console.log("[useShoppingListDetail] List details loaded:", fetchedViewModel);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas pobierania szczegółów listy.";
      console.error("[useShoppingListDetail] Error fetching details:", errorMessage);
      setError(errorMessage);
      showErrorToast("Błąd pobierania listy", { description: errorMessage });
      // Ustawiamy viewModel na null w przypadku błędu, aby komponent mógł to obsłużyć
      setViewModel(null);
    } finally {
      setIsLoading(false);
    }
  }, [listId]); // Zależność od listId

  // Pobranie danych przy pierwszym renderowaniu lub zmianie listId
  useEffect(() => {
    if (listId) {
      fetchListDetails();
    } else {
      // Jeśli listId jest puste lub null, zresetuj stan
      setIsLoading(false);
      setViewModel(null);
      setError("Invalid List ID");
    }
  }, [listId, fetchListDetails]);

  // Funkcja do aktualizacji tytułu listy
  const updateTitle = useCallback(
    async (newTitle: string) => {
      if (!viewModel || newTitle === viewModel.title) {
        return; // Bez zmian
      }

      const trimmedTitle = newTitle.trim();
      if (trimmedTitle.length === 0 || trimmedTitle.length > 255) {
        showErrorToast("Nieprawidłowy tytuł", {
          description: "Tytuł musi zawierać od 1 do 255 znaków.",
        });
        throw new Error("Invalid title length"); // Rzuć błąd, aby komponent mógł zareagować
      }

      setIsUpdating(true);
      setError(null);

      try {
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError || !sessionData?.session) {
          throw new Error(sessionError?.message || "User not authenticated");
        }
        const token = sessionData.session.access_token;

        const requestBody: UpdateShoppingListRequest = { title: trimmedTitle };

        const response = await fetch(`/api/shopping-lists/${listId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Błąd API (${response.status}): ${errorData.error || response.statusText}`);
        }

        const data: UpdateShoppingListResponse = await response.json();

        // Aktualizacja stanu po sukcesie - weź dane z odpowiedzi API
        setViewModel((prev) =>
          prev
            ? {
                ...prev,
                title: data.title,
                updatedAt: data.updatedAt, // Zaktualizuj updatedAt
              }
            : null
        );

        showSuccessToast("Tytuł zaktualizowany", {
          description: `Tytuł listy został zmieniony na "${data.title}".`,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas aktualizacji tytułu.";
        setError(errorMessage);
        showErrorToast("Błąd aktualizacji tytułu", { description: errorMessage });
        throw err; // Rzuć błąd dalej, aby komponent mógł zareagować
      } finally {
        setIsUpdating(false);
      }
    },
    [listId, viewModel]
  );

  const toggleItemPurchased = useCallback(
    async (itemId: string) => {
      if (!viewModel) return;

      const itemIndex = viewModel.items.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) {
        console.error(`[toggleItemPurchased] Item with id ${itemId} not found.`);
        showErrorToast("Błąd", { description: "Nie znaleziono produktu do zaktualizowania." });
        return;
      }

      const originalItem = viewModel.items[itemIndex];
      const newPurchasedStatus = !originalItem.purchased;

      // Optymistyczna aktualizacja UI
      setViewModel((prev) => {
        if (!prev) return null;
        const updatedItems = [...prev.items];
        updatedItems[itemIndex] = {
          ...originalItem,
          purchased: newPurchasedStatus,
          isUpdating: true, // Oznacz jako aktualizowany
        };
        return { ...prev, items: updatedItems };
      });

      try {
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError || !sessionData?.session) {
          throw new Error(sessionError?.message || "User not authenticated");
        }
        const token = sessionData.session.access_token;

        const requestBody: UpdateShoppingListItemRequest = { purchased: newPurchasedStatus };

        const response = await fetch(`/api/shopping-lists/${listId}/items/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Błąd API (${response.status}): ${errorData.error || response.statusText}`);
        }

        const data: UpdateShoppingListItemResponse = await response.json();

        // Potwierdzenie aktualizacji - zastosuj dane z serwera (głównie updatedAt)
        setViewModel((prev) => {
          if (!prev) return null;
          const confirmedItems = [...prev.items];
          const confirmedIndex = confirmedItems.findIndex((item) => item.id === itemId);
          if (confirmedIndex !== -1) {
            confirmedItems[confirmedIndex] = {
              ...confirmedItems[confirmedIndex],
              purchased: data.purchased, // Użyj danych z serwera
              updatedAt: data.updatedAt, // Zaktualizuj updatedAt
              isUpdating: false, // Zakończ ładowanie
            };
          }
          return { ...prev, items: confirmedItems };
        });

        // Nie pokazujemy toastu sukcesu dla tej akcji, bo zmiana jest widoczna od razu
        // showSuccessToast("Status produktu zaktualizowany");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Nieznany błąd podczas aktualizacji statusu produktu.";
        setError(errorMessage); // Ustaw ogólny błąd hooka
        showErrorToast("Błąd aktualizacji produktu", { description: errorMessage });

        // Przywróć stan w razie błędu
        setViewModel((prev) => {
          if (!prev) return null;
          const revertedItems = [...prev.items];
          const revertedIndex = revertedItems.findIndex((item) => item.id === itemId);
          if (revertedIndex !== -1) {
            // Przywróć oryginalny stan produktu
            revertedItems[revertedIndex] = { ...originalItem, isUpdating: false };
          }
          return { ...prev, items: revertedItems };
        });
        // Nie rzucamy błędu dalej, bo został obsłużony przez toast i revert stanu
      }
    },
    [listId, viewModel] // Zależności obejmują teraz viewModel, aby mieć dostęp do items
  );

  // Funkcja do usuwania elementu z listy
  const deleteItem = useCallback(
    async (itemId: string) => {
      if (!viewModel) return;

      const itemToDelete = viewModel.items.find((item) => item.id === itemId);
      if (!itemToDelete) {
        console.error(`Item with id ${itemId} not found for deletion.`);
        return;
      }

      // Zapamiętaj oryginalną listę do ewentualnego przywrócenia
      const originalItems = [...viewModel.items];

      // Optymistyczne usunięcie z UI
      setViewModel((prev) => {
        if (!prev) return null;
        return { ...prev, items: prev.items.filter((item) => item.id !== itemId) };
      });

      try {
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError || !sessionData?.session) {
          throw new Error(sessionError?.message || "User not authenticated");
        }
        const token = sessionData.session.access_token;

        const response = await fetch(`/api/shopping-lists/${listId}/items/${itemId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // W przypadku błędu 404 (Not Found) serwer mógł już usunąć element - traktujemy jako sukces?
          // Na razie rzucamy błąd dla wszystkich statusów != 2xx
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Błąd API (${response.status}): ${errorData.error || response.statusText}`);
        }

        // Status 204 No Content oznacza sukces
        showSuccessToast("Produkt usunięty", {
          description: `Produkt "${itemToDelete.itemName}" został usunięty z listy.`,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas usuwania produktu.";
        setError(errorMessage); // Ustaw ogólny błąd
        showErrorToast("Błąd usuwania produktu", { description: errorMessage });

        // Przywróć stan w razie błędu (cofnij optymistyczne usunięcie)
        setViewModel((prev) => {
          if (!prev) return null;
          return { ...prev, items: originalItems }; // Przywróć zapamiętaną listę
        });
      }
      // Nie ma potrzeby ustawiać isUpdating globalnie dla usuwania
      // Ewentualnie można by ustawić isUpdating na true dla usuwanego elementu przed usunięciem go z UI,
      // ale przy optymistycznym usunięciu element znika od razu.
    },
    [listId, viewModel]
  );

  // Funkcja do aktualizacji nazwy elementu
  const updateItemName = useCallback(
    async (itemId: string, newName: string) => {
      if (!viewModel) return;

      const itemIndex = viewModel.items.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) {
        console.error(`Item with id ${itemId} not found for name update.`);
        return;
      }

      const originalItem = viewModel.items[itemIndex];

      // Walidacja długości
      const trimmedName = newName.trim();
      if (trimmedName.length === 0 || trimmedName.length > 128) {
        showErrorToast("Nieprawidłowa nazwa produktu", {
          description: "Nazwa musi zawierać od 1 do 128 znaków.",
        });
        throw new Error("Invalid item name length");
      }

      if (trimmedName === originalItem.itemName) {
        return; // Bez zmian
      }

      // Oznacz element jako aktualizowany (stan ładowania per element)
      setViewModel((prev) => {
        if (!prev) return null;
        const updatedItems = [...prev.items];
        updatedItems[itemIndex] = { ...originalItem, isUpdating: true };
        return { ...prev, items: updatedItems };
      });

      try {
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError || !sessionData?.session) {
          throw new Error(sessionError?.message || "User not authenticated");
        }
        const token = sessionData.session.access_token;

        const requestBody: UpdateShoppingListItemRequest = { itemName: trimmedName };

        const response = await fetch(`/api/shopping-lists/${listId}/items/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Błąd API (${response.status}): ${errorData.error || response.statusText}`);
        }

        const data: UpdateShoppingListItemResponse = await response.json();

        // Potwierdzenie aktualizacji - zastosuj dane z serwera
        setViewModel((prev) => {
          if (!prev) return null;
          const confirmedItems = [...prev.items];
          const confirmedIndex = confirmedItems.findIndex((item) => item.id === itemId);
          if (confirmedIndex !== -1) {
            confirmedItems[confirmedIndex] = {
              ...confirmedItems[confirmedIndex],
              itemName: data.itemName,
              updatedAt: data.updatedAt,
              isUpdating: false, // Zakończ ładowanie
            };
          }
          return { ...prev, items: confirmedItems };
        });

        showSuccessToast("Nazwa produktu zaktualizowana");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas aktualizacji nazwy produktu.";
        setError(errorMessage);
        showErrorToast("Błąd aktualizacji nazwy", { description: errorMessage });

        // Przywróć stan w razie błędu
        setViewModel((prev) => {
          if (!prev) return null;
          const revertedItems = [...prev.items];
          const revertedIndex = revertedItems.findIndex((item) => item.id === itemId);
          if (revertedIndex !== -1) {
            // Przywróć tylko stan ładowania, nazwa w inpucie pozostaje bez zmian
            revertedItems[revertedIndex] = { ...revertedItems[revertedIndex], isUpdating: false };
            // Można też przywrócić originalItem.itemName, ale to może być mylące dla użytkownika
            // revertedItems[revertedIndex] = { ...originalItem, isUpdating: false };
          }
          return { ...prev, items: revertedItems };
        });
        throw err; // Rzuć błąd, aby komponent ProductItem mógł zareagować (np. nie zmieniać stanu lokalnego)
      }
    },
    [listId, viewModel]
  );

  // Funkcja do dodawania wielu elementów do listy
  const addItems = useCallback(
    async (itemNames: string[]) => {
      if (!viewModel || itemNames.length === 0) return;

      // Opcjonalnie: Można by dodać wskaźnik ładowania dla obszaru dodawania
      // setIsUpdating(true); // Lub dedykowany stan `isAdding`?
      setError(null);

      // Przygotuj dane do wysłania
      const itemsToAdd: AddItemToShoppingListRequest[] = itemNames.map((name) => ({
        itemName: name,
        purchased: false,
      }));
      const addedItemsViewModels: ProductItemViewModel[] = []; // Do optymistycznej aktualizacji
      const errors: string[] = [];

      try {
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError || !sessionData?.session) {
          throw new Error(sessionError?.message || "User not authenticated");
        }
        const token = sessionData.session.access_token;

        // Wykonaj żądania równolegle
        const results = await Promise.allSettled(
          itemsToAdd.map((itemData) =>
            fetch(`/api/shopping-lists/${listId}/items`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(itemData),
            }).then(async (response) => {
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                // Rzuć błąd specyficzny dla tego elementu
                throw new Error(
                  `(${response.status}) ${errorData.error || response.statusText} for "${itemData.itemName}"`
                );
              }
              return response.json() as Promise<AddItemToShoppingListResponse>;
            })
          )
        );

        // Przetwórz wyniki
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const newItemData = result.value;
            // Przygotuj ViewModel dla nowego elementu
            addedItemsViewModels.push({
              ...newItemData,
              itemName: newItemData.itemName, // Upewnij się, że itemName jest obecne
              isEditingName: false,
              isUpdating: false,
            });
          } else {
            // Zbierz komunikaty o błędach
            errors.push(result.reason?.message || `Unknown error adding "${itemsToAdd[index].itemName}"`);
          }
        });

        // Aktualizuj stan - dodaj tylko pomyślnie dodane elementy
        if (addedItemsViewModels.length > 0) {
          setViewModel((prev) => {
            if (!prev) return null;
            // Dodaj nowe elementy do istniejącej listy
            const updatedItems = [...prev.items, ...addedItemsViewModels];
            return { ...prev, items: updatedItems };
          });
        }

        // Pokaż podsumowanie w toastach
        if (addedItemsViewModels.length > 0) {
          showSuccessToast(`Dodano ${addedItemsViewModels.length} produktów`, {
            description: errors.length > 0 ? `Nie udało się dodać ${errors.length} produktów.` : undefined,
          });
        }
        if (errors.length > 0) {
          showErrorToast(`Nie udało się dodać ${errors.length} produktów`, {
            description: errors.join("; "), // Pokaż szczegóły błędów
          });
        }
      } catch (err) {
        // Ogólny błąd (np. brak sesji)
        const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas dodawania produktów.";
        setError(errorMessage);
        showErrorToast("Błąd dodawania produktów", { description: errorMessage });
        // Tutaj nie rzucamy błędu dalej, bo obsłużyliśmy go przez toast
      } finally {
        // Opcjonalnie: zakończ stan ładowania
        // setIsUpdating(false);
      }
    },
    [listId, viewModel]
  );

  // Zwrócenie stanu i funkcji do użycia w komponencie
  return {
    // Rozpakuj viewModel ostrożnie, jeśli może być null
    id: viewModel?.id ?? listId, // Zwróć listId jeśli viewModel jest null
    title: viewModel?.title ?? "", // Zwróć pusty string, jeśli viewModel jest null
    items: viewModel?.items ?? [], // Zwróć pustą tablicę, jeśli viewModel jest null
    createdAt: viewModel?.createdAt, // Dodaj createdAt
    updatedAt: viewModel?.updatedAt, // Dodaj updatedAt
    isLoading,
    isUpdating, // Zwróć ogólny stan aktualizacji
    error,
    updateTitle, // Dodano funkcję
    toggleItemPurchased, // Dodano tutaj
    deleteItem, // Dodano funkcję
    updateItemName, // Dodano funkcję
    addItems, // Dodano funkcję
    // Przyszłe funkcje:
    // addItem: async (itemName: string) => { /* ... */ },
  };
}
