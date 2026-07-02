import { db } from "@/lib/db";

export interface HeatmapDay {
  date: string;         // YYYY-MM-DD
  level: 0 | 1 | 2 | 3 | 4; // intensity (0 = nothing, 4 = heavy study)
  count: number;        // total sessions that day (quiz + flashcard + drill + pbq + exam)
}

function countToLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

/** Returns the YYYY-MM-DD string for a date offset by `offsetDays` from today. */
function dateKeyOffset(offsetDays: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns one HeatmapDay for each of the last `days` calendar days (oldest first).
 * Days with no activity have level 0 and count 0.
 * Pulls from quizSessions, reviews (flashcards), drillSessions, and mockExamSessions.
 */
export async function getStreakHeatmap(days = 90): Promise<HeatmapDay[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  cutoff.setHours(0, 0, 0, 0);
  const cutoffIso = cutoff.toISOString();
  const cutoffKey = cutoffIso.slice(0, 10);

  // Count sessions per calendar day
  const countByDay = new Map<string, number>();

  // quizSessions (completedAt)
  const quizSessions = await db.quizSessions
    .filter((s) => !!s.completedAt && s.completedAt >= cutoffIso)
    .toArray();
  for (const s of quizSessions) {
    if (!s.completedAt) continue;
    const key = toDateKey(s.completedAt);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  // reviews (flashcards, reviewedAt)
  const reviews = await db.reviews
    .filter((r) => r.reviewedAt >= cutoffIso)
    .toArray();
  for (const r of reviews) {
    const key = toDateKey(r.reviewedAt);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  // drillSessions (completedAt)
  const drillSessions = await db.drillSessions
    .filter((s) => s.completedAt >= cutoffIso)
    .toArray();
  for (const s of drillSessions) {
    const key = toDateKey(s.completedAt);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  // mockExamSessions (completedAt)
  const mockExams = await db.mockExamSessions
    .filter((s) => !!s.completedAt && s.completedAt >= cutoffIso)
    .toArray();
  for (const s of mockExams) {
    if (!s.completedAt) continue;
    const key = toDateKey(s.completedAt);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  // Build continuous 90-day grid (oldest first)
  const result: HeatmapDay[] = [];
  for (let i = -(days - 1); i <= 0; i++) {
    const key = dateKeyOffset(i);
    if (key < cutoffKey) continue;
    const count = countByDay.get(key) ?? 0;
    result.push({ date: key, level: countToLevel(count), count });
  }

  return result;
}
