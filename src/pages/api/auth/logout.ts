import type { APIRoute } from "astro";
import type { AstroLocals } from "src/types/locals";

export const prerender = false;

/**
 * Handles the POST request to log out the user.
 * Deletes the authentication cookie and redirects to the login page.
 */
export const POST: APIRoute = async ({ locals }) => {
  // Pobieramy klienta Supabase z lokalnego kontekstu
  const supabase = (locals as AstroLocals)?.supabase;
  if (!supabase) {
    console.error("API /auth/logout: Supabase client not found in locals");
    return new Response(JSON.stringify({ message: "Błąd serwera." }), { status: 500 });
  }

  try {
    // Wywołujemy metodę wylogowania z Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("API /auth/logout: Error during logout", error);
      return new Response(JSON.stringify({ message: "Wystąpił błąd podczas wylogowywania." }), { status: 500 });
    }

    console.log("API /auth/logout: User logged out successfully");

    // Pomyślne wylogowanie
    return new Response(JSON.stringify({ message: "Wylogowano pomyślnie." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API /auth/logout: Unexpected error during logout", error);
    return new Response(JSON.stringify({ message: "Wystąpił nieoczekiwany błąd podczas wylogowywania." }), {
      status: 500,
    });
  }
};

// Optional: Handle GET requests or other methods if needed,
// otherwise they will result in a 405 Method Not Allowed error.
export const ALL: APIRoute = ({ redirect }) => {
  // Redirect GET requests or other methods to login as well, or show an error
  return redirect("/login");
};
