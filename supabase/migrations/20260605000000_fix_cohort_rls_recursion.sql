-- Fix infinite recursion (Postgres 42P17) in cohort/profile RLS policies.
--
-- `cohort_members_cohort_read` and `profiles_cohort_select` each ran an EXISTS
-- subquery over `cohort_members`. Evaluating that subquery re-applied the same
-- RLS policies on `cohort_members`, recursing forever. The symptom: ANY
-- authenticated read of `profiles` (e.g. loading your own public-listing state)
-- and any cohort-membership read threw, so the "List me publicly" toggle
-- silently failed (the client never saw the error, so it looked like a no-op).
--
-- Fix: move the membership checks into SECURITY DEFINER helper functions. Run as
-- the (table-owner) definer, they bypass RLS internally, so the policy no longer
-- re-enters cohort_members RLS — breaking the loop.

create or replace function public.is_cohort_member(p_cohort uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.cohort_members
    where cohort_id = p_cohort and user_id = auth.uid()
  );
$$;

create or replace function public.shares_cohort_with(p_other uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.cohort_members me
    join public.cohort_members them on them.cohort_id = me.cohort_id
    where me.user_id = auth.uid() and them.user_id = p_other
  );
$$;

grant execute on function public.is_cohort_member(uuid) to authenticated, anon;
grant execute on function public.shares_cohort_with(uuid) to authenticated, anon;

-- cohort_members: "see members of cohorts I belong to" — no longer self-references.
drop policy if exists cohort_members_cohort_read on public.cohort_members;
create policy cohort_members_cohort_read on public.cohort_members
  for select using ( public.is_cohort_member(cohort_id) );

-- profiles: "see profiles of people who share a cohort with me".
drop policy if exists profiles_cohort_select on public.profiles;
create policy profiles_cohort_select on public.profiles
  for select using ( public.shares_cohort_with(user_id) );

-- cohorts: "see cohorts I own or belong to" — use the helper to avoid touching
-- cohort_members RLS during evaluation.
drop policy if exists cohorts_member_select on public.cohorts;
create policy cohorts_member_select on public.cohorts
  for select using ( auth.uid() = owner_id or public.is_cohort_member(id) );
