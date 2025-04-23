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
  console.log("%c[AuthContext] AuthProvider rendering/re-rendering...", "color: orange; font-weight: bold;");

  const [user, setUser] = useState<UserDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [authCheckCounter, setAuthCheckCounter] = useState<number>(0);

  // Function to fetch user data based on the current token state
  const fetchUserData = useCallback(async () => {
    // Guard against running if token is null (e.g., during logout)
    if (!token) {
      console.log("[AuthContext] fetchUserData: Called without token, skipping fetch.");
      // Ensure user is cleared if token is missing
      if (user !== null) setUser(null);
      // Ensure loading is false if there's no token to fetch with
      if (isLoading) setIsLoading(false);
      return;
    }

    console.log("[AuthContext] fetchUserData: Starting with token...");
    setIsLoading(true); // Set loading true when fetching

    try {
      // Check Supabase session for potentially fresher token? (Optional optimization)
      // For now, rely on the token passed to login or found initially
      const { data: sessionData } = await supabaseClient.auth.getSession();
      let currentToken = token;
      // Add logging to see the tokens being compared
      console.log("[AuthContext] fetchUserData: Comparing tokens.", {
        stateToken: token,
        supabaseSessionToken: sessionData?.session?.access_token?.substring(0, 10) + "...", // Log only prefix for security
      });

      if (sessionData?.session?.access_token && sessionData.session.access_token !== token) {
        console.warn(
          "[AuthContext] fetchUserData: Token mismatch detected! Supabase session token is different from state token. Updating state token."
        );
        console.log(
          "[AuthContext] fetchUserData: Details - State Token:",
          token?.substring(0, 10) + "...",
          "Supabase Token:",
          sessionData.session.access_token.substring(0, 10) + "..."
        );
        currentToken = sessionData.session.access_token;
        // Update storage/cookie if needed - careful about loops
        setToken(currentToken); // Update state, this might trigger another effect run, be cautious
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentToken}`,
      };
      const response = await fetch("/api/users/me", { headers });
      console.log(`[AuthContext] fetchUserData: Fetch /api/users/me completed. Status: ${response.status}`);

      if (response.ok) {
        const userData: UserDTO = await response.json();
        console.log("[AuthContext] fetchUserData: User data received.", userData);
        setUser(userData);
        setAuthCheckCounter((prev) => prev + 1);
      } else {
        console.warn(`[AuthContext] fetchUserData: Fetch not OK (${response.status}), clearing user state and token.`);
        setUser(null);
        setToken(null); // Clear token state if it's invalid
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax"; // Clear cookie
        // Optionally clear Supabase session too?
        // await supabaseClient.auth.signOut();
      }
    } catch (error) {
      console.error("[AuthContext] fetchUserData: Error fetching user data:", error);
      setUser(null);
      setToken(null); // Clear token state on error
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    } finally {
      console.log("[AuthContext] fetchUserData: Finished.");
      setIsLoading(false); // Set loading false when done
      setLastCheck(Date.now());
    }
  }, [token]); // ONLY depend on the token. State setters (setUser, setIsLoading)
  // do not need to be dependencies for the function's identity.

  // Effect for initial auth check (reading stored token)
  useEffect(() => {
    console.log(
      "%c[AuthContext] useEffect [MOUNT]: Running check for stored token...",
      "color: blue; font-weight: bold;"
    );
    let storedToken: string | null = null;
    try {
      // Prioritize cookie, then localStorage, then sessionStorage
      storedToken =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("authToken="))
          ?.split("=")[1] || null;

      if (!storedToken) {
        storedToken = localStorage.getItem("authToken");
      }
      if (!storedToken) {
        storedToken = sessionStorage.getItem("authToken");
      }
    } catch (e) {
      console.error("[AuthContext] Error reading token from storage/cookie", e);
    }

    if (storedToken) {
      console.log("[AuthContext] useEffect [initial mount]: Found stored token, setting state.");
      setToken(storedToken); // This will trigger the fetchUserData effect below
    } else {
      console.log("[AuthContext] useEffect [initial mount]: No stored token found.");
      setIsLoading(false); // Not loading if no token found initially
    }
    // This effect should run only once on mount
  }, []);

  // Effect to react to token changes (either from initial load or login)
  useEffect(() => {
    if (token) {
      console.log("[AuthContext] useEffect [token change]: Token present, fetching user data.");
      fetchUserData();
    } else {
      // Token is null (either initially before check, or after logout/error)
      console.log("[AuthContext] useEffect [token change]: Token is null.");
      if (user !== null) {
        setUser(null); // Ensure user is cleared if token becomes null
      }
      // If token becomes null after initial load, stop loading indicator
      // Check ensures we don't override initial isLoading=true before initial check runs
      if (lastCheck > 0 && isLoading) {
        setIsLoading(false);
      }
    }
    // Run whenever the token state changes *or* fetchUserData function identity changes (though unlikely with useCallback)
  }, [token, fetchUserData]);

  // Login function: store token, set state (triggers effect)
  const loginCallback = useCallback((newToken: string, rememberMe = false) => {
    console.log("[AuthContext] login: Storing token and updating state.");
    try {
      if (rememberMe) {
        localStorage.setItem("authToken", newToken);
        sessionStorage.removeItem("authToken");
      } else {
        sessionStorage.setItem("authToken", newToken);
        localStorage.removeItem("authToken");
      }
      // Set cookie as well
      const maxAge = rememberMe ? 60 * 60 * 24 * 7 : ""; // Session cookie if not rememberMe
      const secureFlag = import.meta.env.PROD ? "Secure;" : "";
      document.cookie = `authToken=${newToken}; path=/; max-age=${maxAge}; ${secureFlag} SameSite=Lax`;

      setToken(newToken); // Update state, which triggers the useEffect -> fetchUserData
    } catch (e) {
      console.error("[AuthContext] Error storing token", e);
    }
  }, []);

  // Logout function
  const logoutCallback = useCallback(async () => {
    console.log("[AuthContext] logout: Clearing state and calling API.");

    // Store current user/token before clearing for potential logging
    // const loggedOutUser = user?.email; // Removed unused variable
    // const loggedOutToken = token; // Removed unused variable

    // Clear local state first for faster UI feedback
    setUser(null);
    setToken(null); // Clear token state, triggers useEffect to clear user if needed
    try {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
      console.log("[AuthContext] logout: Local state and storage cleared.");
    } catch (e) {
      console.error("[AuthContext] logout: Error clearing local storage/cookie:", e);
    }

    // Call server-side logout and Supabase signout
    console.log("[AuthContext] logout: Signing out from Supabase...");
    try {
      const { error: signOutError } = await supabaseClient.auth.signOut();
      if (signOutError) {
        console.error("[AuthContext] logout: Supabase signOut error:", signOutError);
      } else {
        console.log("[AuthContext] logout: Supabase signOut successful.");
      }
    } catch (error) {
      console.error("[AuthContext] logout: Error during Supabase signOut:", error);
    }

    console.log("[AuthContext] logout: Attempting to fetch /api/auth/logout...");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      console.log(`[AuthContext] logout: Fetch /api/auth/logout completed. Status: ${response.status}`);
      if (!response.ok && response.status !== 204) {
        console.error(`[AuthContext] logout: Logout API endpoint failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("[AuthContext] logout: Error during fetch /api/auth/logout:", error);
    }

    // Redirect after cleanup
    console.log("[AuthContext] logout: Redirecting to /login...");
    try {
      // Use replace to prevent back button going to authenticated page
      window.location.replace("/login");
    } catch (e) {
      console.error("[AuthContext] logout: Error during redirect:", e);
    }
  }, [user, token]); // Include user/token dependencies if used for logging before clearing

  // Wartość kontekstu
  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    authCheckCompleted: authCheckCounter,
    login: loginCallback,
    logout: logoutCallback,
  };

  console.log("[AuthContext] Rendering with values:", {
    hasUser: !!user,
    hasToken: !!token,
    isLoading: value.isLoading,
    isAuthenticated: value.isAuthenticated,
    lastCheck: lastCheck > 0 ? new Date(lastCheck).toISOString() : "N/A",
    authCheckCompleted: value.authCheckCompleted,
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
