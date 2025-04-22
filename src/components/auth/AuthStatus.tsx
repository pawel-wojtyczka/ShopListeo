import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthContext";
import type { UserDTO } from "@/types"; // Import UserDTO type

// Define props
interface AuthStatusProps {
  initialUser?: UserDTO | null; // Accept optional initial user from props
}

// Komponent wyświetlający status autentykacji
const AuthStatus: React.FC<AuthStatusProps> = ({ initialUser }) => {
  // Pobieramy dane autentykacji z kontekstu
  // Destructure user as contextUser to avoid naming conflict
  const { user: contextUser, logout, isLoading } = useAuth();

  // Determine the user to display: prioritize context, fallback to initial prop
  const displayUser = contextUser ?? initialUser;

  // Use displayUser for logging
  console.log("[AuthStatus] Rendering with state:", {
    isAuthenticated: !!displayUser, // Based on displayUser
    hasContextUser: !!contextUser,
    hasInitialUser: !!initialUser,
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
    await logout();
  };

  // If we have a user (from context or props) - RENDER LOGGED IN STATE
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

  // If no user and context is loading - RENDER LOADING STATE
  // Check context's isLoading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm">Sprawdzanie sesji...</div>
      </div>
    );
  }

  // If no user and not loading - RENDER LOGGED OUT STATE
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

  // Original logic commented out for clarity of the new approach
  /*
  // Gdy użytkownik jest zalogowany (ignorujemy stan isLoading)
  if (user) {
    // ... render logged in ...
  }
  // Gdy użytkownik nie jest zalogowany i nie ładujemy
  if (!isLoading) {
     // ... render logged out ...
  }
  // Stan ładowania - renderowany tylko gdy nie mamy użytkownika
  return (
    // ... render loading ...
  );
  */
};

export default AuthStatus;
