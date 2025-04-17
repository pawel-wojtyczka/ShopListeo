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
      <div className="text-center p-8 border rounded-lg bg-muted/10">
        <p className="text-lg font-medium mb-2">Brak list zakupów</p>
        <p className="text-muted-foreground">
          Kliknij przycisk "Nowa lista", aby utworzyć swoją pierwszą listę zakupów.
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
