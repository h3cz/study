create table public.reported_questions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  cert_id text not null,
  reason text not null,
  note text,
  reported_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index reported_questions_qid_idx on public.reported_questions(question_id);
create index reported_questions_user_idx on public.reported_questions(user_id, reported_at desc);
alter table public.reported_questions enable row level security;
create policy "reported_questions_self_all" on public.reported_questions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
