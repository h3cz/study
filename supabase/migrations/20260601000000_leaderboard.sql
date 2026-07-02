-- Leaderboard: public opt-in + cohort read policies
-- Adds display_name (already exists in profiles from init) + is_publicly_listed flag.

alter table public.profiles
  add column if not exists is_publicly_listed boolean not null default false;

-- Partial index for fast global leaderboard queries
create index if not exists profiles_publicly_listed_idx
  on public.profiles (is_publicly_listed) where is_publicly_listed = true;

-- Replace the existing user_state RLS to allow narrow public read when opted in.
-- Keep full self-access, add public read, and cohort read.

drop policy if exists "user_state_self_all" on public.user_state;
create policy "user_state_self_all"
  on public.user_state for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Public read for opted-in users (column-scoping done in application query)
create policy "user_state_public_read"
  on public.user_state for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = public.user_state.user_id
        and p.is_publicly_listed = true
    )
  );

-- Public profile read (display_name only) when opted in
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select"
  on public.profiles for select
  using (auth.uid() = user_id);
create policy "profiles_public_select"
  on public.profiles for select
  using (is_publicly_listed = true);

-- Cohort: let members read other members' user_state (narrow public fields)
create policy "user_state_cohort_read"
  on public.user_state for select
  using (
    exists (
      select 1 from public.cohort_members cm1, public.cohort_members cm2
      where cm1.user_id = auth.uid()
        and cm2.user_id = public.user_state.user_id
        and cm1.cohort_id = cm2.cohort_id
    )
  );

-- Cohort: let members read other members' profile display_name
create policy "profiles_cohort_select"
  on public.profiles for select
  using (
    exists (
      select 1 from public.cohort_members cm1, public.cohort_members cm2
      where cm1.user_id = auth.uid()
        and cm2.user_id = public.profiles.user_id
        and cm1.cohort_id = cm2.cohort_id
    )
  );

-- Let cohort members see cohort metadata
create policy "cohorts_member_select"
  on public.cohorts for select
  using (
    auth.uid() = owner_id
    OR exists (
      select 1 from public.cohort_members cm
      where cm.cohort_id = public.cohorts.id
        and cm.user_id = auth.uid()
    )
  );

-- Let cohort members see each other's membership rows (for member counts)
create policy "cohort_members_cohort_read"
  on public.cohort_members for select
  using (
    exists (
      select 1 from public.cohort_members cm
      where cm.cohort_id = public.cohort_members.cohort_id
        and cm.user_id = auth.uid()
    )
  );

-- predicted_score column already exists on user_state (added in init migration).
-- Add it if somehow missing:
alter table public.user_state add column if not exists predicted_score integer;
