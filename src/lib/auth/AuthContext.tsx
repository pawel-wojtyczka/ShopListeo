import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { UserDTO } from "../../types";

// Interfejs kontekstu autoryzacji
interface AuthContextType {
  user: UserDTO | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, rememberMe?: boolean) => void;
  logout: () => void;
}

// Domyślne wartości kontekstu
const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: () => {},
};

// Utworzenie kontekstu
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Hook do korzystania z kontekstu autoryzacji
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Dostawca kontekstu autoryzacji
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sprawdzenie statusu autentykacji przy montowaniu komponentu
  useEffect(() => {
    // Define checkAuthStatus function directly inside useEffect
    const checkAuthStatus = async () => {
      console.log("[AuthContext] checkAuthStatus running...");
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      // If no token AND no user is currently set, we are definitely logged out.
      if (!token && !user) {
        console.log("[AuthContext] No token and no user, setting loading false.");
        setIsLoading(false);
        return;
      }

      // If we have a token OR a user already (re-validate on mount)
      console.log(`[AuthContext] Token: ${!!token}, Current User: ${!!user}. Fetching /api/users/me...`);
      setIsLoading(true);
      try {
        const response = await fetch("/api/users/me");
        console.log(`[AuthContext] /api/users/me response status: ${response.status}`);

        if (!response.ok) {
          // Clear user and token if request fails
          setUser(null);
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          // Don't throw error here, just set logged out state
          console.log("[AuthContext] Auth check failed, clearing state.");
        } else {
          const userData: UserDTO = await response.json();
          console.log("[AuthContext] User data received:", userData);
          setUser(userData); // Update user state
        }
      } catch (error) {
        console.error("[AuthContext] Error fetching /api/users/me:", error);
        setUser(null); // Clear user on fetch error
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // We only want this effect to run on mount, or potentially when the token changes
    // For simplicity, run only on mount. Login/logout actions should update the context.
  }, []); // Empty dependency array: runs only on mount

  // Funkcja do logowania
  const login = (newToken: string, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem("authToken", newToken);
    } else {
      sessionStorage.setItem("authToken", newToken);
    }

    setToken(newToken);

    // W rzeczywistej aplikacji powinniśmy pobrać dane użytkownika z API
    // Tutaj zakładamy, że użytkownik jest już zalogowany
    // i dane zostały pobrane w useEffect
  };

  // Funkcja do wylogowywania
  const logout = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    setUser(null);
    setToken(null);

    // Przekierowanie do strony logowania
    window.location.href = "/login";
  };

  // Wartość kontekstu
  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
