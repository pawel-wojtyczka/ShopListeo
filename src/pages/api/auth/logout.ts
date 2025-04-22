import type { APIContext } from 'astro';
import type { AstroLocals } from '@/types/locals';
import { logger } from '@/lib/logger';

export const prerender = false;

/**
 * API endpoint to handle user logout.
 * Calls Supabase signOut on the server-side to clear the session cookie.
 */
export async function POST({ locals, cookies }: APIContext) {
  const requestId = crypto.randomUUID();
  logger.info('[API Logout] Received POST request', { requestId });

  const { supabase } = locals as AstroLocals;

  if (!supabase) {
    logger.error('[API Logout] Supabase client not found in locals', { requestId });
    return new Response(JSON.stringify({ error: 'Internal server error: Supabase client missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Sign out the user on the server side
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('[API Logout] Error signing out from Supabase', { requestId }, error);
      // Even if Supabase fails, proceed to clear cookies as a fallback
    }

    logger.info('[API Logout] Supabase signOut completed (or error occurred, proceeding)', { requestId });

    // Explicitly clear potential Supabase cookies (names might vary, adjust if needed)
    // Astro's signOut might handle this, but being explicit can help
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });
    // Add any other relevant session cookies if necessary

    logger.info('[API Logout] Session cookies cleared', { requestId });

    // Return a success response (No Content)
    return new Response(null, { status: 204 });

  } catch (err) {
    logger.error('[API Logout] Unexpected error during logout process', { requestId }, err);
    return new Response(JSON.stringify({ error: 'Wystąpił nieoczekiwany błąd podczas wylogowywania.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Optional: Handle GET requests or other methods if needed,
// otherwise they will result in a 405 Method Not Allowed error.
export const ALL: APIRoute = ({ redirect }) => {
  // Redirect GET requests or other methods to login as well, or show an error
  return redirect("/login");
};
