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
    const checkAuthStatus = async () => {
      try {
        // Sprawdzenie czy token jest w localStorage lub sessionStorage
        const storedToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

        if (!storedToken) {
          // Brak tokenu - użytkownik nie jest zalogowany
          setIsLoading(false);
          return;
        }

        // Pobranie profilu użytkownika za pomocą tokenu
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setToken(storedToken);
        } else {
          // Token jest nieważny - wyloguj użytkownika
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("Błąd sprawdzania statusu autentykacji:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

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
