import * as React from "react";
import { useState } from "react";
import LoginForm from "./LoginForm";
import type { LoginUserRequest } from "../../types";
import { showSuccessToast } from "@/lib/services/toast-service";
import { Logo } from "@/components/ui/Logo";

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
      showSuccessToast("Zalogowano pomyślnie!");
      window.location.href = "/";
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <Logo size="xl" />
      </div>
      <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} apiError={apiError} />
    </div>
  );
};

export default LoginView;
