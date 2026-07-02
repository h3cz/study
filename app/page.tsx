"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { seedDb, db } from "@/lib/db";
import type { InProgressQuiz } from "@/lib/db";
import { allDomainMasteries, predictedScore, weakestObjectives } from "@/lib/mastery";
import { getDueFlashcards } from "@/lib/fsrs";
import { getDueQuestionCount } from "@/lib/fsrs-mcq";
import { getUserState, xpToLevel, reconcileStreak, FREEZE_EARN_INTERVAL, questionsAnsweredToday, DEFAULT_DAILY_GOAL } from "@/lib/gamification";
import { createClient } from "@/lib/supabase/client";
import { enqueue } from "@/lib/sync/engine";
import type { Domain, Objective, UserState, QuizSession } from "@/lib/db";
import { getWrongAnswerStats } from "@/lib/wrong-answers";
import type { MockExamSession } from "@/lib/db";
import { calibrationScore, calibrationLabel } from "@/lib/calibration";
import type { CalibrationResult } from "@/lib/calibration";
import { getBestDrillSession } from "@/lib/drill";
import type { DrillSession } from "@/lib/db";
import { getDailyTrend, trendDirection } from "@/lib/trend";
import { countVoiceAnswers } from "@/lib/voice-stats";
import type { DailyTrend } from "@/lib/trend";
import { TrendChart } from "@/components/TrendChart";
import { StreakCalendar } from "@/components/StreakCalendar";
import { getStreakAtRiskStatus } from "@/lib/gamification";
import { getPaceStats } from "@/lib/pace";
import type { PaceStats } from "@/lib/pace";
import { getTodayPlan } from "@/lib/today";
import type { TodayPlan as TodayPlanData } from "@/lib/today";
import { TodayPlan } from "@/components/TodayPlan";
import { buildStudySnapshot, rankStudyActivities } from "@/lib/study-recommender";
import type { Candidate, Recommendation, CandidateKind, StudySnapshot } from "@/lib/study-recommender";
import type { TodayPlanItem } from "@/lib/today";
import { shouldShowTour, startDashboardTour } from "@/lib/tour";
import ShareButton from "@/components/ShareButton";
import { DomainIcon } from "@/components/icons/DomainIcon";
import { LevelBadge } from "@/components/icons/Badge";
import { MicGlyph } from "@/components/icons/MicGlyph";
import { ScoreRing } from "@/components/ScoreRing";
import { RankBadge } from "@/components/RankBadge";
import { achievements, earnedCount, rankTier, highestStreakMilestone } from "@/lib/rewards";
import type { Achievement } from "@/lib/rewards";
import { getCert, getActiveCertId } from "@/lib/certs";
import { isBankImportEnabled } from "@/lib/feature-flags";

// Resolved per-load from userState.activeCertId; falls back to DEFAULT_CERT_ID.
// Only Security+ is live today, so this is secplus everywhere — behavior identical.

// ─── Celebration toast ────────────────────────────────────────────────────────

const CELEBRATED_KEY = "rewards.celebrated.v1";
const BANK_IMPORT_ENABLED = isBankImportEnabled();

interface CelebratedState {
  achievementKeys: string[];
  rankTierKey: string | null;
}

interface CelebrationItem {
  kind: "achievement" | "rank";
  message: string;
  isCrown: boolean;
}

/** Read + write the persisted celebrated state safely (SSR-guarded). */
function readCelebrated(): CelebratedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CELEBRATED_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CelebratedState;
  } catch {
    return null;
  }
}

function writeCelebrated(state: CelebratedState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CELEBRATED_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private mode — fail silently
  }
}

/**
 * Compute which milestones are newly earned compared to what's persisted.
 * On first run (no stored state) silently seeds and returns empty array.
 */
function computeNewCelebrations(
  earnedKeys: string[],
  currentTierKey: string | null,
): CelebrationItem[] {
  const stored = readCelebrated();

  // First run: seed and show nothing
  if (!stored) {
    writeCelebrated({ achievementKeys: earnedKeys, rankTierKey: currentTierKey });
    return [];
  }

  const items: CelebrationItem[] = [];

  // New achievement keys
  const storedSet = new Set(stored.achievementKeys);
  for (const key of earnedKeys) {
    if (!storedSet.has(key)) {
      // Find label from well-known keys (avoids importing achievements() again)
      const labelMap: Record<string, string> = {
        first_steps: "First Steps",
        century: "Century",
        xp_1000: "Grinder",
        streak_7: "Consistent",
        streak_30: "Relentless",
        streak_100: "Centurion",
        streak_180: "Half-Marathoner",
        streak_365: "Streak Society",
        first_mock: "Dress Rehearsal",
        mock_pass: "First Pass",
        mocks_5: "Battle-Tested",
        pass_ready: "Pass-Ready",
        elite: "Elite",
        well_calibrated: "Self-Aware",
      };
      items.push({
        kind: "achievement",
        message: `⭐ Achievement unlocked: ${labelMap[key] ?? key}`,
        isCrown: false,
      });
    }
  }

  // New/higher rank tier
  const tierOrder = ["recruit", "analyst", "specialist", "pass-ready", "elite"];
  const storedTierIdx = stored.rankTierKey ? tierOrder.indexOf(stored.rankTierKey) : -1;
  const currentTierIdx = currentTierKey ? tierOrder.indexOf(currentTierKey) : -1;
  if (currentTierIdx > storedTierIdx && currentTierKey) {
    const tierLabelMap: Record<string, string> = {
      recruit: "Recruit",
      analyst: "Analyst",
      specialist: "Specialist",
      "pass-ready": "Pass-Ready",
      elite: "Elite",
    };
    const isCrown = currentTierIdx >= tierOrder.indexOf("pass-ready");
    items.push({
      kind: "rank",
      message: `🏆 Rank up: ${tierLabelMap[currentTierKey] ?? currentTierKey}!`,
      isCrown,
    });
  }

  // Persist the full current state (whether new items or not)
  writeCelebrated({ achievementKeys: earnedKeys, rankTierKey: currentTierKey });

  return items;
}

// ─── Streak milestone celebration (full-screen) ────────────────────────────────

const STREAK_CELEBRATED_KEY = "streak.celebrated.v1";

/** Read the highest streak milestone already celebrated (SSR-guarded). */
function readStreakCelebrated(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STREAK_CELEBRATED_KEY);
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function writeStreakCelebrated(milestone: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STREAK_CELEBRATED_KEY, String(milestone));
  } catch {
    // quota exceeded or private mode — fail silently
  }
}

/**
 * Returns the milestone to celebrate for the current streak, or null if none.
 * First run (no stored value) silently seeds to the current highest milestone
 * and returns null, so an existing long-streak user is not spammed.
 */
function computeStreakCelebration(currentStreak: number): number | null {
  const current = highestStreakMilestone(currentStreak);
  const stored = readStreakCelebrated();

  if (stored === null) {
    // Seed silently — show nothing on first run.
    writeStreakCelebrated(current ?? 0);
    return null;
  }

  if (current !== null && current > stored) {
    writeStreakCelebrated(current);
    return current;
  }
  return null;
}

// Lightweight canvas confetti burst (~1.5s, dependency-free)
function fireConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const COLORS = ["#F5A623", "#5FB37C", "#7BAEC4", "#9B8AC4", "#E55C5C", "#fff"];
  const COUNT = 80;

  interface Particle {
    x: number; y: number;
    vx: number; vy: number;
    color: string;
    w: number; h: number;
    angle: number; spin: number;
    alpha: number;
  }

  const particles: Particle[] = Array.from({ length: COUNT }, () => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.4,
    y: H * 0.45,
    vx: (Math.random() - 0.5) * 6,
    vy: -(Math.random() * 6 + 2),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    w: Math.random() * 8 + 4,
    h: Math.random() * 4 + 2,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.2,
    alpha: 1,
  }));

  const startTime = performance.now();
  const DURATION = 1500;

  function tick(now: number) {
    const elapsed = now - startTime;
    if (elapsed > DURATION) {
      ctx!.clearRect(0, 0, W, H);
      return;
    }
    ctx!.clearRect(0, 0, W, H);
    const t = elapsed / DURATION;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18; // gravity
      p.angle += p.spin;
      p.alpha = Math.max(0, 1 - t * 1.4);
      ctx!.save();
      ctx!.globalAlpha = p.alpha;
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.angle);
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx!.restore();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// CelebrationToast — shows one toast at a time from a queue, auto-dismisses
function CelebrationToast({ items }: { items: CelebrationItem[] }) {
  const [queue, setQueue] = useState<CelebrationItem[]>([]);
  const [current, setCurrent] = useState<CelebrationItem | null>(null);
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Seed queue once when items arrive
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || items.length === 0) return;
    seededRef.current = true;
    setQueue(items);
  }, [items]);

  // Pop next from queue
  useEffect(() => {
    if (current !== null || queue.length === 0) return;
    const popTimer = setTimeout(() => {
      const [next, ...rest] = queue;
      setQueue(rest);
      setCurrent(next);
      setVisible(true);

      // Confetti for rank-ups (crown tiers especially), respecting reduced motion
      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reducedMotion && next.isCrown && canvasRef.current) {
        fireConfetti(canvasRef.current);
      }

      timerRef.current = setTimeout(() => dismiss(), 5000);
    }, 0);
    return () => {
      clearTimeout(popTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [queue, current]);

  function dismiss() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(() => setCurrent(null), 300); // wait for fade-out
  }

  if (!current) return null;

  return (
    <>
      {/* Full-screen confetti canvas — pointer-events:none so it doesn't block clicks */}
      <canvas
        ref={canvasRef}
        width={typeof window !== "undefined" ? window.innerWidth : 400}
        height={typeof window !== "undefined" ? window.innerHeight : 800}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          pointerEvents: "none",
          width: "100%",
          height: "100%",
        }}
        aria-hidden="true"
      />
      {/* Toast */}
      <div
        role="status"
        aria-live="polite"
        onClick={dismiss}
        style={{
          position: "fixed",
          top: "72px", // clears the mobile top nav / header
          left: "50%",
          transform: `translateX(-50%) scale(${visible ? 1 : 0.92})`,
          opacity: visible ? 1 : 0,
          transition: "opacity 280ms ease, transform 280ms ease",
          background: "var(--surface)",
          border: "1px solid var(--accent)",
          borderRadius: "var(--r-md)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          zIndex: 9999,
          cursor: "pointer",
          whiteSpace: "nowrap",
          maxWidth: "calc(100vw - 32px)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent)" }}>
          {current.message}
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "var(--fg-subtle)",
            flexShrink: 0,
          }}
        >
          tap to dismiss
        </span>
      </div>
    </>
  );
}

// StreakMilestoneOverlay — full-screen celebration when a streak milestone is newly hit.
function StreakMilestoneOverlay({
  milestone,
  streak,
  onDismiss,
}: {
  milestone: number;
  streak: number;
  onDismiss: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !canvasRef.current) return;
    // Bigger, longer burst for the milestone moment: fire twice.
    fireConfetti(canvasRef.current);
    const t = setTimeout(() => {
      if (canvasRef.current) fireConfetti(canvasRef.current);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${milestone}-day streak reached`}
      onClick={onDismiss}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000, // above the mobile bottom nav
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "var(--font-sans)",
      }}
    >
      <canvas
        ref={canvasRef}
        width={typeof window !== "undefined" ? window.innerWidth : 400}
        height={typeof window !== "undefined" ? window.innerHeight : 800}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10001,
          pointerEvents: "none",
          width: "100%",
          height: "100%",
        }}
        aria-hidden="true"
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          zIndex: 10002,
          background: "var(--surface)",
          border: "1px solid var(--accent)",
          borderRadius: "var(--r-md)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
          padding: "32px 28px",
          maxWidth: "360px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "64px", lineHeight: 1, marginBottom: "8px" }} aria-hidden="true">
          🔥
        </div>
        <div
          style={{
            fontSize: "48px",
            fontWeight: 800,
            color: "var(--accent)",
            fontFamily: "var(--font-mono)",
            lineHeight: 1,
          }}
        >
          {streak}
        </div>
        <p
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--fg)",
            marginTop: "8px",
          }}
        >
          {milestone}-day streak!
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg-muted)",
            marginTop: "6px",
            lineHeight: 1.5,
          }}
        >
          You&apos;re on fire — keep it going.
        </p>
        <button
          onClick={onDismiss}
          style={{
            marginTop: "20px",
            height: "44px",
            width: "100%",
            background: "var(--accent)",
            color: "var(--accent-fg)",
            border: "none",
            borderRadius: "var(--r-sm)",
            fontSize: "15px",
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
            cursor: "pointer",
          }}
        >
          Keep going
        </button>
      </div>
    </div>
  );
}

// Mock exam sparkline (raw SVG — last 5 scores, 0-900 scale)
function MockSparkline({ exams }: { exams: MockExamSession[] }) {
  if (exams.length < 2) return null;
  const scores = [...exams].reverse().map((e) => e.predictedScore);
  const w = 80;
  const h = 24;
  const minS = 100;
  const maxS = 900;
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * w;
    const y = h - ((s - minS) / (maxS - minS)) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {scores.map((s, i) => {
        const x = (i / (scores.length - 1)) * w;
        const y = h - ((s - minS) / (maxS - minS)) * h;
        return <circle key={i} cx={x} cy={y} r={2} fill="var(--accent)" />;
      })}
    </svg>
  );
}

interface StudyBriefMetricProps {
  label: string;
  value: string;
  href?: string;
  tone?: "accent" | "muted";
}

function StudyBriefMetric({ label, value, href, tone = "muted" }: StudyBriefMetricProps) {
  const content = (
    <>
      <span
        className="font-mono"
        style={{
          fontSize: "10px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: tone === "accent" ? "var(--accent)" : "var(--fg-subtle)",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "12px",
          color: "var(--fg)",
          fontFamily: "var(--font-sans)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </>
  );

  const style: React.CSSProperties = {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    padding: "9px 10px",
    borderRadius: "var(--r-sm)",
    border: `1px solid ${tone === "accent" ? "rgba(245,166,35,0.42)" : "var(--border)"}`,
    background: tone === "accent" ? "rgba(245,166,35,0.06)" : "var(--surface-2)",
    textDecoration: "none",
  };

  if (href) {
    return (
      <Link href={href} style={style}>
        {content}
      </Link>
    );
  }

  return <div style={style}>{content}</div>;
}

function formatExamWindow(daysUntilExam: number | null, hasExamDate: boolean): string {
  if (!hasExamDate) return "Set exam date";
  if (daysUntilExam === null) return "Date set";
  if (daysUntilExam < 0) return "Date passed";
  if (daysUntilExam === 0) return "Exam today";
  if (daysUntilExam === 1) return "1 day out";
  return `${daysUntilExam} days out`;
}

function pickSnapshotFocus(snapshot: StudySnapshot | null): string | null {
  const weakObjective = snapshot?.weakestObjectives[0];
  if (weakObjective) return `${weakObjective.code} ${weakObjective.name}`;

  const weakDomain = snapshot?.domains
    ? [...snapshot.domains].sort((a, b) => {
        const aGap = 1 - (a.mastery ?? 0.3);
        const bGap = 1 - (b.mastery ?? 0.3);
        const weighted = b.weight * bGap - a.weight * aGap;
        if (weighted !== 0) return weighted;
        return a.number - b.number;
      })[0]
    : null;

  return weakDomain ? `Domain ${weakDomain.number}: ${weakDomain.name}` : null;
}

function pickStudyFocus(recommendation: Recommendation | null, snapshot: StudySnapshot | null): string {
  const top = recommendation?.top;
  if (top?.targetObjective) return top.targetObjective;
  if (top?.targetDomain) return top.targetDomain;
  return pickSnapshotFocus(snapshot) ?? "Baseline diagnostic";
}

function buildRecommendationSignals(
  candidate: Candidate,
  snapshot: StudySnapshot | null,
  daysUntilExam: number | null,
  dailySessionMinutes: number,
): StudyBriefMetricProps[] {
  const signals: StudyBriefMetricProps[] = [
    {
      label: "Window",
      value: formatExamWindow(daysUntilExam, snapshot?.examDateIso !== null && snapshot?.examDateIso !== undefined),
      tone: daysUntilExam !== null && daysUntilExam <= 14 ? "accent" : "muted",
    },
    {
      label: "Session",
      value: `${candidate.estMinutes}/${dailySessionMinutes} min`,
      tone: candidate.estMinutes <= dailySessionMinutes ? "accent" : "muted",
    },
  ];

  if (candidate.targetObjective) {
    signals.push({ label: "Objective", value: candidate.targetObjective, tone: "accent" });
  } else if (candidate.targetDomain) {
    signals.push({ label: "Domain", value: candidate.targetDomain, tone: "accent" });
  } else {
    const focus = pickSnapshotFocus(snapshot);
    if (focus) signals.push({ label: "Focus", value: focus, tone: "muted" });
  }

  if (candidate.kind === "fsrs-mcq" && snapshot) {
    signals.push({ label: "Due", value: `${snapshot.fsrsDue.length} reviews`, tone: "accent" });
  } else if (candidate.kind === "wrong-answer-review" && snapshot) {
    signals.push({ label: "Misses", value: `${snapshot.wrongAnswerTotal} to review`, tone: "accent" });
  } else if (snapshot && snapshot.wrongAnswerTotal > 0) {
    signals.push({ label: "Misses", value: `${snapshot.wrongAnswerTotal} recent`, tone: "muted" });
  }

  return signals.slice(0, 4);
}

interface DomainEntry { domain: Domain; mastery: number | null }
interface WeakObj { objective: Objective; mastery: number | null }

export default function Dashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [domainData, setDomainData] = useState<DomainEntry[]>([]);
  const [weak, setWeak] = useState<WeakObj[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  // undefined = still loading (don't show either banner)
  // null = confirmed signed out
  // User = signed in
  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined);
  const [mockExams, setMockExams] = useState<MockExamSession[]>([]);
  const [examDateEdit, setExamDateEdit] = useState(false);
  const [examDateInput, setExamDateInput] = useState("");
  const examInputRef = useRef<HTMLInputElement>(null);
  const [displayScore, setDisplayScore] = useState<number | null>(null);
  const scoreAnimatedRef = useRef(false);
  const [calibration, setCalibration] = useState<CalibrationResult | null>(null);
  const [calibrationOpen, setCalibrationOpen] = useState(false);
  const calibrationRef = useRef<HTMLDivElement>(null);
  const [bestDrill, setBestDrill] = useState<DrillSession | null>(null);
  const [dailyTrend, setDailyTrend] = useState<DailyTrend[]>([]);
  const [freezeToast, setFreezeToast] = useState(false);
  const [fsrsDueCount, setFsrsDueCount] = useState(0);
  const [inProgressQuiz, setInProgressQuiz] = useState<InProgressQuiz | null>(null);
  const [todayPlan, setTodayPlan] = useState<TodayPlanData | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [studySnapshot, setStudySnapshot] = useState<StudySnapshot | null>(null);
  // ── Streak-at-risk alert (Feature B) ──
  const [atRiskStatus, setAtRiskStatus] = useState<{
    atRisk: boolean; hoursLeft: number; minutesLeft: number; hasFreezeAvailable: boolean;
  } | null>(null);
  const [atRiskCountdown, setAtRiskCountdown] = useState<{ h: number; m: number } | null>(null);
  const [paceStats, setPaceStats] = useState<PaceStats | null>(null);
  const [voiceAllowed, setVoiceAllowed] = useState(false);
  const [voiceMinutesToday, setVoiceMinutesToday] = useState<number | null>(null);
  const [voiceAnswersThisWeek, setVoiceAnswersThisWeek] = useState(0);
  const [acronymCount, setAcronymCount] = useState(317);
  const [pbqCount, setPbqCount] = useState(25);
  const [bankStats, setBankStats] = useState<{ total: number; starter: number } | null>(null);
  const [achievementList, setAchievementList] = useState<Achievement[]>([]);
  const [celebrationItems, setCelebrationItems] = useState<CelebrationItem[]>([]);
  // ── Daily goal (Feature 1) ──
  const [answeredToday, setAnsweredToday] = useState(0);
  // ── Streak milestone celebration (Feature 2) ──
  const [streakMilestone, setStreakMilestone] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      await seedDb();
      // Auto-apply a streak freeze if user missed exactly 1 day
      const reconcile = await reconcileStreak().catch(() => ({ consumedFreeze: false }));
      if (reconcile.consumedFreeze) {
        setFreezeToast(true);
        setTimeout(() => setFreezeToast(false), 4000);
      }
      // Promise.allSettled so one failing widget doesn't kill the whole dashboard.
      // Each helper returns a sensible default on failure.
      const get = <T,>(p: Promise<T>, fallback: T): Promise<T> =>
        p.catch((e) => {
          console.warn("[dashboard load] sub-task failed:", e);
          return fallback;
        });
      // Resolve the active cert first so cert-scoped queries target it. Only
      // Security+ is live today, so CERT_ID is secplus — behavior identical.
      const state = await get(getUserState(), { id: 1, xp: 0, level: 0, streak: 0, totalStudyDays: 0 } as Awaited<ReturnType<typeof getUserState>>);
      const CERT_ID = getActiveCertId(state);
      // Per-cert pass line drives rank tiers + pass-ready/elite achievements.
      const passingScore = getCert(CERT_ID).passingScore;
      const [predicted, domains, weakObjs, due, wrongStats, recentMocks, cal, bestDrillResult, trend, fsrsDue, atRisk, todayPlanResult, pace, voiceWeek, acronymCountResult, pbqCountResult, answeredTodayCount, questionRows] = await Promise.all([
        get(predictedScore(CERT_ID), null),
        get(allDomainMasteries(CERT_ID), []),
        get(weakestObjectives(CERT_ID, 3), []),
        get(getDueFlashcards(CERT_ID), []),
        get(getWrongAnswerStats(), { totalWrong: 0, byDomain: {}, byObjective: {} }),
        get(db.mockExamSessions.orderBy("startedAt").reverse().limit(5).toArray(), []),
        get(calibrationScore(), null),
        get(getBestDrillSession(), null),
        get(getDailyTrend(30), []),
        get(getDueQuestionCount(CERT_ID), 0),
        get(getStreakAtRiskStatus(), null),
        get(getTodayPlan(CERT_ID), { items: [], totalEstMinutes: 0, completedCount: 0 }),
        get(getPaceStats({ sinceDays: 30 }), null),
        get(countVoiceAnswers(7), 0),
        get(db.acronyms.where("certId").equals(CERT_ID).count(), 317),
        get(db.perfQuestions.count(), 25),
        get(questionsAnsweredToday(), 0),
        get(db.questions.toArray(), []),
      ]);
      setBankStats({
        total: questionRows.length,
        starter: questionRows.filter((q) => q.id.startsWith("starter-")).length,
      });

      // ── Achievements input (guarded; never blocks other widgets) ──
      const [allQuizSessions, allMockExams] = await Promise.all([
        get<QuizSession[]>(db.quizSessions.toArray(), []),
        get<MockExamSession[]>(db.mockExamSessions.toArray(), []),
      ]);
      const questionsAnswered = allQuizSessions.reduce(
        (sum, s) => sum + (s.answerRecords?.length ?? Object.keys(s.answers ?? {}).length),
        0
      );
      const mocksTaken = allMockExams.length;
      const mocksPassed = allMockExams.filter((m) => m.passed).length;
      const achievementResult = achievements({
        xp: state.xp ?? 0,
        streak: state.streak ?? 0,
        questionsAnswered,
        mocksTaken,
        mocksPassed,
        predictedScore: predicted,
        calibration: cal?.score ?? null,
      }, passingScore);
      setAchievementList(achievementResult);

      // Celebration toast — diff against last-seen state in localStorage
      const earnedKeys = achievementResult.filter((a) => a.earned).map((a) => a.key);
      const currentTierKey = rankTier(predicted, passingScore)?.key ?? null;
      const newCelebrations = computeNewCelebrations(earnedKeys, currentTierKey);
      if (newCelebrations.length > 0) {
        setCelebrationItems(newCelebrations);
      }

      // Today's daily-goal progress (computed, piggybacked on this load).
      setAnsweredToday(answeredTodayCount);

      // Streak milestone — full-screen celebration when newly reached.
      // Seeds silently on first run so existing long-streak users aren't spammed.
      const milestoneToCelebrate = computeStreakCelebration(state.streak ?? 0);
      if (milestoneToCelebrate !== null) {
        setStreakMilestone(milestoneToCelebrate);
      }

      // Redirect new users to onboarding (only if never onboarded)
      if (!state.onboardedAt && state.totalStudyDays === 0) {
        const sessions = await db.quizSessions.count();
        if (sessions === 0) {
          router.replace("/onboarding");
          return;
        }
      }

      setUserState(state);
      setScore(predicted);
      setDomainData(domains);
      setWeak(weakObjs);
      setDueCount(due.length);
      setWrongCount(wrongStats.totalWrong);
      setMockExams(recentMocks);
      setCalibration(cal);
      setBestDrill(bestDrillResult);
      setDailyTrend(trend);
      setFsrsDueCount(fsrsDue);
      setTodayPlan(todayPlanResult);

      // Adaptive Study Planner — pure scorer over a Dexie-gathered snapshot.
      // Guarded so a failure here never breaks the rest of the dashboard.
      try {
        // Capture one `now` for both the snapshot and the scorer so slow IndexedDB
        // reads can't make daysUntilExam / overdue calcs diverge between them.
        const recoNow = new Date();
        const snapshot = await buildStudySnapshot(CERT_ID, recoNow);
        setStudySnapshot(snapshot);
        setRecommendation(rankStudyActivities(snapshot, recoNow));
      } catch (e) {
        console.warn("[dashboard] study recommendation failed:", e);
        setStudySnapshot(null);
      }
      if (pace) setPaceStats(pace);
      setVoiceAnswersThisWeek(voiceWeek);
      if (acronymCountResult > 0) setAcronymCount(acronymCountResult);
      if (pbqCountResult > 0) setPbqCount(pbqCountResult);
      if (atRisk) {
        setAtRiskStatus(atRisk);
        setAtRiskCountdown({ h: atRisk.hoursLeft, m: atRisk.minutesLeft });
      }

      // Load in-progress quiz (Resume widget) — guard against table not existing yet
      try {
        const STALE_MS = 24 * 60 * 60 * 1000;
        const inProgress = await db.inProgressQuizzes.get("current");
        if (inProgress) {
          const age = Date.now() - new Date(inProgress.updatedAt).getTime();
          // Delete stale, calibration, or single-Q records — they are not resumable
          if (
            age > STALE_MS ||
            inProgress.kind === "calibration" ||
            inProgress.questionIds.length === 1
          ) {
            await db.inProgressQuizzes.delete("current");
          } else {
            setInProgressQuiz(inProgress);
          }
        }
      } catch (e) {
        console.warn("[dashboard] resume widget load failed:", e);
      }

      setReady(true);

      // Auto-trigger welcome tour: only after onboarding, only once per version.
      // ?tour=1 in URL forces replay (used by Settings → "Show me around again").
      const forceTour = typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("tour") === "1";
      // Replay (?tour=1) ALWAYS fires regardless of onboarding state.
      // Auto-tour only fires post-onboarding, once per version.
      if (forceTour || (state.onboardedAt && shouldShowTour())) {
        startDashboardTour(getCert(getActiveCertId(state)));
        // Clean the query param so refresh doesn't re-fire
        if (forceTour && typeof window !== "undefined") {
          window.history.replaceState({}, "", "/");
        }
      }

      // Score count-up animation — runs once per mount
      if (predicted !== null && !scoreAnimatedRef.current) {
        scoreAnimatedRef.current = true;
        const reducedMotion =
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion) {
          setDisplayScore(predicted);
        } else {
          const start = 100;
          const end = predicted;
          const duration = 700;
          const startTime = performance.now();
          function tick(now: number) {
            const elapsed = now - startTime;
            const t = Math.min(elapsed / duration, 1);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplayScore(Math.round(start + (end - start) * eased));
            if (t < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      } else if (predicted !== null) {
        setDisplayScore(predicted);
      }
    }
    load();

    const supabase = createClient();
    // getSession() reads from localStorage instantly — no network call.
    // Avoids the "Sign in to sync" flash + the failure-mode where a slow
    // mobile network turns a logged-in user into a falsely-signed-out one.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
    });

    // Voice access check — only for authenticated users (avoids needless 401s for signed-out).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetch("/api/voice/access")
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d?.allowed) {
              setVoiceAllowed(true);
              // Surface remaining minutes on the CTA when known.
              const localDate = new Date().toLocaleDateString("en-CA");
              fetch(`/api/voice/quota?localDate=${encodeURIComponent(localDate)}`)
                .then((r) => (r.ok ? r.json() : null))
                .then((q) => {
                  if (typeof q?.minutesRemainingToday === "number")
                    setVoiceMinutesToday(q.minutesRemainingToday);
                })
                .catch(() => {});
            }
          })
          .catch(() => {});
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  // Push the latest local user_state (incl. freshly-computed predicted score) to
  // the cloud whenever a signed-in user opens the dashboard. Without this, only
  // the quiz/PBQ pages synced user_state, so progress from flashcards/drills/voice
  // — and the predicted score the leaderboard ranks on — never reached Supabase.
  // Guarded on xp > 0 so a fresh device (empty local state, pre-hydrate) can't
  // clobber good cloud data; predicted falls back to the cached value so a recompute
  // returning null never nulls out a known score.
  useEffect(() => {
    if (!authUser) return;
    let cancelled = false;
    (async () => {
      const st = await db.userState.get(1);
      if (cancelled || !st || (st.xp ?? 0) <= 0) return;
      const activeCertId = getActiveCertId(st);
      const predicted = await predictedScore(activeCertId).catch(() => null);
      await enqueue("upsert_user_state", {
        user_id: "",
        xp: st.xp,
        level: st.level,
        streak: st.streak,
        last_study_date: st.lastStudyDate ?? null,
        total_study_days: st.totalStudyDays,
        predicted_score: predicted ?? st.predictedScore ?? null,
        daily_goal_questions: st.dailyGoalQuestions ?? null,
        updated_at: new Date().toISOString(),
      }).catch(() => {});
      // Per-cert leaderboard row: use ONLY the freshly-computed per-cert score.
      // Never fall back to st.predictedScore (the global cached score) — doing so
      // would upload the PREVIOUS cert's score under this cert when the user has
      // no local mastery yet, poisoning the per-cert leaderboard. If the per-cert
      // recompute is null, skip the cert-score upsert entirely.
      if (predicted !== null) {
        await enqueue("upsert_cert_score", {
          cert_id: activeCertId,
          predicted_score: predicted,
          xp: st.xp,
        }).catch(() => {});
      }
    })();
    return () => { cancelled = true; };
  }, [authUser]);

  // Countdown timer for streak-at-risk chip — ticks every minute
  useEffect(() => {
    if (!atRiskStatus?.atRisk) return;
    const id = setInterval(() => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const msLeft = midnight.getTime() - now.getTime();
      const totalMinutes = Math.floor(msLeft / 60000);
      setAtRiskCountdown({ h: Math.floor(totalMinutes / 60), m: totalMinutes % 60 });
    }, 60000);
    return () => clearInterval(id);
  }, [atRiskStatus?.atRisk]);

  // Close calibration popover on outside click
  useEffect(() => {
    if (!calibrationOpen) return;
    function handleClick(e: MouseEvent) {
      if (calibrationRef.current && !calibrationRef.current.contains(e.target as Node)) {
        setCalibrationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [calibrationOpen]);

  async function saveExamDate() {
    const state = await db.userState.get(1);
    if (!state) return;
    await db.userState.put({ ...state, examDate: examDateInput || undefined });
    setUserState({ ...state, examDate: examDateInput || undefined });
    setExamDateEdit(false);
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)" }}>
        Loading…
      </div>
    );
  }

  // Active cert (registry-driven branding + score scale). Resolves to Sec+ today.
  const activeCert = getCert(getActiveCertId(userState ?? undefined));

  const level = userState ? xpToLevel(userState.xp) : 0;
  const xp = userState?.xp ?? 0;
  const streak = userState?.streak ?? 0;
  const streakFreezes = userState?.streakFreezes ?? 0;
  const streakMod = streak % 7;
  const daysToNextFreeze = streakMod === 0 ? 7 : 7 - streakMod;

  // Daily goal progress
  const dailyGoal = userState?.dailyGoalQuestions ?? DEFAULT_DAILY_GOAL;
  const goalMet = answeredToday >= dailyGoal;
  const goalPct = Math.min(100, Math.round((answeredToday / Math.max(1, dailyGoal)) * 100));

  // Exam date chip calculation
  const examDate = userState?.examDate;
  let daysUntilExam: number | null = null;
  let examChipUrgent = false;
  let examDateFormatted = "";
  if (examDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(examDate + "T00:00:00");
    daysUntilExam = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    examChipUrgent = daysUntilExam <= 7;
    examDateFormatted = target.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }

  // Final-week mode
  const daysToExam = daysUntilExam;
  const finalWeek = daysToExam !== null && daysToExam >= 0 && daysToExam <= 7;

  // ── Adaptive Study Planner: order Today's-plan items by ranked candidates ──
  // Map recommender Candidate kinds → TodayPlan item kinds (the two enums differ).
  const candidateToPlanKind: Partial<Record<CandidateKind, TodayPlanItem["kind"]>> = {
    "fsrs-mcq": "fsrs",
    "wrong-answer-review": "wrong-review",
    "daily-quiz": "daily-quiz",
    flashcards: "flashcards",
    "acronym-drill": "drill",
    "mock-exam": "mock-exam",
    // weakest-domain-drill has no TodayPlan equivalent → ignored for ordering.
  };
  const orderedTodayPlan: TodayPlanData | null = (() => {
    if (!todayPlan) return null;
    if (!recommendation) return todayPlan;
    // Rank index per plan kind from the recommendation order.
    const rankByKind = new Map<TodayPlanItem["kind"], number>();
    recommendation.candidates.forEach((c, i) => {
      const planKind = candidateToPlanKind[c.kind];
      if (planKind !== undefined && !rankByKind.has(planKind)) {
        rankByKind.set(planKind, i);
      }
    });
    const ranked = [...todayPlan.items].sort((a, b) => {
      const ra = rankByKind.get(a.kind) ?? Number.MAX_SAFE_INTEGER;
      const rb = rankByKind.get(b.kind) ?? Number.MAX_SAFE_INTEGER;
      if (ra !== rb) return ra - rb;
      return a.priority - b.priority; // stable fallback to original priority
    });
    return { ...todayPlan, items: ranked };
  })();

  const sessionMinutes = userState?.dailySessionMinutes ?? 20;
  const studyFocus = pickStudyFocus(recommendation, studySnapshot);
  const totalReviewBacklog = fsrsDueCount + dueCount + wrongCount;
  const reviewBacklogLabel =
    totalReviewBacklog > 0
      ? `${totalReviewBacklog} due/missed`
      : "Clear";
  const todayPlanContext = `${sessionMinutes}-min session · Focus: ${studyFocus}`;
  const recommendationSignals = recommendation
    ? buildRecommendationSignals(recommendation.top, studySnapshot, daysUntilExam, sessionMinutes)
    : [];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Streak milestone celebration (full-screen) — the bigger moment, shown over the toast */}
      {streakMilestone !== null && (
        <StreakMilestoneOverlay
          milestone={streakMilestone}
          streak={streak}
          onDismiss={() => setStreakMilestone(null)}
        />
      )}

      {/* Celebration toast (rank-up / achievement unlock) */}
      {celebrationItems.length > 0 && <CelebrationToast items={celebrationItems} />}

      {/* Streak freeze toast */}
      {freezeToast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(123,174,196,0.95)",
            color: "#fff",
            borderRadius: "8px",
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
            zIndex: 1000,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          ❄️ Streak freeze used — you&apos;re safe
        </div>
      )}
      {/* Sync banner — render nothing while auth is still resolving */}
      {authUser === undefined ? null : authUser === null ? (
        <div
          className="flex items-center justify-between px-4 py-2 text-sm"
          style={{
            borderRadius: "var(--r-md)",
            border: "1px solid var(--border-strong)",
            background: "var(--surface)",
            color: "var(--fg-muted)",
          }}
        >
          <span>Progress is local only.</span>
          <Link
            href="/login"
            style={{ color: "var(--accent)", fontWeight: 500, cursor: "pointer" }}
            className="hover:underline"
          >
            Sign in to sync →
          </Link>
        </div>
      ) : (
        <div
          className="flex items-center gap-2 px-4 py-2 text-sm"
          style={{
            borderRadius: "var(--r-md)",
            border: "1px solid var(--border)",
            background: "var(--surface)",
            color: "var(--fg-muted)",
          }}
        >
          <span style={{ color: "var(--success)" }}>●</span>
          <span>Cloud sync active.</span>
        </div>
      )}

      {BANK_IMPORT_ENABLED && bankStats && bankStats.total <= 12 && bankStats.starter >= Math.max(1, bankStats.total - 2) && (
        <section
          style={{
            background: "var(--surface)",
            border: "1px solid rgba(245,166,35,0.34)",
            borderRadius: "var(--r-md)",
            padding: "18px 20px",
            display: "grid",
            gap: "12px",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p
                className="font-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  marginBottom: "5px",
                }}
              >
                Starter bank loaded
              </p>
              <h2
                style={{
                  fontSize: "17px",
                  color: "var(--fg)",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                Build this into your own study lab
              </h2>
              <p style={{ fontSize: "13px", color: "var(--fg-muted)", lineHeight: 1.5 }}>
                You are using the tiny demo bank. Import your class questions or download the class pack to start a real bank.
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Link
                href="/import"
                style={{
                  height: "40px",
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 14px",
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Import bank
              </Link>
              <a
                href="/docs/class-pack-template.zip"
                style={{
                  height: "40px",
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 14px",
                  border: "1px solid var(--border-strong)",
                  color: "var(--fg)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                Class pack
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Hero — ASCII grid background */}
      <section
        className="hero-grid px-5 py-7 sm:px-7 sm:py-8"
        style={{
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        {/* Eyebrow */}
        <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: "20px" }}>
          {(userState?.totalStudyDays ?? 0) > 0 ? "Welcome back" : "Welcome"} &nbsp;·&nbsp; {`${activeCert.fullName} ${activeCert.version}`}
        </p>

        {/* Primary hero row: ring left, meta right */}
        <div
          className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8"
          data-tour="predicted-score"
        >
          {/* Score Ring — 160px on mobile, 200px on sm+ via CSS container trick */}
          <div className="shrink-0 hidden sm:block">
            <ScoreRing score={score} displayScore={displayScore} size={200} passScore={activeCert.passingScore} scoreMin={activeCert.scoreMin} scoreMax={activeCert.scoreMax} />
          </div>
          <div className="shrink-0 sm:hidden">
            <ScoreRing score={score} displayScore={displayScore} size={160} passScore={activeCert.passingScore} scoreMin={activeCert.scoreMin} scoreMax={activeCert.scoreMax} />
          </div>

          {/* Right: meta stack */}
          <div className="flex flex-col gap-4 w-full min-w-0">

            {/* Headline copy — cert label */}
            <div>
              {score === null ? (
                <p style={{ fontSize: "14px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", lineHeight: 1.5 }}>
                  Take your first quiz to generate a predicted exam score.
                </p>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
                    Predicted exam score
                  </p>
                  <RankBadge score={score} size="md" passingScore={activeCert.passingScore} />
                </div>
              )}
            </div>

            {/* Streak / Level / XP */}
            <div
              data-tour="streak"
              className="flex flex-col gap-2"
            >
              {/* Streak-at-risk chip */}
              {atRiskStatus?.atRisk && atRiskCountdown && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(245,166,35,0.15)",
                    border: "1px solid var(--accent)",
                    borderRadius: "4px",
                    padding: "3px 8px",
                    alignSelf: "flex-start",
                  }}
                >
                  <span style={{ fontSize: "12px" }}>⚠</span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--accent)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Streak at risk —{" "}
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>
                      {atRiskCountdown.h}h {atRiskCountdown.m}m
                    </span>{" "}
                    left today
                  </span>
                  {atRiskStatus.hasFreezeAvailable && (
                    <span style={{ fontSize: "10px", color: "#7BAEC4", fontFamily: "var(--font-sans)", fontWeight: 500 }}>
                      or a freeze will auto-apply tomorrow if you miss.
                    </span>
                  )}
                </div>
              )}

              {/* Streak row */}
              <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: "13px", color: "var(--fg)", fontFamily: "var(--font-sans)" }}>
                <span className="streak-flame" style={{ color: "var(--accent)", fontSize: "14px" }}>🔥</span>
                <span style={{ fontWeight: 500 }}>{streak} day streak</span>
                {/* Streak freeze chip */}
                {streakFreezes > 0 ? (
                  <span
                    title="Streak freezes available. Earn 1 every 7-day streak."
                    className="font-mono"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      color: "#7BAEC4",
                      background: "rgba(123,174,196,0.12)",
                      border: "1px solid rgba(123,174,196,0.35)",
                      borderRadius: "4px",
                      padding: "1px 6px",
                      cursor: "default",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ❄️ × {streakFreezes}
                  </span>
                ) : (
                  <span
                    title={`Earn a streak freeze by reaching a 7-day streak. ${daysToNextFreeze} day${daysToNextFreeze !== 1 ? "s" : ""} to go.`}
                    className="font-mono"
                    style={{
                      fontSize: "10px",
                      fontWeight: 500,
                      color: "var(--fg-subtle)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      padding: "1px 6px",
                      cursor: "default",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ❄️ {streak % FREEZE_EARN_INTERVAL}/{FREEZE_EARN_INTERVAL} to freeze
                  </span>
                )}
              </div>

              {/* Daily goal progress */}
              <div
                className="flex items-center gap-2"
                title={`Answer ${dailyGoal} questions today to keep your streak alive.`}
                style={{ fontSize: "12px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}
              >
                {goalMet ? (
                  <span style={{ color: "var(--success)", fontWeight: 600, whiteSpace: "nowrap" }}>
                    ✓ Goal complete
                  </span>
                ) : (
                  <span style={{ whiteSpace: "nowrap" }}>
                    Today:{" "}
                    <span className="font-mono" style={{ color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}>
                      {answeredToday}/{dailyGoal}
                    </span>
                  </span>
                )}
                <span
                  aria-hidden="true"
                  style={{
                    flex: "0 1 120px",
                    height: "4px",
                    borderRadius: "2px",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    overflow: "hidden",
                    display: "inline-block",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      height: "100%",
                      width: `${goalPct}%`,
                      background: goalMet ? "var(--success)" : "var(--accent)",
                      transition: "width 300ms ease",
                    }}
                  />
                </span>
              </div>

              {/* Level + XP row */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
                <LevelBadge level={level} size={26} />
                <span>Level {level}</span>
                <span style={{ color: "var(--border-strong)" }}>·</span>
                <span className="font-mono" style={{ letterSpacing: 0, color: "var(--fg-muted)" }}>{xp.toLocaleString()} XP</span>
              </div>
            </div>

            {/* Secondary chip row — exam date + pace (lower contrast, tucked) */}
            <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "-4px" }}>
              {/* Exam date chip */}
              {examDate && daysUntilExam !== null && (
                <div style={{ position: "relative" }}>
                  <button
                    title={`Exam scheduled: ${examDateFormatted}`}
                    onClick={() => {
                      setExamDateInput(examDate);
                      setExamDateEdit(true);
                      setTimeout(() => examInputRef.current?.focus(), 50);
                    }}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      color: examChipUrgent ? "var(--accent)" : "var(--fg-subtle)",
                      background: examChipUrgent ? "rgba(245,166,35,0.12)" : "var(--surface-2)",
                      border: `1px solid ${examChipUrgent ? "var(--accent)" : "var(--border)"}`,
                      borderRadius: "var(--r-sm)",
                      padding: "2px 7px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    T-{daysUntilExam} days
                  </button>
                  {examDateEdit && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        left: 0,
                        background: "var(--surface)",
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--r-md)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                        padding: "14px",
                        zIndex: 100,
                        width: "220px",
                      }}
                    >
                      <p style={{ fontSize: "11px", color: "var(--fg-muted)", marginBottom: "8px", fontFamily: "var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Change exam date
                      </p>
                      <input
                        ref={examInputRef}
                        type="date"
                        value={examDateInput}
                        onChange={(e) => setExamDateInput(e.target.value)}
                        style={{
                          width: "100%",
                          height: "36px",
                          border: "1px solid var(--border-strong)",
                          borderRadius: "var(--r-sm)",
                          padding: "0 8px",
                          fontSize: "13px",
                          fontFamily: "var(--font-mono)",
                          color: "var(--fg)",
                          background: "var(--bg)",
                          boxSizing: "border-box",
                        }}
                      />
                      <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                        <button
                          onClick={saveExamDate}
                          style={{
                            flex: 1,
                            height: "32px",
                            background: "var(--accent)",
                            color: "var(--accent-fg)",
                            border: "none",
                            borderRadius: "var(--r-sm)",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setExamDateEdit(false)}
                          style={{
                            height: "32px",
                            background: "transparent",
                            color: "var(--fg-muted)",
                            border: "1px solid var(--border-strong)",
                            borderRadius: "var(--r-sm)",
                            fontSize: "12px",
                            cursor: "pointer",
                            fontFamily: "var(--font-sans)",
                            padding: "0 10px",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pace chip — quieter styling */}
              {paceStats !== null && (
                <div
                  title={`Based on last 30 days · ${paceStats.count} answers · target: 60s/Q`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    color: paceStats.onTarget ? "var(--accent)" : "var(--fg-subtle)",
                    background: "var(--surface-2)",
                    border: `1px solid ${paceStats.onTarget ? "rgba(245,166,35,0.4)" : "var(--border)"}`,
                    borderRadius: "4px",
                    padding: "2px 7px",
                    cursor: "default",
                    whiteSpace: "nowrap",
                  }}
                >
                  Pace: {Math.round(paceStats.avgMs / 1000)}s/Q
                </div>
              )}

              {/* Calibration chip */}
              {calibration && calibration.score !== null && (
                <div ref={calibrationRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setCalibrationOpen((o) => !o)}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "0.06em",
                      color: "var(--fg-subtle)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--r-sm)",
                      padding: "2px 7px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Cal: {calibration.score.toFixed(2)} · {calibrationLabel(calibration.score)}
                  </button>
                  {calibrationOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 8px)",
                        left: 0,
                        background: "var(--surface)",
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--r-md)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                        padding: "14px 16px",
                        zIndex: 100,
                        width: "260px",
                      }}
                    >
                      <p style={{ fontSize: "11px", color: "var(--fg-muted)", marginBottom: "10px", fontFamily: "var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                        Confidence vs. accuracy
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {calibration.bins.map((bin) => (
                          <div key={bin.confidence} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "12px", color: "var(--fg)", fontFamily: "var(--font-mono)", textTransform: "capitalize" }}>
                              {bin.confidence}
                            </span>
                            <span style={{ fontSize: "12px", color: "var(--fg-muted)", fontFamily: "var(--font-mono)" }}>
                              {bin.n === 0 ? "—" : `${Math.round(bin.accuracy * 100)}% right (${bin.n})`}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--fg-muted)", marginTop: "10px", fontFamily: "var(--font-sans)", lineHeight: 1.4 }}>
                        Lower score = better calibrated. &lt;0.15 great · 0.15–0.25 good · 0.25–0.4 okay · &gt;0.4 overconfident.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {finalWeek && daysToExam !== null && (
                <span
                  className="font-mono"
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: "var(--accent)",
                    background: "rgba(245,166,35,0.12)",
                    border: "1px solid var(--accent)",
                    borderRadius: "var(--r-sm)",
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  T-{daysToExam} days — final week mode
                </span>
              )}
            </div>

            <div
              aria-label="Study setup"
              className="grid grid-cols-2 lg:grid-cols-4 gap-2"
            >
              <StudyBriefMetric
                label="Exam"
                value={formatExamWindow(daysUntilExam, !!examDate)}
                href={!examDate ? "/settings" : undefined}
                tone={examDate && daysUntilExam !== null && daysUntilExam <= 14 ? "accent" : "muted"}
              />
              <StudyBriefMetric
                label="Session"
                value={`${sessionMinutes} min · ${dailyGoal} Q goal`}
                href="/settings"
                tone={goalMet ? "accent" : "muted"}
              />
              <StudyBriefMetric
                label="Focus"
                value={studyFocus}
                href={recommendation?.top.href}
                tone={recommendation ? "accent" : "muted"}
              />
              <StudyBriefMetric
                label="Review"
                value={reviewBacklogLabel}
                href={
                  wrongCount > 0
                    ? "/review"
                    : fsrsDueCount > 0
                      ? "/quiz?mode=fsrs"
                      : dueCount > 0
                        ? "/flashcards"
                        : undefined
                }
                tone={totalReviewBacklog > 0 ? "accent" : "muted"}
              />
            </div>

            {/* Divider + action row */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px" }}>
              <div className="flex items-center gap-2 flex-wrap">
                {score !== null && (
                  <ShareButton score={score} kind="predicted" streak={streak > 0 ? streak : undefined} certId={activeCert.id} />
                )}
                {authUser && score !== null && (
                  <Link
                    href="/leaderboard"
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      color: "var(--fg-muted)",
                      background: "var(--surface-2)",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "var(--r-sm)",
                      padding: "2px 8px",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.borderColor = "var(--accent)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--fg-muted)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                  >
                    Compare with others →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final-week focus mode banner */}
      {finalWeek && (
        <div
          style={{
            background: "rgba(245,166,35,0.08)",
            border: "1px solid var(--accent)",
            borderRadius: "var(--r-md)",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--accent)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "3px",
              }}
            >
              Final Week Mode
            </p>
            <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
              {daysToExam === 0
                ? "Exam day — focus on your weakest domains."
                : `${daysToExam} day${daysToExam !== 1 ? "s" : ""} until exam — drilling weakest 3 domains.`}
            </p>
          </div>
          <Link
            href="/quiz?mode=final-week"
            style={{
              height: "36px",
              padding: "0 16px",
              background: "var(--accent)",
              color: "var(--accent-fg)",
              borderRadius: "var(--r-sm)",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "var(--accent)")}
          >
            Final Week Drill →
          </Link>
        </div>
      )}

      {/* ─── Desktop two-column layout ─── */}
      {/* On mobile: single column (default). On lg+: left col = actions, right col = stats */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
        {/* LEFT column: primary CTAs */}
        <div className="space-y-3">
          {/* Resume in-progress quiz card */}
          {inProgressQuiz &&
            (() => {
              const answeredCount = Object.keys(inProgressQuiz.answers).length;
              const totalCount = inProgressQuiz.questionIds.length;
              const minutesAgo = Math.round(
                (new Date().getTime() - new Date(inProgressQuiz.startedAt).getTime()) / 60000
              );
              const timeLabel =
                minutesAgo < 1 ? "just now" : minutesAgo === 1 ? "1 min ago" : `${minutesAgo} min ago`;
              return (
                <Link
                  href={`/quiz?mode=${inProgressQuiz.mode ?? inProgressQuiz.kind}`}
                  className="flex items-center justify-between px-4 py-3 transition-colors cursor-pointer"
                  style={{
                    background: "rgba(245,166,35,0.06)",
                    borderRadius: "var(--r-sm)",
                    border: "1px solid rgba(245,166,35,0.45)",
                    textDecoration: "none",
                    outline: "none",
                    display: "flex",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(245,166,35,0.12)";
                    e.currentTarget.style.borderColor = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(245,166,35,0.06)";
                    e.currentTarget.style.borderColor = "rgba(245,166,35,0.45)";
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="flex flex-col gap-0.5">
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--accent)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Resume Quiz
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--fg)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {answeredCount} of {totalCount} answered · started {timeLabel}
                    </span>
                  </div>
                  <span style={{ color: "var(--accent)", fontSize: "16px", marginLeft: "8px" }}>
                    →
                  </span>
                </Link>
              );
            })()}

          {/* ── Recommended next (Adaptive Study Planner) ── */}
          {recommendation && (
            <Link
              href={recommendation.top.href}
              data-tour="recommended-next"
              className="transition-colors cursor-pointer"
              style={{
                background: "rgba(245,166,35,0.06)",
                borderRadius: "var(--r-sm)",
                border: "1px solid var(--accent)",
                textDecoration: "none",
                outline: "none",
                display: "block",
                padding: "16px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(245,166,35,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(245,166,35,0.06)";
              }}
              onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent)"; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1" style={{ minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--accent)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    Study this next
                  </span>
                  <span style={{ fontSize: "15px", color: "var(--fg)", fontFamily: "var(--font-sans)", fontWeight: 700, lineHeight: 1.35 }}>
                    {recommendation.top.label}
                    <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>
                      {" · "}{recommendation.top.detail}
                    </span>
                  </span>
                </div>
                <span
                  className="font-mono"
                  style={{
                    color: "var(--accent)",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    flexShrink: 0,
                    paddingTop: "2px",
                  }}
                >
                  Start →
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", lineHeight: 1.45, marginTop: "8px" }}>
                {recommendation.top.rationale}
              </p>
              {recommendationSignals.length > 0 && (
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2"
                  style={{ marginTop: "12px" }}
                >
                  {recommendationSignals.map((signal) => (
                    <span
                      key={`${signal.label}:${signal.value}`}
                      style={{
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        padding: "7px 8px",
                        borderRadius: "var(--r-sm)",
                        border: `1px solid ${signal.tone === "accent" ? "rgba(245,166,35,0.42)" : "var(--border)"}`,
                        background: signal.tone === "accent" ? "rgba(245,166,35,0.07)" : "rgba(255,255,255,0.02)",
                      }}
                    >
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "9px",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: signal.tone === "accent" ? "var(--accent)" : "var(--fg-subtle)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {signal.label}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--fg)",
                          fontFamily: "var(--font-sans)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {signal.value}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </Link>
          )}

          {/* Today's plan widget — ordered by the ranked study candidates */}
          {orderedTodayPlan && orderedTodayPlan.items.length > 0 && (
            <div data-tour="today-plan">
              <TodayPlan plan={orderedTodayPlan} context={todayPlanContext} />
            </div>
          )}

          {/* CTA Buttons — primary pair */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href={finalWeek ? "/quiz?mode=final-week" : "/quiz"}
              className="h-12 text-sm font-medium flex items-center justify-center transition-colors cursor-pointer"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
                borderRadius: "var(--r-sm)",
                fontFamily: "var(--font-sans)",
                border: "none",
                textDecoration: "none",
                outline: "none",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--accent-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "var(--accent)")}
              onFocus={e => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent)"; e.currentTarget.style.outlineOffset = "2px"; }}
              onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
            >
              {finalWeek ? "Final Week Drill — weakest 3 domains" : "Start Daily Quiz"}
            </Link>
            <Link
              href="/flashcards"
              className="h-12 text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              style={{
                background: "transparent",
                color: "var(--fg)",
                borderRadius: "var(--r-sm)",
                fontFamily: "var(--font-sans)",
                border: "1px solid var(--border-strong)",
                textDecoration: "none",
                outline: "none",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "rgba(245,166,35,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.background = "transparent"; }}
              onFocus={e => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent)"; }}
              onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
            >
              Review Flashcards
              {dueCount > 0 && (
                <span
                  className="font-mono"
                  style={{
                    background: "var(--accent)",
                    color: "var(--accent-fg)",
                    borderRadius: "var(--r-sm)",
                    padding: "1px 6px",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {dueCount}
                </span>
              )}
            </Link>
          </div>

          {/* Wrong-answer review CTA — only shown when there are wrongs */}
          {wrongCount > 0 && (
            <Link
              href="/review"
              className="flex items-center justify-between h-12 px-4 text-sm font-medium transition-colors cursor-pointer"
              style={{
                background: "transparent",
                color: "var(--fg)",
                borderRadius: "var(--r-sm)",
                fontFamily: "var(--font-sans)",
                border: `1px solid ${wrongCount >= 10 ? "var(--accent)" : "var(--border-strong)"}`,
                textDecoration: "none",
                outline: "none",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "rgba(245,166,35,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = wrongCount >= 10 ? "var(--accent)" : "var(--border-strong)"; e.currentTarget.style.background = "transparent"; }}
              onFocus={e => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent)"; }}
              onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <span style={{ color: wrongCount >= 10 ? "var(--accent)" : "var(--fg)" }}>
                Review wrong answers
              </span>
              <span
                className="font-mono"
                style={{
                  background: wrongCount >= 10 ? "rgba(245,166,35,0.12)" : "var(--surface-2)",
                  color: wrongCount >= 10 ? "var(--accent)" : "var(--fg-muted)",
                  borderRadius: "var(--r-sm)",
                  padding: "1px 7px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {wrongCount} from last 14 days
              </span>
            </Link>
          )}

          {/* Voice tutor CTA — only shown to allowlisted users */}
          {voiceAllowed && (
            <Link
              href="/voice"
              className="flex items-center justify-between h-12 px-4 text-sm font-medium transition-colors cursor-pointer"
              style={{
                background: "transparent",
                color: "var(--fg)",
                borderRadius: "var(--r-sm)",
                fontFamily: "var(--font-sans)",
                border: "1px solid var(--border-strong)",
                textDecoration: "none",
                outline: "none",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "rgba(245,166,35,0.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.background = "transparent"; }}
              onFocus={e => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent)"; }}
              onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <span>Talk to a live AI tutor</span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {voiceAnswersThisWeek > 0 && (
                  <span
                    className="font-mono"
                    title="Questions you answered by voice this week"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "rgba(245,166,35,0.12)",
                      color: "var(--accent)",
                      borderRadius: "var(--r-sm)",
                      padding: "1px 7px",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    <MicGlyph size={11} />
                    {voiceAnswersThisWeek} this week
                  </span>
                )}
                <span
                  className="font-mono"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--fg-muted)",
                    borderRadius: "var(--r-sm)",
                    padding: "1px 7px",
                    fontSize: "11px",
                    fontWeight: 600,
                  }}
                >
                  {voiceMinutesToday !== null
                    ? `${voiceMinutesToday} min left · beta`
                    : "30 min/day · beta"}
                </span>
              </span>
            </Link>
          )}

          {/* FSRS scheduled review chip */}
          <Link
            href={fsrsDueCount > 0 ? "/quiz?mode=fsrs" : "#"}
            aria-disabled={fsrsDueCount === 0}
            className="flex items-center justify-between h-12 px-4 text-sm font-medium transition-colors cursor-pointer"
            style={{
              background: "transparent",
              color: "var(--fg)",
              borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-sans)",
              border: `1px solid ${fsrsDueCount > 0 ? "rgba(245,166,35,0.5)" : "var(--border-strong)"}`,
              textDecoration: "none",
              outline: "none",
              pointerEvents: fsrsDueCount === 0 ? "none" : undefined,
            }}
            onMouseEnter={e => { if (fsrsDueCount > 0) { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "rgba(245,166,35,0.04)"; } }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = fsrsDueCount > 0 ? "rgba(245,166,35,0.5)" : "var(--border-strong)"; e.currentTarget.style.background = "transparent"; }}
            onFocus={e => { if (fsrsDueCount > 0) e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent)"; }}
            onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
          >
            <span style={{ color: fsrsDueCount > 0 ? "var(--fg)" : "var(--fg-muted)" }}>
              {fsrsDueCount > 0 ? "Scheduled reviews due" : "Scheduled reviews"}
            </span>
            <span
              className="font-mono"
              style={{
                background: fsrsDueCount > 0 ? "rgba(245,166,35,0.12)" : "var(--surface-2)",
                color: fsrsDueCount > 0 ? "var(--accent)" : "var(--fg-subtle)",
                borderRadius: "var(--r-sm)",
                padding: "1px 7px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {fsrsDueCount > 0 ? `${fsrsDueCount} due` : "All caught up · check back tomorrow"}
            </span>
          </Link>

          {/* PBQ CTA */}
          <Link
            href="/pbq"
            className="flex items-center justify-between h-12 px-4 text-sm font-medium transition-colors cursor-pointer"
            style={{
              background: "transparent",
              color: "var(--fg)",
              borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-sans)",
              border: "1px solid var(--border-strong)",
              textDecoration: "none",
              outline: "none",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "rgba(245,166,35,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.background = "transparent"; }}
            onFocus={e => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent)"; }}
            onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
          >
            <span>Practice Performance-Based Questions</span>
            <span
              className="font-mono"
              style={{
                background: "rgba(245,166,35,0.12)",
                color: "var(--accent)",
                borderRadius: "var(--r-sm)",
                padding: "1px 7px",
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {pbqCount} available
            </span>
          </Link>

          {/* Acronym Drill CTA */}
          <Link
            href="/drill"
            className="flex items-center justify-between h-12 px-4 text-sm font-medium transition-colors cursor-pointer"
            style={{
              background: "transparent",
              color: "var(--fg)",
              borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-sans)",
              border: "1px solid var(--border-strong)",
              textDecoration: "none",
              outline: "none",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "rgba(245,166,35,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.background = "transparent"; }}
            onFocus={e => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent)"; }}
            onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
          >
            <div className="flex flex-col">
              <span>Acronym Drill</span>
              <span style={{ fontSize: "11px", color: "var(--fg-subtle)", fontFamily: "var(--font-sans)" }}>60s rapid recall</span>
            </div>
            {bestDrill ? (
              <span
                className="font-mono"
                style={{
                  background: "rgba(245,166,35,0.12)",
                  color: "var(--accent)",
                  borderRadius: "var(--r-sm)",
                  padding: "1px 7px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                Best: {bestDrill.correct}
              </span>
            ) : (
              <span
                className="font-mono"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--fg-muted)",
                  borderRadius: "var(--r-sm)",
                  padding: "1px 7px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {acronymCount} acronyms
              </span>
            )}
          </Link>

          {/* Domain Mastery */}
          <div
            data-tour="domain-mastery"
            style={{
              background: "var(--surface)",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--border)",
              padding: "20px 24px",
              marginTop: "8px",
            }}
          >
            <h2
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
                fontFamily: "var(--font-sans)",
                marginBottom: "16px",
              }}
            >
              Domain Mastery
            </h2>
            <div className="space-y-4">
              {domainData.map(({ domain, mastery }) => (
                <div key={domain.id}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span style={{ fontSize: "13px", color: "var(--fg)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ color: "var(--fg-muted)", flexShrink: 0, display: "inline-flex" }}><DomainIcon domain={domain.number as 1|2|3|4|5} size={16} /></span>
                      {domain.number}. {domain.name}
                    </span>
                    <span className="flex items-center gap-2">
                      {mastery === null ? (
                        <span style={{ fontSize: "12px", color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>not yet quizzed</span>
                      ) : (
                        <span
                          className="font-mono"
                          style={{ fontSize: "12px", color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}
                        >
                          {Math.round(mastery * 100)}%
                        </span>
                      )}
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          color: "var(--fg-subtle)",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {Math.round(domain.weight * 100)}% exam
                      </span>
                    </span>
                  </div>
                  {/* Hairline 2px progress bar */}
                  <div
                    style={{
                      height: "2px",
                      background: "var(--border-strong)",
                      borderRadius: "1px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${mastery === null ? 0 : Math.round(mastery * 100)}%`,
                        background: mastery === null ? "transparent" : "var(--accent)",
                        transition: "width 300ms ease-out",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT column: stats, mock exam history, focus areas */}
        <div className="space-y-4 lg:space-y-5">
          {/* Mock Exam History / CTA */}
          {mockExams.length === 0 ? (
            <Link
              href="/exam"
              data-tour="mock-exam"
              className="flex items-center justify-between px-4 py-4 transition-colors cursor-pointer"
              style={{
                background: "var(--surface)",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--border)",
                textDecoration: "none",
                display: "flex",
                outline: "none",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "rgba(245,166,35,0.03)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}
              onFocus={e => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent)"; }}
              onBlur={e => { e.currentTarget.style.boxShadow = "none"; }}
            >
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--fg)", fontFamily: "var(--font-sans)", marginBottom: "3px" }}>
                  Try a full mock exam
                </p>
                <p style={{ fontSize: "12px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
                  90 Qs · 90 min · simulates real test conditions
                </p>
              </div>
              <span style={{ color: "var(--accent)", fontSize: "18px" }}>→</span>
            </Link>
          ) : (
            <div
              data-tour="mock-exam"
              style={{
                background: "var(--surface)",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--border)",
                padding: "20px 24px",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--fg-muted)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Mock Exam History
                </h2>
                <Link
                  href="/exam"
                  style={{ fontSize: "12px", color: "var(--accent)", fontFamily: "var(--font-sans)", textDecoration: "none", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.textDecoration = "underline"; }}
                  onMouseLeave={e => { e.currentTarget.style.textDecoration = "none"; }}
                >
                  Take another →
                </Link>
              </div>
              <div className="flex items-center gap-6">
                {/* Last score */}
                <div>
                  <p style={{ fontSize: "11px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "3px" }}>Last score</p>
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="font-display"
                      style={{ fontSize: "36px", fontWeight: 400, color: "var(--fg)", lineHeight: 1 }}
                    >
                      {mockExams[0].predictedScore}
                    </span>
                    <span className="font-mono" style={{ fontSize: "14px", color: "var(--fg-muted)" }}>/900</span>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        color: mockExams[0].passed ? "var(--success)" : "var(--error)",
                        background: mockExams[0].passed ? "rgba(95,179,124,0.12)" : "rgba(229,92,92,0.12)",
                        borderRadius: "var(--r-sm)",
                        padding: "1px 5px",
                        marginLeft: "2px",
                      }}
                    >
                      {mockExams[0].passed ? "PASS" : "FAIL"}
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--fg-subtle)", fontFamily: "var(--font-mono)", marginTop: "3px" }}>
                    {new Date(mockExams[0].startedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
                {/* Sparkline */}
                <div style={{ flex: 1 }}>
                  <MockSparkline exams={mockExams} />
                </div>
              </div>
            </div>
          )}

          {/* Suggested Starting Points / Focus Areas */}
          {weak.length > 0 && (
            <div
              style={{
                background: "var(--surface)",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--border)",
                padding: "20px 24px",
              }}
            >
              <h2
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--fg-muted)",
                  fontFamily: "var(--font-sans)",
                  marginBottom: "16px",
                }}
              >
                {weak.every((w) => w.mastery === null) ? "Suggested Starting Points" : "Focus Areas"}
              </h2>
              <div className="space-y-0">
                {weak.map(({ objective, mastery }, i) => (
                  <div
                    key={objective.id}
                    className="flex items-center justify-between py-3"
                    style={{
                      borderTop: i > 0 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Amber chip for objective code */}
                      <span
                        className="font-mono"
                        style={{
                          background: "rgba(245, 166, 35, 0.12)",
                          color: "var(--accent)",
                          borderRadius: "var(--r-sm)",
                          padding: "2px 6px",
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.04em",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {objective.code}
                      </span>
                      <span style={{ fontSize: "13px", color: "var(--fg)" }}>{objective.name}</span>
                    </div>
                    <span
                      className="font-mono shrink-0 ml-3"
                      style={{
                        fontSize: "12px",
                        color: "var(--fg-muted)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {mastery === null ? "—" : `${Math.round(mastery * 100)}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Achievements card ── */}
          {achievementList.length > 0 && (
            <div
              data-section="achievements"
              style={{
                background: "var(--surface)",
                borderRadius: "var(--r-md)",
                border: "1px solid var(--border)",
                padding: "20px 24px",
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
                <h2
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--fg-muted)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Achievements
                </h2>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--accent)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {earnedCount(achievementList)} / {achievementList.length} unlocked
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: "8px",
                }}
              >
                {[...achievementList].sort((a, b) => Number(b.earned) - Number(a.earned)).map((a) => (
                  <div
                    key={a.key}
                    title={a.description}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                      padding: "10px 12px",
                      borderRadius: "var(--r-sm)",
                      border: `1px solid ${a.earned ? "rgba(245,166,35,0.4)" : "var(--border)"}`,
                      background: a.earned ? "rgba(245,166,35,0.07)" : "var(--surface-2)",
                      opacity: a.earned ? 1 : 0.6,
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "12px",
                        fontWeight: 600,
                        fontFamily: "var(--font-sans)",
                        color: a.earned ? "var(--accent)" : "var(--fg-muted)",
                      }}
                    >
                      <span aria-hidden="true" style={{ fontSize: "11px" }}>
                        {a.earned ? "★" : "☆"}
                      </span>
                      {a.label}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--fg-subtle)",
                        fontFamily: "var(--font-sans)",
                        lineHeight: 1.35,
                      }}
                    >
                      {a.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 30-day score trend card ── */}
          {(() => {
            const totalSessions = dailyTrend.reduce((s, d) => s + d.sessions, 0);
            const avgAll =
              dailyTrend.length > 0
                ? Math.round(
                    dailyTrend.reduce((s, d) => s + d.avgScore, 0) /
                      dailyTrend.length
                  )
                : null;
            const best =
              dailyTrend.length > 0
                ? dailyTrend.reduce((a, b) => (b.avgScore > a.avgScore ? b : a))
                : null;
            const direction = trendDirection(dailyTrend);
            const directionLabel =
              direction === "improving"
                ? "↑ improving"
                : direction === "declining"
                  ? "↓ declining"
                  : "→ steady";
            const directionColor =
              direction === "improving"
                ? "var(--success)"
                : direction === "declining"
                  ? "var(--error)"
                  : "var(--fg-muted)";

            return (
              <div
                style={{
                  background: "var(--surface)",
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--border)",
                  padding: "20px 24px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--fg-muted)",
                    fontFamily: "var(--font-sans)",
                    marginBottom: "2px",
                  }}
                >
                  Last 30 days
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--fg-subtle)",
                    fontFamily: "var(--font-mono)",
                    marginBottom: "14px",
                  }}
                >
                  Avg quiz score &middot;{" "}
                  {totalSessions} session{totalSessions !== 1 ? "s" : ""}
                </p>

                <TrendChart trend={dailyTrend} days={30} />

                {dailyTrend.length > 0 && (
                  <div
                    style={{
                      marginTop: "14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    {best && (
                      <div className="flex justify-between">
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--fg-muted)",
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Best day
                        </span>
                        <span
                          className="font-mono"
                          style={{ fontSize: "12px", color: "var(--fg)" }}
                        >
                          {best.avgScore}% on{" "}
                          {new Date(
                            best.date + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {avgAll !== null && (
                      <div className="flex justify-between">
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--fg-muted)",
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          Average
                        </span>
                        <span
                          className="font-mono"
                          style={{ fontSize: "12px", color: "var(--fg)" }}
                        >
                          {avgAll}%
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--fg-muted)",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        Trend
                      </span>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "12px",
                          color: directionColor,
                          fontWeight: 600,
                        }}
                      >
                        {directionLabel}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── Monthly streak calendar ── */}
          <div
            data-section="streak-calendar"
            style={{
              background: "var(--surface)",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--border)",
              padding: "20px 24px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
                fontFamily: "var(--font-sans)",
                marginBottom: "14px",
              }}
            >
              Streak calendar
            </p>
            <StreakCalendar
              lastFreezeAppliedAt={userState?.lastFreezeAppliedAt}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
