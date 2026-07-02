create table public.mock_exam_sessions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  completed_at timestamptz,
  duration_ms integer,
  total_questions integer not null,
  num_correct integer not null,
  score_percent numeric(5,2) not null,
  predicted_score integer not null,
  passed boolean not null,
  domain_breakdown jsonb not null,
  questions jsonb not null,
  created_at timestamptz not null default now()
);
create index mock_exam_sessions_user_idx on public.mock_exam_sessions(user_id, started_at desc);
alter table public.mock_exam_sessions enable row level security;
create policy "mock_exam_sessions_self_all" on public.mock_exam_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
