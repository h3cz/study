// Exam Readiness Timeline — a forward-looking, week-by-week study plan derived
// entirely from the user's real local data (exam date, predicted score, weak
// objectives, FSRS due dates, answer pace). No fabricated projections: due-load
// is bucketed from actual scheduled review dates; pace and predicted score are
// the same numbers the dashboard shows.

import { db } from "@/lib/db";
import { getUserState } from "@/lib/gamification";
import { getCert } from "@/lib/certs";
import { predictedScore, weakestObjectives } from "@/lib/mastery";
import { getPaceStats } from "@/lib/pace";

export type Readiness = "ready" | "on-track" | "behind" | "unknown";

export interface FocusObjective {
  id: string;
  code: string;
  name: string;
  mastery: number | null; // 0..1, or null if untouched
}

export interface TimelineWeek {
  index: number; // 0 = the week containing today
  startDate: string; // YYYY-MM-DD (local)
  endDate: string; // YYYY-MM-DD (local)
  isFinalWeek: boolean;
  focus: FocusObjective[]; // 2-3 weak objectives to target this week
  dueReviews: number; // FSRS cards + MCQs scheduled due in this week (overdue → week 0)
  recommendMock: boolean; // a mock-exam checkpoint falls in this week
}

export interface ExamTimeline {
  hasExamDate: boolean;
  examDate: string | null;
  daysUntil: number | null; // negative if the date has passed
  weeksUntil: number | null;
  predicted: number | null; // 100-900
  passingScore: number;
  readiness: Readiness;
  paceAvgMs: number | null;
  paceOnTarget: boolean | null;
  recommendedDailyQuestions: number;
  weakObjectives: FocusObjective[]; // the full weak list (for the focus rotation + header)
  weeks: TimelineWeek[];
  weeksCapped: boolean; // true if the real horizon exceeded the display cap
}

const MS_DAY = 24 * 60 * 60 * 1000;
const WEEK_CAP = 12; // never render more than ~3 months of week cards

// ── Pure helpers (unit-testable) ───────────────────────────────────────────────

/** Local-midnight Date for an ISO date or datetime string. */
export function localMidnight(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Whole days from `from` (inclusive midnight) to `to` (midnight). Negative if past. */
export function daysUntilDate(examIso: string, now: Date): number {
  const exam = localMidnight(new Date(examIso + (examIso.length === 10 ? "T00:00:00" : "")));
  const today = localMidnight(now);
  return Math.round((exam.getTime() - today.getTime()) / MS_DAY);
}

/** Readiness band from predicted vs passing score (Sec+ 100-900, pass 750). */
export function classifyReadiness(predicted: number | null, passing: number): Readiness {
  if (predicted === null) return "unknown";
  if (predicted >= passing) return "ready";
  if (predicted >= passing - 60) return "on-track"; // within ~one scaled band
  return "behind";
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Week windows starting today, one per 7-day block up to the exam (capped). */
export function weekWindows(now: Date, weeksUntil: number, cap = WEEK_CAP): { start: Date; end: Date }[] {
  const base = localMidnight(now);
  const n = Math.max(0, Math.min(weeksUntil, cap));
  const out: { start: Date; end: Date }[] = [];
  for (let i = 0; i < n; i++) {
    const start = new Date(base.getTime() + i * 7 * MS_DAY);
    const end = new Date(start.getTime() + 6 * MS_DAY);
    out.push({ start, end });
  }
  return out;
}

// ── Main builder ────────────────────────────────────────────────────────────────

export async function buildExamTimeline(certId: string, now: Date = new Date()): Promise<ExamTimeline> {
  const [state, predicted, weakRaw, pace] = await Promise.all([
    getUserState(),
    predictedScore(certId),
    weakestObjectives(certId, 8),
    getPaceStats({ sinceDays: 30 }),
  ]);

  const passingScore = getCert(certId).passingScore;
  const readiness = classifyReadiness(predicted, passingScore);
  const examDate = state?.examDate ?? null;

  const weakObjectives: FocusObjective[] = weakRaw.map(({ objective, mastery }) => ({
    id: objective.id,
    code: objective.code,
    name: objective.name,
    mastery,
  }));

  const base: ExamTimeline = {
    hasExamDate: !!examDate,
    examDate,
    daysUntil: null,
    weeksUntil: null,
    predicted,
    passingScore,
    readiness,
    paceAvgMs: pace?.avgMs ?? null,
    paceOnTarget: pace?.onTarget ?? null,
    recommendedDailyQuestions: 15,
    weakObjectives,
    weeks: [],
    weeksCapped: false,
  };

  if (!examDate) return base;

  const daysUntil = daysUntilDate(examDate, now);
  base.daysUntil = daysUntil;
  if (daysUntil < 0) {
    base.weeksUntil = 0;
    return base; // exam date is in the past — the page shows a "passed" state
  }
  const weeksUntil = Math.max(1, Math.ceil((daysUntil + 1) / 7));
  base.weeksUntil = weeksUntil;
  base.weeksCapped = weeksUntil > WEEK_CAP;

  // Project FSRS due load from REAL scheduled dates: latest review per MCQ + each
  // flashcard's due date, bucketed into the week windows (overdue → week 0).
  const windows = weekWindows(now, weeksUntil);
  const dueBuckets = new Array(windows.length).fill(0);
  const bucketFor = (dueIso: string | undefined): number => {
    if (!dueIso) return -1;
    const t = new Date(dueIso).getTime();
    const week0Start = windows.length ? windows[0].start.getTime() : localMidnight(now).getTime();
    if (t < week0Start) return 0; // overdue lands in the current week
    for (let i = 0; i < windows.length; i++) {
      const end = windows[i].end.getTime() + MS_DAY; // exclusive next-day boundary
      if (t < end) return i;
    }
    return -1; // due after the displayed horizon
  };

  const [reviews, flashcards] = await Promise.all([
    db.questionReviews.where("certId").equals(certId).toArray(),
    db.flashcards.where("certId").equals(certId).toArray(),
  ]);

  // Latest review per question carries its current fsrsDue.
  const latestByQ = new Map<string, { reviewedAt: string; fsrsDue?: string }>();
  for (const r of reviews) {
    const prev = latestByQ.get(r.questionId);
    if (!prev || (r.reviewedAt ?? "") > (prev.reviewedAt ?? "")) {
      latestByQ.set(r.questionId, { reviewedAt: r.reviewedAt, fsrsDue: r.fsrsDue });
    }
  }
  for (const { fsrsDue } of latestByQ.values()) {
    const b = bucketFor(fsrsDue);
    if (b >= 0) dueBuckets[b]++;
  }
  for (const card of flashcards) {
    const b = bucketFor(card.fsrsDue);
    if (b >= 0) dueBuckets[b]++;
  }

  // Recommended daily question target: enough to keep due-load drained plus a
  // floor of steady practice. Honest and bounded — it's a suggestion, not a quota.
  const totalDue = dueBuckets.reduce((a, b) => a + b, 0);
  const perDayFromDue = daysUntil > 0 ? totalDue / daysUntil : totalDue;
  base.recommendedDailyQuestions = Math.max(10, Math.min(40, Math.round(perDayFromDue + 10)));

  // Build week cards. Focus rotates through the weak objectives so each week
  // targets a fresh 2-3; the final week is reserved for full-length mock review.
  const weeks: TimelineWeek[] = windows.map((w, i) => {
    const isFinalWeek = i === windows.length - 1;
    const focus = pickFocus(weakObjectives, i, isFinalWeek);
    // Mock cadence: the final week always (dress rehearsal), then every other
    // week working backwards, so there's a checkpoint roughly every 2 weeks.
    const fromEnd = windows.length - 1 - i;
    const recommendMock = windows.length > 0 && fromEnd % 2 === 0;
    return {
      index: i,
      startDate: ymd(w.start),
      endDate: ymd(w.end),
      isFinalWeek,
      focus,
      dueReviews: dueBuckets[i] ?? 0,
      recommendMock,
    };
  });
  base.weeks = weeks;
  return base;
}

/** 2-3 focus objectives for a week, rotating through the weak list. */
function pickFocus(weak: FocusObjective[], weekIndex: number, isFinalWeek: boolean): FocusObjective[] {
  if (weak.length === 0) return [];
  if (isFinalWeek) return weak.slice(0, 3); // final week: revisit the weakest overall
  const per = 2;
  const start = (weekIndex * per) % weak.length;
  const out: FocusObjective[] = [];
  for (let k = 0; k < per; k++) out.push(weak[(start + k) % weak.length]);
  // De-dupe in case the list is shorter than `per`.
  return out.filter((o, idx) => out.findIndex((x) => x.id === o.id) === idx);
}
