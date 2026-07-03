import { describe, it, expect } from "vitest";
import { rowCapSeconds } from "@/lib/voice-tutor/sessions-server";
import { SESSION_HARD_LIMIT_SECONDS } from "@/lib/voice-tutor/caps";

// Fixed server clock so elapsed math is deterministic.
const NOW = new Date("2026-05-28T12:00:00Z");

function startedSecondsAgo(seconds: number): string {
  return new Date(NOW.getTime() - seconds * 1000).toISOString();
}

describe("rowCapSeconds — in-flight cap accounting (Fix A, cost-safety)", () => {
  it("counts an ENDED row's recorded duration_seconds", () => {
    const row = {
      started_at: startedSecondsAgo(600),
      ended_at: NOW.toISOString(),
      duration_seconds: 420,
    };
    expect(rowCapSeconds(row, NOW)).toBe(420);
  });

  it("counts an IN-FLIGHT row's live elapsed time (never-ended session)", () => {
    // Started 90s ago, /end never fired → must still count ~90s against the cap.
    const row = {
      started_at: startedSecondsAgo(90),
      ended_at: null,
      duration_seconds: 0,
    };
    expect(rowCapSeconds(row, NOW)).toBe(90);
  });

  it("clamps an in-flight row's elapsed time to the per-session hard limit", () => {
    // A stuck session open far past the cap must never count more than the cap.
    const row = {
      started_at: startedSecondsAgo(SESSION_HARD_LIMIT_SECONDS + 5000),
      ended_at: null,
      duration_seconds: 0,
    };
    expect(rowCapSeconds(row, NOW)).toBe(SESSION_HARD_LIMIT_SECONDS);
  });

  it("counts exactly the hard limit at the boundary", () => {
    const row = {
      started_at: startedSecondsAgo(SESSION_HARD_LIMIT_SECONDS),
      ended_at: null,
      duration_seconds: 0,
    };
    expect(rowCapSeconds(row, NOW)).toBe(SESSION_HARD_LIMIT_SECONDS);
  });

  it("treats a null/missing duration on an ended row as 0", () => {
    const row = {
      started_at: startedSecondsAgo(600),
      ended_at: NOW.toISOString(),
      duration_seconds: null,
    };
    expect(rowCapSeconds(row, NOW)).toBe(0);
  });

  it("returns 0 for an unparseable in-flight start time", () => {
    const row = {
      started_at: "not-a-date",
      ended_at: null,
      duration_seconds: 0,
    };
    expect(rowCapSeconds(row, NOW)).toBe(0);
  });

  it("never goes negative for a future start time", () => {
    const row = {
      started_at: new Date(NOW.getTime() + 5000).toISOString(),
      ended_at: null,
      duration_seconds: 0,
    };
    expect(rowCapSeconds(row, NOW)).toBe(0);
  });
});
