import type { APIRoute } from "astro";
import type { AstroLocals } from "src/types/locals"; // Using path from src/
import type { UserDTO } from "src/types"; // Using path from src/

export const prerender = false;

export const GET: APIRoute = async ({ request, locals, cookies }) => {
  const supabase = (locals as AstroLocals)?.supabase;
  if (!supabase) {
    console.error("API Error: Supabase client not found in locals for /api/users/me");
    return new Response(JSON.stringify({ message: "Błąd serwera: Klient Supabase niedostępny." }), { status: 500 });
  }

  // Try to get the token from cookies first, then Authorization header
  const token = cookies.get("authToken")?.value || request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    console.log("API /api/users/me: No token found.");
    return new Response(JSON.stringify({ message: "Brak autoryzacji." }), { status: 401 });
  }

  console.log("API /api/users/me: Token found, verifying...");

  try {
    // Verify the token using Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("API /api/users/me: Token verification failed:", error?.message);
      // Clear the potentially invalid cookie
      cookies.delete("authToken", { path: "/" });
      return new Response(JSON.stringify({ message: "Sesja nieprawidłowa lub wygasła." }), { status: 401 });
    }

    // Token is valid, return user data (adjust mapping as needed based on UserDTO)
    console.log(`API /api/users/me: Token verified for user: ${user.email}`);
    const userDTO: UserDTO = {
      id: user.id,
      email: user.email || "",
      registrationDate: user.created_at || "",
      lastLoginDate: user.last_sign_in_at || null,
      // Assuming isAdmin is stored in app_metadata, adjust if needed
      isAdmin: user.app_metadata?.isAdmin || false,
    };

    return new Response(JSON.stringify(userDTO), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("API /api/users/me: Unexpected error during token verification:", error);
    return new Response(JSON.stringify({ message: "Wystąpił nieoczekiwany błąd serwera podczas weryfikacji sesji." }), {
      status: 500,
    });
  }
};
