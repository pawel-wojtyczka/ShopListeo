import React from "react";
// Importuj hooka
import { useShoppingListDetail } from "@/lib/hooks/useShoppingListDetail";
import EditableShoppingListTitle from "@/components/shared/EditableShoppingListTitle"; // Importuj nowy komponent
import ProductList from "@/components/features/shopping-list/ProductList"; // Importuj ProductList
import ProductInputArea from "@/components/features/shopping-list/ProductInputArea"; // Importuj ProductInputArea

interface ShoppingListDetailViewProps {
  listId: string;
}

const ShoppingListDetailView: React.FC<ShoppingListDetailViewProps> = ({ listId }) => {
  // Użyj hooka do zarządzania stanem
  const { title, items, isLoading, error, updateTitle, toggleItemPurchased, deleteItem, updateItemName, addItems } =
    useShoppingListDetail(listId);

  // Obsługa stanu ładowania
  if (isLoading) {
    // TODO: Zastąpić lepszym komponentem Skeleton/Spinner z Shadcn
    return <div className="container mx-auto p-4 text-center">Ładowanie danych listy...</div>;
  }

  // Obsługa błędów
  if (error) {
    // TODO: Ulepszyć wyświetlanie błędu
    return <div className="container mx-auto p-4 text-center text-red-600">Błąd: {error}</div>;
  }

  // TODO: Zaimplementować obsługę braku danych (opcjonalne, jeśli API może zwrócić null/pusty obiekt)
  // if (!title && !items.length) {
  //   return <div className="container mx-auto p-4 text-center">Nie znaleziono listy o podanym ID.</div>;
  // }

  return (
    <div className="container mx-auto p-4 flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-4">Szczegóły Listy Zakupów (ID: {listId})</h1>

      {/* Użyj komponentu EditableShoppingListTitle */}
      <div className="mb-6">
        <EditableShoppingListTitle initialTitle={title} listId={listId} onUpdateTitle={updateTitle} />
      </div>

      {/* Obszar dodawania produktów */}
      <ProductInputArea listId={listId} onAddItems={addItems} />

      {/* Lista produktów */}
      <div>
        <h3 className="text-lg font-medium mb-2">Produkty</h3>
        <ProductList
          items={items}
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
