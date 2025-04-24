import * as React from "react";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { UserDTO } from "../../types";
// Usunięto import supabaseClient, ponieważ wylogowanie klienta nie jest już potrzebne
// import { supabaseClient } from "../../db/supabase.client";

// Interfejs kontekstu autoryzacji - usunięto 'token', zmodyfikowano 'login'
interface AuthContextType {
  user: UserDTO | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authCheckCompleted: number; // Licznik udanych sprawdzeń sesji
  login: () => void; // Funkcja login nie przyjmuje już tokenu
  logout: () => Promise<void>;
  fetchUserData: () => Promise<void>; // Udostępnienie funkcji do ręcznego odświeżenia
}

// Domyślne wartości kontekstu - usunięto 'token'
const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  authCheckCompleted: 0,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  login: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  logout: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  fetchUserData: async () => {},
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
  const [isLoading, setIsLoading] = useState<boolean>(true); // Zaczynamy jako loading
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<boolean>(false);
  const [authCheckCounter, setAuthCheckCounter] = useState<number>(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false); // Nowy stan

  // Funkcja do pobierania danych użytkownika przez API /api/users/me
  // Opiera się na ciasteczkach sesji sb-* wysyłanych automatycznie przez przeglądarkę
  const fetchUserData = useCallback(async () => {
    console.log("[AuthContext] fetchUserData: Starting fetch for /api/users/me...");
    setIsLoading(true); // Rozpoczynamy ładowanie

    try {
      // Wywołujemy endpoint /api/users/me bez nagłówka Authorization
      // Serwer zweryfikuje sesję na podstawie ciasteczek sb-*
      const response = await fetch("/api/users/me");
      console.log(`[AuthContext] fetchUserData: Fetch /api/users/me completed. Status: ${response.status}`);

      if (response.ok) {
        const userData: UserDTO = await response.json();
        console.log("[AuthContext] fetchUserData: User data received.", userData);
        setUser(userData);
        setIsAuthenticatedState(true); // Użytkownik jest uwierzytelniony
        setAuthCheckCounter((prev) => prev + 1); // Zwiększamy licznik udanych sprawdzeń
      } else {
        // Jeśli odpowiedź nie jest OK (np. 401 Unauthorized), oznacza to brak ważnej sesji
        console.warn(
          `[AuthContext] fetchUserData: Fetch not OK (${response.status}), user is not authenticated or session expired.`
        );
        setUser(null);
        setIsAuthenticatedState(false); // Użytkownik nie jest uwierzytelniony
        // Nie musimy czyścić żadnych tokenów po stronie klienta
      }
    } catch (error) {
      console.error("[AuthContext] fetchUserData: Error fetching user data:", error);
      setUser(null); // Wyczyść użytkownika w razie błędu sieciowego itp.
      setIsAuthenticatedState(false);
    } finally {
      console.log("[AuthContext] fetchUserData: Finished.");
      setIsLoading(false); // Kończymy ładowanie niezależnie od wyniku
      if (!initialLoadComplete) {
        setInitialLoadComplete(true); // Oznaczamy pierwsze ładowanie jako zakończone
      }
    }
  }, [initialLoadComplete]); // Dodano initialLoadComplete jako zależność useCallback, aby uniknąć ostrzeżenia, chociaż nie jest to ściśle konieczne dla logiki.

  // Efekt do początkowego sprawdzenia autentykacji przy montowaniu komponentu
  useEffect(() => {
    console.log(
      "%c[AuthContext] useEffect [MOUNT]: Running initial authentication check...",
      "color: blue; font-weight: bold;"
    );
    // Od razu wywołujemy fetchUserData, aby sprawdzić sesję serwerową
    fetchUserData();

    // Ten efekt powinien uruchomić się tylko raz przy montowaniu
  }, [fetchUserData]); // Pusta tablica zależności zapewnia uruchomienie tylko raz

  // Funkcja logowania: po prostu odświeża dane użytkownika
  // Zakładamy, że API logowania (/api/auth/login) poprawnie ustawiło ciasteczka sb-*
  const loginCallback = useCallback(() => {
    console.log("[AuthContext] loginCallback: Triggering user data fetch after login attempt.");
    fetchUserData(); // Odśwież dane użytkownika, aby zsynchronizować stan z sesją serwerową
  }, [fetchUserData]); // Zależność od fetchUserData

  // Funkcja wylogowania
  const logoutCallback = useCallback(async () => {
    console.log("[AuthContext] logoutCallback: Initiating logout process.");

    // Najpierw czyścimy stan lokalny dla szybszej reakcji interfejsu
    setUser(null);
    setIsAuthenticatedState(false);

    console.log("[AuthContext] logoutCallback: Calling server-side logout endpoint /api/auth/logout...");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      console.log(`[AuthContext] logoutCallback: Fetch /api/auth/logout completed. Status: ${response.status}`);
      if (!response.ok && response.status !== 204) {
        // Logujemy błąd, ale kontynuujemy, ponieważ stan lokalny już wyczyszczony
        console.error(`[AuthContext] logoutCallback: Logout API endpoint failed with status: ${response.status}`);
      } else {
        console.log("[AuthContext] logoutCallback: Server-side logout successful.");
      }
    } catch (error) {
      console.error("[AuthContext] logoutCallback: Error during fetch /api/auth/logout:", error);
    }

    // Nie ma potrzeby wywoływać supabaseClient.auth.signOut() po stronie klienta
    // Nie ma potrzeby czyścić localStorage/sessionStorage/cookie authToken

    // Po zakończeniu operacji serwerowych, przekierowujemy użytkownika
    console.log("[AuthContext] logoutCallback: Redirecting to /login page.");
    window.location.href = "/login"; // Proste przekierowanie strony
  }, []); // Brak zależności

  // Przygotowanie wartości kontekstu
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: isAuthenticatedState,
    authCheckCompleted: authCheckCounter,
    login: loginCallback,
    logout: logoutCallback,
    fetchUserData, // Udostępniamy funkcję na zewnątrz
  };

  console.log("[AuthContext] Providing context value:", {
    isLoading: value.isLoading,
    isAuthenticated: value.isAuthenticated,
    userId: value.user?.id,
    authCheckCompleted: value.authCheckCompleted,
  });

  // Renderuj dzieci tylko po zakończeniu pierwszego ładowania
  return <AuthContext.Provider value={value}>{initialLoadComplete ? children : null}</AuthContext.Provider>;
}

// Dodatkowe eksporty dla ułatwienia użycia
export { AuthContext }; // Eksport kontekstu, jeśli potrzebny bezpośrednio
