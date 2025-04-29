import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { showErrorToast, showSuccessToast } from "@/lib/services/toast-service";

interface ProductInputAreaProps {
  listId: string;
  onAddItems: (items: { name: string; purchased: boolean }[]) => Promise<void>;
}

interface Product {
  name: string;
  purchased: boolean;
}

const ProductInputArea: React.FC<ProductInputAreaProps> = ({ listId, onAddItems }) => {
  const [textareaValue, setTextareaValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(event.target.value);
  };

  const handleAddClick = async () => {
    const trimmedValue = textareaValue.trim();
    if (!trimmedValue) return;

    setIsAdding(true);

    try {
      const text = trimmedValue;
      if (!text) {
        showErrorToast("Input is empty", { description: "Please enter some text to parse." });
        return;
      }

      // Use the new, simplified API endpoint
      const response = await fetch(`/api/shopping-lists/${listId}/ai-parse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Send cookies for authentication
        body: JSON.stringify({ text }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || "Failed to process text with AI");
      }

      // Przetwarzanie produktów z uwzględnieniem statusu purchased
      const products: Product[] = responseData.products.map((product: Product) => ({
        name: product.name,
        purchased: product.purchased || false,
      }));

      // Add products to the list
      await onAddItems(products);

      // Powiadomienie o pomyślnej operacji
      showSuccessToast("Lista zaktualizowana", {
        description: `Zaktualizowano listę zakupów o ${products.length} ${
          products.length === 1 ? "produkt" : products.length < 5 ? "produkty" : "produktów"
        }`,
      });

      setTextareaValue("");

      // Usunięto odświeżenie widoku poprzez przeładowanie strony
      // window.location.href = `${window.location.pathname}?_t=${Date.now()}`;
    } catch (error) {
      showErrorToast("Błąd podczas przetwarzania tekstu", {
        description: error instanceof Error ? error.message : "Nieznany błąd podczas przetwarzania tekstu",
      });
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
        {isAdding ? "Przetwarzanie..." : "Dodaj produkty"}
      </Button>
    </div>
  );
};

export default ProductInputArea;
