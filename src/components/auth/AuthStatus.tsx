import React from "react";
import { Button } from "@/components/ui/button";

// This is a mock component for now
// It will be integrated with the actual authentication logic later
const AuthStatus: React.FC = () => {
  // Mock state for demonstration
  const isAuthenticated = false;
  const userName = "user@example.com";

  const handleLoginClick = () => {
    window.location.href = "/login";
  };

  const handleRegisterClick = () => {
    window.location.href = "/register";
  };

  const handleLogoutClick = () => {
    // This will be implemented with the actual authentication logic later
    console.log("Logout clicked");
  };

  if (isAuthenticated) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm">
          Zalogowano jako <span className="font-medium">{userName}</span>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogoutClick}>
          Wyloguj się
        </Button>
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
