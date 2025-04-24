import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import { createClient } from "@supabase/supabase-js";

// Mock Supabase
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  })),
}));

// Test component do testowania hooka useAuth
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="user">{JSON.stringify(auth.user)}</div>
      <button onClick={() => auth.login("test-token")}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    role: "",
    updated_at: new Date().toISOString(),
  };

  const mockSession = {
    access_token: "test-token",
    refresh_token: "test-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("AuthProvider initialization", () => {
    it("should initialize with no authenticated user", () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
      expect(screen.getByTestId("user")).toHaveTextContent("");
    });

    it("should initialize with authenticated user from session", async () => {
      const supabase = createClient("", "");
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: {
          session: mockSession,
        },
        error: null,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("true");
        expect(screen.getByTestId("user")).toContain(mockUser.email);
      });
    });
  });

  describe("useAuth hook", () => {
    it("should provide login functionality", async () => {
      const supabase = createClient("", "");
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByText("Login").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("true");
        expect(screen.getByTestId("user")).toContain(mockUser.email);
      });
    });

    it("should provide logout functionality", async () => {
      const supabase = createClient("", "");
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: null,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByText("Logout").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
        expect(screen.getByTestId("user")).toHaveTextContent("");
      });
    });

    it("should handle login errors", async () => {
      const supabase = createClient("", "");
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new Error("Invalid credentials") as any,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByText("Login").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
      });
    });
  });
});
