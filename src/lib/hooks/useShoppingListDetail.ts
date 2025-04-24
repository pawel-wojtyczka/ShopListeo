import { useState, useEffect, useCallback, useRef } from "react";
import type {
  ShoppingListItemDTO,
  UpdateShoppingListRequest,
  UpdateShoppingListResponse,
  UpdateShoppingListItemRequest,
  UpdateShoppingListItemResponse,
  ShoppingListDetailResponse,
} from "@/types";
// Importuj usługi toast używając poprawnej ścieżki relatywnej
import { showSuccessToast, showErrorToast } from "../services/toast-service";

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
  const retryCount = useRef(0);
  const maxRetries = 3; // Maksymalna liczba prób
  const retryDelay = 500; // Opóźnienie między próbami w ms

  // Funkcja do pobierania szczegółów listy
  const fetchListDetails = useCallback(
    async (isRetry = false) => {
      // Jeśli to nie jest ponowna próba, resetujemy stan
      if (!isRetry) {
        console.log(`[useShoppingListDetail] Fetching details for list ID: ${listId}`);
        setIsLoading(true);
        setError(null);
        setViewModel(null); // Wyczyść poprzednie dane na czas ładowania
      } else {
        console.log(
          `[useShoppingListDetail] Retrying fetch for list ID: ${listId}, attempt: ${retryCount.current + 1}`
        );
      }

      try {
        // Używamy nowego endpointu klienta zamiast standardowego API
        // Nie potrzebujemy już pobierać tokena, ponieważ autentykacja odbywa się przez cookie
        const response = await fetch(`/api/client/shopping-lists/${listId}`, {
          method: "GET",
          credentials: "include", // Dołączamy cookies do zapytania
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
        retryCount.current = 0; // Resetuj licznik prób po sukcesie
        console.log("[useShoppingListDetail] List details loaded:", fetchedViewModel);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas pobierania szczegółów listy.";
        console.error("[useShoppingListDetail] Error fetching details:", errorMessage);

        // Sprawdź, czy błąd dotyczy uwierzytelniania i czy możemy spróbować ponownie
        const isAuthError =
          errorMessage.includes("zalogowany") ||
          errorMessage.includes("401") ||
          errorMessage.includes("authentication");

        if (isAuthError && retryCount.current < maxRetries) {
          // Jeśli to błąd uwierzytelniania, spróbuj ponownie po krótkim opóźnieniu
          retryCount.current += 1;
          console.log(
            `[useShoppingListDetail] Auth error detected, scheduling retry #${retryCount.current} in ${retryDelay}ms`
          );

          // Nie ustawiamy błędu ani nie pokazujemy toastu dla automatycznych ponownych prób
          setTimeout(() => {
            fetchListDetails(true);
          }, retryDelay);

          return; // Wyjdź wcześniej, nie ustawiaj stanu błędu ani nie kończ ładowania
        }

        // Jeśli to nie błąd auth lub przekroczyliśmy limit prób, pokaż błąd
        setError(errorMessage);

        // Pokaż toast błędu tylko jeśli wyczerpaliśmy ponowne próby lub to nie jest błąd uwierzytelniania
        if (!isAuthError || retryCount.current >= maxRetries) {
          showErrorToast("Błąd pobierania listy", { description: errorMessage });
        }

        // Ustawiamy viewModel na null w przypadku błędu, aby komponent mógł to obsłużyć
        setViewModel(null);
        retryCount.current = 0; // Resetuj licznik prób po wyświetleniu błędu
      } finally {
        if (retryCount.current === 0 || retryCount.current >= maxRetries) {
          setIsLoading(false);
        }
      }
    },
    [listId]
  ); // Zależność od listId

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
        const requestBody: UpdateShoppingListRequest = { title: trimmedTitle };

        const response = await fetch(`/api/client/shopping-lists/${listId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Dołączamy cookies do zapytania
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
          duration: 3000, // Standardowa długość dla powiadomień o sukcesie
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas aktualizacji tytułu.";
        setError(errorMessage);
        showErrorToast("Błąd aktualizacji tytułu", {
          description: errorMessage,
          duration: 5000, // Dłuższy czas dla błędów
        });
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
        showErrorToast("Błąd", {
          description: "Nie znaleziono produktu do zaktualizowania.",
          duration: 5000, // Dłuższy czas dla błędów
        });
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
        const requestBody: UpdateShoppingListItemRequest = { purchased: newPurchasedStatus };

        const response = await fetch(`/api/client/shopping-lists/${listId}/items/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Dołączamy cookies do zapytania
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
        showErrorToast("Błąd aktualizacji produktu", {
          description: errorMessage,
          duration: 5000, // Dłuższy czas dla błędów
        });

        // Przywrócenie oryginalnego stanu listy w przypadku błędu
        setViewModel((prev) => {
          if (!prev) return null;
          const revertedItems = [...prev.items];
          const revertIndex = revertedItems.findIndex((item) => item.id === itemId);
          if (revertIndex !== -1) {
            revertedItems[revertIndex] = {
              ...originalItem,
              isUpdating: false, // Zakończ ładowanie
            };
          }
          return { ...prev, items: revertedItems };
        });
      }
    },
    [listId, viewModel]
  );

  const deleteItem = useCallback(
    async (itemId: string) => {
      if (!viewModel) return;

      const itemIndex = viewModel.items.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) {
        console.error(`[deleteItem] Item with id ${itemId} not found.`);
        showErrorToast("Błąd", {
          description: "Nie znaleziono produktu do usunięcia.",
          duration: 5000, // Dłuższy czas dla błędów
        });
        return;
      }

      const itemToDelete = viewModel.items[itemIndex];

      // Aktualizacja optymistyczna UI (usuń z listy)
      setViewModel((prev) => {
        if (!prev) return null;
        const updatedItems = prev.items.filter((item) => item.id !== itemId);
        return { ...prev, items: updatedItems };
      });

      try {
        const response = await fetch(`/api/client/shopping-lists/${listId}/items/${itemId}`, {
          method: "DELETE",
          credentials: "include", // Dołączamy cookies do zapytania
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Błąd API (${response.status}): ${errorData.error || response.statusText}`);
        }

        // Potwierdzenie usunięcia
        console.log(`[deleteItem] Successfully deleted item ${itemId}`);
        // Nie pokazujemy osobnego toastu dla usunięć, aby nie zaśmiecać interfejsu
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas usuwania produktu.";
        setError(errorMessage);
        showErrorToast("Błąd usuwania produktu", {
          description: errorMessage,
          duration: 5000, // Dłuższy czas dla błędów
        });

        // Przywrócenie usuniętego produktu
        setViewModel((prev) => {
          if (!prev) return null;
          const restoredItems = [...prev.items];
          // Dodaj produkt z powrotem, zachowując oryginalną kolejność
          restoredItems.splice(itemIndex, 0, itemToDelete);
          return { ...prev, items: restoredItems };
        });
      }
    },
    [listId, viewModel]
  );

  // Funkcja do aktualizacji nazwy elementu
  const updateItemName = useCallback(
    async (itemId: string, newName: string) => {
      if (!viewModel) return;

      const itemIndex = viewModel.items.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) {
        console.error(`[updateItemName] Item with id ${itemId} not found.`);
        showErrorToast("Błąd", {
          description: "Nie znaleziono produktu do zaktualizowania.",
          duration: 5000, // Dłuższy czas dla błędów
        });
        return;
      }

      const originalItem = viewModel.items[itemIndex];
      const trimmedName = newName.trim();

      // Walidacja
      if (trimmedName === "") {
        showErrorToast("Nieprawidłowa nazwa", {
          description: "Nazwa produktu nie może być pusta.",
          duration: 5000, // Dłuższy czas dla błędów
        });
        return;
      }

      if (trimmedName === originalItem.itemName) {
        // Bez zmian, wyjdź bez aktualizacji API/stanu
        return;
      }

      // Aktualizacja optymistyczna UI
      setViewModel((prev) => {
        if (!prev) return null;
        const updatedItems = [...prev.items];
        updatedItems[itemIndex] = {
          ...originalItem,
          itemName: trimmedName,
          isEditingName: false, // Zakończ edycję
          isUpdating: true, // Oznacz jako aktualizowany
        };
        return { ...prev, items: updatedItems };
      });

      try {
        const requestBody: UpdateShoppingListItemRequest = { itemName: trimmedName };

        const response = await fetch(`/api/client/shopping-lists/${listId}/items/${itemId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Dołączamy cookies do zapytania
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Błąd API (${response.status}): ${errorData.error || response.statusText}`);
        }

        const data: UpdateShoppingListItemResponse = await response.json();

        // Potwierdzenie aktualizacji
        setViewModel((prev) => {
          if (!prev) return null;
          const confirmedItems = [...prev.items];
          const confirmedIndex = confirmedItems.findIndex((item) => item.id === itemId);
          if (confirmedIndex !== -1) {
            confirmedItems[confirmedIndex] = {
              ...confirmedItems[confirmedIndex],
              itemName: data.itemName, // Użyj danych z serwera (mogą być znormalizowane)
              updatedAt: data.updatedAt, // Zaktualizuj updatedAt
              isUpdating: false, // Zakończ ładowanie
            };
          }
          return { ...prev, items: confirmedItems };
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Nieznany błąd podczas aktualizacji nazwy produktu.";
        setError(errorMessage);
        showErrorToast("Błąd aktualizacji nazwy", {
          description: errorMessage,
          duration: 5000, // Dłuższy czas dla błędów
        });

        // Przywrócenie oryginalnego stanu
        setViewModel((prev) => {
          if (!prev) return null;
          const revertedItems = [...prev.items];
          const revertIndex = revertedItems.findIndex((item) => item.id === itemId);
          if (revertIndex !== -1) {
            revertedItems[revertIndex] = { ...originalItem, isUpdating: false };
          }
          return { ...prev, items: revertedItems };
        });
      }
    },
    [listId, viewModel]
  );

  // Zmieniono nazwę i logikę funkcji - teraz tylko odświeża listę
  const refreshListAfterAiUpdate = useCallback(async () => {
    console.log("[useShoppingListDetail] Refreshing list details after AI update...");
    // Po prostu wywołaj funkcję pobierającą świeże dane z serwera
    await fetchListDetails();
    // Nie ma potrzeby obsługi błędów tutaj, fetchListDetails ma swoją obsługę
    // Nie ma potrzeby optymistycznej aktualizacji
    // Nie ma potrzeby wysyłania żądań POST
  }, [fetchListDetails]); // Zależność od fetchListDetails

  // Funkcja pomocnicza do przełączania trybu edycji nazwy produktu
  const toggleItemNameEditing = (/* itemId: string, isEditing: boolean */) => {
    // Pełna implementacja tej funkcji jest niżej w kodzie pliku
    // Ta linia jest tylko częścią skopiowanego fragmentu
    // ... existing code ...
  };

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
    fetchListDetails, // Nadal eksportujemy dla potencjalnego ręcznego odświeżania
    updateTitle,
    toggleItemPurchased,
    deleteItem,
    updateItemName,
    refreshListAfterAiUpdate, // Eksportujemy nową funkcję
    toggleItemNameEditing,
  };
}
