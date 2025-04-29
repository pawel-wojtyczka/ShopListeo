import React, { useState, useEffect } from "react";
import { PageHeader } from "../PageHeader";
import SetNewPasswordForm from "./SetNewPasswordForm";

const SetNewPasswordView: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // This runs only on the client after mount
    try {
      const hash = window.location.hash.substring(1); // Remove leading #
      const params = new URLSearchParams(hash);
      const token = params.get("access_token");

      if (token) {
        setAccessToken(token);
      } else {
        setTokenError("Nie znaleziono wymaganego tokenu w adresie URL. Upewnij się, że link jest poprawny.");
      }
    } catch (e) {
      setTokenError("Wystąpił błąd podczas przetwarzania linku resetującego.");
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleSetPassword = async (password: string) => {
    if (!accessToken) {
      setApiError("Brak tokenu dostępu do wysłania żądania.");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/auth/set-new-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessToken, password }),
      });

      const responseData: { message?: string; error?: unknown; errors?: unknown } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        let errorMessage = `Błąd ustawiania hasła (${response.status})`;
        if (typeof responseData === "object" && responseData !== null) {
          errorMessage =
            responseData.message ||
            (responseData.errors ? JSON.stringify(responseData.errors) : undefined) ||
            (responseData.error ? String(responseData.error) : undefined) ||
            errorMessage;
        }
        throw new Error(String(errorMessage));
      }

      setSuccessMessage(responseData.message || "Hasło zostało pomyślnie zaktualizowane.");
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFocus = (_e: React.FocusEvent<HTMLInputElement>) => {
    // Można tutaj dodać logikę, np. czyszczenie błędów dla danego pola
  };

  // Render based on token status and API status
  if (tokenError) {
    return (
      <div className="text-center text-destructive">
        <p>{tokenError}</p>
        <a href="/reset-password" className="text-primary hover:underline mt-4 inline-block">
          Poproś o nowy link
        </a>
      </div>
    );
  }

  if (!accessToken && !tokenError) {
    // Still waiting for useEffect to run and parse token
    return <p className="text-center text-muted-foreground">Wczytywanie...</p>;
  }

  return (
    <>
      <PageHeader title="Ustaw nowe hasło" />
      <SetNewPasswordForm
        onSubmit={handleSetPassword}
        isSubmitting={isSubmitting}
        apiError={apiError}
        successMessage={successMessage}
      />
    </>
  );
};

export default SetNewPasswordView;
