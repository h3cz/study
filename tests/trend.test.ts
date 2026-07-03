import { describe, it, expect } from "vitest";
import { fillGaps, trendDirection } from "../lib/trend";
import type { DailyTrend } from "../lib/trend";

// ─── fillGaps ────────────────────────────────────────────────────────────────

describe("fillGaps", () => {
  it("returns all-null array for empty trend", () => {
    const result = fillGaps([], 30);
    expect(result).toHaveLength(30);
    expect(result.every((x) => x === null)).toBe(true);
  });

  it("handles a single session day — 1 non-null entry", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.toISOString().slice(0, 10);
    const trend: DailyTrend[] = [
      { date: todayKey, avgScore: 75, sessions: 1 },
    ];
    const result = fillGaps(trend, 30);
    expect(result).toHaveLength(30);
    const nonNull = result.filter((x) => x !== null);
    expect(nonNull).toHaveLength(1);
    expect(nonNull[0]?.avgScore).toBe(75);
  });

  it("correctly places today at the last slot", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = today.toISOString().slice(0, 10);
    const trend: DailyTrend[] = [{ date: todayKey, avgScore: 88, sessions: 2 }];
    const result = fillGaps(trend, 30);
    // last element should be today's entry
    expect(result[29]).not.toBeNull();
    expect(result[29]?.date).toBe(todayKey);
  });

  it("handles gap in middle — only days with sessions are non-null", () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    function keyOffset(offset: number): string {
      const d = new Date(today);
      d.setDate(d.getDate() - offset);
      return d.toISOString().slice(0, 10);
    }

    // Sessions on days: today, today-2, today-4 (gaps at today-1, today-3)
    const trend: DailyTrend[] = [
      { date: keyOffset(4), avgScore: 60, sessions: 1 },
      { date: keyOffset(2), avgScore: 70, sessions: 1 },
      { date: keyOffset(0), avgScore: 80, sessions: 1 },
    ];

    const result = fillGaps(trend, 30);
    expect(result).toHaveLength(30);
    const nonNull = result.filter((x) => x !== null);
    expect(nonNull).toHaveLength(3);

    // Gap days should still be null
    const idx1DayAgo = 30 - 1 - 1; // index for today-1
    expect(result[idx1DayAgo]).toBeNull();
    const idx3DaysAgo = 30 - 1 - 3;
    expect(result[idx3DaysAgo]).toBeNull();
  });
});

// ─── getDailyTrend logic (pure math — no DB) ─────────────────────────────────

describe("trend aggregation (pure logic)", () => {
  it("3 sessions same day produce 1 trend point with correct avg", () => {
    // Simulate the grouping logic from getDailyTrend
    const sessions = [
      { score: 60, completedAt: "2026-05-20T10:00:00Z" },
      { score: 80, completedAt: "2026-05-20T14:00:00Z" },
      { score: 70, completedAt: "2026-05-20T18:00:00Z" },
    ];

    const byDay = new Map<string, { totalScore: number; count: number }>();
    for (const s of sessions) {
      const key = s.completedAt.slice(0, 10);
      const existing = byDay.get(key);
      if (existing) {
        existing.totalScore += s.score;
        existing.count++;
      } else {
        byDay.set(key, { totalScore: s.score, count: 1 });
      }
    }

    expect(byDay.size).toBe(1);
    const entry = byDay.get("2026-05-20")!;
    expect(entry.count).toBe(3);
    expect(Math.round(entry.totalScore / entry.count)).toBe(70);
  });

  it("sessions on different days produce separate entries", () => {
    const sessions = [
      { score: 50, completedAt: "2026-05-18T10:00:00Z" },
      { score: 90, completedAt: "2026-05-20T10:00:00Z" },
      { score: 70, completedAt: "2026-05-22T10:00:00Z" },
    ];

    const byDay = new Map<string, { totalScore: number; count: number }>();
    for (const s of sessions) {
      const key = s.completedAt.slice(0, 10);
      const existing = byDay.get(key);
      if (existing) {
        existing.totalScore += s.score;
        existing.count++;
      } else {
        byDay.set(key, { totalScore: s.score, count: 1 });
      }
    }

    expect(byDay.size).toBe(3);
    expect(byDay.get("2026-05-18")?.count).toBe(1);
    expect(byDay.get("2026-05-20")?.count).toBe(1);
    expect(byDay.get("2026-05-22")?.count).toBe(1);
  });
});

// ─── trendDirection ──────────────────────────────────────────────────────────

describe("trendDirection", () => {
  it("returns 'steady' for fewer than 3 data points", () => {
    expect(trendDirection([])).toBe("steady");
    expect(trendDirection([{ date: "2026-05-01", avgScore: 70, sessions: 1 }])).toBe("steady");
    expect(
      trendDirection([
        { date: "2026-05-01", avgScore: 70, sessions: 1 },
        { date: "2026-05-02", avgScore: 75, sessions: 1 },
      ])
    ).toBe("steady");
  });

  it("detects improving trend from clearly rising series", () => {
    const trend: DailyTrend[] = [
      { date: "2026-05-01", avgScore: 40, sessions: 1 },
      { date: "2026-05-02", avgScore: 55, sessions: 1 },
      { date: "2026-05-03", avgScore: 70, sessions: 1 },
      { date: "2026-05-04", avgScore: 80, sessions: 1 },
      { date: "2026-05-05", avgScore: 90, sessions: 1 },
    ];
    expect(trendDirection(trend)).toBe("improving");
  });

  it("detects declining trend from clearly falling series", () => {
    const trend: DailyTrend[] = [
      { date: "2026-05-01", avgScore: 90, sessions: 1 },
      { date: "2026-05-02", avgScore: 75, sessions: 1 },
      { date: "2026-05-03", avgScore: 60, sessions: 1 },
      { date: "2026-05-04", avgScore: 45, sessions: 1 },
      { date: "2026-05-05", avgScore: 30, sessions: 1 },
    ];
    expect(trendDirection(trend)).toBe("declining");
  });

  it("detects steady trend from flat series", () => {
    const trend: DailyTrend[] = [
      { date: "2026-05-01", avgScore: 70, sessions: 1 },
      { date: "2026-05-02", avgScore: 71, sessions: 1 },
      { date: "2026-05-03", avgScore: 69, sessions: 1 },
      { date: "2026-05-04", avgScore: 70, sessions: 1 },
      { date: "2026-05-05", avgScore: 72, sessions: 1 },
    ];
    expect(trendDirection(trend)).toBe("steady");
  });
});
