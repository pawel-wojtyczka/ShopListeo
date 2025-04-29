import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"; // Poprawiony import
import { Button } from "@/components/ui/button"; // Importuj Button

interface EditableShoppingListTitleProps {
  listId: string;
  initialTitle: string;
  onTitleUpdate: (newTitle: string) => Promise<void>; // Callback do aktualizacji
}

const EditableShoppingListTitle: React.FC<EditableShoppingListTitleProps> = ({
  listId: _listId, // Dodano prefiks `_`
  initialTitle,
  onTitleUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false); // Stan ładowania zapisu

  // Aktualizuj stan wewnętrzny, jeśli initialTitle zmieni się z zewnątrz
  useEffect(() => {
    setCurrentTitle(initialTitle);
  }, [initialTitle]);

  // Rozpocznij edycję po kliknięciu
  const handleTitleClick = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmedTitle = currentTitle.trim();

    // Podstawowa walidacja
    if (!trimmedTitle || trimmedTitle === initialTitle) {
      setIsEditing(false);
      setCurrentTitle(initialTitle); // Przywróć oryginał, jeśli pusty lub bez zmian
      return;
    }
    // TODO: Dodać lepszą obsługę błędów walidacji (np. komunikat)
    if (trimmedTitle.length > 255) {
      // Tutaj można by ustawić stan błędu i wyświetlić go
      return; // Nie zapisuj
    }

    setIsSaving(true);
    try {
      await onTitleUpdate(trimmedTitle);
      setIsEditing(false); // Wyłącz edycję po sukcesie
    } catch (_error) {
      // Dodano prefiks `_`
      // Obsługa błędu (np. toast) powinna być w komponencie nadrzędnym/hooku
      // Tutaj możemy cofnąć zmiany lokalne, jeśli chcemy
      setCurrentTitle(initialTitle);
      setIsEditing(false); // Kończymy edycję mimo błędu
    } finally {
      setIsSaving(false);
    }
  };

  // Zapisz zmiany po naciśnięciu Enter lub Spacji (dla przycisku)
  const handleBlur = () => {
    // Wywołaj zapis przy utracie fokusa
    handleSave();
  };

  // Zapisz zmiany po naciśnięciu Enter lub Spacji (dla przycisku)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave(); // Wywołaj zapis przy Enter
    } else if (event.key === "Escape") {
      setCurrentTitle(initialTitle);
      setIsEditing(false);
    }
  };

  // Aktualizuj wartość w inpucie podczas edycji
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTitle(event.target.value);
  };

  return (
    <div>
      {isEditing ? (
        <Input
          type="text"
          value={currentTitle}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={isSaving}
          className="text-xl font-semibold h-auto p-1"
          aria-busy={isSaving}
        />
      ) : (
        <Button
          variant="ghost"
          className="text-xl font-semibold cursor-pointer hover:bg-secondary/80 px-2 py-1 h-auto justify-start text-left whitespace-normal"
          onClick={handleTitleClick}
          title="Kliknij lub użyj Enter/Spacji, aby edytować tytuł"
          disabled={isSaving}
        >
          {currentTitle || "(Bez tytułu)"}
        </Button>
      )}
    </div>
  );
};

export default EditableShoppingListTitle;
