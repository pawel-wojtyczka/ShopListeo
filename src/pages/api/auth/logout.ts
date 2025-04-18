import type { APIRoute } from "astro";

export const prerender = false;

/**
 * Handles the POST request to log out the user.
 * Deletes the authentication cookie and redirects to the login page.
 */
export const POST: APIRoute = async ({ cookies, redirect }) => {
  console.log("API: Attempting to logout...");

  // Delete the authentication cookie
  // Make sure the cookie name 'authToken' matches the one set during login
  cookies.delete("authToken", {
    path: "/",
    // Consider adding httpOnly: true, secure: true (in production) for security
  });
  console.log("API: Auth token cookie deleted.");

  // Optional: Call Supabase signout if needed and if supabase client is available in locals
  // try {
  //   if (locals.supabase) {
  //     const { error } = await locals.supabase.auth.signOut();
  //     if (error) {
  //       console.error("API: Supabase signout error:", error.message);
  //     } else {
  //       console.log("API: Supabase signout successful.");
  //     }
  //   } else {
  //      console.log("API: Supabase client not found in locals for signout.");
  //   }
  // } catch (e: any) {
  //   console.error("API: Error during Supabase signout call:", e.message);
  // }

  // Redirect to the login page
  return redirect("/login");
};

// Optional: Handle GET requests or other methods if needed,
// otherwise they will result in a 405 Method Not Allowed error.
export const ALL: APIRoute = ({ redirect }) => {
  // Redirect GET requests or other methods to login as well, or show an error
  return redirect("/login");
};
