import * as React from "react";
import { useState, useEffect } from "react"; // Dodano useState i useEffect
import { useShoppingListDetail } from "@/lib/hooks/useShoppingListDetail";
import EditableShoppingListTitle from "@/components/shared/EditableShoppingListTitle";
import ProductList from "@/components/features/shopping-list/ProductList";
import ProductInputArea from "@/components/features/shopping-list/ProductInputArea";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react"; // Dodano AlertTriangle
import { Button } from "@/components/ui/button";

interface ShoppingListDetailViewProps {
  listId?: string; // listId jest teraz opcjonalny
}

const ShoppingListDetailView: React.FC<ShoppingListDetailViewProps> = ({ listId: initialListId }) => {
  const [currentListId, setCurrentListId] = useState<string | undefined>(initialListId);
  const [idError, setIdError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialListId) {
      const pathParts = window.location.pathname.split("/");
      // Proste parsowanie: zakładamy, że ID jest ostatnim segmentem ścieżki /list/ID
      // W bardziej złożonej aplikacji użyj biblioteki do routingu.
      const idFromUrl =
        pathParts.length > 1 && pathParts[pathParts.length - 2] === "list"
          ? pathParts[pathParts.length - 1]
          : undefined;

      if (idFromUrl) {
        setCurrentListId(idFromUrl);
        setIdError(null);
      } else {
        setIdError("Nie można zidentyfikować ID listy z adresu URL.");
        setCurrentListId(undefined);
      }
    } else {
      setCurrentListId(initialListId);
      setIdError(null);
    }
  }, [initialListId]);

  // Użyj hooka do zarządzania stanem, tylko jeśli currentListId jest dostępne
  // Przekazujemy pusty string, jeśli currentListId jest undefined, hook musi to obsłużyć
  const {
    title,
    items,
    isLoading,
    error: hookError, // Zmieniono nazwę, aby uniknąć konfliktu
    updateTitle,
    toggleItemPurchased,
    deleteItem,
    updateItemName,
    refreshListAfterAiUpdate,
  } = useShoppingListDetail(currentListId ?? ""); // Hook musi obsłużyć puste ID

  const combinedError = idError || hookError;

  // Obsługa błędu ID (jeśli nie udało się pobrać ID z URL)
  if (idError && !currentListId) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-destructive/10 p-6 rounded-lg border border-destructive/20 max-w-lg w-full text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-destructive mb-2">Błąd ładowania listy</h2>
          <p className="text-sm text-destructive/90 mb-4">{idError}</p>
          <Button onClick={() => (window.location.href = "/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do listy list
          </Button>
        </div>
      </div>
    );
  }

  // Jeśli currentListId jest undefined, ale nie ma jeszcze idError (np. w trakcie useEffect)
  // lub hook jest wywoływany z pustym ID i to powoduje problem zanim hookError się ustawi.
  // Ten warunek można by ulepszyć w zależności od zachowania hooka z pustym ID.
  if (!currentListId && !isLoading && !combinedError) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Pobieranie ID listy...</p>
      </div>
    );
  }

  // Obsługa stanu ładowania z hooka
  if (isLoading && currentListId) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Ładowanie szczegółów listy zakupów...</p>
        <p className="text-sm text-muted-foreground mt-2">Prosimy o cierpliwość, trwa pobieranie danych...</p>
      </div>
    );
  }

  // Obsługa błędów z hooka
  if (combinedError && currentListId) {
    const isAuthError =
      combinedError.includes("zalogowany") || combinedError.includes("401") || combinedError.includes("authentication");
    if (isAuthError) {
      return (
        <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-lg">Inicjowanie sesji...</p>
        </div>
      );
    }
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-destructive/10 p-6 rounded-lg border border-destructive/20 max-w-lg w-full">
          <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
          <h2 className="text-lg font-semibold text-destructive mb-2">Wystąpił błąd</h2>
          <p className="text-sm text-destructive/90">{combinedError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Odśwież stronę
          </button>
        </div>
      </div>
    );
  }

  // Obsługa sytuacji, gdy lista jest pusta (brak tytułu i elementów) po załadowaniu
  if (currentListId && !isLoading && title === null && items === null && !combinedError) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-lg">Nie znaleziono listy zakupów o ID: {currentListId} lub jest ona pusta.</p>
        <Button onClick={() => (window.location.href = "/")} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do listy list
        </Button>
      </div>
    );
  }

  // Główny widok, jeśli wszystko jest OK i mamy ID
  if (!currentListId) {
    // Ten return nie powinien być osiągnięty, jeśli logika powyżej jest poprawna,
    // ale jako zabezpieczenie.
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-lg text-destructive">Nie udało się załadować ID listy.</p>
        <Button onClick={() => (window.location.href = "/")} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do listy list
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col gap-6">
      {/* Przycisk powrotu */}
      <Button variant="outline" size="sm" className="self-start" onClick={() => (window.location.href = "/")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do list
      </Button>

      <EditableShoppingListTitle
        initialTitle={title ?? "Nowa lista"}
        listId={currentListId}
        onTitleUpdate={updateTitle}
      />
      <ProductInputArea listId={currentListId} onAddItems={refreshListAfterAiUpdate} />
      <div>
        <h3 className="text-lg font-medium mb-2">Produkty</h3>
        <ProductList
          items={items ?? []}
          listId={currentListId}
          onTogglePurchase={toggleItemPurchased}
          onDeleteItem={deleteItem}
          onUpdateName={updateItemName}
        />
      </div>
    </div>
  );
};

export default ShoppingListDetailView;
