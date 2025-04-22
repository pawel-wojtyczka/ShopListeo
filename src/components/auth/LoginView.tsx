import React, { useState } from "react";
import LoginForm from "./LoginForm";
import type { LoginUserRequest } from "../../types";

const LoginView: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleLogin = async (data: LoginUserRequest) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // This is just a placeholder - actual authentication logic will be implemented later
      console.log("Login attempt with:", data);

      // Simulate API request delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, we'll add a simple simulation to show the UI flow
      if (data.email === "error@example.com") {
        throw new Error("Nieprawidłowy email lub hasło.");
      }

      // Success would normally redirect to the home page
      // This will be implemented in the actual authentication logic
    } catch (error) {
      console.error("Login error:", error);
      setApiError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} apiError={apiError} />;
};

export default LoginView;
