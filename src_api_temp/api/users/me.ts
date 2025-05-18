import type { APIRoute } from "astro";
import type { AstroLocals } from "src/types/locals"; // Using path from src/
import type { UserDTO } from "src/types"; // Using path from src/

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const supabase = (locals as AstroLocals)?.supabase;
  if (!supabase) {
    return new Response(JSON.stringify({ message: "Błąd serwera: Klient Supabase niedostępny." }), { status: 500 });
  }

  // Sprawdź użytkownika z lokalnego kontekstu - używamy userDTO
  const {
    userDTO: userFromLocals, // Zmieniono user na userDTO
    isAuthenticated,
    // Usunięto authUser, ponieważ userDTO zawiera potrzebne dane
  } = locals as AstroLocals & { userDTO: UserDTO | null; isAuthenticated: boolean };

  // Jeśli userDTO jest dostępny w lokalnym kontekście z middleware, użyj go
  if (userFromLocals && isAuthenticated) {
    // Dodano sprawdzenie isAuthenticated dla pewności

    // userFromLocals jest już typu UserDTO, więc zwracamy go bezpośrednio
    return new Response(JSON.stringify(userFromLocals), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Jeśli nie ma userDTO w lokalnym kontekście lub isAuthenticated jest false,
  // oznacza to, że użytkownik nie jest uwierzytelniony.
  return new Response(JSON.stringify({ message: "Brak autoryzacji." }), { status: 401 });
};
