/**
 * settings.test.ts
 * Unit tests for /settings page logic.
 *
 * These tests run in Node (no IndexedDB), so they verify the pure functions
 * and data-shape invariants that the settings page relies on.
 */

import { describe, it, expect } from "vitest";
import type { UserState, Flashcard } from "../lib/db";

// ─── 1. Export payload shape ──────────────────────────────────────────────────
// Mirrors the payload assembled by handleExport() in settings/page.tsx.
// Verifies the expected top-level keys are all present.

function buildExportPayload(
  userState: UserState[],
  quizSessions: unknown[],
  reviews: unknown[],
  flashcards: Flashcard[],
  mockExamSessions: unknown[],
  drillSessions: unknown[],
  questionReviews: unknown[],
  bookmarks: unknown[]
) {
  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    userState,
    quizSessions,
    reviews,
    flashcards,
    mockExamSessions,
    drillSessions,
    questionReviews,
    bookmarks,
  };
}

describe("settings export payload", () => {
  it("includes all expected top-level keys", () => {
    const payload = buildExportPayload([], [], [], [], [], [], [], []);
    const keys = Object.keys(payload);
    expect(keys).toContain("exportedAt");
    expect(keys).toContain("version");
    expect(keys).toContain("userState");
    expect(keys).toContain("quizSessions");
    expect(keys).toContain("reviews");
    expect(keys).toContain("flashcards");
    expect(keys).toContain("mockExamSessions");
    expect(keys).toContain("drillSessions");
    expect(keys).toContain("questionReviews");
    expect(keys).toContain("bookmarks");
  });

  it("version is 1", () => {
    const payload = buildExportPayload([], [], [], [], [], [], [], []);
    expect(payload.version).toBe(1);
  });

  it("exportedAt is a valid ISO string", () => {
    const payload = buildExportPayload([], [], [], [], [], [], [], []);
    expect(() => new Date(payload.exportedAt)).not.toThrow();
    expect(new Date(payload.exportedAt).getTime()).toBeGreaterThan(0);
  });

  it("includes userState data when populated", () => {
    const state: UserState = {
      id: 1,
      xp: 500,
      level: 3,
      streak: 7,
      totalStudyDays: 14,
      examDate: "2026-09-01",
      confidencePrompt: "always",
    };
    const payload = buildExportPayload([state], [], [], [], [], [], [], []);
    expect(payload.userState).toHaveLength(1);
    expect(payload.userState[0].xp).toBe(500);
    expect(payload.userState[0].examDate).toBe("2026-09-01");
  });
});

// ─── 2. Reset logic — content tables preserved, user data cleared ─────────────
// Simulates what handleReset() does: clears user tables, resets flashcard FSRS
// state but keeps content fields.

function simulateFlashcardReset(cards: Flashcard[]): Flashcard[] {
  return cards.map((c) => ({
    id: c.id,
    certId: c.certId,
    domainId: c.domainId,
    objectiveId: c.objectiveId,
    front: c.front,
    back: c.back,
    // FSRS fields intentionally omitted
  }));
}

const SAMPLE_CARD_WITH_FSRS: Flashcard = {
  id: "fc-test-01",
  certId: "secplus-sy0-701",
  domainId: "secplus-sy0-701:domain:1",
  objectiveId: "secplus-sy0-701:obj:1.1",
  front: "What is AAA?",
  back: "Authentication, Authorization, Accounting",
  fsrsDue: "2026-06-01T00:00:00.000Z",
  fsrsStability: 3.8,
  fsrsDifficulty: 5.0,
  fsrsElapsedDays: 5,
  fsrsScheduledDays: 10,
  fsrsReps: 3,
  fsrsLapses: 1,
  fsrsState: 2,
  fsrsLastReview: "2026-05-22T00:00:00.000Z",
};

describe("settings reset — flashcard FSRS reset", () => {
  it("resets all FSRS fields to undefined after reset", () => {
    const [reset] = simulateFlashcardReset([SAMPLE_CARD_WITH_FSRS]);
    expect(reset.fsrsDue).toBeUndefined();
    expect(reset.fsrsStability).toBeUndefined();
    expect(reset.fsrsDifficulty).toBeUndefined();
    expect(reset.fsrsElapsedDays).toBeUndefined();
    expect(reset.fsrsScheduledDays).toBeUndefined();
    expect(reset.fsrsReps).toBeUndefined();
    expect(reset.fsrsLapses).toBeUndefined();
    expect(reset.fsrsState).toBeUndefined();
    expect(reset.fsrsLastReview).toBeUndefined();
  });

  it("preserves content fields after reset", () => {
    const [reset] = simulateFlashcardReset([SAMPLE_CARD_WITH_FSRS]);
    expect(reset.id).toBe("fc-test-01");
    expect(reset.certId).toBe("secplus-sy0-701");
    expect(reset.front).toBe("What is AAA?");
    expect(reset.back).toBe("Authentication, Authorization, Accounting");
    expect(reset.domainId).toBe("secplus-sy0-701:domain:1");
    expect(reset.objectiveId).toBe("secplus-sy0-701:obj:1.1");
  });

  it("handles multiple cards independently", () => {
    const cards: Flashcard[] = [
      { ...SAMPLE_CARD_WITH_FSRS, id: "fc-01", fsrsReps: 10 },
      { ...SAMPLE_CARD_WITH_FSRS, id: "fc-02", fsrsReps: 0 },
      {
        id: "fc-03",
        certId: "secplus-sy0-701",
        domainId: "d1",
        objectiveId: "o1",
        front: "Q3",
        back: "A3",
        // No FSRS state — new card
      },
    ];
    const reset = simulateFlashcardReset(cards);
    expect(reset).toHaveLength(3);
    expect(reset[0].fsrsReps).toBeUndefined();
    expect(reset[1].fsrsReps).toBeUndefined();
    expect(reset[2].fsrsReps).toBeUndefined();
    // Content preserved
    expect(reset[0].front).toBe(cards[0].front);
    expect(reset[1].front).toBe(cards[1].front);
    expect(reset[2].back).toBe("A3");
  });
});

// ─── 3. confidencePrompt toggle — UserState update shape ─────────────────────
// Verifies that toggling confidencePrompt writes the right value while
// spreading all other fields (no data loss).

function applyConfidenceToggle(
  state: UserState,
  on: boolean
): UserState {
  return { ...state, confidencePrompt: on ? "always" : "off" };
}

describe("settings confidencePrompt toggle", () => {
  const BASE_STATE: UserState = {
    id: 1,
    xp: 200,
    level: 2,
    streak: 5,
    totalStudyDays: 10,
    examDate: "2026-09-15",
    dailySessionMinutes: 20,
    confidencePrompt: "off",
  };

  it("sets confidencePrompt to 'always' when toggled on", () => {
    const result = applyConfidenceToggle(BASE_STATE, true);
    expect(result.confidencePrompt).toBe("always");
  });

  it("sets confidencePrompt to 'off' when toggled off", () => {
    const on = applyConfidenceToggle(BASE_STATE, true);
    const off = applyConfidenceToggle(on, false);
    expect(off.confidencePrompt).toBe("off");
  });

  it("preserves all other UserState fields when toggling", () => {
    const result = applyConfidenceToggle(BASE_STATE, true);
    expect(result.xp).toBe(200);
    expect(result.level).toBe(2);
    expect(result.streak).toBe(5);
    expect(result.totalStudyDays).toBe(10);
    expect(result.examDate).toBe("2026-09-15");
    expect(result.dailySessionMinutes).toBe(20);
    expect(result.id).toBe(1);
  });
});
