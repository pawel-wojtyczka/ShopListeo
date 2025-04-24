import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render as rtlRender, screen, fireEvent, type RenderOptions } from "@testing-library/react";
import { Example } from "./Example";
import type { ReactElement } from "react";

// Wrapper dla testów - zamiast importować z test-utils
function render(ui: ReactElement, options: Omit<RenderOptions, "wrapper"> = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => <>{children}</>,
    ...options,
  });
}

// Grupa testów dla komponentu Example
describe("Example Component", () => {
  // Test dla sprawdzenia, czy komponent renderuje się poprawnie
  it("should render the component with default text", () => {
    // Renderowanie komponentu
    render(<Example />);

    // Sprawdzenie, czy tekst jest widoczny
    expect(screen.getByText("Example Component")).toBeInTheDocument();
  });

  // Test dla sprawdzenia, czy przycisk działa poprawnie
  it("should increment counter when button is clicked", () => {
    // Renderowanie komponentu
    render(<Example />);

    // Znalezienie przycisku
    const button = screen.getByRole("button", { name: /increment/i });

    // Sprawdzenie początkowej wartości licznika
    expect(screen.getByText("Count: 0")).toBeInTheDocument();

    // Kliknięcie przycisku
    fireEvent.click(button);

    // Sprawdzenie, czy licznik zwiększył się
    expect(screen.getByText("Count: 1")).toBeInTheDocument();
  });

  // Test z mockiem funkcji
  it("should call onIncrement prop when button is clicked", () => {
    // Przygotowanie mocka
    const handleIncrement = vi.fn();

    // Renderowanie komponentu z właściwością onIncrement
    render(<Example onIncrement={handleIncrement} />);

    // Znalezienie przycisku
    const button = screen.getByRole("button", { name: /increment/i });

    // Kliknięcie przycisku
    fireEvent.click(button);

    // Sprawdzenie, czy mock został wywołany
    expect(handleIncrement).toHaveBeenCalledTimes(1);
  });
});
