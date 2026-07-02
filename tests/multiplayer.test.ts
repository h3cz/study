/**
 * multiplayer.test.ts
 *
 * Pure-logic tests for the duel scoring + shared Pomodoro. No I/O, no Realtime —
 * just the deterministic math the server and client both rely on.
 */

import { describe, it, expect } from "vitest";
import {
  roundPoints,
  outcomeFor,
  duelXp,
  DUEL_DEFAULTS,
  DUEL_ROUND_OPTIONS,
  DUEL_TIME_LIMIT_OPTIONS_MS,
  DUEL_XP_PER_CORRECT,
  DUEL_WIN_BONUS,
  normalizeDuelSettings,
} from "../lib/multiplayer/scoring";
import {
  pomodoroAt,
  formatRemaining,
  FOCUS_MS,
  BREAK_MS,
  CYCLE_MS,
} from "../lib/multiplayer/pomodoro";

describe("roundPoints — Kahoot speed × accuracy", () => {
  const limit = 15000;
  const base = 1000;

  it("awards 0 for a wrong answer regardless of speed", () => {
    expect(roundPoints(false, 0, limit, base)).toBe(0);
    expect(roundPoints(false, 1, limit, base)).toBe(0);
  });

  it("awards full base for an instant correct answer", () => {
    expect(roundPoints(true, 0, limit, base)).toBe(base);
  });

  it("decays to half base at the time limit", () => {
    expect(roundPoints(true, limit, limit, base)).toBe(base / 2);
  });

  it("is monotonic non-increasing in elapsed time", () => {
    let prev = Infinity;
    for (let ms = 0; ms <= limit; ms += 1000) {
      const p = roundPoints(true, ms, limit, base);
      expect(p).toBeLessThanOrEqual(prev);
      prev = p;
    }
  });

  it("clamps beyond the limit to the half-base floor", () => {
    expect(roundPoints(true, limit * 5, limit, base)).toBe(base / 2);
  });

  it("treats NaN timing as slowest (still half base, never negative)", () => {
    expect(roundPoints(true, NaN, limit, base)).toBe(base / 2);
  });

  it("uses the default base when omitted", () => {
    expect(roundPoints(true, 0, limit)).toBe(DUEL_DEFAULTS.basePoints);
  });
});

describe("outcomeFor — score then correctness tiebreak", () => {
  it("higher score wins", () => {
    expect(outcomeFor(500, 400, 3, 4)).toBe("win");
    expect(outcomeFor(400, 500, 4, 3)).toBe("loss");
  });

  it("equal score falls back to correctness", () => {
    expect(outcomeFor(500, 500, 4, 3)).toBe("win");
    expect(outcomeFor(500, 500, 3, 4)).toBe("loss");
  });

  it("equal score and correctness is a draw", () => {
    expect(outcomeFor(500, 500, 3, 3)).toBe("draw");
    expect(outcomeFor(0, 0, 0, 0)).toBe("draw");
  });
});

describe("duelXp — mirrors the server award math", () => {
  it("10 XP per correct, no win bonus on a loss", () => {
    expect(duelXp(5, false)).toBe(5 * DUEL_XP_PER_CORRECT);
  });

  it("adds the win bonus on a win", () => {
    expect(duelXp(5, true)).toBe(5 * DUEL_XP_PER_CORRECT + DUEL_WIN_BONUS);
  });

  it("a zero-correct win still earns the bonus", () => {
    expect(duelXp(0, true)).toBe(DUEL_WIN_BONUS);
  });
});

describe("normalizeDuelSettings", () => {
  it("accepts supported question counts and timers", () => {
    expect(normalizeDuelSettings({ numRounds: 10, roundLimitMs: 45_000 })).toEqual({
      numRounds: 10,
      roundLimitMs: 45_000,
    });
  });

  it("falls back to defaults for unsupported values", () => {
    expect(normalizeDuelSettings({ numRounds: 99, roundLimitMs: 10_000 })).toEqual({
      numRounds: DUEL_DEFAULTS.numRounds,
      roundLimitMs: DUEL_DEFAULTS.roundLimitMs,
    });
  });

  it("keeps the default values in the selectable rule lists", () => {
    expect(DUEL_ROUND_OPTIONS).toContain(DUEL_DEFAULTS.numRounds);
    expect(DUEL_TIME_LIMIT_OPTIONS_MS).toContain(DUEL_DEFAULTS.roundLimitMs);
  });
});

describe("pomodoroAt — wall-clock anchored cadence", () => {
  it("starts each cycle in focus at full duration", () => {
    const s = pomodoroAt(0);
    expect(s.phase).toBe("focus");
    expect(s.remainingMs).toBe(FOCUS_MS);
    expect(s.progress).toBe(0);
  });

  it("transitions to break exactly at FOCUS_MS", () => {
    const s = pomodoroAt(FOCUS_MS);
    expect(s.phase).toBe("break");
    expect(s.remainingMs).toBe(BREAK_MS);
  });

  it("is purely a function of time — two clients at the same instant agree", () => {
    const t = 123_456_789;
    expect(pomodoroAt(t)).toEqual(pomodoroAt(t));
  });

  it("wraps cleanly across a full cycle", () => {
    const a = pomodoroAt(10_000);
    const b = pomodoroAt(10_000 + CYCLE_MS);
    expect(a.phase).toBe(b.phase);
    expect(a.remainingMs).toBe(b.remainingMs);
    expect(b.cycleIndex).toBe(a.cycleIndex + 1);
  });

  it("reports decreasing remaining time within a phase", () => {
    expect(pomodoroAt(60_000).remainingMs).toBeGreaterThan(pomodoroAt(120_000).remainingMs);
  });
});

describe("formatRemaining", () => {
  it("formats minutes:seconds with zero-padding", () => {
    expect(formatRemaining(0)).toBe("0:00");
    expect(formatRemaining(5_000)).toBe("0:05");
    expect(formatRemaining(65_000)).toBe("1:05");
    expect(formatRemaining(25 * 60 * 1000)).toBe("25:00");
  });

  it("never goes negative", () => {
    expect(formatRemaining(-5000)).toBe("0:00");
  });
});
