import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface ProductInputAreaProps {
  listId: string; // Potrzebne dla przyszłego API
  // Funkcja do obsługi dodawania elementów
  onAddItems: (itemNames: string[]) => Promise<void>;
  // TODO: Dodać prop isAdding do obsługi stanu ładowania?
}

const ProductInputArea: React.FC<ProductInputAreaProps> = ({ listId, onAddItems }) => {
  const [textareaValue, setTextareaValue] = useState("");
  const [isAdding, setIsAdding] = useState(false); // Stan ładowania dodawania

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(event.target.value);
  };

  const handleAddClick = async () => {
    const trimmedValue = textareaValue.trim();
    if (!trimmedValue) return; // Nie dodawaj pustych

    // Podziel na linie, usuń puste linie i białe znaki na początku/końcu
    const itemNames = trimmedValue
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (itemNames.length === 0) return; // Nic do dodania

    console.log(`[ProductInputArea] Próba dodania ${itemNames.length} elementów do listy ${listId}:`, itemNames);
    setIsAdding(true);

    try {
      await onAddItems(itemNames);
      setTextareaValue(""); // Wyczyść pole po pomyślnym dodaniu
    } catch (error) {
      console.error("[ProductInputArea] Błąd podczas wywoływania onAddItems:", error);
      // Błąd zostanie obsłużony i pokazany przez hook/toast service
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-card">
      <h3 className="text-lg font-medium mb-2">Dodaj nowe produkty</h3>
      <p className="text-sm text-muted-foreground mb-3">Powiedz co chcesz kupić przy najbliższych zakupach..</p>
      <Textarea
        placeholder="Napisz lub podyktuj Twoją listę zakupów, obojętnie jak.. nasz agent AI zajmie się resztą.. :-)"
        value={textareaValue}
        onChange={handleTextareaChange}
        className="mb-3 min-h-[80px]"
        disabled={isAdding}
      />
      <Button onClick={handleAddClick} disabled={!textareaValue.trim() || isAdding}>
        {isAdding ? "Dodawanie..." : "Dodaj produkty"}
      </Button>
    </div>
  );
};

export default ProductInputArea;
