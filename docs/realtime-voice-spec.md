# Realtime Voice Tutor — Design Specification

> **Status:** DRAFT for human go/no-go
> **Author:** Architect synthesis of research + existing study-buddy spec
> **Last updated:** 2026-05-28
> **Prerequisite:** study-buddy API Phase 1-3 (see `docs/study-buddy-spec.md`)

---

## 0. TL;DR

A **premium live spoken AI tutor** powered by OpenAI's GPT Realtime API (WebRTC).
The user talks to it, it talks back — real conversational tutoring, not robotic TTS.
It pulls from the real 1,117-question bank and the user's weak objectives / FSRS data
so it quizzes on actual content and actual gaps. It is the ONE genuinely-paid feature
with honest per-minute compute cost. It is **completely distinct** from the already-shipped
free Web Speech API read-aloud (client-side browser TTS, zero cost to us).

**Hard requirement:** five layers of spend caps must be implemented before any user
touches this feature. One uncontrolled user session can cost $1-$5. One thousand
uncontrolled users can bankrupt the project overnight.

**Verdict:** Park this until the text-based Study Buddy is shipped and has paying
subscribers. Voice is Phase 4.

---

## 1. What It Does (UX)

- **"Quiz me out loud on PKI."** — pulls real questions from objective 1.4 via the
  study-buddy data layer, reads stem + choices aloud, waits for the spoken answer,
  confirms, explains, records to FSRS.
- **"Explain why I keep missing 4.1."** — calls `get_weak_objectives` + `get_recent_misses`,
  sees the user's actual wrong answers, gives a targeted spoken explanation grounded
  in the real missed questions.
- **"10-minute drill on my weakest areas."** — adaptive spoken session over the 3
  weakest objectives, auto-wraps at the time limit.
- **Open-ended conversation** — conversational tutoring constrained to SY0-701 scope.
- Hands-free: commute, gym, eyes-off. Minimal UI: waveform + "End Session".

### Relationship to existing free voice

| | Free Read-Aloud (shipped) | Realtime Voice Tutor (this spec) |
|---|---|---|
| Tech | Web Speech API (`speechSynthesis`) | OpenAI GPT Realtime (WebRTC) |
| Direction | One-way TTS | Bidirectional conversation |
| Cost to us | $0 | ~$0.10/min metered |
| Intelligence | None (verbatim) | Full LLM + function calling |
| Pricing | Free forever | Paid (metered minutes) |

---

## 2. Architecture

### Ephemeral token flow (security-critical)
The browser must NEVER hold the OpenAI key.
1. Browser → `POST /api/voice/session` (auth'd). Route checks entitlement + spend caps,
   creates a `voice_sessions` row, calls OpenAI `POST /v1/realtime/client_secrets` with
   the real `OPENAI_API_KEY` (server-side only), model `gpt-realtime`, voice, tool defs,
   system prompt. Returns a short-lived (~60s TTL) ephemeral client secret.
2. Browser establishes WebRTC peer connection to OpenAI using the ephemeral token
   (SDP offer/answer). Audio flows browser ↔ OpenAI **directly — never through our server**
   (latency + egress).
3. Token expires in 60s; the WebRTC session persists up to OpenAI's hard limit.
4. Our server never proxies audio.

### Tool-call bridge
WebRTC tool calls arrive at the **browser** (it's the peer). Browser relays to
`POST /api/voice/tools` → dispatches to the existing study-buddy server functions →
returns result → browser sends `function_call_output` back over the data channel.

Tools (reuse study-buddy internals): `get_weak_objectives`, `get_questions` (cap 5),
`submit_answer` (records to FSRS, tagged `source: 'voice-tutor'`), `get_mastery_summary`,
`get_recent_misses`.

### System prompt (abridged)
SY0-701 voice tutor. Quiz ONLY from `get_questions` (never hallucinate). Read stem + all
choices, wait for answer, call `submit_answer`, explain. Keep explanations 30-60s. Stay
in Sec+ scope. Encouraging but honest.

### Where things run
- Token mint + tool bridge + usage tracking → Vercel serverless (needs `OPENAI_API_KEY`,
  Supabase access).
- WebRTC audio → browser ↔ OpenAI direct.
- Tool-call relay + session timer → browser; cap enforcement → server (authoritative).

---

## 3. Cost Model + Hard Spend Caps

### Raw pricing (GA `gpt-realtime`, ~May 2026)
- Audio input ~$32/1M tok (~$0.019/min); cached ~$0.40/1M.
- Audio output ~$64/1M tok (~$0.077/min).
- Text in $4/1M, text out $24/1M.
- **Working number: ~$0.10/min** (conservative, includes tool-call + response overhead).

### Session cost
| Length | @ $0.10/min |
|---|---|
| 5 min | $0.50 |
| 10 min | $1.00 |
| 15 min | $1.50 |
| 30 min | $3.00 |

### Mandatory caps (DO NOT SHIP WITHOUT ALL FIVE)
1. **Per-session 15-min hard disconnect** — browser timer + server backstop (reject tool
   calls on sessions >16 min). Caps worst case at $1.50.
2. **Per-user daily 20 min** (30 for subscribers) — server sums `voice_sessions` for today,
   429 if exceeded.
3. **Per-user monthly 60 min** (sub) / 5 min (trial) — warning at 50, hard block at 60.
4. **Server-side enforcement** — every cap checked at token-mint AND tool-call; durations
   from server timestamps, never client-reported. 60s token TTL means every session start
   is gated.
5. **Global kill-switch** — `VOICE_TUTOR_ENABLED=false` → 503; `VOICE_TUTOR_MONTHLY_BUDGET`
   sums all-user minutes and blocks globally past the cap.

### Per-user monthly economics
| Pattern | Min/mo | Our cost | Rev ($9.99) | Margin |
|---|---|---|---|---|
| Light (1×/wk 10m) | 40 | $4.00 | $9.99 | 60% |
| Moderate (3×/wk) | ~45 | $4.50 | $9.99 | 55% |
| Heavy (capped) | 60 | $6.00 | $9.99 | 40% |
| Free trial | 5 | $0.50 | $0 | −$0.50 (CAC) |

---

## 4. Pricing

**Recommended: monthly subscription with included minutes** (NOT per-minute metering —
too anxiety-inducing for a study app).

| Tier | Price | Included |
|---|---|---|
| Free trial | $0 | 5 min/month (one session), auth required |
| Voice Tutor | $9.99/mo | 60 min/month (30 min/day cap) |
| (optional) Study Buddy Pro | $12.99/mo | text tutor + voice bundled |

**Why $9.99 not $7:** text tutor (~$0 marginal) is $7; voice has real ~$0.10/min cost,
so the higher price signals the genuine difference and preserves 40-60% margin.

**Honest framing:** "You're paying for live OpenAI voice compute, not for the questions.
The bank, flashcards, exams, FSRS, and text read-aloud are free forever. Voice runs a
live AI model in real-time — that costs real money every minute, and we pass it through
honestly. The textbook is free; the tutor's time isn't." Update `/credits` accordingly.

**Free trial gated from day 1** — never launch unlimited-free then add a paywall (that's
the bait-and-switch `/credits` promises to avoid).

---

## 5. Build Phases (~10-15 dev-days total)

- **Phase 1 (2-3d):** ephemeral token route + WebRTC connect + basic spoken Q&A, NO tools,
  hard 5-min cap, `voice_sessions` table, kill-switch.
- **Phase 2 (3-5d):** tool-calling into the question bank + FSRS recording (needs
  study-buddy server question bank shipped). Client tool-call relay. Extend to 15-min +
  daily cap.
- **Phase 3 (5-7d):** Stripe billing ($9.99/mo), all 5 caps, free trial, monthly ceiling,
  global budget kill-switch, Settings usage UI, `/credits` update, voice picker, iOS/Android
  WebRTC testing.

---

## 6. Risks + Open Decisions

- **OpenAI-only.** synthetic.new has NO realtime audio — requires a direct OpenAI key.
  Existing `SYNTHETIC_API_KEY` cannot be used. No backup provider today.
- **Cost runaway** — mitigated by the 5-layer caps + OpenAI dashboard spend alerts.
  Worst case with caps working ~$50/day (global budget cap stops compounding).
- **Free trial vs paid-only** — recommend 5 min/mo trial (auth-gated) as the conversion
  driver; ~$0.50 CAC is cheap.
- **iOS PWA is the weak link** — WebRTC works in iOS Safari but background/lock-screen
  audio is fragile; truly hands-free on iOS lock screen is not guaranteed. Open decision:
  support iOS PWA or require in-browser on iOS.
- **Market risk > technical risk** — if nobody pays $7/mo for the text tutor, nobody pays
  $9.99 for voice. Validate the cheaper product first.

### Go/no-go: **PARK IT.** Ship as Phase 4.
Sequence: (1) study-buddy free read-only API [shipped], (2) paid text tutor validates
willingness-to-pay, (3) Stripe billing infra, (4) **layer voice on top** (reuses billing +
data + tools; voice work is mostly WebRTC + UI).

**Trigger to un-park:** >50 paying text-tutor subscribers OR >500 weekly active users on
the free app. Either signal validates the audience exists and engages deeply enough for
voice to matter.

---

## References
- OpenAI Realtime API docs / WebRTC guide / pricing / client-secret (ephemeral token) endpoint
- `docs/study-buddy-spec.md` — the text tutor spec this builds on
- `app/api/study-buddy/*`, `lib/study-buddy/mastery-server.ts` — reused internals
- `app/credits/page.tsx` — the "always free" promise the pricing must respect
- `DESIGN.md` — Terminal-Editorial UI language
