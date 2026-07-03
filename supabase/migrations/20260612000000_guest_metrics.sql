-- Track anonymous study devices without exposing client-writeable tables.
-- The app writes through app/api/guest/heartbeat with the service role; anon and
-- authenticated clients never receive direct table access.

create table if not exists public.guest_devices (
  guest_key text primary key,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  first_path text,
  last_path text,
  heartbeat_count integer not null default 1,
  constraint guest_devices_heartbeat_count_positive check (heartbeat_count > 0),
  constraint guest_devices_guest_key_sha256 check (guest_key ~ '^[a-f0-9]{64}$')
);

alter table public.guest_devices enable row level security;

revoke all on table public.guest_devices from anon, authenticated;

create index if not exists guest_devices_last_seen_idx
  on public.guest_devices (last_seen_at desc);

create or replace function public.record_guest_heartbeat(
  p_guest_key text,
  p_path text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.guest_devices (
    guest_key,
    first_path,
    last_path
  )
  values (
    p_guest_key,
    left(nullif(p_path, ''), 256),
    left(nullif(p_path, ''), 256)
  )
  on conflict (guest_key) do update
    set last_seen_at = now(),
        last_path = excluded.last_path,
        heartbeat_count = public.guest_devices.heartbeat_count + 1;
end;
$$;

revoke all on function public.record_guest_heartbeat(text, text) from public;
grant execute on function public.record_guest_heartbeat(text, text) to service_role;
