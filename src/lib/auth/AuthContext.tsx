import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
      console.log("[AuthContext] checkAuthStatus: Already checking, returning.");
      return;
    }

    setIsCheckingAuth(true);
    console.log("[AuthContext] checkAuthStatus: Starting...");

    try {
      // Pobieramy najpierw sesję z ciasteczka jeśli jest dostępna
      console.log("[AuthContext] checkAuthStatus: Getting stored token...");
      let sessionToken: string | null =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("authToken="))
          ?.split("=")[1] || null;

      // Jeśli nie ma w ciasteczku, sprawdzamy storage
      if (!sessionToken) {
        sessionToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      }

      console.log(`[AuthContext] checkAuthStatus: Stored token found: ${!!sessionToken}`);

      try {
        // Pobieramy sesję z Supabase Client
        console.log("[AuthContext] checkAuthStatus: Getting Supabase session...");
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) {
          console.error("[AuthContext] checkAuthStatus: Error getting Supabase session:", sessionError);
        }
        console.log("[AuthContext] checkAuthStatus: Supabase getSession response received.", {
          hasSession: !!sessionData?.session,
        });

        if (sessionData?.session?.access_token) {
          sessionToken = sessionData.session.access_token;
          console.log("[AuthContext] checkAuthStatus: Token updated from Supabase session.");

          // Zapisujemy token w local/session storage jeśli mamy nowy z Supabase
          if (localStorage.getItem("authToken")) {
            localStorage.setItem("authToken", sessionToken);
          } else if (sessionStorage.getItem("authToken")) {
            sessionStorage.setItem("authToken", sessionToken);
          } else {
            // Jeśli nie ma wcześniej zapisanego, zapisujemy w sessionStorage
            sessionStorage.setItem("authToken", sessionToken);
          }
        }
      } catch (error) {
        console.error("[AuthContext] checkAuthStatus: CATCH block for Supabase session error:", error);
      }

      // Aktualizujemy stan tokenu
      console.log(`[AuthContext] checkAuthStatus: Setting token state: ${!!sessionToken}`);
      setToken(sessionToken);

      console.log(
        `[AuthContext] checkAuthStatus: Attempting to fetch /api/users/me... Token included: ${!!sessionToken}`
      );
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (sessionToken) {
          headers["Authorization"] = `Bearer ${sessionToken}`;
        }

        const response = await fetch("/api/users/me", { headers });
        console.log(`[AuthContext] checkAuthStatus: Fetch /api/users/me completed. Status: ${response.status}`);

        if (response.ok) {
          const userData: UserDTO = await response.json();
          console.log("[AuthContext] checkAuthStatus: User data received, setting user state.", userData);
          setUser(userData);
          setAuthCheckCounter((prev) => prev + 1);
          setIsLoading(false);
        } else {
          console.log("[AuthContext] checkAuthStatus: Fetch not OK, clearing user state.");
          setUser(null);
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          // Retry once if the token didn't work and we have Supabase session
          try {
            console.log("[AuthContext] checkAuthStatus: Retrying with fresh Supabase session...");
            const { data: refreshData } = await supabaseClient.auth.getSession();

            if (refreshData?.session?.access_token) {
              console.log("[AuthContext] checkAuthStatus: Got fresh token from Supabase, retrying...");
              const freshToken = refreshData.session.access_token;

              const freshHeaders: Record<string, string> = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${freshToken}`,
              };

              const freshResponse = await fetch("/api/users/me", { headers: freshHeaders });

              if (freshResponse.ok) {
                const userData: UserDTO = await freshResponse.json();
                console.log("[AuthContext] checkAuthStatus: Retry successful, setting user state.", userData);
                setUser(userData);
                setToken(freshToken);
                sessionStorage.setItem("authToken", freshToken);
                setAuthCheckCounter((prev) => prev + 1);
              } else {
                console.log("[AuthContext] checkAuthStatus: Retry failed, giving up.");
                setUser(null);
              }
            }
          } catch (retryError) {
            console.error("[AuthContext] checkAuthStatus: Retry error:", retryError);
          }
        }
      } catch (error) {
        console.error("[AuthContext] checkAuthStatus: CATCH block for fetch /api/users/me error:", error);
        setUser(null);
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("[AuthContext] checkAuthStatus: CATCH block for outer try:", error);
      setUser(null);
    } finally {
      console.log("[AuthContext] checkAuthStatus: Finally block. Setting isCheckingAuth=false and isLoading=false.");
      setIsCheckingAuth(false);
      setIsLoading(false);
      setLastCheck(Date.now());
    }
  };

  // Sprawdzenie statusu autentykacji przy montowaniu komponentu
  useEffect(() => {
    console.log("[AuthContext] useEffect running - initial auth check");
    checkAuthStatus();
  }, []);

  // Definicja funkcji logout opakowana w useCallback
  const logoutCallback = useCallback(async () => {
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
  }, []);

  // Wartość kontekstu
  const value: AuthContextType = {
    user,
    token,
    isLoading: isLoading,
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
    logout: logoutCallback,
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
