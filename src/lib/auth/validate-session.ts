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
  try {
    // Najpierw sprawdź, czy informacje o uwierzytelnieniu zostały przekazane z middleware
    if (locals && locals.isAuthenticated === true && locals.authUser && locals.authUser.id) {
      return {
        success: true,
        data: {
          userId: locals.authUser.id,
        },
      };
    }

    // Jeśli nie ma informacji z middleware, spróbuj pobrać dane użytkownika bezpośrednio
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();

    if (error) {
      return {
        success: false,
        error: error.message || "Unauthorized",
      };
    }

    if (!user) {
      return {
        success: false,
        error: "Auth session missing!",
      };
    }

    return {
      success: true,
      data: {
        userId: user.id,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Session validation failed",
    };
  }
}
