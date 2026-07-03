-- Web Push: per-device subscriptions + per-user daily-reminder preference.
--
-- push_subscriptions stores each browser/device's Web Push subscription so the
-- daily-reminder cron can send to all of a user's devices. Reminder time lives
-- on profiles (per-user, not per-device): reminder_hour (0-23 local) + the IANA
-- timezone it's relative to. reminder_hour NULL = reminders off.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

-- Users manage only their own subscriptions. The daily-reminder cron reads via
-- the service-role key (bypasses RLS) — no public read policy is exposed.
drop policy if exists push_subs_self_select on public.push_subscriptions;
create policy push_subs_self_select on public.push_subscriptions
  for select using (auth.uid() = user_id);
drop policy if exists push_subs_self_insert on public.push_subscriptions;
create policy push_subs_self_insert on public.push_subscriptions
  for insert with check (auth.uid() = user_id);
drop policy if exists push_subs_self_delete on public.push_subscriptions;
create policy push_subs_self_delete on public.push_subscriptions
  for delete using (auth.uid() = user_id);

-- Per-user reminder preference (client writes via the existing profiles_self_update policy).
alter table public.profiles add column if not exists reminder_hour int;  -- 0-23 local; NULL = off
alter table public.profiles add column if not exists reminder_tz text;    -- IANA tz, e.g. "America/Chicago"
