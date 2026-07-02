-- Follow-up to 20260611000000: compute `level` server-side in sync_user_state
-- instead of trusting the client's value.
--
-- Why: the duel award (mp_advance) increments user_state.xp but not level, and the
-- monotonic merge took GREATEST(existing.level, client.level). So the level column
-- could transiently lag xp (until the next study sync pulled + recomputed). Levels
-- are read directly by the admin dashboard, so keep the column self-consistent:
-- derive level from the final (post-GREATEST) xp using the app's curve,
-- level = floor(sqrt(xp / 50))  (mirrors lib/gamification.ts xpToLevel).
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
    (v_uid, coalesce(p_xp, 0), floor(sqrt(coalesce(p_xp, 0) / 50.0))::int,
     coalesce(p_streak, 0), p_last_study_date, coalesce(p_total_study_days, 0),
     p_predicted_score, p_daily_goal_questions)
  on conflict (user_id) do update set
    -- xp is monotonic; level is always derived from the resulting xp so the column
    -- can never drift from its xp (no client-trusted level).
    xp               = greatest(public.user_state.xp, excluded.xp),
    level            = floor(sqrt(greatest(public.user_state.xp, excluded.xp) / 50.0))::int,
    total_study_days = greatest(public.user_state.total_study_days, excluded.total_study_days),
    streak           = excluded.streak,
    last_study_date  = excluded.last_study_date,
    predicted_score  = excluded.predicted_score,
    daily_goal_questions = coalesce(excluded.daily_goal_questions, public.user_state.daily_goal_questions),
    updated_at       = now();
end $$;

revoke all on function public.sync_user_state(int, int, int, date, int, int, int)
  from public, anon;
grant execute on function public.sync_user_state(int, int, int, date, int, int, int)
  to authenticated;
