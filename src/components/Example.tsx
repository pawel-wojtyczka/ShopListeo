import { useState } from "react";

// Interfejs właściwości komponentu Example
interface ExampleProps {
  // Opcjonalna funkcja wywoływana po inkrementacji licznika
  onIncrement?: () => void;
}

/**
 * Przykładowy komponent do demonstracji testów jednostkowych
 * @param props - Właściwości komponentu
 */
export function Example({ onIncrement }: ExampleProps) {
  // Stan licznika
  const [count, setCount] = useState(0);

  // Funkcja obsługująca kliknięcie przycisku
  const handleClick = () => {
    setCount((prevCount) => prevCount + 1);

    // Wywołanie funkcji z props jeśli istnieje
    if (onIncrement) {
      onIncrement();
    }
  };

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold">Example Component</h2>
      <p className="mt-2">Count: {count}</p>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={handleClick}
        aria-label="Increment"
      >
        Increment
      </button>
    </div>
  );
}
