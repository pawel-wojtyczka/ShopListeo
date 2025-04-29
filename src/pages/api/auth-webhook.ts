import type { APIRoute } from "astro";
import { supabaseAdmin } from "../../db/admin";

export const POST: APIRoute = async ({ request }) => {
  // Sprawdź secret dla bezpieczeństwa
  const webhookSecret = import.meta.env.WEBHOOK_SECRET;
  const authHeader = request.headers.get("x-webhook-secret");

  if (authHeader !== webhookSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Pobierz dane wydarzenia
  const payload = await request.json();
  const eventType = payload.type;
  const user = payload.record;

  // Obsługa nowych użytkowników
  if (eventType === "INSERT" && user) {
    try {
      // Dodaj użytkownika do tabeli public.users
      await supabaseAdmin.from("users").insert({ id: user.id, email: user.email });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to sync user" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ success: true, message: "Event processed" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
