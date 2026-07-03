-- Multiplayer — 1v1 duels + matchmaking queue.
--
-- Co-study ROOMS are pure Supabase Realtime (presence + broadcast) and need no
-- tables; only the competitive duel has authoritative state, which lives here.
--
-- AUTHORITY MODEL (mirrors study-buddy / voice: service-role writes only):
--   * Clients have NO insert/update/delete policy on any duel table. Every
--     mutation goes through server routes using the service-role client, so the
--     server is the SOLE authoritative writer of correctness, timing, scores,
--     and XP. RLS denies all client writes by default.
--   * Clients DO get a narrow SELECT on the matches/answers they participate in,
--     so they can subscribe to live updates via Realtime Postgres Changes.
--   * Correct-answer keys are NEVER stored here — the server scores against the
--     bundled question bank. (That bundle also ships to clients, so server
--     authority is over timing/points/XP, i.e. the leaderboard-relevant surface,
--     not over secrecy of the answer key.)
--   * The scoring/advancement/XP math is done inside SECURITY DEFINER functions
--     under a row lock, so concurrent answers from both players can never lose an
--     update or double-advance a round.

-- ─── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.duel_matches (
  id               uuid primary key default gen_random_uuid(),
  cert_id          text not null,
  status           text not null default 'waiting'
                     check (status in ('waiting','active','done','abandoned')),
  mode             text not null default 'invite'
                     check (mode in ('invite','quick')),
  invite_code      text unique,
  host_id          uuid not null references auth.users(id) on delete cascade,
  guest_id         uuid references auth.users(id) on delete cascade,
  question_ids     text[] not null default '{}',
  num_rounds       int not null default 7,
  round_limit_ms   int not null default 15000,
  base_points      int not null default 1000,
  current_round    int not null default 0,
  round_started_at timestamptz,
  host_score       int not null default 0,
  guest_score      int not null default 0,
  host_correct     int not null default 0,
  guest_correct    int not null default 0,
  winner_id        uuid,
  xp_awarded       boolean not null default false,
  created_at       timestamptz not null default now(),
  started_at       timestamptz,
  ended_at         timestamptz
);

create index if not exists duel_matches_host_idx on public.duel_matches(host_id, created_at desc);
create index if not exists duel_matches_guest_idx on public.duel_matches(guest_id, created_at desc);
create unique index if not exists duel_matches_invite_idx
  on public.duel_matches(invite_code) where invite_code is not null;

alter table public.duel_matches enable row level security;
drop policy if exists duel_matches_participant_select on public.duel_matches;
create policy duel_matches_participant_select on public.duel_matches
  for select using ( auth.uid() = host_id or auth.uid() = guest_id );

create table if not exists public.duel_answers (
  match_id    uuid not null references public.duel_matches(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  round_index int not null,
  question_id text not null,
  picked      text,
  is_correct  boolean not null default false,
  ms_elapsed  int not null default 0,
  points      int not null default 0,
  answered_at timestamptz not null default now(),
  primary key (match_id, user_id, round_index)
);

alter table public.duel_answers enable row level security;
drop policy if exists duel_answers_participant_select on public.duel_answers;
create policy duel_answers_participant_select on public.duel_answers
  for select using (
    exists (
      select 1 from public.duel_matches m
      where m.id = duel_answers.match_id
        and (m.host_id = auth.uid() or m.guest_id = auth.uid())
    )
  );

create table if not exists public.duel_queue (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  cert_id     text not null,
  enqueued_at timestamptz not null default now()
);
alter table public.duel_queue enable row level security;
drop policy if exists duel_queue_self_select on public.duel_queue;
create policy duel_queue_self_select on public.duel_queue
  for select using ( auth.uid() = user_id );

-- Realtime: participants subscribe to their match + answer rows for live updates.
-- (Wrapped so re-running the migration against a project where the table is
-- already published is a no-op rather than an error.)
do $$
begin
  begin
    alter publication supabase_realtime add table public.duel_matches;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.duel_answers;
  exception when duplicate_object then null;
  end;
end $$;

-- ─── Match engine (SECURITY DEFINER, row-locked) ───────────────────────────────

-- Advance the current round if it's ready (both answered OR the deadline passed),
-- recording timeouts (0 points) for any player who didn't answer, then either
-- opening the next round or finalizing the match (picking a winner + awarding XP
-- exactly once). Idempotent: safe for both clients to call concurrently.
create or replace function public.mp_advance(p_match uuid)
returns public.duel_matches
language plpgsql security definer set search_path = public as $$
declare
  m public.duel_matches;
  v_answered int;
  v_deadline_passed boolean;
  v_winner uuid;
  v_award_rows int;
  v_host_xp int;
  v_guest_xp int;
begin
  select * into m from public.duel_matches where id = p_match for update;
  if not found then raise exception 'match_not_found'; end if;
  if m.status <> 'active' then return m; end if;

  select count(*) into v_answered
    from public.duel_answers
    where match_id = p_match and round_index = m.current_round;

  v_deadline_passed := m.round_started_at is not null
    and (now() - m.round_started_at) > make_interval(secs => m.round_limit_ms / 1000.0);

  -- Not ready: need both answers or an elapsed deadline.
  if v_answered < 2 and not v_deadline_passed then
    return m;
  end if;

  -- Record timeouts (0 points, no score change) for anyone who didn't answer.
  insert into public.duel_answers
    (match_id, user_id, round_index, question_id, picked, is_correct, ms_elapsed, points)
  select p_match, u.uid, m.current_round,
         coalesce(m.question_ids[m.current_round + 1], ''), null, false, m.round_limit_ms, 0
  from (values (m.host_id), (m.guest_id)) as u(uid)
  where u.uid is not null
    and not exists (
      select 1 from public.duel_answers a
      where a.match_id = p_match and a.user_id = u.uid and a.round_index = m.current_round
    );

  if m.current_round + 1 >= m.num_rounds then
    -- Finalize: pick winner (score, then correctness tiebreak, else draw=null).
    v_winner := case
      when m.host_score > m.guest_score then m.host_id
      when m.guest_score > m.host_score then m.guest_id
      when m.host_correct > m.guest_correct then m.host_id
      when m.guest_correct > m.host_correct then m.guest_id
      else null
    end;

    update public.duel_matches
      set status = 'done', ended_at = now(), winner_id = v_winner, xp_awarded = true
      where id = p_match and xp_awarded = false;
    get diagnostics v_award_rows = row_count;

    -- Award XP exactly once: 10 XP per correct answer + 50 win bonus. This is the
    -- ONLY learning-engine touch a duel makes, and it is XP-only — FSRS,
    -- predicted_score, and the adaptive recommender are deliberately untouched.
    --
    -- We bump the GLOBAL accumulator (user_state.xp) only. Per-cert xp
    -- (user_cert_scores) is reconciled CLIENT-SIDE by each player against their
    -- OWN active cert (see DuelArena reconciliation). The server can't award
    -- per-cert xp correctly for a cross-cert quick-match — the match runs on the
    -- pairer's cert, so crediting that cert for both players would pollute the
    -- non-pairer's foreign-cert leaderboard row. Global xp (the real currency and
    -- the global leaderboard) stays fully server-authoritative.
    if v_award_rows = 1 then
      v_host_xp  := m.host_correct  * 10 + (case when v_winner = m.host_id  then 50 else 0 end);
      v_guest_xp := m.guest_correct * 10 + (case when v_winner = m.guest_id then 50 else 0 end);

      insert into public.user_state (user_id, xp) values (m.host_id, v_host_xp)
        on conflict (user_id) do update
          set xp = public.user_state.xp + excluded.xp, updated_at = now();

      if m.guest_id is not null then
        insert into public.user_state (user_id, xp) values (m.guest_id, v_guest_xp)
          on conflict (user_id) do update
            set xp = public.user_state.xp + excluded.xp, updated_at = now();
      end if;
    end if;
  else
    -- Open the next round.
    update public.duel_matches
      set current_round = m.current_round + 1, round_started_at = now()
      where id = p_match;
  end if;

  select * into m from public.duel_matches where id = p_match;
  return m;
end $$;

-- Record one server-scored answer atomically, then try to advance. The TS route
-- computes correctness + points (it has the question bank); this function owns
-- the atomic write + score increment + advance under a row lock. Idempotent per
-- (match, user, round): a duplicate submit is a no-op.
create or replace function public.mp_submit_answer(
  p_match uuid, p_user uuid, p_round int, p_question text,
  p_picked text, p_correct boolean, p_points int, p_ms int
)
returns public.duel_matches
language plpgsql security definer set search_path = public as $$
declare
  m public.duel_matches;
  v_inserted boolean := false;
  v_deadline_passed boolean;
begin
  select * into m from public.duel_matches where id = p_match for update;
  if not found then raise exception 'match_not_found'; end if;
  if p_user <> m.host_id and p_user <> coalesce(m.guest_id, '00000000-0000-0000-0000-000000000000'::uuid) then
    raise exception 'not_participant';
  end if;
  if m.status <> 'active' or p_round <> m.current_round then
    return m; -- stale / out-of-turn submit: ignore, return current truth
  end if;

  -- Reject a late answer: if the round deadline has already passed on the server
  -- clock, do not score it (the player gets the timeout that mp_advance records).
  -- This closes the "answer after the visible deadline still earns points" gap.
  v_deadline_passed := m.round_started_at is not null
    and (now() - m.round_started_at) > make_interval(secs => m.round_limit_ms / 1000.0);
  if v_deadline_passed then
    return public.mp_advance(p_match);
  end if;

  begin
    insert into public.duel_answers
      (match_id, user_id, round_index, question_id, picked, is_correct, ms_elapsed, points)
      values (p_match, p_user, p_round, p_question, p_picked, p_correct, p_ms, p_points);
    v_inserted := true;
  exception when unique_violation then
    v_inserted := false;
  end;

  if v_inserted then
    if p_user = m.host_id then
      update public.duel_matches
        set host_score = host_score + p_points,
            host_correct = host_correct + (case when p_correct then 1 else 0 end)
        where id = p_match;
    else
      update public.duel_matches
        set guest_score = guest_score + p_points,
            guest_correct = guest_correct + (case when p_correct then 1 else 0 end)
        where id = p_match;
    end if;
  end if;

  -- Try to advance (no-op unless both answered or deadline passed).
  return public.mp_advance(p_match);
end $$;

-- Quick-match pairing under FOR UPDATE SKIP LOCKED so two simultaneous callers
-- can never grab the same opponent. Prefers a same-cert opponent, falls back to
-- ANY waiting opponent (cold-start friendly). The CALLER (the one completing the
-- pair) supplies the question set, so the match is played on their cert. Returns
-- the match id when paired, or NULL when the caller was enqueued to wait.
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

-- Join a waiting invite match by code, atomically claiming the guest seat.
create or replace function public.mp_join_by_code(p_user uuid, p_code text)
returns public.duel_matches
language plpgsql security definer set search_path = public as $$
declare
  m public.duel_matches;
begin
  select * into m from public.duel_matches
    where invite_code = p_code for update;
  if not found then raise exception 'match_not_found'; end if;
  if m.host_id = p_user then raise exception 'cannot_join_own_match'; end if;
  if m.status <> 'waiting' or m.guest_id is not null then raise exception 'match_unavailable'; end if;

  update public.duel_matches
    set guest_id = p_user, status = 'active', current_round = 0,
        round_started_at = now(), started_at = now()
    where id = m.id;

  select * into m from public.duel_matches where id = m.id;
  return m;
end $$;

revoke all on function public.mp_advance(uuid) from public, anon, authenticated;
revoke all on function public.mp_submit_answer(uuid, uuid, int, text, text, boolean, int, int) from public, anon, authenticated;
revoke all on function public.mp_quickmatch(uuid, text, text[], int, int, int) from public, anon, authenticated;
revoke all on function public.mp_join_by_code(uuid, text) from public, anon, authenticated;
