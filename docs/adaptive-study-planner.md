# Adaptive Study Planner — converged spec

Source: Ouroboros evolve loop (lineage `lin_seed_2caa43241347`, seed
`seed_2caa43241347`, interview `interview_20260530_234705`). Ontology converged
(stable Gen 1 → Gen 2, ambiguity 0.10).

## Goal
A pure, deterministic adaptive recommender that ranks study activities and selects
the single best next study activity by **expected Security+ exam-score impact**,
adds a new **weakest-domain drill**, and powers a rationale-backed dashboard
"Recommended next" CTA. Local-first only — reuses existing Dexie helpers.

## Scoring model
For each candidate activity:

```
score = examWeight × masteryGap × urgency × examDateFactor × timeFit
```

- **examWeight** — domain exam weight (D1 .12, D2 .22, D3 .18, D4 .28, D5 .20 — read
  from the Domain records).
- **masteryGap** — `1 − mastery` for the relevant domain (cold-start prior ~0.3 for
  unquizzed domains).
- **urgency** — FSRS overdue ratio / wrong-answer recency / activity base priority,
  clamped to a max so a few mildly-due cards never outrank a weak high-weight domain.
- **examDateFactor** — `1.0` beyond 30 days or no exam date; mild ramp `1.0 → ~1.2`
  between 30 and 7 days; final-week ramp `factor = 1 + (7 − daysUntil)/7` (≈1.0 at
  T-7 → ~2.0 at T-0).
- **timeFit** — how well the (possibly truncated) activity fits
  `UserState.dailySessionMinutes` (default 20).

### Overrides (outrank normal scoring when active)
1. **streak-at-risk** — late in day, nothing studied today, no freeze covering it →
   surface a short quick-win.
2. **fsrs-overdue** — fires when any due item is overdue by ≥ 200% of its scheduled
   interval `(now − fsrsDue) ≥ 2 × max(fsrsScheduledDays, 1)`, OR total FSRS-due
   backlog ≥ 20 questions.

### Tie-breakers (deterministic, in order)
higher exam weight → lower mastery → higher recent wrong-rate (14d) → ascending
domain number.

### Time-boxing
Truncate the top activity to fit the budget (e.g. a 12-question slice) rather than
falling through to a worse one. Mock exam only recommended when budget ≥ ~45 min or
explicitly opened. Detail line reflects truncated size ("12 questions · ~12 min").

### Cold start
New users (no completed quiz AND < 15 answered questions) get the **broad daily quiz
as a diagnostic first**, not a targeted drill. Adaptive weak-domain targeting begins
once ≥ 1 quiz completed OR ≥ 15 questions answered.

## Weakest-domain drill content (prioritized mix within target domain)
1. previously-wrong questions → 2. FSRS-due questions → 3. unseen questions from the
weakest objective → 4. remaining domain questions to fill. Dedup, cap to time-boxed
count. Route via `/quiz` with a domain filter param.

## Output contract
```ts
interface Recommendation {
  top: Candidate;
  candidates: Candidate[]; // ranked desc
}
interface Candidate {
  kind: "fsrs-mcq" | "wrong-answer-review" | "daily-quiz" | "flashcards"
      | "acronym-drill" | "mock-exam" | "weakest-domain-drill";
  label: string;
  detail: string;            // includes count + est minutes
  href: string;
  estMinutes: number;
  truncatedCount?: number;
  score: number;
  components: { examWeight; masteryGap; urgency; timeFit; examDateFactor };
  overrideReason: "streak-at-risk" | "fsrs-overdue" | null;
  rationale: string;         // one-line human explanation
  targetDomain?: string;     // for weakest-domain-drill
  targetObjective?: string;
}
```
Dashboard uses `top` for the "Recommended next" CTA (+ rationale); the ranked
`candidates` order the existing Today's-plan widget.

## Constraints
Local-first (no backend/tables/network), TypeScript strict, all 337 existing tests
keep passing + new scorer unit tests, preserve Terminal-Editorial design, no
dashboard regression, graceful cold-start.

## Tests (behavior-first)
Assert selected activity + ordering + which override fired + rationale substring
under named scenarios (weak high-weight domain near exam; 20+ FSRS overdue; streak at
risk with 10 min left; cold-start). Plus a small set of exact-numeric assertions on
tiny hand-computed snapshots to lock the component math.
