import type { APIRoute } from "astro";
import type { AstroLocals } from "../../../types/locals";
import { logger } from "@/lib/logger";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = (locals as AstroLocals)?.supabase;
  if (!supabase) {
    return new Response(JSON.stringify({ message: "Błąd serwera: Klient Supabase niedostępny." }), { status: 500 });
  }

  let requestData;
  try {
    requestData = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: "Nieprawidłowy format zapytania (oczekiwano JSON)." }), {
      status: 400,
    });
  }

  const { code } = requestData;

  if (!code || typeof code !== "string") {
    return new Response(JSON.stringify({ message: "Brak wymaganego kodu weryfikacyjnego." }), { status: 400 });
  }

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      logger.error("Supabase exchangeCodeForSession error:", { error });
      return new Response(
        JSON.stringify({ message: error.message || "Nie udało się zweryfikować kodu odzyskiwania hasła." }),
        { status: 401 } // Unauthorized or Bad Request might be appropriate
      );
    }

    if (data.session && data.session.access_token) {
      return new Response(JSON.stringify({ accessToken: data.session.access_token }), { status: 200 });
    } else {
      // Should not happen if error is not present and session is null
      logger.error("Supabase exchangeCodeForSession: No session or access_token in data", { data });
      return new Response(JSON.stringify({ message: "Nie udało się uzyskać sesji po wymianie kodu." }), {
        status: 500,
      });
    }
  } catch (err) {
    logger.error("Unexpected error during code exchange:", {}, err);
    return new Response(JSON.stringify({ message: "Wystąpił nieoczekiwany błąd serwera." }), { status: 500 });
  }
};
