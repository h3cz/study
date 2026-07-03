-- Duel pacing controls.
--
-- Players said the duel moved too quickly. This migration makes the pacing
-- explicit and agreed:
--   1. queue rows include chosen question count + timer, so quick-match pairs
--      players who selected the same rules.
--   2. match rows track each player's "ready for next round" click.
--   3. a round advances only when both answered AND both clicked Next, or when
--      the timer expires and the server records timeouts.

alter table public.duel_matches
  add column if not exists host_ready_round int not null default -1,
  add column if not exists guest_ready_round int not null default -1;

alter table public.duel_queue
  add column if not exists num_rounds int not null default 7,
  add column if not exists round_limit_ms int not null default 30000;

drop index if exists duel_queue_cert_enqueued_idx;
create index if not exists duel_queue_rules_enqueued_idx
  on public.duel_queue(cert_id, num_rounds, round_limit_ms, enqueued_at);

-- Advance the current round if:
--   - the deadline passed, OR
--   - both players answered and both clicked Next.
create or replace function public.mp_advance(p_match uuid)
returns public.duel_matches
language plpgsql security definer set search_path = public as $$
declare
  m public.duel_matches;
  v_answered int;
  v_deadline_passed boolean;
  v_both_ready boolean;
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

  v_both_ready := m.guest_id is not null
    and m.host_ready_round >= m.current_round
    and m.guest_ready_round >= m.current_round;

  -- Not ready: need the elapsed deadline, or both answers plus both Next clicks.
  if not v_deadline_passed and not (v_answered >= 2 and v_both_ready) then
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
    -- Open the next round. Ready columns are per-round markers, so no reset needed.
    update public.duel_matches
      set current_round = m.current_round + 1, round_started_at = now()
      where id = p_match;
  end if;

  select * into m from public.duel_matches where id = p_match;
  return m;
end $$;

-- Record one server-scored answer. Unlike the original implementation, this does
-- not auto-advance as soon as both answers exist. The next round waits for both
-- players to review and click Next.
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
    return m;
  end if;

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

  select * into m from public.duel_matches where id = p_match;
  return m;
end $$;

-- Player intent to move on. Idempotent per player/round.
create or replace function public.mp_ready_next(
  p_match uuid, p_user uuid, p_round int
)
returns public.duel_matches
language plpgsql security definer set search_path = public as $$
declare
  m public.duel_matches;
  v_has_answer boolean;
begin
  select * into m from public.duel_matches where id = p_match for update;
  if not found then raise exception 'match_not_found'; end if;
  if p_user <> m.host_id and p_user <> coalesce(m.guest_id, '00000000-0000-0000-0000-000000000000'::uuid) then
    raise exception 'not_participant';
  end if;
  if m.status <> 'active' or p_round <> m.current_round then
    return m;
  end if;

  select exists (
    select 1 from public.duel_answers
    where match_id = p_match and user_id = p_user and round_index = p_round
  ) into v_has_answer;
  if not v_has_answer then
    return m;
  end if;

  if p_user = m.host_id then
    update public.duel_matches set host_ready_round = p_round where id = p_match;
  else
    update public.duel_matches set guest_ready_round = p_round where id = p_match;
  end if;

  return public.mp_advance(p_match);
end $$;

revoke all on function public.mp_ready_next(uuid, uuid, int)
  from public, anon, authenticated;

-- Quick-match pairs players who chose the same rules. This makes "both teams
-- agree on time and question set" concrete: same cert preferred, same timer and
-- question count required.
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
  delete from public.duel_queue where enqueued_at < now() - interval '2 minutes';

  select user_id into v_opp from public.duel_queue
    where user_id <> p_user
      and cert_id = p_cert
      and num_rounds = p_num_rounds
      and round_limit_ms = p_round_limit_ms
    order by enqueued_at asc
    for update skip locked
    limit 1;

  if v_opp is null then
    select user_id into v_opp from public.duel_queue
      where user_id <> p_user
        and num_rounds = p_num_rounds
        and round_limit_ms = p_round_limit_ms
      order by enqueued_at asc
      for update skip locked
      limit 1;
  end if;

  if v_opp is null then
    insert into public.duel_queue (user_id, cert_id, num_rounds, round_limit_ms)
      values (p_user, p_cert, p_num_rounds, p_round_limit_ms)
      on conflict (user_id) do update
        set cert_id = excluded.cert_id,
            num_rounds = excluded.num_rounds,
            round_limit_ms = excluded.round_limit_ms,
            enqueued_at = now();
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
