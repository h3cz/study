alter table public.user_state
  add column if not exists daily_goal_questions integer not null default 10;
