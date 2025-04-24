import * as React from "react";
import { useState } from "react";
import RegisterForm from "./RegisterForm";
import type { RegisterUserRequest } from "../../types";
import { showSuccessToast } from "@/lib/services/toast-service";

const RegisterView: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleRegister = async (data: RegisterUserRequest) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // Wysłanie danych rejestracji do API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Sprawdzenie odpowiedzi
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Wystąpił błąd podczas rejestracji");
      }

      // Pomyślna rejestracja - pokazujemy toast i przekierowujemy
      showSuccessToast("Rejestracja zakończona sukcesem!", {
        description: "Możesz się teraz zalogować lub sprawdzić email w celu weryfikacji.",
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Registration error:", error);
      setApiError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <RegisterForm onSubmit={handleRegister} isSubmitting={isSubmitting} apiError={apiError} />;
};

export default RegisterView;
