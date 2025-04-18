import React from "react";
import { useAuth } from "@/lib/auth/AuthContext"; // Adjust path if necessary
import { Button } from "@/components/ui/button"; // Use Button for logout

const AuthStatus: React.FC = () => {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    // Perform logout via API first
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        console.error("Logout API call failed:", response.status);
        // Optionally show an error message to the user
      }
    } catch (error) {
      console.error("Error during logout API call:", error);
      // Optionally show an error message
    }
    // Always clear client-side state and redirect, even if API fails
    logout(); // This function from AuthContext handles clearing state and redirecting
  };

  if (isLoading) {
    return <p>Sprawdzanie statusu...</p>;
  }

  if (user) {
    return (
      <>
        <p>Zalogowano jako:</p>
        <p className="font-medium break-words">{user.email}</p>
        {/* Use Button component for better styling and consistency */}
        <Button
          variant="link"
          onClick={handleLogout}
          className="text-red-500 hover:underline mt-1 w-full justify-start p-0 h-auto"
        >
          Wyloguj
        </Button>
      </>
    );
  }

  return (
    <>
      <p>Niezalogowany</p>
      <a href="/login" className="text-primary hover:underline">
        Zaloguj się
      </a>
    </>
  );
};

export default AuthStatus;
