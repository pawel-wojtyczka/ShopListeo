import React, { useState } from "react";
import { PageHeader } from "../PageHeader";
import LoginForm from "./LoginForm";
import type { LoginUserRequest } from "../../types";
import { supabaseClient } from "../../db/supabase.client";

const LoginView: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleLogin = async (data: LoginUserRequest) => {
    console.log("[LoginView] handleLogin triggered with data:", data);
    setIsSubmitting(true);
    setApiError(null);
    console.log("Attempting Supabase login with:", data.email);

    try {
      const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error("Supabase login error:", authError);
        let friendlyMessage = "Nieprawidłowy email lub hasło.";
        if (authError.message.includes("Invalid login credentials")) {
          friendlyMessage = "Nieprawidłowy email lub hasło.";
        } else if (authError.message.includes("Email not confirmed")) {
          friendlyMessage = "Adres email nie został potwierdzony.";
        }
        throw new Error(friendlyMessage);
      }

      if (!authData || !authData.session || !authData.user) {
        console.error("Supabase login response missing data:", authData);
        throw new Error("Logowanie nie powiodło się. Brak danych sesji.");
      }

      console.log(`Supabase login successful for user: ${authData.user.email}`);
      console.log("Session automatically handled by Supabase client (using cookies).");

      // Re-adding client-side redirect after successful login
      console.log("[LoginView] Redirecting to /...");
      window.location.assign("/"); // Use assign for navigation
    } catch (error) {
      console.error("Login error:", error);
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
