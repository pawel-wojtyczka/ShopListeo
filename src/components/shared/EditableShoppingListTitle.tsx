import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input"; // Poprawiony import
import { Button } from "@/components/ui/button"; // Importuj Button

interface EditableShoppingListTitleProps {
  initialTitle: string;
  listId: string; // Będzie potrzebne do wywołania API w przyszłości
  onUpdateTitle: (newTitle: string) => Promise<void>; // Odkomentowano i dodano typ
}

const EditableShoppingListTitle: React.FC<EditableShoppingListTitleProps> = ({
  initialTitle,
  listId,
  onUpdateTitle, // Odbierz prop
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
      console.error("Title too long");
      // Tutaj można by ustawić stan błędu i wyświetlić go
      return; // Nie zapisuj
    }

    setIsSaving(true);
    try {
      await onUpdateTitle(trimmedTitle);
      setIsEditing(false);
      // Stan `currentTitle` zostanie zaktualizowany przez `useEffect`, gdy `initialTitle` się zmieni
    } catch (error) {
      console.error("Failed to update title:", error);
      // Opcjonalnie: Pokaż błąd użytkownikowi
      // Wracamy do stanu edycji z niezmienioną wartością?
      // Albo przywracamy initialTitle?
      setCurrentTitle(initialTitle); // Na razie przywracamy oryginał
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
