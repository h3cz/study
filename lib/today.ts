/**
 * lib/today.ts
 *
 * Computes the "Today's plan" for the dashboard widget.
 * Pulls entirely from existing DB helpers — no new APIs, no schema changes.
 */

import { db } from "@/lib/db";
import { getDueFlashcards } from "@/lib/fsrs";
import { getDueQuestionCount } from "@/lib/fsrs-mcq";
import { getWrongAnswerStats } from "@/lib/wrong-answers";

export interface TodayPlanItem {
  kind: "daily-quiz" | "flashcards" | "fsrs" | "wrong-review" | "drill" | "mock-exam";
  label: string;
  detail?: string;
  estMinutes: number;
  href: string;
  priority: number; // 1 = top
  done?: boolean;
}

export interface TodayPlan {
  items: TodayPlanItem[];
  totalEstMinutes: number;
  completedCount: number;
}

/** Return today's date string as YYYY-MM-DD in local time. */
function todayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getTodayPlan(certId: string): Promise<TodayPlan> {
  const today = todayDateString();

  // Fetch all needed data in parallel
  const [dueFlashcards, fsrsDue, wrongStats, quizSessions, drillSessions, userState, recentMocks] =
    await Promise.all([
      getDueFlashcards(certId).catch(() => [] as Awaited<ReturnType<typeof getDueFlashcards>>),
      getDueQuestionCount(certId).catch(() => 0),
      getWrongAnswerStats().catch(() => ({ totalWrong: 0, byDomain: {}, byObjective: {} })),
      db.quizSessions.where("certId").equals(certId).toArray().catch(() => []),
      db.drillSessions.toArray().catch(() => []),
      db.userState.get(1).catch(() => undefined),
      db.mockExamSessions.orderBy("startedAt").reverse().limit(10).toArray().catch(() => []),
    ]);

  const items: TodayPlanItem[] = [];

  // ── 1. FSRS due MCQs (priority 1) — only show when there are cards due ─────
  if (fsrsDue > 0) {
    const cappedCount = Math.min(fsrsDue, 10);
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

  // ── 2. Wrong-answer review (priority 2) — only show when there are wrongs ──
  if (wrongStats.totalWrong > 0) {
    const m = wrongStats.totalWrong;
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

  // ── 3. Daily quiz (priority 3) ────────────────────────────────────────────
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

  // ── 4. Due flashcards (priority 4) — only show when cards are due ─────────
  if (dueFlashcards.length > 0) {
    const cappedCount = Math.min(dueFlashcards.length, 15);
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

  // ── 5. Acronym drill (priority 5) ─────────────────────────────────────────
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

  // ── 6. Mock exam suggestion (priority 6, conditional) ─────────────────────
  {
    const examDate = userState?.examDate;
    if (examDate) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const target = new Date(examDate + "T00:00:00");
      const daysUntil = Math.ceil(
        (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntil >= 0 && daysUntil <= 30) {
        // Only show if no mock exam in last 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
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
  }

  // Sort by priority
  items.sort((a, b) => a.priority - b.priority);

  const totalEstMinutes = items.reduce((sum, item) => sum + item.estMinutes, 0);
  const completedCount = items.filter((i) => i.done).length;

  return { items, totalEstMinutes, completedCount };
}
