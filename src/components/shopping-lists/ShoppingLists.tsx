import { ShoppingListItem } from "./ShoppingListItem";
import type { ShoppingListSummaryDTO } from "../../types";

interface ShoppingListItemViewModel extends ShoppingListSummaryDTO {
  isDeleting: boolean;
}

interface ShoppingListsProps {
  lists: ShoppingListItemViewModel[];
  isLoading: boolean;
  onDeleteList: (listId: string) => Promise<void>;
}

export function ShoppingLists({ lists, isLoading, onDeleteList }: ShoppingListsProps) {
  // Gdy dane są ładowane, wyświetl placeholdery
  if (isLoading && lists.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse p-4 border rounded-lg">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Gdy brak list po załadowaniu
  if (!isLoading && lists.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Nie masz jeszcze żadnych list zakupów.
          <br />
          Stwórz nową listę klikając przycisk &quot;+ Nowa lista&quot; powyżej.
        </p>
      </div>
    );
  }

  // Wyświetlenie list zakupów
  return (
    <div className="space-y-4">
      {lists.map((list) => (
        <ShoppingListItem key={list.id} list={list} onDeleteList={onDeleteList} />
      ))}
    </div>
  );
}
