"use client";

import { createClient } from "@/lib/supabase/client";
import { db } from "@/lib/db";
import type {
  QuizSession,
  MockExamSession,
  DrillSession,
  Bookmark,
  ReportedQuestion,
  QuestionReview,
  ReviewRecord,
} from "@/lib/db";
import { xpToLevel } from "@/lib/gamification";
import { DEFAULT_CERT_ID } from "@/lib/certs";
import {
  enqueue as enqueueItem,
  getPendingItems,
  deleteItem,
  incrementRetries,
} from "./queue";
import type {
  SyncOp,
  RemoteUserState,
  RemoteCertScore,
  RemoteQuizSession,
  RemoteFlashcardReview,
  RemoteMockExamSession,
  RemoteDrillSession,
  RemoteQuestionReport,
  RemoteQuestionReview,
  RemoteBookmark,
  SyncQueueItem,
} from "./types";

const MAX_RETRIES = 5;

/** Push an op+payload onto the Dexie sync queue, then attempt flush. */
export async function enqueue(
  op: SyncOp,
  payload: RemoteUserState | RemoteCertScore | RemoteQuizSession | RemoteFlashcardReview | RemoteMockExamSession | RemoteDrillSession | RemoteQuestionReport | RemoteQuestionReview | RemoteBookmark | { question_id: string }
): Promise<void> {
  await enqueueItem(op, payload);
  // Fire-and-forget flush
  flush().catch(() => {});
}

/**
 * Drain the sync queue: send each pending item to Supabase.
 * - On 401: stops and surfaces "signed_out".
 * - On other errors: increments retries (capped at MAX_RETRIES).
 * - Returns undefined on success, "signed_out" on auth failure.
 */
export async function flush(): Promise<string | undefined> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return;

  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;

  const items = await getPendingItems();
  if (items.length === 0) return;

  for (const item of items) {
    if (item.retries >= MAX_RETRIES) continue;

    try {
      await sendItem(supabase, session.user.id, item);
      await deleteItem(item.id!);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("401") ||
        msg.includes("JWT") ||
        msg.includes("not authenticated")
      ) {
        return "signed_out";
      }
      await incrementRetries(item.id!, item.retries);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendItem(supabase: any, userId: string, item: SyncQueueItem): Promise<void> {
  if (item.op === "upsert_user_state") {
    const payload = item.payload as RemoteUserState;
    // Monotonic server-side merge via the sync_user_state RPC: xp/level never
    // regress, so a stale offline push can't clobber a server-awarded duel XP
    // increment (which flows down via pullLatest). Identity is the verified
    // session inside the RPC (auth.uid()), never the client-sent user id.
    const { error } = await supabase.rpc("sync_user_state", {
      p_xp: payload.xp,
      p_level: payload.level,
      p_streak: payload.streak,
      p_last_study_date: payload.last_study_date,
      p_total_study_days: payload.total_study_days,
      p_predicted_score: payload.predicted_score ?? null,
      p_daily_goal_questions: payload.daily_goal_questions ?? null,
    });
    if (error) throw new Error(error.message);
  } else if (item.op === "upsert_cert_score") {
    const payload = item.payload as RemoteCertScore;
    const { error } = await supabase.from("user_cert_scores").upsert(
      {
        user_id: userId,
        cert_id: payload.cert_id,
        predicted_score: payload.predicted_score ?? null,
        xp: payload.xp,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,cert_id" }
    );
    if (error) throw new Error(error.message);
  } else if (item.op === "insert_quiz_session") {
    const payload = item.payload as RemoteQuizSession;
    const { error } = await supabase.from("quiz_sessions").insert({
      user_id: userId,
      cert_id: payload.cert_id,
      started_at: payload.started_at,
      completed_at: payload.completed_at,
      score_pct: payload.score_pct,
      num_questions: payload.num_questions,
      num_correct: payload.num_correct,
      questions: payload.questions,
    });
    if (error) throw new Error(error.message);
  } else if (item.op === "insert_flashcard_review") {
    const payload = item.payload as RemoteFlashcardReview;
    const { error } = await supabase.from("flashcard_reviews").insert({
      user_id: userId,
      flashcard_id: payload.flashcard_id,
      cert_id: payload.cert_id,
      objective_id: payload.objective_id,
      reviewed_at: payload.reviewed_at,
      rating: payload.rating,
      fsrs_state: payload.fsrs_state,
    });
    if (error) throw new Error(error.message);
  } else if (item.op === "insert_drill_session") {
    const payload = item.payload as RemoteDrillSession;
    try {
      const { error } = await supabase.from("drill_sessions").insert({
        user_id: userId,
        started_at: payload.started_at,
        completed_at: payload.completed_at,
        duration_seconds: payload.duration_seconds,
        correct: payload.correct,
        incorrect: payload.incorrect,
        skipped: payload.skipped,
        attempts: payload.attempts,
      });
      if (error && !error.message.includes("42P01") && !error.message.includes("does not exist")) {
        throw new Error(error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("42P01") && !msg.includes("does not exist")) throw err;
    }
  } else if (item.op === "insert_mock_exam") {
    const payload = item.payload as RemoteMockExamSession;
    // Gracefully skip if table doesn't exist yet
    try {
      const { error } = await supabase.from("mock_exam_sessions").insert({
        id: payload.id,
        user_id: userId,
        started_at: payload.started_at,
        completed_at: payload.completed_at,
        duration_ms: payload.duration_ms,
        total_questions: payload.total_questions,
        num_correct: payload.num_correct,
        score_percent: payload.score_percent,
        predicted_score: payload.predicted_score,
        passed: payload.passed,
        domain_breakdown: payload.domain_breakdown,
        questions: payload.questions,
      });
      // Table might not exist in all envs — treat 42P01 (undefined_table) as a no-op
      if (error && !error.message.includes("42P01") && !error.message.includes("does not exist")) {
        throw new Error(error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("42P01") && !msg.includes("does not exist")) throw err;
    }
  } else if (item.op === "insert_question_report") {
    const payload = item.payload as RemoteQuestionReport;
    try {
      const { error } = await supabase.from("reported_questions").insert({
        user_id: userId,
        question_id: payload.question_id,
        cert_id: payload.cert_id,
        reason: payload.reason,
        note: payload.note ?? null,
        reported_at: payload.reported_at,
      });
      if (error && !error.message.includes("42P01") && !error.message.includes("does not exist")) {
        throw new Error(error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("42P01") && !msg.includes("does not exist")) throw err;
    }
  } else if (item.op === "insert_question_review") {
    const payload = item.payload as RemoteQuestionReview;
    try {
      const { error } = await supabase.from("question_reviews").insert({
        user_id: userId,
        question_id: payload.question_id,
        cert_id: payload.cert_id,
        reviewed_at: payload.reviewed_at,
        rating: payload.rating,
        fsrs_state: payload.fsrs_state,
      });
      if (error && !error.message.includes("42P01") && !error.message.includes("does not exist")) {
        throw new Error(error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("42P01") && !msg.includes("does not exist")) throw err;
    }
  } else if (item.op === "insert_bookmark") {
    const payload = item.payload as RemoteBookmark;
    try {
      const { error } = await supabase.from("bookmarks").upsert({
        user_id: userId,
        question_id: payload.question_id,
        cert_id: payload.cert_id,
        bookmarked_at: payload.bookmarked_at,
        note: payload.note ?? null,
      }, { onConflict: "user_id,question_id" });
      if (error && !error.message.includes("42P01") && !error.message.includes("does not exist")) {
        throw new Error(error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("42P01") && !msg.includes("does not exist")) throw err;
    }
  } else if (item.op === "delete_bookmark") {
    const payload = item.payload as { question_id: string };
    try {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", userId)
        .eq("question_id", payload.question_id);
      if (error && !error.message.includes("42P01") && !error.message.includes("does not exist")) {
        throw new Error(error.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("42P01") && !msg.includes("does not exist")) throw err;
    }
  }
}

/**
 * On sign-in: fetch remote user_state and overwrite local if remote has more XP.
 * Quiz sessions and flashcard reviews are push-only for MVP.
 */
export async function pullLatest(userId: string): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_state")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) return;

  const remote = data as RemoteUserState;
  const local = await db.userState.get(1);

  // Overwrite local if remote has more XP (proxy for "newer / more complete").
  // Spread local state first so local-only fields (examDate, dailySessionMinutes,
  // onboardedAt, streakFreezes, etc.) are preserved — only overwrite the fields
  // that actually came from the remote record.
  if (!local || remote.xp > local.xp) {
    await db.userState.put({
      ...(local ?? {}),
      id: 1,
      xp: remote.xp,
      level: xpToLevel(remote.xp),
      streak: remote.streak,
      lastStudyDate: remote.last_study_date ?? undefined,
      totalStudyDays: remote.total_study_days,
      // Use remote predicted_score only if local doesn't have one yet
      ...(remote.predicted_score !== null && remote.predicted_score !== undefined && !local?.predictedScore
        ? { predictedScore: remote.predicted_score }
        : {}),
      // Daily goal is a synced setting — adopt remote only if local hasn't set one,
      // so a local edit is never clobbered by an older cloud default.
      ...(remote.daily_goal_questions !== null && remote.daily_goal_questions !== undefined && !local?.dailyGoalQuestions
        ? { dailyGoalQuestions: remote.daily_goal_questions as 5 | 10 | 15 | 20 }
        : {}),
    });
  }
}

// ─── Down-sync (cross-device hydration) ──────────────────────────────────────
//
// pullLatest() above only syncs the top-level user_state (XP/streak). That is
// NOT enough for cross-device sync: the dashboard, mastery, history, FSRS due
// queue, bookmarks, mocks, and drills are all computed from per-row Dexie
// tables. A second device that signs in must receive those rows too.
//
// hydrateFromRemote() pulls every user-owned Supabase table down and merges the
// rows into Dexie. Dedup is by a stable CONTENT signature (not the Supabase row
// id), so:
//   - rows that originated on THIS device (already local, then pushed up) are
//     recognized and skipped — no duplicates, fully idempotent on re-sync;
//   - rows from ANOTHER device are new locally and get inserted.
// Imported rows are written straight to Dexie and never re-enqueued, so they are
// not pushed back up (which would create server duplicates).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

/** Fetch all rows of a user-owned table; tolerate a not-yet-created table. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchUserRows(supabase: any, table: string, userId: string): Promise<AnyRow[]> {
  try {
    const { data, error } = await supabase.from(table).select("*").eq("user_id", userId);
    if (error) return [];
    return (data as AnyRow[]) ?? [];
  } catch {
    return [];
  }
}

/**
 * On sign-in: pull every user-owned table down from Supabase and merge into
 * Dexie so a second device shows the user's real progress. Safe to call
 * repeatedly — dedup is content-based and idempotent.
 */
// Single-flight guard: getSession() and onAuthStateChange can both fire on
// mount and call hydrateFromRemote near-simultaneously. Without this, two
// concurrent passes would each read an empty Dexie, build identical "seen" sets,
// and double-import every row. Coalesce overlapping calls onto one promise.
let inFlightHydration: Promise<number> | null = null;

export function hydrateFromRemote(userId: string): Promise<number> {
  if (inFlightHydration) return inFlightHydration;
  inFlightHydration = runHydration(userId).finally(() => {
    inFlightHydration = null;
  });
  return inFlightHydration;
}

async function runHydration(userId: string): Promise<number> {
  // 1. Top-level user_state (XP / streak / predicted score).
  await pullLatest(userId).catch(() => {});

  const supabase = createClient();

  // 2. The per-row tables — run independently; one failing must not block others.
  const results = await Promise.allSettled([
    hydrateQuizSessions(supabase, userId),
    hydrateMockExams(supabase, userId),
    hydrateDrillSessions(supabase, userId),
    hydrateBookmarks(supabase, userId),
    hydrateReportedQuestions(supabase, userId),
    hydrateQuestionReviews(supabase, userId),
    hydrateFlashcardReviews(supabase, userId),
  ]);

  // Total rows newly imported into Dexie this pass. Idempotent: a later pass
  // (same data already local) returns 0, so callers can safely reload-on-import
  // without looping.
  return results.reduce(
    (sum, r) => sum + (r.status === "fulfilled" ? r.value : 0),
    0
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hydrateQuizSessions(supabase: any, userId: string): Promise<number> {
  const rows = await fetchUserRows(supabase, "quiz_sessions", userId);
  if (rows.length === 0) return 0;

  const local = await db.quizSessions.toArray();
  const seen = new Set(local.map(localQuizSignature));

  const toAdd: QuizSession[] = [];
  for (const r of rows) {
    const sig = remoteQuizSignature(r);
    if (seen.has(sig)) continue;
    seen.add(sig);
    toAdd.push(remoteQuizToLocal(r));
  }
  if (toAdd.length > 0) await db.quizSessions.bulkAdd(toAdd);
  return toAdd.length;
}

// Quiz dedup is content-based, NOT timestamp-based: the local Dexie row and the
// remote row pushed from it are written with two independent `new Date()` calls
// (in recordQuizResult vs. the page's enqueue), so their timestamps differ by a
// few ms. A timestamp signature would mismatch and re-import every session on
// every sign-in. The question-set + score uniquely identifies a session for
// dedup purposes (a true collision needs the exact same questions AND score,
// which is acceptable to treat as one).

/** Content signature for a local quiz session (must match remoteQuizSignature). */
export function localQuizSignature(s: {
  questionIds: string[];
  score: number;
}): string {
  return `${Math.round(s.score)}|${[...(s.questionIds ?? [])].sort().join(",")}`;
}

/** Content signature for a remote quiz row (must match localQuizSignature). */
export function remoteQuizSignature(r: AnyRow): string {
  const ids = Array.isArray(r.questions)
    ? r.questions.map((q: AnyRow) => q.questionId)
    : [];
  return `${Math.round(r.score_pct ?? 0)}|${ids.sort().join(",")}`;
}

/** Reconstruct a Dexie QuizSession (minus auto-id) from a remote quiz row. */
export function remoteQuizToLocal(r: AnyRow): QuizSession {
  const questions = Array.isArray(r.questions) ? r.questions : [];
  const answers: Record<string, string> = {};
  const answerRecords = questions.map((q: AnyRow) => {
    if (q.picked != null) answers[q.questionId] = q.picked;
    return { questionId: q.questionId, picked: q.picked ?? null, correct: !!q.correct };
  });
  return {
    certId: r.cert_id,
    startedAt: r.started_at,
    completedAt: r.completed_at ?? undefined,
    questionIds: questions.map((q: AnyRow) => q.questionId),
    answers,
    answerRecords,
    score: r.score_pct ?? 0,
    xpEarned: 0, // not stored remotely; XP already synced via user_state
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hydrateMockExams(supabase: any, userId: string): Promise<number> {
  const rows = await fetchUserRows(supabase, "mock_exam_sessions", userId);
  if (rows.length === 0) return 0;

  // Mock exams share a stable uuid id across devices → key directly by id.
  const existingIds = new Set((await db.mockExamSessions.toArray()).map((m) => m.id));
  const toPut: MockExamSession[] = [];
  for (const r of rows) {
    if (existingIds.has(r.id)) continue;
    toPut.push({
      id: r.id,
      // Remote rows predate the cert_id column → default to Security+ (back-compat).
      certId: r.cert_id ?? DEFAULT_CERT_ID,
      startedAt: r.started_at,
      completedAt: r.completed_at ?? undefined,
      durationMs: r.duration_ms ?? undefined,
      totalQuestions: r.total_questions,
      numCorrect: r.num_correct,
      scorePercent: r.score_percent,
      predictedScore: r.predicted_score,
      passed: r.passed,
      domainBreakdown: r.domain_breakdown ?? {},
      questions: Array.isArray(r.questions) ? r.questions : [],
    });
  }
  if (toPut.length > 0) await db.mockExamSessions.bulkPut(toPut);
  return toPut.length;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hydrateDrillSessions(supabase: any, userId: string): Promise<number> {
  const rows = await fetchUserRows(supabase, "drill_sessions", userId);
  if (rows.length === 0) return 0;

  const local = await db.drillSessions.toArray();
  const seen = new Set(local.map((d) => `${d.startedAt}|${d.completedAt}`));
  const toAdd: DrillSession[] = [];
  for (const r of rows) {
    const sig = `${r.started_at}|${r.completed_at}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    toAdd.push({
      startedAt: r.started_at,
      completedAt: r.completed_at,
      durationSeconds: r.duration_seconds,
      correct: r.correct,
      incorrect: r.incorrect,
      skipped: r.skipped,
      attempts: Array.isArray(r.attempts) ? r.attempts : [],
    });
  }
  if (toAdd.length > 0) await db.drillSessions.bulkAdd(toAdd);
  return toAdd.length;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hydrateBookmarks(supabase: any, userId: string): Promise<number> {
  const rows = await fetchUserRows(supabase, "bookmarks", userId);
  if (rows.length === 0) return 0;

  // bookmarks has a UNIQUE questionId index in Dexie — dedup by questionId.
  const existing = new Set((await db.bookmarks.toArray()).map((b) => b.questionId));
  const toAdd: Bookmark[] = [];
  for (const r of rows) {
    if (existing.has(r.question_id)) continue;
    existing.add(r.question_id);
    toAdd.push({
      questionId: r.question_id,
      certId: r.cert_id,
      bookmarkedAt: r.bookmarked_at,
      note: r.note ?? undefined,
    });
  }
  if (toAdd.length > 0) await db.bookmarks.bulkAdd(toAdd);
  return toAdd.length;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hydrateReportedQuestions(supabase: any, userId: string): Promise<number> {
  const rows = await fetchUserRows(supabase, "reported_questions", userId);
  if (rows.length === 0) return 0;

  const local = await db.reportedQuestions.toArray();
  const seen = new Set(local.map((r) => `${r.questionId}|${r.reportedAt}`));
  const toAdd: ReportedQuestion[] = [];
  for (const r of rows) {
    const sig = `${r.question_id}|${r.reported_at}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    toAdd.push({
      questionId: r.question_id,
      certId: r.cert_id,
      reason: r.reason,
      note: r.note ?? undefined,
      reportedAt: r.reported_at,
      syncedAt: r.reported_at,
    });
  }
  if (toAdd.length > 0) await db.reportedQuestions.bulkAdd(toAdd);
  return toAdd.length;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hydrateQuestionReviews(supabase: any, userId: string): Promise<number> {
  const rows = await fetchUserRows(supabase, "question_reviews", userId);
  if (rows.length === 0) return 0;

  const local = await db.questionReviews.toArray();
  const seen = new Set(local.map((r) => `${r.questionId}|${r.reviewedAt}|${r.rating}`));
  const toAdd: QuestionReview[] = [];
  for (const r of rows) {
    const sig = `${r.question_id}|${r.reviewed_at}|${r.rating}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    const f = (r.fsrs_state ?? {}) as AnyRow;
    toAdd.push({
      questionId: r.question_id,
      certId: r.cert_id,
      reviewedAt: r.reviewed_at,
      rating: clampRating(r.rating),
      fsrsDue: isoOf(f.due) ?? r.reviewed_at,
      fsrsStability: numOf(f.stability),
      fsrsDifficulty: numOf(f.difficulty),
      fsrsElapsedDays: numOf(f.elapsed_days),
      fsrsScheduledDays: numOf(f.scheduled_days),
      fsrsReps: numOf(f.reps),
      fsrsLapses: numOf(f.lapses),
      fsrsState: numOf(f.state),
    });
  }
  // Imported rows carry their own fsrsDue snapshot, so getDueQuestionIds (which
  // takes the latest review per question) immediately reflects the other device.
  if (toAdd.length > 0) await db.questionReviews.bulkAdd(toAdd);
  return toAdd.length;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hydrateFlashcardReviews(supabase: any, userId: string): Promise<number> {
  const rows = await fetchUserRows(supabase, "flashcard_reviews", userId);
  if (rows.length === 0) return 0;

  // 1. Import review-history rows into db.reviews. These feed the streak heatmap
  //    and the after-6pm "streak at risk" check, so importing them lets a second
  //    device see flashcard study done elsewhere. Dedup is now safe: the push
  //    reuses the exact reviewedAt written locally (recordFlashcardReview returns
  //    it), so flashcardId|reviewedAt|rating matches on re-sync and never loops.
  const localReviews = await db.reviews.toArray();
  const seen = new Set(
    localReviews.map((r) => `${r.flashcardId}|${r.reviewedAt}|${r.rating}`)
  );
  const historyToAdd: ReviewRecord[] = [];
  for (const r of rows) {
    const sig = `${r.flashcard_id}|${r.reviewed_at}|${r.rating}`;
    if (seen.has(sig)) continue;
    seen.add(sig);
    historyToAdd.push({
      flashcardId: r.flashcard_id,
      certId: r.cert_id,
      reviewedAt: r.reviewed_at,
      rating: r.rating,
      xpEarned: 0, // not stored remotely; XP already synced via user_state
    });
  }
  if (historyToAdd.length > 0) await db.reviews.bulkAdd(historyToAdd);

  // 2. Flashcard scheduling lives ON the card (flashcards.fsrsDue, …), not in the
  //    reviews table, so reconstruct each card's FSRS state from its most-advanced
  //    remote review. "Most advanced" = highest fsrs reps. reps is monotonic per
  //    card and timestamp-independent, so:
  //      - re-syncing this device's own data (same reps) → no-op, no reload loop;
  //      - another device that reviewed the card more times → adopt its schedule.
  const bestByCard = new Map<string, AnyRow>();
  for (const r of rows) {
    const reps = numOf((r.fsrs_state as AnyRow)?.reps);
    const prev = bestByCard.get(r.flashcard_id);
    if (!prev || reps > numOf((prev.fsrs_state as AnyRow)?.reps)) {
      bestByCard.set(r.flashcard_id, r);
    }
  }

  let cardsUpdated = 0;
  for (const [flashcardId, r] of bestByCard) {
    const card = await db.flashcards.get(flashcardId);
    if (!card) continue;
    const f = (r.fsrs_state ?? {}) as AnyRow;
    const remoteReps = numOf(f.reps);
    // Only adopt a strictly-more-reviewed remote schedule. Equal/fewer reps means
    // this device is already at or ahead of the remote state → skip.
    if (remoteReps <= (card.fsrsReps ?? 0)) continue;
    await db.flashcards.update(flashcardId, {
      fsrsDue: isoOf(f.due) ?? card.fsrsDue,
      fsrsStability: numOf(f.stability),
      fsrsDifficulty: numOf(f.difficulty),
      fsrsElapsedDays: numOf(f.elapsed_days),
      fsrsScheduledDays: numOf(f.scheduled_days),
      fsrsReps: remoteReps,
      fsrsLapses: numOf(f.lapses),
      fsrsState: numOf(f.state),
      fsrsLastReview: isoOf(f.last_review) ?? r.reviewed_at,
    });
    cardsUpdated++;
  }

  return historyToAdd.length + cardsUpdated;
}

/** Coerce an FSRS field that may be a Date, ISO string, or number to ISO string. */
export function isoOf(v: unknown): string | undefined {
  if (typeof v === "string") return v;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "number") {
    try {
      return new Date(v).toISOString();
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function numOf(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export function clampRating(v: unknown): 1 | 2 | 3 | 4 {
  const n = typeof v === "number" ? v : 3;
  if (n <= 1) return 1;
  if (n === 2) return 2;
  if (n === 3) return 3;
  return 4;
}

/** Register window online listener to auto-flush when connectivity is restored. */
export function registerOnlineListener(): () => void {
  const handler = () => {
    flush().catch(() => {});
  };
  window.addEventListener("online", handler);
  return () => window.removeEventListener("online", handler);
}
