alter table public.user_state
  add column if not exists streak_freezes integer not null default 0,
  add column if not exists streak_freezes_earned_total integer not null default 0,
  add column if not exists last_freeze_applied_at timestamptz,
  add column if not exists last_freeze_earned_at date;
