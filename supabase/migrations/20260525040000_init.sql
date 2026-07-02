-- SecPlus Quest initial schema
-- User-owned cloud sync for local-first Dexie state. All tables RLS-locked to auth.uid().

create extension if not exists pgcrypto;

-- ---------- profiles ----------
create table public.profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_self_select" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles_self_insert" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = user_id);

-- Auto-create profile + user_state on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id) values (new.id) on conflict do nothing;
  insert into public.user_state (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

-- ---------- user_state ----------
create table public.user_state (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  xp               integer not null default 0,
  level            integer not null default 0,
  streak           integer not null default 0,
  last_study_date  date,
  total_study_days integer not null default 0,
  predicted_score  integer,
  updated_at       timestamptz not null default now()
);
alter table public.user_state enable row level security;
create policy "user_state_self_all" on public.user_state for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- quiz_sessions ----------
create table public.quiz_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  cert_id       text not null,
  started_at    timestamptz not null,
  completed_at  timestamptz,
  score_pct     numeric(5,2),
  num_questions integer not null default 0,
  num_correct   integer not null default 0,
  -- array of {questionId, objectiveId, picked: 'A'|'B'|'C'|'D'|null, correct: bool, msSpent: number}
  questions     jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now()
);
create index quiz_sessions_user_idx on public.quiz_sessions(user_id, started_at desc);
alter table public.quiz_sessions enable row level security;
create policy "quiz_sessions_self_all" on public.quiz_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- flashcard_reviews ----------
create table public.flashcard_reviews (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  flashcard_id  text not null,
  cert_id       text not null,
  objective_id  text not null,
  reviewed_at   timestamptz not null,
  rating        smallint not null check (rating between 1 and 4), -- 1=Again 2=Hard 3=Good 4=Easy
  fsrs_state    jsonb not null,                                    -- full ts-fsrs Card snapshot post-review
  created_at    timestamptz not null default now()
);
create index flashcard_reviews_user_idx on public.flashcard_reviews(user_id, reviewed_at desc);
create index flashcard_reviews_card_idx on public.flashcard_reviews(user_id, flashcard_id);
alter table public.flashcard_reviews enable row level security;
create policy "flashcard_reviews_self_all" on public.flashcard_reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- cohorts (feature-flagged, scaffolded) ----------
create table public.cohorts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  invite_code text not null unique,
  created_at  timestamptz not null default now()
);
alter table public.cohorts enable row level security;
create policy "cohorts_owner_all" on public.cohorts for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create table public.cohort_members (
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  user_id   uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (cohort_id, user_id)
);
alter table public.cohort_members enable row level security;
create policy "cohort_members_self_select" on public.cohort_members for select using (auth.uid() = user_id);
create policy "cohort_members_self_join" on public.cohort_members for insert with check (auth.uid() = user_id);
create policy "cohort_members_self_leave" on public.cohort_members for delete using (auth.uid() = user_id);

-- ---------- updated_at triggers ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_touch_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger user_state_touch_updated_at before update on public.user_state
  for each row execute function public.touch_updated_at();

-- ---------- auth signup trigger ----------
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
