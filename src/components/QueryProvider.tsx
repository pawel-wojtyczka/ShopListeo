import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface QueryProviderProps {
  children: React.ReactNode;
}

// Komponent dostarczający QueryClient do aplikacji React
export function QueryProvider({ children }: QueryProviderProps) {
  // Używamy useState, aby zapewnić, że QueryClient jest tworzony tylko raz
  // i tylko po stronie klienta, co jest zalecane przez dokumentację React Query.
  const [queryClient] = useState(() => new QueryClient());

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
