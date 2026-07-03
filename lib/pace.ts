import { db } from "@/lib/db";

const TARGET_MS = 60_000; // 90 min / 90 Q = 60s/Q

export interface PaceStats {
  avgMs: number;    // average msSpent across all answers in window
  count: number;    // # of answers in window
  onTarget: boolean; // avgMs <= 60000
}

/**
 * Computes pace stats from the user's own answer records.
 * Returns null if fewer than 5 answers exist in the window.
 *
 * @param opts.sinceDays - look back this many days (default: no limit)
 */
export async function getPaceStats(
  opts?: { sinceDays?: number }
): Promise<PaceStats | null> {
  const sessions = await db.quizSessions.toArray();

  const cutoff = opts?.sinceDays
    ? Date.now() - opts.sinceDays * 24 * 60 * 60 * 1000
    : 0;

  const msValues: number[] = [];

  for (const session of sessions) {
    if (cutoff > 0 && session.startedAt) {
      const sessionMs = new Date(session.startedAt).getTime();
      if (sessionMs < cutoff) continue;
    }
    if (!session.answerRecords) continue;
    for (const record of session.answerRecords) {
      if (typeof record.msSpent === "number" && record.msSpent > 0) {
        msValues.push(record.msSpent);
      }
    }
  }

  if (msValues.length < 5) return null;

  const avgMs = Math.round(msValues.reduce((a, b) => a + b, 0) / msValues.length);

  return {
    avgMs,
    count: msValues.length,
    onTarget: avgMs <= TARGET_MS,
  };
}

/**
 * Computes per-question bank avg from the user's own historical answers.
 * Returns null if the question has only been answered once.
 */
export async function getQuestionBankAvgMs(questionId: string): Promise<number | null> {
  const sessions = await db.quizSessions.toArray();

  const msValues: number[] = [];
  for (const session of sessions) {
    if (!session.answerRecords) continue;
    for (const record of session.answerRecords) {
      if (record.questionId === questionId && typeof record.msSpent === "number" && record.msSpent > 0) {
        msValues.push(record.msSpent);
      }
    }
  }

  if (msValues.length <= 1) return null;
  return Math.round(msValues.reduce((a, b) => a + b, 0) / msValues.length);
}

export function formatMs(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
