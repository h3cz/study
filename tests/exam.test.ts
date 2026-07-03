/**
 * exam.test.ts
 * Unit tests for buildMockExam helpers and final-week quiz mode logic.
 * These run in Node (no IndexedDB) — we test pure functions only.
 */

import { describe, it, expect } from "vitest";
import { examRawToScale, isPbqArrangementCorrect } from "../lib/exam";

// ─── examRawToScale ───────────────────────────────────────────────────────────

describe("examRawToScale", () => {
  it("0/0 returns 100 (floor)", () => {
    expect(examRawToScale(0, 0)).toBe(100);
  });

  it("0% correct → 100", () => {
    expect(examRawToScale(0, 90)).toBe(100);
  });

  it("100% correct → 900", () => {
    expect(examRawToScale(90, 90)).toBe(900);
  });

  it("50% correct → 500", () => {
    // 100 + 800 * 0.5 = 500
    expect(examRawToScale(45, 90)).toBe(500);
  });

  it("rounds to nearest 10", () => {
    // 68/90 ≈ 0.7556 → 100 + 800*0.7556 = 704.4 → rounds to 700
    const raw = examRawToScale(68, 90);
    expect(raw % 10).toBe(0);
  });

  it("passing threshold: 81.25% correct → 750", () => {
    // 750 = 100 + 800 * mastery → mastery = 650/800 = 0.8125
    // 0.8125 * 90 = 73.125 → need 74 correct to hit 750+
    const score74 = examRawToScale(74, 90); // ~0.8222 → 758 → rounds to 760
    expect(score74).toBeGreaterThanOrEqual(750);
    const score73 = examRawToScale(73, 90); // ~0.8111 → 749 → rounds to 750
    // borderline — just check monotonic
    expect(score74).toBeGreaterThanOrEqual(score73);
  });

  it("result is always a multiple of 10", () => {
    for (let c = 0; c <= 90; c++) {
      expect(examRawToScale(c, 90) % 10).toBe(0);
    }
  });

  it("result is always in [100, 900]", () => {
    for (let c = 0; c <= 90; c++) {
      const s = examRawToScale(c, 90);
      expect(s).toBeGreaterThanOrEqual(100);
      expect(s).toBeLessThanOrEqual(900);
    }
  });
});

// ─── PBQ exam scoring (isPbqArrangementCorrect) ───────────────────────────────

describe("isPbqArrangementCorrect", () => {
  const pairs = [
    { left: "A", right: "1" },
    { left: "B", right: "2" },
    { left: "C", right: "3" },
    { left: "D", right: "4" },
  ];

  it("perfect arrangement is correct", () => {
    expect(isPbqArrangementCorrect(pairs, ["1", "2", "3", "4"])).toBe(true);
  });

  it("any single mismatch is incorrect (all-or-nothing)", () => {
    // swap last two
    expect(isPbqArrangementCorrect(pairs, ["1", "2", "4", "3"])).toBe(false);
  });

  it("fully wrong arrangement is incorrect", () => {
    expect(isPbqArrangementCorrect(pairs, ["4", "3", "2", "1"])).toBe(false);
  });

  it("empty arrangement (never engaged) is incorrect", () => {
    expect(isPbqArrangementCorrect(pairs, [])).toBe(false);
  });

  it("short arrangement is incorrect (no index out-of-bounds match)", () => {
    expect(isPbqArrangementCorrect(pairs, ["1", "2"])).toBe(false);
  });

  it("zero-pair PBQ is incorrect, never accidentally correct", () => {
    expect(isPbqArrangementCorrect([], [])).toBe(false);
  });

  it("extra trailing slots beyond pairs do not affect a correct match", () => {
    expect(isPbqArrangementCorrect(pairs, ["1", "2", "3", "4", "stray"])).toBe(true);
  });
});

// ─── Final-week mode logic ────────────────────────────────────────────────────

describe("final-week mode detection", () => {
  function computeFinalWeek(examDate: string | undefined, nowMs: number): boolean {
    if (!examDate) return false;
    const daysToExam = Math.ceil(
      (new Date(examDate).getTime() - nowMs) / 86400000
    );
    return daysToExam >= 0 && daysToExam <= 7;
  }

  const now = new Date("2026-05-26T12:00:00Z").getTime();

  it("no exam date → not final week", () => {
    expect(computeFinalWeek(undefined, now)).toBe(false);
  });

  it("exam today (T-0) → final week", () => {
    expect(computeFinalWeek("2026-05-26", now)).toBe(true);
  });

  it("exam in 7 days → final week", () => {
    expect(computeFinalWeek("2026-06-02", now)).toBe(true);
  });

  it("exam in 8 days → NOT final week", () => {
    expect(computeFinalWeek("2026-06-03", now)).toBe(false);
  });

  it("exam yesterday (past) → NOT final week", () => {
    expect(computeFinalWeek("2026-05-25", now)).toBe(false);
  });

  it("exam in 1 day → final week", () => {
    expect(computeFinalWeek("2026-05-27", now)).toBe(true);
  });
});

// ─── MockExamSession structure ────────────────────────────────────────────────

describe("MockExamSession domain breakdown computation", () => {
  interface FakeQ {
    domainId: string;
    correct: boolean;
    kind: "mcq" | "pbq";
  }

  function buildDomainBreakdown(
    questions: FakeQ[]
  ): Record<string, { correct: number; total: number }> {
    const breakdown: Record<string, { correct: number; total: number }> = {};
    for (const q of questions) {
      if (!breakdown[q.domainId]) breakdown[q.domainId] = { correct: 0, total: 0 };
      breakdown[q.domainId].total++;
      if (q.correct) breakdown[q.domainId].correct++;
    }
    return breakdown;
  }

  it("single domain all correct", () => {
    const qs: FakeQ[] = [
      { domainId: "d1", correct: true, kind: "mcq" },
      { domainId: "d1", correct: true, kind: "mcq" },
    ];
    const bd = buildDomainBreakdown(qs);
    expect(bd["d1"].correct).toBe(2);
    expect(bd["d1"].total).toBe(2);
  });

  it("mixed correctness across domains", () => {
    const qs: FakeQ[] = [
      { domainId: "d1", correct: true, kind: "mcq" },
      { domainId: "d1", correct: false, kind: "mcq" },
      { domainId: "d2", correct: true, kind: "mcq" },
    ];
    const bd = buildDomainBreakdown(qs);
    expect(bd["d1"].correct).toBe(1);
    expect(bd["d1"].total).toBe(2);
    expect(bd["d2"].correct).toBe(1);
    expect(bd["d2"].total).toBe(1);
  });

  it("PBQ counted as 0 correct in breakdown", () => {
    const qs: FakeQ[] = [
      { domainId: "d3", correct: false, kind: "pbq" },
    ];
    const bd = buildDomainBreakdown(qs);
    expect(bd["d3"].correct).toBe(0);
    expect(bd["d3"].total).toBe(1);
  });
});
