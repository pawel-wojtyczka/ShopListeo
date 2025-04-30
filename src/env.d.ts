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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ImportMetaEnv {
  // Tutaj możesz dodać definicje innych zmiennych środowiskowych, jeśli są potrzebne
  // np. readonly VITE_API_URL: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
