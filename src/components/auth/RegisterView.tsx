import React, { useState, useEffect } from "react";
import { PageHeader } from "../PageHeader";
import RegisterForm from "./RegisterForm";
import type { RegisterUserRequest, RegisterUserResponse } from "../../types";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const RegisterView: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isDevelopmentEnv, setIsDevelopmentEnv] = useState(false);

  // Sprawdź, czy jesteśmy w środowisku deweloperskim, ale tylko po stronie klienta
  useEffect(() => {
    // Sprawdzamy, czy window istnieje (jesteśmy po stronie klienta)
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      setIsDevelopmentEnv(hostname === "localhost" || hostname === "127.0.0.1");
    }
  }, []);

  // Przekierowanie po pomyślnej rejestracji
  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;
    if (registrationSuccess && typeof window !== "undefined") {
      redirectTimer = setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    }
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [registrationSuccess]);

  const handleRegister = async (data: RegisterUserRequest) => {
    setIsSubmitting(true);
    setApiError(null);
    setRegistrationSuccess(false);
    console.log("Attempting registration with:", data);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const responseData: RegisterUserResponse | { message?: string; error?: unknown } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        let errorMessage = `Błąd rejestracji (${response.status})`;
        if (typeof responseData === "object" && responseData !== null && !("token" in responseData)) {
          let specificErrorMsg: string | undefined;
          if (
            responseData.error &&
            typeof responseData.error === "object" &&
            "message" in responseData.error &&
            typeof responseData.error.message === "string"
          ) {
            specificErrorMsg = responseData.error.message;
          }
          errorMessage =
            responseData.message ||
            specificErrorMsg ||
            (responseData.error ? String(responseData.error) : undefined) ||
            errorMessage;
        }
        console.error("Registration API error details:", responseData);
        throw new Error(String(errorMessage));
      }

      // Pokaż informację o sukcesie
      setRegistrationSuccess(true);

      // Przekierowanie jest obsługiwane przez useEffect
    } catch (error) {
      console.error("Registration fetch error:", error);
      setApiError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd podczas rejestracji.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Zarejestruj się" />
      {registrationSuccess ? (
        <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
          <AlertTitle>Rejestracja zakończona sukcesem!</AlertTitle>
          <AlertDescription>
            <p>Twoje konto zostało utworzone. Za chwilę zostaniesz przekierowany na stronę logowania.</p>

            <p className="mt-2 text-sm">
              <strong>Ważne:</strong> W zależności od konfiguracji systemu, może być wymagane potwierdzenie adresu
              email, zanim będziesz mógł się zalogować. Sprawdź swoją skrzynkę email.
            </p>

            {isDevelopmentEnv && (
              <p className="mt-2 text-sm">
                <strong>Uwaga dla deweloperów:</strong> W środowisku deweloperskim może być wymagane ręczne
                potwierdzenie adresu email. Sprawdź panel administracyjny Supabase lub logi.
              </p>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {apiError && apiError.includes("Sprawdź klucze Supabase") && (
            <Alert className="mb-4 bg-yellow-50 text-yellow-800 border-yellow-200">
              <AlertTitle>Problem z konfiguracją</AlertTitle>
              <AlertDescription>
                Wykryto problem z konfiguracją Supabase. Administrator systemu powinien sprawdzić klucze API w pliku
                .env.
              </AlertDescription>
            </Alert>
          )}
          <RegisterForm onSubmit={handleRegister} isSubmitting={isSubmitting} apiError={apiError} />
        </>
      )}
    </>
  );
};

export default RegisterView;
