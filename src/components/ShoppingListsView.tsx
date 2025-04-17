import { useShoppingLists } from "../lib/hooks/useShoppingLists";
import { PageHeader } from "./ui/PageHeader";
import { CreateListButton } from "./shopping-lists/CreateListButton";
import { ShoppingLists } from "./shopping-lists/ShoppingLists";

export default function ShoppingListsView() {
  // Używamy custom hooka do zarządzania stanem i wywołań API
  const { lists, isLoading, error, createList, deleteList } = useShoppingLists();

  // Funkcja do tworzenia nowej listy i przekierowania
  const handleCreateList = async () => {
    const newListId = await createList();
    if (newListId) {
      // Przekierowanie do szczegółów nowej listy
      window.location.href = `/shopping-lists/${newListId}`;
    }
  };

  // Funkcja do usuwania listy
  const handleDeleteList = async (listId: string) => {
    await deleteList(listId);
  };

  // Jeśli wystąpił błąd podczas ładowania list
  if (error && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="text-destructive text-lg font-medium mb-2">Wystąpił błąd podczas ładowania list zakupów</div>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Twoje Listy Zakupów" />
        <CreateListButton onCreateList={handleCreateList} isCreating={isLoading} />
      </div>

      <ShoppingLists lists={lists} isLoading={isLoading} onDeleteList={handleDeleteList} />
    </div>
  );
}
