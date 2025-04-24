import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
import { ShoppingListItem } from "../ShoppingListItem"; // Adjust path if needed
import type { ShoppingListSummaryDTO } from "../../../types";

// Extend the DTO for ViewModel used in the component
interface ShoppingListItemViewModel extends ShoppingListSummaryDTO {
  isDeleting: boolean;
}

// Define the expected shape of props for clarity
interface ShoppingListItemProps {
  list: ShoppingListItemViewModel;
  onDeleteList: (listId: string) => Promise<void>;
}

// Mock props factory - Add type for overrides
const createMockProps = (overrides: Partial<ShoppingListItemProps> = {}) => {
  const defaultList: ShoppingListItemViewModel = {
    id: "list-test-1",
    title: "Test Shopping List",
    itemCount: 5,
    createdAt: "2024-07-26T12:00:00Z",
    updatedAt: "2024-07-26T13:00:00Z",
    isDeleting: false,
  };
  return {
    // Now overrides.list is type-safe
    list: { ...defaultList, ...(overrides.list || {}) },
    onDeleteList: overrides.onDeleteList || vi.fn(),
    // Spread other potential overrides if the interface grows
  };
};

describe("ShoppingListItem Component", () => {
  let props: ReturnType<typeof createMockProps>;

  beforeEach(() => {
    props = createMockProps();
  });

  it("should render list title, item count, and formatted date correctly", () => {
    render(<ShoppingListItem {...props} />);

    // Check title (which is also a link)
    const titleLink = screen.getByRole("link", { name: props.list.title });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute("href", `/shopping-lists/${props.list.id}`);

    // Check item count
    expect(screen.getByText(`Liczba elementów: ${props.list.itemCount}`)).toBeInTheDocument();

    // Check formatted date (assuming locale is consistent or mocked)
    // Be slightly flexible with exact date format string due to potential environment differences
    expect(screen.getByText(/Utworzono: .*26 lipca 2024/i)).toBeInTheDocument(); // Check for day, month, year
  });

  it("should render the delete button", () => {
    render(<ShoppingListItem {...props} />);
    // Find the delete button (might appear multiple times due to responsive design)
    const deleteButtons = screen.getAllByRole("button", { name: /usuń/i });
    expect(deleteButtons.length).toBeGreaterThan(0);
    expect(deleteButtons[0]).toBeInTheDocument(); // Check at least one exists
  });

  // Add tests for delete confirmation dialog and isDeleting state later
});
