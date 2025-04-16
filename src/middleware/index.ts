import type { MiddlewareHandler } from "astro";
import type { AstroLocals } from "../types/locals";
import { supabaseClient } from "../db/supabase.client";
import type { User } from "@supabase/supabase-js";

// Sprawdzenie czy środowisko jest developmentem
const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Middleware obsługujące uwierzytelnianie i dostęp do Supabase
 */
export const onRequest: MiddlewareHandler = async (context, next) => {
  // Przypisanie klienta Supabase do context.locals
  context.locals.supabase = supabaseClient;

  // W środowisku deweloperskim automatycznie przypisujemy testowego użytkownika
  if (isDevelopment) {
    console.log("🔧 Tryb deweloperski: używanie testowego użytkownika");

    // Testowy użytkownik deweloperski dla łatwiejszego testowania API
    const devUser: User = {
      id: "4e0a9b6a-b416-48e6-8d35-5700bd1d674a",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      email: "dev@example.com",
      created_at: new Date().toISOString(),
      role: "authenticated",
    };

    (context.locals as AstroLocals).user = devUser;
  } else {
    // W środowisku produkcyjnym standardowa weryfikacja uwierzytelnienia
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    (context.locals as AstroLocals).user = user;
  }

  // Przekazanie do następnego middleware lub handlera
  return await next();
};
