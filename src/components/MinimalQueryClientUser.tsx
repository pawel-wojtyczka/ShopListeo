import React, { useState } from "react";
import type { PropsWithChildren } from "react";
import { QueryClient } from "@tanstack/react-query";

// Minimalny komponent do testowania dostępu do QueryClient
const MinimalQueryClientUser: React.FC<PropsWithChildren> = ({ children }) => {
  // Użyj hooka useState do stworzenia instancji queryClient tylko raz
  useState(() => new QueryClient());

  return <>{children}</>; // Zwróć tylko children, bo Provider jest wyżej
};

export default MinimalQueryClientUser;
