// Shared room Pomodoro — a deterministic cadence anchored to wall-clock epoch.
//
// Design choice: instead of a host "starting" a timer and broadcasting ticks
// (which drifts and breaks for late joiners), the room rhythm is a pure function
// of the current time. Everyone in the room — including someone who joins
// mid-cycle — computes the exact same phase and remaining time with zero
// coordination. The room has a heartbeat; you step into it.

export const FOCUS_MS = 25 * 60 * 1000;
export const BREAK_MS = 5 * 60 * 1000;
export const CYCLE_MS = FOCUS_MS + BREAK_MS; // 30 min

export type PomodoroPhase = "focus" | "break";

export interface PomodoroState {
  phase: PomodoroPhase;
  /** Milliseconds left in the current phase. */
  remainingMs: number;
  /** 0..1 progress through the current phase (0 = just started). */
  progress: number;
  /** Monotonic cycle counter since the epoch anchor (for keys/labels). */
  cycleIndex: number;
}

/**
 * Pomodoro state at time `now` (ms epoch). Anchored to epoch 0 so every client
 * worldwide shares the same 25/5 grid.
 */
export function pomodoroAt(now: number): PomodoroState {
  const t = ((now % CYCLE_MS) + CYCLE_MS) % CYCLE_MS; // ms into the current cycle
  const cycleIndex = Math.floor(now / CYCLE_MS);
  if (t < FOCUS_MS) {
    return { phase: "focus", remainingMs: FOCUS_MS - t, progress: t / FOCUS_MS, cycleIndex };
  }
  const into = t - FOCUS_MS;
  return { phase: "break", remainingMs: BREAK_MS - into, progress: into / BREAK_MS, cycleIndex };
}

/** Format remaining ms as M:SS. */
export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
