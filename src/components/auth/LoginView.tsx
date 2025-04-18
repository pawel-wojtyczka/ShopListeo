import React, { useState } from "react";
import { PageHeader } from "../PageHeader";
import LoginForm from "./LoginForm";
import type { LoginUserRequest, LoginUserResponse } from "../../types";

const LoginView: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleLogin = async (data: LoginUserRequest) => {
    console.log("[LoginView] handleLogin triggered with data:", data);
    setIsSubmitting(true);
    setApiError(null);
    console.log("Attempting login with:", data);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData: LoginUserResponse | { message?: string; error?: unknown } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        let errorMessage = `Błąd logowania (${response.status})`; // Default error
        // Check if responseData has error details and is not the success type
        if (typeof responseData === "object" && responseData !== null && !("token" in responseData)) {
          // Check if responseData.error is an object with a message property
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
            specificErrorMsg || // Use the extracted message if available
            (responseData.error ? String(responseData.error) : undefined) || // Convert error to string if it exists but has no message
            errorMessage; // Use default if specific messages aren't found
        }
        console.error("Login API error details:", responseData);
        throw new Error(String(errorMessage)); // Ensure errorMessage is a string
      }

      // Type assertion is safer here because we checked response.ok
      const successData = responseData as LoginUserResponse;
      console.log("Login successful, received token:", successData.token);

      // Store token based on rememberMe flag
      if (data.rememberMe) {
        localStorage.setItem("authToken", successData.token);
        console.log("Token stored in localStorage");
      } else {
        sessionStorage.setItem("authToken", successData.token);
        console.log("Token stored in sessionStorage");
      }

      // Dispatch a custom event to notify other parts of the app
      window.dispatchEvent(
        new CustomEvent("authChange", {
          detail: {
            isAuthenticated: true,
            // Pass user data if available from API response, otherwise fetch separately later
            user: { id: successData.id, email: successData.email },
          },
        })
      );
      console.log("Dispatched authChange event");

      // Redirect to the main page after successful login
      window.location.href = "/";
    } catch (error) {
      console.error("Login fetch error:", error);
      setApiError(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Zaloguj się" />
      <LoginForm onSubmit={handleLogin} isSubmitting={isSubmitting} apiError={apiError} />
    </>
  );
};

export default LoginView;
