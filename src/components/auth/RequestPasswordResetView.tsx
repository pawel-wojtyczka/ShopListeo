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
    console.log("Attempting password reset request for:", email);

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
        console.error("Request reset API error details:", responseData);
        throw new Error(String(errorMessage));
      }

      // Set success message from API response
      setSuccessMessage(responseData.message || "Żądanie zostało przetworzone.");
      console.log("Request reset successful:", responseData.message);
    } catch (error) {
      console.error("Request reset fetch error:", error);
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
