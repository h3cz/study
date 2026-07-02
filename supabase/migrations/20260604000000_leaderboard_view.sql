-- Leaderboard security hardening: replace broad user_state_public_read with a
-- restricted security-definer view that exposes only the intended columns.

-- Drop the over-permissive policy that let clients select(*) on user_state
drop policy if exists "user_state_public_read" on public.user_state;

-- Create a restricted view with only the columns needed for the public leaderboard.
-- SECURITY DEFINER runs as the view owner so RLS on user_state doesn't block it;
-- the WHERE clause enforces the opt-in constraint at the view level.
create or replace view public.public_leaderboard
  with (security_invoker = false)
as
  select
    us.user_id,
    us.xp,
    us.level,
    us.streak,
    us.predicted_score,
    p.display_name
  from public.user_state us
  join public.profiles p on p.user_id = us.user_id
  where p.is_publicly_listed = true;

-- Grant select on the view to the anon and authenticated roles
grant select on public.public_leaderboard to anon, authenticated;
