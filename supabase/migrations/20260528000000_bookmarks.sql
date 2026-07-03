create table public.bookmarks (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  cert_id text not null,
  bookmarked_at timestamptz not null,
  note text,
  unique (user_id, question_id)
);
alter table public.bookmarks enable row level security;
create policy "bookmarks_self_all" on public.bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
