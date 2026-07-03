-- Per-cert leaderboard.
--
-- The existing public_leaderboard ranks on user_state.predicted_score, which
-- only holds the ACTIVE cert's score — so with 4 live certs it silently mixes
-- certs. This adds a per-cert score table so each cert can be ranked on its own
-- predicted_score, and a gated view mirroring public_leaderboard's security model.
--
-- (Global ranking by total XP keeps using public_leaderboard.xp — no schema
-- change needed for that; xp is a single global accumulator across all certs.)

create table if not exists public.user_cert_scores (
  user_id uuid not null references auth.users(id) on delete cascade,
  cert_id text not null,
  predicted_score int,
  xp int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, cert_id)
);

alter table public.user_cert_scores enable row level security;

-- Owner-only access to the base table. NO public select here — the public board
-- reads through the gated view below (mirrors the user_state model).
drop policy if exists user_cert_scores_self_select on public.user_cert_scores;
create policy user_cert_scores_self_select on public.user_cert_scores
  for select using ( auth.uid() = user_id );

drop policy if exists user_cert_scores_self_insert on public.user_cert_scores;
create policy user_cert_scores_self_insert on public.user_cert_scores
  for insert with check ( auth.uid() = user_id );

drop policy if exists user_cert_scores_self_update on public.user_cert_scores;
create policy user_cert_scores_self_update on public.user_cert_scores
  for update using ( auth.uid() = user_id ) with check ( auth.uid() = user_id );

drop policy if exists user_cert_scores_self_delete on public.user_cert_scores;
create policy user_cert_scores_self_delete on public.user_cert_scores
  for delete using ( auth.uid() = user_id );

-- Public per-cert leaderboard view. Mirrors public_leaderboard exactly:
-- security_invoker = false (runs as owner, bypassing the base-table RLS) and
-- gated on profiles.is_publicly_listed so only opted-in users are exposed.
create or replace view public.public_cert_leaderboard
  with (security_invoker = false)
as
  select
    s.user_id,
    s.cert_id,
    s.predicted_score,
    s.xp,
    p.display_name,
    p.avatar_url
  from public.user_cert_scores s
  join public.profiles p on p.user_id = s.user_id
  where p.is_publicly_listed = true;

grant select on public.public_cert_leaderboard to anon, authenticated;
