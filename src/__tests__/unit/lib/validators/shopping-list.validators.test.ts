import { describe, it, expect } from "vitest";
// Użycie aliasu @/ dla importu
import {
  createShoppingListSchema,
  addItemToShoppingListSchema,
  getAllShoppingListsQuerySchema,
  shoppingListIdSchema,
  updateShoppingListSchema,
  updateShoppingListItemSchema,
} from "@/lib/validators/shopping-list.validators";

describe("Shopping List Validators", () => {
  describe("createShoppingListSchema", () => {
    it("should validate correct data successfully", () => {
      const validData = { title: "Lista zakupów na weekend" };
      const result = createShoppingListSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should allow title with maximum allowed length", () => {
      const validData = { title: "a".repeat(255) };
      const result = createShoppingListSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail validation if title is missing", () => {
      const invalidData = {};
      const result = createShoppingListSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().title?._errors[0]).toBe("Tytuł listy zakupów nie może być pusty");
      }
    });

    it("should fail validation if title is an empty string", () => {
      const invalidData = { title: "" };
      const result = createShoppingListSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().title?._errors[0]).toBe("Tytuł listy zakupów nie może być pusty");
      }
    });

    it("should fail validation if title exceeds maximum length", () => {
      const invalidData = { title: "a".repeat(256) };
      const result = createShoppingListSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().title?._errors[0]).toBe("Tytuł listy zakupów nie może przekraczać 255 znaków");
      }
    });

    it("should fail validation if title is not a string", () => {
      const invalidData = { title: 123 };
      const result = createShoppingListSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().title?._errors[0]).toContain("Expected string, received number");
      }
    });

    it("should strip unknown fields", () => {
      const dataWithExtraField = { title: "Moja Lista", unknownField: "should be removed" };
      const result = createShoppingListSchema.safeParse(dataWithExtraField);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ title: "Moja Lista" });
      }
    });
  });

  describe("getAllShoppingListsQuerySchema", () => {
    it("should validate with default values when no input is provided", () => {
      const result = getAllShoppingListsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          page: 1,
          pageSize: 20,
          sort: "createdAt",
          order: "desc",
        });
      }
    });

    it("should validate correct specific values", () => {
      const input = {
        page: "2",
        pageSize: "10",
        sort: "title",
        order: "asc",
      };
      const result = getAllShoppingListsQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          page: 2,
          pageSize: 10,
          sort: "title",
          order: "asc",
        });
      }
    });

    it("should handle numeric inputs for page and pageSize", () => {
      const input = { page: 3, pageSize: 50 }; // Numbers instead of strings
      const result = getAllShoppingListsQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.pageSize).toBe(50);
      }
    });

    it("should use default values for missing fields", () => {
      const input = { sort: "updatedAt" }; // Only sort provided
      const result = getAllShoppingListsQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          page: 1,
          pageSize: 20,
          sort: "updatedAt",
          order: "desc",
        });
      }
    });

    it("should fail validation for invalid page number (string)", () => {
      const input = { page: "invalid" };
      const result = getAllShoppingListsQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.format().page?._errors[0]).toContain("Expected number, received nan"); // NaN after parseInt
    });

    it("should fail validation for non-positive page number", () => {
      const input = { page: 0 };
      const result = getAllShoppingListsQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.format().page?._errors[0]).toBe("Numer strony musi być liczbą dodatnią.");
    });

    it("should fail validation for pageSize exceeding maximum", () => {
      const input = { pageSize: 101 };
      const result = getAllShoppingListsQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.format().pageSize?._errors[0]).toBe("Rozmiar strony nie może przekraczać 100.");
    });

    it("should fail validation for invalid sort value", () => {
      const input = { sort: "invalidField" };
      const result = getAllShoppingListsQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.format().sort?._errors[0]).toContain("Invalid enum value");
    });

    it("should fail validation for invalid order value", () => {
      const input = { order: "sideways" };
      const result = getAllShoppingListsQuerySchema.safeParse(input);
      expect(result.success).toBe(false);
      expect(result.error?.format().order?._errors[0]).toContain("Invalid enum value");
    });

    it("should handle undefined values correctly (use defaults)", () => {
      const input = { page: undefined, pageSize: undefined, sort: undefined, order: undefined };
      const result = getAllShoppingListsQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          page: 1,
          pageSize: 20,
          sort: "createdAt",
          order: "desc",
        });
      }
    });

    it("should handle null values correctly (use defaults)", () => {
      const input = { page: null, pageSize: null, sort: null, order: null };
      const result = getAllShoppingListsQuerySchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          page: 1,
          pageSize: 20,
          sort: "createdAt",
          order: "desc",
        });
      }
    });
  });

  describe("shoppingListIdSchema", () => {
    it("should validate a correct UUID successfully", () => {
      const validUuid = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
      const result = shoppingListIdSchema.safeParse(validUuid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(validUuid);
      }
    });

    it("should fail validation for an invalid UUID format", () => {
      const invalidUuid = "not-a-uuid";
      const result = shoppingListIdSchema.safeParse(invalidUuid);
      expect(result.success).toBe(false);
      expect(result.error?.format()._errors[0]).toContain("Nieprawidłowy format identyfikatora listy zakupów");
    });

    it("should fail validation for an empty string", () => {
      const result = shoppingListIdSchema.safeParse("");
      expect(result.success).toBe(false);
      expect(result.error?.format()._errors[0]).toContain("Nieprawidłowy format identyfikatora listy zakupów");
    });

    it("should fail validation for a non-string input", () => {
      const result = shoppingListIdSchema.safeParse(12345);
      expect(result.success).toBe(false);
      expect(result.error?.format()._errors[0]).toContain("Expected string, received number");
    });

    it("should fail validation for null input", () => {
      const result = shoppingListIdSchema.safeParse(null);
      expect(result.success).toBe(false);
      expect(result.error?.format()._errors[0]).toContain("Expected string, received null");
    });

    it("should fail validation for undefined input", () => {
      const result = shoppingListIdSchema.safeParse(undefined);
      expect(result.success).toBe(false);
      expect(result.error?.format()._errors[0]).toContain("Required"); // Zod treats undefined as missing required field
    });
  });

  describe("addItemToShoppingListSchema", () => {
    it("should validate correct data (item name only, default purchased to false)", () => {
      const input = { itemName: "Milk" };
      const result = addItemToShoppingListSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ itemName: "Milk", purchased: false });
      }
    });

    it("should validate correct data (item name and purchased true)", () => {
      const input = { itemName: "Eggs", purchased: true };
      const result = addItemToShoppingListSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });

    it("should validate correct data (item name and purchased false)", () => {
      const input = { itemName: "Bread", purchased: false };
      const result = addItemToShoppingListSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });

    it("should fail validation if itemName is missing", () => {
      const input = { purchased: false };
      const result = addItemToShoppingListSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().itemName?._errors[0]).toContain("Required");
      }
    });

    it("should fail validation if itemName is an empty string", () => {
      const input = { itemName: "" };
      const result = addItemToShoppingListSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().itemName?._errors[0]).toBe("Nazwa produktu nie może być pusta");
      }
    });

    it("should fail validation if itemName exceeds maximum length (128)", () => {
      const input = { itemName: "a".repeat(129) };
      const result = addItemToShoppingListSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().itemName?._errors[0]).toBe("Nazwa produktu nie może przekraczać 128 znaków");
      }
    });

    it("should fail validation for incorrect type for purchased", () => {
      const input = { itemName: "Butter", purchased: "yes" };
      const result = addItemToShoppingListSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().purchased?._errors[0]).toContain("Expected boolean, received string");
      }
    });

    it("should fail validation for incorrect type for itemName", () => {
      const input = { itemName: 123, purchased: false };
      const result = addItemToShoppingListSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().itemName?._errors[0]).toContain("Expected string, received number");
      }
    });

    it("should strip unknown fields", () => {
      const input = { itemName: "Juice", purchased: false, quantity: 2 };
      const result = addItemToShoppingListSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ itemName: "Juice", purchased: false });
      }
    });
  });

  describe("updateShoppingListSchema", () => {
    it("should validate correct data successfully", () => {
      const validData = { title: "Zaktualizowana lista" };
      const result = updateShoppingListSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should allow title with maximum allowed length", () => {
      const validData = { title: "b".repeat(255) };
      const result = updateShoppingListSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail validation if title is an empty string", () => {
      const invalidData = { title: "" };
      const result = updateShoppingListSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().title?._errors[0]).toBe("Tytuł listy zakupów nie może być pusty");
      }
    });

    it("should fail validation if title exceeds maximum length", () => {
      const invalidData = { title: "b".repeat(256) };
      const result = updateShoppingListSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().title?._errors[0]).toBe("Tytuł listy zakupów nie może przekraczać 255 znaków");
      }
    });

    it("should fail validation if title is not a string", () => {
      const invalidData = { title: false };
      const result = updateShoppingListSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().title?._errors[0]).toContain("Expected string, received boolean");
      }
    });

    it("should fail validation if title is missing", () => {
      const invalidData = {};
      const result = updateShoppingListSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().title?._errors[0]).toContain("Required");
      }
    });

    it("should strip unknown fields", () => {
      const dataWithExtraField = { title: "Lista po zmianach", anotherField: 123 };
      const result = updateShoppingListSchema.safeParse(dataWithExtraField);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ title: "Lista po zmianach" });
      }
    });
  });

  describe("updateShoppingListItemSchema", () => {
    it("should validate successfully when only itemName is provided", () => {
      const input = { itemName: "Updated Milk" };
      const result = updateShoppingListItemSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        // purchased should be undefined as it was not provided
        expect(result.data).toEqual({ itemName: "Updated Milk", purchased: undefined });
      }
    });

    it("should validate successfully when only purchased is provided", () => {
      const input = { purchased: true };
      const result = updateShoppingListItemSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        // itemName should be undefined
        expect(result.data).toEqual({ itemName: undefined, purchased: true });
      }
    });

    it("should validate successfully when both fields are provided", () => {
      const input = { itemName: "Updated Eggs", purchased: false };
      const result = updateShoppingListItemSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });

    it("should fail validation if itemName is an empty string", () => {
      const input = { itemName: "" };
      const result = updateShoppingListItemSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Błąd z .min(1)
        expect(result.error.format().itemName?._errors[0]).toBe("Nazwa produktu nie może być pusta");
      }
    });

    it("should fail validation if itemName exceeds maximum length (128)", () => {
      const input = { itemName: "b".repeat(129) };
      const result = updateShoppingListItemSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().itemName?._errors[0]).toBe("Nazwa produktu nie może przekraczać 128 znaków");
      }
    });

    it("should fail validation for incorrect type for purchased", () => {
      const input = { purchased: "yes" };
      const result = updateShoppingListItemSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().purchased?._errors[0]).toContain("Expected boolean, received string");
      }
    });

    it("should fail validation for incorrect type for itemName", () => {
      const input = { itemName: 123 };
      const result = updateShoppingListItemSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.format().itemName?._errors[0]).toContain("Expected string, received number");
      }
    });

    it("should fail validation if neither itemName nor purchased is provided (due to .refine)", () => {
      const input = {}; // Pusty obiekt
      const result = updateShoppingListItemSchema.safeParse(input);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Oczekujemy błędu z .refine()
        // Zod może umieścić błąd refine na poziomie globalnym ('_errors') lub na jednym z pól.
        // Sprawdzamy globalne błędy najpierw.
        const globalErrors = result.error.format()._errors;
        expect(globalErrors).toContain("Co najmniej jedno pole musi być podane: nazwa produktu lub status zakupu");
      }
    });

    it("should strip unknown fields", () => {
      const input = { itemName: "Juice Updated", quantity: 1, notes: "Extra pulp" };
      const result = updateShoppingListItemSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ itemName: "Juice Updated", purchased: undefined });
      }
    });
  });
});
