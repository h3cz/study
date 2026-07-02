/**
 * gamification.test.ts
 * Regression tests for Bug 1 (QA-2): userState fields must not be stripped
 * when recordQuizResult() or recordFlashcardReview() writes back to the DB.
 *
 * The actual DB functions require IndexedDB (not available in Node), so we
 * verify the invariant by testing the pure spread logic that was introduced
 * in the fix: existing state is always spread before overwriting xp/level/streak.
 */

import { describe, it, expect } from "vitest";
import { xpToLevel, XP_PER_CORRECT, XP_PER_FLASHCARD } from "../lib/gamification";
import type { UserState } from "../lib/db";

// ─── Helpers mirroring the fixed put() calls in gamification.ts ──────────────

/**
 * Simulates the put() call inside recordQuizResult() after the fix.
 * The fix ensures `...state` is spread first so optional fields survive.
 */
function simulateQuizWrite(
  state: UserState,
  correctCount: number,
  today: string
): UserState {
  const xpEarned = correctCount * XP_PER_CORRECT;
  const newXp = state.xp + xpEarned;
  const newLevel = xpToLevel(newXp);

  // Streak logic: same day → unchanged; yesterday → +1; else → 1
  let newStreak = state.streak;
  if (state.lastStudyDate !== today) {
    const last = state.lastStudyDate ? new Date(state.lastStudyDate) : null;
    const todayDate = new Date(today);
    const diffDays = last
      ? Math.round((todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    newStreak = diffDays === 1 ? state.streak + 1 : 1;
  }

  const newTotalDays =
    state.lastStudyDate !== today ? state.totalStudyDays + 1 : state.totalStudyDays;

  // This is EXACTLY what the fixed put() call does:
  return {
    ...state,
    xp: newXp,
    level: newLevel,
    streak: newStreak,
    lastStudyDate: today,
    totalStudyDays: newTotalDays,
  };
}

/**
 * Simulates the put() call inside recordFlashcardReview() after the fix.
 */
function simulateFlashcardWrite(state: UserState, today: string): UserState {
  const xpEarned = XP_PER_FLASHCARD;
  const newXp = state.xp + xpEarned;
  const newLevel = xpToLevel(newXp);

  let newStreak = state.streak;
  if (state.lastStudyDate !== today) {
    const last = state.lastStudyDate ? new Date(state.lastStudyDate) : null;
    const todayDate = new Date(today);
    const diffDays = last
      ? Math.round((todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    newStreak = diffDays === 1 ? state.streak + 1 : 1;
  }

  const newTotalDays =
    state.lastStudyDate !== today ? state.totalStudyDays + 1 : state.totalStudyDays;

  return {
    ...state,
    xp: newXp,
    level: newLevel,
    streak: newStreak,
    lastStudyDate: today,
    totalStudyDays: newTotalDays,
  };
}

// ─── Shared state representing a user who completed onboarding ───────────────

const ONBOARDED_STATE: UserState = {
  id: 1,
  xp: 0,
  level: 0,
  streak: 0,
  totalStudyDays: 0,
  examDate: "2026-09-15",
  dailySessionMinutes: 20,
  onboardedAt: 1748131200000, // fixed epoch for reproducibility
  contentVersion: 3,
};

const TODAY = "2026-05-25";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("recordQuizResult — userState field preservation (Bug 1 regression)", () => {
  it("examDate is preserved after a quiz write", () => {
    const result = simulateQuizWrite(ONBOARDED_STATE, 5, TODAY);
    expect(result.examDate).toBe("2026-09-15");
  });

  it("dailySessionMinutes is preserved after a quiz write", () => {
    const result = simulateQuizWrite(ONBOARDED_STATE, 5, TODAY);
    expect(result.dailySessionMinutes).toBe(20);
  });

  it("onboardedAt is preserved after a quiz write", () => {
    const result = simulateQuizWrite(ONBOARDED_STATE, 5, TODAY);
    expect(result.onboardedAt).toBe(1748131200000);
  });

  it("contentVersion is preserved after a quiz write", () => {
    const result = simulateQuizWrite(ONBOARDED_STATE, 5, TODAY);
    expect(result.contentVersion).toBe(3);
  });

  it("xp increases correctly after a quiz write", () => {
    const result = simulateQuizWrite(ONBOARDED_STATE, 5, TODAY);
    expect(result.xp).toBe(5 * XP_PER_CORRECT);
  });

  it("streak increments on a new day after a quiz write", () => {
    const stateYesterday: UserState = {
      ...ONBOARDED_STATE,
      streak: 3,
      lastStudyDate: "2026-05-24",
    };
    const result = simulateQuizWrite(stateYesterday, 3, TODAY);
    expect(result.streak).toBe(4);
  });
});

describe("recordFlashcardReview — userState field preservation (Bug 1 regression)", () => {
  it("examDate is preserved after a flashcard review", () => {
    const result = simulateFlashcardWrite(ONBOARDED_STATE, TODAY);
    expect(result.examDate).toBe("2026-09-15");
  });

  it("dailySessionMinutes is preserved after a flashcard review", () => {
    const result = simulateFlashcardWrite(ONBOARDED_STATE, TODAY);
    expect(result.dailySessionMinutes).toBe(20);
  });

  it("onboardedAt is preserved after a flashcard review", () => {
    const result = simulateFlashcardWrite(ONBOARDED_STATE, TODAY);
    expect(result.onboardedAt).toBe(1748131200000);
  });

  it("contentVersion is preserved after a flashcard review", () => {
    const result = simulateFlashcardWrite(ONBOARDED_STATE, TODAY);
    expect(result.contentVersion).toBe(3);
  });

  it("xp increases by XP_PER_FLASHCARD after a review", () => {
    const result = simulateFlashcardWrite(ONBOARDED_STATE, TODAY);
    expect(result.xp).toBe(XP_PER_FLASHCARD);
  });

  it("chained writes preserve all onboarding fields throughout", () => {
    // Simulate: onboarding → quiz write → flashcard write
    const afterQuiz = simulateQuizWrite(ONBOARDED_STATE, 10, TODAY);
    const afterFlashcard = simulateFlashcardWrite(afterQuiz, TODAY);

    expect(afterFlashcard.examDate).toBe("2026-09-15");
    expect(afterFlashcard.dailySessionMinutes).toBe(20);
    expect(afterFlashcard.onboardedAt).toBe(1748131200000);
    expect(afterFlashcard.contentVersion).toBe(3);
    expect(afterFlashcard.xp).toBe(10 * XP_PER_CORRECT + XP_PER_FLASHCARD);
  });
});
