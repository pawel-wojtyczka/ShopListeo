import type { APIRoute } from "astro";
import type { AstroLocals } from "src/types/locals"; // Using path from src/
import type { UserDTO } from "src/types"; // Using path from src/

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
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

  // Jeśli nie ma użytkownika w lokalnym kontekście po sprawdzeniu przez middleware,
  // oznacza to, że użytkownik nie jest uwierzytelniony.
  console.log("API /api/users/me: No authenticated user found in middleware locals. Returning 401.");
  return new Response(JSON.stringify({ message: "Brak autoryzacji." }), { status: 401 });
};
