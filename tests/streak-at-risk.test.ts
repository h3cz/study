/**
 * streak-at-risk.test.ts
 * Tests for the pure logic powering getStreakAtRiskStatus.
 * Avoids IndexedDB by inlining the decision logic.
 */

import { describe, it, expect } from "vitest";

// ─── Inline the pure decision logic from getStreakAtRiskStatus ────────────────

interface AtRiskResult {
  atRisk: boolean;
  hoursLeft: number;
  minutesLeft: number;
  hasFreezeAvailable: boolean;
}

/**
 * Pure version of getStreakAtRiskStatus logic.
 * @param streak         current streak
 * @param hourOfDay      local hour (0-23)
 * @param hasSessionToday whether any study session exists today
 * @param streakFreezes  number of freeze tokens available
 * @param minutesUntilMidnight total minutes remaining until midnight
 */
function computeAtRiskStatus(
  streak: number,
  hourOfDay: number,
  hasSessionToday: boolean,
  streakFreezes: number,
  minutesUntilMidnight: number
): AtRiskResult | null {
  if (streak < 7) return null;
  if (hourOfDay < 18) return null;
  if (hasSessionToday) return null;

  const hoursLeft = Math.floor(minutesUntilMidnight / 60);
  const minutesLeft = minutesUntilMidnight % 60;

  return {
    atRisk: true,
    hoursLeft,
    minutesLeft,
    hasFreezeAvailable: streakFreezes > 0,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getStreakAtRiskStatus — not at risk cases", () => {
  it("returns null when streak < 7, regardless of time", () => {
    expect(computeAtRiskStatus(0, 20, false, 0, 120)).toBeNull();
    expect(computeAtRiskStatus(6, 22, false, 0, 60)).toBeNull();
  });

  it("returns null when streak >= 7 but session exists today", () => {
    expect(computeAtRiskStatus(10, 20, true, 0, 90)).toBeNull();
  });

  it("returns null when streak >= 7, no session, but time < 18:00", () => {
    expect(computeAtRiskStatus(7, 17, false, 0, 420)).toBeNull();
    expect(computeAtRiskStatus(15, 0, false, 0, 1440)).toBeNull();
  });

  it("returns null exactly at boundary streak=6 even at 18:00", () => {
    expect(computeAtRiskStatus(6, 18, false, 0, 360)).toBeNull();
  });
});

describe("getStreakAtRiskStatus — at risk cases", () => {
  it("returns atRisk=true when streak >= 7, no session, and hour >= 18", () => {
    const result = computeAtRiskStatus(7, 18, false, 0, 360);
    expect(result).not.toBeNull();
    expect(result!.atRisk).toBe(true);
  });

  it("calculates hoursLeft and minutesLeft correctly from minutesUntilMidnight", () => {
    // 3h 45m left = 225 minutes
    const result = computeAtRiskStatus(10, 20, false, 0, 225);
    expect(result!.hoursLeft).toBe(3);
    expect(result!.minutesLeft).toBe(45);
  });

  it("reports hasFreezeAvailable=true when freezes > 0", () => {
    const result = computeAtRiskStatus(14, 21, false, 2, 180);
    expect(result!.hasFreezeAvailable).toBe(true);
  });

  it("reports hasFreezeAvailable=false when no freezes", () => {
    const result = computeAtRiskStatus(14, 21, false, 0, 180);
    expect(result!.hasFreezeAvailable).toBe(false);
  });

  it("works at exact 18:00 boundary with long streak", () => {
    const result = computeAtRiskStatus(30, 18, false, 1, 360);
    expect(result!.atRisk).toBe(true);
    expect(result!.hoursLeft).toBe(6);
    expect(result!.minutesLeft).toBe(0);
  });
});
