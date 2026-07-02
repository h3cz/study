-- Study Buddy Phase 1: per-user Personal Access Tokens (PATs) for the read-only
-- AI-tutor API. RLS-locked to auth.uid(). Raw token is NEVER stored — only a
-- SHA-256 hash. Resolution by hash is done server-side with the service-role
-- client (token lookup ONLY); all data queries use the resolved user_id against
-- RLS-locked tables.

create extension if not exists pgcrypto;

-- ---------- study_buddy_keys ----------
create table public.study_buddy_keys (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  token_hash   text not null unique,          -- SHA-256 hex of the raw token; raw never stored
  name         text not null default 'AI Study Buddy',
  prefix       text not null,                 -- first 12 chars of raw token, e.g. "sq_live_ab12" for display only
  created_at   timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at   timestamptz
);
create index study_buddy_keys_user_idx on public.study_buddy_keys(user_id, created_at desc);
create index study_buddy_keys_hash_idx on public.study_buddy_keys(token_hash) where revoked_at is null;

alter table public.study_buddy_keys enable row level security;

-- Users may see and manage ONLY their own keys (never the raw token — it isn't stored).
-- token_hash is exposed via select but is a one-way hash and useless without the raw value.
create policy "study_buddy_keys_self_select" on public.study_buddy_keys
  for select using (auth.uid() = user_id);
create policy "study_buddy_keys_self_insert" on public.study_buddy_keys
  for insert with check (auth.uid() = user_id);
create policy "study_buddy_keys_self_update" on public.study_buddy_keys
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_buddy_keys_self_delete" on public.study_buddy_keys
  for delete using (auth.uid() = user_id);

-- ---------- study_buddy_usage (per-key rate-limit counter, Supabase-backed) ----------
-- Durable rate-limit accounting so limits survive serverless cold starts and
-- multiple regions. One row per (key, window-day). Self-select for transparency.
create table public.study_buddy_usage (
  key_id      uuid not null references public.study_buddy_keys(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  window_day  date not null default current_date,
  req_count   integer not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (key_id, window_day)
);
alter table public.study_buddy_usage enable row level security;
create policy "study_buddy_usage_self_select" on public.study_buddy_usage
  for select using (auth.uid() = user_id);

-- SECURITY DEFINER RPC to atomically bump a key's daily request counter and
-- return the new count. SECURITY HARDENING (per security review #6):
--   * Does NOT accept a user_id parameter — caller passes only the key_id it
--     already resolved server-side; the function re-derives user_id from the
--     key row itself, so it cannot be used to write another user's counter to a
--     wrong owner.
--   * No dynamic SQL — no injection surface.
--   * Pinned search_path.
--   * Returns the post-increment count so the route can enforce the cap.
create or replace function public.bump_study_buddy_usage(p_key_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_count   integer;
begin
  select user_id into v_user_id from public.study_buddy_keys
    where id = p_key_id and revoked_at is null;
  if v_user_id is null then
    raise exception 'invalid or revoked key';
  end if;

  insert into public.study_buddy_usage (key_id, user_id, window_day, req_count)
  values (p_key_id, v_user_id, current_date, 1)
  on conflict (key_id, window_day)
  do update set req_count = public.study_buddy_usage.req_count + 1,
                updated_at = now()
  returning req_count into v_count;

  return v_count;
end;
$$;

-- Lock down execute: the route calls this with the service-role client only.
revoke all on function public.bump_study_buddy_usage(uuid) from public;
revoke all on function public.bump_study_buddy_usage(uuid) from anon;
revoke all on function public.bump_study_buddy_usage(uuid) from authenticated;

-- Touch last_used_at without bypassing RLS for data — service-role only.
create or replace function public.touch_study_buddy_key(p_key_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.study_buddy_keys set last_used_at = now() where id = p_key_id;
$$;
revoke all on function public.touch_study_buddy_key(uuid) from public;
revoke all on function public.touch_study_buddy_key(uuid) from anon;
revoke all on function public.touch_study_buddy_key(uuid) from authenticated;
