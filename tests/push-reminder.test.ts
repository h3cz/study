/**
 * push-reminder.test.ts
 * Unit tests for the pure reminderDecision used by the daily-reminder cron.
 * No Supabase, no web-push, no ambient Date — `now` is always injected.
 */

import { describe, it, expect } from "vitest";
import {
  reminderDecision,
  type ReminderDecisionInput,
} from "@/lib/reminder-decision";

// Base input: a UTC user whose reminder hour is 18:00 local.
function base(overrides: Partial<ReminderDecisionInput> = {}): ReminderDecisionInput {
  return {
    reminderHour: 18,
    reminderTz: "UTC",
    lastStudyDate: null,
    streak: 0,
    predictedScore: null,
    // 2026-05-31T18:00:00Z → 18:00 local in UTC.
    now: new Date("2026-05-31T18:00:00Z"),
    ...overrides,
  };
}

describe("reminderDecision", () => {
  it("does not send when the local hour does not match reminderHour", () => {
    const d = reminderDecision(base({ now: new Date("2026-05-31T09:00:00Z") }));
    expect(d.send).toBe(false);
  });

  it("does not send when the user already studied today (local)", () => {
    const d = reminderDecision(base({ lastStudyDate: "2026-05-31" }));
    expect(d.send).toBe(false);
  });

  it("sends at-risk copy when an active streak's last study was yesterday", () => {
    const d = reminderDecision(
      base({ streak: 7, lastStudyDate: "2026-05-30" })
    );
    expect(d.send).toBe(true);
    expect(d.title).toBe("Keep your streak alive 🔥");
    expect(d.body).toContain("7-day streak");
  });

  it("sends gentle copy with predicted score when not at risk", () => {
    const d = reminderDecision(
      base({ streak: 0, lastStudyDate: null, predictedScore: 640 })
    );
    expect(d.send).toBe(true);
    expect(d.title).toBe("Time to study 📚");
    expect(d.body).toContain("640/900");
  });

  it("sends gentle copy without predicted score when null", () => {
    const d = reminderDecision(
      base({ streak: 0, lastStudyDate: null, predictedScore: null })
    );
    expect(d.send).toBe(true);
    expect(d.title).toBe("Time to study 📚");
    expect(d.body).toBe("A few questions a day builds your Security+ score.");
  });

  it("does not treat a stale streak (last study older than yesterday) as at-risk", () => {
    const d = reminderDecision(
      base({ streak: 3, lastStudyDate: "2026-05-28", predictedScore: 500 })
    );
    expect(d.send).toBe(true);
    // Streak already broken → gentle copy, not at-risk copy.
    expect(d.title).toBe("Time to study 📚");
    expect(d.body).toContain("500/900");
  });

  describe("timezone correctness", () => {
    // America/Chicago in late May is CDT (UTC-5).
    it("sends to a Chicago user at their local 18:00 (23:00 UTC)", () => {
      const d = reminderDecision(
        base({
          reminderTz: "America/Chicago",
          reminderHour: 18,
          now: new Date("2026-05-31T23:00:00Z"), // 18:00 CDT
        })
      );
      expect(d.send).toBe(true);
    });

    it("does not send to a Chicago user when it's 18:00 UTC (13:00 their time)", () => {
      const d = reminderDecision(
        base({
          reminderTz: "America/Chicago",
          reminderHour: 18,
          now: new Date("2026-05-31T18:00:00Z"), // 13:00 CDT
        })
      );
      expect(d.send).toBe(false);
    });

    it("computes 'today' and 'yesterday' in the user's timezone, not UTC", () => {
      // 2026-06-01T03:30:00Z is still 2026-05-31 22:30 in Chicago.
      // A Chicago user with reminderHour 22 should be reminded, and their
      // "yesterday" is 2026-05-30 → at-risk streak still applies.
      const d = reminderDecision(
        base({
          reminderTz: "America/Chicago",
          reminderHour: 22,
          streak: 4,
          lastStudyDate: "2026-05-30",
          now: new Date("2026-06-01T03:30:00Z"),
        })
      );
      expect(d.send).toBe(true);
      expect(d.title).toBe("Keep your streak alive 🔥");
      expect(d.body).toContain("4-day streak");
    });
  });
});
