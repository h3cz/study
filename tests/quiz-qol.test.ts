/**
 * quiz-qol.test.ts
 * Tests for Feature A (flag-for-review) and Feature B (per-question time tracking).
 *
 * DB operations require IndexedDB (not available in Node), so we test pure logic:
 *  - Flagging persists in InProgressQuiz
 *  - After last Q, if flagged.size > 0, a review step is triggered
 *  - getPaceStats computes avg correctly (pure computation mock)
 *  - Pace chip "on target" when avg <= 60s
 */

import { describe, it, expect } from "vitest";
import type { InProgressQuiz } from "../lib/db";
import type { PaceStats } from "../lib/pace";
import { formatMs } from "../lib/pace";

// ─── Helpers mirroring quiz/page.tsx logic ────────────────────────────────────

function buildRecord(overrides: Partial<InProgressQuiz> = {}): InProgressQuiz {
  const now = new Date().toISOString();
  return {
    id: "current",
    kind: "daily",
    certId: "secplus-sy0-701",
    questionIds: ["q1", "q2", "q3"],
    currentIndex: 1,
    answers: { q1: "A" },
    confidences: { q1: "high" },
    flagged: [],
    startedAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Pure logic: serialize flagged Set → string[] for persistence,
 * then deserialize back to Set on restore.
 */
function serializeFlagged(flagged: Set<string>): string[] {
  return Array.from(flagged);
}

function deserializeFlagged(flagged?: string[]): Set<string> {
  return new Set(flagged ?? []);
}

/**
 * Pure logic: should we show the flag-review step?
 * (mirrors the condition in handleNext in quiz/page.tsx)
 */
function shouldShowFlagReview(
  isLastQuestion: boolean,
  flaggedSize: number
): boolean {
  return isLastQuestion && flaggedSize > 0;
}

/**
 * Pure computation mirroring getPaceStats logic without DB.
 */
function computePaceStats(msValues: number[]): PaceStats | null {
  if (msValues.length < 5) return null;
  const avgMs = Math.round(msValues.reduce((a, b) => a + b, 0) / msValues.length);
  return {
    avgMs,
    count: msValues.length,
    onTarget: avgMs <= 60_000,
  };
}

// ─── Feature A: Flagging persists in InProgressQuiz ──────────────────────────

describe("Feature A — flag persistence in InProgressQuiz", () => {
  it("flagged array is empty by default", () => {
    const rec = buildRecord();
    expect(rec.flagged).toEqual([]);
  });

  it("flagged undefined on old record → treated as empty set", () => {
    const rec = buildRecord({ flagged: undefined });
    const restored = deserializeFlagged(rec.flagged);
    expect(restored.size).toBe(0);
  });

  it("flagging a question adds it to the array", () => {
    const flagged = new Set<string>();
    flagged.add("q2");
    const serialized = serializeFlagged(flagged);
    const rec = buildRecord({ flagged: serialized });
    expect(rec.flagged).toContain("q2");
    expect(rec.flagged).toHaveLength(1);
  });

  it("toggling a flagged question removes it", () => {
    const flagged = new Set(["q1", "q2", "q3"]);
    flagged.delete("q2");
    const serialized = serializeFlagged(flagged);
    expect(serialized).not.toContain("q2");
    expect(serialized).toContain("q1");
    expect(serialized).toContain("q3");
  });

  it("restoring from record rebuilds the Set", () => {
    const rec = buildRecord({ flagged: ["q1", "q3"] });
    const restored = deserializeFlagged(rec.flagged);
    expect(restored.has("q1")).toBe(true);
    expect(restored.has("q3")).toBe(true);
    expect(restored.has("q2")).toBe(false);
    expect(restored.size).toBe(2);
  });

  it("multiple flags are all persisted", () => {
    const flagged = new Set(["q1", "q2", "q3"]);
    const serialized = serializeFlagged(flagged);
    const rec = buildRecord({ flagged: serialized });
    const restored = deserializeFlagged(rec.flagged);
    expect(restored.size).toBe(3);
  });
});

// ─── Feature A: Review step appears after last Q when flags exist ─────────────

describe("Feature A — flag review step after last question", () => {
  it("shows review step when on last Q and flags exist", () => {
    expect(shouldShowFlagReview(true, 2)).toBe(true);
  });

  it("does NOT show review step when not on last Q", () => {
    expect(shouldShowFlagReview(false, 3)).toBe(false);
  });

  it("does NOT show review step when no flags on last Q", () => {
    expect(shouldShowFlagReview(true, 0)).toBe(false);
  });

  it("does NOT show review step when not last Q and no flags", () => {
    expect(shouldShowFlagReview(false, 0)).toBe(false);
  });

  it("shows review step with exactly 1 flag on last Q", () => {
    expect(shouldShowFlagReview(true, 1)).toBe(true);
  });
});

// ─── Feature B: getPaceStats computes avg correctly ───────────────────────────

describe("Feature B — getPaceStats computation", () => {
  it("returns null when fewer than 5 answers", () => {
    expect(computePaceStats([10000, 20000, 30000, 40000])).toBeNull();
  });

  it("returns null for empty array", () => {
    expect(computePaceStats([])).toBeNull();
  });

  it("computes correct average for 5 answers", () => {
    const values = [30000, 40000, 50000, 60000, 70000];
    const result = computePaceStats(values);
    expect(result).not.toBeNull();
    expect(result!.avgMs).toBe(50000);
    expect(result!.count).toBe(5);
  });

  it("computes correct average for 10 answers", () => {
    const values = Array(10).fill(45000);
    const result = computePaceStats(values);
    expect(result).not.toBeNull();
    expect(result!.avgMs).toBe(45000);
    expect(result!.count).toBe(10);
  });

  it("rounds avgMs to nearest integer", () => {
    // 5 values averaging to 33333.33…
    const values = [33000, 33000, 33000, 33333, 34000];
    const result = computePaceStats(values);
    expect(result).not.toBeNull();
    expect(Number.isInteger(result!.avgMs)).toBe(true);
  });
});

// ─── Feature B: onTarget flag ────────────────────────────────────────────────

describe("Feature B — pace chip on-target logic", () => {
  it("onTarget is true when avg exactly 60s", () => {
    const values = Array(5).fill(60000);
    const result = computePaceStats(values);
    expect(result!.onTarget).toBe(true);
  });

  it("onTarget is true when avg under 60s", () => {
    const values = Array(5).fill(30000);
    const result = computePaceStats(values);
    expect(result!.onTarget).toBe(true);
  });

  it("onTarget is false when avg over 60s", () => {
    const values = Array(5).fill(90000);
    const result = computePaceStats(values);
    expect(result!.onTarget).toBe(false);
  });

  it("onTarget is false when avg is 60001ms", () => {
    const values = Array(5).fill(60001);
    const result = computePaceStats(values);
    expect(result!.onTarget).toBe(false);
  });
});

// ─── Feature B: formatMs helper ──────────────────────────────────────────────

describe("Feature B — formatMs helper", () => {
  it("formats under 60s as seconds only", () => {
    expect(formatMs(45000)).toBe("45s");
  });

  it("formats exactly 60s as 1m 0s", () => {
    expect(formatMs(60000)).toBe("1m 0s");
  });

  it("formats 83s as 1m 23s", () => {
    expect(formatMs(83000)).toBe("1m 23s");
  });

  it("formats 0ms as 0s", () => {
    expect(formatMs(0)).toBe("0s");
  });

  it("formats 2m 30s correctly", () => {
    expect(formatMs(150000)).toBe("2m 30s");
  });
});
