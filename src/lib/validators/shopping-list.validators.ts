import { z } from "zod";

/**
 * Schemat walidacji dla tworzenia nowej listy zakupów
 */
export const createShoppingListSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Tytuł listy zakupów nie może być pusty" })
    .max(255, { message: "Tytuł listy zakupów nie może przekraczać 255 znaków" }),
});
