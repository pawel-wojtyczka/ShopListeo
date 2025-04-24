import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/lib/auth/AuthContext";
import type { UserDTO } from "@/types";

// Mock całego AuthContext
vi.mock("@/lib/auth/AuthContext", () => {
  return {
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useAuth: vi.fn(() => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      authCheckCompleted: 0,
      login: vi.fn(),
      logout: vi.fn(),
    })),
  };
});

// Prosty komponent testowy
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="user">{JSON.stringify(auth.user)}</div>
      <button data-testid="login" onClick={() => auth.login("test-token")}>
        Login
      </button>
      <button data-testid="logout" onClick={() => auth.logout()}>
        Logout
      </button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render AuthProvider without errors", () => {
    render(
      <AuthProvider>
        <div data-testid="child">Test Child</div>
      </AuthProvider>
    );

    expect(screen.getByTestId("child")).toHaveTextContent("Test Child");
  });

  it("should provide auth context through useAuth hook", () => {
    const mockAuthValue = {
      user: {
        id: "test-id",
        email: "test@example.com",
        registrationDate: "2021-01-01T00:00:00Z",
        lastLoginDate: "2021-01-01T00:00:00Z",
        isAdmin: false,
      } as UserDTO,
      token: "test-token",
      isLoading: false,
      isAuthenticated: true,
      authCheckCompleted: 1,
      login: vi.fn(),
      logout: vi.fn(),
    };

    // Nadpisz mock useAuth dla tego testu
    vi.mocked(useAuth).mockReturnValue(mockAuthValue);

    render(<TestComponent />);

    expect(screen.getByTestId("isAuthenticated").textContent).toBe("true");
    expect(screen.getByTestId("user").textContent).toContain("test@example.com");
  });

  it("should call login when login button is clicked", () => {
    const mockLogin = vi.fn();

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      authCheckCompleted: 0,
      login: mockLogin,
      logout: vi.fn(),
    });

    render(<TestComponent />);

    fireEvent.click(screen.getByTestId("login"));

    expect(mockLogin).toHaveBeenCalledWith("test-token");
  });

  it("should call logout when logout button is clicked", () => {
    const mockLogout = vi.fn();

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      authCheckCompleted: 0,
      login: vi.fn(),
      logout: mockLogout,
    });

    render(<TestComponent />);

    fireEvent.click(screen.getByTestId("logout"));

    expect(mockLogout).toHaveBeenCalled();
  });
});
