import type { APIRoute } from "astro";
import { z } from "zod";
import type { AstroLocals } from "../../../types/locals"; // Adjust path if needed

export const prerender = false;

// Input validation schema
const SetNewPasswordSchema = z.object({
  // Token received by the client from the URL hash fragment
  accessToken: z.string().min(1, "Token dostępu jest wymagany."),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków."),
  // No need for confirmPassword here, validation happens client-side before calling API
});

export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = (locals as AstroLocals)?.supabase;
  if (!supabase) {
    console.error("API Error: Supabase client not found in locals");
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
  const validationResult = SetNewPasswordSchema.safeParse(requestData);
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        message: "Błąd walidacji.",
        errors: validationResult.error.flatten().fieldErrors,
      }),
      { status: 400 }
    );
  }

  const { accessToken, password } = validationResult.data;

  console.log(`API: Received request to set new password.`);

  try {
    // Step 1: Verify the access token to get the user context
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(accessToken);

    if (getUserError || !user) {
      console.error("API: Failed to verify access token:", getUserError?.message);
      // Use a generic error message for security
      return new Response(
        JSON.stringify({ message: "Link do resetowania hasła jest nieprawidłowy lub wygasł. Spróbuj ponownie." }),
        { status: 401 }
      ); // Unauthorized
    }

    // Step 2: If token is valid, update the user's password
    // The user context is now set for the Supabase client for this request
    console.log(`API: Access token verified for user: ${user.email}. Attempting password update.`);
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
      // No need to pass accessToken here, context is already set
    });

    // Check for errors during the update process
    if (updateError) {
      console.error("API: Supabase updateUser error after token verification:", updateError.message);
      let userMessage = "Nie udało się zaktualizować hasła po weryfikacji tokenu.";
      if (updateError.message.includes("same password")) {
        userMessage = "Nowe hasło nie może być takie samo jak stare.";
      }
      // Use 500 here as it's likely a server/DB issue if getUser succeeded but updateUser failed
      return new Response(JSON.stringify({ message: userMessage }), { status: 500 });
    }

    // Password updated successfully
    console.log(`API: Password successfully updated for user: ${user.email}`); // Log email obtained from getUser

    return new Response(
      JSON.stringify({
        message: "Hasło zostało pomyślnie zaktualizowane. Możesz się teraz zalogować.",
      }),
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("API: Unexpected error during password update:", error);
    return new Response(
      JSON.stringify({ message: "Wystąpił nieoczekiwany błąd serwera podczas aktualizacji hasła." }),
      { status: 500 }
    );
  }
};
