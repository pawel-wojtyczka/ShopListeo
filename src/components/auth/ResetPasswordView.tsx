import React, { useState, useEffect } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

const ResetPasswordView: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Extract token from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    setToken(tokenParam);

    // In a real implementation, we would validate the token with the backend
    // For now, we'll simulate this process
    const validateToken = async () => {
      setIsLoading(true);

      try {
        if (!tokenParam) {
          throw new Error("Brak wymaganego tokenu resetowania hasła.");
        }

        // Simulate API request delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate token validation
        // In a real implementation, we would make an API call to validate the token
        if (tokenParam === "invalid-token") {
          throw new Error("Token resetowania hasła jest nieprawidłowy lub wygasł.");
        }

        setIsValidToken(true);
      } catch (error) {
        console.error("Token validation error:", error);
        setApiError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd.");
        setIsValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const handleResetPassword = async (password: string) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      if (!token) {
        throw new Error("Brak wymaganego tokenu resetowania hasła.");
      }

      // This is just a placeholder - actual password reset logic will be implemented later
      console.log(
        "Password reset attempt with token:",
        token,
        "and new password:",
        password.length > 0 ? "********" : ""
      );

      // Simulate API request delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, we'll add a simple simulation to show the UI flow
      if (token === "error-token") {
        throw new Error("Nie udało się zresetować hasła. Spróbuj ponownie później.");
      }

      // Show success message
      setSuccessMessage("Twoje hasło zostało pomyślnie zresetowane. Możesz teraz zalogować się używając nowego hasła.");
    } catch (error) {
      console.error("Password reset error:", error);
      setApiError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while validating token
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Weryfikacja tokenu resetowania hasła...</p>
      </div>
    );
  }

  // Show error if token is invalid
  if (!isValidToken) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">Nieprawidłowy token</h2>
        <p className="mb-4">{apiError || "Link do resetowania hasła jest nieprawidłowy lub wygasł."}</p>
        <p>
          <a href="/recover" className="font-medium text-primary underline-offset-4 hover:underline">
            Wyślij nowy link resetowania hasła
          </a>
        </p>
      </div>
    );
  }

  // Show the reset password form
  return (
    <ResetPasswordForm
      onSubmit={handleResetPassword}
      isSubmitting={isSubmitting}
      apiError={apiError}
      successMessage={successMessage}
    />
  );
};

export default ResetPasswordView;
