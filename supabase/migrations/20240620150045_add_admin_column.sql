-- Migration: add_admin_column
-- Description: Adds an admin boolean column to the users table to identify administrators
-- Created at: 2024-06-20 15:00:45

-- add admin column to users table with default value of false
-- this allows identification of users with administrative privileges
alter table public.users add column if not exists admin boolean not null default false;

-- add comment to explain the purpose of the column
comment on column public.users.admin is 'Identifies users with administrative privileges. Default is false for regular users.';

-- update existing comment on table if needed
comment on table public.users is 'Stores user accounts including regular users and administrators'; 