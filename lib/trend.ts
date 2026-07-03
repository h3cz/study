import { db } from "@/lib/db";

export interface DailyTrend {
  date: string;      // YYYY-MM-DD
  avgScore: number;  // 0-100 average correctPct across all quiz sessions that day
  sessions: number;  // count of sessions that day
}

/** YYYY-MM-DD from an ISO date string or Date */
function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

/** Add `n` days to a YYYY-MM-DD string and return a new YYYY-MM-DD string */
function addDays(dateKey: string, n: number): string {
  const d = new Date(dateKey + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Returns one entry per calendar day for the last `days` days that had at
 * least one completed quiz session. Days with no sessions are omitted.
 * Sorted ascending by date.
 */
export async function getDailyTrend(days = 30): Promise<DailyTrend[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  const cutoffIso = cutoff.toISOString();

  const sessions = await db.quizSessions
    .filter((s) => !!s.completedAt && s.completedAt >= cutoffIso)
    .toArray();

  // Group by calendar day
  const byDay = new Map<string, { totalScore: number; count: number }>();
  for (const s of sessions) {
    if (!s.completedAt) continue;
    const key = toDateKey(s.completedAt);
    const existing = byDay.get(key);
    if (existing) {
      existing.totalScore += s.score;
      existing.count++;
    } else {
      byDay.set(key, { totalScore: s.score, count: 1 });
    }
  }

  const result: DailyTrend[] = [];
  for (const [date, { totalScore, count }] of byDay.entries()) {
    result.push({
      date,
      avgScore: Math.round(totalScore / count),
      sessions: count,
    });
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

/** Fill in gaps in a trend series with null so the SVG can skip them */
export function fillGaps(
  trend: DailyTrend[],
  days = 30
): Array<DailyTrend | null> {
  if (trend.length === 0) return new Array(days).fill(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (days - 1));
  const startKey = startDate.toISOString().slice(0, 10);

  const byDay = new Map(trend.map((t) => [t.date, t]));
  const filled: Array<DailyTrend | null> = [];

  for (let i = 0; i < days; i++) {
    const key = addDays(startKey, i);
    filled.push(byDay.get(key) ?? null);
  }

  return filled;
}

export type TrendDirection = "improving" | "declining" | "steady";

/**
 * Linear regression slope over the avgScore series.
 * Returns "steady" when fewer than 3 data points exist.
 */
export function trendDirection(trend: DailyTrend[]): TrendDirection {
  if (trend.length < 3) return "steady";

  const n = trend.length;
  const xs = trend.map((_, i) => i);
  const ys = trend.map((t) => t.avgScore);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0);
  const sumX2 = xs.reduce((acc, x) => acc + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  if (slope > 0.5) return "improving";
  if (slope < -0.5) return "declining";
  return "steady";
}
