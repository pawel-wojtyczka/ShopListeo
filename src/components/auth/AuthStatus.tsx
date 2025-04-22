import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthContext";
// import type { UserDTO } from "@/types"; // Usunięto nieużywany import

// Usunięto propsy - komponent polega tylko na kontekście
// interface AuthStatusProps {
//   initialUser?: UserDTO | null;
// }

// Komponent wyświetlający status autentykacji (UPROSZCZONY DO DEBUGOWANIA)
const AuthStatus: React.FC = () => {
  // Usunięto propsy z definicji
  const { user: contextUser, logout, isLoading } = useAuth();
  // displayUser bazuje teraz TYLKO na kontekście
  const displayUser = contextUser;

  console.log("[AuthStatus] Rendering with state (context only):", {
    isAuthenticated: !!displayUser,
    hasContextUser: !!contextUser,
    // hasInitialUser: false, // Usunięte
    displayUser,
    isLoading,
  });

  const handleLoginClick = () => {
    window.location.href = "/login";
  };

  const handleRegisterClick = () => {
    window.location.href = "/register";
  };

  const handleLogoutClick = async () => {
    console.log("[AuthStatus] handleLogoutClick triggered!");
    try {
      console.log("[AuthStatus] Attempting to call logout() from context...");
      await logout();
      console.log("[AuthStatus] logout() call completed (or promise resolved).");
    } catch (error) {
      console.error("[AuthStatus] Error caught during await logout():", error);
    }
    console.log("[AuthStatus] handleLogoutClick finished.");
  };

  // Przywrócona logika renderowania
  if (displayUser) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm">
          Zalogowano jako <span className="font-medium">{displayUser.email}</span>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogoutClick}>
          Wyloguj się
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm">Sprawdzanie sesji...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm mb-1">Nie jesteś zalogowany</div>
      <div className="flex gap-2">
        <Button variant="default" size="sm" className="flex-1" onClick={handleLoginClick}>
          Zaloguj
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={handleRegisterClick}>
          Zarejestruj
        </Button>
      </div>
    </div>
  );
};

export default AuthStatus;
