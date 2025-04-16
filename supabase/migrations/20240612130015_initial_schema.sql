-- Migration: initial_schema
-- Description: Creates the initial database schema with users, conversations, shopping lists, and items
-- Created at: 2024-06-12 13:00:15

-- users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email varchar(128) not null unique,
  password_hash text not null,
  registration_date timestamp not null default current_timestamp,
  last_login_date timestamp,
  updated_date timestamp not null default current_timestamp
);

-- RLS disabled for MVP stage
-- enable row level security
-- alter table public.users enable row level security;

-- rls policies for users
-- create policy "Users can view their own data" 
--   on public.users 
--   for select 
--   to authenticated 
--   using (auth.uid() = id);

-- create policy "Users can update their own data" 
--   on public.users 
--   for update 
--   to authenticated 
--   using (auth.uid() = id);

-- conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  started_at timestamp not null default current_timestamp,
  ended_at timestamp,
  openai_thread_id text,
  answer_accepted boolean not null default false,
  messages jsonb
);

-- RLS disabled for MVP stage
-- enable row level security
-- alter table public.conversations enable row level security;

-- rls policies for conversations
-- create policy "Users can view their own conversations" 
--   on public.conversations 
--   for select 
--   to authenticated 
--   using (auth.uid() = user_id);

-- create policy "Users can insert their own conversations" 
--   on public.conversations 
--   for insert 
--   to authenticated 
--   with check (auth.uid() = user_id);

-- create policy "Users can update their own conversations" 
--   on public.conversations 
--   for update 
--   to authenticated 
--   using (auth.uid() = user_id);

-- create policy "Users can delete their own conversations" 
--   on public.conversations 
--   for delete 
--   to authenticated 
--   using (auth.uid() = user_id);

-- shopping_lists table
create table if not exists public.shopping_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  title varchar(255) not null,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

-- RLS disabled for MVP stage
-- enable row level security
-- alter table public.shopping_lists enable row level security;

-- rls policies for shopping_lists
-- create policy "Users can view their own shopping lists" 
--   on public.shopping_lists 
--   for select 
--   to authenticated 
--   using (auth.uid() = user_id);

-- create policy "Users can insert their own shopping lists" 
--   on public.shopping_lists 
--   for insert 
--   to authenticated 
--   with check (auth.uid() = user_id);

-- create policy "Users can update their own shopping lists" 
--   on public.shopping_lists 
--   for update 
--   to authenticated 
--   using (auth.uid() = user_id);

-- create policy "Users can delete their own shopping lists" 
--   on public.shopping_lists 
--   for delete 
--   to authenticated 
--   using (auth.uid() = user_id);

-- shopping_list_items table
create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  shopping_list_id uuid not null references public.shopping_lists(id) on delete cascade,
  item_name text not null,
  purchased boolean not null default false,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp
);

-- RLS disabled for MVP stage
-- enable row level security
-- alter table public.shopping_list_items enable row level security;

-- rls policies for shopping_list_items
-- create policy "Users can view items from their shopping lists" 
--   on public.shopping_list_items 
--   for select 
--   to authenticated 
--   using (
--     shopping_list_id in (
--       select id from public.shopping_lists where user_id = auth.uid()
--     )
--   );

-- create policy "Users can insert items to their shopping lists" 
--   on public.shopping_list_items 
--   for insert 
--   to authenticated 
--   with check (
--     shopping_list_id in (
--       select id from public.shopping_lists where user_id = auth.uid()
--     )
--   );

-- create policy "Users can update items from their shopping lists" 
--   on public.shopping_list_items 
--   for update 
--   to authenticated 
--   using (
--     shopping_list_id in (
--       select id from public.shopping_lists where user_id = auth.uid()
--     )
--   );

-- create policy "Users can delete items from their shopping lists" 
--   on public.shopping_list_items 
--   for delete 
--   to authenticated 
--   using (
--     shopping_list_id in (
--       select id from public.shopping_lists where user_id = auth.uid()
--     )
--   );

-- add indexes to improve query performance
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_shopping_lists_user_id on public.shopping_lists(user_id);
create index if not exists idx_shopping_list_items_shopping_list_id on public.shopping_list_items(shopping_list_id);

-- add triggers for updated_at columns
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = current_timestamp;
  return new;
end;
$$ language plpgsql;

create trigger set_timestamp_users
before update on public.users
for each row
execute function trigger_set_timestamp();

create trigger set_timestamp_shopping_lists
before update on public.shopping_lists
for each row
execute function trigger_set_timestamp();

create trigger set_timestamp_shopping_list_items
before update on public.shopping_list_items
for each row
execute function trigger_set_timestamp(); 