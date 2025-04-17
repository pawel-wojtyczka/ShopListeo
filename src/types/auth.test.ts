import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../lib/auth.service";
import type { RegisterUserRequest, LoginUserRequest } from "../types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Definiujemy interfejs dla mocka Supabase
interface MockSupabaseClient {
  auth: {
    signUp: ReturnType<typeof vi.fn>;
    signInWithPassword: ReturnType<typeof vi.fn>;
    getSession: ReturnType<typeof vi.fn>;
  };
  from: ReturnType<typeof vi.fn>;
  select: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  maybeSingle: ReturnType<typeof vi.fn>;
}

// Mock dla klienta Supabase
const mockSupabaseClient: MockSupabaseClient = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    getSession: vi.fn(),
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn(),
};

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Używamy mocka Supabase z właściwym typem
    authService = new AuthService(mockSupabaseClient as unknown as SupabaseClient);

    // Mock dla metody from (dla łatwiejszego mockowania)
    mockSupabaseClient.from.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => ({ data: null, error: null }),
        }),
      }),
      insert: () => ({ error: null }),
      update: () => ({
        eq: () => ({ error: null }),
      }),
    }));
  });

  describe("userExistsByEmail", () => {
    it("powinno zwrócić true jeśli użytkownik istnieje", async () => {
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () => ({ data: { id: "123" }, error: null }),
          }),
        }),
      }));

      const result = await authService.userExistsByEmail("istniejacy@example.com");
      expect(result).toBe(true);
    });

    it("powinno zwrócić false jeśli użytkownik nie istnieje", async () => {
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () => ({ data: null, error: null }),
          }),
        }),
      }));

      const result = await authService.userExistsByEmail("nieistniejacy@example.com");
      expect(result).toBe(false);
    });

    it("powinno rzucić wyjątek w przypadku błędu bazy danych", async () => {
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () => ({ data: null, error: { message: "Błąd bazy danych" } }),
          }),
        }),
      }));

      await expect(authService.userExistsByEmail("test@example.com")).rejects.toThrow();
    });
  });

  describe("registerUser", () => {
    it("powinno zarejestrować nowego użytkownika i zwrócić dane z tokenem", async () => {
      const mockUserData: RegisterUserRequest = {
        email: "nowy@example.com",
        password: "Haslo123!",
      };

      const mockUserId = "123-abc-456";
      const mockToken = "token-xyz-789";
      const mockDate = "2023-01-01T12:00:00Z";

      // Mock dla sprawdzenia czy użytkownik istnieje
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () => ({ data: null, error: null }),
          }),
        }),
      }));

      // Mock dla rejestracji użytkownika
      mockSupabaseClient.auth.signUp.mockResolvedValueOnce({
        data: { user: { id: mockUserId, email: mockUserData.email } },
        error: null,
      });

      // Mock dla pobrania sesji
      mockSupabaseClient.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: mockToken } },
        error: null,
      });

      // Mock dla zapisu danych użytkownika
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        insert: () => ({ error: null }),
      }));

      // Zastępujemy Date.now aby uzyskać deterministyczną datę
      const dateSpy = vi.spyOn(Date.prototype, "toISOString").mockReturnValue(mockDate);

      const result = await authService.registerUser(mockUserData);

      expect(result).toEqual({
        id: mockUserId,
        email: mockUserData.email,
        registrationDate: mockDate,
        token: mockToken,
      });

      // Sprawdzamy czy wszystkie potrzebne metody zostały wywołane
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: mockUserData.email,
        password: mockUserData.password,
      });

      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();

      dateSpy.mockRestore();
    });

    it("powinno rzucić wyjątek jeśli użytkownik z podanym emailem już istnieje", async () => {
      // Mock dla sprawdzenia czy użytkownik istnieje - zwraca istniejący email
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () => ({ data: { id: "123" }, error: null }),
          }),
        }),
      }));

      const mockUserData: RegisterUserRequest = {
        email: "istniejacy@example.com",
        password: "Haslo123!",
      };

      await expect(authService.registerUser(mockUserData)).rejects.toThrow(
        "Użytkownik o podanym adresie email już istnieje"
      );
    });
  });

  describe("loginUser", () => {
    it("powinno zalogować użytkownika i zwrócić dane z tokenem", async () => {
      const mockCredentials: LoginUserRequest = {
        email: "user@example.com",
        password: "Haslo123!",
      };

      const mockUserId = "123-abc-456";
      const mockToken = "token-xyz-789";

      // Mock dla logowania użytkownika
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: mockUserId, email: mockCredentials.email },
          session: { access_token: mockToken },
        },
        error: null,
      });

      // Mock dla aktualizacji daty logowania
      mockSupabaseClient.from.mockImplementationOnce(() => ({
        update: () => ({
          eq: () => ({ error: null }),
        }),
      }));

      const result = await authService.loginUser(mockCredentials);

      expect(result).toEqual({
        id: mockUserId,
        email: mockCredentials.email,
        token: mockToken,
      });

      // Sprawdzamy czy wszystkie potrzebne metody zostały wywołane
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: mockCredentials.email,
        password: mockCredentials.password,
      });
    });

    it("powinno rzucić wyjątek w przypadku błędu logowania", async () => {
      const mockCredentials: LoginUserRequest = {
        email: "user@example.com",
        password: "BledneHaslo",
      };

      // Mock dla błędu logowania
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: "Invalid login credentials" },
      });

      await expect(authService.loginUser(mockCredentials)).rejects.toThrow("Nieprawidłowy email lub hasło");
    });
  });
});
