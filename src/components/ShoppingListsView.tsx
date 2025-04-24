import { useShoppingLists } from "../lib/hooks/useShoppingLists";
import { PageHeader } from "./ui/PageHeader";
import { CreateListButton } from "./shopping-lists/CreateListButton";
import { ShoppingLists } from "./shopping-lists/ShoppingLists";
import type { ShoppingListSummaryDTO, PaginationResponse } from "@/types"; // Import types
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"; // Import Alert components
import { Terminal } from "lucide-react"; // Import icon

// Define props for the component
interface ShoppingListsViewProps {
  initialLists: ShoppingListSummaryDTO[];
  initialPagination: PaginationResponse | null;
  fetchError: string | null;
}

export default function ShoppingListsView({ initialLists, initialPagination, fetchError }: ShoppingListsViewProps) {
  // Initialize hook *without* arguments - hook will use props internally
  const { lists, isLoading, error, createList, deleteList, isCreating } = useShoppingLists({
    initialLists,
    initialPagination,
    fetchError,
  });

  // Function to create a new list (bez przekierowania)
  const handleCreateList = async () => {
    await createList(); // Wywołaj createList, hook odświeży dane
  };

  // Function to delete a list
  const handleDeleteList = async (listId: string) => {
    await deleteList(listId);
  };

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
        <CreateListButton onCreateList={handleCreateList} isCreating={isCreating} />
      </div>
      <ShoppingLists lists={lists} isLoading={isLoading} onDeleteList={handleDeleteList} />
    </div>
  );
}
