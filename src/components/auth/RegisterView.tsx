import React, { useState } from "react";
import { PageHeader } from "../PageHeader";
import RegisterForm from "./RegisterForm";
import type { RegisterUserRequest, RegisterUserResponse } from "../../types";

const RegisterView: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleRegister = async (data: RegisterUserRequest) => {
    setIsSubmitting(true);
    setApiError(null);
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

      const successData = responseData as RegisterUserResponse;
      console.log("Registration successful, received token:", successData.token);

      // Registration successful, treat as login: store token and dispatch event
      // Assuming API returns a token immediately usable for login
      // For simplicity, using localStorage directly. In a real app, consider sessionStorage too or based on a flag.
      localStorage.setItem("authToken", successData.token);
      console.log("Token stored in localStorage after registration");

      // Dispatch authChange event to update layout/global state
      window.dispatchEvent(
        new CustomEvent("authChange", {
          detail: {
            isAuthenticated: true,
            user: { id: successData.id, email: successData.email },
          },
        })
      );
      console.log("Dispatched authChange event after registration");

      // Redirect to the main page
      window.location.href = "/";
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
      <RegisterForm onSubmit={handleRegister} isSubmitting={isSubmitting} apiError={apiError} />
    </>
  );
};

export default RegisterView;
