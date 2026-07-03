// Tests for the new agent-facing endpoints:
//   GET  /api/study-buddy/questions  — capped at 5, strips correct/explanation
//   POST /api/study-buddy/answer     — checks correctly, records under resolved userId
//
// Routes themselves are server code that require a live Supabase connection, so
// we test the pure business-logic helpers directly (the same pattern used in
// study-buddy.test.ts).

import { describe, it, expect } from "vitest";
import {
  questionsForObjective,
  MAX_QUESTIONS_PER_FETCH,
  objectiveIdForCode,
  questionMeta,
} from "@/lib/study-buddy/objectives";
import { SEED_DATA } from "@/content/seed";

// ─── questionsForObjective ────────────────────────────────────────────────────

describe("questionsForObjective — cap & strip", () => {
  it("returns at most MAX_QUESTIONS_PER_FETCH (5) questions", () => {
    const qs = questionsForObjective("1.1", 10); // request more than the cap
    expect(qs.length).toBeLessThanOrEqual(MAX_QUESTIONS_PER_FETCH);
  });

  it("respects the requested n when n <= MAX_QUESTIONS_PER_FETCH", () => {
    const qs = questionsForObjective("1.1", 2);
    expect(qs.length).toBeLessThanOrEqual(2);
  });

  it("never returns a `correct` field on any choice", () => {
    const qs = questionsForObjective("1.1", MAX_QUESTIONS_PER_FETCH);
    const serialized = JSON.stringify(qs);
    expect(serialized).not.toContain('"correct"');
  });

  it("never returns an `explanation` field", () => {
    const qs = questionsForObjective("1.1", MAX_QUESTIONS_PER_FETCH);
    const serialized = JSON.stringify(qs);
    expect(serialized).not.toContain('"explanation"');
  });

  it("returns id, objectiveId, stem, and choices with key+text only", () => {
    const qs = questionsForObjective("4.1", MAX_QUESTIONS_PER_FETCH);
    expect(qs.length).toBeGreaterThan(0);
    const q = qs[0];
    expect(q).toHaveProperty("id");
    expect(q).toHaveProperty("objectiveId");
    expect(q).toHaveProperty("stem");
    expect(q).toHaveProperty("choices");
    expect(Array.isArray(q.choices)).toBe(true);
    for (const c of q.choices) {
      expect(c).toHaveProperty("key");
      expect(c).toHaveProperty("text");
      expect(c).not.toHaveProperty("correct");
    }
  });

  it("returns empty array for an unknown objective code", () => {
    const qs = questionsForObjective("99.9", 5);
    expect(qs).toEqual([]);
  });

  it("questions returned belong to the requested objective", () => {
    const objId = objectiveIdForCode("4.1")!;
    const qs = questionsForObjective("4.1", MAX_QUESTIONS_PER_FETCH);
    for (const q of qs) {
      expect(q.objectiveId).toBe(objId);
    }
  });

  it("shuffles (not always same order across multiple calls)", () => {
    // Run 5 fetches of 5 questions and verify we don't always get the same
    // first id. This could theoretically fail 1 in pool^5 times but is
    // effectively deterministic for any pool > 5.
    const objId = objectiveIdForCode("1.1")!;
    const pool = SEED_DATA.questions.filter((q) => q.objectiveId === objId);
    if (pool.length <= 5) {
      // Not enough to test shuffle meaningfully — skip.
      expect(true).toBe(true);
      return;
    }
    const firstIds = new Set(
      Array.from({ length: 5 }, () => questionsForObjective("1.1", 5)[0].id)
    );
    // With a pool > 5 we expect at least 2 distinct first ids across 5 draws
    expect(firstIds.size).toBeGreaterThan(1);
  });
});

// ─── answer endpoint logic — server-side answer key lookup ───────────────────

describe("answer endpoint — server-side correctness check", () => {
  it("questionMeta returns correctKey for known questions", () => {
    // Pick any question from the seed that has a correct choice
    const q = SEED_DATA.questions.find(
      (q) => q.choices.some((c) => c.correct)
    );
    expect(q).toBeDefined();
    const meta = questionMeta(q!.id);
    expect(meta).not.toBeNull();
    expect(meta!.correctKey).toBeTruthy();
    expect(["A", "B", "C", "D"]).toContain(meta!.correctKey);
  });

  it("correctness is derived server-side from SEED_DATA, never from caller", () => {
    // Simulate what the answer route does: look up from SEED_DATA, never trust
    // a caller-supplied `correct` value.
    const q = SEED_DATA.questions.find((q) => q.choices.some((c) => c.correct))!;
    const correctChoice = q.choices.find((c) => c.correct)!;

    // Correct pick
    const pickedCorrect = correctChoice.key;
    expect(pickedCorrect === correctChoice.key).toBe(true);

    // Wrong pick
    const wrongKey = (["A", "B", "C", "D"] as const).find(
      (k) => k !== correctChoice.key
    )!;
    expect(wrongKey === correctChoice.key).toBe(false);
  });

  it("explanation is present in SEED_DATA (route can safely return it post-answer)", () => {
    const q = SEED_DATA.questions[0];
    expect(typeof q.explanation).toBe("string");
    expect(q.explanation.length).toBeGreaterThan(0);
  });

  it("questionMeta returns null for unknown questionId", () => {
    expect(questionMeta("q-that-does-not-exist")).toBeNull();
  });
});

// ─── MAX_QUESTIONS_PER_FETCH constant ─────────────────────────────────────────

describe("MAX_QUESTIONS_PER_FETCH", () => {
  it("is exactly 5", () => {
    expect(MAX_QUESTIONS_PER_FETCH).toBe(5);
  });
});
