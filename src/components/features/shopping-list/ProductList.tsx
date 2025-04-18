import React from "react";
// Importuj definicję typu ViewModel, jeśli nie jest globalna
import type { ProductItemViewModel } from "@/lib/hooks/useShoppingListDetail"; // Załóżmy, że typ jest eksportowany z hooka
import ProductItem from "./ProductItem"; // Importuj ProductItem

interface ProductListProps {
  items: ProductItemViewModel[];
  listId: string; // Będzie potrzebne do przekazania do ProductItem
  onTogglePurchase: (itemId: string) => Promise<void>; // Odbierz prawdziwą funkcję
  onUpdateName: (itemId: string, newName: string) => Promise<void>; // Odbierz prawdziwą funkcję
  onDeleteItem: (itemId: string) => Promise<void>; // Odbierz prawdziwą funkcję
}

const ProductList: React.FC<ProductListProps> = ({
  items,
  listId,
  onTogglePurchase, // Użyj przekazanej funkcji
  onUpdateName, // Użyj przekazanej funkcji
  onDeleteItem, // Użyj przekazanej funkcji
}) => {
  // Sortowanie: niezakupione najpierw, potem zakupione. W obrębie grup można dodać sortowanie np. po dacie dodania.
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.purchased === b.purchased) {
        // Jeśli oba mają ten sam status, sortuj np. po dacie dodania (jeśli dostępna i potrzebna)
        // return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return 0; // Na razie brak dodatkowego sortowania
      }
      return a.purchased ? 1 : -1; // purchased: true idą na koniec
    });
  }, [items]);

  if (!items || items.length === 0) {
    return <p className="text-muted-foreground italic">Ta lista jest pusta. Dodaj produkty poniżej.</p>;
  }

  return (
    <div className="space-y-2">
      {sortedItems.map((item) => (
        // Użyj komponentu ProductItem
        <ProductItem
          key={item.id}
          item={item}
          listId={listId} // Przekaż listId
          onTogglePurchase={onTogglePurchase} // Przekaż dalej
          onUpdateName={onUpdateName} // Przekaż dalej
          onDeleteItem={onDeleteItem} // Przekaż dalej
        />
      ))}
    </div>
  );
};

export default ProductList;
