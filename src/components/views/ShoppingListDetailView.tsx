import * as React from "react";
// Usunięto nieużywane importy useState i useEffect
// Importuj hooka
import { useShoppingListDetail } from "@/lib/hooks/useShoppingListDetail";
import EditableShoppingListTitle from "@/components/shared/EditableShoppingListTitle"; // Importuj nowy komponent
import ProductList from "@/components/features/shopping-list/ProductList"; // Importuj ProductList
import ProductInputArea from "@/components/features/shopping-list/ProductInputArea"; // Importuj ProductInputArea
import { Loader2 } from "lucide-react"; // Ikona ładowania
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ShoppingListDetailViewProps {
  listId: string;
}

const ShoppingListDetailView: React.FC<ShoppingListDetailViewProps> = ({ listId }) => {
  // Użyj hooka do zarządzania stanem
  const {
    title, // Używamy bezpośrednio title
    items, // Używamy bezpośrednio items
    isLoading,
    error,
    updateTitle,
    toggleItemPurchased,
    deleteItem,
    updateItemName,
    refreshListAfterAiUpdate, // Pobierz nową funkcję
  } = useShoppingListDetail(listId);

  // Obsługa stanu ładowania
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Ładowanie szczegółów listy zakupów...</p>
        <p className="text-sm text-muted-foreground mt-2">Prosimy o cierpliwość, trwa pobieranie danych...</p>
      </div>
    );
  }

  // Obsługa błędów - unikamy pokazywania błędów autoryzacji, ponieważ są one obsługiwane
  // przez mechanizm automatycznych ponownych prób w hooku
  if (error) {
    // Ignorujemy tymczasowe błędy uwierzytelniania
    const isAuthError = error.includes("zalogowany") || error.includes("401") || error.includes("authentication");

    // Dla błędów uwierzytelniania pokazujemy przyjazny komunikat o ładowaniu zamiast błędu
    if (isAuthError) {
      return (
        <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-lg">Inicjowanie sesji...</p>
        </div>
      );
    }

    // Dla innych błędów pokazujemy faktyczny komunikat
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-destructive/10 p-6 rounded-lg border border-destructive/20 max-w-lg w-full">
          <h2 className="text-lg font-semibold text-destructive mb-2">Wystąpił błąd</h2>
          <p className="text-sm text-destructive/90">{error}</p>
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

  // Obsługa sytuacji, gdy lista jest pusta (brak tytułu i elementów)
  if (title === null && items === null) {
    // Sprawdzamy, czy oba są null (początkowy stan lub błąd)
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-lg">Lista zakupów jest pusta lub wystąpił błąd ładowania.</p>
        <Button variant="ghost" size="icon" onClick={() => (window.location.href = "/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-4">Szczegóły Listy Zakupów</h1>

      {/* Użyj komponentu EditableShoppingListTitle - używamy title */}
      <div className="mb-6">
        <EditableShoppingListTitle initialTitle={title ?? "Nowa lista"} listId={listId} onUpdateTitle={updateTitle} />
      </div>

      {/* Obszar dodawania produktów - Zmieniono prop onAddItems */}
      <ProductInputArea listId={listId} onAddItems={refreshListAfterAiUpdate} />

      {/* Lista produktów - używamy items */}
      <div>
        <h3 className="text-lg font-medium mb-2">Produkty</h3>
        <ProductList
          items={items ?? []} // Użyj pustej tablicy, jeśli items jest null
          listId={listId}
          onTogglePurchase={toggleItemPurchased}
          onDeleteItem={deleteItem}
          onUpdateName={updateItemName}
        />
      </div>
    </div>
  );
};

export default ShoppingListDetailView;
