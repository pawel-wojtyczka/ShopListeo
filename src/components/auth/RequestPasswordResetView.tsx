import React, { useState } from "react";
import { PageHeader } from "../PageHeader";
import RequestPasswordResetForm from "./RequestPasswordResetForm";

const RequestPasswordResetView: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRequestReset = async (email: string) => {
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      // Even if response is not ok, we might get a success message (e.g., generic one)
      const responseData: { message?: string; error?: unknown; errors?: unknown } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        let errorMessage = `Błąd żądania resetu (${response.status})`;
        if (typeof responseData === "object" && responseData !== null) {
          errorMessage =
            responseData.message ||
            (responseData.errors ? JSON.stringify(responseData.errors) : undefined) ||
            (responseData.error ? String(responseData.error) : undefined) ||
            errorMessage;
        }
        throw new Error(String(errorMessage));
      }

      // Set success message from API response
      setSuccessMessage(responseData.message || "Żądanie zostało przetworzone.");
    } catch (error) {
      // Dodajemy logowanie błędu po stronie klienta
      // console.error("Client-side error during password reset request:", error);
      setApiError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Resetuj hasło" />
      <RequestPasswordResetForm
        onSubmit={handleRequestReset}
        isSubmitting={isSubmitting}
        apiError={apiError}
        successMessage={successMessage}
      />
    </>
  );
};

export default RequestPasswordResetView;
