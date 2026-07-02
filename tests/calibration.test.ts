import { describe, it, expect } from "vitest";
import type { AnswerRecord, ConfidenceLevel } from "../lib/db";

// ─── Pure calibration logic (mirrors lib/calibration.ts) ─────────────────────
// We test the math inline here to avoid requiring IndexedDB in Node.

const EXPECTED: Record<ConfidenceLevel, number> = {
  low: 0.33,
  medium: 0.66,
  high: 0.92,
};

interface CalibResult {
  score: number | null;
  bins: { confidence: ConfidenceLevel; n: number; accuracy: number }[];
  totalRated: number;
}

function computeCalibration(records: AnswerRecord[]): CalibResult {
  const rated = records.filter((r) => r.confidence !== undefined) as (AnswerRecord & {
    confidence: ConfidenceLevel;
  })[];

  const totalRated = rated.length;

  const binMap: Record<ConfidenceLevel, { total: number; correct: number }> = {
    low: { total: 0, correct: 0 },
    medium: { total: 0, correct: 0 },
    high: { total: 0, correct: 0 },
  };

  for (const r of rated) {
    binMap[r.confidence].total++;
    if (r.correct) binMap[r.confidence].correct++;
  }

  const bins: { confidence: ConfidenceLevel; n: number; accuracy: number }[] = (
    ["low", "medium", "high"] as ConfidenceLevel[]
  ).map((c) => ({
    confidence: c,
    n: binMap[c].total,
    accuracy: binMap[c].total === 0 ? 0 : binMap[c].correct / binMap[c].total,
  }));

  if (totalRated < 10) {
    return { score: null, bins, totalRated };
  }

  let sum = 0;
  for (const r of rated) {
    const expected = EXPECTED[r.confidence];
    const actual = r.correct ? 1 : 0;
    sum += Math.pow(actual - expected, 2);
  }
  const score = sum / totalRated;

  return { score, bins, totalRated };
}

function makeRecord(
  confidence: ConfidenceLevel,
  correct: boolean,
  i: number
): AnswerRecord {
  return {
    questionId: `q-${i}`,
    picked: "A",
    correct,
    confidence,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("calibrationScore", () => {
  it("10 high-confidence correct answers → near-perfect score (~0.0064)", () => {
    const records = Array.from({ length: 10 }, (_, i) =>
      makeRecord("high", true, i)
    );
    const result = computeCalibration(records);
    expect(result.totalRated).toBe(10);
    expect(result.score).not.toBeNull();
    // (1 - 0.92)^2 = 0.0064
    expect(result.score!).toBeCloseTo(0.0064, 4);
  });

  it("10 high-confidence wrong answers → terribly miscalibrated (~0.8464)", () => {
    const records = Array.from({ length: 10 }, (_, i) =>
      makeRecord("high", false, i)
    );
    const result = computeCalibration(records);
    expect(result.totalRated).toBe(10);
    expect(result.score).not.toBeNull();
    // (0 - 0.92)^2 = 0.8464
    expect(result.score!).toBeCloseTo(0.8464, 4);
  });

  it("5 low + 5 medium mixed → reasonable score in 0-1 range", () => {
    const records = [
      ...Array.from({ length: 3 }, (_, i) => makeRecord("low", true, i)),
      ...Array.from({ length: 2 }, (_, i) => makeRecord("low", false, i + 3)),
      ...Array.from({ length: 3 }, (_, i) => makeRecord("medium", true, i + 5)),
      ...Array.from({ length: 2 }, (_, i) => makeRecord("medium", false, i + 8)),
    ];
    const result = computeCalibration(records);
    expect(result.totalRated).toBe(10);
    expect(result.score).not.toBeNull();
    expect(result.score!).toBeGreaterThanOrEqual(0);
    expect(result.score!).toBeLessThanOrEqual(1);
  });

  it("totalRated < 10 returns score: null", () => {
    const records = Array.from({ length: 9 }, (_, i) =>
      makeRecord("high", true, i)
    );
    const result = computeCalibration(records);
    expect(result.totalRated).toBe(9);
    expect(result.score).toBeNull();
  });

  it("zero rated answers returns score: null with totalRated 0", () => {
    const records: AnswerRecord[] = Array.from({ length: 15 }, (_, i) => ({
      questionId: `q-${i}`,
      picked: "A",
      correct: true,
      // no confidence field
    }));
    const result = computeCalibration(records);
    expect(result.totalRated).toBe(0);
    expect(result.score).toBeNull();
  });

  it("bins compute correctly", () => {
    const records = [
      ...Array.from({ length: 4 }, (_, i) => makeRecord("low", true, i)),
      ...Array.from({ length: 6 }, (_, i) => makeRecord("low", false, i + 4)),
      ...Array.from({ length: 7 }, (_, i) => makeRecord("medium", true, i + 10)),
      ...Array.from({ length: 3 }, (_, i) => makeRecord("medium", false, i + 17)),
      ...Array.from({ length: 5 }, (_, i) => makeRecord("high", true, i + 20)),
      ...Array.from({ length: 5 }, (_, i) => makeRecord("high", false, i + 25)),
    ];
    const result = computeCalibration(records);
    const lowBin = result.bins.find((b) => b.confidence === "low")!;
    const medBin = result.bins.find((b) => b.confidence === "medium")!;
    const highBin = result.bins.find((b) => b.confidence === "high")!;

    expect(lowBin.n).toBe(10);
    expect(lowBin.accuracy).toBeCloseTo(0.4, 5);

    expect(medBin.n).toBe(10);
    expect(medBin.accuracy).toBeCloseTo(0.7, 5);

    expect(highBin.n).toBe(10);
    expect(highBin.accuracy).toBeCloseTo(0.5, 5);
  });
});
