import { describe, it, expect } from "vitest";
import {
  classifyReadiness,
  daysUntilDate,
  localMidnight,
  weekWindows,
} from "@/lib/exam-timeline";

describe("classifyReadiness", () => {
  it("returns unknown when predicted is null", () => {
    expect(classifyReadiness(null, 750)).toBe("unknown");
  });
  it("ready at or above passing", () => {
    expect(classifyReadiness(750, 750)).toBe("ready");
    expect(classifyReadiness(820, 750)).toBe("ready");
  });
  it("on-track within one band below passing", () => {
    expect(classifyReadiness(700, 750)).toBe("on-track");
    expect(classifyReadiness(690, 750)).toBe("on-track"); // 750-60 boundary
  });
  it("behind when well below passing", () => {
    expect(classifyReadiness(689, 750)).toBe("behind");
    expect(classifyReadiness(400, 750)).toBe("behind");
  });
});

describe("daysUntilDate", () => {
  it("counts whole days to a future date-only string", () => {
    const now = new Date(2026, 0, 1, 13, 30); // Jan 1 2026, afternoon
    expect(daysUntilDate("2026-01-08", now)).toBe(7);
    expect(daysUntilDate("2026-01-01", now)).toBe(0); // today
  });
  it("is negative for a past date", () => {
    const now = new Date(2026, 0, 10);
    expect(daysUntilDate("2026-01-01", now)).toBe(-9);
  });
});

describe("localMidnight", () => {
  it("strips the time component", () => {
    const m = localMidnight(new Date(2026, 5, 7, 23, 59, 59));
    expect(m.getHours()).toBe(0);
    expect(m.getMinutes()).toBe(0);
    expect(m.getDate()).toBe(7);
  });
});

describe("weekWindows", () => {
  it("builds one 7-day window per week up to the cap", () => {
    const now = new Date(2026, 0, 1); // Thu Jan 1 2026
    const w = weekWindows(now, 3);
    expect(w).toHaveLength(3);
    expect(w[0].start.getDate()).toBe(1);
    expect(w[0].end.getDate()).toBe(7); // start + 6 days
    expect(w[1].start.getDate()).toBe(8);
  });
  it("caps long horizons", () => {
    const now = new Date(2026, 0, 1);
    expect(weekWindows(now, 52, 12)).toHaveLength(12);
  });
  it("returns empty for a non-positive horizon", () => {
    expect(weekWindows(new Date(2026, 0, 1), 0)).toHaveLength(0);
  });
});
