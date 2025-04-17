/**
 * Schematy walidacji danych użytkowników używające Zod
 */
import { z } from "zod";

/**
 * Schemat UUID dla identyfikatorów użytkowników
 */
export const userIdSchema = z.string().uuid({
  message: "ID użytkownika musi być poprawnym UUID",
});

/**
 * Schemat adresu email
 */
export const emailSchema = z.string().email({
  message: "Podaj poprawny adres email",
});

/**
 * Schemat hasła
 */
export const passwordSchema = z.string().min(8, {
  message: "Hasło musi mieć co najmniej 8 znaków",
});

/**
 * Schemat parametrów zapytania dla pobierania wszystkich użytkowników
 */
export const getAllUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(["email", "registrationDate"]).optional().default("email"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
  emailFilter: z.string().optional().nullable(),
});

/**
 * Schemat aktualizacji użytkownika
 */
export const updateUserSchema = z
  .object({
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
  })
  .refine((data) => data.email !== undefined || data.password !== undefined, {
    message: "Musisz podać email lub hasło do aktualizacji",
  });
