/**
 * streak-freezes.test.ts
 * Unit tests for streak freeze earn/consume logic.
 * Tests the pure functions computeStreakUpdate() and computeFreezeEarned()
 * so no IndexedDB is needed.
 */

import { describe, it, expect } from "vitest";
import {
  computeStreakUpdate,
  computeFreezeEarned,
  shouldAdvanceStreak,
  FREEZE_CAP,
  FREEZE_EARN_INTERVAL,
} from "../lib/gamification";

const TODAY = "2026-05-26";
const YESTERDAY = "2026-05-25";
const TWO_DAYS_AGO = "2026-05-24";
const THREE_DAYS_AGO = "2026-05-23";

// ─── computeStreakUpdate ──────────────────────────────────────────────────────

describe("computeStreakUpdate — same-day study", () => {
  it("returns unchanged streak and no freeze consumed when lastStudyDate === today", () => {
    const result = computeStreakUpdate(5, TODAY, TODAY, 2);
    expect(result.newStreak).toBe(5);
    expect(result.consumedFreeze).toBe(false);
  });
});

describe("computeStreakUpdate — 1-day gap (consecutive)", () => {
  it("increments streak when gap is 1 day with no freezes", () => {
    const result = computeStreakUpdate(5, YESTERDAY, TODAY, 0);
    expect(result.newStreak).toBe(6);
    expect(result.consumedFreeze).toBe(false);
  });

  it("increments streak when gap is 1 day even with freezes available (no freeze needed)", () => {
    const result = computeStreakUpdate(5, YESTERDAY, TODAY, 2);
    expect(result.newStreak).toBe(6);
    expect(result.consumedFreeze).toBe(false);
  });
});

describe("computeStreakUpdate — 2-day gap (1 missed day)", () => {
  it("resets streak to 1 when gap is 2 days and no freezes available", () => {
    const result = computeStreakUpdate(5, TWO_DAYS_AGO, TODAY, 0);
    expect(result.newStreak).toBe(1);
    expect(result.consumedFreeze).toBe(false);
  });

  it("preserves and increments streak when gap is 2 days and freeze is available", () => {
    const result = computeStreakUpdate(5, TWO_DAYS_AGO, TODAY, 1);
    expect(result.newStreak).toBe(6);
    expect(result.consumedFreeze).toBe(true);
  });
});

describe("computeStreakUpdate — 3+ day gap (freeze cannot save)", () => {
  it("resets streak even with freezes available when gap is 3 days", () => {
    const result = computeStreakUpdate(10, THREE_DAYS_AGO, TODAY, 3);
    expect(result.newStreak).toBe(1);
    expect(result.consumedFreeze).toBe(false);
  });
});

describe("computeStreakUpdate — no lastStudyDate", () => {
  it("starts streak at 1 with no prior study date", () => {
    const result = computeStreakUpdate(0, undefined, TODAY, 0);
    expect(result.newStreak).toBe(1);
    expect(result.consumedFreeze).toBe(false);
  });
});

// ─── computeFreezeEarned ─────────────────────────────────────────────────────

describe("computeFreezeEarned — earning on 7-day streak", () => {
  it("earns a freeze when streak hits 7 for the first time today", () => {
    const result = computeFreezeEarned(7, 0, undefined, TODAY);
    expect(result.freezesAfter).toBe(1);
    expect(result.freezesEarnedTotalDelta).toBe(1);
    expect(result.newLastFreezeEarnedAt).toBe(TODAY);
  });

  it("earns a freeze when streak hits 14", () => {
    const result = computeFreezeEarned(14, 1, "2026-05-19", TODAY);
    expect(result.freezesAfter).toBe(2);
    expect(result.freezesEarnedTotalDelta).toBe(1);
  });

  it("does NOT double-earn on the same calendar day", () => {
    // Simulate: already earned a freeze today (lastFreezeEarnedAt === TODAY)
    const result = computeFreezeEarned(14, 1, TODAY, TODAY);
    expect(result.freezesAfter).toBe(1);
    expect(result.freezesEarnedTotalDelta).toBe(0);
  });

  it("does NOT earn when freeze inventory is already at cap", () => {
    const result = computeFreezeEarned(7, FREEZE_CAP, undefined, TODAY);
    expect(result.freezesAfter).toBe(FREEZE_CAP);
    expect(result.freezesEarnedTotalDelta).toBe(0);
  });

  it("does NOT earn on non-milestone streak days", () => {
    const result = computeFreezeEarned(5, 0, undefined, TODAY);
    expect(result.freezesAfter).toBe(0);
    expect(result.freezesEarnedTotalDelta).toBe(0);
  });
});

describe("FREEZE_CAP constant", () => {
  it("cap is 3", () => {
    expect(FREEZE_CAP).toBe(3);
  });
});

describe("FREEZE_EARN_INTERVAL constant", () => {
  it("interval is 7", () => {
    expect(FREEZE_EARN_INTERVAL).toBe(7);
  });
});

// ─── shouldAdvanceStreak (daily-goal gate) ───────────────────────────────────

describe("shouldAdvanceStreak", () => {
  it("does NOT advance when still below the goal", () => {
    // 3 answered, adding 2 → 5 < goal 10
    expect(shouldAdvanceStreak(3, 2, 10, YESTERDAY, TODAY)).toBe(false);
  });

  it("advances when the goal is newly crossed exactly this session", () => {
    // 8 answered, adding 2 → 10 >= goal 10
    expect(shouldAdvanceStreak(8, 2, 10, YESTERDAY, TODAY)).toBe(true);
  });

  it("advances when the goal is overshot this session", () => {
    expect(shouldAdvanceStreak(8, 5, 10, YESTERDAY, TODAY)).toBe(true);
  });

  it("does NOT advance when the goal was already met earlier today", () => {
    // already at 10 before this session → not newly crossed
    expect(shouldAdvanceStreak(10, 1, 10, YESTERDAY, TODAY)).toBe(false);
    expect(shouldAdvanceStreak(12, 3, 10, YESTERDAY, TODAY)).toBe(false);
  });

  it("does NOT advance when the day is already credited (lastStudyDate === today)", () => {
    // goal newly crossed, but today already counted → no double-advance
    expect(shouldAdvanceStreak(8, 2, 10, TODAY, TODAY)).toBe(false);
  });

  it("advances with no prior study date when goal is crossed", () => {
    expect(shouldAdvanceStreak(0, 10, 10, undefined, TODAY)).toBe(true);
  });

  it("clamps goal <= 0 to 1 (one answer crosses it, no auto-complete on zero adds)", () => {
    // goal 0 clamped to 1: 0 answered + 1 added crosses
    expect(shouldAdvanceStreak(0, 1, 0, YESTERDAY, TODAY)).toBe(true);
    // 0 answered + 0 added does not cross a clamped goal of 1
    expect(shouldAdvanceStreak(0, 0, 0, YESTERDAY, TODAY)).toBe(false);
    expect(shouldAdvanceStreak(0, 1, -5, YESTERDAY, TODAY)).toBe(true);
  });
});
