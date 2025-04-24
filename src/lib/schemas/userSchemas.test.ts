import { describe, it, expect } from "vitest";
import { userIdSchema, emailSchema, passwordSchema, getAllUsersQuerySchema, updateUserSchema } from "./userSchemas";

describe("User Schemas", () => {
  describe("userIdSchema", () => {
    it("should validate a correct UUID", () => {
      const validUUID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
      expect(() => userIdSchema.parse(validUUID)).not.toThrow();
    });

    it("should reject an incorrect UUID format", () => {
      const invalidUUID = "not-a-uuid";
      expect(() => userIdSchema.parse(invalidUUID)).toThrow("ID użytkownika musi być poprawnym UUID");
    });

    it("should reject non-string input", () => {
      expect(() => userIdSchema.parse(123)).toThrow();
    });
  });

  describe("emailSchema", () => {
    it("should validate a correct email address", () => {
      const validEmail = "test@example.com";
      expect(() => emailSchema.parse(validEmail)).not.toThrow();
    });

    it("should reject an incorrect email format", () => {
      const invalidEmail = "test@example";
      expect(() => emailSchema.parse(invalidEmail)).toThrow("Podaj poprawny adres email");
    });

    it("should reject an empty string", () => {
      expect(() => emailSchema.parse("")).toThrow();
    });
  });

  describe("passwordSchema", () => {
    it("should validate a password of 8 characters", () => {
      const validPassword = "password";
      expect(() => passwordSchema.parse(validPassword)).not.toThrow();
    });

    it("should validate a password longer than 8 characters", () => {
      const validPassword = "longpassword123";
      expect(() => passwordSchema.parse(validPassword)).not.toThrow();
    });

    it("should reject a password shorter than 8 characters", () => {
      const invalidPassword = "short";
      expect(() => passwordSchema.parse(invalidPassword)).toThrow("Hasło musi mieć co najmniej 8 znaków");
    });

    it("should reject an empty string", () => {
      expect(() => passwordSchema.parse("")).toThrow();
    });
  });

  describe("getAllUsersQuerySchema", () => {
    it("should validate valid query parameters", () => {
      const validQuery = {
        page: "2",
        pageSize: "10",
        sort: "registrationDate",
        order: "desc",
        emailFilter: "test",
      };
      const expected = {
        page: 2,
        pageSize: 10,
        sort: "registrationDate",
        order: "desc",
        emailFilter: "test",
      };
      expect(getAllUsersQuerySchema.parse(validQuery)).toEqual(expected);
    });

    it("should use default values when parameters are missing", () => {
      const minimalQuery = {};
      const expected = {
        page: 1,
        pageSize: 20,
        sort: "email",
        order: "asc",
        emailFilter: undefined, // Zod converts null/undefined optional strings to undefined
      };
      expect(getAllUsersQuerySchema.parse(minimalQuery)).toEqual(expected);
    });

    it("should handle null emailFilter", () => {
      const query = { emailFilter: null };
      const expected = {
        page: 1,
        pageSize: 20,
        sort: "email",
        order: "asc",
        emailFilter: undefined, // Zod converts null/undefined optional strings to undefined
      };
      expect(getAllUsersQuerySchema.parse(query)).toEqual(expected);
    });

    it("should coerce page and pageSize to numbers", () => {
      const query = { page: "5", pageSize: "50" };
      const result = getAllUsersQuerySchema.parse(query);
      expect(result.page).toBe(5);
      expect(result.pageSize).toBe(50);
    });

    it("should reject invalid sort value", () => {
      const invalidQuery = { sort: "invalidSort" };
      expect(() => getAllUsersQuerySchema.parse(invalidQuery)).toThrow();
    });

    it("should reject invalid order value", () => {
      const invalidQuery = { order: "invalidOrder" };
      expect(() => getAllUsersQuerySchema.parse(invalidQuery)).toThrow();
    });

    it("should reject negative page number", () => {
      const invalidQuery = { page: "-1" };
      expect(() => getAllUsersQuerySchema.parse(invalidQuery)).toThrow();
    });

    it("should reject page size greater than 100", () => {
      const invalidQuery = { pageSize: "101" };
      expect(() => getAllUsersQuerySchema.parse(invalidQuery)).toThrow();
    });
  });

  describe("updateUserSchema", () => {
    it("should validate when only email is provided", () => {
      const data = { email: "new@example.com" };
      expect(() => updateUserSchema.parse(data)).not.toThrow();
    });

    it("should validate when only password is provided", () => {
      const data = { password: "newpassword123" };
      expect(() => updateUserSchema.parse(data)).not.toThrow();
    });

    it("should validate when both email and password are provided", () => {
      const data = { email: "new@example.com", password: "newpassword123" };
      expect(() => updateUserSchema.parse(data)).not.toThrow();
    });

    it("should reject when neither email nor password is provided", () => {
      const data = {};
      expect(() => updateUserSchema.parse(data)).toThrow("Musisz podać email lub hasło do aktualizacji");
    });

    it("should reject invalid email format", () => {
      const data = { email: "invalid-email" };
      expect(() => updateUserSchema.parse(data)).toThrow("Podaj poprawny adres email");
    });

    it("should reject short password", () => {
      const data = { password: "short" };
      expect(() => updateUserSchema.parse(data)).toThrow("Hasło musi mieć co najmniej 8 znaków");
    });

    it("should handle extra fields (strip them)", () => {
      const data = { email: "test@example.com", extraField: "value" };
      // By default Zod strips extra fields, so no error should be thrown
      expect(() => updateUserSchema.parse(data)).not.toThrow();
      // Check that the extra field was indeed stripped
      expect(updateUserSchema.parse(data)).toEqual({ email: "test@example.com" });
    });
  });
});
