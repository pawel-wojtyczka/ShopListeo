import React from "react";
import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";

interface WrapperProps {
  children: ReactNode;
}

// Wrapper do testów React zapewniający potrzebne konteksty
function TestWrapper({ children }: WrapperProps) {
  return <>{children}</>;
}

// Funkcja pomocnicza do renderowania komponentów w testach
function renderWithProviders(ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: TestWrapper, ...options });
}

// Re-eksportujemy wszystko z testing-library/react
export * from "@testing-library/react";
// Eksportujemy nasze funkcje pomocnicze
export { TestWrapper, renderWithProviders };
