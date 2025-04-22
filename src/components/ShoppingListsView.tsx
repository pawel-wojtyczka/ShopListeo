import { useShoppingLists } from "../lib/hooks/useShoppingLists";
import { PageHeader } from "./ui/PageHeader";
import { CreateListButton } from "./shopping-lists/CreateListButton";
import { ShoppingLists } from "./shopping-lists/ShoppingLists";
import type { ShoppingListSummaryDTO, PaginationResponse } from "@/types"; // Import types
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"; // Import Alert components
import { Terminal } from "lucide-react"; // Import icon
import { useState } from "react";

// Define props for the component
interface ShoppingListsViewProps {
  initialLists: ShoppingListSummaryDTO[];
  initialPagination: PaginationResponse | null;
  fetchError: string | null;
}

export default function ShoppingListsView({ initialLists, initialPagination, fetchError }: ShoppingListsViewProps) {
  // State do kontrolowania komunikatu o przekierowaniu
  const [isRedirecting, setIsRedirecting] = useState(false);
  // Initialize hook *without* arguments - hook will use props internally
  const { lists, isLoading, error, createList, deleteList } = useShoppingLists({
    initialLists,
    initialPagination,
    fetchError,
  });

  // Function to create a new list and redirect
  const handleCreateList = async () => {
    const newListId = await createList();
    if (newListId) {
      // Pokazujemy komunikat o przekierowaniu
      setIsRedirecting(true);

      // Dodajemy małe opóźnienie przed przekierowaniem, aby dać czas
      // na prawidłowe ustawienie sesji
      setTimeout(() => {
        window.location.href = `/shopping-lists/${newListId}`;
      }, 300); // 300ms powinno być wystarczające
    }
  };

  // Function to delete a list
  const handleDeleteList = async (listId: string) => {
    await deleteList(listId);
  };

  // Jeśli trwa przekierowanie, pokaż komunikat
  if (isRedirecting) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-lg">Tworzenie nowej listy zakupów...</p>
          <p className="text-sm text-muted-foreground mt-2">Za chwilę nastąpi przekierowanie</p>
        </div>
      </div>
    );
  }

  // Use the error state derived from initial fetch or subsequent client errors
  const displayError = error;
  if (displayError && !isLoading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center">
        <Alert variant="destructive" className="w-full max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Błąd</AlertTitle>
          <AlertDescription>Wystąpił błąd podczas ładowania list zakupów: {displayError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <PageHeader title="Twoje Listy Zakupów" />
        <CreateListButton onCreateList={handleCreateList} isCreating={isLoading || isRedirecting} />
      </div>
      <ShoppingLists lists={lists} isLoading={isLoading} onDeleteList={handleDeleteList} />
    </div>
  );
}
