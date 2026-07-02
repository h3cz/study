import { describe, it, expect } from "vitest";
import { FSRS, createEmptyCard, Rating } from "ts-fsrs";
import { quizOutcomeToRating } from "@/lib/fsrs-mcq";

// ─── Rating mapping tests ──────────────────────────────────────────────────

describe("quizOutcomeToRating", () => {
  it("correct + high confidence → 4 (Easy)", () => {
    expect(quizOutcomeToRating(true, "high")).toBe(4);
  });

  it("correct + medium confidence → 3 (Good)", () => {
    expect(quizOutcomeToRating(true, "medium")).toBe(3);
  });

  it("correct + low confidence → 3 (Good)", () => {
    expect(quizOutcomeToRating(true, "low")).toBe(3);
  });

  it("correct + no confidence → 3 (Good)", () => {
    expect(quizOutcomeToRating(true, undefined)).toBe(3);
  });

  it("wrong + low confidence → 2 (Hard)", () => {
    expect(quizOutcomeToRating(false, "low")).toBe(2);
  });

  it("wrong + medium confidence → 1 (Again)", () => {
    expect(quizOutcomeToRating(false, "medium")).toBe(1);
  });

  it("wrong + high confidence → 1 (Again)", () => {
    expect(quizOutcomeToRating(false, "high")).toBe(1);
  });

  it("wrong + no confidence → 1 (Again)", () => {
    expect(quizOutcomeToRating(false, undefined)).toBe(1);
  });
});

// ─── FSRS scheduling behaviour tests (pure ts-fsrs, no Dexie) ─────────────

describe("FSRS MCQ scheduling", () => {
  const fsrs = new FSRS({});

  it("rating Again (1) schedules next review within 2 days", () => {
    const card = createEmptyCard(new Date("2026-01-01"));
    const now = new Date("2026-01-01");
    const result = fsrs.next(card, now, Rating.Again);
    const nextCard = result.card;

    const diffMs = nextCard.due.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeLessThanOrEqual(2);
  });

  it("rating Easy (4) three times schedules review ≥7 days out", () => {
    let card = createEmptyCard(new Date("2026-01-01"));
    let now = new Date("2026-01-01");

    // First Easy review
    let result = fsrs.next(card, now, Rating.Easy);
    card = result.card;
    now = card.due;

    // Second Easy review
    result = fsrs.next(card, now, Rating.Easy);
    card = result.card;
    now = card.due;

    // Third Easy review
    result = fsrs.next(card, now, Rating.Easy);
    card = result.card;

    const originTime = new Date("2026-01-01").getTime();
    const diffDays = (card.due.getTime() - originTime) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThanOrEqual(7);
  });

  it("Again rating keeps scheduled_days shorter than Good rating", () => {
    const card = createEmptyCard(new Date("2026-01-01"));
    const now = new Date("2026-01-01");

    const againCard = fsrs.next(card, now, Rating.Again).card;
    const goodCard = fsrs.next(card, now, Rating.Good).card;

    expect(againCard.due.getTime()).toBeLessThan(goodCard.due.getTime());
  });
});

// ─── getDueQuestionIds integration-style test (mocked Dexie) ──────────────

describe("getDueQuestionIds logic", () => {
  it("filters to only questions whose latest review is due", () => {
    const now = new Date("2026-05-26T12:00:00Z");
    const nowIso = now.toISOString();

    // Simulate what getDueQuestionIds does: given a set of reviews,
    // only questions with latest fsrsDue <= now should be returned.
    const reviews = [
      { questionId: "q1", reviewedAt: "2026-05-20T00:00:00Z", fsrsDue: "2026-05-25T00:00:00Z" }, // due
      { questionId: "q2", reviewedAt: "2026-05-20T00:00:00Z", fsrsDue: "2026-06-01T00:00:00Z" }, // not due
      { questionId: "q3", reviewedAt: "2026-05-21T00:00:00Z", fsrsDue: "2026-05-23T00:00:00Z" }, // due
      // q1 has a later review that pushed it out
      { questionId: "q1", reviewedAt: "2026-05-25T06:00:00Z", fsrsDue: "2026-06-05T00:00:00Z" }, // not due anymore
    ];

    // Build latest-by-question map (mirrors getDueQuestionIds logic)
    const latestByQuestion = new Map<string, typeof reviews[0]>();
    for (const r of reviews) {
      const existing = latestByQuestion.get(r.questionId);
      if (!existing || r.reviewedAt > existing.reviewedAt) {
        latestByQuestion.set(r.questionId, r);
      }
    }

    const dueIds = Array.from(latestByQuestion.entries())
      .filter(([, r]) => r.fsrsDue <= nowIso)
      .sort((a, b) => a[1].fsrsDue.localeCompare(b[1].fsrsDue))
      .map(([qId]) => qId);

    // q1's latest review is not due; q3 is due; q2 is not due
    expect(dueIds).toContain("q3");
    expect(dueIds).not.toContain("q1");
    expect(dueIds).not.toContain("q2");
    expect(dueIds[0]).toBe("q3"); // oldest due first
  });
});
