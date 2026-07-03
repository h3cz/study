# Voice Tutor — Spend Caps (auditable)

The Realtime Voice Tutor runs live OpenAI compute (~$0.10/min). **Five layers of
server-enforced caps** bound the worst-case spend. A missing cap = real money
lost, so every cap is enforced on the server from server-written data — never from
anything the client claims.

All durations are derived from the `voice_sessions` table
(`supabase/migrations/20260603000000_voice_sessions.sql`), where
`duration_seconds` is written **only** from server timestamps when a session ends.

**In-flight accounting (cost-safety).** The cap-sum functions
(`sumUserDaySeconds`, `sumUserMonthSeconds`, `sumGlobalMonthSeconds`) do NOT rely
on a clean `/api/voice/end`. For each row, `rowCapSeconds` counts the recorded
`duration_seconds` if the session ended, otherwise the **live elapsed**
(`now − started_at`) clamped to `SESSION_HARD_LIMIT_SECONDS`. So a session's time
counts against the cap the moment it starts — even if the tab is closed, the user
navigates away, or the end POST fails. A user can no longer bypass the caps by
never cleanly ending a session. Tested in `tests/voice-inflight-caps.test.ts`.

## Env vars

| Var | Purpose | Where read |
|---|---|---|
| `OPENAI_API_KEY` | Server-only. Mints ephemeral tokens. **Never sent to the browser.** | `app/api/voice/session/route.ts` |
| `VOICE_TUTOR_ENABLED` | Global kill-switch. Must equal `"true"` to mint. | `app/api/voice/session/route.ts` → `evaluateMintCaps` |
| `VOICE_TUTOR_MONTHLY_BUDGET_MINUTES` | Global all-user monthly ceiling (minutes). `0`/blank = no global ceiling. | same |

Thresholds (not env-driven, in `lib/voice-tutor/caps.ts`):
per-session 15 min hard / 16 min backstop, per-user 30 min/day, 60 min/month.

## The five caps

### Cap 1 — Per-session 15-min hard disconnect + 16-min server backstop
- **Client half:** `app/voice/page.tsx` runs a 1s countdown from
  `SESSION_HARD_LIMIT_SECONDS` (900s). At 14:00 it nudges the tutor to wrap up
  (`sendSystemNudge`); at 15:00 it calls `client.end()` which closes the
  `RTCPeerConnection` and stops the mic.
- **Server half:** `app/api/voice/tools/route.ts` calls
  `isSessionWithinBackstop(session.started_at)` (`lib/voice-tutor/caps.ts`) on
  **every** tool call. Any tool call after 16:00 (`SESSION_SERVER_BACKSTOP_SECONDS`)
  is rejected `403 session_time_exceeded`, even if the client timer failed.
- **On end**, `endSession()` (`lib/voice-tutor/sessions-server.ts`) clamps the
  recorded `duration_seconds` to `SESSION_HARD_LIMIT_SECONDS`, so a stuck session
  can never bill more than the per-session cap.

### Cap 2 — Per-user daily 30 min
- At mint, `sumUserDaySeconds(userId, localDate)` sums this user's voice seconds
  over their local calendar day (window from `dayWindow`), counting in-flight
  sessions live (see In-flight accounting above).
- `evaluateMintCaps` returns `429 daily_limit_reached` when
  `userDaySeconds >= PER_USER_DAILY_LIMIT_SECONDS` (1800s).
- The client's `localDate` is validated ±1 day against the server clock
  (`isPlausibleLocalDate`) so a user cannot spoof "yesterday" to reset quota;
  invalid dates fall back to the server UTC date.

### Cap 3 — Per-user monthly 60 min
- `sumUserMonthSeconds(userId)` sums the user's `duration_seconds` over the
  current UTC month (`monthWindow`).
- `429 monthly_limit_reached` when `userMonthSeconds >= PER_USER_MONTHLY_LIMIT_SECONDS`
  (3600s).

### Cap 4 — Server-side only, checked at mint AND tool-call
- All sums come from `voice_sessions` rows the **server** wrote; the client never
  reports a duration that counts toward caps.
- Caps are checked **at token mint** (`/api/voice/session`) — and the ephemeral
  token TTL is ~60s, so every new session start is re-gated.
- The per-session backstop is **re-checked on every tool call**
  (`/api/voice/tools`), so a long-lived WebRTC session can't keep spending past
  the cap.
- The service-role client (in `lib/voice-tutor/sessions-server.ts`) is never
  exported; every per-user query applies `.eq("user_id", userId)`. The only
  cross-user aggregate is `sumGlobalMonthSeconds`, which returns a single number
  (no rows) and exists solely to enforce cap 5.

### Cap 5 — Global kill-switch + global monthly budget
- Kill-switch: if `VOICE_TUTOR_ENABLED !== "true"` → `503 service_disabled`
  (checked first, before any DB read or OpenAI call).
- Global budget: `sumGlobalMonthSeconds()` sums **all users'** `duration_seconds`
  this month; if `>= VOICE_TUTOR_MONTHLY_BUDGET_MINUTES * 60` →
  `503 service_capacity_reached`.

## Priority order (in `evaluateMintCaps`)
1. kill-switch → 2. global budget → 3. per-user daily → 4. per-user monthly →
allow (with `minutesRemainingToday` / `minutesRemainingThisMonth`).

## Tests
`tests/voice-caps.test.ts` covers: kill-switch, global budget threshold/zero,
daily/monthly `>=` boundaries, remaining-minutes math, priority order, the 16-min
backstop boundary, local-date anti-spoof, and window math. (21 assertions.)

## What still needs a real-browser manual test
WebRTC needs a mic + a real browser (no mic in CI). The mint route, tool bridge,
end route, and all cap math are unit-testable and tested. The live audio loop,
SDP handshake, and data-channel tool relay must be exercised manually (see the
"Manual test" section in the build report / PR).
