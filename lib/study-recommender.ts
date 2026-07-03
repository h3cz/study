/**
 * lib/study-recommender.ts
 *
 * Adaptive Study Planner — a PURE, DETERMINISTIC, SYNCHRONOUS recommender that
 * ranks study activities by expected Security+ exam-score impact and selects the
 * single best next activity.
 *
 * `rankStudyActivities(snapshot, now)` takes a plain `StudySnapshot` object (NO
 * Dexie access) so it is fully unit-testable in a Node environment. The thin
 * async adapter `buildStudySnapshot(certId)` (below) gathers that snapshot from
 * the existing Dexie-backed helpers — it is the ONLY part that touches the DB.
 *
 * See docs/adaptive-study-planner.md for the converged acceptance criteria.
 */

import { db } from "@/lib/db";
import { allDomainMasteries, weakestObjectives } from "@/lib/mastery";
import { getDueQuestionIds, getLatestQuestionReview } from "@/lib/fsrs-mcq";
import { getWrongAnswerStats, getWrongAnswers } from "@/lib/wrong-answers";
import { getStreakAtRiskStatus, getUserState } from "@/lib/gamification";
import { getDueFlashcards } from "@/lib/fsrs";
import { getPaceStats } from "@/lib/pace";

// ─── Output contract ──────────────────────────────────────────────────────────

export type CandidateKind =
  | "fsrs-mcq"
  | "wrong-answer-review"
  | "daily-quiz"
  | "flashcards"
  | "acronym-drill"
  | "mock-exam"
  | "weakest-domain-drill";

export type OverrideReason = "streak-at-risk" | "fsrs-overdue" | null;

export interface CandidateComponents {
  examWeight: number;
  masteryGap: number;
  urgency: number;
  timeFit: number;
  examDateFactor: number;
}

export interface Candidate {
  kind: CandidateKind;
  label: string;
  detail: string; // includes count + est minutes
  href: string;
  estMinutes: number;
  truncatedCount?: number;
  score: number;
  components: CandidateComponents;
  overrideReason: OverrideReason;
  rationale: string; // one-line human explanation
  targetDomain?: string; // for weakest-domain-drill
  targetObjective?: string;
}

export interface Recommendation {
  top: Candidate;
  candidates: Candidate[]; // ranked desc
}

// ─── Snapshot input ─────────────────────────────────────────────────────────

/** One domain's mastery + exam weight + wrong-answer recency. */
export interface DomainSnapshot {
  domainId: string;
  number: number; // 1-5
  name: string;
  weight: number; // exam weight, e.g. 0.28
  mastery: number | null; // 0-1, null = unquizzed (cold-start prior applied in scorer)
  recentWrong: number; // wrong answers in this domain in last 14 days
}

export interface WeakObjectiveSnapshot {
  objectiveId: string;
  domainId: string;
  code: string; // "1.1"
  name: string;
  mastery: number | null;
}

/** One FSRS-due question with how overdue it is. */
export interface FsrsDueSnapshot {
  questionId: string;
  domainId: string;
  fsrsDueIso: string; // ISO of scheduled due date
  scheduledDays: number; // fsrsScheduledDays from the latest review
}

export interface StudySnapshot {
  domains: DomainSnapshot[];
  weakestObjectives: WeakObjectiveSnapshot[];
  fsrsDue: FsrsDueSnapshot[];
  wrongAnswerTotal: number;
  flashcardsDue: number;
  dailySessionMinutes: number; // default 20
  examDateIso: string | null;
  daysUntilExam: number | null; // null when no exam date
  streakAtRisk: {
    atRisk: boolean;
    minutesLeft: number;
    hasFreezeAvailable: boolean;
  } | null;
  answeredQuestionCount: number; // total answered (for cold-start)
  completedQuizCount: number; // completed quiz sessions (for cold-start)
  paceMsPerQuestion: number | null; // avg ms/Q, null when unknown
}

// ─── Tunable constants ────────────────────────────────────────────────────────

/** Cold-start mastery prior for unquizzed domains. */
export const COLD_START_MASTERY = 0.3;
/** Urgency is clamped so a handful of mildly-due cards never beat a weak high-weight domain. */
export const URGENCY_MAX = 2.0;
/** Default seconds/question used when pace is unknown (60s target). */
const DEFAULT_MS_PER_Q = 60_000;
/** Mock exam needs at least this much budget to be recommended. */
const MOCK_MIN_MINUTES = 45;
/** Cold-start: adaptive targeting begins once one of these thresholds is met. */
export const COLD_START_MIN_ANSWERED = 15;
/** fsrs-overdue override: total backlog threshold. */
export const FSRS_BACKLOG_THRESHOLD = 20;
/** fsrs-overdue override: per-item overdue multiple of scheduled interval. */
export const FSRS_OVERDUE_MULTIPLE = 2;

// ─── examDateFactor ─────────────────────────────────────────────────────────

/**
 * 1.0 beyond 30 days or no exam date; mild ramp 1.0 → 1.2 between 30 and 7 days;
 * final-week ramp continues 1.2 (at T-7) → 2.0 (at T-0) so the two ramps join
 * continuously with no step-down at the T-7 boundary.
 * Past the exam date (negative days) we clamp to the T-0 value (2.0).
 */
export function examDateFactor(daysUntilExam: number | null): number {
  if (daysUntilExam === null) return 1.0;
  if (daysUntilExam <= 0) return 2.0;
  // Final week: continuous with the 30→7 ramp's 1.2 endpoint. 1.2 at T-7 → 2.0 at T-0.
  if (daysUntilExam <= 7) return 1.2 + ((7 - daysUntilExam) / 7) * 0.8;
  if (daysUntilExam <= 30) {
    // Linear 1.0 (at 30) → 1.2 (at 7). 23-day span.
    const t = (30 - daysUntilExam) / (30 - 7);
    return 1 + 0.2 * t;
  }
  return 1.0;
}

// ─── timeFit ──────────────────────────────────────────────────────────────────

/**
 * How well a (possibly truncated) activity fits the daily budget.
 * Perfect fit (activity uses 30-100% of budget) = 1.0. Activities much smaller
 * than the budget get a mild penalty; activities longer than the budget that
 * have been truncated to fit stay near 1.0.
 */
export function timeFit(estMinutes: number, budgetMinutes: number): number {
  if (budgetMinutes <= 0) return 0.5;
  const ratio = estMinutes / budgetMinutes;
  if (ratio <= 0) return 0.5;
  if (ratio >= 0.3 && ratio <= 1.0) return 1.0;
  if (ratio < 0.3) {
    // Tiny activity — fits but doesn't use the budget. Floor at 0.6.
    return 0.6 + (ratio / 0.3) * 0.4;
  }
  // ratio > 1.0 — overshoots budget (should normally be truncated first). Decay.
  return Math.max(0.4, 1.0 - (ratio - 1.0) * 0.5);
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Effective mastery with cold-start prior applied for unquizzed domains. */
function effectiveMastery(mastery: number | null): number {
  return mastery === null ? COLD_START_MASTERY : mastery;
}

/** Minutes an activity of `count` questions takes at the snapshot pace. */
function minutesForQuestions(count: number, paceMsPerQuestion: number | null): number {
  const ms = paceMsPerQuestion && paceMsPerQuestion > 0 ? paceMsPerQuestion : DEFAULT_MS_PER_Q;
  return Math.max(1, Math.round((count * ms) / 60_000));
}

/** How many questions fit in `budgetMinutes` at the snapshot pace. */
function questionsThatFit(budgetMinutes: number, paceMsPerQuestion: number | null): number {
  const ms = paceMsPerQuestion && paceMsPerQuestion > 0 ? paceMsPerQuestion : DEFAULT_MS_PER_Q;
  return Math.max(1, Math.floor((budgetMinutes * 60_000) / ms));
}

/** Is the user still in cold-start (no completed quiz AND < 15 answered)? */
export function isColdStart(snapshot: StudySnapshot): boolean {
  return (
    snapshot.completedQuizCount < 1 &&
    snapshot.answeredQuestionCount < COLD_START_MIN_ANSWERED
  );
}

/**
 * Whether the fsrs-overdue override fires:
 *   - any due item is overdue by ≥ 2 × max(scheduledDays, 1), OR
 *   - total FSRS-due backlog ≥ 20 questions.
 */
export function fsrsOverdueFires(snapshot: StudySnapshot, now: Date): boolean {
  if (snapshot.fsrsDue.length >= FSRS_BACKLOG_THRESHOLD) return true;
  const nowMs = now.getTime();
  for (const item of snapshot.fsrsDue) {
    const dueMs = new Date(item.fsrsDueIso).getTime();
    if (Number.isNaN(dueMs)) continue;
    const overdueDays = (nowMs - dueMs) / (1000 * 60 * 60 * 24);
    const interval = Math.max(item.scheduledDays, 1);
    if (overdueDays >= FSRS_OVERDUE_MULTIPLE * interval) return true;
  }
  return false;
}

/** Domain with the highest priority for drilling (lowest effective mastery × weight gap). */
function pickWeakestDomain(snapshot: StudySnapshot): DomainSnapshot | null {
  if (snapshot.domains.length === 0) return null;
  const ranked = [...snapshot.domains].sort((a, b) => {
    const aScore = a.weight * (1 - effectiveMastery(a.mastery));
    const bScore = b.weight * (1 - effectiveMastery(b.mastery));
    if (bScore !== aScore) return bScore - aScore;
    // tie-breakers: higher weight → lower mastery → higher recent wrong → asc domain number
    if (b.weight !== a.weight) return b.weight - a.weight;
    const am = effectiveMastery(a.mastery);
    const bm = effectiveMastery(b.mastery);
    if (am !== bm) return am - bm;
    if (b.recentWrong !== a.recentWrong) return b.recentWrong - a.recentWrong;
    return a.number - b.number;
  });
  return ranked[0];
}

// ─── Core scorer ────────────────────────────────────────────────────────────

/**
 * Rank study activities and select the best next one.
 * Pure + deterministic: identical (snapshot, now) → identical output.
 */
export function rankStudyActivities(snapshot: StudySnapshot, now: Date): Recommendation {
  const budget = snapshot.dailySessionMinutes > 0 ? snapshot.dailySessionMinutes : 20;
  const edf = examDateFactor(snapshot.daysUntilExam);
  const coldStart = isColdStart(snapshot);

  const candidates: Candidate[] = [];

  // Map domainId → domain for FSRS/wrong attribution.
  const domainById = new Map(snapshot.domains.map((d) => [d.domainId, d]));

  // Highest-weight domain overall (used as a fallback exam-weight reference).
  const maxWeight =
    snapshot.domains.length > 0
      ? Math.max(...snapshot.domains.map((d) => d.weight))
      : 0.28;

  // ── Weakest-domain drill ──────────────────────────────────────────────────
  // Only offered once past cold-start (adaptive targeting begins then).
  if (!coldStart) {
    const weakDomain = pickWeakestDomain(snapshot);
    if (weakDomain) {
      const targetObj = snapshot.weakestObjectives.find(
        (o) => o.domainId === weakDomain.domainId
      );
      const fitCount = Math.min(12, questionsThatFit(budget, snapshot.paceMsPerQuestion));
      const estMinutes = minutesForQuestions(fitCount, snapshot.paceMsPerQuestion);
      const masteryGap = 1 - effectiveMastery(weakDomain.mastery);
      // Drill urgency comes from the weakness itself plus any recent wrongs.
      const urgency = clampUrgency(1.0 + Math.min(weakDomain.recentWrong, 5) * 0.1);
      const tf = timeFit(estMinutes, budget);
      const score = weakDomain.weight * masteryGap * urgency * edf * tf;
      const masteryPct =
        weakDomain.mastery === null ? null : Math.round(weakDomain.mastery * 100);
      candidates.push({
        kind: "weakest-domain-drill",
        label: `Drill Domain ${weakDomain.number}: ${weakDomain.name}`,
        detail: `${fitCount} questions · ~${estMinutes} min`,
        href: `/quiz?mode=weak-domain&domain=${weakDomain.number}&n=${fitCount}`,
        estMinutes,
        truncatedCount: fitCount,
        score,
        components: {
          examWeight: weakDomain.weight,
          masteryGap,
          urgency,
          timeFit: tf,
          examDateFactor: edf,
        },
        overrideReason: null,
        rationale:
          masteryPct === null
            ? `Domain ${weakDomain.number} is your weakest area and worth ${Math.round(
                weakDomain.weight * 100
              )}% of the exam — start building it up.`
            : `Domain ${weakDomain.number} is at ${masteryPct}% mastery and worth ${Math.round(
                weakDomain.weight * 100
              )}% of the exam — the highest-impact place to improve.`,
        targetDomain: weakDomain.name,
        targetObjective: targetObj?.name,
      });
    }
  }

  // ── FSRS scheduled review ─────────────────────────────────────────────────
  if (snapshot.fsrsDue.length > 0) {
    const fitCount = Math.min(
      snapshot.fsrsDue.length,
      questionsThatFit(budget, snapshot.paceMsPerQuestion)
    );
    const estMinutes = minutesForQuestions(fitCount, snapshot.paceMsPerQuestion);
    // Use the weighted-avg mastery gap of the domains the due cards touch.
    const dueDomainGap = avgMasteryGapForDue(snapshot, domainById);
    const dueExamWeight = avgExamWeightForDue(snapshot, domainById, maxWeight);
    // Urgency = max overdue ratio across due items, clamped.
    const urgency = clampUrgency(maxOverdueRatio(snapshot, now) || 1.0);
    const tf = timeFit(estMinutes, budget);
    const score = dueExamWeight * dueDomainGap * urgency * edf * tf;
    candidates.push({
      kind: "fsrs-mcq",
      label: "Scheduled FSRS review",
      detail: `${fitCount} question${fitCount !== 1 ? "s" : ""} due · ~${estMinutes} min`,
      href: `/quiz?mode=fsrs&n=${fitCount}`,
      estMinutes,
      truncatedCount: fitCount,
      score,
      components: {
        examWeight: dueExamWeight,
        masteryGap: dueDomainGap,
        urgency,
        timeFit: tf,
        examDateFactor: edf,
      },
      overrideReason: null,
      rationale: `${snapshot.fsrsDue.length} review${
        snapshot.fsrsDue.length !== 1 ? "s are" : " is"
      } due — clearing them keeps everything you've learned fresh.`,
    });
  }

  // ── Wrong-answer review ───────────────────────────────────────────────────
  if (snapshot.wrongAnswerTotal > 0) {
    const fitCount = Math.min(
      snapshot.wrongAnswerTotal,
      questionsThatFit(budget, snapshot.paceMsPerQuestion)
    );
    const estMinutes = minutesForQuestions(fitCount, snapshot.paceMsPerQuestion);
    // Wrong answers concentrate where mastery is low; use the highest-weight
    // weak domain's gap as a proxy, falling back to a moderate gap.
    const gap = wrongAnswerGap(snapshot);
    const weightRef = wrongAnswerWeight(snapshot, maxWeight);
    const urgency = clampUrgency(1.3); // recent mistakes are high-value but bounded
    const tf = timeFit(estMinutes, budget);
    const score = weightRef * gap * urgency * edf * tf;
    candidates.push({
      kind: "wrong-answer-review",
      label: "Wrong-answer review",
      detail: `${fitCount} question${fitCount !== 1 ? "s" : ""} · ~${estMinutes} min`,
      href: "/review",
      estMinutes,
      truncatedCount: fitCount,
      score,
      components: {
        examWeight: weightRef,
        masteryGap: gap,
        urgency,
        timeFit: tf,
        examDateFactor: edf,
      },
      overrideReason: null,
      rationale: `You missed ${snapshot.wrongAnswerTotal} question${
        snapshot.wrongAnswerTotal !== 1 ? "s" : ""
      } recently — reviewing them now turns gaps into points.`,
    });
  }

  // ── Daily quiz (always available) ─────────────────────────────────────────
  {
    const fitCount = Math.min(10, questionsThatFit(budget, snapshot.paceMsPerQuestion));
    const estMinutes = minutesForQuestions(fitCount, snapshot.paceMsPerQuestion);
    // Broad activity — uses overall mastery gap and a blended exam weight.
    const gap = overallMasteryGap(snapshot);
    const weightRef = blendedExamWeight(snapshot, maxWeight);
    // In cold-start the diagnostic is the priority → boosted urgency.
    const urgency = clampUrgency(coldStart ? URGENCY_MAX : 0.9);
    const tf = timeFit(estMinutes, budget);
    const score = weightRef * gap * urgency * edf * tf;
    candidates.push({
      kind: "daily-quiz",
      label: coldStart ? "Diagnostic daily quiz" : "10-question daily quiz",
      detail: `${fitCount} question${fitCount !== 1 ? "s" : ""} · ~${estMinutes} min`,
      href: `/quiz?n=${fitCount}`,
      estMinutes,
      truncatedCount: fitCount,
      score,
      components: {
        examWeight: weightRef,
        masteryGap: gap,
        urgency,
        timeFit: tf,
        examDateFactor: edf,
      },
      overrideReason: null,
      rationale: coldStart
        ? "Take a broad quiz first so we can find your weak spots and target them."
        : "A balanced quiz keeps every domain sharp and updates your predicted score.",
    });
  }

  // ── Flashcards ────────────────────────────────────────────────────────────
  if (snapshot.flashcardsDue > 0) {
    const fitCount = Math.min(snapshot.flashcardsDue, 15);
    const estMinutes = Math.max(1, Math.round(fitCount * 0.5));
    const gap = overallMasteryGap(snapshot);
    const weightRef = blendedExamWeight(snapshot, maxWeight) * 0.7; // recall aid, lower impact
    const urgency = clampUrgency(0.8);
    const tf = timeFit(estMinutes, budget);
    const score = weightRef * gap * urgency * edf * tf;
    candidates.push({
      kind: "flashcards",
      label: "Flashcard review",
      detail: `${fitCount} card${fitCount !== 1 ? "s" : ""} due · ~${estMinutes} min`,
      href: "/flashcards",
      estMinutes,
      truncatedCount: fitCount,
      score,
      components: {
        examWeight: weightRef,
        masteryGap: gap,
        urgency,
        timeFit: tf,
        examDateFactor: edf,
      },
      overrideReason: null,
      rationale: `${snapshot.flashcardsDue} flashcard${
        snapshot.flashcardsDue !== 1 ? "s are" : " is"
      } due for quick recall practice.`,
    });
  }

  // ── Acronym drill (always available, quick win) ───────────────────────────
  {
    const estMinutes = 1;
    const gap = overallMasteryGap(snapshot);
    const weightRef = blendedExamWeight(snapshot, maxWeight) * 0.4; // light-touch
    const urgency = clampUrgency(0.5);
    const tf = timeFit(estMinutes, budget);
    const score = weightRef * gap * urgency * edf * tf;
    candidates.push({
      kind: "acronym-drill",
      label: "Acronym drill",
      detail: "60-second rapid recall · ~1 min",
      href: "/drill",
      estMinutes,
      score,
      components: {
        examWeight: weightRef,
        masteryGap: gap,
        urgency,
        timeFit: tf,
        examDateFactor: edf,
      },
      overrideReason: null,
      rationale: "A 60-second acronym drill is a fast way to keep your streak alive.",
    });
  }

  // ── Mock exam (only when budget is large enough or near exam) ─────────────
  if (budget >= MOCK_MIN_MINUTES) {
    const estMinutes = 90;
    const gap = overallMasteryGap(snapshot);
    const weightRef = blendedExamWeight(snapshot, maxWeight);
    const urgency = clampUrgency(snapshot.daysUntilExam !== null && snapshot.daysUntilExam <= 30 ? 1.5 : 0.7);
    const tf = timeFit(estMinutes, budget);
    const score = weightRef * gap * urgency * edf * tf;
    candidates.push({
      kind: "mock-exam",
      label: "Full mock exam",
      detail: "90 questions · ~90 min",
      href: "/exam",
      estMinutes,
      score,
      components: {
        examWeight: weightRef,
        masteryGap: gap,
        urgency,
        timeFit: tf,
        examDateFactor: edf,
      },
      overrideReason: null,
      rationale: "A full mock exam under timed conditions is the best readiness check.",
    });
  }

  // ── Apply overrides ───────────────────────────────────────────────────────
  // Overrides outrank normal scoring when active. fsrs-overdue takes precedence
  // over streak-at-risk (clearing an overdue backlog is the higher-impact action,
  // and also satisfies the streak).
  const overdueActive = fsrsOverdueFires(snapshot, now) && snapshot.fsrsDue.length > 0;
  // Streak-at-risk only fires when there's no freeze covering it — otherwise the
  // freeze auto-applies and a panic CTA would be misleading (per spec).
  const streakActive =
    !!snapshot.streakAtRisk?.atRisk && !snapshot.streakAtRisk.hasFreezeAvailable;

  if (overdueActive) {
    const fsrs = candidates.find((c) => c.kind === "fsrs-mcq");
    if (fsrs) {
      fsrs.overrideReason = "fsrs-overdue";
      fsrs.rationale = `You have ${snapshot.fsrsDue.length} overdue review${
        snapshot.fsrsDue.length !== 1 ? "s" : ""
      } piling up — clear them now before they snowball.`;
    }
  } else if (streakActive) {
    // Surface a short quick-win sized to the remaining minutes.
    const minutesLeft = snapshot.streakAtRisk?.minutesLeft ?? 0;
    const quickWin = pickStreakQuickWin(candidates, snapshot, minutesLeft);
    if (quickWin) {
      quickWin.overrideReason = "streak-at-risk";
      quickWin.rationale = `Your streak is at risk with about ${minutesLeft} min left today — a quick ${quickWin.label.toLowerCase()} keeps it alive.`;
    }
  }

  // ── Sort: overrides first, then score, then deterministic tie-breakers ────
  candidates.sort((a, b) => compareCandidates(a, b, domainById));

  return { top: candidates[0], candidates };
}

// ─── Comparison + tie-breakers ────────────────────────────────────────────────

function overrideRank(reason: OverrideReason): number {
  if (reason === "fsrs-overdue") return 2;
  if (reason === "streak-at-risk") return 1;
  return 0;
}

/**
 * Deterministic ordering:
 *   1. active override (fsrs-overdue > streak-at-risk > none)
 *   2. higher score
 *   3. tie-breakers: higher exam weight → lower mastery (higher gap) →
 *      higher recent wrong-rate → ascending domain number / kind.
 */
function compareCandidates(
  a: Candidate,
  b: Candidate,
  domainById: Map<string, DomainSnapshot>
): number {
  const or = overrideRank(b.overrideReason) - overrideRank(a.overrideReason);
  if (or !== 0) return or;

  if (Math.abs(b.score - a.score) > 1e-9) return b.score - a.score;

  // Tie-breaker 1: higher exam weight
  if (Math.abs(b.components.examWeight - a.components.examWeight) > 1e-9) {
    return b.components.examWeight - a.components.examWeight;
  }
  // Tie-breaker 2: lower mastery → higher gap
  if (Math.abs(b.components.masteryGap - a.components.masteryGap) > 1e-9) {
    return b.components.masteryGap - a.components.masteryGap;
  }
  // Tie-breaker 3: higher recent wrong-rate (proxy via targetDomain recentWrong)
  const aWrong = candidateRecentWrong(a, domainById);
  const bWrong = candidateRecentWrong(b, domainById);
  if (bWrong !== aWrong) return bWrong - aWrong;
  // Tie-breaker 4: ascending domain number, then kind name for full determinism
  const aNum = candidateDomainNumber(a, domainById);
  const bNum = candidateDomainNumber(b, domainById);
  if (aNum !== bNum) return aNum - bNum;
  return a.kind.localeCompare(b.kind);
}

function candidateRecentWrong(
  c: Candidate,
  domainById: Map<string, DomainSnapshot>
): number {
  if (c.targetDomain) {
    for (const d of domainById.values()) {
      if (d.name === c.targetDomain) return d.recentWrong;
    }
  }
  return 0;
}

function candidateDomainNumber(
  c: Candidate,
  domainById: Map<string, DomainSnapshot>
): number {
  if (c.targetDomain) {
    for (const d of domainById.values()) {
      if (d.name === c.targetDomain) return d.number;
    }
  }
  return 99;
}

// ─── Scoring sub-helpers ──────────────────────────────────────────────────────

function clampUrgency(u: number): number {
  return Math.max(0, Math.min(URGENCY_MAX, u));
}

/** Max overdue ratio (now − due)/interval across due items. */
function maxOverdueRatio(snapshot: StudySnapshot, now: Date): number {
  let max = 0;
  const nowMs = now.getTime();
  for (const item of snapshot.fsrsDue) {
    const dueMs = new Date(item.fsrsDueIso).getTime();
    if (Number.isNaN(dueMs)) continue;
    const overdueDays = (nowMs - dueMs) / (1000 * 60 * 60 * 24);
    const interval = Math.max(item.scheduledDays, 1);
    const ratio = 1 + Math.max(0, overdueDays) / interval;
    if (ratio > max) max = ratio;
  }
  return max;
}

function avgMasteryGapForDue(
  snapshot: StudySnapshot,
  domainById: Map<string, DomainSnapshot>
): number {
  if (snapshot.fsrsDue.length === 0) return overallMasteryGap(snapshot);
  let sum = 0;
  let n = 0;
  for (const item of snapshot.fsrsDue) {
    const d = domainById.get(item.domainId);
    sum += 1 - effectiveMastery(d?.mastery ?? null);
    n++;
  }
  return n > 0 ? sum / n : overallMasteryGap(snapshot);
}

function avgExamWeightForDue(
  snapshot: StudySnapshot,
  domainById: Map<string, DomainSnapshot>,
  fallback: number
): number {
  if (snapshot.fsrsDue.length === 0) return fallback;
  let sum = 0;
  let n = 0;
  for (const item of snapshot.fsrsDue) {
    const d = domainById.get(item.domainId);
    if (d) {
      sum += d.weight;
      n++;
    }
  }
  return n > 0 ? sum / n : fallback;
}

/** Overall mastery gap = 1 − weighted-avg mastery across domains. */
function overallMasteryGap(snapshot: StudySnapshot): number {
  if (snapshot.domains.length === 0) return 1 - COLD_START_MASTERY;
  let weighted = 0;
  let totalWeight = 0;
  for (const d of snapshot.domains) {
    weighted += d.weight * effectiveMastery(d.mastery);
    totalWeight += d.weight;
  }
  const avg = totalWeight > 0 ? weighted / totalWeight : COLD_START_MASTERY;
  return 1 - avg;
}

/** A blended exam weight — the weighted-average of domain weights (i.e. the mean weight). */
function blendedExamWeight(snapshot: StudySnapshot, fallback: number): number {
  if (snapshot.domains.length === 0) return fallback;
  const sum = snapshot.domains.reduce((s, d) => s + d.weight, 0);
  return sum / snapshot.domains.length;
}

/** Mastery gap proxy for the wrong-answer queue — weakest weighted domain. */
function wrongAnswerGap(snapshot: StudySnapshot): number {
  const weak = pickWeakestDomain(snapshot);
  if (!weak) return overallMasteryGap(snapshot);
  return 1 - effectiveMastery(weak.mastery);
}

function wrongAnswerWeight(snapshot: StudySnapshot, fallback: number): number {
  // Weight by the domains where wrongs concentrate (highest recentWrong domain).
  const withWrong = snapshot.domains.filter((d) => d.recentWrong > 0);
  if (withWrong.length === 0) return blendedExamWeight(snapshot, fallback);
  const top = withWrong.sort((a, b) => b.recentWrong - a.recentWrong)[0];
  return top.weight;
}

/** Choose the smallest-fit quick-win for a streak-at-risk budget. */
function pickStreakQuickWin(
  candidates: Candidate[],
  snapshot: StudySnapshot,
  minutesLeft: number
): Candidate | undefined {
  // Prefer activities that fit the remaining minutes; smallest est first.
  const fits = candidates
    .filter((c) => c.estMinutes <= Math.max(minutesLeft, 1))
    .sort((a, b) => a.estMinutes - b.estMinutes);
  if (fits.length > 0) return fits[0];
  // Nothing fits — fall back to the acronym drill (always 1 min) or smallest.
  return (
    candidates.find((c) => c.kind === "acronym-drill") ??
    [...candidates].sort((a, b) => a.estMinutes - b.estMinutes)[0]
  );
}

// ─── Async adapter: gather a snapshot from existing Dexie helpers ──────────────

const DEFAULT_DAILY_MINUTES = 20;

/**
 * Build a StudySnapshot for `certId` from the existing helpers. This is the only
 * DB-touching part; the scorer itself is pure. Reuses (does not duplicate):
 * mastery, fsrs-mcq, wrong-answers, gamification, pace, fsrs flashcards.
 */
export async function buildStudySnapshot(
  certId: string,
  now: Date = new Date()
): Promise<StudySnapshot> {
  const [
    domainMasteries,
    weakObjs,
    dueIds,
    wrongStats,
    userState,
    streakAtRisk,
    flashcards,
    pace,
    completedQuizCount,
  ] = await Promise.all([
    allDomainMasteries(certId).catch(() => []),
    weakestObjectives(certId, 5).catch(() => []),
    getDueQuestionIds(certId, now).catch(() => [] as string[]),
    getWrongAnswerStats().catch(() => ({ totalWrong: 0, byDomain: {}, byObjective: {} })),
    getUserState().catch(() => undefined),
    getStreakAtRiskStatus().catch(() => null),
    getDueFlashcards(certId).catch(() => [] as Awaited<ReturnType<typeof getDueFlashcards>>),
    getPaceStats({ sinceDays: 30 }).catch(() => null),
    db.quizSessions
      .where("certId")
      .equals(certId)
      .filter((s) => !!s.completedAt)
      .count()
      .catch(() => 0),
  ]);

  // Recent-wrong counts per domain from the wrong-answer stats.
  const recentWrongByDomain: Record<string, number> = wrongStats.byDomain ?? {};

  const domains: DomainSnapshot[] = domainMasteries.map(({ domain, mastery }) => ({
    domainId: domain.id,
    number: domain.number,
    name: domain.name,
    weight: domain.weight,
    mastery,
    recentWrong: recentWrongByDomain[domain.id] ?? 0,
  }));

  const weakestObjs: WeakObjectiveSnapshot[] = weakObjs.map(({ objective, mastery }) => ({
    objectiveId: objective.id,
    domainId: objective.domainId,
    code: objective.code,
    name: objective.name,
    mastery,
  }));

  // FSRS-due rows: attribute each to its domain and read scheduledDays from the
  // latest review. Cap the per-row lookups to the actual due set.
  const dueQuestions = await db.questions
    .where("id")
    .anyOf(dueIds)
    .toArray()
    .catch(() => []);
  const dueQuestionById = new Map(dueQuestions.map((q) => [q.id, q]));

  const fsrsDue: FsrsDueSnapshot[] = [];
  await Promise.all(
    dueIds.map(async (qId) => {
      const q = dueQuestionById.get(qId);
      if (!q) return;
      const review = await getLatestQuestionReview(qId).catch(() => null);
      fsrsDue.push({
        questionId: qId,
        domainId: q.domainId,
        fsrsDueIso: review?.fsrsDue ?? now.toISOString(),
        scheduledDays: review?.fsrsScheduledDays ?? 1,
      });
    })
  );

  // Answered-question count (for cold-start) — across all completed sessions.
  const answeredQuestionCount = await db.quizSessions
    .where("certId")
    .equals(certId)
    .filter((s) => !!s.completedAt)
    .toArray()
    .then((sessions) =>
      sessions.reduce((sum, s) => sum + Object.keys(s.answers ?? {}).length, 0)
    )
    .catch(() => 0);

  // Days until exam.
  let daysUntilExam: number | null = null;
  const examDateIso = userState?.examDate ?? null;
  if (examDateIso) {
    const target = new Date(examDateIso + "T00:00:00");
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    daysUntilExam = Math.ceil(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  return {
    domains,
    weakestObjectives: weakestObjs,
    fsrsDue,
    wrongAnswerTotal: wrongStats.totalWrong,
    flashcardsDue: flashcards.length,
    dailySessionMinutes: userState?.dailySessionMinutes ?? DEFAULT_DAILY_MINUTES,
    examDateIso,
    daysUntilExam,
    streakAtRisk: streakAtRisk
      ? {
          atRisk: streakAtRisk.atRisk,
          minutesLeft: streakAtRisk.hoursLeft * 60 + streakAtRisk.minutesLeft,
          hasFreezeAvailable: streakAtRisk.hasFreezeAvailable,
        }
      : null,
    answeredQuestionCount,
    completedQuizCount,
    paceMsPerQuestion: pace?.avgMs ?? null,
  };
}

// Re-export getWrongAnswers so callers building snapshots manually can reuse it.
export { getWrongAnswers };
