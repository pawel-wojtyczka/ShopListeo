import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AuthService } from "./auth.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

// Mock Supabase Client completely
const mockSupabaseAuth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
};

const mockSupabaseQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  // Mock for the connection check
  from: vi.fn((tableName: string) => {
    if (tableName === "shopping_list_items") {
      // Special mock for the connection check query
      return {
        select: vi.fn().mockResolvedValue({ error: null }),
      };
    }
    // Return the standard query builder for other tables like 'users'
    return mockSupabaseQueryBuilder;
  }),
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: mockSupabaseQueryBuilder.from,
    auth: mockSupabaseAuth,
  })),
}));

describe("AuthService", () => {
  let authService: AuthService;
  let mockSupabaseClient: SupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient = createClient("url", "key");
    authService = new AuthService(mockSupabaseClient);
    mockSupabaseQueryBuilder.from("shopping_list_items").select = vi.fn().mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("userExistsByEmail", () => {
    const testEmail = "test@example.com";

    it("should return true if user exists", async () => {
      mockSupabaseQueryBuilder.maybeSingle.mockResolvedValueOnce({ data: { id: "user-id" }, error: null });
      const exists = await authService.userExistsByEmail(testEmail);
      expect(exists).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("users");
      expect(mockSupabaseQueryBuilder.select).toHaveBeenCalledWith("id");
      expect(mockSupabaseQueryBuilder.eq).toHaveBeenCalledWith("email", testEmail);
      expect(mockSupabaseQueryBuilder.maybeSingle).toHaveBeenCalledTimes(1);
    });

    it("should return false if user does not exist", async () => {
      mockSupabaseQueryBuilder.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
      const exists = await authService.userExistsByEmail(testEmail);
      expect(exists).toBe(false);
    });

    it("should throw an error if Supabase query fails", async () => {
      const testError = new Error("DB Error");
      mockSupabaseQueryBuilder.maybeSingle.mockResolvedValueOnce({ data: null, error: testError });
      await expect(authService.userExistsByEmail(testEmail)).rejects.toThrow(
        `Nie można sprawdzić czy użytkownik istnieje: ${testError.message}`
      );
    });
  });

  describe("registerUser", () => {
    const registerData = { email: "new@example.com", password: "password123" };
    const mockUserId = "new-user-id";
    const mockUser = {
      id: mockUserId,
      email: registerData.email,
      email_confirmed_at: new Date().toISOString(),
    } as User;
    const mockSession = { access_token: "mock-token", user: mockUser };

    beforeEach(() => {
      mockSupabaseQueryBuilder.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockSupabaseAuth.signUp.mockResolvedValue({ data: { user: mockUser }, error: null });
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({ data: { session: mockSession }, error: null });
      mockSupabaseQueryBuilder.insert.mockResolvedValue({ error: null });
    });

    it("should register a new user successfully when email is confirmed", async () => {
      const response = await authService.registerUser(registerData);
      expect(response.id).toBe(mockUserId);
      expect(response.email).toBe(registerData.email);
      expect(response.token).toBe("mock-token");
      expect(response.registrationDate).toBeDefined();
      expect(mockSupabaseQueryBuilder.maybeSingle).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAuth.signUp).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.insert).toHaveBeenCalledTimes(1);
    });

    it("should register user but return no token if email is not confirmed", async () => {
      const unconfirmedUser = { ...mockUser, email_confirmed_at: undefined } as User;
      mockSupabaseAuth.signUp.mockResolvedValue({ data: { user: unconfirmedUser }, error: null });
      const response = await authService.registerUser(registerData);
      expect(response.id).toBe(mockUserId);
      expect(response.email).toBe(registerData.email);
      expect(response.token).toBe("token-niedostepny-wymagane-potwierdzenie-email");
      expect(response.registrationDate).toBeDefined();
      expect(mockSupabaseAuth.signUp).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAuth.signInWithPassword).not.toHaveBeenCalled();
      expect(mockSupabaseQueryBuilder.insert).toHaveBeenCalledTimes(1);
    });

    it("should throw an error if user already exists", async () => {
      mockSupabaseQueryBuilder.maybeSingle.mockResolvedValueOnce({ data: { id: "existing-id" }, error: null });
      await expect(authService.registerUser(registerData)).rejects.toThrow(
        "Użytkownik o podanym adresie email już istnieje"
      );
      expect(mockSupabaseAuth.signUp).not.toHaveBeenCalled();
    });

    it("should throw an error if Supabase signUp fails", async () => {
      const signUpError = new Error("Auth signUp failed");
      mockSupabaseAuth.signUp.mockResolvedValueOnce({ data: {}, error: signUpError });
      await expect(authService.registerUser(registerData)).rejects.toThrow(
        `Nie udało się utworzyć konta użytkownika: ${signUpError.message}`
      );
    });

    it("should throw an error if Supabase signUp returns no user data", async () => {
      mockSupabaseAuth.signUp.mockResolvedValueOnce({ data: { user: null }, error: null });
      await expect(authService.registerUser(registerData)).rejects.toThrow(
        "Nie udało się utworzyć konta użytkownika: brak danych użytkownika w odpowiedzi"
      );
    });

    it("should proceed with registration even if inserting into users table fails", async () => {
      const insertError = new Error("Insert failed");
      mockSupabaseQueryBuilder.insert.mockResolvedValueOnce({ error: insertError });
      const response = await authService.registerUser(registerData);
      expect(response.id).toBe(mockUserId);
      expect(response.email).toBe(registerData.email);
      expect(response.token).toBe("mock-token");
      expect(mockSupabaseAuth.signUp).toHaveBeenCalledTimes(1);
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.insert).toHaveBeenCalledTimes(1);
    });

    it("should proceed with registration if signIn after registration fails", async () => {
      const signInError = new Error("Temporary login issue");
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({ data: {}, error: signInError });
      const response = await authService.registerUser(registerData);
      expect(response.id).toBe(mockUserId);
      expect(response.email).toBe(registerData.email);
      expect(response.token).toBe("token-niedostepny-wymagane-potwierdzenie-email");
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.insert).toHaveBeenCalledTimes(1);
    });
  });

  describe("loginUser", () => {
    const loginCredentials = { email: "user@example.com", password: "password123" };
    const mockUserId = "logged-in-user-id";
    const mockUser = { id: mockUserId, email: loginCredentials.email } as User;
    const mockSession = { access_token: "login-token", user: mockUser };

    beforeEach(() => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { session: mockSession, user: mockUser },
        error: null,
      });
      mockSupabaseQueryBuilder.update.mockResolvedValue({ error: null });
    });

    it("should login user successfully and update last login date", async () => {
      const response = await authService.loginUser(loginCredentials);
      expect(response.id).toBe(mockUserId);
      expect(response.email).toBe(loginCredentials.email);
      expect(response.token).toBe("login-token");
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledWith(loginCredentials);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith("users");
      expect(mockSupabaseQueryBuilder.update).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.eq).toHaveBeenCalledWith("id", mockUserId);
      expect(mockSupabaseQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({ last_login_date: expect.any(String) })
      );
    });

    it("should throw an error if Supabase signIn fails", async () => {
      const loginError = new Error("Invalid credentials");
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({ data: {}, error: loginError });
      await expect(authService.loginUser(loginCredentials)).rejects.toThrow("Nieprawidłowy email lub hasło");
    });

    it("should throw an error if Supabase signIn returns no user or session", async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValueOnce({ data: { user: null, session: null }, error: null });
      await expect(authService.loginUser(loginCredentials)).rejects.toThrow("Nieprawidłowy email lub hasło");
    });

    it("should login user successfully even if updating last login date fails", async () => {
      const updateError = new Error("Update failed");
      mockSupabaseQueryBuilder.update.mockResolvedValueOnce({ error: updateError });
      const response = await authService.loginUser(loginCredentials);
      expect(response.id).toBe(mockUserId);
      expect(response.token).toBe("login-token");
      expect(mockSupabaseAuth.signInWithPassword).toHaveBeenCalledTimes(1);
      expect(mockSupabaseQueryBuilder.update).toHaveBeenCalledTimes(1);
    });
  });
});
