alter table public.guest_devices
  add column if not exists save_prompt_view_count integer not null default 0,
  add column if not exists save_prompt_click_count integer not null default 0,
  add column if not exists last_save_prompt_at timestamptz,
  add column if not exists last_save_click_at timestamptz;

alter table public.guest_devices
  add constraint guest_devices_save_prompt_view_count_nonnegative
    check (save_prompt_view_count >= 0) not valid,
  add constraint guest_devices_save_prompt_click_count_nonnegative
    check (save_prompt_click_count >= 0) not valid;

create or replace function public.record_guest_save_prompt(
  p_guest_key text,
  p_event text,
  p_path text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_event not in ('shown', 'clicked') then
    return;
  end if;

  insert into public.guest_devices (
    guest_key,
    first_path,
    last_path,
    save_prompt_view_count,
    save_prompt_click_count,
    last_save_prompt_at,
    last_save_click_at
  )
  values (
    p_guest_key,
    left(nullif(p_path, ''), 256),
    left(nullif(p_path, ''), 256),
    case when p_event = 'shown' then 1 else 0 end,
    case when p_event = 'clicked' then 1 else 0 end,
    case when p_event = 'shown' then now() else null end,
    case when p_event = 'clicked' then now() else null end
  )
  on conflict (guest_key) do update
    set last_seen_at = now(),
        last_path = excluded.last_path,
        save_prompt_view_count = public.guest_devices.save_prompt_view_count + case when p_event = 'shown' then 1 else 0 end,
        save_prompt_click_count = public.guest_devices.save_prompt_click_count + case when p_event = 'clicked' then 1 else 0 end,
        last_save_prompt_at = case when p_event = 'shown' then now() else public.guest_devices.last_save_prompt_at end,
        last_save_click_at = case when p_event = 'clicked' then now() else public.guest_devices.last_save_click_at end;
end;
$$;

revoke all on function public.record_guest_save_prompt(text, text, text) from public;
grant execute on function public.record_guest_save_prompt(text, text, text) to service_role;
