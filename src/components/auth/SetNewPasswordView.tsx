import React, { useState, useEffect } from "react";
import { PageHeader } from "../PageHeader";
import SetNewPasswordForm from "./SetNewPasswordForm";

const SetNewPasswordView: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const processToken = async () => {
      try {
        let initialToken: string | null = null;
        let isFromQueryCode = false;

        const hash = window.location.hash.substring(1);
        if (hash) {
          const hashParams = new URLSearchParams(hash);
          initialToken = hashParams.get("access_token");
        }

        if (!initialToken) {
          const queryParams = new URLSearchParams(window.location.search);
          initialToken = queryParams.get("code");
          if (initialToken) {
            isFromQueryCode = true;
          }
        }

        if (initialToken) {
          if (isFromQueryCode) {
            setIsVerifyingToken(true);
            setTokenError(null);
            try {
              const response = await fetch("/api/auth/exchange-recovery-code", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ code: initialToken }),
              });
              const data = await response.json();
              if (!response.ok) {
                throw new Error(data.message || "Weryfikacja tokenu nie powiodła się.");
              }
              setAccessToken(data.accessToken);
            } catch (exchangeError: unknown) {
              if (exchangeError instanceof Error) {
                setTokenError(exchangeError.message || "Błąd podczas wymiany kodu na token.");
              } else {
                setTokenError("Wystąpił nieznany błąd podczas wymiany kodu na token.");
              }
              setAccessToken(null);
            }
            setIsVerifyingToken(false);
          } else {
            setAccessToken(initialToken);
          }
        } else {
          setTokenError("Nie znaleziono wymaganego tokenu w adresie URL. Upewnij się, że link jest poprawny.");
        }
      } catch (_e) {
        setTokenError("Wystąpił błąd podczas przetwarzania linku resetującego.");
      }
    };

    processToken();
  }, []);

  const handleSetPassword = async (password: string) => {
    if (!accessToken) {
      setApiError("Brak tokenu dostępu do wysłania żądania (po weryfikacji).");
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

  // Render based on token status and API status
  if (isVerifyingToken) {
    return <p className="text-center text-muted-foreground">Weryfikowanie tokenu resetowania hasła...</p>;
  }

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

  if (!accessToken && !tokenError && !isVerifyingToken) {
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
