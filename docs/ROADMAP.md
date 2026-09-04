# Study Roadmap — September 2026

Phased plan agreed 2026-09-03. Each phase ships value on its own; the risky
infra work (absorb) lands last. Build must pass (`npm run build`) before any
phase is called done.

## Phase 1 — Flywheel: async duels + share cards + weekly ladder

The growth engine, aimed at friends joining via duel invites right now.

1. **Async duels** (this phase's core)
   - Same `duel_matches` / `duel_answers` tables, new `mode = 'async'`.
   - Host creates a challenge, plays their run immediately, and shares a code.
     The opponent plays whenever they like — no simultaneous presence needed.
   - Per-player progression via `host_ready_round` / `guest_ready_round`
     (sequential per player), answers still stored per round in `duel_answers`.
   - Scoring: server-authoritative correctness, flat points (no speed decay —
     comparing reaction times across days/timezones is meaningless). XP formula
     identical to live duels (10/correct + 50 win bonus), awarded exactly once
     on finalize inside the SECURITY DEFINER RPC.
   - Challenges expire (abandoned) after 14 days if never completed.
   - No Realtime dependency: opponents discover updates by fetching their
     challenge list / match on next visit.
2. **Share cards** — dynamic OG image for challenge/result pages so link
   previews show the stake ("Beat me if you can").
3. **Weekly ladder** — date-bucketed leaderboard view, Monday resets,
   rematch buttons on finished duels.

## Phase 2 — Trust & realism

1. **Admin reports view** — work off `reported_questions`; gate by an admin
   flag + RLS policy; actions: fix / remove / acknowledge.
2. **Authentic mock exam** — 90 min, ~75 questions, PBQ placement, domain
   score report feeding the predicted score.
3. **Delta-based XP sync** (tech debt surfaced by async-duel review) —
   `sync_user_state` merges with GREATEST, so unsynced local XP gains that are
   smaller than a server-side award (duel XP, future reward sources) can be
   dropped when both land at once. Add an additive `bump_user_state_xp` sync op
   and switch the queue to deltas; affects live duels today too.

## Phase 3 — Classroom wedge

**Teacher view** — class join code, class-wide weak-domain heatmap (domain
aggregates only, per-student opt-in), "assign this drill" shareable link.

## Phase 4 — The absorb (study → hecz-prod)

One login across hecz.dev + study, one less Supabase project. Primed by the
2026-09-03 SMTP fix (Maileroo recipe proven). Steps: give hecz-prod auth its
own Maileroo SMTP account → throwaway-user ID-preservation experiment → user
migration preserving IDs → Realtime duel channel gotcha → keep the study
project intact as rollback until fully verified.

## Done so far (context)

- 2026-09-03: study auth email fixed — custom SMTP via Maileroo
  (`study@hecz.dev`), replacing a broken Resend config; end-to-end verified.
