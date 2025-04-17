import React, { useState } from "react";
import { PageHeader } from "../PageHeader";
import { RegisterForm } from "./RegisterForm";
import type { RegisterUserRequest } from "../../types";

export function RegisterView() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (data: RegisterUserRequest) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Próbujemy sparsować odpowiedź niezależnie czy sukces czy błąd
      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        // Bardziej szczegółowa obsługa błędów
        const errorMessage =
          responseData.message ||
          responseData.error?.message ||
          responseData.error ||
          `Błąd rejestracji (${response.status})`;

        console.error("Szczegóły błędu:", responseData);
        throw new Error(errorMessage);
      }

      // Zapisujemy token po rejestracji aby użytkownik był od razu zalogowany
      localStorage.setItem("authToken", responseData.token);

      // Przekierowanie na stronę główną
      window.location.href = "/";
    } catch (error) {
      console.error("Registration error:", error);
      setApiError(error instanceof Error ? error.message : "Nieoczekiwany błąd podczas rejestracji");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Zarejestruj się" />
      <RegisterForm onSubmit={handleSubmit} isSubmitting={isSubmitting} apiError={apiError} />
    </>
  );
}
