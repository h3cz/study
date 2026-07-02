# Sync model (Dexie ↔ Supabase)

The app is local-first: Dexie is the source of truth for the dashboard, mastery
(`lib/mastery.ts`), daily-quiz FSRS (`lib/fsrs-mcq.ts`), the wrong-answer queue
(`lib/wrong-answers.ts`), trend, heatmap, and predicted score. In-app quizzes and
the voice tutor record answers to Dexie on the client, which then sync **up** to
Supabase via the normal sync queue (`lib/sync/queue.ts` + `engine.ts`).

## Down-sync (cross-device hydration) — IMPLEMENTED

On sign-in, `hydrateFromRemote(userId)` (`lib/sync/engine.ts`, called from
`components/auth-button.tsx`) pulls **every** user-owned table down from Supabase
and merges it into Dexie, so a second device shows the user's real progress:

| Supabase table        | Dexie table          | Dedup key                                |
| --------------------- | -------------------- | ---------------------------------------- |
| `user_state`          | `userState`          | singleton (XP-gated via `pullLatest`)    |
| `quiz_sessions`       | `quizSessions`       | `score` + sorted `questionIds`           |
| `mock_exam_sessions`  | `mockExamSessions`   | shared uuid `id`                         |
| `drill_sessions`      | `drillSessions`      | `startedAt` + `completedAt`              |
| `bookmarks`           | `bookmarks`          | `questionId` (unique index)              |
| `reported_questions`  | `reportedQuestions`  | `questionId` + `reportedAt`              |
| `question_reviews`    | `questionReviews`    | `questionId` + `reviewedAt` + `rating`   |
| `flashcard_reviews`   | `reviews` + card FSRS | `flashcardId` + `reviewedAt` + `rating` (history); reps-advance (card schedule) |

Design notes:

- **Content-based, idempotent dedup.** For quiz sessions and flashcard card
  schedules we deliberately do **not** key on timestamps: the local Dexie row and
  the row pushed from it are written with two independent `new Date()` calls, so a
  timestamp signature would mismatch and re-import on every sign-in. Quiz sessions
  dedup by `score` + question set; flashcard **card** state adopts a remote review
  only when its FSRS `reps` exceed the local card's reps (monotonic, timestamp-free).
- **Aligned timestamps where history matters.** `question_reviews` and
  `flashcard_reviews` history rows reuse the exact `reviewedAt` written locally
  (the recorder returns it), so those tables dedup safely by
  `…|reviewedAt|rating`.
- **MCQ FSRS now pushes up.** `recordQuestionReview` (`lib/fsrs-mcq.ts`) enqueues
  `insert_question_review` so per-question scheduling syncs cross-device (it was
  previously written to Dexie only and never pushed).
- **Single-flight + reload-on-import.** A guard coalesces the concurrent
  `getSession`/`onAuthStateChange` hydrate calls; the page reloads once only when
  rows were actually imported (idempotent → cannot loop).

Pure helpers (`localQuizSignature`, `remoteQuizSignature`, `remoteQuizToLocal`,
`isoOf`, `numOf`, `clampRating`) are unit-tested in `tests/sync-hydrate.test.ts`.

## OpenClaw PAT `/answer` — now covered by down-sync

The OpenClaw study-buddy path (`app/api/study-buddy/answer/route.ts` →
`lib/study-buddy/record-answer.ts recordAnswer()`) is **headless** — the external
agent has no browser/Dexie — so it records server-side into Supabase
`quiz_sessions` / `question_reviews`. Because `hydrateFromRemote` now pulls both
of those tables down, OpenClaw-driven answers appear on the local dashboard /
mastery / FSRS the next time the owner signs in (or re-hydrates), de-duplicated
against locally-originated rows.

## Resolved: voice tutor

The voice tutor previously recorded **server-side only** (the voice tool bridge
called `recordAnswer()`), so voice answers never reached the local dashboard.
This is fixed: the voice tool bridge (`app/api/voice/tools/route.ts`) is now
check-only, and the browser records each answer to Dexie via
`recordVoiceAnswer()` (`lib/gamification.ts`) — the same local-first path an in-app
quiz uses, tagged `source: "voice-tutor"`. Voice answers therefore flow into
mastery/FSRS/dashboard locally and sync up the normal way, with no server
double-write.

## Known minor gaps

- **One-time flashcard history re-import.** Local `db.reviews` rows created
  *before* the timestamp-alignment change have a different `reviewedAt` than their
  already-pushed remote copies, so the first post-deploy hydrate may import them
  as "new." Heatmap day-dots are binary (active/inactive), so there is no visible
  effect; it does not recur after the first sync.
- **`xpEarned` on imported rows is 0.** XP is authoritative in `user_state`
  (synced separately), so imported quiz/flashcard history rows carry `xpEarned: 0`
  to avoid double-counting.
