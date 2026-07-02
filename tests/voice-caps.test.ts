import { describe, it, expect } from "vitest";
import {
  evaluateMintCaps,
  isSessionWithinBackstop,
  isPlausibleLocalDate,
  dayWindow,
  monthWindow,
  PER_USER_DAILY_LIMIT_SECONDS,
  PER_USER_MONTHLY_LIMIT_SECONDS,
  SESSION_SERVER_BACKSTOP_SECONDS,
} from "@/lib/voice-tutor/caps";

// A fixed server clock so window math is deterministic.
const NOW = new Date("2026-05-28T12:00:00Z");

function base(overrides: Partial<Parameters<typeof evaluateMintCaps>[0]> = {}) {
  return {
    enabled: true,
    globalMonthlyBudgetMinutes: 2000,
    globalMonthSeconds: 0,
    userDaySeconds: 0,
    userMonthSeconds: 0,
    serverNow: NOW,
    ...overrides,
  };
}

describe("voice caps — kill switch + global budget (cap 5)", () => {
  it("returns 503 service_disabled when the kill-switch is off", () => {
    const v = evaluateMintCaps(base({ enabled: false }));
    expect(v.allowed).toBe(false);
    if (!v.allowed) {
      expect(v.status).toBe(503);
      expect(v.code).toBe("service_disabled");
    }
  });

  it("returns 503 service_capacity_reached at the global monthly budget", () => {
    const v = evaluateMintCaps(
      base({ globalMonthlyBudgetMinutes: 100, globalMonthSeconds: 100 * 60 })
    );
    expect(v.allowed).toBe(false);
    if (!v.allowed) {
      expect(v.status).toBe(503);
      expect(v.code).toBe("service_capacity_reached");
    }
  });

  it("allows when under the global budget", () => {
    const v = evaluateMintCaps(
      base({ globalMonthlyBudgetMinutes: 100, globalMonthSeconds: 99 * 60 })
    );
    expect(v.allowed).toBe(true);
  });

  it("treats a zero/blank global budget as no global ceiling", () => {
    const v = evaluateMintCaps(
      base({ globalMonthlyBudgetMinutes: 0, globalMonthSeconds: 999999 })
    );
    expect(v.allowed).toBe(true);
  });
});

describe("voice caps — per-user daily 30 min (cap 2)", () => {
  it("blocks exactly at the daily limit (>=)", () => {
    const v = evaluateMintCaps(
      base({ userDaySeconds: PER_USER_DAILY_LIMIT_SECONDS })
    );
    expect(v.allowed).toBe(false);
    if (!v.allowed) {
      expect(v.status).toBe(429);
      expect(v.code).toBe("daily_limit_reached");
    }
  });

  it("allows one second under the daily limit", () => {
    const v = evaluateMintCaps(
      base({ userDaySeconds: PER_USER_DAILY_LIMIT_SECONDS - 1 })
    );
    expect(v.allowed).toBe(true);
    if (v.allowed) expect(v.minutesRemainingToday).toBe(0);
  });

  it("reports whole minutes remaining today", () => {
    const v = evaluateMintCaps(base({ userDaySeconds: 10 * 60 }));
    expect(v.allowed).toBe(true);
    if (v.allowed) expect(v.minutesRemainingToday).toBe(20);
  });
});

describe("voice caps — per-user monthly 60 min (cap 3)", () => {
  it("blocks exactly at the monthly limit (>=)", () => {
    const v = evaluateMintCaps(
      base({ userMonthSeconds: PER_USER_MONTHLY_LIMIT_SECONDS })
    );
    expect(v.allowed).toBe(false);
    if (!v.allowed) {
      expect(v.status).toBe(429);
      expect(v.code).toBe("monthly_limit_reached");
    }
  });

  it("allows under the monthly limit and reports remaining minutes", () => {
    const v = evaluateMintCaps(base({ userMonthSeconds: 45 * 60 }));
    expect(v.allowed).toBe(true);
    if (v.allowed) expect(v.minutesRemainingThisMonth).toBe(15);
  });
});

describe("voice caps — priority order", () => {
  it("kill-switch beats every other condition", () => {
    const v = evaluateMintCaps(
      base({
        enabled: false,
        userDaySeconds: PER_USER_DAILY_LIMIT_SECONDS,
        userMonthSeconds: PER_USER_MONTHLY_LIMIT_SECONDS,
      })
    );
    if (!v.allowed) expect(v.code).toBe("service_disabled");
  });

  it("daily is checked before monthly", () => {
    const v = evaluateMintCaps(
      base({
        userDaySeconds: PER_USER_DAILY_LIMIT_SECONDS,
        userMonthSeconds: PER_USER_MONTHLY_LIMIT_SECONDS,
      })
    );
    if (!v.allowed) expect(v.code).toBe("daily_limit_reached");
  });
});

describe("voice caps — per-session 16-min server backstop (cap 1)", () => {
  it("accepts a tool call within the backstop window", () => {
    const started = new Date(NOW.getTime() - 5 * 60 * 1000).toISOString();
    expect(isSessionWithinBackstop(started, NOW)).toBe(true);
  });

  it("accepts exactly at the 16-min boundary", () => {
    const started = new Date(
      NOW.getTime() - SESSION_SERVER_BACKSTOP_SECONDS * 1000
    ).toISOString();
    expect(isSessionWithinBackstop(started, NOW)).toBe(true);
  });

  it("rejects a tool call past the 16-min backstop", () => {
    const started = new Date(
      NOW.getTime() - (SESSION_SERVER_BACKSTOP_SECONDS + 1) * 1000
    ).toISOString();
    expect(isSessionWithinBackstop(started, NOW)).toBe(false);
  });

  it("rejects an unparseable start time", () => {
    expect(isSessionWithinBackstop("not-a-date", NOW)).toBe(false);
  });
});

describe("voice caps — client local-date validation (cap 4 anti-spoof)", () => {
  it("accepts today's date", () => {
    expect(isPlausibleLocalDate("2026-05-28", NOW)).toBe(true);
  });

  it("accepts ±1 day (timezone slack)", () => {
    expect(isPlausibleLocalDate("2026-05-27", NOW)).toBe(true);
    expect(isPlausibleLocalDate("2026-05-29", NOW)).toBe(true);
  });

  it("rejects a date more than a day off (quota-reset spoof attempt)", () => {
    expect(isPlausibleLocalDate("2026-05-01", NOW)).toBe(false);
    expect(isPlausibleLocalDate("2026-06-15", NOW)).toBe(false);
  });

  it("rejects malformed dates", () => {
    expect(isPlausibleLocalDate("nope", NOW)).toBe(false);
    expect(isPlausibleLocalDate("2026-13-40", NOW)).toBe(false);
  });
});

describe("voice caps — window helpers", () => {
  it("dayWindow spans exactly 24h from local midnight", () => {
    const { startISO, endISO } = dayWindow("2026-05-28");
    expect(startISO).toBe("2026-05-28T00:00:00.000Z");
    expect(endISO).toBe("2026-05-29T00:00:00.000Z");
  });

  it("monthWindow spans the full UTC month", () => {
    const { startISO, endISO } = monthWindow(NOW);
    expect(startISO).toBe("2026-05-01T00:00:00.000Z");
    expect(endISO).toBe("2026-06-01T00:00:00.000Z");
  });
});
