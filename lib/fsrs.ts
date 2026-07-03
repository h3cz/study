import { FSRS, createEmptyCard, Rating, type Card, type Grade } from "ts-fsrs";
import { db, type Flashcard } from "@/lib/db";

const fsrs = new FSRS({});

export type FSRSRating = "Again" | "Hard" | "Good" | "Easy";

const ratingMap: Record<FSRSRating, Grade> = {
  Again: Rating.Again,
  Hard: Rating.Hard,
  Good: Rating.Good,
  Easy: Rating.Easy,
};

/** Extract a ts-fsrs Card from a Flashcard record. */
export function cardFromFlashcard(fc: Flashcard): Card {
  if (fc.fsrsState === undefined || fc.fsrsState === null) {
    return createEmptyCard(new Date());
  }
  return {
    due: fc.fsrsDue ? new Date(fc.fsrsDue) : new Date(),
    stability: fc.fsrsStability ?? 0,
    difficulty: fc.fsrsDifficulty ?? 0,
    elapsed_days: fc.fsrsElapsedDays ?? 0,
    scheduled_days: fc.fsrsScheduledDays ?? 0,
    learning_steps: 0,
    reps: fc.fsrsReps ?? 0,
    lapses: fc.fsrsLapses ?? 0,
    state: fc.fsrsState as Card["state"],
    last_review: fc.fsrsLastReview
      ? new Date(fc.fsrsLastReview)
      : undefined,
  };
}

/** Apply a rating to a flashcard, persist updated FSRS state to Dexie, return next due date. */
export async function rateFlashcard(
  flashcard: Flashcard,
  rating: FSRSRating,
  now: Date = new Date()
): Promise<{ nextDue: Date; card: Card }> {
  const card = cardFromFlashcard(flashcard);
  const result = fsrs.next(card, now, ratingMap[rating]);
  const nextCard = result.card;

  const updates: Partial<Flashcard> = {
    fsrsDue: nextCard.due.toISOString(),
    fsrsStability: nextCard.stability,
    fsrsDifficulty: nextCard.difficulty,
    fsrsElapsedDays: nextCard.elapsed_days,
    fsrsScheduledDays: nextCard.scheduled_days,
    fsrsReps: nextCard.reps,
    fsrsLapses: nextCard.lapses,
    fsrsState: nextCard.state,
    fsrsLastReview: nextCard.last_review?.toISOString(),
  };

  await db.flashcards.update(flashcard.id, updates);
  return { nextDue: nextCard.due, card: nextCard };
}

/** Return all flashcards due for review (due <= now). */
export async function getDueFlashcards(certId?: string): Promise<Flashcard[]> {
  const now = new Date().toISOString();
  let query = db.flashcards.filter(
    (fc) => !fc.fsrsDue || fc.fsrsDue <= now
  );
  if (certId) {
    query = db.flashcards
      .where("certId")
      .equals(certId)
      .filter((fc) => !fc.fsrsDue || fc.fsrsDue <= now);
  }
  return query.toArray();
}
