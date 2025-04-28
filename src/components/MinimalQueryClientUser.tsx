import React from "react";
import { useQueryClient } from "@tanstack/react-query";

// Minimalny komponent do testowania dostępu do QueryClient
export function MinimalQueryClientUser() {
  // Wywołaj hook bezwarunkowo na najwyższym poziomie
  // Jeśli kontekst nie jest dostępny, to wywołanie rzuci błąd "No QueryClient set..."
  const queryClient = useQueryClient();

  // Jeśli dotarliśmy tutaj, hook nie rzucił błędu
  console.log("MinimalQueryClientUser: QueryClient instance obtained successfully:", queryClient);
  const clientStatus = "QueryClient FOUND successfully!";

  return (
    <div style={{ border: "2px dashed green", padding: "10px", margin: "10px" }}>
      <h2>Minimal Query Client Test Component</h2>
      <p>Status: {clientStatus}</p>
      <p>QueryClient instance seems available.</p>
    </div>
  );
}
