import React, { useState } from "react";
import RecoverPasswordForm from "./RecoverPasswordForm";

const RecoverPasswordView: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRecoverPassword = async (email: string) => {
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      // This is just a placeholder - actual password recovery logic will be implemented later
      console.log("Password recovery attempt for:", email);

      // Simulate API request delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, we'll add a simple simulation to show the UI flow
      if (email === "nonexistent@example.com") {
        throw new Error("Nie znaleziono konta powiązanego z tym adresem email.");
      }

      // Show success message
      setSuccessMessage(
        "Link do resetowania hasła został wysłany na podany adres email. " +
          "Sprawdź swoją skrzynkę odbiorczą (oraz folder spam)."
      );
    } catch (error) {
      console.error("Password recovery error:", error);
      setApiError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RecoverPasswordForm
      onSubmit={handleRecoverPassword}
      isSubmitting={isSubmitting}
      apiError={apiError}
      successMessage={successMessage}
    />
  );
};

export default RecoverPasswordView;
