import type { APIContext } from "astro";
import type { User } from "@supabase/supabase-js";
import type { Mock } from "vitest";

/**
 * Typ reprezentujący mockowane funkcje Supabase w testach
 */
export type MockFunction = Mock;

/**
 * Typ reprezentujący mockowany klient Supabase w testach
 */
export interface MockSupabaseClient {
  from: MockFunction;
  insert?: MockFunction;
  select?: MockFunction;
  update?: MockFunction;
  delete?: MockFunction;
  single?: MockFunction;
  auth?: {
    getUser: MockFunction;
  };
}

/**
 * Interfejs do typowania contexts w testach API
 */
export type MockAPIContext = APIContext<Record<string, unknown>>;

/**
 * Typ reprezentujący mockowane parametry kontekstu API w testach
 */
export interface MockAPIParams {
  request: Request;
  locals: {
    supabase: MockSupabaseClient;
    user: User | null;
    [key: string]: unknown;
  };
}
