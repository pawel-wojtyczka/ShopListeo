import React, { useState, useEffect } from "react";
import { PageHeader } from "../PageHeader";
import { SetNewPasswordForm } from "./SetNewPasswordForm";

export function SetNewPasswordView() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Pobieranie tokenu z URL
    const url = new URL(window.location.href);
    const urlToken = url.searchParams.get("token");
    setToken(urlToken);

    if (!urlToken) {
      setApiError("Brak prawidłowego tokenu resetowania hasła w adresie URL");
    }
  }, []);

  const handleSubmit = async (password: string) => {
    if (!token) {
      setApiError("Brak prawidłowego tokenu resetowania hasła");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      // Korzystamy bezpośrednio z Supabase client
      const { createClient } = await import("@supabase/supabase-js");

      const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
      const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Brak konfiguracji Supabase");
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Aktualizacja hasła użytkownika
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        const errorMessage = error.message || (typeof error === "string" ? error : "Błąd aktualizacji hasła");
        console.error("Szczegóły błędu aktualizacji hasła:", error);
        throw new Error(errorMessage);
      }

      // Komunikat sukcesu i przekierowanie
      setSuccessMessage("Hasło zostało zmienione. Za chwilę zostaniesz przekierowany do strony logowania.");

      // Przekierowanie po 3 sekundach
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (error) {
      console.error("Password update error:", error);
      setApiError(error instanceof Error ? error.message : "Nieoczekiwany błąd podczas zmiany hasła");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Ustaw nowe hasło" />
      <SetNewPasswordForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        apiError={apiError}
        successMessage={successMessage}
        disabled={!token}
      />
    </>
  );
}
