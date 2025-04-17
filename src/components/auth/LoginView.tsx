import React, { useState } from "react";
import { PageHeader } from "../PageHeader";
import { LoginForm } from "./LoginForm";
import type { LoginUserRequest } from "../../types";

export function LoginView() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (data: LoginUserRequest) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch("/api/auth/login", {
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
          `Błąd logowania (${response.status})`;

        console.error("Szczegóły błędu:", responseData);
        throw new Error(errorMessage);
      }

      // Save token based on remember me option
      if (data.rememberMe) {
        localStorage.setItem("authToken", responseData.token);
      } else {
        sessionStorage.setItem("authToken", responseData.token);
      }

      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);
      setApiError(error instanceof Error ? error.message : "Nieoczekiwany błąd podczas logowania");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Zaloguj się" />
      <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} apiError={apiError} />
    </>
  );
}
