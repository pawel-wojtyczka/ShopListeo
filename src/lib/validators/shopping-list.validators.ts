import { z } from "zod";

/**
 * Schemat walidacji dla tworzenia nowej listy zakupów
 */
export const createShoppingListSchema = z.object({
  title: z
    .string({
      required_error: "Tytuł listy zakupów nie może być pusty",
    })
    .nonempty({ message: "Tytuł listy zakupów nie może być pusty" })
    .max(255, { message: "Tytuł listy zakupów nie może przekraczać 255 znaków" }),
});

/**
 * Schemat walidacji dla parametrów zapytania przy pobieraniu list zakupów
 */
export const getAllShoppingListsQuerySchema = z.object({
  page: z.preprocess(
    (val) => val ?? undefined,
    z.coerce
      .number()
      .int({ message: "Numer strony musi być liczbą całkowitą." })
      .positive({ message: "Numer strony musi być liczbą dodatnią." })
      .optional()
      .default(1)
  ),
  pageSize: z.preprocess(
    (val) => val ?? undefined,
    z.coerce
      .number()
      .int({ message: "Rozmiar strony musi być liczbą całkowitą." })
      .positive({ message: "Rozmiar strony musi być liczbą dodatnią." })
      .max(100, { message: "Rozmiar strony nie może przekraczać 100." })
      .optional()
      .default(20)
  ),
  sort: z.preprocess(
    (val) => val ?? undefined,
    z.enum(["title", "createdAt", "updatedAt"]).optional().default("createdAt")
  ),
  order: z.preprocess((val) => val ?? undefined, z.enum(["asc", "desc"]).optional().default("desc")),
});

/**
 * Schemat walidacji dla ID listy zakupów (UUID)
 */
export const shoppingListIdSchema = z.string().uuid({ message: "Nieprawidłowy format identyfikatora listy zakupów" });

/**
 * Schemat walidacji dla aktualizacji listy zakupów
 */
export const updateShoppingListSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Tytuł listy zakupów nie może być pusty" })
    .max(255, { message: "Tytuł listy zakupów nie może przekraczać 255 znaków" }),
});

/**
 * Schemat walidacji dla dodawania elementu do listy zakupów
 */
export const addItemToShoppingListSchema = z.object({
  itemName: z
    .string()
    .min(1, { message: "Nazwa produktu nie może być pusta" })
    .max(128, { message: "Nazwa produktu nie może przekraczać 128 znaków" }),
  purchased: z.boolean().optional().default(false),
});

/**
 * Schemat walidacji dla aktualizacji elementu listy zakupów
 */
export const updateShoppingListItemSchema = z
  .object({
    itemName: z
      .string()
      .min(1, { message: "Nazwa produktu nie może być pusta" })
      .max(128, { message: "Nazwa produktu nie może przekraczać 128 znaków" })
      .optional(),
    purchased: z.boolean().optional(),
  })
  .refine((data) => data.itemName !== undefined || data.purchased !== undefined, {
    message: "Co najmniej jedno pole musi być podane: nazwa produktu lub status zakupu",
  });
