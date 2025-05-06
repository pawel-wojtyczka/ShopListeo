import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { useCallback } from "react";

interface CreateListButtonProps {
  onCreateList: () => Promise<void>;
  isCreating: boolean;
}

export function CreateListButton({ onCreateList, isCreating }: CreateListButtonProps) {
  // Używamy useCallback zgodnie z wytycznymi (react.mdc)
  const handleClick = useCallback(() => {
    onCreateList();
  }, [onCreateList]);

  return (
    <Button
      onClick={handleClick}
      disabled={isCreating}
      className="flex items-center gap-2"
      data-testid="new-list-button"
    >
      <PlusIcon className="h-4 w-4" />
      Nowa lista
      {isCreating && (
        <span className="ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
    </Button>
  );
}
