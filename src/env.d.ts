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

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};
