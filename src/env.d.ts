/// <reference types="astro/client" />
/// <reference types="vite/client" />

// Dodanie typów dla testów
import "@testing-library/jest-dom";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types";
import type { UserDTO } from "./types";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user: import("@supabase/supabase-js").User | null;
      authUser: UserDTO | null;
      isAuthenticated: boolean;
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
