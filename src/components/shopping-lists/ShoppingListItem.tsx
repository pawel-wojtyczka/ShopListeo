import { Button } from "../ui/button";
import { Trash2Icon, ShoppingBagIcon } from "lucide-react";
import { useState, useCallback, memo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import type { ShoppingListSummaryDTO } from "../../types";

interface ShoppingListItemViewModel extends ShoppingListSummaryDTO {
  isDeleting: boolean;
}

interface ShoppingListItemProps {
  list: ShoppingListItemViewModel;
  onDeleteList: (listId: string) => Promise<void>;
}

// Używamy memo zgodnie z wytycznymi (react.mdc)
export const ShoppingListItem = memo(function ShoppingListItem({ list, onDeleteList }: ShoppingListItemProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Formatowanie daty utworzenia
  const formattedDate = new Date(list.createdAt).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Handler do usuwania listy
  const handleDelete = useCallback(async () => {
    await onDeleteList(list.id);
    setIsConfirmOpen(false);
  }, [list.id, onDeleteList]);

  return (
    <Card className={`transition-opacity ${list.isDeleting ? "opacity-50" : ""} hover:shadow-md dark:hover:bg-muted/5`}>
      <CardHeader className="pb-2 flex sm:flex-row flex-col justify-between items-start gap-2">
        <div className="flex items-center gap-2">
          <ShoppingBagIcon className="h-5 w-5 text-primary" />
          <a href={`/shopping-lists/${list.id}`} className="text-xl font-medium hover:underline">
            {list.title}
          </a>
        </div>
        <div className="text-sm text-muted-foreground">Utworzono: {formattedDate}</div>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex justify-between items-center">
          <div className="text-sm mt-1">
            Liczba elementów: <span className="font-medium">{list.itemCount}</span>
          </div>
          <div className="hidden sm:block">
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex items-center gap-1" disabled={list.isDeleting}>
                  <Trash2Icon className="h-4 w-4" />
                  <span>Usuń</span>
                  {list.isDeleting && (
                    <span className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  )}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Czy na pewno chcesz usunąć tę listę?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Lista &quot;{list.title}&quot; zostanie usunięta wraz ze wszystkimi elementami. Tej operacji nie
                    można cofnąć.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anuluj</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Usuń</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2 flex justify-end sm:hidden">
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="flex items-center gap-1" disabled={list.isDeleting}>
              <Trash2Icon className="h-4 w-4" />
              <span>Usuń</span>
              {list.isDeleting && (
                <span className="ml-1 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Czy na pewno chcesz usunąć tę listę?</AlertDialogTitle>
              <AlertDialogDescription>
                Lista &quot;{list.title}&quot; zostanie usunięta wraz ze wszystkimi elementami. Tej operacji nie można
                cofnąć.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Anuluj</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Usuń</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
});
