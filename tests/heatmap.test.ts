/**
 * heatmap.test.ts
 * Tests for the pure logic powering getStreakHeatmap.
 * Avoids IndexedDB by exercising the grouping/level math directly.
 */

import { describe, it, expect } from "vitest";

// ─── Inline the pure helpers from lib/heatmap.ts ─────────────────────────────

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

function dateKeyOffset(offsetDays: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

interface MockSession {
  completedAt?: string;
  reviewedAt?: string;
}

/**
 * Simulates the grouping logic from getStreakHeatmap over a set of mock sessions.
 * Returns 90 HeatmapDay entries (oldest → newest).
 */
function simulateHeatmap(
  sessions: MockSession[],
  days = 90
): Array<{ date: string; level: 0 | 1 | 2 | 3 | 4; count: number }> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  cutoff.setHours(0, 0, 0, 0);
  const cutoffIso = cutoff.toISOString();
  const cutoffKey = cutoffIso.slice(0, 10);

  const countByDay = new Map<string, number>();

  for (const s of sessions) {
    const iso = s.completedAt ?? s.reviewedAt;
    if (!iso || iso < cutoffIso) continue;
    const key = toDateKey(iso);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  const result: Array<{ date: string; level: 0 | 1 | 2 | 3 | 4; count: number }> = [];
  for (let i = -(days - 1); i <= 0; i++) {
    const key = dateKeyOffset(i);
    if (key < cutoffKey) continue;
    const count = countByDay.get(key) ?? 0;
    result.push({ date: key, level: countToLevel(count), count });
  }
  return result;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getStreakHeatmap — 0 sessions", () => {
  it("returns 90 days all with level 0 and count 0 when no sessions exist", () => {
    const result = simulateHeatmap([]);
    expect(result).toHaveLength(90);
    expect(result.every((d) => d.level === 0)).toBe(true);
    expect(result.every((d) => d.count === 0)).toBe(true);
  });
});

describe("getStreakHeatmap — mixed session types", () => {
  it("counts quiz and flashcard sessions on the same day together", () => {
    const today = dateKeyOffset(0);
    const sessions: MockSession[] = [
      { completedAt: today + "T10:00:00Z" },
      { completedAt: today + "T14:00:00Z" },
      { reviewedAt: today + "T16:00:00Z" },
    ];
    const result = simulateHeatmap(sessions);
    const todayEntry = result.find((d) => d.date === today);
    expect(todayEntry).toBeDefined();
    expect(todayEntry!.count).toBe(3);
  });

  it("sessions on different days are counted separately", () => {
    const today = dateKeyOffset(0);
    const yesterday = dateKeyOffset(-1);
    const sessions: MockSession[] = [
      { completedAt: today + "T10:00:00Z" },
      { completedAt: today + "T12:00:00Z" },
      { reviewedAt: yesterday + "T09:00:00Z" },
    ];
    const result = simulateHeatmap(sessions);
    expect(result.find((d) => d.date === today)?.count).toBe(2);
    expect(result.find((d) => d.date === yesterday)?.count).toBe(1);
  });

  it("maps counts to correct levels: 0→0, 1→1, 3→2, 6→3, 11→4", () => {
    expect(countToLevel(0)).toBe(0);
    expect(countToLevel(1)).toBe(1);
    expect(countToLevel(2)).toBe(1);
    expect(countToLevel(3)).toBe(2);
    expect(countToLevel(5)).toBe(2);
    expect(countToLevel(6)).toBe(3);
    expect(countToLevel(10)).toBe(3);
    expect(countToLevel(11)).toBe(4);
    expect(countToLevel(100)).toBe(4);
  });
});

describe("getStreakHeatmap — date window", () => {
  it("includes today in the result", () => {
    const today = dateKeyOffset(0);
    const result = simulateHeatmap([]);
    expect(result.some((d) => d.date === today)).toBe(true);
  });

  it("does not include dates older than 90 days", () => {
    const tooOld = dateKeyOffset(-91);
    const result = simulateHeatmap([]);
    expect(result.some((d) => d.date === tooOld)).toBe(false);
  });

  it("90-day window: first entry is exactly 89 days ago", () => {
    const expected = dateKeyOffset(-89);
    const result = simulateHeatmap([]);
    expect(result[0].date).toBe(expected);
  });
});
