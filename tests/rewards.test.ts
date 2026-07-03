import { describe, it, expect } from "vitest";
import {
  rankTier,
  streakFlair,
  achievements,
  earnedCount,
  highestStreakMilestone,
  STREAK_MILESTONES,
  type AchievementInput,
} from "@/lib/rewards";

describe("rankTier", () => {
  it("returns null when there is no score yet", () => {
    expect(rankTier(null)).toBeNull();
    expect(rankTier(undefined)).toBeNull();
    expect(rankTier(NaN)).toBeNull();
  });

  it("maps scores to the right tier at boundaries", () => {
    expect(rankTier(100)?.key).toBe("recruit");
    expect(rankTier(499)?.key).toBe("recruit");
    expect(rankTier(500)?.key).toBe("analyst");
    expect(rankTier(649)?.key).toBe("analyst");
    expect(rankTier(650)?.key).toBe("specialist");
    expect(rankTier(749)?.key).toBe("specialist");
    expect(rankTier(750)?.key).toBe("pass-ready");
    expect(rankTier(849)?.key).toBe("pass-ready");
    expect(rankTier(850)?.key).toBe("elite");
    expect(rankTier(900)?.key).toBe("elite");
  });

  it("gives a crown only at the 750 pass line and above", () => {
    expect(rankTier(749)?.crown).toBe(false);
    expect(rankTier(750)?.crown).toBe(true);
    expect(rankTier(900)?.crown).toBe(true);
  });

  it("shifts the pass-ready / crown line when a passingScore is given", () => {
    // At a 700 pass line, the crowned pass-ready tier starts at 700.
    expect(rankTier(699, 700)?.key).toBe("specialist");
    expect(rankTier(699, 700)?.crown).toBe(false);
    expect(rankTier(700, 700)?.key).toBe("pass-ready");
    expect(rankTier(700, 700)?.crown).toBe(true);
    // Elite tracks the pass line + 100 (700 → 800).
    expect(rankTier(799, 700)?.key).toBe("pass-ready");
    expect(rankTier(800, 700)?.key).toBe("elite");
    // Default param (no passingScore) is unchanged: 750 line.
    expect(rankTier(750)?.key).toBe("pass-ready");
    expect(rankTier(749)?.key).toBe("specialist");
  });
});

describe("streakFlair", () => {
  it("is null below 7 days", () => {
    expect(streakFlair(0)).toBeNull();
    expect(streakFlair(6)).toBeNull();
  });
  it("returns the highest milestone reached", () => {
    expect(streakFlair(7)?.milestone).toBe(7);
    expect(streakFlair(29)?.milestone).toBe(7);
    expect(streakFlair(30)?.milestone).toBe(30);
    expect(streakFlair(99)?.milestone).toBe(30);
    expect(streakFlair(100)?.milestone).toBe(100);
    expect(streakFlair(179)?.milestone).toBe(100);
    expect(streakFlair(180)?.milestone).toBe(180);
    expect(streakFlair(364)?.milestone).toBe(180);
    expect(streakFlair(365)?.milestone).toBe(365);
    expect(streakFlair(500)?.milestone).toBe(365);
  });
});

describe("highestStreakMilestone", () => {
  it("is null below the first milestone", () => {
    expect(highestStreakMilestone(0)).toBeNull();
    expect(highestStreakMilestone(6)).toBeNull();
  });

  it("returns the largest milestone <= streak", () => {
    expect(highestStreakMilestone(7)).toBe(7);
    expect(highestStreakMilestone(29)).toBe(14);
    expect(highestStreakMilestone(30)).toBe(30);
    expect(highestStreakMilestone(365)).toBe(365);
    expect(highestStreakMilestone(400)).toBe(365);
  });

  it("STREAK_MILESTONES is ascending and matches the spec", () => {
    expect(STREAK_MILESTONES).toEqual([7, 14, 30, 50, 100, 150, 200, 365]);
  });
});

describe("achievements", () => {
  const base: AchievementInput = {
    xp: 0,
    streak: 0,
    questionsAnswered: 0,
    mocksTaken: 0,
    mocksPassed: 0,
    predictedScore: null,
    calibration: null,
  };

  it("a brand-new user has earned nothing", () => {
    expect(earnedCount(achievements(base))).toBe(0);
  });

  it("unlocks the right badges from stats", () => {
    const list = achievements({
      xp: 1200,
      streak: 31,
      questionsAnswered: 140,
      mocksTaken: 6,
      mocksPassed: 2,
      predictedScore: 780,
      calibration: 0.12,
    });
    const earned = new Set(list.filter((a) => a.earned).map((a) => a.key));
    expect(earned.has("first_steps")).toBe(true);
    expect(earned.has("century")).toBe(true);
    expect(earned.has("xp_1000")).toBe(true);
    expect(earned.has("streak_7")).toBe(true);
    expect(earned.has("streak_30")).toBe(true);
    expect(earned.has("first_mock")).toBe(true);
    expect(earned.has("mock_pass")).toBe(true);
    expect(earned.has("mocks_5")).toBe(true);
    expect(earned.has("pass_ready")).toBe(true);
    expect(earned.has("well_calibrated")).toBe(true);
    expect(earned.has("elite")).toBe(false); // 780 < 850
  });

  it("calibration must be present and under 0.15", () => {
    expect(achievements({ ...base, calibration: null }).find((a) => a.key === "well_calibrated")!.earned).toBe(false);
    expect(achievements({ ...base, calibration: 0.2 }).find((a) => a.key === "well_calibrated")!.earned).toBe(false);
    expect(achievements({ ...base, calibration: 0.14 }).find((a) => a.key === "well_calibrated")!.earned).toBe(true);
  });

  it("long-haul streak badges earn at their thresholds and not below", () => {
    const find = (streak: number, key: string) =>
      achievements({ ...base, streak }).find((a) => a.key === key)!.earned;

    expect(find(99, "streak_100")).toBe(false);
    expect(find(100, "streak_100")).toBe(true);
    expect(find(365, "streak_100")).toBe(true);

    expect(find(179, "streak_180")).toBe(false);
    expect(find(180, "streak_180")).toBe(true);
    expect(find(365, "streak_180")).toBe(true);

    expect(find(364, "streak_365")).toBe(false);
    expect(find(365, "streak_365")).toBe(true);
    expect(find(400, "streak_365")).toBe(true);
  });

  it("returns a stable, complete list regardless of input", () => {
    expect(achievements(base).length).toBe(achievements({ ...base, xp: 99999 }).length);
  });
});
