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

  // Sprawdź użytkownika bezpośrednio z lokalnego kontekstu
  const {
    user: userFromLocals,
    authUser,
    isAuthenticated,
  } = locals as AstroLocals & { authUser: UserDTO | null; isAuthenticated: boolean };

  console.log("API /api/users/me: Checking authentication from middleware locals:", {
    userExists: !!userFromLocals,
    authUserExists: !!authUser,
    isAuthenticated,
  });

  // Jeśli użytkownik jest już dostępny w lokalnym kontekście z middleware, użyj go
  if (userFromLocals) {
    console.log(`API /api/users/me: Using authenticated user from middleware: ${userFromLocals.email}`);

    // Mapujemy dane użytkownika do UserDTO
    const userDTO: UserDTO = {
      id: userFromLocals.id,
      email: userFromLocals.email || "",
      registrationDate: userFromLocals.created_at || "",
      lastLoginDate: userFromLocals.last_sign_in_at || null,
      isAdmin: userFromLocals.app_metadata?.isAdmin || false,
    };

    return new Response(JSON.stringify(userDTO), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Jeśli nie ma użytkownika w lokalnym kontekście, sprawdź token
  const authHeader = request.headers.get("Authorization");
  const token = cookies.get("authToken")?.value || (authHeader ? authHeader.replace("Bearer ", "") : null);

  console.log("API /api/users/me: Auth check details:", {
    hasCookieToken: !!cookies.get("authToken")?.value,
    hasAuthHeader: !!authHeader,
    tokenExists: !!token,
  });

  if (!token) {
    console.log("API /api/users/me: No token found in cookies or Authorization header.");
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
