alter table public.guest_devices
  add column if not exists claimed_user_id uuid references auth.users(id) on delete set null,
  add column if not exists claimed_at timestamptz;

create index if not exists guest_devices_claimed_user_idx
  on public.guest_devices (claimed_user_id)
  where claimed_user_id is not null;

create or replace function public.claim_guest_device(
  p_guest_key text,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.guest_devices (
    guest_key,
    claimed_user_id,
    claimed_at
  )
  values (
    p_guest_key,
    p_user_id,
    now()
  )
  on conflict (guest_key) do update
    set claimed_user_id = coalesce(public.guest_devices.claimed_user_id, excluded.claimed_user_id),
        claimed_at = coalesce(public.guest_devices.claimed_at, excluded.claimed_at);
end;
$$;

revoke all on function public.claim_guest_device(text, uuid) from public;
grant execute on function public.claim_guest_device(text, uuid) to service_role;
