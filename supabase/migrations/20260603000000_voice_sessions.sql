-- Realtime Voice Tutor: voice_sessions table — the cap-enforcement backbone.
--
-- Every spend cap is derived from server-written rows in this table:
--   * duration_seconds is ALWAYS written from server timestamps on session end,
--     never from a client-claimed number.
--   * Per-user daily / monthly caps sum this table for the resolved user_id.
--   * The global monthly budget sums duration_seconds across ALL users.
--
-- RLS locks each row to its owner. The session-mint + end routes additionally
-- use the service-role client with an explicit user_id filter (same guarded
-- pattern as lib/study-buddy/auth.ts) so cap math is authoritative even though
-- RLS is the table-level backstop.

create table public.voice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer not null default 0,
  status text not null default 'pending',  -- pending|active|completed|killed
  created_at timestamptz not null default now()
);

create index voice_sessions_user_day_idx on public.voice_sessions(user_id, started_at);

alter table public.voice_sessions enable row level security;

create policy "voice_sessions_self_all" on public.voice_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
