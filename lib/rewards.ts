// Pure, deterministic reward logic: rank tiers (with crown), streak flair, and
// achievement badges — all derived from already-synced stats. No DB, no I/O, so
// it's trivially unit-testable and identical on the dashboard, profile, and
// leaderboard. Visual styling (the actual badge SVGs/colors) lives in the UI;
// this module is the source of truth for WHAT a user has earned.

export interface RankTier {
  key: "recruit" | "analyst" | "specialist" | "pass-ready" | "elite";
  label: string;
  /** Inclusive lower bound on predicted score (100-900 scale). */
  min: number;
  /** Pass-ready and above wear a crown. */
  crown: boolean;
  /** CSS color (var or hex) for the tier badge. */
  color: string;
}

// Ordered low → high. 750 is the SY0-701 pass line, so that's where the crown
// starts — crossing it is the milestone that matters.
export const RANK_TIERS: RankTier[] = [
  { key: "recruit", label: "Recruit", min: 0, crown: false, color: "var(--fg-muted)" },
  { key: "analyst", label: "Analyst", min: 500, crown: false, color: "#7BAEC4" },
  { key: "specialist", label: "Specialist", min: 650, crown: false, color: "#9B8AC4" },
  { key: "pass-ready", label: "Pass-Ready", min: 750, crown: true, color: "var(--success)" },
  { key: "elite", label: "Elite", min: 850, crown: true, color: "var(--accent)" },
];

/**
 * Rank tier for a predicted score, or null if the user has no score yet.
 *
 * `passingScore` (default 750 — the SY0-701 line) sets where the crowned
 * "Pass-Ready" tier begins, so the milestone shifts per cert. The default keeps
 * Security+ behavior identical: Pass-Ready at 750. The "Elite" tier is the only
 * tier above Pass-Ready, so its threshold tracks the pass line proportionally
 * (Elite = pass + 100, matching the original 750→850 gap) but never drops below
 * the pass line.
 */
export function rankTier(
  predictedScore: number | null | undefined,
  passingScore = 750
): RankTier | null {
  if (predictedScore == null || Number.isNaN(predictedScore)) return null;

  // Derive the pass-ready / elite thresholds from the cert's pass line while
  // leaving the lower tiers (recruit/analyst/specialist) at their absolute
  // anchors. With the default 750 this is byte-for-byte the original behavior.
  const tiers: RankTier[] = RANK_TIERS.map((t) => {
    if (t.key === "pass-ready") return { ...t, min: passingScore };
    if (t.key === "elite") return { ...t, min: passingScore + 100 };
    return t;
  });

  let tier = tiers[0];
  for (const t of tiers) {
    if (predictedScore >= t.min) tier = t;
  }
  return tier;
}

/**
 * Full-screen celebration milestones (Duolingo-style). Ordered ascending.
 * Distinct from the smaller streakFlair set — these fire a one-time overlay.
 */
export const STREAK_MILESTONES = [7, 14, 30, 50, 100, 150, 200, 365];

/** Largest milestone <= streak, or null if the streak is below the first one. */
export function highestStreakMilestone(streak: number): number | null {
  let best: number | null = null;
  for (const m of STREAK_MILESTONES) {
    if (streak >= m) best = m;
  }
  return best;
}

export interface StreakFlair {
  milestone: 7 | 30 | 100 | 180 | 365;
  label: string;
}

/** Highest streak milestone reached (365 > 180 > 100 > 30 > 7), or null below 7 days. */
export function streakFlair(streak: number): StreakFlair | null {
  if (streak >= 365) return { milestone: 365, label: "365-day streak" };
  if (streak >= 180) return { milestone: 180, label: "180-day streak" };
  if (streak >= 100) return { milestone: 100, label: "100-day streak" };
  if (streak >= 30) return { milestone: 30, label: "30-day streak" };
  if (streak >= 7) return { milestone: 7, label: "7-day streak" };
  return null;
}

export interface AchievementInput {
  xp: number;
  streak: number;
  questionsAnswered: number;
  mocksTaken: number;
  mocksPassed: number;
  predictedScore: number | null;
  /** Calibration error (lower = better); null if not enough rated answers. */
  calibration: number | null;
}

export interface Achievement {
  key: string;
  label: string;
  description: string;
  earned: boolean;
}

/**
 * The full achievement set with each one's earned flag. Order is the display
 * order (earned ones float up in the UI, but the logic stays pure here).
 *
 * `passingScore` (default 750 — the SY0-701 line) drives the cert-specific
 * "Pass-Ready" and "Elite" thresholds: pass_ready fires at the pass line and
 * elite at pass line + 100 (matching the original 750 → 850 gap). The default
 * keeps Security+ behavior — and existing tests — byte-for-byte identical.
 */
export function achievements(s: AchievementInput, passingScore = 750): Achievement[] {
  const eliteScore = passingScore + 100;
  return [
    {
      key: "first_steps",
      label: "First Steps",
      description: "Answer your first 10 questions",
      earned: s.questionsAnswered >= 10,
    },
    {
      key: "century",
      label: "Century",
      description: "Answer 100 questions",
      earned: s.questionsAnswered >= 100,
    },
    {
      key: "xp_1000",
      label: "Grinder",
      description: "Earn 1,000 XP",
      earned: s.xp >= 1000,
    },
    {
      key: "streak_7",
      label: "Consistent",
      description: "Hold a 7-day streak",
      earned: s.streak >= 7,
    },
    {
      key: "streak_30",
      label: "Relentless",
      description: "Hold a 30-day streak",
      earned: s.streak >= 30,
    },
    {
      key: "streak_100",
      label: "Centurion",
      description: "Hold a 100-day streak",
      earned: s.streak >= 100,
    },
    {
      key: "streak_180",
      label: "Half-Marathoner",
      description: "Hold a 180-day streak",
      earned: s.streak >= 180,
    },
    {
      key: "streak_365",
      label: "Streak Society",
      description: "Hold a 365-day streak",
      earned: s.streak >= 365,
    },
    {
      key: "first_mock",
      label: "Dress Rehearsal",
      description: "Complete a full mock exam",
      earned: s.mocksTaken >= 1,
    },
    {
      key: "mock_pass",
      label: "First Pass",
      description: "Pass a mock exam",
      earned: s.mocksPassed >= 1,
    },
    {
      key: "mocks_5",
      label: "Battle-Tested",
      description: "Complete 5 mock exams",
      earned: s.mocksTaken >= 5,
    },
    {
      key: "pass_ready",
      label: "Pass-Ready",
      description: `Reach a predicted score of ${passingScore}`,
      earned: s.predictedScore != null && s.predictedScore >= passingScore,
    },
    {
      key: "elite",
      label: "Elite",
      description: `Reach a predicted score of ${eliteScore}`,
      earned: s.predictedScore != null && s.predictedScore >= eliteScore,
    },
    {
      key: "well_calibrated",
      label: "Self-Aware",
      description: "Reach well-calibrated confidence (< 0.15)",
      earned: s.calibration != null && s.calibration < 0.15,
    },
  ];
}

/** Count of earned achievements — handy for a "7/11 unlocked" summary. */
export function earnedCount(list: Achievement[]): number {
  return list.filter((a) => a.earned).length;
}
