import { db } from "@/lib/db";
import type { ConfidenceLevel } from "@/lib/db";

// Expected accuracy per confidence level (used for Brier score)
const EXPECTED: Record<ConfidenceLevel, number> = {
  low: 0.33,
  medium: 0.66,
  high: 0.92,
};

export interface CalibrationResult {
  score: number | null; // 0-1 Brier-style, null if < 10 rated answers
  bins: { confidence: ConfidenceLevel; n: number; accuracy: number }[];
  totalRated: number;
}

/**
 * Compute calibration over recent quiz sessions.
 * Brier score: mean of (actual - expected)^2 per rated answer.
 * Lower is better. Returns score: null if totalRated < 10.
 */
export async function calibrationScore(opts?: {
  sinceDays?: number;
}): Promise<CalibrationResult> {
  const sinceDays = opts?.sinceDays ?? 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - sinceDays);
  const cutoffIso = cutoff.toISOString();

  const sessions = await db.quizSessions
    .where("startedAt")
    .aboveOrEqual(cutoffIso)
    .toArray();

  // Collect all rated answer records
  const rated: { confidence: ConfidenceLevel; correct: boolean }[] = [];

  for (const session of sessions) {
    if (!session.answerRecords) continue;
    for (const ar of session.answerRecords) {
      if (ar.confidence) {
        rated.push({ confidence: ar.confidence, correct: ar.correct });
      }
    }
  }

  const totalRated = rated.length;

  // Bin data
  const binMap: Record<
    ConfidenceLevel,
    { total: number; correct: number }
  > = {
    low: { total: 0, correct: 0 },
    medium: { total: 0, correct: 0 },
    high: { total: 0, correct: 0 },
  };

  for (const r of rated) {
    binMap[r.confidence].total++;
    if (r.correct) binMap[r.confidence].correct++;
  }

  const bins: { confidence: ConfidenceLevel; n: number; accuracy: number }[] =
    (["low", "medium", "high"] as ConfidenceLevel[]).map((c) => ({
      confidence: c,
      n: binMap[c].total,
      accuracy:
        binMap[c].total === 0 ? 0 : binMap[c].correct / binMap[c].total,
    }));

  if (totalRated < 10) {
    return { score: null, bins, totalRated };
  }

  // Brier score: mean of (actual - expected)^2
  let sum = 0;
  for (const r of rated) {
    const expected = EXPECTED[r.confidence];
    const actual = r.correct ? 1 : 0;
    sum += Math.pow(actual - expected, 2);
  }
  const score = sum / totalRated;

  return { score, bins, totalRated };
}

/** Qualitative label for a calibration score */
export function calibrationLabel(score: number): string {
  if (score < 0.15) return "Great";
  if (score < 0.25) return "Good";
  if (score < 0.4) return "Okay";
  return "Overconfident";
}
