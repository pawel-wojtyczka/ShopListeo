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
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(false);
  const [lastCheck, setLastCheck] = useState<number>(0);

  // Funkcja sprawdzająca status autentykacji
  const checkAuthStatus = async () => {
    if (isCheckingAuth) return; // Zapobiegamy wielu równoczesnym wywołaniom

    setIsCheckingAuth(true);
    console.log("[AuthContext] checkAuthStatus running...");

    try {
      // Próbujemy pobrać token z localStorage lub sessionStorage
      const storedToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

      // Próbujemy też pobrać token bezpośrednio z sesji Supabase
      let sessionToken = storedToken;

      try {
        // Pobieramy sesję z Supabase Client
        console.log("[AuthContext] Trying to get Supabase session");
        const { data: sessionData } = await supabaseClient.auth.getSession();
        console.log("[AuthContext] Supabase session response:", {
          hasSession: !!sessionData?.session,
          hasToken: !!sessionData?.session?.access_token,
        });

        if (sessionData?.session?.access_token) {
          sessionToken = sessionData.session.access_token;
          console.log("[AuthContext] Got token from Supabase session");
        }
      } catch (error) {
        console.error("[AuthContext] Error getting Supabase session:", error);
      }

      // Aktualizujemy stan tokenu
      setToken(sessionToken);

      // If no token AND no user is currently set, we still check with API, since cookies may have valid session
      // the middleware might be able to verify the user even without a token in localStorage/sessionStorage
      console.log(`[AuthContext] Token: ${!!sessionToken}, Current User: ${!!user}. Fetching /api/users/me...`);

      try {
        // Dodajemy token do headers, jeśli jest dostępny
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (sessionToken) {
          headers["Authorization"] = `Bearer ${sessionToken}`;
        }

        console.log("[AuthContext] Sending request to /api/users/me with headers:", headers);
        const response = await fetch("/api/users/me", { headers });
        console.log(`[AuthContext] /api/users/me response status: ${response.status}`);

        if (response.ok) {
          const userData: UserDTO = await response.json();
          console.log("[AuthContext] User data received:", userData);
          setUser(userData); // Update user state
          setIsLoading(false); // Explicit set isLoading to false after successful auth

          // Jeśli mamy userDTO ale nie mamy tokenu, nadal jesteśmy zalogowani (przez cookies/middleware)
          if (!sessionToken && userData) {
            console.log("[AuthContext] User authenticated via server-side session (no client token)");
          }
        } else {
          // Clear user and token if request fails
          console.log("[AuthContext] Auth check failed, clearing state.");
          setUser(null);
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          setIsLoading(false); // Explicit set isLoading to false after failed auth
        }
      } catch (error) {
        console.error("[AuthContext] Error fetching /api/users/me:", error);
        setUser(null); // Clear user on fetch error
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        setIsLoading(false); // Explicit set isLoading to false after error
      }
    } catch (error) {
      console.error("[AuthContext] Unexpected error in checkAuthStatus:", error);
      setUser(null);
      setIsLoading(false); // Explicit set isLoading to false after unexpected error
    } finally {
      console.log("[AuthContext] Setting isCheckingAuth to false");
      setIsCheckingAuth(false);
      setLastCheck(Date.now()); // Zapisujemy czas ostatniego sprawdzenia
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
    isLoading: isLoading && isCheckingAuth, // Tylko gdy ładujemy i sprawdzamy auth
    isAuthenticated: !!user, // Jeśli mamy obiekt użytkownika, jesteśmy zalogowani (niezależnie od tokenu)
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
      console.log("[AuthContext] logout called");
      // Wyloguj z Supabase Auth
      try {
        await supabaseClient.auth.signOut();
      } catch (error) {
        console.error("[AuthContext] Error signing out from Supabase:", error);
      }

      // Wyczyść lokalne stany
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      setUser(null);
      setToken(null);

      // Przekierowanie do strony logowania
      window.location.href = "/login";
    },
  };

  console.log("[AuthContext] Rendering with values:", {
    hasUser: !!user,
    hasToken: !!token,
    isLoading: value.isLoading,
    isCheckingAuth,
    isAuthenticated: !!user,
    lastCheck: new Date(lastCheck).toISOString(),
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
