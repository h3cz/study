-- Async duels — challenge a friend who plays whenever they like.
--
-- Reuses the existing duel_matches / duel_answers tables with a new
-- mode = 'async'. Authority model is unchanged (see 20260610000000): the
-- service-role server is the sole writer; clients keep their narrow SELECT.
--
-- ASYNC SEMANTICS (vs live duels):
--   * No shared round cursor. Each player progresses independently through the
--     same question set; host_ready_round / guest_ready_round (from the pacing
--     migration) track the last answered round index per player (-1 = none).
--   * No speed decay: the server awards base points for a correct answer,
--     regardless of when the player gets to it. Cross-day reaction times are
--     not comparable, so we do not pretend they are.
--   * status lifecycle: 'waiting'  = host created it (may have already played);
--     'active' = opponent seat claimed; 'done' = both finished (winner + XP);
--     'abandoned' = expired challenge (lazy, older than 14 days, never done).
--   * XP is awarded exactly once on finalize, mirroring mp_advance's math
--     (10 XP per correct + 50 win bonus, global user_state.xp only).

-- ─── Answer visibility ───────────────────────────────────────────────────────
--
-- The original participant_select policy exposes BOTH players' answers as soon
-- as the guest seat is claimed — correct for live duels (round-by-round
-- scoreboard), but in an async match the opponent could read the host's
-- `picked`/`is_correct` before answering, which is the answer key. Redefine
-- it: in async mode, a participant sees their own answers plus the opponent's
-- only once the match is done. Live duels are unchanged.

drop policy if exists duel_answers_participant_select on public.duel_answers;
create policy duel_answers_participant_select on public.duel_answers
  for select using (
    exists (
      select 1 from public.duel_matches m
      where m.id = duel_answers.match_id
        and (m.host_id = auth.uid() or m.guest_id = auth.uid())
        and (
          m.mode <> 'async'
          or m.status = 'done'
          or duel_answers.user_id = auth.uid()
        )
    )
  );

-- ─── Mode widening ───────────────────────────────────────────────────────────

do $$ begin
  alter table public.duel_matches drop constraint duel_matches_mode_check;
exception when undefined_object then null; end $$;

alter table public.duel_matches add constraint duel_matches_mode_check
  check (mode in ('invite', 'quick', 'async'));

create index if not exists duel_matches_async_open_idx
  on public.duel_matches(created_at desc)
  where mode = 'async' and status in ('waiting', 'active');

-- ─── Join an async challenge by code (claims the guest seat) ─────────────────

create or replace function public.mp_async_join(p_user uuid, p_code text)
returns public.duel_matches
language plpgsql security definer set search_path = public as $$
declare
  m public.duel_matches;
begin
  select * into m from public.duel_matches
    where invite_code = p_code and mode = 'async' for update;
  if not found then raise exception 'match_not_found'; end if;
  if m.host_id = p_user then raise exception 'cannot_join_own_match'; end if;
  if m.status <> 'waiting' or m.guest_id is not null then
    raise exception 'match_unavailable';
  end if;

  -- Expiry is enforced here under the row lock, not just lazily in list views:
  -- a stale shared code must never seat a guest. Raise a distinct error (no
  -- prior writes in this branch, so nothing to roll back) that the join route
  -- maps to a clear "expired" message — the joiner is NOT a participant, so
  -- returning the row would only produce a not_participant 403 in getMatch.
  if m.created_at < now() - interval '14 days' then
    raise exception 'challenge_expired';
  end if;

  update public.duel_matches
    set guest_id = p_user, status = 'active', started_at = coalesce(started_at, now())
    where id = m.id;

  select * into m from public.duel_matches where id = m.id;
  return m;
end $$;

-- ─── Record one async answer (server-scored, idempotent, finalizing) ─────────

create or replace function public.mp_async_answer(
  p_match uuid, p_user uuid, p_round int, p_question text,
  p_picked text, p_correct boolean, p_points int, p_ms int
)
returns public.duel_matches
language plpgsql security definer set search_path = public as $$
declare
  m public.duel_matches;
  v_next int;
  v_inserted boolean := false;
  v_winner uuid;
  v_award_rows int;
  v_host_xp int;
  v_guest_xp int;
begin
  select * into m from public.duel_matches where id = p_match for update;
  if not found then raise exception 'match_not_found'; end if;
  if m.mode <> 'async' then raise exception 'not_async'; end if;
  if p_user <> m.host_id
     and p_user <> coalesce(m.guest_id, '00000000-0000-0000-0000-000000000000'::uuid) then
    raise exception 'not_participant';
  end if;
  if m.status not in ('waiting', 'active') then return m; end if;
  if m.status = 'waiting' and p_user <> m.host_id then
    raise exception 'match_unavailable';
  end if;

  -- Expiry under the row lock: an expired challenge is abandoned on first
  -- touch, so an old link can never be played regardless of list requests.
  if m.created_at < now() - interval '14 days' then
    update public.duel_matches set status = 'abandoned' where id = m.id;
    select * into m from public.duel_matches where id = p_match;
    return m;
  end if;

  -- Bounds: only the configured rounds exist. Without this, a player who has
  -- finished their run (opponent still pending) could keep appending zero-point
  -- answer rows at ever-increasing round indices until expiry.
  if p_round < 0 or p_round >= m.num_rounds then
    return m;
  end if;

  -- Sequential per-player progression: p_round must be this player's next round.
  v_next := (case when p_user = m.host_id
    then coalesce(m.host_ready_round, -1) else coalesce(m.guest_ready_round, -1) end) + 1;
  if p_round <> v_next then
    return m; -- out of turn: ignore, return current truth
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
    update public.duel_matches set
      host_score      = host_score      + (case when p_user = m.host_id then p_points else 0 end),
      host_correct    = host_correct    + (case when p_user = m.host_id and p_correct then 1 else 0 end),
      guest_score     = guest_score     + (case when p_user <> m.host_id then p_points else 0 end),
      guest_correct   = guest_correct   + (case when p_user <> m.host_id and p_correct then 1 else 0 end),
      host_ready_round  = (case when p_user = m.host_id  then p_round else host_ready_round  end),
      guest_ready_round = (case when p_user <> m.host_id then p_round else guest_ready_round end),
      started_at     = coalesce(started_at, now())
    where id = p_match;

    select * into m from public.duel_matches where id = p_match;

    -- Finalize once both players have answered every round.
    if m.host_ready_round >= m.num_rounds - 1 and m.guest_ready_round >= m.num_rounds - 1 then
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

      -- Identical XP award to mp_advance (global xp only, exactly once).
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
    end if;
  end if;

  select * into m from public.duel_matches where id = p_match;
  return m;
end $$;

-- ─── Async rematch: challenge the same opponent to a fresh set ───────────────

create or replace function public.mp_async_rematch(
  p_match uuid, p_user uuid, p_question_ids text[], p_num_rounds int
)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  m public.duel_matches;
  v_opp uuid;
  v_new uuid;
begin
  select * into m from public.duel_matches where id = p_match for update;
  if not found then raise exception 'match_not_found'; end if;
  if m.host_id <> p_user and m.guest_id <> p_user then raise exception 'not_participant'; end if;
  if m.mode <> 'async' then raise exception 'not_async'; end if;

  v_opp := case when m.host_id = p_user then m.guest_id else m.host_id end;
  if v_opp is null then raise exception 'not_participant'; end if;

  -- One idempotent rematch per source match, regardless of the rematch's own
  -- status: both players clicking rematch land on the same match, and an old
  -- results page can never mint duplicate challenges. (A later rematch in the
  -- chain comes from the NEW match's rematch button, rematch_of = that match.)
  select id into v_new from public.duel_matches
    where mode = 'async' and rematch_of = p_match
    order by created_at desc limit 1;
  if v_new is not null then return v_new; end if;

  insert into public.duel_matches
    (cert_id, status, mode, host_id, guest_id, question_ids,
     num_rounds, round_limit_ms, base_points, rematch_of)
    values
    (m.cert_id, 'active', 'async', p_user, v_opp, p_question_ids,
     p_num_rounds, m.round_limit_ms, m.base_points, m.id)
    returning id into v_new;

  return v_new;
end $$;

-- Server-only authority (mirrors the live-duel revocations).
revoke all on function public.mp_async_join(uuid, text) from public, anon, authenticated;
revoke all on function public.mp_async_answer(uuid, uuid, int, text, text, boolean, int, int)
  from public, anon, authenticated;
revoke all on function public.mp_async_rematch(uuid, uuid, text[], int) from public, anon, authenticated;
