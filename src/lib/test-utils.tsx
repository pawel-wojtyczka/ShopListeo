import React from "react";
import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { ThemeProvider } from "next-themes"; // Odkomentowano
import { AuthProvider } from "./auth/AuthContext"; // Odkomentowano i poprawiono ścieżkę
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip"; // Dodano TooltipProvider
// Zakomentowany TooltipProvider, bo nie znaleziono pliku tooltip.tsx
// import { TooltipProvider } from "@/components/ui/tooltip"; // Wymaga aliasu '@' lub poprawnej ścieżki

interface WrapperProps {
  children: ReactNode;
}

// Wrapper do testów React z potrzebnymi kontekstami
function TestWrapper({ children }: WrapperProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <TooltipProvider delayDuration={0}>
          {" "}
          {/* Ustawiamy zerowe opóźnienie dla testów */}
          {/* <TooltipProvider delayDuration={0}> // Przykład użycia */}
          {children}
          {/* </TooltipProvider> */}
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Funkcja pomocnicza do renderowania komponentów w testach
function renderWithProviders(ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: TestWrapper, ...options });
}

// Re-eksportujemy wszystko z testing-library/react
export * from "@testing-library/react";
// Eksportujemy nasze funkcje pomocnicze
export { TestWrapper, renderWithProviders };
