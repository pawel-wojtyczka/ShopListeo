import * as React from "react";
import { useState } from "react";
import LoginForm from "./LoginForm";
import type { LoginUserRequest } from "../../types";
import { showSuccessToast } from "@/lib/services/toast-service";

const LoginView: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleLogin = async (data: LoginUserRequest) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // Wysłanie danych logowania do API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Sprawdzenie odpowiedzi
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Wystąpił błąd podczas logowania");
      }

      // Przekierowanie po pomyślnym zalogowaniu na stronę list zakupowych
      console.log("Login successful:", data);
      showSuccessToast("Zalogowano pomyślnie!");
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);
      setApiError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} apiError={apiError} />;
};

export default LoginView;
