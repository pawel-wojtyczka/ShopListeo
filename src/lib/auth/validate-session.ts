import { supabaseClient } from "@/db/supabase.client";
import type { UserDTO } from "@/types";

interface SessionValidationResult {
  success: boolean;
  data?: {
    userId: string;
  };
  error?: string;
}

interface AuthLocals {
  isAuthenticated?: boolean;
  authUser?: UserDTO | null;
  [key: string]: unknown;
}

export async function validateSession(request: Request, locals?: AuthLocals): Promise<SessionValidationResult> {
  console.log("[validateSession] Rozpoczęcie walidacji sesji");

  try {
    // Najpierw sprawdź, czy informacje o uwierzytelnieniu zostały przekazane z middleware
    if (locals && locals.isAuthenticated === true && locals.authUser && locals.authUser.id) {
      console.log("[validateSession] Znaleziono dane uwierzytelniające w locals z middleware");
      return {
        success: true,
        data: {
          userId: locals.authUser.id,
        },
      };
    }

    console.log("[validateSession] Brak danych uwierzytelniających w locals, próba pobrania bezpośrednio z Supabase");

    // Jeśli nie ma informacji z middleware, spróbuj pobrać dane użytkownika bezpośrednio
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();

    if (error) {
      console.error("[validateSession] Błąd Supabase:", error.message);
      return {
        success: false,
        error: error.message || "Unauthorized",
      };
    }

    if (!user) {
      console.error("[validateSession] Brak użytkownika z Supabase");
      return {
        success: false,
        error: "Auth session missing!",
      };
    }

    console.log("[validateSession] Pomyślnie zwalidowano sesję dla użytkownika:", user.email);
    return {
      success: true,
      data: {
        userId: user.id,
      },
    };
  } catch (error) {
    console.error("[validateSession] Nieoczekiwany błąd:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Session validation failed",
    };
  }
}
