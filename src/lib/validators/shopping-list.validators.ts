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

/**
 * Schemat walidacji dla parametrów zapytania przy pobieraniu list zakupów
 */
export const getAllShoppingListsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive().default(1)),
  pageSize: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().positive().max(100).default(20)),
  sort: z.enum(["title", "createdAt", "updatedAt"]).optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
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
