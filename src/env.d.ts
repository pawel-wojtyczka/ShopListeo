/// <reference types="astro/client" />
/// <reference types="vite/client" />

// Dodanie typów dla testów
import "@testing-library/jest-dom";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";
import type { UserDTO } from "./types";

declare global {
  namespace App {
    // Dodajemy typ dla środowiska wykonawczego Cloudflare Pages

    interface Platform {
      // Definiujemy Platform, które może zawierać 'env'
      env: Record<string, unknown>;
      // Można dodać inne właściwości specyficzne dla platformy
    }

    interface Locals {
      supabase: SupabaseClient<Database> | null; // Pozwalamy na null
      supabaseAdmin?: SupabaseClient<Database> | null; // Opcjonalny klient admina, może być null
      user: import("@supabase/supabase-js").User | null;
      // Używamy userDTO i isAuthenticated zgodnie z kodem middleware
      userDTO: UserDTO | null;
      isAuthenticated: boolean;
      // Usuwamy authUser, jeśli nie jest już potrzebne
      // authUser: UserDTO | null;

      // Dodajemy runtime z platformy
      runtime?: Platform | undefined;
    }
  }
}

export {};

interface ImportMetaEnv {
  // Zmienne środowiskowe dla Supabase
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;

  // Zmienne środowiskowe dla OpenAI
  readonly OPENAI_API_KEY: string;

  // Zmienne środowiskowe dla Cloudflare
  readonly CLOUDFLARE_ACCOUNT_ID?: string;
  readonly CLOUDFLARE_API_TOKEN?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
