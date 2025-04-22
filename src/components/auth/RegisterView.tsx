import React, { useState } from "react";
import RegisterForm from "./RegisterForm";
import type { RegisterUserRequest } from "../../types";

const RegisterView: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleRegister = async (data: RegisterUserRequest) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // This is just a placeholder - actual registration logic will be implemented later
      console.log("Registration attempt with:", data);

      // Simulate API request delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, we'll add a simple simulation to show the UI flow
      if (data.email === "exists@example.com") {
        throw new Error("Użytkownik z tym adresem email już istnieje.");
      }

      // Success would normally redirect to login page or show success message
      // This will be implemented in the actual authentication logic
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
