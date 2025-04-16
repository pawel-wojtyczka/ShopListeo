-- Migration: fix_user_timestamp_trigger
-- Description: Fixes the issue with the trigger for updating timestamp on the users table
-- Created at: 2024-06-20 15:15:30

-- Problem: The trigger tries to update "updated_at" but users table has "updated_date"
-- Solution: Create a modified trigger function specifically for the users table

-- drop the existing trigger on users to avoid conflicts
drop trigger if exists set_timestamp_users on public.users;

-- create a specific trigger function for users table that uses updated_date instead of updated_at
create or replace function trigger_set_timestamp_users()
returns trigger as $$
begin
  new.updated_date = current_timestamp;
  return new;
end;
$$ language plpgsql;

-- create a new trigger with the correct function
create trigger set_timestamp_users
before update on public.users
for each row
execute function trigger_set_timestamp_users();

-- add comment to explain the fix
comment on function trigger_set_timestamp_users() is 'Updates the updated_date column to current timestamp on record update'; 