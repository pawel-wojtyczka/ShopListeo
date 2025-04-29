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
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Zaczynamy jako loading
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<boolean>(false);
  const [authCheckCounter, setAuthCheckCounter] = useState<number>(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false); // Nowy stan

  // Funkcja do pobierania danych użytkownika przez API /api/users/me
  // Opiera się na ciasteczkach sesji sb-* wysyłanych automatycznie przez przeglądarkę
  const fetchUserData = useCallback(async () => {
    setIsLoading(true); // Rozpoczynamy ładowanie

    try {
      // Wywołujemy endpoint /api/users/me bez nagłówka Authorization
      // Serwer zweryfikuje sesję na podstawie ciasteczek sb-*
      const response = await fetch("/api/users/me");

      if (response.ok) {
        const userData: UserDTO = await response.json();
        setUser(userData);
        setIsAuthenticatedState(true); // Użytkownik jest uwierzytelniony
        setAuthCheckCounter((prev) => prev + 1); // Zwiększamy licznik udanych sprawdzeń
      } else {
        // Jeśli odpowiedź nie jest OK (np. 401 Unauthorized), oznacza to brak ważnej sesji
        // console.warn(
        //   `[AuthContext] fetchUserData: Fetch not OK (${response.status}), user is not authenticated or session expired.`
        // );
        setUser(null);
        setIsAuthenticatedState(false); // Użytkownik nie jest uwierzytelniony
        // Nie musimy czyścić żadnych tokenów po stronie klienta
      }
    } catch (_error) {
      // console.error("[AuthContext] fetchUserData: Error fetching user data:", error);
      setUser(null);
      setIsAuthenticatedState(false);
    } finally {
      setIsLoading(false); // Kończymy ładowanie niezależnie od wyniku
      if (!initialLoadComplete) {
        setInitialLoadComplete(true); // Oznaczamy pierwsze ładowanie jako zakończone
      }
    }
  }, [initialLoadComplete]); // Dodano initialLoadComplete jako zależność useCallback, aby uniknąć ostrzeżenia, chociaż nie jest to ściśle konieczne dla logiki.

  // Efekt do początkowego sprawdzenia autentykacji przy montowaniu komponentu
  useEffect(() => {
    // Od razu wywołujemy fetchUserData, aby sprawdzić sesję serwerową
    fetchUserData();

    // Ten efekt powinien uruchomić się tylko raz przy montowaniu
  }, [fetchUserData]); // Pusta tablica zależności zapewnia uruchomienie tylko raz

  // Funkcja logowania: po prostu odświeża dane użytkownika
  // Zakładamy, że API logowania (/api/auth/login) poprawnie ustawiło ciasteczka sb-*
  const loginCallback = useCallback(() => {
    fetchUserData(); // Odśwież dane użytkownika, aby zsynchronizować stan z sesją serwerową
  }, [fetchUserData]); // Zależność od fetchUserData

  // Funkcja wylogowania
  const logoutCallback = useCallback(async () => {
    // Najpierw czyścimy stan lokalny dla szybszej reakcji interfejsu
    setUser(null);
    setIsAuthenticatedState(false);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok && response.status !== 204) {
        // Logujemy błąd, ale kontynuujemy, ponieważ stan lokalny już wyczyszczony
        // W przyszłości można dodać bardziej szczegółową obsługę błędów API logout
      } else {
        // No action needed on successful logout API call
      }
    } catch (_error) {
      // Obsługa błędów sieciowych itp. przy wylogowaniu
      // Stan lokalny jest już wyczyszczony, więc głównie logowanie
    }

    // Nie ma potrzeby wywoływać supabaseClient.auth.signOut() po stronie klienta
    // Nie ma potrzeby czyścić localStorage/sessionStorage/cookie authToken

    // Po zakończeniu operacji serwerowych, przekierowujemy użytkownika
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

  // Renderuj dzieci tylko po zakończeniu pierwszego ładowania
  return <AuthContext.Provider value={value}>{initialLoadComplete ? children : null}</AuthContext.Provider>;
}

// Dodatkowe eksporty dla ułatwienia użycia
export { AuthContext }; // Eksport kontekstu, jeśli potrzebny bezpośrednio
