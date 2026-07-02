-- Multiplayer hardening + rematch (follow-up to 20260610000000_multiplayer.sql).
--
-- Addresses an independent review:
--   1. XP-clobber race: study XP is client-authoritative (absolute upsert) while
--      duel XP is server-authoritative (an increment in mp_advance). A stale
--      absolute user_state push queued offline before a duel could overwrite the
--      server's XP award. Fix: a monotonic sync RPC — xp/level only ever move up.
--   2. Ghost opponents: duel_queue rows had no TTL, so a closed tab could be paired
--      as a live opponent. Fix: mp_quickmatch reaps stale rows before pairing.
--   3. Missing hot-path indexes for the queue + cleanup scans.
--   4. Rematch: one-click "play the same opponent again", idempotent under a race.
--   5. Realtime Authorization for co-study rooms (gate presence/chat to authed users).

-- ─── 1. Monotonic user_state sync (clobber-proof XP) ───────────────────────────
-- Replaces the client's direct `upsert user_state` for the XP-bearing path. XP and
-- level are monotonic in this app (you never lose XP), so GREATEST makes the write
-- idempotent: a stale absolute push can never lower the server below an award it
-- already granted. Identity is the verified caller (auth.uid()), never client input.
create or replace function public.sync_user_state(
  p_xp                  int,
  p_level               int,
  p_streak              int,
  p_last_study_date     date,
  p_total_study_days    int,
  p_predicted_score     int,
  p_daily_goal_questions int
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  insert into public.user_state
    (user_id, xp, level, streak, last_study_date, total_study_days,
     predicted_score, daily_goal_questions)
  values
    (v_uid, coalesce(p_xp, 0), coalesce(p_level, 0), coalesce(p_streak, 0),
     p_last_study_date, coalesce(p_total_study_days, 0),
     p_predicted_score, p_daily_goal_questions)
  on conflict (user_id) do update set
    -- Monotonic: never regress XP/level/total_study_days below their current value.
    xp               = greatest(public.user_state.xp, excluded.xp),
    level            = greatest(public.user_state.level, excluded.level),
    total_study_days = greatest(public.user_state.total_study_days, excluded.total_study_days),
    -- Last-writer for non-monotonic signals (streak can reset, score can drop).
    streak           = excluded.streak,
    last_study_date  = excluded.last_study_date,
    predicted_score  = excluded.predicted_score,
    -- Preserve an existing daily goal if this push omitted it (null).
    daily_goal_questions = coalesce(excluded.daily_goal_questions, public.user_state.daily_goal_questions),
    updated_at       = now();
end $$;

revoke all on function public.sync_user_state(int, int, int, date, int, int, int)
  from public, anon;
grant execute on function public.sync_user_state(int, int, int, date, int, int, int)
  to authenticated;

-- ─── 2 & 3. Indexes for queue pairing + cleanup scans ──────────────────────────
create index if not exists duel_queue_cert_enqueued_idx
  on public.duel_queue(cert_id, enqueued_at);
create index if not exists duel_matches_status_created_idx
  on public.duel_matches(status, created_at);

-- ─── 2. mp_quickmatch: reap stale queue rows before pairing ────────────────────
-- Identical to the original except for the opening DELETE: any queue row older than
-- 2 minutes (well past the client's active polling window) is a closed tab / aband-
-- oned wait, so we drop it before looking for an opponent. No ghost pairings.
create or replace function public.mp_quickmatch(
  p_user uuid, p_cert text, p_question_ids text[],
  p_num_rounds int, p_round_limit_ms int, p_base_points int
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_opp uuid;
  v_match uuid;
begin
  -- Reap stale waiters so we never pair a live player with a ghost.
  delete from public.duel_queue where enqueued_at < now() - interval '2 minutes';

  -- Same-cert opponent first.
  select user_id into v_opp from public.duel_queue
    where user_id <> p_user and cert_id = p_cert
    order by enqueued_at asc
    for update skip locked
    limit 1;

  -- Fallback: any waiting opponent.
  if v_opp is null then
    select user_id into v_opp from public.duel_queue
      where user_id <> p_user
      order by enqueued_at asc
      for update skip locked
      limit 1;
  end if;

  if v_opp is null then
    insert into public.duel_queue (user_id, cert_id) values (p_user, p_cert)
      on conflict (user_id) do update set cert_id = excluded.cert_id, enqueued_at = now();
    return null;
  end if;

  delete from public.duel_queue where user_id in (p_user, v_opp);

  insert into public.duel_matches
    (cert_id, status, mode, host_id, guest_id, question_ids,
     num_rounds, round_limit_ms, base_points, current_round, round_started_at, started_at)
    values
    (p_cert, 'active', 'quick', v_opp, p_user, p_question_ids,
     p_num_rounds, p_round_limit_ms, p_base_points, 0, now(), now())
    returning id into v_match;

  return v_match;
end $$;

revoke all on function public.mp_quickmatch(uuid, text, text[], int, int, int)
  from public, anon, authenticated;

-- ─── 4. Rematch ────────────────────────────────────────────────────────────────
alter table public.duel_matches add column if not exists rematch_of uuid;
create index if not exists duel_matches_rematch_of_idx
  on public.duel_matches(rematch_of) where rematch_of is not null;

-- Create a fresh active match between the same two players, on the same cert, with
-- a new server-chosen question set. Idempotent: if a rematch for this match already
-- exists (both players clicked Rematch), return it instead of creating a second.
-- The FOR UPDATE on the source match serializes concurrent callers.
create or replace function public.mp_rematch(
  p_match uuid, p_user uuid, p_question_ids text[],
  p_num_rounds int, p_round_limit_ms int, p_base_points int
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  m public.duel_matches;
  v_existing uuid;
  v_new uuid;
begin
  select * into m from public.duel_matches where id = p_match for update;
  if not found then raise exception 'match_not_found'; end if;
  if p_user <> m.host_id
     and p_user <> coalesce(m.guest_id, '00000000-0000-0000-0000-000000000000'::uuid) then
    raise exception 'not_participant';
  end if;
  -- Only a finished 1v1 (both seats filled) can be rematched.
  if m.status <> 'done' or m.guest_id is null then
    raise exception 'match_unavailable';
  end if;

  select id into v_existing from public.duel_matches where rematch_of = p_match limit 1;
  if v_existing is not null then return v_existing; end if;

  insert into public.duel_matches
    (cert_id, status, mode, host_id, guest_id, question_ids,
     num_rounds, round_limit_ms, base_points, current_round,
     round_started_at, started_at, rematch_of)
  values
    (m.cert_id, 'active', m.mode, m.host_id, m.guest_id, p_question_ids,
     p_num_rounds, p_round_limit_ms, p_base_points, 0,
     now(), now(), p_match)
  returning id into v_new;

  return v_new;
end $$;

revoke all on function public.mp_rematch(uuid, uuid, text[], int, int, int)
  from public, anon, authenticated;

-- ─── 5. Realtime Authorization for co-study rooms ──────────────────────────────
-- Co-study rooms use Realtime presence + broadcast on the `study-room:<certId>`
-- topic. Without authorization any holder of the anon key could subscribe, spoof
-- presence, or spam chat. Gate the topic to authenticated users. (Duel state rides
-- Postgres Changes, already gated by the duel_* table RLS — untouched here.)
-- Wrapped so the migration is a no-op if these policies already exist.
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'realtime' and table_name = 'messages') then
    begin
      execute $p$
        create policy "study_rooms_authenticated_read" on realtime.messages
          for select to authenticated
          using ( (select realtime.topic()) like 'study-room:%' )
      $p$;
    exception when duplicate_object then null;
    end;
    begin
      execute $p$
        create policy "study_rooms_authenticated_write" on realtime.messages
          for insert to authenticated
          with check ( (select realtime.topic()) like 'study-room:%' )
      $p$;
    exception when duplicate_object then null;
    end;
  end if;
end $$;
