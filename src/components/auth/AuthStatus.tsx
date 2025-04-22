import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthContext";
import { LogOut } from "lucide-react";
// import type { UserDTO } from "@/types"; // Usunięto nieużywany import

// Usunięto propsy - komponent polega tylko na kontekście
// interface AuthStatusProps {
//   initialUser?: UserDTO | null;
// }

// Komponent wyświetlający status autentykacji (UPROSZCZONY DO DEBUGOWANIA)
const AuthStatus: React.FC = () => {
  // Usunięto propsy z definicji
  const { user: contextUser, logout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Dodajemy dodatkowe logowanie, żeby zobaczyć co się dzieje
  useEffect(() => {
    console.log("[AuthStatus] Auth state changed:", {
      contextUser,
      isLoggedIn: !!contextUser,
      isLoading,
    });
  }, [contextUser, isLoading]);

  const handleLoginClick = () => {
    window.location.href = "/login";
  };

  const handleRegisterClick = () => {
    window.location.href = "/register";
  };

  const forceLogout = () => {
    // Czyścimy wszystkie możliwe tokeny i dane sesji
    console.log("[AuthStatus] Performing force logout - clearing all tokens and storage");

    // Czyść localStorage
    localStorage.clear();

    // Czyść sessionStorage
    sessionStorage.clear();

    // Czyść cookies związane z autentykacją (podejście ogólne)
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Przekieruj bezpośrednio na stronę logowania
    window.location.href = "/login?logout=success";
  };

  const handleLogoutClick = async () => {
    console.log("[AuthStatus] handleLogoutClick triggered!");
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      console.log("[AuthStatus] Attempting to call logout() from context...");

      // Najpierw wywołaj standardową funkcję logout
      await logout();
      console.log("[AuthStatus] Standard logout completed");

      // Następnie wykonaj force logout
      forceLogout();
    } catch (error) {
      console.error("[AuthStatus] Error during logout:", error);

      // Nawet jeśli standardowe wylogowanie się nie powiedzie,
      // spróbuj wymusić wylogowanie
      alert("Wystąpił błąd podczas wylogowywania. Próbuję wymusić wylogowanie...");
      forceLogout();
    }
  };

  // Zawsze pokazujemy przycisk wylogowania, jeśli istnieje contextUser
  return (
    <div className="flex flex-col gap-2">
      {contextUser ? (
        <>
          <div className="text-sm">
            Zalogowano jako <span className="font-medium">{contextUser.email}</span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={handleLogoutClick}
            disabled={isLoggingOut}
          >
            <LogOut size={16} />
            {isLoggingOut ? "Wylogowywanie..." : "Wyloguj się"}
          </Button>
        </>
      ) : isLoading ? (
        <>
          <div className="text-sm">Sprawdzanie sesji...</div>
          <Button variant="outline" size="sm" className="w-full" onClick={forceLogout}>
            Wymuś wylogowanie
          </Button>
        </>
      ) : (
        <>
          <div className="text-sm mb-1">Nie jesteś zalogowany</div>
          <div className="flex gap-2">
            <Button variant="default" size="sm" className="flex-1" onClick={handleLoginClick}>
              Zaloguj
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleRegisterClick}>
              Zarejestruj
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AuthStatus;
