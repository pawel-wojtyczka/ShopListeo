import React, { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react"; // Ikona kosza
import type { ProductItemViewModel } from "@/lib/hooks/useShoppingListDetail";

interface ProductItemProps {
  item: ProductItemViewModel;
  _listId: string; // Potrzebne dla API
  // Funkcje obsługi zdarzeń z hooka
  onTogglePurchase: (itemId: string) => Promise<void>;
  onUpdateName: (itemId: string, newName: string) => Promise<void>;
  onDeleteItem: (itemId: string) => Promise<void>;
}

const ProductItem: React.FC<ProductItemProps> = ({ item, _listId, onTogglePurchase, onUpdateName, onDeleteItem }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [currentName, setCurrentName] = useState(item.itemName);

  // Aktualizuj stan wewnętrzny nazwy, jeśli zmieni się z zewnątrz
  useEffect(() => {
    setCurrentName(item.itemName);
  }, [item.itemName]);

  // --- Obsługa edycji nazwy ---
  const handleNameClick = () => {
    if (item.purchased) return; // Nie edytuj zakupionych
    setIsEditingName(true);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentName(event.target.value);
  };

  const handleNameBlur = async () => {
    setIsEditingName(false);
    const trimmedName = currentName.trim();
    if (trimmedName && trimmedName !== item.itemName) {
      // TODO: Dodać walidację długości (1-128)
      try {
        await onUpdateName(item.id, trimmedName);
        // Stan lokalny zostanie zaktualizowany przez useEffect, gdy prop `item.itemName` się zmieni
      } catch (_error) {
        setCurrentName(item.itemName); // Przywróć starą nazwę w razie błędu
      }
    } else {
      // Jeśli bez zmian lub pusty, przywróć oryginał
      setCurrentName(item.itemName);
    }
  };

  const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleNameBlur();
    } else if (event.key === "Escape") {
      setCurrentName(item.itemName);
      setIsEditingName(false);
    }
  };

  // --- Obsługa Checkboxa ---
  const handleCheckboxChange = async () => {
    try {
      await onTogglePurchase(item.id);
    } catch (_error) {
      // Stan UI zostanie przywrócony przez hook w razie błędu (optymistyczne UI)
    }
  };

  // --- Obsługa usuwania ---
  const handleDeleteClick = async () => {
    // TODO: Dodać potwierdzenie usunięcia?
    try {
      await onDeleteItem(item.id);
    } catch (_error) {
      // Stan UI zostanie obsłużony przez hook (optymistyczne UI)
    }
  };

  return (
    <div
      className={`flex items-center space-x-2 p-2 border rounded-md transition-colors ${
        item.purchased ? "bg-muted/50 text-muted-foreground" : "bg-card"
      } ${
        item.isUpdating ? "opacity-50 pointer-events-none" : "" // Wskaźnik ładowania
      }`}
    >
      <Checkbox
        id={`item-${item.id}`}
        checked={item.purchased}
        onCheckedChange={handleCheckboxChange}
        disabled={item.isUpdating || isEditingName} // Wyłącz podczas aktualizacji lub edycji nazwy
        aria-label={`Oznacz ${item.itemName} jako ${item.purchased ? "niekupiony" : "kupiony"}`}
      />
      <div className="flex-grow">
        {isEditingName ? (
          <Input
            type="text"
            value={currentName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className={`h-8 text-sm ${item.purchased ? "line-through" : ""}`}
            disabled={item.isUpdating}
          />
        ) : (
          <Button
            variant="link"
            onClick={handleNameClick}
            title={item.purchased ? item.itemName : "Kliknij lub użyj Enter/Spacji, aby edytować"}
            className={`text-sm h-auto p-0 font-normal text-left justify-start whitespace-normal ${item.purchased ? "line-through text-muted-foreground cursor-default" : "hover:bg-secondary/80 px-1 py-0.5 rounded-sm"}`}
            disabled={item.purchased || item.isUpdating}
          >
            {item.itemName}
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDeleteClick}
        disabled={item.isUpdating || isEditingName} // Wyłącz podczas aktualizacji lub edycji nazwy
        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        aria-label={`Usuń ${item.itemName}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProductItem;
