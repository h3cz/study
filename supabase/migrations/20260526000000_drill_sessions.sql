create table public.drill_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  duration_seconds integer not null,
  correct integer not null,
  incorrect integer not null,
  skipped integer not null,
  attempts jsonb not null,
  created_at timestamptz not null default now()
);
create index drill_sessions_user_idx on public.drill_sessions(user_id, started_at desc);
alter table public.drill_sessions enable row level security;
create policy "drill_sessions_self_all" on public.drill_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
