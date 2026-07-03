import { FSRS, createEmptyCard, Rating, type Card } from "ts-fsrs";
import { db, type QuestionReview } from "@/lib/db";
import type { ConfidenceLevel } from "@/lib/db";
// Import the queue primitive directly (not lib/sync/engine) to avoid a circular
// import: engine → gamification → fsrs-mcq. The queued item is flushed by the
// sibling engine.enqueue() calls in the same quiz-completion flow.
import { enqueue as enqueueSync } from "@/lib/sync/queue";

const fsrs = new FSRS({});

/** Map quiz outcome (correct + confidence) to an FSRS rating 1-4. */
export function quizOutcomeToRating(
  correct: boolean,
  confidence: ConfidenceLevel | undefined
): 1 | 2 | 3 | 4 {
  if (correct) {
    if (confidence === "high") return 4;   // Easy
    if (confidence === "medium") return 3;  // Good
    if (confidence === "low") return 3;     // Good (low confidence correct = still Good)
    return 3; // undefined confidence → Good
  } else {
    // Wrong
    if (confidence === undefined || confidence === "medium" || confidence === "high") {
      return 1; // Again — confident wrong = real gap
    }
    return 2; // Hard — suspected they didn't know
  }
}

/** Build a ts-fsrs Card from the latest QuestionReview row (or empty card if none). */
function cardFromReview(review: QuestionReview | null): Card {
  if (!review) return createEmptyCard(new Date());
  return {
    due: new Date(review.fsrsDue),
    stability: review.fsrsStability,
    difficulty: review.fsrsDifficulty,
    elapsed_days: review.fsrsElapsedDays,
    scheduled_days: review.fsrsScheduledDays,
    learning_steps: 0,
    reps: review.fsrsReps,
    lapses: review.fsrsLapses,
    state: review.fsrsState as Card["state"],
    last_review: new Date(review.reviewedAt),
  };
}

/** Return the most recent QuestionReview for a given question, or null. */
export async function getLatestQuestionReview(
  questionId: string
): Promise<QuestionReview | null> {
  const rows = await db.questionReviews
    .where("questionId")
    .equals(questionId)
    .sortBy("reviewedAt");
  if (rows.length === 0) return null;
  return rows[rows.length - 1];
}

/**
 * Record a question review, compute next FSRS state, persist to Dexie.
 * Returns the new QuestionReview row (without id).
 */
export async function recordQuestionReview(
  questionId: string,
  certId: string,
  rating: 1 | 2 | 3 | 4,
  now: Date = new Date()
): Promise<QuestionReview> {
  const latest = await getLatestQuestionReview(questionId);
  const card = cardFromReview(latest);

  const ratingGrade =
    rating === 1 ? Rating.Again :
    rating === 2 ? Rating.Hard :
    rating === 3 ? Rating.Good :
    Rating.Easy;

  const result = fsrs.next(card, now, ratingGrade);
  const nextCard = result.card;

  const review: QuestionReview = {
    questionId,
    certId,
    reviewedAt: now.toISOString(),
    rating,
    fsrsDue: nextCard.due.toISOString(),
    fsrsStability: nextCard.stability,
    fsrsDifficulty: nextCard.difficulty,
    fsrsElapsedDays: nextCard.elapsed_days,
    fsrsScheduledDays: nextCard.scheduled_days,
    fsrsReps: nextCard.reps,
    fsrsLapses: nextCard.lapses,
    fsrsState: nextCard.state,
  };

  await db.questionReviews.add(review);

  // Push this review up so MCQ FSRS scheduling syncs cross-device. Uses the same
  // reviewedAt + fsrs snapshot stored locally, so the down-sync dedup signature
  // (questionId|reviewedAt|rating) aligns exactly and never double-imports.
  enqueueSync("insert_question_review", {
    user_id: "",
    question_id: questionId,
    cert_id: certId,
    reviewed_at: review.reviewedAt,
    rating: review.rating,
    fsrs_state: nextCard as unknown as Record<string, unknown>,
  }).catch(() => {});

  return review;
}

/**
 * Return question IDs where the latest FSRS review has fsrsDue <= now.
 * Sorted oldest-due first.
 */
export async function getDueQuestionIds(
  certId: string,
  now: Date = new Date()
): Promise<string[]> {
  const nowIso = now.toISOString();

  // Fetch all reviews for this cert where fsrsDue <= now
  const dueRows = await db.questionReviews
    .where("certId")
    .equals(certId)
    .filter((r) => r.fsrsDue <= nowIso)
    .toArray();

  if (dueRows.length === 0) return [];

  // For each questionId keep only the latest review row
  const latestByQuestion = new Map<string, QuestionReview>();
  for (const row of dueRows) {
    const existing = latestByQuestion.get(row.questionId);
    if (!existing || row.reviewedAt > existing.reviewedAt) {
      latestByQuestion.set(row.questionId, row);
    }
  }

  // Only include questions whose latest review is still due (fsrsDue <= now)
  // (a later review might have pushed due date into the future)
  const allLatest = await Promise.all(
    Array.from(latestByQuestion.keys()).map((qId) =>
      getLatestQuestionReview(qId)
    )
  );

  const due: { questionId: string; fsrsDue: string }[] = [];
  for (const review of allLatest) {
    if (review && review.fsrsDue <= nowIso) {
      due.push({ questionId: review.questionId, fsrsDue: review.fsrsDue });
    }
  }

  // Sort oldest-due first
  due.sort((a, b) => a.fsrsDue.localeCompare(b.fsrsDue));
  return due.map((d) => d.questionId);
}

/** Count questions due for review right now. */
export async function getDueQuestionCount(
  certId: string,
  now: Date = new Date()
): Promise<number> {
  const ids = await getDueQuestionIds(certId, now);
  return ids.length;
}
