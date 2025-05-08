import type { APIRoute } from "astro";
import { z } from "zod";
import type { AstroLocals } from "../../../types/locals"; // Adjust path if needed

export const prerender = false;

// Input validation schema
export const RequestResetSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email."),
});

export const POST: APIRoute = async ({ request, locals }) => {
  // Ensure locals and supabase client are available
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

  // Validate input
  const validationResult = RequestResetSchema.safeParse(requestData);
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        message: "Błąd walidacji.",
        errors: validationResult.error.flatten().fieldErrors,
      }),
      { status: 400 }
    );
  }

  const { email } = validationResult.data;

  try {
    // Call Supabase to send the password reset email
    // Note: Configure email templates and redirect URL in Supabase project settings
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // This URL should point to your set-new-password page
      redirectTo: new URL("/set-new-password", request.url).toString(),
    });

    if (error) {
      // Log the error for debugging purposes
      console.error("Supabase password reset error:", error);
      // Avoid revealing if email exists - return generic success message anyway
      // Or return a specific error for logging but generic for user
      // return new Response(JSON.stringify({ message: error.message || 'Błąd podczas wysyłania emaila.' }), { status: 500 });
    }

    // IMPORTANT: Always return a generic success message to prevent email enumeration attacks
    return new Response(
      JSON.stringify({
        message: "Jeśli konto istnieje, link do resetowania hasła został wysłany na podany adres email.",
      }),
      { status: 200 }
    );
  } catch (_error) {
    // Log the unexpected error for server-side analysis
    // logger.error("Unexpected error during password reset request", { error: error });
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};
