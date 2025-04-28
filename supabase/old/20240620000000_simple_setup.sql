-- supabase/migrations/20240620000000_simple_setup.sql

-- Usuń istniejące triggery i funkcje które mogą powodować problemy
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Usuń istniejącą tabelę users jeśli istnieje
DROP TABLE IF EXISTS public.users;

-- Utwórz prostą tabelę users bez odniesień do auth
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wyłącz RLS na tabeli users dla uproszczenia testów
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Nadaj pełne uprawnienia do tabeli
GRANT ALL ON TABLE public.users TO postgres, anon, authenticated, service_role;