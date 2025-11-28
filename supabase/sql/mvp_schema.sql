-- DONNA MVP Supabase schema
-- Run in Supabase SQL editor or psql

create extension if not exists pgcrypto;

-- users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text,
  created_at timestamptz default now()
);

-- chat_sessions
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  chat_id text unique,
  created_at timestamptz default now()
);

-- messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id) on delete cascade,
  role text check (role in ('system','user','assistant')),
  content text,
  created_at timestamptz default now()
);

-- user_memory
create table if not exists user_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  key text,
  value jsonb,
  updated_at timestamptz default now()
);

-- abuse_log
create table if not exists abuse_log (
  id bigserial primary key,
  chat_id text,
  user_id uuid references users(id) on delete set null,
  message text,
  created_at timestamptz default now()
);

-- email_logs
create table if not exists email_logs (
  id bigserial primary key,
  user_id uuid references users(id) on delete set null,
  to_address text,
  subject text,
  status text,
  error text,
  created_at timestamptz default now()
);

-- gmail_tokens
create table if not exists gmail_tokens (
  user_id uuid primary key references users(id) on delete cascade,
  refresh_token text not null,
  scope text,
  token_type text,
  expiry_date bigint,
  updated_at timestamptz default now()
);

-- Function: claim_chat_session (atomic claim/upsert avoiding hijack)
create or replace function public.claim_chat_session(p_chat_id text, p_user_id uuid)
returns table (id uuid) as $$
begin
  insert into chat_sessions (chat_id, user_id)
  values (p_chat_id, p_user_id)
  on conflict (chat_id) do update
    set user_id = coalesce(chat_sessions.user_id, excluded.user_id)
  where chat_sessions.user_id is null or chat_sessions.user_id = excluded.user_id
  returning chat_sessions.id into id;
  if not found then
    raise exception 'chat session belongs to a different user' using errcode = 'P0001';
  end if;
  return;
end;
$$ language plpgsql security definer set search_path = public;

