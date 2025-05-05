import { describe, it, expect } from "vitest";
// Użycie aliasu @/ dla importu
import { createShoppingListSchema, addItemToShoppingListSchema } from "@/lib/validators/shopping-list.validators";

describe("Shopping List Validators", () => {
  describe("createShoppingListSchema", () => {
    it("should validate correct data", () => {
      const result = createShoppingListSchema.safeParse({ title: "My Groceries" });
      expect(result.success).toBe(true);
    });

    it("should invalidate empty title", () => {
      const result = createShoppingListSchema.safeParse({ title: "" });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe("Tytuł listy zakupów nie może być pusty");
    });

    it("should invalidate title exceeding max length (e.g., 255)", () => {
      const longTitle = "a".repeat(256);
      const result = createShoppingListSchema.safeParse({ title: longTitle });
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.message).toBe("Tytuł listy zakupów nie może przekraczać 255 znaków");
    });

    it("should invalidate missing title", () => {
      const result = createShoppingListSchema.safeParse({});
      expect(result.success).toBe(false);
      expect(result.error?.errors[0]?.path).toContain("title");
      expect(result.error?.errors[0]?.message).toContain("Required");
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
