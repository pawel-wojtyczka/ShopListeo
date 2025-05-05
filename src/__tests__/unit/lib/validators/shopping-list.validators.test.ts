import { describe, it, expect } from "vitest";
// Użycie aliasu @/ dla importu
import { createShoppingListSchema, addItemToShoppingListSchema } from "@/lib/validators/shopping-list.validators";

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

  describe("addItemToShoppingListSchema", () => {
    it("should validate correct data (item name only)", () => {
      const result = addItemToShoppingListSchema.safeParse({ itemName: "Milk" });
      expect(result.success).toBe(true);
      expect(result.data?.purchased).toBe(false);
    });

    it("should validate correct data (item name and purchased true)", () => {
      const result = addItemToShoppingListSchema.safeParse({ itemName: "Eggs", purchased: true });
      expect(result.success).toBe(true);
      expect(result.data?.purchased).toBe(true);
    });

    it("should validate correct data (item name and purchased false)", () => {
      const result = addItemToShoppingListSchema.safeParse({ itemName: "Bread", purchased: false });
      expect(result.success).toBe(true);
      expect(result.data?.purchased).toBe(false);
    });

    it("should invalidate missing item name", () => {
      const result = addItemToShoppingListSchema.safeParse({ purchased: false });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.path).toContain("itemName");
      expect(result.error?.errors[0]?.message).toContain("Required");
    });

    it("should invalidate empty item name", () => {
      const result = addItemToShoppingListSchema.safeParse({ itemName: "" });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe("Nazwa produktu nie może być pusta");
    });

    it("should invalidate item name exceeding max length (e.g., 128)", () => {
      const longItemName = "a".repeat(129);
      const result = addItemToShoppingListSchema.safeParse({ itemName: longItemName });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe("Nazwa produktu nie może przekraczać 128 znaków");
    });

    it("should invalidate incorrect type for purchased", () => {
      const result = addItemToShoppingListSchema.safeParse({ itemName: "Butter", purchased: "yes" });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.path).toContain("purchased");
      expect(result.error?.errors[0]?.message).toContain("Expected boolean, received string");
    });
  });
});
