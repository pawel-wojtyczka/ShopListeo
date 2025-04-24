// Interfejs dla elementu listy zakupów
interface ShoppingListItem {
  id?: string;
  name: string;
  completed: boolean;
}

// Interfejs dla listy zakupów
interface ShoppingList {
  id?: string;
  title: string;
  createdAt?: string;
  items: ShoppingListItem[];
}

/**
 * Serwis do obsługi list zakupów
 * Komunikuje się z API do zarządzania listami zakupów
 */
export class ShoppingListService {
  private static readonly API_URL = "/api/shopping-lists";

  /**
   * Pobiera wszystkie listy zakupów
   * @returns Promise z tablicą list zakupów
   */
  static async getAll(): Promise<ShoppingList[]> {
    const response = await fetch(this.API_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch shopping lists: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Pobiera listę zakupów o określonym ID
   * @param id - ID listy zakupów
   * @returns Promise z listą zakupów
   */
  static async getById(id: string): Promise<ShoppingList> {
    const response = await fetch(`${this.API_URL}/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch shopping list: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Tworzy nową listę zakupów
   * @param shoppingList - Dane nowej listy
   * @returns Promise z utworzoną listą zakupów
   */
  static async create(shoppingList: ShoppingList): Promise<ShoppingList> {
    const response = await fetch(this.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shoppingList),
    });

    if (!response.ok) {
      throw new Error(`Failed to create shopping list: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Aktualizuje istniejącą listę zakupów
   * @param id - ID listy zakupów
   * @param shoppingList - Zaktualizowane dane listy
   * @returns Promise z zaktualizowaną listą zakupów
   */
  static async update(id: string, shoppingList: Partial<ShoppingList>): Promise<ShoppingList> {
    const response = await fetch(`${this.API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shoppingList),
    });

    if (!response.ok) {
      throw new Error(`Failed to update shopping list: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Usuwa listę zakupów o określonym ID
   * @param id - ID listy zakupów
   * @returns Promise bez zawartości
   */
  static async delete(id: string): Promise<void> {
    const response = await fetch(`${this.API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete shopping list: ${response.statusText}`);
    }
  }
}
