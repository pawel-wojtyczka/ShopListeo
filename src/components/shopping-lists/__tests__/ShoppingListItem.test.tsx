import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderWithProviders, screen } from "../../../lib/test-utils";
import userEvent from "@testing-library/user-event";
import { ShoppingListItem } from "../ShoppingListItem";

// Mock dla komponentów Shadcn
// @ts-expect-error - ignorujemy błędy typów w mockach testowych
vi.mock("../../../components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className }) => (
    <button onClick={onClick} disabled={disabled} className={className} data-testid="mock-button">
      {children}
    </button>
  ),
}));

// @ts-expect-error - ignorujemy błędy typów w mockach testowych
vi.mock("../../../components/ui/alert-dialog", () => ({
  AlertDialog: ({ children, open, onOpenChange }) => (
    <div data-testid="mock-alert-dialog" data-open={open}>
      {children}
      <button data-testid="mock-open-change-button" onClick={() => onOpenChange(!open)}>
        Toggle Dialog
      </button>
    </div>
  ),
  AlertDialogTrigger: ({ children, asChild }) => (
    <div data-testid="mock-alert-dialog-trigger" data-as-child={asChild}>
      {children}
    </div>
  ),
  AlertDialogContent: ({ children }) => <div data-testid="mock-alert-dialog-content">{children}</div>,
  AlertDialogHeader: ({ children }) => <div data-testid="mock-alert-dialog-header">{children}</div>,
  AlertDialogFooter: ({ children }) => <div data-testid="mock-alert-dialog-footer">{children}</div>,
  AlertDialogTitle: ({ children }) => <div data-testid="mock-alert-dialog-title">{children}</div>,
  AlertDialogDescription: ({ children }) => <div data-testid="mock-alert-dialog-description">{children}</div>,
  AlertDialogAction: ({ children, onClick }) => (
    <button data-testid="mock-alert-dialog-action" onClick={onClick}>
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children }) => <button data-testid="mock-alert-dialog-cancel">{children}</button>,
}));

// @ts-expect-error - ignorujemy błędy typów w mockach testowych
vi.mock("../../../components/ui/card", () => ({
  Card: ({ children, className }) => (
    <div data-testid="mock-card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }) => (
    <div data-testid="mock-card-header" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }) => (
    <div data-testid="mock-card-content" className={className}>
      {children}
    </div>
  ),
  CardFooter: ({ children, className }) => (
    <div data-testid="mock-card-footer" className={className}>
      {children}
    </div>
  ),
}));

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

  it("powinien renderować prawidłowo z przekazanymi propsami", () => {
    renderWithProviders(<ShoppingListItem list={mockList} onDeleteList={mockOnDeleteList} />);

    // Sprawdzamy, czy tytuł listy jest wyświetlany
    expect(screen.getByText("Test Lista Zakupów")).toBeInTheDocument();

    // Sprawdzamy, czy link do szczegółów listy ma prawidłowy href
    const linkElement = screen.getByText("Test Lista Zakupów").closest("a");
    expect(linkElement).toHaveAttribute("href", "/shopping-lists/test-id-1");

    // Sprawdzamy, czy liczba elementów jest wyświetlana
    expect(screen.getByText(/Liczba elementów:/i)).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    // Sprawdzamy, czy przycisk usuwania jest wyświetlany
    expect(screen.getByText("Usuń")).toBeInTheDocument();
  });

  it("powinien wyświetlać sformatowaną datę utworzenia", () => {
    renderWithProviders(<ShoppingListItem list={mockList} onDeleteList={mockOnDeleteList} />);

    // Data powinna być sformatowana zgodnie z formatem z komponentu
    // Przykład: "1 stycznia 2023"
    const dateRegex = /\d+ \w+ \d{4}/;
    const dateElement = screen.getByText(/Utworzono:/i);
    expect(dateElement.textContent).toMatch(dateRegex);
  });

  it("powinien mieć nieaktywny przycisk usuwania gdy lista jest w trakcie usuwania", () => {
    const deletingList = { ...mockList, isDeleting: true };
    renderWithProviders(<ShoppingListItem list={deletingList} onDeleteList={mockOnDeleteList} />);

    // Przycisk powinien być nieaktywny
    const deleteButton = screen.getByTestId("mock-button");
    expect(deleteButton).toBeDisabled();
  });

  it("powinien wywołać funkcję onDeleteList po potwierdzeniu usunięcia", async () => {
    renderWithProviders(<ShoppingListItem list={mockList} onDeleteList={mockOnDeleteList} />);

    // Otwieramy dialog potwierdzenia
    const deleteButton = screen.getByText("Usuń");
    await userEvent.click(deleteButton);

    // Klikamy przycisk potwierdzający usunięcie
    const confirmButton = screen.getByTestId("mock-alert-dialog-action");
    await userEvent.click(confirmButton);

    // Sprawdzamy, czy funkcja onDeleteList została wywołana z odpowiednim ID
    expect(mockOnDeleteList).toHaveBeenCalledWith("test-id-1");
  });

  it("nie powinien wywołać funkcji onDeleteList po anulowaniu usunięcia", async () => {
    renderWithProviders(<ShoppingListItem list={mockList} onDeleteList={mockOnDeleteList} />);

    // Otwieramy dialog potwierdzenia
    const deleteButton = screen.getByText("Usuń");
    await userEvent.click(deleteButton);

    // Klikamy przycisk anulowania
    const cancelButton = screen.getByTestId("mock-alert-dialog-cancel");
    await userEvent.click(cancelButton);

    // Sprawdzamy, czy funkcja onDeleteList nie została wywołana
    expect(mockOnDeleteList).not.toHaveBeenCalled();
  });

  it("powinien mieć przezroczystość obniżoną gdy lista jest w trakcie usuwania", () => {
    const deletingList = { ...mockList, isDeleting: true };
    renderWithProviders(<ShoppingListItem list={deletingList} onDeleteList={mockOnDeleteList} />);

    // Sprawdzamy, czy klasa opacity-50 jest dodana do karty
    const card = screen.getByTestId("mock-card");
    expect(card.className).toContain("opacity-50");
  });
});
