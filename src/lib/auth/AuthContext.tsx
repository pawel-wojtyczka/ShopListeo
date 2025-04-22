import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { UserDTO } from "../../types";
import { supabaseClient } from "../../db/supabase.client";

// Interfejs kontekstu autoryzacji
interface AuthContextType {
  user: UserDTO | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authCheckCompleted: number;
  login: (token: string, rememberMe?: boolean) => void;
  logout: () => Promise<void>;
}

// Domyślne wartości kontekstu
const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  authCheckCompleted: 0,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: async () => {},
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
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(false);
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [authCheckCounter, setAuthCheckCounter] = useState<number>(0);

  // Funkcja sprawdzająca status autentykacji
  const checkAuthStatus = async () => {
    if (isCheckingAuth) {
      console.log("[AuthContext] checkAuthStatus: Already checking, returning."); // Log 1
      return;
    }

    setIsCheckingAuth(true);
    console.log("[AuthContext] checkAuthStatus: Starting..."); // Log 2

    try {
      // Próbujemy pobrać token z localStorage lub sessionStorage
      console.log("[AuthContext] checkAuthStatus: Getting stored token..."); // Log 3
      const storedToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      let sessionToken = storedToken;
      console.log(`[AuthContext] checkAuthStatus: Stored token found: ${!!storedToken}`); // Log 4

      try {
        // Pobieramy sesję z Supabase Client
        console.log("[AuthContext] checkAuthStatus: Getting Supabase session..."); // Log 5
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) {
          console.error("[AuthContext] checkAuthStatus: Error getting Supabase session:", sessionError); // Log 6a
        }
        console.log("[AuthContext] checkAuthStatus: Supabase getSession response received.", {
          hasSession: !!sessionData?.session,
        }); // Log 6b

        if (sessionData?.session?.access_token) {
          sessionToken = sessionData.session.access_token;
          console.log("[AuthContext] checkAuthStatus: Token updated from Supabase session."); // Log 7
        }
      } catch (error) {
        console.error("[AuthContext] checkAuthStatus: CATCH block for Supabase session error:", error); // Log 8
      }

      // Aktualizujemy stan tokenu
      console.log(`[AuthContext] checkAuthStatus: Setting token state: ${!!sessionToken}`); // Log 9
      setToken(sessionToken);

      console.log(
        `[AuthContext] checkAuthStatus: Attempting to fetch /api/users/me... Token included: ${!!sessionToken}`
      ); // Log 10
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (sessionToken) {
          headers["Authorization"] = `Bearer ${sessionToken}`;
        }

        const response = await fetch("/api/users/me", { headers });
        console.log(`[AuthContext] checkAuthStatus: Fetch /api/users/me completed. Status: ${response.status}`); // Log 11

        if (response.ok) {
          const userData: UserDTO = await response.json();
          console.log("[AuthContext] checkAuthStatus: User data received, setting user state.", userData); // Log 12
          setUser(userData);
          console.log("[AuthContext] checkAuthStatus: Setting isLoading=false (fetch OK)."); // Log 13a
          setIsLoading(false);
          setAuthCheckCounter((prev) => prev + 1);
        } else {
          console.log("[AuthContext] checkAuthStatus: Fetch not OK, clearing user state."); // Log 14
          setUser(null);
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          console.log("[AuthContext] checkAuthStatus: Setting isLoading=false (fetch not OK)."); // Log 13b
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[AuthContext] checkAuthStatus: CATCH block for fetch /api/users/me error:", error); // Log 15
        setUser(null);
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        console.log("[AuthContext] checkAuthStatus: Setting isLoading=false (fetch catch block)."); // Log 13c
        setIsLoading(false);
      }
    } catch (error) {
      console.error("[AuthContext] checkAuthStatus: CATCH block for outer try:", error); // Log 16
      setUser(null);
      console.log("[AuthContext] checkAuthStatus: Setting isLoading=false (outer catch block)."); // Log 13d
      setIsLoading(false);
    } finally {
      console.log("[AuthContext] checkAuthStatus: Finally block. Setting isCheckingAuth=false."); // Log 17
      setIsCheckingAuth(false);
      setLastCheck(Date.now());
    }
  };

  // Sprawdzenie statusu autentykacji przy montowaniu komponentu
  useEffect(() => {
    console.log("[AuthContext] useEffect running - initial auth check");
    checkAuthStatus();
  }, []); // Empty dependency array: runs only on mount

  // Wartość kontekstu
  const value: AuthContextType = {
    user,
    token,
    isLoading: isCheckingAuth || isLoading,
    isAuthenticated: !!user,
    authCheckCompleted: authCheckCounter,
    login: (newToken: string, rememberMe = false) => {
      console.log("[AuthContext] login called with token");
      if (rememberMe) {
        localStorage.setItem("authToken", newToken);
      } else {
        sessionStorage.setItem("authToken", newToken);
      }

      setToken(newToken);

      // Wywołujemy checkAuthStatus po ustawieniu tokenu, aby pobrać dane użytkownika
      checkAuthStatus();
    },
    logout: async () => {
      console.log("[AuthContext] logout: Function entered.");

      // Wyczyść lokalne stany natychmiast (dla szybszej reakcji UI)
      try {
        setUser(null);
        setToken(null);
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        console.log("[AuthContext] logout: Local state and storage cleared.");
      } catch (e) {
        console.error("[AuthContext] logout: Error clearing local state:", e);
      }

      // Wywołaj serwerowy endpoint wylogowania
      console.log("[AuthContext] logout: Attempting to fetch /api/auth/logout...");
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
        });
        console.log(`[AuthContext] logout: Fetch completed. Status: ${response.status}`);

        if (!response.ok && response.status !== 204) {
          console.error(`[AuthContext] logout: Logout API endpoint failed with status: ${response.status}`);
        } else {
          console.log("[AuthContext] logout: Logout API endpoint successful or completed (status 204).");
        }
      } catch (error) {
        console.error("[AuthContext] logout: Error during fetch call:", error);
      }

      // Przekieruj do strony logowania (niezależnie od wyniku API, stan lokalny jest już wyczyszczony)
      console.log("[AuthContext] logout: Attempting redirect to /login...");
      try {
        window.location.href = "/login";
      } catch (e) {
        console.error("[AuthContext] logout: Error during redirect:", e);
      }
    },
  };

  console.log("[AuthContext] Rendering with values:", {
    hasUser: !!user,
    hasToken: !!token,
    isLoading: value.isLoading,
    isCheckingAuth,
    isAuthenticated: !!user,
    lastCheck: new Date(lastCheck).toISOString(),
    authCheckCompleted: value.authCheckCompleted,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
