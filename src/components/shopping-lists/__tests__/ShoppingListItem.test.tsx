import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen } from "../../../lib/test-utils";
import userEvent from "@testing-library/user-event";
import { ShoppingListItem } from "../ShoppingListItem";

// Usunięto mock dla ui/button
// Usunięto mock dla ui/alert-dialog
// Dodajemy z powrotem mock dla ui/card
vi.mock("../ui/card", () => ({
  // Mockujemy Card jako prosty div
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="mock-card">
      {children}
    </div>
  ),
  // Mockujemy pozostałe eksporty Card jako proste divy, aby uniknąć błędów
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="mock-card-header">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="mock-card-content">
      {children}
    </div>
  ),
  CardFooter: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="mock-card-footer">
      {children}
    </div>
  ),
}));

// Mock dla ikon lucide-react
vi.mock("lucide-react", async (importOriginal) => {
  // Wczytujemy oryginalny moduł, aby zachować inne potencjalne exporty
  const original = await importOriginal<typeof import("lucide-react")>();
  return {
    ...original,
    // Zastępujemy tylko używane ikony prostymi elementami
    Trash2Icon: () => <span data-testid="mock-trash-icon">Trash</span>,
    ShoppingBagIcon: () => <span data-testid="mock-bag-icon">Bag</span>,
  };
});

describe("ShoppingListItem", () => {
  const mockList = {
    id: "test-id-1",
    title: "Test Lista Zakupów",
    createdAt: "2023-01-01T12:00:00Z",
    updatedAt: "2023-01-01T14:00:00Z",
    itemCount: 5,
    isDeleting: false,
  };

  const mockOnDeleteList = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("powinien renderować bez błędów", () => {
    expect(() => {
      renderWithProviders(<ShoppingListItem list={mockList} onDeleteList={mockOnDeleteList} />);
    }).not.toThrow();
    expect(screen.getByText("Test Lista Zakupów")).toBeInTheDocument();
  });

  it("powinien wyświetlać sformatowaną datę utworzenia", () => {
    renderWithProviders(<ShoppingListItem list={mockList} onDeleteList={mockOnDeleteList} />);
    const dateRegex = /\d+ \w+ \d{4}/;
    const dateElement = screen.getByText(/Utworzono:/i);
    expect(dateElement.textContent).toMatch(dateRegex);
  });

  it("powinien mieć nieaktywny przycisk usuwania gdy lista jest w trakcie usuwania", () => {
    const deletingList = { ...mockList, isDeleting: true };
    renderWithProviders(<ShoppingListItem list={deletingList} onDeleteList={mockOnDeleteList} />);
    const deleteButton = screen.getByRole("button", { name: /usuń/i });
    expect(deleteButton).toBeDisabled();
  });

  it("powinien wywołać funkcję onDeleteList po potwierdzeniu usunięcia", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ShoppingListItem list={mockList} onDeleteList={mockOnDeleteList} />);
    const deleteButton = screen.getByRole("button", { name: /usuń/i });
    await user.click(deleteButton);
    const confirmButton = await screen.findByRole("button", { name: /usuń/i });
    await user.click(confirmButton);
    expect(mockOnDeleteList).toHaveBeenCalledWith("test-id-1");
  });

  it("nie powinien wywołać funkcji onDeleteList po anulowaniu usunięcia", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ShoppingListItem list={mockList} onDeleteList={mockOnDeleteList} />);
    const deleteButton = screen.getByRole("button", { name: /usuń/i });
    await user.click(deleteButton);
    const cancelButton = await screen.findByRole("button", { name: /anuluj/i });
    await user.click(cancelButton);
    expect(mockOnDeleteList).not.toHaveBeenCalled();
  });

  it("powinien mieć przezroczystość obniżoną gdy lista jest w trakcie usuwania", () => {
    const deletingList = { ...mockList, isDeleting: true };
    renderWithProviders(<ShoppingListItem list={deletingList} onDeleteList={mockOnDeleteList} />);
    const titleElement = screen.getByText(deletingList.title);
    const cardElement = titleElement.closest('div[class*="card"]');
    expect(cardElement).toBeInTheDocument();
    expect(cardElement).toHaveClass("opacity-50");
  });
});
