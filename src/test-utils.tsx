import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import userEvent from "@testing-library/user-event";

// Wrapper dla testów - można tu dodać dostawców kontekstu, jeśli są potrzebne
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Zastępujemy standardową funkcję render z React Testing Library
function customRender(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, {
    // Opakowujemy w TestWrapper
    wrapper: TestWrapper,
    // Można przekazać dodatkowe opcje
    ...options,
  });
}

// Funkcja pomocnicza do ustawienia userEvent
function setup(jsx: ReactElement) {
  return {
    user: userEvent.setup(),
    ...customRender(jsx),
  };
}

// Reeksportujemy wszystko z RTL
export * from "@testing-library/react";

// Eksportujemy nasze własne funkcje
export { customRender as render, setup, userEvent };
