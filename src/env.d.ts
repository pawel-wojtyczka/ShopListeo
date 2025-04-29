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
