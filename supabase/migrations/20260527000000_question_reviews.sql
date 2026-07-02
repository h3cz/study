create table public.question_reviews (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  cert_id text not null,
  reviewed_at timestamptz not null,
  rating smallint not null check (rating between 1 and 4),
  fsrs_state jsonb not null,
  created_at timestamptz not null default now()
);
create index question_reviews_user_idx on public.question_reviews(user_id, reviewed_at desc);
create index question_reviews_due_idx on public.question_reviews(user_id, question_id);
alter table public.question_reviews enable row level security;
create policy "question_reviews_self_all" on public.question_reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
