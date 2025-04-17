import React, { useState } from "react";
import { PageHeader } from "../PageHeader";
import { RequestPasswordResetForm } from "./RequestPasswordResetForm";

export function RequestPasswordResetView() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (email: string) => {
    setIsSubmitting(true);
    setApiError(null);
    setSuccessMessage(null);

    try {
      // Korzystamy bezpośrednio z Supabase client - importujemy go i używamy
      // W rzeczywistości lepiej zrobić endpoint API, ale dla demonstracji używamy bezpośrednio klienta
      const { createClient } = await import("@supabase/supabase-js");

      const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
      const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Brak konfiguracji Supabase");
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/set-new-password`,
      });

      if (error) {
        const errorMessage = error.message || (typeof error === "string" ? error : "Błąd resetowania hasła");
        console.error("Szczegóły błędu resetowania hasła:", error);
        throw new Error(errorMessage);
      }

      // Pokazujemy komunikat sukcesu
      setSuccessMessage("Instrukcje resetowania hasła zostały wysłane na Twój adres email");
    } catch (error) {
      console.error("Password reset error:", error);
      setApiError(
        error instanceof Error ? error.message : "Nieoczekiwany błąd podczas wysyłania instrukcji resetowania hasła"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Resetuj hasło" />
      <RequestPasswordResetForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        apiError={apiError}
        successMessage={successMessage}
      />
    </>
  );
}
