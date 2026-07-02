# Multiplayer — Co-Study Rooms & 1v1 Duels — Design Specification

> **Status:** DRAFT for human go/no-go
> **Author:** Architect synthesis of a requirements interview + the existing
> sync / gamification / leaderboard architecture
> **Last updated:** 2026-06-06
> **Prerequisite:** none hard, but reuses `profiles`, `user_state`,
> `public_leaderboard`, the cert registry (`lib/certs.ts`), and the question bank.

---

## 0. TL;DR

Two social surfaces, one shared identity.

1. **Co-study rooms (the "chill" half).** Drop into a per-cert room and study
   *alongside* other people. Ambient presence ("3 others studying Security+ right
   now"), a live activity feed ("Sam answered 3 · Maria reviewed 5 cards"), a
   **shared Pomodoro timer** everyone studies against, and lightweight chat /
   reactions so the room isn't silent. No competition, no pressure — just the
   feeling that you're not grinding alone at 1am.

2. **1v1 duels (the "sweaty" half).** A real-time, **Kahoot-style** head-to-head
   race: same questions, points decay with answer time, fastest-correct wins.
   Start one by **inviting a friend** (link/code) or via **quick-match** (paired
   with a random opponent who's also waiting). **Server-authoritative** — the
   server picks the questions, controls the clock, scores the answers, and awards
   XP, so a win can't be faked.

Both ride on **one shared hecz identity** (Supabase `profiles`), designed so the
same login works across `hecz.dev` / study / tag / pulse when the ecosystem
unifies.

### The decisions this spec encodes (from the interview)

| Question | Decision |
|---|---|
| Core feeling | **Both** — ambient co-study *and* competitive races |
| Progression coupling | **Hybrid** — races grant XP; **winning** grants streak credit; races **never** touch FSRS / mastery / predicted_score |
| Race scoring | **Kahoot-style** — speed × accuracy, time-decay points |
| Identity | **One shared Supabase project**; build **SSO-ready** for the hecz ecosystem |
| Matchmaking pool | **Prefer same-cert, fall back to cross-cert** |
| Race size | **1v1 duel** |
| Co-study room contents | **Presence + activity feed + shared Pomodoro + chat/reactions** (voice deferred) |
| Cold start (nobody online) | **Invite a friend** — no bots, no ghost races |
| Entry points | **Both** — invite link *and* quick-match queue |
| Match integrity | **Server-authoritative** (XP is at stake) |
| Streak credit | **Win = streak credit**; losing still earns XP |

---

## 1. Why this is architecturally new

The app today is **local-first**: Dexie (IndexedDB) is the source of truth, and a
push-only sync queue (`lib/sync/engine.ts`) replicates rows *up* to Supabase.
There is **no Supabase Realtime channel anywhere in the app yet** — every existing
"social" feature (leaderboards, cohorts) is a periodic read of synced snapshots,
not a live connection.

Multiplayer is the **first real-time surface** and the **first server-authoritative
write path**. Two consequences fall out of that and must be designed deliberately:

### 1.1 The XP-direction inversion

- **Study XP flows UP.** Answer a quiz → `recordQuizResult` writes Dexie → sync
  queue pushes `user_state.xp` to Supabase. The client is authoritative.
- **Race XP must flow DOWN.** The server scores the duel and increments
  `user_state.xp` server-side; the client *learns* its new XP on the next pull.
  The server is authoritative.

The good news: **the existing sync already tolerates this.** `pullLatest()`
overwrites local state when `remote.xp > local.xp` (engine.ts:280). A
server-side XP award naturally flows down on the next sync with no new merge
logic — we just need race-awarded XP to land in `user_state.xp` and the client
to `pullLatest()` after a match. This must be documented so a future refactor
doesn't "fix" the one-directional assumption and break it.

### 1.2 The "don't pollute the engine" rule

`recordQuizResult` (gamification.ts:154) does three things every call: awards XP,
recomputes `predictedScore`, **and** writes an FSRS `question_review` per answer.
Race answers must do **only the first** (XP), and only server-side. They must
**not**:

- write `question_reviews` / advance FSRS scheduling,
- recompute `predicted_score` from race performance,
- count toward the adaptive study recommender's weak-objective weighting.

Rationale (the user's instinct, and the right one): a duel is played under time
pressure on possibly-cross-cert questions. Letting it move the mastery model
would corrupt the honest "are you ready for the real exam?" signal. **Races are a
game layered on top of the learning engine, never an input to it.**

→ Implementation rule: race scoring uses a **dedicated XP-only award path**
(`award_match_xp` RPC), never `recordQuizResult` and never `recordQuestionReview`.

---

## 2. Identity & global auth (SSO-ready)

**Current state:** a single Supabase project. `profiles (user_id, display_name,
avatar_url, is_publicly_listed)` is already the canonical cross-feature identity —
leaderboards and cohorts both resolve display name + avatar from it. Multiplayer
adopts the same row as a player's identity. **No new identity model is needed.**

**"Make sure it's 1; if not, get it ready."** It is one project. To make that one
identity usable across the hecz ecosystem (`hecz.dev`, study, tag, pulse) without
re-login, the session cookie must be scoped to the shared parent domain rather
than host-only. Today the cookie is host-only (the `setAll` in
`lib/supabase/middleware.ts` and `lib/supabase/server.ts` passes Supabase's
default options through unchanged).

**SSO-ready hook (low-risk, ship in Phase 0):** introduce an optional
`NEXT_PUBLIC_AUTH_COOKIE_DOMAIN` env var. When set (e.g. `.hecz.dev`), every
`cookies.set` in the three Supabase helpers injects `domain` into the options;
when unset, behaviour is byte-for-byte identical to today (host-only). This is the
single switch that turns on cross-subdomain SSO when the ecosystem is ready —
flip one env var, no code change. Until then, multiplayer just uses study's
existing auth, exactly as the interview directed ("don't block races on SSO").

> Note: true SSO across *different apex domains* (not subdomains) is a larger
> project (a shared auth origin / token broker) and is explicitly **out of scope**
> here. This spec only ensures study's identity is the shared one and the
> subdomain-cookie switch exists.

---

## 3. Transport: Supabase Realtime

`@supabase/supabase-js` (already a dependency) ships Realtime. We use two of its
three primitives; the third (Postgres Changes) is the authoritative backbone for
duels.

| Primitive | Used for | Authoritative? |
|---|---|---|
| **Presence** | Who's in a co-study room + their live activity status | No (ephemeral) |
| **Broadcast** | Chat, reactions, activity-feed pings, "opponent answered" flair | No (ephemeral) |
| **Postgres Changes** | Duel match state + scoreboard (subscribe to the `matches` / `match_answers` rows) | **Yes** — mirrors server-authoritative DB writes |

All channels are **authenticated** (RLS-gated). Realtime Authorization is enabled
so a client can only subscribe to a match/room it's actually a participant in.

---

## 4. Feature A — Co-study rooms (Phase 1)

Lower-risk, no authoritative scoring, ships the "chill" half first.

### UX
- A room per live cert: `study:secplus-sy0-701`, etc. Entering the Quiz / Drill /
  Flashcards flows can optionally "join the room" (presence) so studying anywhere
  in the app shows you as present.
- **Presence rail:** avatars + display names of who's here, each with a live
  activity chip ("on a quiz", "reviewing cards", "idle").
- **Activity feed:** ephemeral broadcast events as people hit milestones
  ("Maria answered 5", "Sam started a drill"). Not persisted — it's ambient, not
  a log.
- **Shared Pomodoro:** a room-synced 25/5 timer. State (phase, started-at) is held
  by whoever starts it and replicated via presence/broadcast; late joiners sync to
  the in-progress timer. Purely cooperative — no server needed.
- **Chat / reactions:** short messages + emoji reactions over broadcast, rate-
  limited client-side, with an optional `room_messages` table holding only the
  last N for late-join context (decide in build; ephemeral-only is acceptable
  for v1).

### Data
- Mostly **stateless** (presence + broadcast are in-memory in Realtime).
- Optional `room_messages (room_id, user_id, body, created_at)` with RLS
  (insert: authenticated self; select: any authenticated; TTL cleanup job) only
  if we want last-N chat backfill.

### What it deliberately is NOT
No competition, no XP, no scoring. It cannot affect the learning engine because it
never records an answer through a new path — people just study normally while
*also* present in the room.

---

## 5. Feature B — 1v1 Duels (Phases 2–3)

### 5.1 Match lifecycle

```
            invite code / quick-match
   player A ───────────────────────────▶  match (status=waiting)
   player B ──────── joins ─────────────▶  match (status=active)
                                            server picks N question_ids (hidden)
   ┌──────── per round (×N) ───────────┐
   │ client: get_round(match,r)         │  RPC opens round r, stamps round_started_at,
   │   ◀── stem + choices (NO answer) ──│  returns question WITHOUT correct option
   │ client: submit_answer(match,r,pick)│  RPC scores server-side:
   │   ── correctness + speed points ──▶│    correct? = compare vs server-held answer
   │                                    │    points  = Kahoot decay(now() - round_started_at)
   └────────────────────────────────────┘  writes match_answers (server timestamps)
   both clients subscribe to match_answers (Postgres Changes) → live scoreboard
   on last round → status=done → award_match_xp(match) (server-authoritative)
```

### 5.2 Server-authoritative integrity

The threat: XP is at stake, so a client must not be able to fabricate a win,
report fake-fast times, or learn the correct answer early.

Guarantees, all enforced in `SECURITY DEFINER` Postgres RPCs (or equivalent API
routes) — **never trusting client-sent timing or correctness**:

1. **Questions are server-chosen and hidden.** The match stores `question_ids[]`
   but RLS never exposes the correct-answer column to clients. `get_round` returns
   only stem + shuffled choices.
2. **Timing is server-measured.** `get_round` stamps `round_started_at = now()`
   server-side; `submit_answer` computes elapsed from *that*, ignoring any
   client-supplied timestamp. (Network jitter is accepted as fair — both players
   face the same path.)
3. **Correctness is server-computed.** `submit_answer` compares the pick against
   the server-held answer; the client never sends "I was right."
4. **Idempotent + ordered.** One answer per (match, round, user); a round can't be
   answered before it's opened or after its deadline.
5. **XP is awarded once, server-side,** in `award_match_xp`, guarded against
   double-award on a completed match.

The live "opponent just answered" feel is **broadcast flair** (non-authoritative);
the real scoreboard is the `match_answers` rows both clients read via Postgres
Changes.

### 5.3 Kahoot-style scoring

Per round, for a correct answer:

```
points = round( BASE * (1 - 0.5 * elapsed / round_limit) )      // wrong = 0
```

So a correct answer at t=0 scores `BASE`, decaying to `BASE/2` at the time limit;
wrong/timeout scores 0. `BASE` (e.g. 1000) and `round_limit` (e.g. 15s) are match
config. Final winner = higher total. (Tie-break: more-correct, then faster total.)

### 5.4 Matchmaking (prefer-same-cert, fallback cross-cert)

- **Invite:** `create_match(cert_id)` → returns an invite code; friend calls
  `join_match(code)`. Private, mirrors the existing cohort invite-code pattern in
  `lib/leaderboard.ts`.
- **Quick-match:** a `match_queue (user_id, cert_id, enqueued_at)` row +
  `find_or_create_match(cert_id)` RPC. Pairing logic, under row-level locking to
  prevent double-pairing:
  1. Look for a waiting opponent with the **same** `cert_id` → pair, questions
     drawn from that cert.
  2. Else, after a short wait, fall back to **any** waiting opponent → questions
     drawn from a neutral/general pool or the initiator's cert.
  3. Else stay queued. **No bot, no ghost** — if you're truly alone, the UI nudges
     you to *invite a friend* instead (the interview's explicit choice).

### 5.5 Progression integration (Phase 3) — the hybrid rule

On `status=done`, `award_match_xp(match)`:
- Awards XP to **both** players for correct answers (participation rewarded).
- Grants the **winner** a streak-relevant bonus → feeds the daily-goal/streak
  machinery (`win = streak credit`); the loser gets XP only, no streak credit.
- Writes XP to `user_state.xp` **server-side**, so it flows down via `pullLatest`
  (see §1.1). Client calls `pullLatest()` on the results screen.
- **Does NOT** call `recordQuizResult`, **does NOT** write `question_reviews`,
  **does NOT** recompute `predicted_score`. The mastery/FSRS engine is untouched
  (see §1.2).

Streak credit reuses the existing `shouldAdvanceStreak` / `computeStreakUpdate`
semantics in `lib/gamification.ts` so a duel win behaves like meeting the daily
goal — but the decision of *whether* a win advances the streak is made on the
server as part of the award, then reconciled locally.

### 5.6 Schema sketch (Phase 2)

```sql
-- All RLS-gated; correct-answer columns never exposed to clients.
matches (
  id uuid pk, cert_id text, status text,            -- waiting|active|done
  invite_code text unique null, is_quick_match bool,
  player_a uuid, player_b uuid null,
  question_ids text[],                              -- server-chosen, hidden
  base_points int, round_limit_ms int, num_rounds int,
  current_round int, round_started_at timestamptz,
  score_a int, score_b int, winner uuid null,
  created_at, started_at, ended_at
)
match_answers (
  match_id uuid, user_id uuid, round_index int,
  question_id text, picked text, is_correct bool,   -- server-computed
  answered_at timestamptz,                          -- server time
  points int,
  primary key (match_id, user_id, round_index)
)
match_queue ( user_id uuid pk, cert_id text, enqueued_at timestamptz )
```

RLS: a player reads/writes only matches they're in; `question_ids` exposure and
correctness live behind RPCs, not direct table reads.

---

## 6. Phasing & risk

| Phase | Scope | Risk | Ships |
|---|---|---|---|
| **0 — Foundations** | SSO-ready cookie-domain env hook; enable Realtime + Authorization; RLS scaffolding | Low | nothing user-visible |
| **1 — Co-study rooms** | Presence rail, activity feed, shared Pomodoro, chat/reactions | Low–med (first Realtime use, but no authoritative writes) | the "chill" half |
| **2 — Duel engine** | `matches`/`match_answers`/`match_queue`, server RPCs, invite + quick-match, Kahoot scoring, live UI | High (server-authoritative + real-time) | the "sweaty" half (no XP yet) |
| **3 — Progression** | `award_match_xp`, win = streak credit, pull-down reconciliation, engine-isolation guarantees | Med | XP/streak hookup |
| **4 — Polish** | Rematch, duel history, anti-abuse rate limits, room TTL cleanup | Low | hardening |

Recommended build order ships value early and isolates the hardest part: **Phase 1
gives a complete, useful feature on its own**, and proves the Realtime stack before
the high-stakes server-authoritative duel work in Phase 2.

---

## 7. Open questions for build time (not blockers)

1. **Chat persistence:** ephemeral-only vs. last-N backfill (`room_messages`)?
   Lean ephemeral for v1.
2. **RPC vs. Edge Function** for the match server: Postgres `SECURITY DEFINER`
   RPCs keep everything in-DB (simplest, transactional); revisit only if round
   orchestration needs a process.
3. **Cross-cert question pool** on fallback: neutral/general set vs. initiator's
   cert. Affects fairness when a Security+ and a Network+ studier meet.
4. **Quick-match wait before fallback:** how long to hold out for a same-cert
   opponent before widening (e.g. 10–15s).
5. **Abuse:** rate-limit duel creation and chat; cap concurrent matches per user.

---

## 7a. As-built notes (post-implementation)

The schema sketch in §5.6 used generic names; the shipped implementation uses
`duel_`-prefixed tables and `mp_`-prefixed RPCs. Mapping:

| Spec sketch | As built |
|---|---|
| `matches` / `match_answers` / `match_queue` | `duel_matches` / `duel_answers` / `duel_queue` |
| `player_a` / `player_b` | `host_id` / `guest_id` |
| `find_or_create_match` | `mp_quickmatch` |
| `get_round` / `submit_answer` / per-round open | `mp_submit_answer` + `mp_advance` (client renders the round's question from its local bundle; the server scores and advances) |
| `award_match_xp` | folded into `mp_advance`'s finalize branch |

Two implementation refinements beyond the spec:

- **XP award is global-only.** `mp_advance` bumps `user_state.xp` (the global
  accumulator + global leaderboard) for both players; per-cert `user_cert_scores`
  xp is reconciled **client-side against each player's own active cert**. This
  avoids a cross-cert quick-match crediting the pairer's cert to a player who
  studies a different one.
- **Late-answer guard.** `mp_submit_answer` rejects scoring once the server-side
  round deadline has passed (the player takes the timeout `mp_advance` records),
  closing the "answer after the visible deadline still scores" gap.
- **Resilience.** The arena polls the authoritative match every 3s while live, so
  a dropped Realtime connection or an opponent who abandons never leaves the UI
  permanently stuck (the deadline-advance still finalizes the match).

Chat is ephemeral-only (no `room_messages` table) for v1, as anticipated in §7.
Rate-limiting duel/queue creation (§7.5) remains future hardening.

## 8. Next.js 16 note

This repo runs Next.js 16.2.6 with non-standard conventions (`AGENTS.md`). Before
writing any route handler / server action / middleware code for this feature,
read the relevant guide in `node_modules/next/dist/docs/` — APIs may differ from
prior Next versions.
