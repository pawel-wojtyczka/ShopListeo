import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "../lib/auth.service";
import type { RegisterUserRequest, LoginUserRequest } from "../types";
import type { SupabaseClient } from "@supabase/supabase-js";

// Lepsze mockowanie klienta Supabase z obsługą łańcucha wywołań
const createMockSupabaseClient = () => {
  const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
  const mockInsert = vi.fn().mockResolvedValue({ error: null });
  const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
  const mockFrom = vi.fn().mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    update: mockUpdate,
  });

  return {
    mockClient: {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        getSession: vi.fn(),
      },
      from: mockFrom,
    },
    // Eksportujemy poszczególne mocki, aby można było je zmieniać w testach
    mockMaybeSingle,
    mockEq,
    mockSelect,
    mockInsert,
    mockUpdate,
    mockFrom,
  };
};

describe("AuthService", () => {
  let authService: AuthService;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabaseClient();
    // Używamy mocka Supabase z właściwym typem
    authService = new AuthService(mockSupabase.mockClient as unknown as SupabaseClient);
  });

  describe("userExistsByEmail", () => {
    it("powinno zwrócić true jeśli użytkownik istnieje", async () => {
      mockSupabase.mockMaybeSingle.mockResolvedValueOnce({ data: { id: "123" }, error: null });

      const result = await authService.userExistsByEmail("istniejacy@example.com");
      expect(result).toBe(true);
    });

    it("powinno zwrócić false jeśli użytkownik nie istnieje", async () => {
      mockSupabase.mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const result = await authService.userExistsByEmail("nieistniejacy@example.com");
      expect(result).toBe(false);
    });

    it("powinno rzucić wyjątek w przypadku błędu bazy danych", async () => {
      mockSupabase.mockMaybeSingle.mockResolvedValueOnce({
        data: null,
        error: { message: "Błąd bazy danych" },
      });

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

      // Użytkownik nie istnieje
      mockSupabase.mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

      // Mock dla rejestracji użytkownika
      mockSupabase.mockClient.auth.signUp.mockResolvedValueOnce({
        data: { user: { id: mockUserId, email: mockUserData.email } },
        error: null,
      });

      // Mock dla pobrania sesji
      mockSupabase.mockClient.auth.getSession.mockResolvedValueOnce({
        data: { session: { access_token: mockToken } },
        error: null,
      });

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
      expect(mockSupabase.mockClient.auth.signUp).toHaveBeenCalledWith({
        email: mockUserData.email,
        password: mockUserData.password,
      });

      expect(mockSupabase.mockClient.auth.getSession).toHaveBeenCalled();

      dateSpy.mockRestore();
    });

    it("powinno rzucić wyjątek jeśli użytkownik z podanym emailem już istnieje", async () => {
      // Użytkownik już istnieje
      mockSupabase.mockMaybeSingle.mockResolvedValueOnce({ data: { id: "123" }, error: null });

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
      mockSupabase.mockClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: mockUserId, email: mockCredentials.email },
          session: { access_token: mockToken },
        },
        error: null,
      });

      const result = await authService.loginUser(mockCredentials);

      expect(result).toEqual({
        id: mockUserId,
        email: mockCredentials.email,
        token: mockToken,
      });

      // Sprawdzamy czy wszystkie potrzebne metody zostały wywołane
      expect(mockSupabase.mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
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
      mockSupabase.mockClient.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: "Invalid login credentials" },
      });

      await expect(authService.loginUser(mockCredentials)).rejects.toThrow("Nieprawidłowy email lub hasło");
    });
  });
});
