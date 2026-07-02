/**
 * study-recommender.test.ts
 *
 * Behavior-first tests for the pure adaptive recommender (lib/study-recommender.ts).
 * Runs in Node (no IndexedDB) — exercises rankStudyActivities() and its pure
 * component helpers on hand-built snapshots. The DB adapter buildStudySnapshot()
 * is NOT exercised here (it is the thin Dexie layer), matching the established
 * pattern in today-plan.test.ts / mastery.test.ts.
 */

import { describe, it, expect } from "vitest";
import {
  rankStudyActivities,
  examDateFactor,
  timeFit,
  isColdStart,
  fsrsOverdueFires,
  COLD_START_MASTERY,
  URGENCY_MAX,
  type StudySnapshot,
  type DomainSnapshot,
} from "../lib/study-recommender";

// ─── Domain weights (mirror seeded Domain records) ────────────────────────────

const D = (
  number: number,
  weight: number,
  mastery: number | null,
  recentWrong = 0
): DomainSnapshot => ({
  domainId: `secplus-sy0-701:domain:${number}`,
  number,
  name: `Domain ${number}`,
  weight,
  mastery,
  recentWrong,
});

const SEED_WEIGHTS: Record<number, number> = {
  1: 0.12,
  2: 0.22,
  3: 0.18,
  4: 0.28,
  5: 0.2,
};

/** Five domains with the seeded exam weights and the given masteries. */
function seedDomains(
  masteries: Partial<Record<number, number | null>> = {},
  recentWrong: Partial<Record<number, number>> = {}
): DomainSnapshot[] {
  return [1, 2, 3, 4, 5].map((n) =>
    D(n, SEED_WEIGHTS[n], masteries[n] ?? null, recentWrong[n] ?? 0)
  );
}

const NOW = new Date("2026-05-30T20:00:00.000Z");

function makeSnapshot(overrides: Partial<StudySnapshot> = {}): StudySnapshot {
  return {
    domains: seedDomains(),
    weakestObjectives: [],
    fsrsDue: [],
    wrongAnswerTotal: 0,
    flashcardsDue: 0,
    dailySessionMinutes: 20,
    examDateIso: null,
    daysUntilExam: null,
    streakAtRisk: null,
    answeredQuestionCount: 100, // past cold-start by default
    completedQuizCount: 10,
    paceMsPerQuestion: 60_000, // 1 min/question for clean math
    ...overrides,
  };
}

// ─── examDateFactor ────────────────────────────────────────────────────────────

describe("examDateFactor", () => {
  it("is 1.0 with no exam date or beyond 30 days", () => {
    expect(examDateFactor(null)).toBe(1.0);
    expect(examDateFactor(60)).toBe(1.0);
    expect(examDateFactor(31)).toBe(1.0);
  });

  it("mild ramp 1.0 → ~1.2 in the (7, 30] window, approaching 1.2 just above T-7", () => {
    expect(examDateFactor(30)).toBeCloseTo(1.0, 5);
    // The mild ramp peaks at ~1.2 as days → 7 from above (7.0001 ≈ 1.2).
    expect(examDateFactor(7.0001)).toBeCloseTo(1.2, 3);
    // midpoint between 30 and 7
    const mid = examDateFactor(18);
    expect(mid).toBeGreaterThan(1.0);
    expect(mid).toBeLessThan(1.2);
  });

  it("final-week ramp is continuous with the mild ramp (1.2 at T-7 → 2.0 at T-0)", () => {
    // The mild ramp ends at ~1.2 just above T-7 and the final-week ramp now also
    // starts at 1.2 at T-7 — no step-down at the boundary.
    expect(examDateFactor(7)).toBeCloseTo(1.2, 5);
    expect(examDateFactor(0)).toBeCloseTo(2.0, 5);
    expect(examDateFactor(1)).toBeCloseTo(1.2 + (6 / 7) * 0.8, 5);
    expect(examDateFactor(3.5)).toBeCloseTo(1.6, 5); // midpoint
    expect(examDateFactor(-3)).toBe(2.0); // clamped past exam day
  });
});

// ─── timeFit ───────────────────────────────────────────────────────────────────

describe("timeFit", () => {
  it("is 1.0 when activity uses 30-100% of the budget", () => {
    expect(timeFit(10, 20)).toBe(1.0);
    expect(timeFit(20, 20)).toBe(1.0);
    expect(timeFit(6, 20)).toBe(1.0);
  });

  it("penalises tiny activities below 30% of budget", () => {
    expect(timeFit(1, 20)).toBeGreaterThanOrEqual(0.6);
    expect(timeFit(1, 20)).toBeLessThan(1.0);
  });

  it("decays for activities longer than the budget", () => {
    expect(timeFit(40, 20)).toBeLessThan(1.0);
    expect(timeFit(40, 20)).toBeGreaterThanOrEqual(0.4);
  });
});

// ─── cold-start ─────────────────────────────────────────────────────────────────

describe("cold-start detection", () => {
  it("is cold-start with no completed quiz and < 15 answered", () => {
    expect(
      isColdStart(makeSnapshot({ completedQuizCount: 0, answeredQuestionCount: 5 }))
    ).toBe(true);
  });

  it("exits cold-start once a quiz is completed", () => {
    expect(
      isColdStart(makeSnapshot({ completedQuizCount: 1, answeredQuestionCount: 0 }))
    ).toBe(false);
  });

  it("exits cold-start once ≥ 15 questions answered", () => {
    expect(
      isColdStart(makeSnapshot({ completedQuizCount: 0, answeredQuestionCount: 15 }))
    ).toBe(false);
  });
});

// ─── fsrsOverdueFires ────────────────────────────────────────────────────────────

describe("fsrsOverdueFires", () => {
  it("fires when total due backlog ≥ 20", () => {
    const due = Array.from({ length: 20 }, (_, i) => ({
      questionId: `q${i}`,
      domainId: "secplus-sy0-701:domain:2",
      fsrsDueIso: NOW.toISOString(), // not individually overdue
      scheduledDays: 5,
    }));
    expect(fsrsOverdueFires(makeSnapshot({ fsrsDue: due }), NOW)).toBe(true);
  });

  it("fires when a single item is overdue by ≥ 200% of its interval", () => {
    // scheduledDays = 5 → overdue threshold = 10 days. Make it 11 days overdue.
    const dueIso = new Date(NOW.getTime() - 11 * 24 * 60 * 60 * 1000).toISOString();
    const due = [
      {
        questionId: "q1",
        domainId: "secplus-sy0-701:domain:2",
        fsrsDueIso: dueIso,
        scheduledDays: 5,
      },
    ];
    expect(fsrsOverdueFires(makeSnapshot({ fsrsDue: due }), NOW)).toBe(true);
  });

  it("does NOT fire for a few mildly-due cards", () => {
    const dueIso = new Date(NOW.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
    const due = [
      {
        questionId: "q1",
        domainId: "secplus-sy0-701:domain:2",
        fsrsDueIso: dueIso,
        scheduledDays: 10,
      },
    ];
    expect(fsrsOverdueFires(makeSnapshot({ fsrsDue: due }), NOW)).toBe(false);
  });
});

// ─── Named behavioural scenarios ─────────────────────────────────────────────────

describe("rankStudyActivities — scenarios", () => {
  it("weak high-weight domain near exam → weakest-domain-drill on top", () => {
    const snap = makeSnapshot({
      // D4 (.28) is weakest; everything else strong.
      domains: seedDomains({ 1: 0.8, 2: 0.85, 3: 0.8, 4: 0.2, 5: 0.85 }),
      weakestObjectives: [
        {
          objectiveId: "secplus-sy0-701:obj:4.1",
          domainId: "secplus-sy0-701:domain:4",
          code: "4.1",
          name: "Security operations",
          mastery: 0.2,
        },
      ],
      daysUntilExam: 5,
      examDateIso: "2026-06-04",
    });
    const rec = rankStudyActivities(snap, NOW);
    expect(rec.top.kind).toBe("weakest-domain-drill");
    expect(rec.top.targetDomain).toBe("Domain 4");
    expect(rec.top.href).toContain("mode=weak-domain");
    expect(rec.top.href).toContain("domain=4");
    // The href must carry n=<truncatedCount> so /quiz launches the advertised
    // number of questions (not its default 10). Regression guard for the codex
    // P2 finding: card said "12 questions" but link launched 10.
    expect(rec.top.href).toContain(`n=${rec.top.truncatedCount}`);
    expect(rec.top.rationale.toLowerCase()).toContain("domain 4");
    expect(rec.top.overrideReason).toBeNull();
  });

  it("20+ FSRS overdue triggers the fsrs-overdue override", () => {
    const due = Array.from({ length: 22 }, (_, i) => ({
      questionId: `q${i}`,
      domainId: "secplus-sy0-701:domain:2",
      fsrsDueIso: NOW.toISOString(),
      scheduledDays: 4,
    }));
    const snap = makeSnapshot({
      domains: seedDomains({ 1: 0.3, 2: 0.3, 3: 0.3, 4: 0.3, 5: 0.3 }),
      fsrsDue: due,
    });
    const rec = rankStudyActivities(snap, NOW);
    expect(rec.top.kind).toBe("fsrs-mcq");
    expect(rec.top.overrideReason).toBe("fsrs-overdue");
    expect(rec.top.rationale.toLowerCase()).toContain("overdue");
  });

  it("streak-at-risk with ~10 min budget picks a quick win", () => {
    const snap = makeSnapshot({
      streakAtRisk: { atRisk: true, minutesLeft: 10, hasFreezeAvailable: false },
      // Give it some work so multiple candidates exist.
      wrongAnswerTotal: 30,
      fsrsDue: [
        {
          questionId: "q1",
          domainId: "secplus-sy0-701:domain:2",
          fsrsDueIso: NOW.toISOString(),
          scheduledDays: 5,
        },
      ],
    });
    const rec = rankStudyActivities(snap, NOW);
    expect(rec.top.overrideReason).toBe("streak-at-risk");
    // The quick-win must fit inside the 10-minute window.
    expect(rec.top.estMinutes).toBeLessThanOrEqual(10);
    expect(rec.top.rationale.toLowerCase()).toContain("streak");
  });

  it("streak-at-risk does NOT fire when a freeze is available", () => {
    // A freeze auto-applies, so the panic CTA would be misleading — override must
    // stay off and the recommendation falls back to normal exam-impact scoring.
    const snap = makeSnapshot({
      streakAtRisk: { atRisk: true, minutesLeft: 10, hasFreezeAvailable: true },
      wrongAnswerTotal: 30,
    });
    const rec = rankStudyActivities(snap, NOW);
    expect(rec.top.overrideReason).not.toBe("streak-at-risk");
  });

  it("cold-start new user gets the daily-quiz diagnostic, not a targeted drill", () => {
    const snap = makeSnapshot({
      completedQuizCount: 0,
      answeredQuestionCount: 3,
      domains: seedDomains(), // all null mastery
    });
    const rec = rankStudyActivities(snap, NOW);
    expect(rec.top.kind).toBe("daily-quiz");
    expect(rec.top.label.toLowerCase()).toContain("diagnostic");
    expect(rec.candidates.some((c) => c.kind === "weakest-domain-drill")).toBe(false);
    expect(rec.top.rationale.toLowerCase()).toContain("weak spots");
  });

  it("fsrs-overdue override outranks streak-at-risk when both active", () => {
    const due = Array.from({ length: 25 }, (_, i) => ({
      questionId: `q${i}`,
      domainId: "secplus-sy0-701:domain:4",
      fsrsDueIso: NOW.toISOString(),
      scheduledDays: 3,
    }));
    const snap = makeSnapshot({
      fsrsDue: due,
      streakAtRisk: { atRisk: true, minutesLeft: 10, hasFreezeAvailable: false },
    });
    const rec = rankStudyActivities(snap, NOW);
    expect(rec.top.kind).toBe("fsrs-mcq");
    expect(rec.top.overrideReason).toBe("fsrs-overdue");
  });
});

// ─── Ordering / tie-breakers ──────────────────────────────────────────────────

describe("rankStudyActivities — ordering & tie-breakers", () => {
  it("candidates are sorted descending by score (no active override)", () => {
    const snap = makeSnapshot({
      domains: seedDomains({ 1: 0.5, 2: 0.4, 3: 0.5, 4: 0.3, 5: 0.5 }),
      wrongAnswerTotal: 4,
      flashcardsDue: 6,
      fsrsDue: [
        {
          questionId: "q1",
          domainId: "secplus-sy0-701:domain:2",
          fsrsDueIso: NOW.toISOString(),
          scheduledDays: 5,
        },
      ],
    });
    const rec = rankStudyActivities(snap, NOW);
    const noOverride = rec.candidates.filter((c) => c.overrideReason === null);
    for (let i = 1; i < noOverride.length; i++) {
      expect(noOverride[i - 1].score).toBeGreaterThanOrEqual(noOverride[i].score - 1e-9);
    }
    expect(rec.top).toBe(rec.candidates[0]);
  });

  it("higher exam weight wins when scores tie (tie-breaker 1)", () => {
    // Two equally-weak domains differing only in exam weight: D4 (.28) vs D1 (.12).
    // Both at the same mastery → drill should target the higher-weight domain.
    const snap = makeSnapshot({
      domains: [
        D(1, 0.12, 0.2),
        D(2, 0.0, 1.0), // zeroed out so it never competes
        D(3, 0.0, 1.0),
        D(4, 0.28, 0.2),
        D(5, 0.0, 1.0),
      ],
    });
    const rec = rankStudyActivities(snap, NOW);
    expect(rec.top.kind).toBe("weakest-domain-drill");
    expect(rec.top.targetDomain).toBe("Domain 4");
  });

  it("is fully deterministic — identical input yields identical output", () => {
    const snap = makeSnapshot({
      domains: seedDomains({ 1: 0.5, 2: 0.4, 3: 0.6, 4: 0.3, 5: 0.55 }),
      wrongAnswerTotal: 5,
      flashcardsDue: 8,
    });
    const a = rankStudyActivities(snap, NOW);
    const b = rankStudyActivities(snap, NOW);
    expect(a.candidates.map((c) => c.kind)).toEqual(b.candidates.map((c) => c.kind));
    expect(a.candidates.map((c) => c.score)).toEqual(b.candidates.map((c) => c.score));
  });
});

// ─── Time-boxing / truncation ─────────────────────────────────────────────────

describe("rankStudyActivities — time-boxing", () => {
  it("truncates a large FSRS backlog to fit the budget and reports the count", () => {
    // 50 due, 20-min budget at 1 min/Q → fit 20.
    const due = Array.from({ length: 50 }, (_, i) => ({
      questionId: `q${i}`,
      domainId: "secplus-sy0-701:domain:2",
      fsrsDueIso: NOW.toISOString(),
      scheduledDays: 5,
    }));
    const snap = makeSnapshot({ fsrsDue: due, dailySessionMinutes: 20 });
    const rec = rankStudyActivities(snap, NOW);
    const fsrs = rec.candidates.find((c) => c.kind === "fsrs-mcq")!;
    expect(fsrs.truncatedCount).toBe(20);
    expect(fsrs.estMinutes).toBe(20);
    expect(fsrs.detail).toContain("20 question");
    expect(fsrs.detail).toContain("~20 min");
  });

  it("only recommends a mock exam when the budget is ≥ ~45 min", () => {
    const small = rankStudyActivities(makeSnapshot({ dailySessionMinutes: 20 }), NOW);
    expect(small.candidates.some((c) => c.kind === "mock-exam")).toBe(false);

    const large = rankStudyActivities(makeSnapshot({ dailySessionMinutes: 60 }), NOW);
    expect(large.candidates.some((c) => c.kind === "mock-exam")).toBe(true);
  });

  it("weakest-domain drill is truncated to at most 12 questions", () => {
    const snap = makeSnapshot({
      domains: seedDomains({ 1: 0.9, 2: 0.9, 3: 0.9, 4: 0.2, 5: 0.9 }),
      dailySessionMinutes: 30, // would fit 30, but drill caps at 12
    });
    const rec = rankStudyActivities(snap, NOW);
    const drill = rec.candidates.find((c) => c.kind === "weakest-domain-drill")!;
    expect(drill.truncatedCount).toBe(12);
  });
});

// ─── Exact-numeric component math (locks the model) ──────────────────────────────

describe("rankStudyActivities — exact component math", () => {
  it("weakest-domain-drill components multiply to the reported score", () => {
    // Single weak domain D4 (.28) at mastery 0.25; everyone else maxed so D4 wins.
    // No exam date (edf=1.0), pace 1 min/Q, budget 20 → fitCount = min(12, 20) = 12,
    // estMinutes = 12 → timeFit = 1.0 (12/20 = 0.6 ∈ [0.3,1.0]).
    // urgency = 1.0 + min(recentWrong=0,5)*0.1 = 1.0.
    // masteryGap = 1 - 0.25 = 0.75. examWeight = 0.28.
    // score = 0.28 * 0.75 * 1.0 * 1.0 * 1.0 = 0.21.
    const snap = makeSnapshot({
      domains: [
        D(1, 0.12, 1.0),
        D(2, 0.22, 1.0),
        D(3, 0.18, 1.0),
        D(4, 0.28, 0.25),
        D(5, 0.2, 1.0),
      ],
      dailySessionMinutes: 20,
      paceMsPerQuestion: 60_000,
    });
    const rec = rankStudyActivities(snap, NOW);
    const drill = rec.candidates.find((c) => c.kind === "weakest-domain-drill")!;
    expect(drill.components.examWeight).toBeCloseTo(0.28, 10);
    expect(drill.components.masteryGap).toBeCloseTo(0.75, 10);
    expect(drill.components.urgency).toBeCloseTo(1.0, 10);
    expect(drill.components.examDateFactor).toBeCloseTo(1.0, 10);
    expect(drill.components.timeFit).toBeCloseTo(1.0, 10);
    expect(drill.score).toBeCloseTo(0.28 * 0.75 * 1.0 * 1.0 * 1.0, 10);
    expect(drill.score).toBeCloseTo(0.21, 10);
  });

  it("recentWrong bumps drill urgency by 0.1 per wrong (capped at 5)", () => {
    const snap = makeSnapshot({
      domains: [
        D(1, 0.12, 1.0),
        D(2, 0.22, 1.0),
        D(3, 0.18, 1.0),
        D(4, 0.28, 0.25, 3), // 3 recent wrongs
        D(5, 0.2, 1.0),
      ],
    });
    const rec = rankStudyActivities(snap, NOW);
    const drill = rec.candidates.find((c) => c.kind === "weakest-domain-drill")!;
    // urgency = 1.0 + 3*0.1 = 1.3
    expect(drill.components.urgency).toBeCloseTo(1.3, 10);
  });

  it("examDateFactor flows into the reported component at T-0", () => {
    const snap = makeSnapshot({
      domains: [
        D(1, 0.12, 1.0),
        D(2, 0.22, 1.0),
        D(3, 0.18, 1.0),
        D(4, 0.28, 0.25),
        D(5, 0.2, 1.0),
      ],
      daysUntilExam: 0,
      examDateIso: "2026-05-30",
    });
    const rec = rankStudyActivities(snap, NOW);
    const drill = rec.candidates.find((c) => c.kind === "weakest-domain-drill")!;
    expect(drill.components.examDateFactor).toBeCloseTo(2.0, 10);
    // score doubles vs the no-exam case (0.21 → 0.42)
    expect(drill.score).toBeCloseTo(0.42, 10);
  });

  it("applies the cold-start prior (0.3) to unquizzed domains in the gap", () => {
    // All domains null mastery, post-cold-start (so drill is offered).
    const snap = makeSnapshot({
      domains: seedDomains(), // all null
      completedQuizCount: 5,
      answeredQuestionCount: 50,
    });
    const rec = rankStudyActivities(snap, NOW);
    const drill = rec.candidates.find((c) => c.kind === "weakest-domain-drill")!;
    // masteryGap = 1 - COLD_START_MASTERY
    expect(drill.components.masteryGap).toBeCloseTo(1 - COLD_START_MASTERY, 10);
    // weakest domain by weight*(1-0.3) → D4 (.28)
    expect(drill.targetDomain).toBe("Domain 4");
  });

  it("urgency is clamped at URGENCY_MAX", () => {
    // Deeply overdue single card → raw overdue ratio is huge; must clamp.
    const dueIso = new Date(NOW.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const snap = makeSnapshot({
      fsrsDue: [
        {
          questionId: "q1",
          domainId: "secplus-sy0-701:domain:2",
          fsrsDueIso: dueIso,
          scheduledDays: 1,
        },
      ],
    });
    const rec = rankStudyActivities(snap, NOW);
    const fsrs = rec.candidates.find((c) => c.kind === "fsrs-mcq")!;
    expect(fsrs.components.urgency).toBeLessThanOrEqual(URGENCY_MAX);
    expect(fsrs.components.urgency).toBeCloseTo(URGENCY_MAX, 10);
  });
});
