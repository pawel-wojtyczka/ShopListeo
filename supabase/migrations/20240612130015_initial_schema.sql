-- SQL Schema for ShopListeo Project for Supabase (Corrected Drop Order)
-- This script creates the necessary tables, relationships, triggers,
-- and synchronizes the public users table with Supabase Auth.
-- Row Level Security (RLS) policies are included but commented out as per MVP decision.

-- Revised Drop Order:
-- 1. Drop triggers depending on functions in public schema (like the one on auth.users).
-- 2. Drop functions and types used by tables or triggers.
-- 3. Drop tables in reverse order of dependency (using CASCADE).

-- 1. Drop trigger on auth.users first, as it depends on public.handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop functions and types
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.trigger_set_timestamp_users();
DROP FUNCTION IF EXISTS public.trigger_set_timestamp();
DROP FUNCTION IF EXISTS public.apply_shopping_list_changes(uuid,uuid,public.new_shopping_list_item[],uuid[]);
DROP TYPE IF EXISTS public.new_shopping_list_item;

-- 3. Drop tables using CASCADE (will remove dependent triggers on these tables)
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.shopping_list_items CASCADE;
DROP TABLE IF EXISTS public.shopping_lists CASCADE;
DROP TABLE IF EXISTS public.users CASCADE; -- This will drop triggers like set_timestamp_users defined ON public.users

-- == CREATE Statements ==

-- 1. Create public.users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  admin BOOLEAN NOT NULL DEFAULT FALSE,
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_date TIMESTAMPTZ,
  updated_date TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'Stores public user profiles, linked to Supabase Auth users.';
COMMENT ON COLUMN public.users.admin IS 'Identifies users with administrative privileges. Default is false.';
COMMENT ON COLUMN public.users.registration_date IS 'Timestamp when the user was created in auth.users.';
COMMENT ON COLUMN public.users.last_login_date IS 'Timestamp of the last successful login (updated by app logic/triggers).';
COMMENT ON COLUMN public.users.updated_date IS 'Timestamp of the last update to the user profile.';

-- 2. Create public.shopping_lists table
CREATE TABLE public.shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.shopping_lists IS 'Stores shopping lists created by users.';
COMMENT ON COLUMN public.shopping_lists.user_id IS 'Foreign key referencing the user who owns the list.';

-- 3. Create public.shopping_list_items table
CREATE TABLE public.shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID NOT NULL REFERENCES public.shopping_lists(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  purchased BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.shopping_list_items IS 'Stores individual items within a shopping list.';
COMMENT ON COLUMN public.shopping_list_items.shopping_list_id IS 'Foreign key referencing the shopping list the item belongs to.';
COMMENT ON COLUMN public.shopping_list_items.purchased IS 'Indicates if the item has been marked as purchased.';

-- 4. Create public.conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  openai_thread_id TEXT,
  answer_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  messages JSONB
);

COMMENT ON TABLE public.conversations IS 'Stores AI conversation history related to shopping lists.';
COMMENT ON COLUMN public.conversations.user_id IS 'Foreign key referencing the user involved in the conversation.';
COMMENT ON COLUMN public.conversations.openai_thread_id IS 'Identifier for the thread in the external AI service (e.g., OpenAI).';
COMMENT ON COLUMN public.conversations.answer_accepted IS 'Indicates if the user accepted the AI generated list/answer.';
COMMENT ON COLUMN public.conversations.messages IS 'Stores the history of messages in the conversation (user and AI).';

-- 5. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON public.shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_shopping_list_id ON public.shopping_list_items(shopping_list_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);

-- 6. Create Trigger Functions for Timestamps

-- Function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Specific function for 'users' table to update 'updated_date'
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp_users()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create Triggers to automatically update timestamps

-- Trigger for users table
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp_users();

-- Trigger for shopping_lists table
CREATE TRIGGER set_timestamp_shopping_lists
BEFORE UPDATE ON public.shopping_lists
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Trigger for shopping_list_items table
CREATE TRIGGER set_timestamp_shopping_list_items
BEFORE UPDATE ON public.shopping_list_items
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- 8. Create Trigger Function for Auth Sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, registration_date, updated_date)
  VALUES (NEW.id, NEW.email, NEW.created_at, NEW.updated_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create Trigger on auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 10. Composite Type for RPC function
CREATE TYPE public.new_shopping_list_item AS (
    item_name TEXT,
    purchased BOOLEAN
);

-- 11. RPC Function to apply shopping list changes
CREATE OR REPLACE FUNCTION public.apply_shopping_list_changes(
    p_list_id UUID,
    p_user_id UUID,
    items_to_add new_shopping_list_item[],
    items_to_delete UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    list_owner_id UUID;
    item_to_add new_shopping_list_item;
BEGIN
    -- 1. Verify permission
    SELECT user_id INTO list_owner_id
    FROM public.shopping_lists
    WHERE id = p_list_id;

    IF list_owner_id IS NULL THEN
        RAISE EXCEPTION 'Shopping list with ID % not found', p_list_id;
    END IF;

    IF list_owner_id != p_user_id THEN
        RAISE EXCEPTION 'User % does not have permission to modify shopping list %', p_user_id, p_list_id;
    END IF;

    -- 2. Delete items
    IF array_length(items_to_delete, 1) > 0 THEN
        DELETE FROM public.shopping_list_items
        WHERE shopping_list_id = p_list_id
          AND id = ANY(items_to_delete);
    END IF;

    -- 3. Add new items
    IF array_length(items_to_add, 1) > 0 THEN
        FOREACH item_to_add IN ARRAY items_to_add
        LOOP
            INSERT INTO public.shopping_list_items (shopping_list_id, item_name, purchased)
            VALUES (p_list_id, item_to_add.item_name, item_to_add.purchased);
        END LOOP;
    END IF;

    -- 4. Update the list's updated_at timestamp
    UPDATE public.shopping_lists
    SET updated_at = now()
    WHERE id = p_list_id;

END;
$$;

-- 12. Grant Permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.shopping_lists TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.shopping_list_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.conversations TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_shopping_list_changes(uuid,uuid,public.new_shopping_list_item[],uuid[]) TO anon, authenticated;

-- 13. Row Level Security (RLS)
-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owners
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_lists FORCE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.conversations FORCE ROW LEVEL SECURITY;

-- RLS Policies for public.users
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for public.shopping_lists
DROP POLICY IF EXISTS "Users can view their own shopping lists" ON public.shopping_lists;
CREATE POLICY "Users can view their own shopping lists"
  ON public.shopping_lists FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own shopping lists" ON public.shopping_lists;
CREATE POLICY "Users can insert their own shopping lists"
  ON public.shopping_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own shopping lists" ON public.shopping_lists;
CREATE POLICY "Users can update their own shopping lists"
  ON public.shopping_lists FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own shopping lists" ON public.shopping_lists;
CREATE POLICY "Users can delete their own shopping lists"
  ON public.shopping_lists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for public.shopping_list_items
DROP POLICY IF EXISTS "Users can view items from their own lists" ON public.shopping_list_items;
CREATE POLICY "Users can view items from their own lists"
  ON public.shopping_list_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists sl
      WHERE sl.id = shopping_list_id AND sl.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert items to their own lists" ON public.shopping_list_items;
CREATE POLICY "Users can insert items to their own lists"
  ON public.shopping_list_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shopping_lists sl
      WHERE sl.id = shopping_list_id AND sl.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update items from their own lists" ON public.shopping_list_items;
CREATE POLICY "Users can update items from their own lists"
  ON public.shopping_list_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists sl
      WHERE sl.id = shopping_list_id AND sl.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete items from their own lists" ON public.shopping_list_items;
CREATE POLICY "Users can delete items from their own lists"
  ON public.shopping_list_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.shopping_lists sl
      WHERE sl.id = shopping_list_id AND sl.user_id = auth.uid()
    )
  );

-- RLS Policies for public.conversations
DROP POLICY IF EXISTS "Users can manage their own conversations" ON public.conversations;
CREATE POLICY "Users can manage their own conversations"
  ON public.conversations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Koniec skryptu --