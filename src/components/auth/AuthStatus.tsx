import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthContext";

// Komponent wyświetlający status autentykacji
const AuthStatus: React.FC = () => {
  // Pobieramy dane autentykacji z kontekstu
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  // Dodaję logi aby zobaczyć co dokładnie otrzymuje komponent
  console.log("[AuthStatus] Rendering with state:", {
    isAuthenticated,
    hasUser: !!user,
    user,
    isLoading,
  });

  const handleLoginClick = () => {
    window.location.href = "/login";
  };

  const handleRegisterClick = () => {
    window.location.href = "/register";
  };

  const handleLogoutClick = async () => {
    await logout();
  };

  // Gdy użytkownik jest zalogowany (ignorujemy stan isLoading)
  if (user) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm">
          Zalogowano jako <span className="font-medium">{user.email}</span>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogoutClick}>
          Wyloguj się
        </Button>
      </div>
    );
  }

  // Gdy użytkownik nie jest zalogowany i nie ładujemy
  if (!isLoading) {
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
  }

  // Stan ładowania - renderowany tylko gdy nie mamy użytkownika
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm">Sprawdzanie sesji...</div>
    </div>
  );
};

export default AuthStatus;
