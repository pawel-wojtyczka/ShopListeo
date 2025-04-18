import type { APIRoute } from "astro";
import { z } from "zod";
import type { AstroLocals } from "src/types/locals";
import type { LoginUserResponse } from "src/types";

export const prerender = false;

// Input validation schema
const LoginSchema = z.object({
  email: z.string().email("Nieprawidłowy format adresu email."),
  password: z.string().min(1, "Hasło jest wymagane."),
  // rememberMe is handled client-side for storing token, not needed here
});

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const supabase = (locals as AstroLocals)?.supabase;
  if (!supabase) {
    console.error("API /login: Supabase client not found in locals");
    return new Response(JSON.stringify({ message: "Błąd serwera." }), { status: 500 });
  }

  let requestData;
  try {
    requestData = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: "Nieprawidłowy format zapytania." }), { status: 400 });
  }

  // Validate input
  const validationResult = LoginSchema.safeParse(requestData);
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        message: "Błąd walidacji.",
        errors: validationResult.error.flatten().fieldErrors,
      }),
      { status: 400 }
    );
  }

  const { email, password } = validationResult.data;
  console.log(`API /login: Attempting login for ${email}`);

  try {
    // Sign in using Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error || !data.session || !data.user) {
      console.error("API /login: Supabase signIn error:", error?.message);
      // Use a generic message for invalid credentials
      return new Response(JSON.stringify({ message: "Nieprawidłowy email lub hasło." }), { status: 401 }); // Unauthorized
    }

    // Login successful, extract token and user info
    const token = data.session.access_token;
    const user = data.user;
    console.log(`API /login: Login successful for user: ${user.email}`);

    // Set the auth token cookie (important for subsequent requests and SSR)
    // Note: Set httpOnly: true and secure: true in production for security!
    cookies.set("authToken", token, {
      path: "/",
      maxAge: data.session.expires_in || 60 * 60 * 24 * 7, // Default to 7 days
      // httpOnly: true,
      // secure: import.meta.env.PROD,
      sameSite: "lax",
    });
    console.log("API /login: authToken cookie set.");

    // Prepare the response body matching LoginUserResponse
    const responseBody: LoginUserResponse = {
      id: user.id,
      email: user.email || "",
      token: token, // Send token back to client (might be needed for some client-side logic)
    };

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("API /login: Unexpected error during login:", error);
    return new Response(JSON.stringify({ message: "Wystąpił nieoczekiwany błąd serwera." }), { status: 500 });
  }
};
