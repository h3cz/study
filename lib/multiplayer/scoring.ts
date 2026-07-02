// Pure duel scoring — Kahoot-style speed × accuracy. No I/O, fully unit-testable.
//
// A correct answer at t=0 scores the full BASE; points decay linearly to BASE/2
// at the round time limit; a wrong answer or timeout scores 0. Both players face
// the same network path, so server-measured elapsed time is treated as fair.

export const DUEL_DEFAULTS = {
  numRounds: 7,
  roundLimitMs: 30000,
  basePoints: 1000,
} as const;

export const DUEL_ROUND_OPTIONS = [5, 7, 10] as const;
export const DUEL_TIME_LIMIT_OPTIONS_MS = [20_000, 30_000, 45_000] as const;

export type DuelRoundOption = (typeof DUEL_ROUND_OPTIONS)[number];
export type DuelTimeLimitOptionMs = (typeof DUEL_TIME_LIMIT_OPTIONS_MS)[number];

export function normalizeDuelSettings(input: {
  numRounds?: unknown;
  roundLimitMs?: unknown;
}): { numRounds: DuelRoundOption; roundLimitMs: DuelTimeLimitOptionMs } {
  const numRounds =
    typeof input.numRounds === "number" &&
    DUEL_ROUND_OPTIONS.includes(input.numRounds as DuelRoundOption)
      ? (input.numRounds as DuelRoundOption)
      : DUEL_DEFAULTS.numRounds;
  const roundLimitMs =
    typeof input.roundLimitMs === "number" &&
    DUEL_TIME_LIMIT_OPTIONS_MS.includes(input.roundLimitMs as DuelTimeLimitOptionMs)
      ? (input.roundLimitMs as DuelTimeLimitOptionMs)
      : DUEL_DEFAULTS.roundLimitMs;
  return { numRounds, roundLimitMs };
}

/** XP awarded server-side on finalize (kept in sync with the SQL in mp_advance). */
export const DUEL_XP_PER_CORRECT = 10;
export const DUEL_WIN_BONUS = 50;

/**
 * Points for one answer.
 * @param correct  whether the pick matched the answer key
 * @param msElapsed server-measured time since the round opened
 * @param roundLimitMs the round's time budget
 * @param basePoints max points for an instant correct answer
 */
export function roundPoints(
  correct: boolean,
  msElapsed: number,
  roundLimitMs: number,
  basePoints: number = DUEL_DEFAULTS.basePoints
): number {
  if (!correct) return 0;
  const frac = clamp01(msElapsed / Math.max(1, roundLimitMs));
  return Math.round(basePoints * (1 - 0.5 * frac));
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 1; // treat unknown timing as slowest (still safe: correct keeps half)
  return Math.min(1, Math.max(0, n));
}

export type DuelOutcome = "win" | "loss" | "draw";

/** Outcome for `me` given the final scores (correctness is the tiebreak). */
export function outcomeFor(
  meScore: number,
  themScore: number,
  meCorrect: number,
  themCorrect: number
): DuelOutcome {
  if (meScore > themScore) return "win";
  if (themScore > meScore) return "loss";
  if (meCorrect > themCorrect) return "win";
  if (themCorrect > meCorrect) return "loss";
  return "draw";
}

/** XP a player earns from a duel (mirrors the server award math). */
export function duelXp(correctCount: number, won: boolean): number {
  return correctCount * DUEL_XP_PER_CORRECT + (won ? DUEL_WIN_BONUS : 0);
}
