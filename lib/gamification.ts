import { db } from "@/lib/db";
import type { AnswerRecord, UserState } from "@/lib/db";
import { recordQuestionReview, quizOutcomeToRating } from "@/lib/fsrs-mcq";
import { predictedScore } from "@/lib/mastery";

export const XP_PER_CORRECT = 10;
export const XP_PER_FLASHCARD = 5;
export const FREEZE_CAP = 3;
export const FREEZE_EARN_INTERVAL = 7; // every N-day streak earns 1 freeze
export const DEFAULT_DAILY_GOAL = 10; // questions/day to keep the streak alive

/** Level from total XP: level = floor(sqrt(xp / 50)) */
export function xpToLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50));
}

/** XP needed for the START of a given level. */
export function levelToXp(level: number): number {
  return level * level * 50;
}

/** XP needed for the START of the next level. */
export function nextLevelXp(xp: number): number {
  const level = xpToLevel(xp);
  return levelToXp(level + 1);
}

/** Progress 0-1 toward next level. */
export function levelProgress(xp: number): number {
  const level = xpToLevel(xp);
  const currentLevelXp = levelToXp(level);
  const nextLevelXpVal = levelToXp(level + 1);
  return (xp - currentLevelXp) / (nextLevelXpVal - currentLevelXp);
}

/**
 * Pure streak calculation with freeze support.
 * Returns updated streak count and whether a freeze was consumed.
 */
export function computeStreakUpdate(
  currentStreak: number,
  lastStudyDate: string | undefined,
  today: string,
  streakFreezes: number
): { newStreak: number; consumedFreeze: boolean } {
  if (!lastStudyDate) return { newStreak: 1, consumedFreeze: false };
  if (lastStudyDate === today) return { newStreak: currentStreak, consumedFreeze: false };

  const last = new Date(lastStudyDate);
  const todayDate = new Date(today);
  const diffDays = Math.round(
    (todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 1) {
    // Consecutive day — normal streak increment
    return { newStreak: currentStreak + 1, consumedFreeze: false };
  }

  if (diffDays === 2 && streakFreezes > 0) {
    // Exactly 1 missed day and a freeze available — restore streak
    return { newStreak: currentStreak + 1, consumedFreeze: true };
  }

  // Streak broken
  return { newStreak: 1, consumedFreeze: false };
}

/**
 * After computing new streak, check if a freeze should be earned.
 * A freeze is earned when streak hits a multiple of FREEZE_EARN_INTERVAL,
 * but only once per calendar day (to avoid double-earning on same session).
 */
export function computeFreezeEarned(
  newStreak: number,
  currentFreezes: number,
  lastFreezeEarnedAt: string | undefined,
  today: string
): { freezesAfter: number; freezesEarnedTotalDelta: number; newLastFreezeEarnedAt: string | undefined } {
  if (
    newStreak > 0 &&
    newStreak % FREEZE_EARN_INTERVAL === 0 &&
    lastFreezeEarnedAt !== today &&
    currentFreezes < FREEZE_CAP
  ) {
    return {
      freezesAfter: currentFreezes + 1,
      freezesEarnedTotalDelta: 1,
      newLastFreezeEarnedAt: today,
    };
  }
  return {
    freezesAfter: currentFreezes,
    freezesEarnedTotalDelta: 0,
    newLastFreezeEarnedAt: lastFreezeEarnedAt,
  };
}

/**
 * Pure gate for whether a study session should advance the daily streak.
 * The streak now advances only when the daily goal is NEWLY crossed today and
 * the day hasn't already been credited (lastStudyDate === today).
 *
 * - goal <= 0 is clamped to 1 (a 0 goal would auto-complete / divide-by-zero).
 */
export function shouldAdvanceStreak(
  prevCountToday: number,
  addCount: number,
  goal: number,
  lastStudyDate: string | undefined,
  today: string
): boolean {
  const g = goal > 0 ? goal : 1;
  const goalMetBefore = prevCountToday >= g;
  const goalMetNow = prevCountToday + addCount >= g;
  return !goalMetBefore && goalMetNow && lastStudyDate !== today;
}

/**
 * Count of questions answered today (local-midnight day boundary), computed
 * across quiz sessions, flashcard reviews, and acronym drills. Computed (not
 * stored) so it never needs its own per-day sync state.
 *   - quizSessions completed today: answerRecords?.length ?? questionIds.length
 *   - reviews (flashcards) reviewed today: 1 each
 *   - drillSessions completed today: correct + incorrect + skipped (questions seen)
 */
export async function questionsAnsweredToday(today?: string): Promise<number> {
  const day = (today ?? todayString()).slice(0, 10);

  const [quizSessions, reviews, drillSessions] = await Promise.all([
    db.quizSessions
      .filter((s) => !!s.completedAt && s.completedAt.slice(0, 10) === day)
      .toArray(),
    db.reviews.filter((r) => r.reviewedAt.slice(0, 10) === day).toArray(),
    db.drillSessions
      .filter((s) => s.completedAt.slice(0, 10) === day)
      .toArray(),
  ]);

  const quizCount = quizSessions.reduce(
    (sum, s) => sum + (s.answerRecords?.length ?? s.questionIds.length),
    0
  );
  const reviewCount = reviews.length;
  const drillCount = drillSessions.reduce(
    (sum, s) => sum + s.correct + s.incorrect + s.skipped,
    0
  );

  return quizCount + reviewCount + drillCount;
}

/** Award XP for correct quiz answers, update streak, return updated state. */
export async function recordQuizResult(
  correctCount: number,
  certId: string,
  questionIds: string[],
  answers: Record<string, string>,
  sessionScore: number,
  answerRecords?: AnswerRecord[],
  kind?: "mcq" | "pbq"
): Promise<{ xpEarned: number; newStreak: number; levelUp: boolean; goalJustMet: boolean; streakAdvanced: boolean }> {
  const xpEarned = correctCount * XP_PER_CORRECT;
  const today = todayString();

  const state = await getOrCreateUserState();
  const prevLevel = xpToLevel(state.xp);
  const newXp = state.xp + xpEarned;
  const newLevel = xpToLevel(newXp);
  const levelUp = newLevel > prevLevel;

  // Daily-goal gate: the streak advances only when the goal is newly crossed.
  const goal = state.dailyGoalQuestions ?? DEFAULT_DAILY_GOAL;
  const addCount = questionIds.length;
  const prevCountToday = await questionsAnsweredToday(today);
  const goalJustMet = shouldAdvanceStreak(prevCountToday, addCount, goal, state.lastStudyDate, today);

  const { newStreak, consumedFreeze } = goalJustMet
    ? computeStreakUpdate(state.streak, state.lastStudyDate, today, state.streakFreezes ?? 0)
    : { newStreak: state.streak, consumedFreeze: false };

  const { freezesAfter, freezesEarnedTotalDelta, newLastFreezeEarnedAt } = goalJustMet
    ? computeFreezeEarned(newStreak, state.streakFreezes ?? 0, state.lastFreezeEarnedAt, today)
    : {
        freezesAfter: state.streakFreezes ?? 0,
        freezesEarnedTotalDelta: 0,
        newLastFreezeEarnedAt: state.lastFreezeEarnedAt,
      };

  // Only credit a study day / advance the streak when the goal is newly met.
  const newTotalDays = goalJustMet ? state.totalStudyDays + 1 : state.totalStudyDays;

  const now = new Date();

  // Compute predicted score after this quiz result
  const newPredictedScore = await predictedScore(certId).catch(() => null);

  await db.transaction("rw", [db.userState, db.quizSessions, db.questionReviews], async () => {
    await db.userState.put({
      ...state,
      xp: newXp,
      level: newLevel,
      // Streak / lastStudyDate / freeze fields only change on a goal-met session.
      ...(goalJustMet
        ? {
            streak: newStreak,
            lastStudyDate: today,
            totalStudyDays: newTotalDays,
            streakFreezes: freezesAfter,
            streakFreezesEarnedTotal: (state.streakFreezesEarnedTotal ?? 0) + freezesEarnedTotalDelta,
            lastFreezeAppliedAt: consumedFreeze ? today : state.lastFreezeAppliedAt,
            lastFreezeEarnedAt: newLastFreezeEarnedAt,
          }
        : {}),
      ...(newPredictedScore !== null ? { predictedScore: newPredictedScore } : {}),
    });
    await db.quizSessions.add({
      certId,
      startedAt: now.toISOString(),
      completedAt: now.toISOString(),
      questionIds,
      answers,
      answerRecords,
      score: sessionScore,
      xpEarned,
      ...(kind ? { kind } : {}),
    });
  });

  // Record FSRS reviews for each answered question (fire-and-forget per question)
  if (answerRecords && answerRecords.length > 0) {
    const reviewPromises = answerRecords.map((ar) => {
      const rating = quizOutcomeToRating(ar.correct, ar.confidence);
      return recordQuestionReview(ar.questionId, certId, rating, now).catch(() => {});
    });
    await Promise.all(reviewPromises);
  } else {
    // Fallback: use answers map without confidence data
    const reviewPromises = questionIds.map((qId) => {
      const picked = answers[qId];
      if (!picked) return Promise.resolve();
      // We don't have the question object here to check correctness, skip gracefully
      return Promise.resolve();
    });
    await Promise.all(reviewPromises);
  }

  return { xpEarned, newStreak, levelUp, goalJustMet, streakAdvanced: goalJustMet };
}

/**
 * Record ONE voice-tutor answer locally (Dexie), exactly like a single-question
 * quiz: a quiz session + an FSRS question review, plus XP/streak. The answer
 * record carries source:"voice-tutor" so it can be surfaced as a via-voice
 * marker and so it is indistinguishable from a quiz answer to the mastery/FSRS
 * engines otherwise.
 *
 * Idempotent per (questionId, voiceSessionId): a double-fire of the submit_answer
 * tool for the same question within the same voice session records only once.
 */
export async function recordVoiceAnswer(opts: {
  questionId: string;
  certId: string;
  picked: "A" | "B" | "C" | "D";
  correct: boolean;
  voiceSessionId: string;
}): Promise<{ recorded: boolean; xpEarned: number }> {
  const { questionId, certId, picked, correct, voiceSessionId } = opts;

  // Idempotency: a previously recorded voice answer for the same question +
  // voice session means this is a duplicate tool fire — skip.
  const dupe = await db.quizSessions
    .filter(
      (s) =>
        s.answerRecords?.some(
          (ar) =>
            ar.source === "voice-tutor" &&
            ar.questionId === questionId &&
            ar.voiceSessionId === voiceSessionId
        ) ?? false
    )
    .first();
  if (dupe) return { recorded: false, xpEarned: 0 };

  const answerRecord: AnswerRecord = {
    questionId,
    picked,
    correct,
    source: "voice-tutor",
    voiceSessionId,
  };

  const result = await recordQuizResult(
    correct ? 1 : 0,
    certId,
    [questionId],
    { [questionId]: picked },
    correct ? 100 : 0,
    [answerRecord],
    "mcq"
  );

  return { recorded: true, xpEarned: result.xpEarned };
}

/** Award XP for a flashcard review. */
export async function recordFlashcardReview(
  flashcardId: string,
  certId: string,
  rating: number
): Promise<{ xpEarned: number; reviewedAt: string; goalJustMet: boolean }> {
  const xpEarned = XP_PER_FLASHCARD;
  const today = todayString();
  // One timestamp shared by the local db.reviews row AND (via the return value)
  // the cloud push, so the cross-device down-sync can dedup history rows by
  // flashcardId|reviewedAt|rating without re-importing on every sign-in.
  const reviewedAt = new Date().toISOString();

  const state = await getOrCreateUserState();
  const newXp = state.xp + xpEarned;
  const newLevel = xpToLevel(newXp);

  // Daily-goal gate: one flashcard review counts as one answered question.
  const goal = state.dailyGoalQuestions ?? DEFAULT_DAILY_GOAL;
  const prevCountToday = await questionsAnsweredToday(today);
  const goalJustMet = shouldAdvanceStreak(prevCountToday, 1, goal, state.lastStudyDate, today);

  const { newStreak, consumedFreeze } = goalJustMet
    ? computeStreakUpdate(state.streak, state.lastStudyDate, today, state.streakFreezes ?? 0)
    : { newStreak: state.streak, consumedFreeze: false };

  const { freezesAfter, freezesEarnedTotalDelta, newLastFreezeEarnedAt } = goalJustMet
    ? computeFreezeEarned(newStreak, state.streakFreezes ?? 0, state.lastFreezeEarnedAt, today)
    : {
        freezesAfter: state.streakFreezes ?? 0,
        freezesEarnedTotalDelta: 0,
        newLastFreezeEarnedAt: state.lastFreezeEarnedAt,
      };

  const newTotalDays = goalJustMet ? state.totalStudyDays + 1 : state.totalStudyDays;

  // Recompute predicted score after flashcard review
  const newPredictedScore = await predictedScore(certId).catch(() => null);

  await db.transaction("rw", [db.userState, db.reviews], async () => {
    await db.userState.put({
      ...state,
      xp: newXp,
      level: newLevel,
      ...(goalJustMet
        ? {
            streak: newStreak,
            lastStudyDate: today,
            totalStudyDays: newTotalDays,
            streakFreezes: freezesAfter,
            streakFreezesEarnedTotal: (state.streakFreezesEarnedTotal ?? 0) + freezesEarnedTotalDelta,
            lastFreezeAppliedAt: consumedFreeze ? today : state.lastFreezeAppliedAt,
            lastFreezeEarnedAt: newLastFreezeEarnedAt,
          }
        : {}),
      ...(newPredictedScore !== null ? { predictedScore: newPredictedScore } : {}),
    });
    await db.reviews.add({
      flashcardId,
      certId,
      reviewedAt,
      rating,
      xpEarned,
    });
  });

  return { xpEarned, reviewedAt, goalJustMet };
}

/**
 * Reconcile streak on app open — auto-apply a freeze if the user missed
 * exactly 1 day since last study and has freezes available.
 * Call this before displaying streak on the dashboard.
 */
export async function reconcileStreak(): Promise<{ streak: number; consumedFreeze: boolean }> {
  const state = await getOrCreateUserState();
  const today = todayString();

  // Nothing to do if no last study date or already studied today
  if (!state.lastStudyDate || state.lastStudyDate === today) {
    return { streak: state.streak, consumedFreeze: false };
  }

  const last = new Date(state.lastStudyDate);
  const todayDate = new Date(today);
  const diffDays = Math.round(
    (todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Only apply freeze for exactly 1 missed day (2-day gap)
  if (diffDays !== 2 || (state.streakFreezes ?? 0) <= 0) {
    return { streak: state.streak, consumedFreeze: false };
  }

  // Auto-apply freeze: preserve streak without incrementing (user didn't study today yet)
  const newFreezes = (state.streakFreezes ?? 0) - 1;
  await db.userState.put({
    ...state,
    streakFreezes: newFreezes,
    lastFreezeAppliedAt: today,
    // Shift lastStudyDate forward by 1 so next quiz continues streak normally
    lastStudyDate: shiftDateByDays(state.lastStudyDate, 1),
  });

  return { streak: state.streak, consumedFreeze: true };
}

/**
 * Credit a multiplayer DUEL WIN toward the daily streak.
 *
 * The hybrid progression rule (see docs/multiplayer-spec.md): a duel win counts
 * like meeting the daily goal — it advances the streak once per day — while a
 * loss earns XP only. XP itself is awarded server-side on the canonical row and
 * arrives via pullLatest; this only touches the personal, local-first streak
 * state. It deliberately does NOT record an answer, FSRS review, or recompute
 * predicted_score, so the learning engine stays an honest exam-readiness signal.
 *
 * Idempotent per day: if the streak was already advanced today (by study or a
 * prior win), this is a no-op.
 */
export async function creditDuelWin(): Promise<{ streakAdvanced: boolean; newStreak: number }> {
  const state = await getOrCreateUserState();
  const today = todayString();

  if (state.lastStudyDate === today) {
    return { streakAdvanced: false, newStreak: state.streak };
  }

  const { newStreak, consumedFreeze } = computeStreakUpdate(
    state.streak,
    state.lastStudyDate,
    today,
    state.streakFreezes ?? 0
  );
  const { freezesAfter, freezesEarnedTotalDelta, newLastFreezeEarnedAt } = computeFreezeEarned(
    newStreak,
    state.streakFreezes ?? 0,
    state.lastFreezeEarnedAt,
    today
  );

  await db.userState.put({
    ...state,
    streak: newStreak,
    lastStudyDate: today,
    totalStudyDays: state.totalStudyDays + 1,
    streakFreezes: freezesAfter,
    streakFreezesEarnedTotal: (state.streakFreezesEarnedTotal ?? 0) + freezesEarnedTotalDelta,
    lastFreezeAppliedAt: consumedFreeze ? today : state.lastFreezeAppliedAt,
    lastFreezeEarnedAt: newLastFreezeEarnedAt,
  });

  return { streakAdvanced: true, newStreak };
}

/** Shift a YYYY-MM-DD date string by N days. */
function shiftDateByDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function getOrCreateUserState(): Promise<UserState> {
  let state = await db.userState.get(1);
  if (!state) {
    state = { id: 1, xp: 0, level: 0, streak: 0, totalStudyDays: 0 };
    await db.userState.put(state);
  }
  return state;
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getUserState() {
  return getOrCreateUserState();
}

/**
 * Returns streak-at-risk status when:
 *   - streak >= 7
 *   - the daily goal has NOT been met today (questionsAnsweredToday < goal)
 *   - current local time >= 18:00
 *
 * Returns null when not at risk.
 */
export async function getStreakAtRiskStatus(): Promise<{
  atRisk: boolean;
  hoursLeft: number;
  minutesLeft: number;
  hasFreezeAvailable: boolean;
} | null> {
  const state = await getOrCreateUserState();

  if ((state.streak ?? 0) < 7) return null;

  const now = new Date();
  const hour = now.getHours();
  if (hour < 18) return null;

  const today = todayString();

  // At risk only if the daily goal has NOT been met today.
  const goal = state.dailyGoalQuestions ?? DEFAULT_DAILY_GOAL;
  const answeredToday = await questionsAnsweredToday(today);
  if (answeredToday >= goal) return null;

  // Calculate time left until midnight
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const msLeft = midnight.getTime() - now.getTime();
  const totalMinutesLeft = Math.floor(msLeft / 60000);
  const hoursLeft = Math.floor(totalMinutesLeft / 60);
  const minutesLeft = totalMinutesLeft % 60;

  return {
    atRisk: true,
    hoursLeft,
    minutesLeft,
    hasFreezeAvailable: (state.streakFreezes ?? 0) > 0,
  };
}
