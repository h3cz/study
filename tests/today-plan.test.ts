/**
 * today-plan.test.ts
 *
 * Tests for getTodayPlan() logic.
 * Runs in Node (no IndexedDB); we test the pure plan-building logic extracted below.
 */

import { describe, it, expect } from "vitest";
import type { TodayPlanItem } from "../lib/today";

// ─── Types mirroring lib/db (only what we need) ───────────────────────────────

interface QuizSession {
  id?: number;
  certId: string;
  startedAt: string;
  completedAt?: string;
  questionIds: string[];
  answers: Record<string, string>;
  score: number;
  xpEarned: number;
  kind?: "mcq" | "pbq";
}

interface DrillSession {
  id?: number;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  correct: number;
  incorrect: number;
  skipped: number;
  attempts: { acronymId: string; userAnswer: string; correct: boolean; ms: number }[];
}

interface MockExamSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  totalQuestions: number;
  numCorrect: number;
  scorePercent: number;
  predictedScore: number;
  passed: boolean;
  domainBreakdown: Record<string, { correct: number; total: number }>;
  questions: { qId: string; picked: string | null; correct: boolean; flagged: boolean; kind: "mcq" | "pbq" }[];
}

// ─── Pure implementation of getTodayPlan logic ────────────────────────────────

interface PlanInputs {
  today: string;                   // YYYY-MM-DD
  dueFlashcardCount: number;       // raw count from getDueFlashcards
  fsrsDueCount: number;            // from getDueQuestionCount
  totalWrong: number;              // from getWrongAnswerStats
  quizSessions: QuizSession[];
  drillSessions: DrillSession[];
  examDate?: string;               // UserState.examDate (ISO date or undefined)
  recentMocks: MockExamSession[];
}

function computeTodayPlan(inputs: PlanInputs): TodayPlanItem[] {
  const { today, dueFlashcardCount, fsrsDueCount, totalWrong, quizSessions, drillSessions, examDate, recentMocks } = inputs;
  const items: TodayPlanItem[] = [];

  // 1. FSRS due MCQs (priority 1) — only when count > 0
  if (fsrsDueCount > 0) {
    const cappedCount = Math.min(fsrsDueCount, 10);
    items.push({
      kind: "fsrs",
      label: "Scheduled FSRS review",
      detail: `${cappedCount} question${cappedCount !== 1 ? "s" : ""} due`,
      estMinutes: cappedCount,
      href: "/quiz?mode=fsrs",
      priority: 1,
      done: false,
    });
  }

  // 2. Wrong-answer review (priority 2) — only when count > 0
  if (totalWrong > 0) {
    const m = totalWrong;
    items.push({
      kind: "wrong-review",
      label: "Wrong-answer review",
      detail: `${m} question${m !== 1 ? "s" : ""} from last 14 days`,
      estMinutes: m,
      href: "/review",
      priority: 2,
      done: false,
    });
  }

  // 3. Daily quiz (priority 3)
  {
    const todayCompleted = quizSessions.some(
      (s) =>
        s.completedAt &&
        s.completedAt.startsWith(today) &&
        (s.kind === "mcq" || s.kind === undefined || s.kind === null)
    );
    items.push({
      kind: "daily-quiz",
      label: "10-question daily quiz",
      detail: "10 questions",
      estMinutes: 10,
      href: "/quiz",
      priority: 3,
      done: todayCompleted,
    });
  }

  // 4. Flashcards (priority 4) — only when count > 0
  if (dueFlashcardCount > 0) {
    const cappedCount = Math.min(dueFlashcardCount, 15);
    items.push({
      kind: "flashcards",
      label: "Flashcard review",
      detail: `${cappedCount} card${cappedCount !== 1 ? "s" : ""} due`,
      estMinutes: Math.round(cappedCount * 0.5),
      href: "/flashcards",
      priority: 4,
      done: false,
    });
  }

  // 5. Acronym drill (priority 5)
  {
    const drillDoneToday = drillSessions.some(
      (s) => s.completedAt && s.completedAt.startsWith(today)
    );
    items.push({
      kind: "drill",
      label: "Acronym drill",
      detail: "60-second rapid recall",
      estMinutes: 1,
      href: "/drill",
      priority: 5,
      done: drillDoneToday,
    });
  }

  // 6. Mock exam suggestion (priority 6, conditional)
  if (examDate) {
    const now = new Date(today + "T00:00:00");
    const target = new Date(examDate + "T00:00:00");
    const daysUntil = Math.ceil(
      (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil >= 0 && daysUntil <= 30) {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const recentMock = recentMocks.find(
        (e) => e.completedAt && e.completedAt >= sevenDaysAgo
      );
      if (!recentMock) {
        items.push({
          kind: "mock-exam",
          label: "Full mock exam",
          detail: `${daysUntil} day${daysUntil !== 1 ? "s" : ""} until exam · 90 Qs`,
          estMinutes: 90,
          href: "/exam",
          priority: 6,
          done: false,
        });
      }
    }
  }

  // Sort by priority
  items.sort((a, b) => a.priority - b.priority);
  return items;
}

function totalEstMinutes(items: TodayPlanItem[]): number {
  return items.reduce((sum, i) => sum + i.estMinutes, 0);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

const TODAY = "2026-05-27";

describe("getTodayPlan (pure logic)", () => {
  it("all 5 base items present when all queues have work (no exam date)", () => {
    const items = computeTodayPlan({
      today: TODAY,
      dueFlashcardCount: 8,
      fsrsDueCount: 5,
      totalWrong: 3,
      quizSessions: [],
      drillSessions: [],
      recentMocks: [],
    });
    const kinds = items.map((i) => i.kind);
    expect(kinds).toContain("daily-quiz");
    expect(kinds).toContain("flashcards");
    expect(kinds).toContain("fsrs");
    expect(kinds).toContain("wrong-review");
    expect(kinds).toContain("drill");
    expect(kinds).not.toContain("mock-exam");
  });

  it("FSRS=0 → no fsrs row", () => {
    const items = computeTodayPlan({
      today: TODAY,
      dueFlashcardCount: 5,
      fsrsDueCount: 0,
      totalWrong: 2,
      quizSessions: [],
      drillSessions: [],
      recentMocks: [],
    });
    expect(items.some((i) => i.kind === "fsrs")).toBe(false);
  });

  it("wrong=0 → no wrong-review row", () => {
    const items = computeTodayPlan({
      today: TODAY,
      dueFlashcardCount: 5,
      fsrsDueCount: 3,
      totalWrong: 0,
      quizSessions: [],
      drillSessions: [],
      recentMocks: [],
    });
    expect(items.some((i) => i.kind === "wrong-review")).toBe(false);
  });

  it("dueFlashcards=0 → no flashcards row", () => {
    const items = computeTodayPlan({
      today: TODAY,
      dueFlashcardCount: 0,
      fsrsDueCount: 3,
      totalWrong: 2,
      quizSessions: [],
      drillSessions: [],
      recentMocks: [],
    });
    expect(items.some((i) => i.kind === "flashcards")).toBe(false);
  });

  it("daily-quiz always present; not done without a session today", () => {
    const items = computeTodayPlan({
      today: TODAY,
      dueFlashcardCount: 0,
      fsrsDueCount: 0,
      totalWrong: 0,
      quizSessions: [],
      drillSessions: [],
      recentMocks: [],
    });
    const quiz = items.find((i) => i.kind === "daily-quiz");
    expect(quiz).toBeDefined();
    expect(quiz?.done).toBe(false);
  });

  it("daily quiz marked done after a completed MCQ session today", () => {
    const items = computeTodayPlan({
      today: TODAY,
      dueFlashcardCount: 0,
      fsrsDueCount: 0,
      totalWrong: 0,
      quizSessions: [
        {
          id: 1,
          certId: "secplus-sy0-701",
          startedAt: `${TODAY}T09:00:00.000Z`,
          completedAt: `${TODAY}T09:10:00.000Z`,
          questionIds: [],
          answers: {},
          score: 80,
          xpEarned: 20,
          kind: "mcq",
        },
      ],
      drillSessions: [],
      recentMocks: [],
    });
    const quiz = items.find((i) => i.kind === "daily-quiz");
    expect(quiz?.done).toBe(true);
  });

  it("drill always present regardless of empty queues", () => {
    const items = computeTodayPlan({
      today: TODAY,
      dueFlashcardCount: 0,
      fsrsDueCount: 0,
      totalWrong: 0,
      quizSessions: [],
      drillSessions: [],
      recentMocks: [],
    });
    expect(items.some((i) => i.kind === "drill")).toBe(true);
  });

  it("mock exam suggestion only appears when exam is within 30 days and no recent mock", () => {
    // Exam is 15 days away, no recent mock → should appear
    const examDate = new Date(new Date(TODAY).getTime() + 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const items = computeTodayPlan({
      today: TODAY,
      dueFlashcardCount: 0,
      fsrsDueCount: 0,
      totalWrong: 0,
      quizSessions: [],
      drillSessions: [],
      examDate,
      recentMocks: [],
    });
    expect(items.some((i) => i.kind === "mock-exam")).toBe(true);

    // Now with a recent mock done 3 days ago → should NOT appear
    const recentMockDate = new Date(new Date(TODAY).getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const items2 = computeTodayPlan({
      today: TODAY,
      dueFlashcardCount: 0,
      fsrsDueCount: 0,
      totalWrong: 0,
      quizSessions: [],
      drillSessions: [],
      examDate,
      recentMocks: [
        {
          id: "mock-1",
          startedAt: recentMockDate,
          completedAt: recentMockDate,
          totalQuestions: 90,
          numCorrect: 70,
          scorePercent: 78,
          predictedScore: 780,
          passed: true,
          domainBreakdown: {},
          questions: [],
        },
      ],
    });
    expect(items2.some((i) => i.kind === "mock-exam")).toBe(false);

    // Exam is 45 days away → should NOT appear (outside 30-day window)
    const farExamDate = new Date(new Date(TODAY).getTime() + 45 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const items3 = computeTodayPlan({
      today: TODAY,
      dueFlashcardCount: 0,
      fsrsDueCount: 0,
      totalWrong: 0,
      quizSessions: [],
      drillSessions: [],
      examDate: farExamDate,
      recentMocks: [],
    });
    expect(items3.some((i) => i.kind === "mock-exam")).toBe(false);
  });

  it("totalEstMinutes sums correctly", () => {
    // 5 fsrs (capped) + 4 wrong + 10 daily-quiz + round(6 * 0.5)=3 flashcards + 1 drill = 23
    const items = computeTodayPlan({
      today: TODAY,
      dueFlashcardCount: 6,
      fsrsDueCount: 5,
      totalWrong: 4,
      quizSessions: [],
      drillSessions: [],
      recentMocks: [],
    });
    expect(totalEstMinutes(items)).toBe(5 + 4 + 10 + 3 + 1);
  });

  it("items are sorted by priority (fsrs first when present, mock-exam last if present)", () => {
    const examDate = new Date(new Date(TODAY).getTime() + 10 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const items = computeTodayPlan({
      today: TODAY,
      dueFlashcardCount: 4,
      fsrsDueCount: 3,
      totalWrong: 2,
      quizSessions: [],
      drillSessions: [],
      examDate,
      recentMocks: [],
    });
    for (let i = 1; i < items.length; i++) {
      expect(items[i].priority).toBeGreaterThanOrEqual(items[i - 1].priority);
    }
    expect(items[0].kind).toBe("fsrs");
    expect(items[items.length - 1].kind).toBe("mock-exam");
  });
});
