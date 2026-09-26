# Complete corrected files

Each section contains the entire file, ready to replace the corresponding file in this checkout. This bundle is specific to this repository; do not replace production seed/cert files with public-starter versions.

## app/changelog/page.tsx

```tsx
import Link from "next/link";
import { changelogEntries, type ChangeEntry } from "@/lib/changelog";

function EntryCard({ entry, index }: { entry: ChangeEntry; index: number }) {
  return (
    <article
      className="changelog-entry"
      id={entry.id}
      style={{
        borderTop: index === 0 ? "1px solid var(--border-strong)" : "1px solid var(--border)",
      }}
    >
      <div className="changelog-meta">
        <p
          className="font-mono"
          style={{
            color: "var(--accent)",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          {entry.label}
        </p>
        <time
          dateTime={entry.date}
          className="font-mono"
          style={{ color: "var(--fg-subtle)", fontSize: "12px" }}
        >
          {entry.date}
        </time>
      </div>
      <div
        className="changelog-card"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
        }}
      >
        <h2 className="changelog-title" style={{ color: "var(--fg)", fontWeight: 700, lineHeight: 1.15, marginBottom: "8px" }}>
          {entry.title}
        </h2>
        <p className="changelog-summary" style={{ color: "var(--fg-muted)", lineHeight: 1.6, marginBottom: "18px" }}>
          {entry.summary}
        </p>
        <div style={{ display: "grid", gap: "12px" }}>
          {entry.items.map((item) => (
            <section
              className="changelog-item"
              key={item.title}
              style={{
                borderLeft: "2px solid rgba(245,166,35,0.55)",
              }}
            >
              <h3 className="changelog-item-title" style={{ color: "var(--fg)", fontWeight: 700, marginBottom: "4px" }}>
                {item.title}
              </h3>
              <p className="changelog-item-body" style={{ color: "var(--fg-muted)", lineHeight: 1.55 }}>{item.body}</p>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function ChangelogPage() {
  return (
    <main className="changelog-main mx-auto max-w-4xl px-4 py-8 pb-24">
      <style>{`
        .changelog-main {
          overflow-x: hidden;
        }

        .changelog-entry {
          display: grid;
          grid-template-columns: minmax(92px, 120px) minmax(0, 1fr);
          gap: 18px;
          padding-top: 22px;
          min-width: 0;
        }

        .changelog-card {
          padding: 20px;
          min-width: 0;
          max-width: 100%;
          overflow-wrap: anywhere;
        }

        .changelog-title {
          font-size: 24px;
          overflow-wrap: anywhere;
        }

        .changelog-summary {
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .changelog-item {
          padding-left: 12px;
          min-width: 0;
        }

        .changelog-item-title {
          font-size: 15px;
          overflow-wrap: anywhere;
        }

        .changelog-item-body {
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        @media (max-width: 640px) {
          .changelog-main {
            padding-left: 14px;
            padding-right: 14px;
          }

          .changelog-entry {
            grid-template-columns: minmax(0, 1fr);
            gap: 10px;
            padding-top: 18px;
          }

          .changelog-meta {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 12px;
            min-width: 0;
          }

          .changelog-card {
            padding: 16px;
          }

          .changelog-title {
            font-size: 21px;
          }

          .changelog-summary {
            font-size: 13px;
            margin-bottom: 14px !important;
          }

          .changelog-item {
            padding-left: 10px;
          }

          .changelog-item-title {
            font-size: 14px;
          }

          .changelog-item-body {
            font-size: 12px;
          }

          .changelog-actions a {
            flex: 1 1 150px;
            justify-content: center;
          }
        }
      `}</style>
      <section style={{ marginBottom: "28px" }}>
        <p
          className="font-mono"
          style={{
            color: "var(--accent)",
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Changelog
        </p>
        <h1
          className="font-display"
          style={{
            color: "var(--fg)",
            fontSize: "clamp(44px, 9vw, 84px)",
            lineHeight: 0.92,
            fontWeight: 400,
            marginBottom: "16px",
          }}
        >
          What changed and why.
        </h1>
        <p style={{ color: "var(--fg-muted)", fontSize: "16px", lineHeight: 1.65, maxWidth: "680px" }}>
          A short product log for the study app, public starter, and class-lab materials. It is written for learners,
          classmates, instructors, and anyone evaluating the build.
        </p>
        <div className="changelog-actions" style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
          <Link
            href="/lab"
            style={{
              height: "42px",
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
            Open lab hub
          </Link>
          <a
            href="https://github.com/h3cz/study"
            target="_blank"
            rel="noreferrer"
            style={{
              height: "42px",
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
            View public starter
          </a>
        </div>
      </section>

      <section style={{ display: "grid", gap: "22px" }} aria-label="Product changelog">
        {changelogEntries.map((entry, index) => (
          <EntryCard key={`${entry.date}-${entry.label}`} entry={entry} index={index} />
        ))}
      </section>
    </main>
  );
}

```

## app/layout.tsx

```tsx
import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { CommandPalette } from "@/components/CommandPalette";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { InstallPrompt } from "@/components/InstallPrompt";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://study.hecz.dev"),
  title: "hecz / study — certification practice",
  description: "Free Microsoft Azure AZ-104 and CompTIA Security+, Network+ & A+ practice — questions and spaced-repetition flashcards. Built by Hecz.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/brand/h-mark.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "hecz study",
  },
  openGraph: {
    images: [{ url: "/brand/og-light.png", width: 2752, height: 1536 }],
  },
  twitter: {
    images: ["/brand/og-light.png"],
  },
};

export const viewport: Viewport = {
  // viewport-fit=cover is required for env(safe-area-inset-*) to resolve to
  // non-zero values inside the iPhone notch / home-indicator areas when the
  // app runs as an installed standalone PWA.
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  // Theme color follows the active mode so the iOS status bar / Android chrome
  // matches the page background in both light and dark.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0D0E" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="antialiased bg-background text-foreground min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <InAppBrowserBanner />
          <NavBar />
          <CommandPalette />
          <main className="max-w-2xl lg:max-w-4xl mx-auto px-4 py-6 lg:py-8 main-content-pb">{children}</main>
          <MobileBottomNav />
          <InstallPrompt />
          <footer
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "24px",
              paddingBottom: "24px",
            }}
          >
            <div
              style={{
                maxWidth: "896px",
                margin: "0 auto",
                padding: "0 16px",
                textAlign: "center",
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                color: "var(--fg-muted)",
              }}
            >
              made by hecz ·{" "}
              <a
                href="https://hecz.dev"
                style={{ color: "var(--fg-muted)", textDecoration: "underline" }}
              >
                hecz.dev
              </a>
              {" "}·{" "}
              <a
                href="/credits"
                style={{ color: "var(--fg-muted)", textDecoration: "underline" }}
              >
                Credits &amp; sources
              </a>
            </div>
          </footer>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

```

## app/page.tsx

```tsx
﻿"use client";

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
import { changelogEntries } from "@/lib/changelog";
import { NewBanner } from "@/components/NewBanner";

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

function DashboardLabCard() {
  const latest = changelogEntries[0];

  return (
    <section
      className="dashboard-lab-card"
      style={{
        background: "linear-gradient(135deg, rgba(245,166,35,0.11), rgba(245,166,35,0.025) 48%, var(--surface) 100%)",
        border: "1px solid rgba(245,166,35,0.34)",
        borderRadius: "var(--r-md)",
        padding: "18px 20px",
        display: "grid",
        gap: "14px",
        minWidth: 0,
      }}
    >
      <style>{`
        @media (max-width: 640px) {
          .dashboard-lab-card {
            padding: 16px !important;
          }

          .dashboard-lab-actions {
            width: 100%;
          }

          .dashboard-lab-actions a {
            flex: 1 1 140px;
            justify-content: center;
          }
        }
      `}</style>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div style={{ minWidth: 0 }}>
          <p
            className="font-mono"
            style={{
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "6px",
            }}
          >
            New in Hecz Study
          </p>
          <h2
            style={{
              fontSize: "18px",
              color: "var(--fg)",
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: "6px",
            }}
          >
            {latest?.title ?? "Study Lab and class sharing"}
          </h2>
          <p style={{ fontSize: "13px", color: "var(--fg-muted)", lineHeight: 1.55, maxWidth: "680px" }}>
            {latest?.summary ?? "Explore the Study Lab, class pack, and sharing tools."}
          </p>
          {latest && (
            <p className="font-mono" style={{ fontSize: "11px", color: "var(--fg-subtle)", marginTop: "8px" }}>
              Latest: {latest.label} · {latest.date}
            </p>
          )}
        </div>
        <div className="dashboard-lab-actions" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <Link
            href={latest?.id === "az-104" ? "/settings" : "/lab"}
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
              whiteSpace: "nowrap",
            }}
          >
            {latest?.id === "az-104" ? "Choose AZ-104" : "Open lab"}
          </Link>
          <Link
            href="/changelog"
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
              whiteSpace: "nowrap",
            }}
          >
            What changed
          </Link>
        </div>
      </div>
    </section>
  );
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
          let returningPath = "/onboarding";
          try {
            const {
              data: { session },
            } = await createClient().auth.getSession();
            if (session?.user) returningPath = "/onboarding?returning=1";
          } catch {
            // Account sync is optional. New users can still finish local setup.
          }
          router.replace(returningPath);
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
    // Avoids a false signed-out render while a slow mobile network resolves.
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
      {authUser ? (
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
      ) : null}

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

      <NewBanner featureId="az104-bank-2026-09" href="/changelog#az-104">
        <strong>New: Azure Administrator (AZ-104).</strong> 160 practice questions,
        60 flashcards and 8 matching drills. Explore what’s included.
      </NewBanner>

      <DashboardLabCard />

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

```

## components/NewBanner.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * A cute, one-time dismissible announcement. Keyed by `featureId` in
 * localStorage so it shows once per device, then stays gone. Renders nothing
 * until mount (no SSR flash). Reuse for every new feature/trainer.
 */
export function NewBanner({
  featureId,
  href,
  children,
}: {
  featureId: string;
  href: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const key = `new-banner-dismissed:${featureId}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setShow(localStorage.getItem(key) !== "1");
      } catch {
        setShow(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [key]);

  if (!show) return null;

  function dismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.setItem(key, "1");
    } catch {
      // ignore
    }
    setShow(false);
  }

  return (
    <div
      style={{
        position: "relative",
        background: "rgba(245,166,35,0.08)",
        border: "1px solid rgba(245,166,35,0.4)",
        borderRadius: "var(--r-md)",
        padding: "12px 14px",
        marginBottom: 16,
      }}
    >
      <Link
        href={href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
          color: "var(--fg)",
          fontFamily: "var(--font-sans)",
          fontSize: 13.5,
          paddingRight: 44,
          minHeight: 44,
        }}
      >
        <span aria-hidden="true">🆕</span>
        <span style={{ flex: 1 }}>{children}</span>
        <span aria-hidden="true" style={{ color: "var(--accent)", fontWeight: 600, flexShrink: 0 }}>→</span>
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        style={{
          position: "absolute",
          top: 6,
          right: 8,
          width: 44,
          height: 44,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          color: "var(--fg-muted)",
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          borderRadius: "var(--r-sm)",
        }}
      >
        ×
      </button>
    </div>
  );
}

/** Small amber "NEW" pill for cards / nav items. */
export function NewPill() {
  return (
    <span
      className="font-mono"
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "var(--accent)",
        background: "rgba(245,166,35,0.15)",
        border: "1px solid rgba(245,166,35,0.4)",
        borderRadius: 3,
        padding: "1px 5px",
        verticalAlign: "middle",
        marginLeft: 6,
      }}
    >
      NEW
    </span>
  );
}

```

## content/az-104-bank.ts

```ts
// AZ-104 (Microsoft Azure Administrator) question bank.
//
// All content here is original: scenarios, stems, choices, and explanations
// were authored fresh for this repo. Do not paste exam dumps or paid banks.
//
// The bank is authored in per-domain part files under ./parts and combined
// here so content/seed.ts can wire it in as a single import.
// Reviewed against Microsoft Learn on 2026-09-25. Full issue log, evidence,
// coverage limitations and paste-ready replacements: docs/az104-review/REPORT.md.
// 160 MCQs, 60 flashcards, 8 matching drills, 40 acronym/term drills.
// Matching drills are learning exercises, not a reproduction of Azure exam labs.

import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";

import {
  AZ104_D1_ACRONYMS,
  AZ104_D1_FLASHCARDS,
  AZ104_D1_PERF_QUESTIONS,
  AZ104_D1_QUESTIONS,
} from "./parts/az104-d1";
import {
  AZ104_D2_ACRONYMS,
  AZ104_D2_FLASHCARDS,
  AZ104_D2_PERF_QUESTIONS,
  AZ104_D2_QUESTIONS,
} from "./parts/az104-d2";
import {
  AZ104_D3_ACRONYMS,
  AZ104_D3_FLASHCARDS,
  AZ104_D3_PERF_QUESTIONS,
  AZ104_D3_QUESTIONS,
} from "./parts/az104-d3";
import {
  AZ104_D4_ACRONYMS,
  AZ104_D4_FLASHCARDS,
  AZ104_D4_PERF_QUESTIONS,
  AZ104_D4_QUESTIONS,
} from "./parts/az104-d4";
import {
  AZ104_D5_ACRONYMS,
  AZ104_D5_FLASHCARDS,
  AZ104_D5_PERF_QUESTIONS,
  AZ104_D5_QUESTIONS,
} from "./parts/az104-d5";

export const AZ104_QUESTIONS: Question[] = [
  ...AZ104_D1_QUESTIONS,
  ...AZ104_D2_QUESTIONS,
  ...AZ104_D3_QUESTIONS,
  ...AZ104_D4_QUESTIONS,
  ...AZ104_D5_QUESTIONS,
];

export const AZ104_FLASHCARDS: Flashcard[] = [
  ...AZ104_D1_FLASHCARDS,
  ...AZ104_D2_FLASHCARDS,
  ...AZ104_D3_FLASHCARDS,
  ...AZ104_D4_FLASHCARDS,
  ...AZ104_D5_FLASHCARDS,
];

export const AZ104_PERF_QUESTIONS: PerfQuestion[] = [
  ...AZ104_D1_PERF_QUESTIONS,
  ...AZ104_D2_PERF_QUESTIONS,
  ...AZ104_D3_PERF_QUESTIONS,
  ...AZ104_D4_PERF_QUESTIONS,
  ...AZ104_D5_PERF_QUESTIONS,
];

export const AZ104_ACRONYMS: Acronym[] = [
  ...AZ104_D1_ACRONYMS,
  ...AZ104_D2_ACRONYMS,
  ...AZ104_D3_ACRONYMS,
  ...AZ104_D4_ACRONYMS,
  ...AZ104_D5_ACRONYMS,
];

```

## content/parts/az104-d1.ts

```ts
import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";

// Original practice content. Reviewed 2026-09-25; evidence and full issue log: docs/az104-review/REPORT.md.

export const AZ104_D1_QUESTIONS: Question[] = [
  {
    "id": "az104-1-1.1-001",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "stem": "Your company hires a consulting firm whose engineers need access to a Teams standard channel and a SharePoint site. You invite their work email addresses through Microsoft Entra B2B collaboration. Which statement about these guest users is correct?",
    "choices": [
      {
        "key": "A",
        "text": "Accepting the invitation automatically converts their account to a member user.",
        "correct": false
      },
      {
        "key": "B",
        "text": "They sign in with credentials managed by their own organization (or a one-time passcode); your company does not manage their passwords.",
        "correct": true
      },
      {
        "key": "C",
        "text": "They must be synchronized from your on-premises Active Directory before they can accept the invitation.",
        "correct": false
      },
      {
        "key": "D",
        "text": "They cannot be added to Microsoft Entra security groups.",
        "correct": false
      }
    ],
    "explanation": "B is correct for these invited external guests: their external identity provider or email passcode authenticates them; the resource tenant does not issue their password. C is wrong because invitation does not require directory synchronization. D is wrong because guests can join security groups. A is wrong because accepting a guest invitation does not automatically change UserType to Member. UserType alone does not identify the authentication provider.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.1-002",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "stem": "An administrator has a CSV with 200 new cloud-only employees. Which Microsoft Entra operation accepts the user-creation template and submits all rows as one bulk job?",
    "choices": [
      {
        "key": "A",
        "text": "Users > Bulk operations > Download users",
        "correct": false
      },
      {
        "key": "B",
        "text": "Users > Bulk operations > Bulk create",
        "correct": true
      },
      {
        "key": "C",
        "text": "Groups > Bulk operations > Import members",
        "correct": false
      },
      {
        "key": "D",
        "text": "Users > Bulk operations > Bulk invite",
        "correct": false
      }
    ],
    "explanation": "B creates cloud users from the downloaded CSV template, which includes name, UPN, initial password, and block-sign-in fields. Validate the file and inspect job results for row failures. C adds existing users to a group. D invites external collaborators. A exports existing users rather than creating them.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.1-003",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "stem": "A project needs a group mailbox and calendar, a SharePoint team site, and the ability to create a Microsoft Teams team backed by the same membership. Which group type should you choose?",
    "choices": [
      {
        "key": "A",
        "text": "Mail-enabled security group",
        "correct": false
      },
      {
        "key": "B",
        "text": "Dynamic device group",
        "correct": false
      },
      {
        "key": "C",
        "text": "Microsoft 365 group",
        "correct": true
      },
      {
        "key": "D",
        "text": "Security group",
        "correct": false
      }
    ],
    "explanation": "C provides the Microsoft 365 collaboration membership and group mailbox/calendar; a Team can be created using that group. D is for access control and has no collaboration mailbox. A is available in Exchange Online but provides mail distribution plus security membership, not the Microsoft 365 collaboration workspace. B contains devices rather than project users. Entra role assignments require a specifically role-assignable group.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.1-004",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "stem": "A licensed tenant has an enabled dynamic security group with rule (user.department -eq \"Sales\") -and (user.userType -eq \"Member\"). A new cloud user has department Sales and UserType Member. What happens after membership processing completes?",
    "choices": [
      {
        "key": "A",
        "text": "The employee must be added manually because rules only run once at group creation.",
        "correct": false
      },
      {
        "key": "B",
        "text": "The employee is added only if an administrator approves the pending membership.",
        "correct": false
      },
      {
        "key": "C",
        "text": "The rule fails because department is not a supported attribute for dynamic membership.",
        "correct": false
      },
      {
        "key": "D",
        "text": "The employee is added automatically when the rule is re-evaluated; no manual action is needed.",
        "correct": true
      }
    ],
    "explanation": "D is correct because both user attributes match the enabled rule. Membership processing is asynchronous, so it need not appear immediately. A is wrong because rules are reevaluated after relevant changes. B is wrong because this group has no per-member approval workflow. C is wrong because department is a supported string property.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.1-005",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "stem": "The licensed dynamic group All-Seattle-Staff uses user.city -eq \"Seattle\" and is Maria's only source of Microsoft 365 E5. Her city changes to Portland. After membership and license processing succeed, what happens?",
    "choices": [
      {
        "key": "A",
        "text": "Microsoft Entra ID removes the license because she no longer matches the group membership rule.",
        "correct": true
      },
      {
        "key": "B",
        "text": "She keeps the license permanently because group-assigned licenses are sticky.",
        "correct": false
      },
      {
        "key": "C",
        "text": "The license automatically converts to a direct user assignment.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Nothing changes until an administrator manually removes her from the group.",
        "correct": false
      }
    ],
    "explanation": "A is correct: Maria no longer matches this group, so its E5 assignment is removed. B is wrong because group-based assignments follow membership. C is wrong because leaving a group does not create a direct assignment. D is wrong because the dynamic rule processes the change automatically. An independent direct or other-group assignment could retain E5, but the scenario excludes those.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.2-006",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.2",
    "stem": "Every Conditional Access policy is built from two main building blocks. What are they?",
    "choices": [
      {
        "key": "A",
        "text": "Signals and named locations.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Users and applications.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Conditions and session controls only.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Assignments (who and what the policy targets) and access controls (grant/block and session controls).",
        "correct": true
      }
    ],
    "explanation": "D names the two policy sections: assignments select users, resources and applicable conditions; access controls specify grant requirements, blocking, and session behavior. A lists inputs within assignments. B lists only two assignment categories. C omits user/resource assignments and grant controls, so neither is the complete pair.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.2-007",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.2",
    "stem": "A tenant with Conditional Access licensing enables a policy for a pilot user group and All resources, selecting only Exchange ActiveSync clients and Other clients under legacy authentication client apps, with Block access. Which requests does this policy block?",
    "choices": [
      {
        "key": "A",
        "text": "It forces multifactor authentication on IMAP and POP3 clients.",
        "correct": false
      },
      {
        "key": "B",
        "text": "It applies only to users signing in from outside the corporate network.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Legacy-authentication requests matching those client-app categories; this policy does not block modern-authentication requests.",
        "correct": true
      },
      {
        "key": "D",
        "text": "It blocks all user sign-ins, including Outlook on the web.",
        "correct": false
      }
    ],
    "explanation": "C follows the selected legacy client-app condition. Protocols such as IMAP can also use OAuth, so this is not a blanket protocol ban. D is wrong because browser sign-ins do not match that condition. A is wrong because these legacy requests cannot satisfy an interactive MFA challenge. B is wrong because no network restriction is configured. Other policies may still affect modern clients.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.2-008",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.2",
    "stem": "You define a named location for your headquarters' public IP range and mark it as trusted. In a Conditional Access policy that requires MFA for all cloud apps, you exclude the trusted location in the network condition. What happens when users sign in?",
    "choices": [
      {
        "key": "A",
        "text": "This policy does not require MFA at headquarters; it still imposes an MFA requirement outside that excluded location.",
        "correct": true
      },
      {
        "key": "B",
        "text": "Sign-ins from headquarters are blocked.",
        "correct": false
      },
      {
        "key": "C",
        "text": "The named location is automatically applied to every existing Conditional Access policy.",
        "correct": false
      },
      {
        "key": "D",
        "text": "The exclusion only works if headquarters uses IPv6 addresses.",
        "correct": false
      }
    ],
    "explanation": "A describes this policy only: the excluded network does not match its assignments. Other policies or per-user MFA can still require MFA, and an existing claim can satisfy a requirement without another prompt. B is wrong because exclusion does not block. C is wrong because each policy must reference a location. D is wrong because named IP locations support both IPv4 and IPv6.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.2-009",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.2",
    "stem": "Which listed Microsoft Entra authentication method satisfies the built-in phishing-resistant MFA authentication strength?",
    "choices": [
      {
        "key": "A",
        "text": "Voice call verification",
        "correct": false
      },
      {
        "key": "B",
        "text": "A password plus a time-based one-time code from an authenticator app",
        "correct": false
      },
      {
        "key": "C",
        "text": "FIDO2 security key or passkey",
        "correct": true
      },
      {
        "key": "D",
        "text": "SMS text message codes",
        "correct": false
      }
    ],
    "explanation": "C uses origin-bound public-key credentials and is included in phishing-resistant MFA strength. D and A can be redirected or relayed and do not satisfy that strength. B provides two factors, but a one-time code can be relayed by a phishing site; MFA is not automatically phishing-resistant.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.2-010",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.2",
    "stem": "An administrator previously set a user's per-user MFA status to Enforced. You later create a Conditional Access policy that requires MFA for all cloud apps, and you add that user to the policy's exclusion list. When the user signs in to Outlook on the web, what happens? Assume the new sign-in has no valid MFA claim or remembered MFA session.",
    "choices": [
      {
        "key": "A",
        "text": "The user is blocked from signing in entirely.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Per-user MFA is automatically set back to Disabled when any Conditional Access policy exists.",
        "correct": false
      },
      {
        "key": "C",
        "text": "The user is still prompted for MFA because the per-user Enforced status applies outside Conditional Access.",
        "correct": true
      },
      {
        "key": "D",
        "text": "The Conditional Access exclusion overrides per-user MFA, so no MFA prompt appears.",
        "correct": false
      }
    ],
    "explanation": "C is correct under the stated fresh-session assumption: excluding a user from this Conditional Access policy does not remove independent per-user MFA enforcement. D incorrectly treats exclusion as a global bypass. A invents a block that was not configured. B is wrong because creating a Conditional Access policy does not change per-user MFA state automatically.",
    "difficulty": 4
  },
  {
    "id": "az104-1-1.3-011",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.3",
    "stem": "A contractor has only an eligible PIM Contributor assignment on a subscription, no active role assignments, and has not activated it. What permissions does that eligible assignment currently provide?",
    "choices": [
      {
        "key": "A",
        "text": "Nothing privileged — the contractor must activate the role before using its permissions.",
        "correct": true
      },
      {
        "key": "B",
        "text": "Use Contributor permissions immediately, since eligibility includes access.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Approve other users' activation requests for the same role.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Activate the role permanently without justification or approval.",
        "correct": false
      }
    ],
    "explanation": "A is correct: eligibility permits requesting activation but does not itself grant Contributor access. B confuses eligibility with active access; active assignments can be time-bound or permanent. C requires a separate approver designation. D is wrong because activation follows configured requirements and has an expiry; eligibility does not authorize permanent self-assignment.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.3-012",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.3",
    "stem": "Your PIM role settings for Virtual Machine Contributor require justification, MFA, and approval from the infrastructure team, with a maximum activation duration of 4 hours. A developer requests the full 4 hours; the request is approved and the role activates at 9:00 AM. Which statement is true?",
    "choices": [
      {
        "key": "A",
        "text": "Approval is only required for the first activation each week.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Providing a justification replaces the MFA requirement.",
        "correct": false
      },
      {
        "key": "C",
        "text": "At 1:00 PM the role is automatically deactivated and must be requested again for further work.",
        "correct": true
      },
      {
        "key": "D",
        "text": "The role stays active until the developer manually deactivates it.",
        "correct": false
      }
    ],
    "explanation": "C is correct because the approved four-hour activation runs from 9:00 AM to 1:00 PM. A shorter request would expire earlier. D ignores the expiry. A is wrong because each request is subject to the configured approval requirement. B is wrong because justification does not replace the MFA requirement; a valid existing MFA claim may satisfy it.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.3-013",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.3",
    "stem": "External guests receive a resource-group role only through one security group. You want quarterly membership reviews by project managers, with denied memberships and unanswered reviews removed automatically using configured fallback decisions. Which feature provides this?",
    "choices": [
      {
        "key": "A",
        "text": "Identity Protection risk policies",
        "correct": false
      },
      {
        "key": "B",
        "text": "Conditional Access session controls",
        "correct": false
      },
      {
        "key": "C",
        "text": "Access reviews",
        "correct": true
      },
      {
        "key": "D",
        "text": "PIM role activation",
        "correct": false
      }
    ],
    "explanation": "C supports recurring group membership reviews, automatic application of results, and a configured decision for unanswered reviews. Removing this group membership removes the stated access path. D grants temporary privileged access rather than reviewing this group. A responds to risk detections. B controls session behavior rather than recurring membership attestation.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.3-014",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.3",
    "stem": "Identity Protection flags two detections for an administrator: (1) a sign-in from an unfamiliar location is assessed as medium sign-in risk; (2) the administrator's credentials appear in a public breach, assessed as high user risk. Using risk-based Conditional Access, which response matches each detection?",
    "choices": [
      {
        "key": "A",
        "text": "Both detections are handled by the sign-in risk policy; user risk is report-only.",
        "correct": false
      },
      {
        "key": "B",
        "text": "User risk policies evaluate every individual sign-in attempt in real time.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Sign-in risk policies force a password change for every user in the tenant.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Use a sign-in risk condition to require appropriate authentication or block the attempt, and a user risk condition to require secure password remediation for a password-based user.",
        "correct": true
      }
    ],
    "explanation": "D distinguishes attempt risk from account-compromise risk. A is wrong because user-risk Conditional Access can enforce controls. B confuses user risk with sign-in risk. C is wrong because sign-in risk does not inherently reset every password; policy scope and grant controls determine the response. Use Conditional Access rather than designing new legacy ID Protection risk policies.",
    "difficulty": 4
  },
  {
    "id": "az104-1-1.3-015",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.3",
    "stem": "A cloud-only password user is covered by an enabled user-risk Conditional Access policy requiring secure password change. The user has not registered any MFA/SSPR methods. What must the rollout address before this user can reliably self-remediate high risk?",
    "choices": [
      {
        "key": "A",
        "text": "Ensure the user is registered for the required MFA and self-service password reset methods before risk enforcement.",
        "correct": true
      },
      {
        "key": "B",
        "text": "Set the same user-risk policy to Block access instead.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Replace user risk with a device-compliance condition only.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Exclude the user permanently from all risk-based policies.",
        "correct": false
      }
    ],
    "explanation": "A supplies the authentication and password-reset prerequisites for self-remediation. B blocks the user without enabling password recovery. C does not remediate the compromised password. D removes enforcement rather than making secure self-remediation work.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.4-016",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.4",
    "stem": "A developer must create and manage virtual machines and their disks, but must NOT be able to grant other people access to the subscription. Which built-in RBAC role fits these requirements?",
    "choices": [
      {
        "key": "A",
        "text": "Contributor",
        "correct": true
      },
      {
        "key": "B",
        "text": "Owner",
        "correct": false
      },
      {
        "key": "C",
        "text": "Reader",
        "correct": false
      },
      {
        "key": "D",
        "text": "User Access Administrator",
        "correct": false
      }
    ],
    "explanation": "A manages resources but cannot assign Azure RBAC roles. B also permits access management, exceeding the requirement. C cannot create or change the VMs. D manages access assignments rather than VM resources. Contributor excludes specific privileged operations; it does not exclude every Microsoft.Authorization operation.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.4-017",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.4",
    "stem": "Priya is assigned Reader at the subscription scope and Contributor on the 'web-apps' resource group. What can she do to a virtual machine inside the 'web-apps' resource group? Assume no deny assignment, lock, or policy blocks the requested operation.",
    "choices": [
      {
        "key": "A",
        "text": "Manage it fully (start, stop, resize, reconfigure) because role assignments are additive and the most permissive grant applies.",
        "correct": true
      },
      {
        "key": "B",
        "text": "Only view it, because the subscription-level Reader assignment overrides lower scopes.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Nothing — conflicting assignments at different scopes cancel each other out.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Only view it, because the Reader assignment was created first.",
        "correct": false
      }
    ],
    "explanation": "A is correct: the resource-group Contributor grant includes those VM management operations, and the inherited Reader grant does not subtract them. B incorrectly treats a higher-scope allow as a restriction. C incorrectly cancels grants. D incorrectly relies on assignment order. Effective allow permissions are additive; separate enforcement such as deny assignments can still block an operation.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.4-018",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.4",
    "stem": "A deployment-stack deny assignment blocks Microsoft.Storage/storageAccounts/delete on a storage account. Sam is Owner of the subscription. Sam is not an excluded principal and the deny assignment remains in place. Sam attempts to delete the storage account. What happens?",
    "choices": [
      {
        "key": "A",
        "text": "The delete succeeds after a mandatory 24-hour waiting period.",
        "correct": false
      },
      {
        "key": "B",
        "text": "The deny assignment only applies to Contributor and lower roles.",
        "correct": false
      },
      {
        "key": "C",
        "text": "The delete is blocked — deny assignments take precedence over any allow assignment, including Owner.",
        "correct": true
      },
      {
        "key": "D",
        "text": "The delete succeeds because the Owner role overrides deny assignments.",
        "correct": false
      }
    ],
    "explanation": "C is correct for this direct delete: the applicable deny blocks it despite Owner. D incorrectly treats Owner as a bypass. A invents a waiting period. B incorrectly limits denies to lower roles. Deny scope and excluded principals matter; changing the protecting stack is a different operation.",
    "difficulty": 4
  },
  {
    "id": "az104-1-1.4-019",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.4",
    "stem": "You need a custom RBAC role that lets help-desk staff restart virtual machines but NOT create, delete, or resize them. Which entry belongs in the role definition's Actions array?",
    "choices": [
      {
        "key": "A",
        "text": "Microsoft.Compute/virtualMachines/write",
        "correct": false
      },
      {
        "key": "B",
        "text": "Place the restart permission under DataActions instead of Actions.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Microsoft.Compute/virtualMachines/restart/action",
        "correct": true
      },
      {
        "key": "D",
        "text": "Microsoft.Compute/virtualMachines/*",
        "correct": false
      }
    ],
    "explanation": "C is correct: the restart operation is a control-plane action with its own operation string, and granting exactly that string gives least privilege. D is wrong because the wildcard grants every VM operation — create, delete, resize, and more. A is wrong because the write operation permits creating and updating VMs. B is wrong because DataActions cover data-plane operations (like reading blob data); restart is a control-plane action and belongs in Actions.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.4-020",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.4",
    "stem": "Which listed built-in role directly grants Azure RBAC access-management permissions without directly granting general creation or deletion of VMs and storage accounts? Consider the role itself, not new roles its holder could assign.",
    "choices": [
      {
        "key": "A",
        "text": "User Access Administrator",
        "correct": true
      },
      {
        "key": "B",
        "text": "Owner",
        "correct": false
      },
      {
        "key": "C",
        "text": "Contributor",
        "correct": false
      },
      {
        "key": "D",
        "text": "Security Reader",
        "correct": false
      }
    ],
    "explanation": "A grants access-management permissions and resource read access, not general workload management. B includes general resource management. C manages workloads but cannot assign roles. D is a security read role. An unrestricted access administrator can assign a more powerful role, so this alone is not an anti-escalation boundary.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.5-021",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "stem": "You must prevent anyone from creating virtual machines with a SKU outside an approved list. Which Azure Policy effect enforces this at creation time?",
    "choices": [
      {
        "key": "A",
        "text": "DeployIfNotExists",
        "correct": false
      },
      {
        "key": "B",
        "text": "Deny",
        "correct": true
      },
      {
        "key": "C",
        "text": "Audit",
        "correct": false
      },
      {
        "key": "D",
        "text": "Append",
        "correct": false
      }
    ],
    "explanation": "B is the direct effect for rejecting a VM request whose SKU is outside the allowed list. C records noncompliance without blocking. D adds properties and can reject conflicting values, but is not the intended allowed-SKU validation effect. A checks/deploys related configuration after resource provisioning; existing resources need a remediation task and suitable permissions.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.5-022",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "stem": "You apply a ReadOnly resource lock to a resource group containing a running virtual machine. An operator tries to restart the VM from the portal. What happens?",
    "choices": [
      {
        "key": "A",
        "text": "The portal restart fails because the inherited ReadOnly lock blocks the management-plane restart operation.",
        "correct": true
      },
      {
        "key": "B",
        "text": "The restart succeeds because power operations are not configuration changes.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Azure shuts down the VM as soon as the ReadOnly lock is applied.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Only CanNotDelete locks block restarts; ReadOnly does not.",
        "correct": false
      }
    ],
    "explanation": "A is correct: restarting through Azure Resource Manager is a POST action blocked by ReadOnly. B wrongly exempts power actions. C is wrong because applying the lock does not stop a running VM. D reverses the lock behavior: CanNotDelete permits restart. A control-plane lock does not prevent a guest administrator from changing files or rebooting inside the OS.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.5-023",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "stem": "You add a 'CostCenter' tag to a resource group. New storage accounts deployed into the group afterward do not carry the tag. Why?",
    "choices": [
      {
        "key": "A",
        "text": "Tags do not automatically inherit; use a suitable Modify policy to copy the resource-group tag.",
        "correct": true
      },
      {
        "key": "B",
        "text": "Tags can only be applied at the subscription scope.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Resource group tags are limited to five tags per group.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Tags propagate to child resources only after 24 hours.",
        "correct": false
      }
    ],
    "explanation": "A is correct: tags on a resource group describe that group. A Modify policy can copy them to supported resources; existing resources require remediation. B is wrong because supported resources, resource groups, and subscriptions can be tagged. C invents a five-tag limit. D invents automatic propagation; waiting does not create inheritance. Management groups do not support tags.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.5-024",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "stem": "Your tenant contains 20 subscriptions. Enforce an allowed-locations policy on only the dev, test, and prod subscriptions with one assignment, without per-subscription exclusions. Which approach fits?",
    "choices": [
      {
        "key": "A",
        "text": "Assign the policy to the tenant root management group containing all 20 subscriptions.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Management groups can only contain resource groups, not subscriptions.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Place the three subscriptions under one management group and assign the policy at the management group scope; it inherits downward.",
        "correct": true
      },
      {
        "key": "D",
        "text": "Assign the policy separately at each subscription, because policy cannot cross subscription boundaries.",
        "correct": false
      }
    ],
    "explanation": "C scopes one inherited policy assignment to the three subscriptions in a dedicated management group. D would require three assignments. A affects all 20 subscriptions and violates the requested scope. B is wrong because management groups contain subscriptions and other management groups, not resource groups directly.",
    "difficulty": 4
  },
  {
    "id": "az104-1-1.1-101",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "stem": "A licensed tenant wants to pilot self-service password reset for members of one security group. Other ordinary users must not receive SSPR yet. Which configuration fits?",
    "choices": [
      {
        "key": "A",
        "text": "Require MFA through Conditional Access without enabling SSPR.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Enable SSPR for All users.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Set SSPR to Selected and choose the pilot group.",
        "correct": true
      },
      {
        "key": "D",
        "text": "Configure authentication methods but leave SSPR disabled.",
        "correct": false
      }
    ],
    "explanation": "C enables SSPR for the intended pilot group. B expands the rollout to everyone. D configures available methods but does not enable the reset feature. A requires stronger sign-in authentication without enabling password self-service. Ensure pilot users register the required reset methods.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.1-102",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "stem": "A synchronized user must reset a forgotten password through SSPR and have the new password applied to on-premises AD DS. Licensing and reset-method registration are ready. Which additional capability is needed?",
    "choices": [
      {
        "key": "A",
        "text": "Supported password writeback enabled and configured for the hybrid identity deployment",
        "correct": true
      },
      {
        "key": "B",
        "text": "Pass-through authentication alone",
        "correct": false
      },
      {
        "key": "C",
        "text": "Password hash synchronization alone",
        "correct": false
      },
      {
        "key": "D",
        "text": "A cloud-only password policy with no writeback",
        "correct": false
      }
    ],
    "explanation": "A carries a supported SSPR reset to AD DS and respects the applicable on-premises policy. C synchronizes password hashes toward the cloud. D does not write changes to AD DS. B validates sign-ins against AD DS but does not by itself implement password-reset writeback.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.1-103",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "stem": "SSPR is enabled for a pilot group and requires two verification methods. A pilot user has registered only one usable method. What should the administrator address before relying on self-service recovery?",
    "choices": [
      {
        "key": "A",
        "text": "Complete registration of enough permitted recovery methods.",
        "correct": true
      },
      {
        "key": "B",
        "text": "Add the user to a second pilot group.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Require MFA at sign-in without collecting another recovery method.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Change only the Conditional Access sign-in frequency.",
        "correct": false
      }
    ],
    "explanation": "A satisfies the required number of verification methods. B does not add a verification method. C can require authentication but does not supply missing registration. D changes session reauthentication timing rather than registering the missing recovery method.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.1-104",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "stem": "A new cloud user cannot receive a location-restricted Microsoft 365 service license because their usage location is missing. Which user property should you populate with the actual country/region of use?",
    "choices": [
      {
        "key": "A",
        "text": "Office location",
        "correct": false
      },
      {
        "key": "B",
        "text": "Department",
        "correct": false
      },
      {
        "key": "C",
        "text": "Display name",
        "correct": false
      },
      {
        "key": "D",
        "text": "Usage location",
        "correct": true
      }
    ],
    "explanation": "D is the licensing location property. A is descriptive workplace information. B identifies an organizational department. C is a friendly name. Those descriptive fields do not replace Usage location for service availability and license assignment.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.1-105",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "stem": "An employee receives the same E5 product both directly and through a group. The employee leaves that group, and processing completes without errors. What happens to the product license?",
    "choices": [
      {
        "key": "A",
        "text": "The group assignment is removed, but the direct assignment can keep the product licensed.",
        "correct": true
      },
      {
        "key": "B",
        "text": "The direct assignment is automatically removed alongside the group assignment.",
        "correct": false
      },
      {
        "key": "C",
        "text": "The group assignment remains permanently even though membership ended.",
        "correct": false
      },
      {
        "key": "D",
        "text": "It is always removed because group membership ended.",
        "correct": false
      }
    ],
    "explanation": "A accounts for two independent assignment paths. D and B incorrectly remove the direct assignment. C incorrectly preserves the departed group's assignment after successful processing. To remove the product entirely, remove all valid assignment sources.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.4-101",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.4",
    "stem": "A support engineer needs to restart VMs in one resource group and view their configuration, but should not manage VMs elsewhere. Which assignment scope is the narrowest listed scope that covers every VM in the group?",
    "choices": [
      {
        "key": "A",
        "text": "Subscription",
        "correct": false
      },
      {
        "key": "B",
        "text": "That resource group",
        "correct": true
      },
      {
        "key": "C",
        "text": "One individual VM in that group",
        "correct": false
      },
      {
        "key": "D",
        "text": "Tenant root management group",
        "correct": false
      }
    ],
    "explanation": "B contains every required VM and confines inherited access to that resource group. D and A grant at broader scopes than necessary. C covers only one VM and cannot supply access to every other VM in the group. The assigned role must include the needed management operations.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.4-102",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.4",
    "stem": "A user is Global Administrator in Microsoft Entra ID but has no Azure RBAC assignment and has not elevated access to Azure resources. Can that directory role alone manage VMs in a subscription?",
    "choices": [
      {
        "key": "A",
        "text": "Yes, it automatically gives Owner in every subscription.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Yes, but only for Windows VMs.",
        "correct": false
      },
      {
        "key": "C",
        "text": "No; Azure resource management requires appropriate Azure RBAC access.",
        "correct": true
      },
      {
        "key": "D",
        "text": "No; Global Administrators can never obtain Azure resource access.",
        "correct": false
      }
    ],
    "explanation": "C separates directory roles from Azure resource roles. A invents automatic Owner access. B invents an OS-specific exception. D is too broad: an authorized Global Administrator can use the documented elevate-access workflow and then arrange suitable access.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.5-101",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "stem": "A Modify policy assignment reports existing storage accounts missing a required tag. The assignment has an authorized managed identity. What applies the policy changes to those existing resources?",
    "choices": [
      {
        "key": "A",
        "text": "Switch the effect to Audit.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Assign Reader to the resources.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Wait for a compliance scan to rewrite them automatically.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Run a remediation task for the assignment.",
        "correct": true
      }
    ],
    "explanation": "D requests changes to existing noncompliant resources using the assignment identity. C confuses compliance evaluation with remediation. A only observes noncompliance. B grants read access and does not apply tag changes.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.5-102",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "stem": "A governance team wants allowed regions, required tags and approved VM sizes assigned and tracked together. Which Azure Policy object groups multiple policy definitions into one assignable unit?",
    "choices": [
      {
        "key": "A",
        "text": "Role assignment",
        "correct": false
      },
      {
        "key": "B",
        "text": "Action group",
        "correct": false
      },
      {
        "key": "C",
        "text": "Initiative definition",
        "correct": true
      },
      {
        "key": "D",
        "text": "Resource lock",
        "correct": false
      }
    ],
    "explanation": "C groups policy definitions and can be assigned as one initiative. D prevents certain management operations. A grants permissions. B defines alert notification and automation actions. None of those three groups policy definitions.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.5-103",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "stem": "A subscription budget sends an email when actual cost exceeds 80% of its threshold. No automation action has been configured. What happens when that threshold is reached?",
    "choices": [
      {
        "key": "A",
        "text": "The subscription is suspended.",
        "correct": false
      },
      {
        "key": "B",
        "text": "The configured alert is sent; resources continue running.",
        "correct": true
      },
      {
        "key": "C",
        "text": "All resource creation is denied by Azure Policy.",
        "correct": false
      },
      {
        "key": "D",
        "text": "All VMs are deallocated.",
        "correct": false
      }
    ],
    "explanation": "B describes a budget notification. D and A would require separate controls or automation; a budget does not inherently stop consumption. C requires a policy assignment that the scenario does not include. Cost data and notifications are not instantaneous spending caps.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.5-104",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "stem": "An administrator needs recommendations about underutilized VMs that might be resized or shut down to reduce spend. Which Azure service provides these workload-aware cost recommendations?",
    "choices": [
      {
        "key": "A",
        "text": "Azure Monitor metric alerts",
        "correct": false
      },
      {
        "key": "B",
        "text": "Azure Advisor",
        "correct": true
      },
      {
        "key": "C",
        "text": "Azure Cost Management budgets",
        "correct": false
      },
      {
        "key": "D",
        "text": "Azure Policy compliance results",
        "correct": false
      }
    ],
    "explanation": "B supplies workload-aware recommendations based on usage and configuration. C tracks spending against thresholds but does not itself recommend VM right-sizing. D reports compliance with assigned rules. A evaluates configured metric conditions; it does not supply Advisor cost recommendations. Evaluate any recommendation against workload requirements.",
    "difficulty": 2
  },
  {
    "id": "az104-1-1.5-105",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "stem": "A supported resource is moved from one resource group to another in the same subscription. Does that management move also relocate it to the target resource group metadata location?",
    "choices": [
      {
        "key": "A",
        "text": "No; the resource keeps its region unless a separate supported regional move is performed.",
        "correct": true
      },
      {
        "key": "B",
        "text": "Yes, whenever the source and target resource groups have different metadata locations.",
        "correct": false
      },
      {
        "key": "C",
        "text": "The move always fails if the resource region differs from the target resource group location.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Yes, every resource-group move physically relocates its resources.",
        "correct": false
      }
    ],
    "explanation": "A separates management scope from geographic deployment. D and B incorrectly make a resource-group move a regional migration. C is wrong because a resource group can contain resources in different regions. A supported move can change the resource ID and inherited permissions without changing its physical region.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.5-106",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "stem": "A resource is moving between resource groups. Its direct resource-scoped Azure RBAC assignment is needed after the move. What must the administrator plan?",
    "choices": [
      {
        "key": "A",
        "text": "Recreate the needed resource-scoped assignment at the new resource ID and check inherited target-scope access.",
        "correct": true
      },
      {
        "key": "B",
        "text": "Rely on the old resource group's inherited roles continuing to apply.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Assume the direct assignment follows the resource automatically.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Copy only resource-group tags to restore permissions.",
        "correct": false
      }
    ],
    "explanation": "A addresses the changed resource ID and target inheritance. C incorrectly assumes direct assignments move automatically. D changes metadata rather than permissions. B incorrectly preserves inheritance from a group that no longer contains the resource.",
    "difficulty": 3
  },
  {
    "id": "az104-1-1.5-107",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "stem": "A subscription will be transferred to another Microsoft Entra directory. Which access-management impact needs explicit planning?",
    "choices": [
      {
        "key": "A",
        "text": "Existing managed identities always work unchanged after transfer.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Azure RBAC assignments transfer unchanged to the new directory.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Existing role assignments/custom roles are affected and access must be recreated for identities in the target directory.",
        "correct": true
      },
      {
        "key": "D",
        "text": "Only resource-group tags need to be copied for access to continue.",
        "correct": false
      }
    ],
    "explanation": "C requires an inventory and a target-directory access plan. B incorrectly preserves tenant-bound authorization. D does not address identities or role assignments. A overlooks managed-identity and identity-dependent-service changes that directory transfer requires.",
    "difficulty": 4
  },
  {
    "id": "az104-1-1.5-108",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "stem": "A ReadOnly lock on a storage account blocks an administrator from listing its access keys through Resource Manager. Why can a read-looking task fail?",
    "choices": [
      {
        "key": "A",
        "text": "ReadOnly blocks every blob download through the data plane.",
        "correct": false
      },
      {
        "key": "B",
        "text": "ReadOnly removes the caller's role assignment.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Listing keys requires a CanNotDelete lock instead.",
        "correct": false
      },
      {
        "key": "D",
        "text": "The listKeys operation is a POST management operation blocked by ReadOnly.",
        "correct": true
      }
    ],
    "explanation": "D distinguishes management operations from friendly task names. A wrongly extends management locks to all data-plane reads. B confuses a lock with RBAC assignment deletion. C invents a lock prerequisite; CanNotDelete is not required to list keys.",
    "difficulty": 3
  }
];

export const AZ104_D1_FLASHCARDS: Flashcard[] = [
  {
    "id": "az104-fc-1-001",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "front": "What is the difference between a member user and a guest user in Microsoft Entra ID?",
    "back": "Member and Guest describe the user relationship and default directory permissions. Authentication is separate: invited external guests usually use an external identity provider or email passcode, but external members and internal guests also exist."
  },
  {
    "id": "az104-fc-1-002",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "front": "Which CSV columns are required to bulk-create users in Microsoft Entra ID?",
    "back": "Name, User name (UPN), Initial password, and Block sign in (Yes/No). Optional columns include first name, last name, job title, and department."
  },
  {
    "id": "az104-fc-1-003",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "front": "Security group vs Microsoft 365 group — when do you use each?",
    "back": "Security groups grant resource access; Entra role assignments require a role-assignable group. Microsoft 365 groups provide a group mailbox, calendar and SharePoint site and can back a Team. Creating a group alone does not automatically provision a Team."
  },
  {
    "id": "az104-fc-1-004",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.1",
    "front": "What is a dynamic membership rule, and what happens when a user's attributes change?",
    "back": "An expression such as user.department -eq \"Sales\" determines membership from supported attributes. Enabled rules reevaluate changes asynchronously; direct manual membership editing is not supported."
  },
  {
    "id": "az104-fc-1-005",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.2",
    "front": "What are the two building blocks of every Conditional Access policy?",
    "back": "Assignments select the users, resources and conditions. Access controls specify grant/block requirements and session controls. All applicable enabled policies must be satisfied."
  },
  {
    "id": "az104-fc-1-006",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.2",
    "front": "What is legacy authentication, and why block it with Conditional Access?",
    "back": "Basic/legacy authentication requests cannot complete modern MFA. Conditional Access can block the legacy client-app categories. IMAP, POP and SMTP can also use OAuth, so blocking legacy authentication does not mean banning every implementation of those protocols."
  },
  {
    "id": "az104-fc-1-007",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.3",
    "front": "What is the difference between an eligible and an active PIM assignment?",
    "back": "Eligible assignments require activation before their role permissions can be used. Active assignments can be used without further activation and may be permanent or time-bound. Activation requirements depend on role settings."
  },
  {
    "id": "az104-fc-1-008",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.3",
    "front": "Sign-in risk vs user risk in Microsoft Entra Identity Protection?",
    "back": "Sign-in risk estimates whether an authentication attempt is illegitimate; user risk estimates whether the account is compromised. Use these conditions in Conditional Access for appropriate authentication, blocking, or password remediation. Legacy ID Protection risk policies retire October 1, 2026."
  },
  {
    "id": "az104-fc-1-009",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.4",
    "front": "What three elements make up an RBAC role assignment?",
    "back": "Security principal (user, group, service principal, or managed identity) + role definition (the permissions) + scope (management group, subscription, resource group, or resource)."
  },
  {
    "id": "az104-fc-1-010",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "front": "What do the Azure Policy effects Audit, Deny, and DeployIfNotExists do?",
    "back": "Audit records noncompliance. Deny rejects noncompliant creation/update requests. DeployIfNotExists can deploy missing related configuration using the policy assignment identity and permissions; existing noncompliant resources need a remediation task."
  },
  {
    "id": "az104-fc-1-011",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "front": "ReadOnly vs CanNotDelete resource locks?",
    "back": "CanNotDelete blocks management-plane deletion but permits changes. ReadOnly also blocks management-plane writes and actions such as portal restart. Both inherit to child resources; neither blocks data-plane operations such as writes inside a VM."
  },
  {
    "id": "az104-fc-1-012",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "front": "How do management groups help organize governance?",
    "back": "Management groups organize subscriptions and other management groups. Azure Policy and RBAC assignments inherit to descendants. Resource locks are applied at subscription, resource-group, or resource scope, not management-group scope."
  }
];

export const AZ104_D1_PERF_QUESTIONS: PerfQuestion[] = [
  {
    "id": "az104-pbq-1-001",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.3",
    "type": "drag-match",
    "prompt": "Match each Microsoft Entra identity feature to the capability it provides.",
    "leftLabel": "Feature",
    "rightLabel": "Capability",
    "pairs": [
      {
        "left": "Conditional Access",
        "right": "Enforces access requirements such as MFA or compliant devices based on sign-in signals"
      },
      {
        "left": "Privileged Identity Management (PIM)",
        "right": "Provides just-in-time, time-limited activation of privileged roles"
      },
      {
        "left": "Access reviews",
        "right": "Runs recurring campaigns where reviewers attest that users still need their access"
      },
      {
        "left": "Identity Protection",
        "right": "Detects account and sign-in risk that risk-based Conditional Access policies can act on"
      },
      {
        "left": "Self-service password reset (SSPR)",
        "right": "Lets users reset their own passwords without calling the help desk"
      },
      {
        "left": "Named locations",
        "right": "Defines network locations, including IP ranges or countries, for Conditional Access"
      }
    ],
    "explanation": "Conditional Access enforces access requirements; PIM supports temporary role activation; access reviews attest continued access; Identity Protection supplies risk detections; SSPR enables password self-service; named locations describe networks or countries for policy conditions.",
    "difficulty": 3
  },
  {
    "id": "az104-pbq-1-002",
    "certId": "az-104",
    "domainId": "az-104:domain:1",
    "objectiveId": "az-104:obj:1.5",
    "type": "drag-match",
    "prompt": "Match each Azure Policy effect to the behavior it produces when a resource is evaluated.",
    "leftLabel": "Policy effect",
    "rightLabel": "Behavior",
    "pairs": [
      {
        "left": "Audit",
        "right": "Records non-compliant resources in the compliance dashboard without blocking them"
      },
      {
        "left": "Deny",
        "right": "Blocks the creation or update of non-compliant resources"
      },
      {
        "left": "Append",
        "right": "Adds fields, such as tags, to a resource when it is created or updated"
      },
      {
        "left": "DeployIfNotExists",
        "right": "Deploys a related resource, like an extension, when the target does not have it"
      },
      {
        "left": "Disabled",
        "right": "The policy definition is not evaluated at all"
      }
    ],
    "explanation": "Audit records noncompliance; Deny blocks matching requests; Append adds properties and can deny conflicting values (Modify is preferred for tags); DeployIfNotExists deploys related configuration with suitable identity permissions and needs a remediation task for existing resources; Disabled skips evaluation.",
    "difficulty": 3
  }
];

export const AZ104_D1_ACRONYMS: Acronym[] = [
  {
    "id": "az104-ac-001",
    "certId": "az-104",
    "acronym": "Entra ID",
    "expansion": "Microsoft Entra ID",
    "hint": "Cloud identity service, formerly Azure Active Directory — manages users, groups, and sign-in",
    "domainHint": 1
  },
  {
    "id": "az104-ac-002",
    "certId": "az-104",
    "acronym": "MFA",
    "expansion": "Multifactor authentication",
    "hint": "Prove identity with two or more factors: something you know plus something you have or are",
    "domainHint": 1
  },
  {
    "id": "az104-ac-003",
    "certId": "az-104",
    "acronym": "PIM",
    "expansion": "Privileged Identity Management",
    "hint": "Just-in-time, time-limited activation of privileged roles with approval and audit",
    "domainHint": 1
  },
  {
    "id": "az104-ac-004",
    "certId": "az-104",
    "acronym": "RBAC",
    "expansion": "Role-based access control",
    "hint": "Who can do what, where: security principal plus role definition plus scope",
    "domainHint": 1
  },
  {
    "id": "az104-ac-005",
    "certId": "az-104",
    "acronym": "SSPR",
    "expansion": "Self-service password reset",
    "hint": "Lets users reset their own passwords without help-desk involvement",
    "domainHint": 1
  },
  {
    "id": "az104-ac-006",
    "certId": "az-104",
    "acronym": "CA",
    "expansion": "Conditional Access",
    "hint": "If-then access policies: if these signals, then require MFA, require compliance, or block",
    "domainHint": 1
  },
  {
    "id": "az104-ac-007",
    "certId": "az-104",
    "acronym": "B2B",
    "expansion": "Business-to-business",
    "hint": "Guest collaboration: invite users from partner organizations into your tenant",
    "domainHint": 1
  },
  {
    "id": "az104-ac-008",
    "certId": "az-104",
    "acronym": "B2C",
    "expansion": "Business-to-consumer",
    "hint": "Customer identity scenario; Microsoft Entra External ID is the current customer identity offering, while Azure AD B2C is a separate legacy product.",
    "domainHint": 1
  }
];

```

## content/parts/az104-d2.ts

```ts
import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";

// Original practice content. Reviewed 2026-09-25; evidence and full issue log: docs/az104-review/REPORT.md.

export const AZ104_D2_QUESTIONS: Question[] = [
  {
    "id": "az104-2-2.1-001",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "stem": "A team needs one standard-performance storage account for blobs, Azure file shares, queues and tables. Which account type supports all four services?",
    "choices": [
      {
        "key": "A",
        "text": "StorageV2 (general purpose v2)",
        "correct": true
      },
      {
        "key": "B",
        "text": "Premium block blobs",
        "correct": false
      },
      {
        "key": "C",
        "text": "Premium file shares",
        "correct": false
      },
      {
        "key": "D",
        "text": "Premium page blobs",
        "correct": false
      }
    ],
    "explanation": "A supports all four services in one general-purpose v2 account. B is specialized for premium block/append blobs. C hosts Azure Files (SMB or NFS, subject to share configuration), not queues and tables. D is specialized for premium page blobs. Choose by supported services and workload economics, not an assumption that one type always costs least.",
    "difficulty": 1
  },
  {
    "id": "az104-2-2.1-002",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "stem": "A benchmark shows that a data-lake workload needs premium-performance block blob storage with hierarchical namespace. Which listed account type supports that combination?",
    "choices": [
      {
        "key": "A",
        "text": "Standard StorageV2 with Hot access tier",
        "correct": false
      },
      {
        "key": "B",
        "text": "Premium block blobs account with hierarchical namespace enabled",
        "correct": true
      },
      {
        "key": "C",
        "text": "Premium file shares account",
        "correct": false
      },
      {
        "key": "D",
        "text": "Premium page blobs account",
        "correct": false
      }
    ],
    "explanation": "B supports premium block/append blobs and hierarchical namespace. A supports hierarchical namespace but uses standard performance. C is an Azure Files account. D hosts page blobs and does not provide the requested hierarchical block-blob namespace.",
    "difficulty": 2
  },
  {
    "id": "az104-2-2.1-003",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "stem": "A standard GPv2 blob account needs an asynchronously replicated copy in a second region. Zonal availability and pre-failover read access to the secondary are not required. Which option provides this at lower cost than its read-access variant?",
    "choices": [
      {
        "key": "A",
        "text": "ZRS",
        "correct": false
      },
      {
        "key": "B",
        "text": "GRS",
        "correct": true
      },
      {
        "key": "C",
        "text": "RA-GRS",
        "correct": false
      },
      {
        "key": "D",
        "text": "LRS",
        "correct": false
      }
    ],
    "explanation": "B adds asynchronous secondary-region replication. Recent writes may be absent from that replica after a disaster. D stays within one primary-region location. A spreads data across primary-region zones only. C also enables secondary reads, an extra capability this scenario does not require.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.1-004",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "stem": "An application can retry reads against the secondary blob endpoint and tolerate replication lag during a primary-region outage. Which option allows those reads before any account failover?",
    "choices": [
      {
        "key": "A",
        "text": "LRS with blob versioning",
        "correct": false
      },
      {
        "key": "B",
        "text": "ZRS",
        "correct": false
      },
      {
        "key": "C",
        "text": "GRS",
        "correct": false
      },
      {
        "key": "D",
        "text": "RA-GRS",
        "correct": true
      }
    ],
    "explanation": "D permits reads from the secondary endpoint before failover. C has a secondary copy but does not expose it for reads before failover. A protects only local copies; versioning does not add another region. B protects against zonal failure in the primary region. Geo-replication is asynchronous, so secondary reads can be stale.",
    "difficulty": 2
  },
  {
    "id": "az104-2-2.1-005",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "stem": "A premium page blob storage account uses LRS. A new requirement calls for a supported built-in geo-redundancy setting on that same account type. Which conclusion is correct?",
    "choices": [
      {
        "key": "A",
        "text": "Enable ZRS, which automatically adds a second region.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Premium page blob accounts do not offer built-in geo-redundancy; redesign data protection for a supported workload/account type.",
        "correct": true
      },
      {
        "key": "C",
        "text": "Change the account to GZRS without changing its type.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Change the account to RA-GRS without changing its type.",
        "correct": false
      }
    ],
    "explanation": "B is correct: premium page blob accounts support LRS, so a supported protection or migration design is required. C and D select unavailable settings for that account type. A is wrong twice: this account type does not support ZRS, and ZRS alone is single-region.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.1-006",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "stem": "A standard GPv2 blob workload requires zone redundancy in its primary region, an asynchronous copy in a second region, and read access to that secondary before failover. Which option fits?",
    "choices": [
      {
        "key": "A",
        "text": "ZRS",
        "correct": false
      },
      {
        "key": "B",
        "text": "LRS",
        "correct": false
      },
      {
        "key": "C",
        "text": "RA-GRS",
        "correct": false
      },
      {
        "key": "D",
        "text": "RA-GZRS",
        "correct": true
      }
    ],
    "explanation": "D combines primary-region ZRS with secondary-region LRS and permits secondary reads. C lacks primary-region ZRS. A has no second-region copy. B is local redundancy only. RA-GZRS does not make the secondary zone-redundant, and replication lag can cause stale reads or data loss.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.2-001",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.2",
    "stem": "Compliance block blobs will remain unchanged for at least 180 days and are read very rarely. Auditors require immediate online reads without rehydration. Among these fixed access tiers, which has the lowest storage-capacity price?",
    "choices": [
      {
        "key": "A",
        "text": "Cold",
        "correct": true
      },
      {
        "key": "B",
        "text": "Archive",
        "correct": false
      },
      {
        "key": "C",
        "text": "Hot",
        "correct": false
      },
      {
        "key": "D",
        "text": "Cool",
        "correct": false
      }
    ],
    "explanation": "A is the lowest-capacity-cost online tier listed; it has a 90-day minimum retention charge and higher access charges. C and D remain online but have higher capacity prices. B has lower capacity pricing but is offline and requires rehydration, violating immediate access. Total cost also depends on reads and transactions.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.2-002",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.2",
    "stem": "A blob in the Archive tier is needed for a quarterly report. Which statement about rehydrating it is correct?",
    "choices": [
      {
        "key": "A",
        "text": "Rehydration is instant because the blob metadata is cached",
        "correct": false
      },
      {
        "key": "B",
        "text": "Request Set Blob Tier to an online tier, or copy to a new online blob, then wait for rehydration to complete.",
        "correct": true
      },
      {
        "key": "C",
        "text": "You change the blob's access tier property to Hot and read it immediately",
        "correct": false
      },
      {
        "key": "D",
        "text": "Archived blobs cannot be rehydrated; you must restore from backup",
        "correct": false
      }
    ],
    "explanation": "B describes both supported paths: rehydrate in place with Set Blob Tier or copy to a new online blob. Standard-priority rehydration can take hours; higher priority is not an unconditional instant-read guarantee. A confuses available metadata with offline content. C wrongly promises immediate reads. D denies a supported recovery operation.",
    "difficulty": 2
  },
  {
    "id": "az104-2-2.2-003",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.2",
    "stem": "A lifecycle rule for current block blobs uses daysAfterModificationGreaterThan: 30 for tierToCool. Which timestamp determines that condition?",
    "choices": [
      {
        "key": "A",
        "text": "The blob's last modified time",
        "correct": true
      },
      {
        "key": "B",
        "text": "The time the lifecycle policy was created",
        "correct": false
      },
      {
        "key": "C",
        "text": "The last time the blob was read",
        "correct": false
      },
      {
        "key": "D",
        "text": "The blob's creation time",
        "correct": false
      }
    ],
    "explanation": "A is correct because this named condition compares the current time with the blob last-modified timestamp. D would require a creation-time condition. B is unrelated to blob age. C would require last-access tracking and the corresponding condition. Different lifecycle conditions deliberately use different clocks.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.2-004",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.2",
    "stem": "An LRS GPv2 account has block blobs in invoices and receipts. A lifecycle rule must match only names beginning 2024/ in invoices. Which case-sensitive prefixMatch value should it contain?",
    "choices": [
      {
        "key": "A",
        "text": "2024/",
        "correct": false
      },
      {
        "key": "B",
        "text": "invoices/2024/",
        "correct": true
      },
      {
        "key": "C",
        "text": "invoices/*/2024/",
        "correct": false
      },
      {
        "key": "D",
        "text": "https://acct.blob.core.windows.net/invoices/2024/",
        "correct": false
      }
    ],
    "explanation": "B begins with the container name followed by the required blob-name prefix. A omits the container. C treats an asterisk as a wildcard, but prefixMatch uses literal prefixes. D supplies a URL instead of the container/blob prefix. The rule must also specify the supported blob type and desired age/action.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.2-005",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.2",
    "stem": "Blob versioning is supported on a GPv2 account with hierarchical namespace disabled. You need automatic preservation of earlier block-blob content when an application overwrites a blob. Which feature must be enabled before the overwrite?",
    "choices": [
      {
        "key": "A",
        "text": "Container soft delete",
        "correct": false
      },
      {
        "key": "B",
        "text": "Blob versioning",
        "correct": true
      },
      {
        "key": "C",
        "text": "Changing the blob access tier",
        "correct": false
      },
      {
        "key": "D",
        "text": "A lifecycle management delete rule",
        "correct": false
      }
    ],
    "explanation": "B records versions when supported write operations change blobs, allowing an earlier version to be copied back to the current blob. A recovers deleted containers, not individual overwrites. C changes storage cost/access characteristics. D deletes eligible data rather than preserving an earlier copy. Versioning does not retroactively recover content overwritten before it was enabled.",
    "difficulty": 2
  },
  {
    "id": "az104-2-2.2-006",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.2",
    "stem": "A container holding nightly reports is deleted by a faulty cleanup script. The container is gone, but you need the blobs back. Which feature, if enabled beforehand, lets you recover the container and its blobs?",
    "choices": [
      {
        "key": "A",
        "text": "Blob soft delete",
        "correct": false
      },
      {
        "key": "B",
        "text": "Container soft delete",
        "correct": true
      },
      {
        "key": "C",
        "text": "Archive tier",
        "correct": false
      },
      {
        "key": "D",
        "text": "Blob versioning",
        "correct": false
      }
    ],
    "explanation": "Container soft delete retains a deleted container and all its blobs for a configured retention period, allowing full recovery. Blob versioning and blob soft delete protect individual blobs but do not restore the deleted container itself — and blob soft delete requires the blob, not the container, to be the deleted object. The Archive tier is a cost tier, not a recovery mechanism.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.3-001",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "stem": "A partner needs read-only access to one blob container for 48 hours. You need a revocation control without rotating the account keys, and a short policy-propagation delay is acceptable. Which approach fits?",
    "choices": [
      {
        "key": "A",
        "text": "Enable anonymous blob access at the container level",
        "correct": false
      },
      {
        "key": "B",
        "text": "Give the partner the secondary connection string",
        "correct": false
      },
      {
        "key": "C",
        "text": "Share the storage account's key1 with the partner",
        "correct": false
      },
      {
        "key": "D",
        "text": "Create a service SAS tied to a stored access policy on the container",
        "correct": true
      }
    ],
    "explanation": "D binds a narrowly scoped service SAS to a stored access policy; changing or deleting that policy revokes its associated access after propagation, which can take up to 30 seconds. C and B distribute an account credential with excessive scope and require key rotation for revocation. A exposes data anonymously and provides no per-partner expiry.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.3-002",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "stem": "A blob application must issue a SAS without signing it with an account key. An authorized Microsoft Entra principal first obtains a temporary signing key. Which SAS type does this describe?",
    "choices": [
      {
        "key": "A",
        "text": "User delegation SAS",
        "correct": true
      },
      {
        "key": "B",
        "text": "Stored access policy",
        "correct": false
      },
      {
        "key": "C",
        "text": "Account SAS",
        "correct": false
      },
      {
        "key": "D",
        "text": "Service SAS",
        "correct": false
      }
    ],
    "explanation": "A is signed with a user delegation key obtained using Entra authorization. C and D are signed with an account key. B is a service-SAS policy, not a SAS type. Revoke delegation keys or remove the issuer's data permissions when required; cached keys/permissions can delay revocation. Do not assume disabling sign-in instantly invalidates an issued token.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.3-003",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "stem": "All apps use key1; key2 is valid and unused. You need to rotate key1 without invalidating running clients. What must happen before key1 is regenerated?",
    "choices": [
      {
        "key": "A",
        "text": "Regenerate key1, then update the apps to the new key1",
        "correct": false
      },
      {
        "key": "B",
        "text": "Move every client to key2 and verify successful access.",
        "correct": true
      },
      {
        "key": "C",
        "text": "Regenerate both keys at once, then update the apps",
        "correct": false
      },
      {
        "key": "D",
        "text": "Regenerate key2 and leave every client on key1 indefinitely.",
        "correct": false
      }
    ],
    "explanation": "B gets clients off the key being rotated before regeneration invalidates it. A invalidates key1 before clients move. C invalidates both credentials at once. D changes only the unused key and never rotates the target key1. For a full two-key rotation, move clients back to the new key1 before regenerating key2.",
    "difficulty": 2
  },
  {
    "id": "az104-2-2.3-004",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "stem": "You must ensure that traffic from an Azure VM to a storage account never traverses the public internet, and you want the storage account to have a private IP address inside your virtual network. Which should you configure?",
    "choices": [
      {
        "key": "A",
        "text": "A firewall rule allowing the VM's public IP",
        "correct": false
      },
      {
        "key": "B",
        "text": "A private endpoint for the storage account",
        "correct": true
      },
      {
        "key": "C",
        "text": "Anonymous blob access restricted to the VNet",
        "correct": false
      },
      {
        "key": "D",
        "text": "A VNet service endpoint for Microsoft.Storage",
        "correct": false
      }
    ],
    "explanation": "B provides a private IP for the selected storage service endpoint (for example, blob); configure its private DNS resolution too. D uses the service public endpoint over the Azure backbone without assigning it a private IP. A authorizes a public source address. C confuses anonymous authorization with connectivity. Disable or restrict public network access separately if private-only access is required.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.3-005",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "stem": "A blob account permits public network access from selected networks, with its firewall default action Deny. An authorized VM in one subnet must access the public storage endpoint over a service endpoint. Which configuration permits that subnet?",
    "choices": [
      {
        "key": "A",
        "text": "Enable a service endpoint for Microsoft.Storage on the VNet subnet and add the VNet to the firewall allowlist",
        "correct": true
      },
      {
        "key": "B",
        "text": "Set the default action to Allow and rely on SAS tokens",
        "correct": false
      },
      {
        "key": "C",
        "text": "Enable anonymous container access",
        "correct": false
      },
      {
        "key": "D",
        "text": "Rotate the account keys",
        "correct": false
      }
    ],
    "explanation": "A enables the subnet service endpoint and adds that subnet as a permitted virtual-network rule. The endpoint remains public-addressed but network access is restricted. B allows all networks. C changes anonymous authorization, not firewall rules. D changes credentials, not connectivity. Disabling public network access would also prevent this service-endpoint path.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.3-006",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "stem": "You want users to sign in with their Entra ID identities to access blobs, with permissions managed through Azure RBAC roles like Storage Blob Data Reader, instead of distributing shared keys. Which statement is true?",
    "choices": [
      {
        "key": "A",
        "text": "Entra ID can only authorize management-plane operations, not blob data access",
        "correct": false
      },
      {
        "key": "B",
        "text": "The ordinary Reader management role automatically grants permission to read blob content.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Entra ID authorization for storage requires disabling shared key access first",
        "correct": false
      },
      {
        "key": "D",
        "text": "Entra authorization supports per-identity blob data roles without distributing shared account keys.",
        "correct": true
      }
    ],
    "explanation": "D is correct: blob data roles grant data-plane operations; configure storage logs when per-request auditing is needed. C is wrong because disabling Shared Key is optional hardening, not an Entra prerequisite. A is wrong because Entra supports blob data authorization. B is wrong because management Reader alone lacks blob DataActions. User delegation SAS permissions also depend on the issuing principal's permissions.",
    "difficulty": 2
  },
  {
    "id": "az104-2-2.4-001",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.4",
    "stem": "You want a one-time recursive copy from C:\\data to an authorized blob-container URL, not a synchronization comparison. Which command explicitly requests recursive copying?",
    "choices": [
      {
        "key": "A",
        "text": "azcopy list 'https://acct.blob.core.windows.net/container'",
        "correct": false
      },
      {
        "key": "B",
        "text": "azcopy copy 'C:\\data' 'https://acct.blob.core.windows.net/container' --recursive=true",
        "correct": true
      },
      {
        "key": "C",
        "text": "azcopy copy 'C:\\data' 'https://acct.blob.core.windows.net/container' --recursive=false",
        "correct": false
      },
      {
        "key": "D",
        "text": "azcopy copy 'https://acct.blob.core.windows.net/container' 'C:\\data' --recursive=true",
        "correct": false
      }
    ],
    "explanation": "B copies the local directory recursively to the container. C explicitly excludes recursive traversal. D reverses source and destination, downloading instead. A lists remote content. AzCopy sync can also upload a tree; deletion requires the appropriate delete-destination setting and is not automatic by default.",
    "difficulty": 2
  },
  {
    "id": "az104-2-2.4-002",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.4",
    "stem": "You run a nightly job that mirrors an on-premises folder to a blob container, and files deleted locally should also be removed from the container. Which AzCopy command best fits?",
    "choices": [
      {
        "key": "A",
        "text": "azcopy list with --recursive",
        "correct": false
      },
      {
        "key": "B",
        "text": "azcopy copy with --recursive",
        "correct": false
      },
      {
        "key": "C",
        "text": "azcopy sync with --delete-destination=true",
        "correct": true
      },
      {
        "key": "D",
        "text": "azcopy copy with --overwrite=false",
        "correct": false
      }
    ],
    "explanation": "azcopy sync replicates source to destination, and --delete-destination=true removes destination blobs that no longer exist at the source — a true mirror. azcopy copy (B) only adds/updates and never deletes at the destination. --overwrite=false (D) prevents overwrites but doesn't delete. azcopy list (A) doesn't transfer data.",
    "difficulty": 2
  },
  {
    "id": "az104-2-2.4-003",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.4",
    "stem": "A scheduled AzCopy blob-upload job must run unattended, with no interactive user/device-code login. Which authentication approach is supported?",
    "choices": [
      {
        "key": "A",
        "text": "Interactive Entra ID login only; AzCopy always requires a browser",
        "correct": false
      },
      {
        "key": "B",
        "text": "Append a SAS token to the destination URL, or log in with a service principal / managed identity",
        "correct": true
      },
      {
        "key": "C",
        "text": "Use anonymous blob access for all AzCopy operations",
        "correct": false
      },
      {
        "key": "D",
        "text": "Embed the storage account key in the URL path",
        "correct": false
      }
    ],
    "explanation": "B supports unattended access with a suitably scoped SAS or an authorized service principal/managed identity. A is wrong because interactive user login is not required. C permits only supported anonymous reads, not anonymous uploads. D is wrong because a raw account key in a blob URL path is not a supported authentication format. Never put secrets in the URL path.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.4-004",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.4",
    "stem": "A technician wants a standalone desktop graphical client to browse Azure containers and upload blobs from Windows, macOS, or Linux without writing commands. Which tool fits?",
    "choices": [
      {
        "key": "A",
        "text": "Azure File Sync agent",
        "correct": false
      },
      {
        "key": "B",
        "text": "Azure CLI with the storage command group",
        "correct": false
      },
      {
        "key": "C",
        "text": "Azure Storage Explorer",
        "correct": true
      },
      {
        "key": "D",
        "text": "AzCopy",
        "correct": false
      }
    ],
    "explanation": "C is the standalone cross-platform GUI for Azure Storage data. D and B are command-line tools. A synchronizes Windows Server files with Azure Files; it is not a general interactive storage browser.",
    "difficulty": 1
  },
  {
    "id": "az104-2-2.4-005",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.4",
    "stem": "A branch office file server is running out of disk space. You want infrequently used files to remain visible locally but have their contents stored only in Azure, downloading on demand when opened. Which Azure File Sync feature provides this?",
    "choices": [
      {
        "key": "A",
        "text": "Sync groups",
        "correct": false
      },
      {
        "key": "B",
        "text": "Cloud tiering",
        "correct": true
      },
      {
        "key": "C",
        "text": "Snapshot management",
        "correct": false
      },
      {
        "key": "D",
        "text": "Stored access policies",
        "correct": false
      }
    ],
    "explanation": "Cloud tiering replaces cold files with reparse-point stubs that look like normal files locally; content is recalled from the Azure file share on access, freeing local disk. Sync groups (A) define which servers and shares replicate together but don't free space. Snapshots (C) are point-in-time share backups. Stored access policies (D) relate to SAS revocation, not file sync.",
    "difficulty": 2
  },
  {
    "id": "az104-2-2.4-006",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.4",
    "stem": "You deploy Azure File Sync across three branch file servers so they all share one namespace backed by a single Azure file share. Changes must synchronize among branches; temporary propagation delays are acceptable. Which object defines this replication topology?",
    "choices": [
      {
        "key": "A",
        "text": "A private endpoint on the storage account",
        "correct": false
      },
      {
        "key": "B",
        "text": "An AzCopy sync job scheduled on each server",
        "correct": false
      },
      {
        "key": "C",
        "text": "A lifecycle management policy",
        "correct": false
      },
      {
        "key": "D",
        "text": "A sync group containing the cloud endpoint and the three server endpoints",
        "correct": true
      }
    ],
    "explanation": "D connects one cloud endpoint to the registered server endpoints and synchronizes their namespace asynchronously. C manages blob lifecycle rather than file-server replication. A provides private connectivity but no sync topology. B schedules independent copy/sync jobs rather than creating an Azure File Sync replication group.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.5-101",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.5",
    "stem": "An Azure Files SMB share has supported identity-based authentication enabled. A user authenticates successfully but has neither a share-level permission nor a default share permission. File ACLs allow the user. What is missing?",
    "choices": [
      {
        "key": "A",
        "text": "A more permissive NTFS ACL without any share-level permission",
        "correct": false
      },
      {
        "key": "B",
        "text": "The management-plane Reader role only",
        "correct": false
      },
      {
        "key": "C",
        "text": "An appropriate share-level permission such as Storage File Data SMB Share Reader",
        "correct": true
      },
      {
        "key": "D",
        "text": "Storage Blob Data Reader only",
        "correct": false
      }
    ],
    "explanation": "C grants the required share authorization while file/directory ACLs must also allow the access. B reads management configuration. D grants blob permissions, not SMB permissions. A changes only the layer that already allows access and leaves share authorization missing.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.5-102",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.5",
    "stem": "An identity-based Azure Files SMB user has share-level Contributor access but an NTFS ACL denies writing a particular folder. What is the expected result?",
    "choices": [
      {
        "key": "A",
        "text": "The folder ACL still restricts access, so the denied write fails.",
        "correct": true
      },
      {
        "key": "B",
        "text": "Membership in any Entra security group automatically overrides that deny.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Enabling SMB transport encryption overrides the folder write denial.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Share-level Contributor bypasses every file ACL.",
        "correct": false
      }
    ],
    "explanation": "A requires authorization at both levels. D incorrectly makes share RBAC an ACL bypass. B ignores which permissions the group actually has. C confuses encryption of the connection with permission to modify a file.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.5-103",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.5",
    "stem": "A file in an Azure Files share was overwritten after yesterday's share snapshot. You need the earlier file without reverting every file in the share. Which action fits?",
    "choices": [
      {
        "key": "A",
        "text": "Enable share soft delete only after the overwrite.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Undelete the entire share even though the share still exists.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Increase the share quota.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Browse the snapshot and copy the earlier file back to the live share.",
        "correct": true
      }
    ],
    "explanation": "D retrieves the earlier file from the existing point-in-time snapshot. B is a deleted-share operation, not an individual overwrite recovery. C adds capacity. A cannot retroactively recover overwritten file content.",
    "difficulty": 2
  },
  {
    "id": "az104-2-2.1-101",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "stem": "A standard Azure Storage account uses Microsoft-managed encryption keys. Must an administrator enable encryption before newly uploaded data is encrypted at rest?",
    "choices": [
      {
        "key": "A",
        "text": "No, Azure Storage encrypts data at rest by default; key-management options determine who manages the keys.",
        "correct": true
      },
      {
        "key": "B",
        "text": "No, because HTTPS alone encrypts stored disks.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Yes, only customer-managed keys encrypt storage.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Yes, enabling secure transfer is also what turns on at-rest encryption.",
        "correct": false
      }
    ],
    "explanation": "A describes automatic service-side encryption and the separate key-management choice. C incorrectly excludes Microsoft-managed keys. D and B confuse protected transport with protection of stored data.",
    "difficulty": 2
  },
  {
    "id": "az104-2-2.1-102",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "stem": "Two supported GPv2 accounts must asynchronously replicate selected block blobs using object replication. Which prerequisite set should you configure?",
    "choices": [
      {
        "key": "A",
        "text": "Versioning on both accounts and change feed on the source, plus the replication policy",
        "correct": true
      },
      {
        "key": "B",
        "text": "Versioning only on the destination, with no source change feed",
        "correct": false
      },
      {
        "key": "C",
        "text": "Only GRS on the destination, with no object-replication policy",
        "correct": false
      },
      {
        "key": "D",
        "text": "Change feed only on the destination, with versioning disabled",
        "correct": false
      }
    ],
    "explanation": "A meets the tracking prerequisites and establishes the policy for supported block blobs. B lacks source tracking and versioning. C configures a different account-redundancy feature. D puts change tracking on the wrong side and omits required versioning. Confirm other account/feature compatibility limits too.",
    "difficulty": 3
  },
  {
    "id": "az104-2-2.5-104",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.5",
    "stem": "A script deletes an Azure file share. File-share soft delete was enabled beforehand and its retention period has not expired. What can be recovered?",
    "choices": [
      {
        "key": "A",
        "text": "The deleted share and its contents by undeleting the share",
        "correct": true
      },
      {
        "key": "B",
        "text": "Any individually overwritten file even without a snapshot",
        "correct": false
      },
      {
        "key": "C",
        "text": "The deleted storage account automatically, even when its recovery window expired",
        "correct": false
      },
      {
        "key": "D",
        "text": "Only a previously exported copy in a different storage account",
        "correct": false
      }
    ],
    "explanation": "A uses the retained share-deletion recovery feature. D ignores the supported undelete operation. B overstates share soft delete as file versioning. C confuses share protection with account recovery and its separate limitations.",
    "difficulty": 2
  }
];

export const AZ104_D2_FLASHCARDS: Flashcard[] = [
  {
    "id": "az104-fc-2-001",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "front": "Which storage account kinds exist, and which services does each support?",
    "back": "Standard GPv2 supports blobs, files, queues and tables. Premium block blob accounts support block/append blobs and optional hierarchical namespace. FileStorage accounts support Azure Files, including supported SMB/NFS configurations. Premium page blob accounts support LRS only; premium block blobs and SSD file shares can support LRS or ZRS."
  },
  {
    "id": "az104-fc-2-002",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "front": "Compare LRS, ZRS, GRS, and GZRS: how many copies, where, and do they survive a regional outage?",
    "back": "LRS keeps local replicas. ZRS synchronously spans primary-region zones. GRS adds an asynchronous secondary-region LRS copy; GZRS combines primary ZRS with secondary LRS. Geo replication can lose recent writes after a disaster. RA-GRS/RA-GZRS additionally expose secondary reads."
  },
  {
    "id": "az104-fc-2-003",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.1",
    "front": "What does read access to the secondary (RA-) give you, and which options offer it?",
    "back": "RA-GRS and RA-GZRS expose a readable secondary endpoint before failover. Applications must use that endpoint and tolerate replication lag. GRS/GZRS permit access to the secondary only after account failover, which can be customer-managed for supported configurations."
  },
  {
    "id": "az104-fc-2-004",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.2",
    "front": "Order the blob access tiers by storage cost and state when each fits.",
    "back": "Among fixed tiers, capacity pricing decreases Hot → Cool → Cold → Archive while access costs generally rise. Hot/Cool/Cold are online. Cool and Cold have 30/90-day minimum retention charges; Archive is offline with a 180-day minimum. Rehydrate Archive by Set Blob Tier or copying to an online tier; completion takes time."
  },
  {
    "id": "az104-fc-2-005",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.2",
    "front": "How does a lifecycle management policy decide which blobs to act on, and what actions can it take?",
    "back": "Rules filter supported blob types by container/name prefixes or index tags. Supported actions tier or delete data; rules specify their time condition explicitly (such as last modification, last access with tracking, or creation time). Versions and snapshots have separate action rules and limitations."
  },
  {
    "id": "az104-fc-2-006",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.2",
    "front": "What's the difference between blob soft delete, container soft delete, and blob versioning?",
    "back": "Blob soft delete: recovers individually deleted/overwritten blobs within a retention window. Container soft delete: recovers a whole deleted container plus its blobs. Blob versioning: automatically keeps prior versions on every write, so you can restore earlier content of an overwritten blob."
  },
  {
    "id": "az104-fc-2-007",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "front": "Name the three SAS types and when to use each.",
    "back": "User delegation SAS uses an Entra-authorized temporary signing key. Service SAS uses an account key for one storage service and can reference a stored access policy. Account SAS uses an account key across specified services/resource types. Use narrow permissions and expiry; revocation propagation is not guaranteed instantaneous."
  },
  {
    "id": "az104-fc-2-008",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "front": "How do you rotate storage account keys with zero downtime?",
    "back": "Accounts have key1 and key2. Point all clients at the standby key, verify, then regenerate the previously active key. Never regenerate the key clients are currently using first."
  },
  {
    "id": "az104-fc-2-009",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "front": "Compare firewall rules + service endpoints vs private endpoints for locking down a storage account.",
    "back": "Selected-network firewall rules plus service endpoints restrict access to a public-addressed storage endpoint over Azure networking. Private endpoints provide service-specific private IPs and need correct DNS. Disabling public network access blocks the service-endpoint route; configured private endpoints can still work."
  },
  {
    "id": "az104-fc-2-010",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "front": "What are the anonymous blob access levels, and what is the safest default?",
    "back": "At account level, disallowing blob anonymous access overrides container settings. If the account permits it, each container chooses Private, Blob (anonymous reads of known blobs), or Container (also anonymous blob listing). Keep containers private unless public content is intentional."
  },
  {
    "id": "az104-fc-2-011",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.4",
    "front": "AzCopy copy vs AzCopy sync — when is each right, and how do you copy subfolders?",
    "back": "copy: one-way transfer, never deletes at destination; add --recursive to include subfolders. sync: mirrors source to destination (with --delete-destination it removes destination files missing at source). Authenticate with a SAS on the URL or Entra ID (interactive login, service principal, or managed identity)."
  },
  {
    "id": "az104-fc-2-012",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.4",
    "front": "What is Azure File Sync cloud tiering, and what is a sync group?",
    "back": "Cloud tiering: cold files become local stubs with content in Azure, recalled on access — saves on-premises disk. A sync group links one cloud endpoint (Azure file share) with server endpoints (registered servers), replicating one namespace across sites."
  }
];

export const AZ104_D2_PERF_QUESTIONS: PerfQuestion[] = [
  {
    "id": "az104-pbq-2-001",
    "certId": "az-104",
    "domainId": "az-104:domain:2",
    "objectiveId": "az-104:obj:2.3",
    "type": "drag-match",
    "prompt": "A company is tightening storage security. Match each security requirement on the left with the Azure Storage control on the right that best satisfies it.",
    "leftLabel": "Requirement",
    "rightLabel": "Storage control",
    "pairs": [
      {
        "left": "Give a vendor 24-hour container read access revocable without rotating account keys; allow policy propagation time",
        "right": "Service SAS bound to a stored access policy"
      },
      {
        "left": "Let users access blobs with their corporate identities and RBAC roles",
        "right": "Entra ID authorization for data plane"
      },
      {
        "left": "Keep storage traffic off the public internet with a private IP in the VNet",
        "right": "Private endpoint"
      },
      {
        "left": "Allow only specific VNets to reach the account while denying everything else",
        "right": "Firewall rules with VNet service endpoint"
      },
      {
        "left": "Rotate credentials without breaking running applications",
        "right": "Dual keys (key1/key2) regenerated one at a time"
      }
    ],
    "explanation": "A stored-policy service SAS supports scoped access and policy-based revocation after propagation (up to 30 seconds). Entra data roles authorize identities. A private endpoint supplies a service-specific private IP. Selected-network firewall rules authorize the chosen subnet over its service endpoint. For key rotation, verify clients on the standby key before regenerating the former active key.",
    "difficulty": 3
  }
];

export const AZ104_D2_ACRONYMS: Acronym[] = [
  {
    "id": "az104-ac-009",
    "certId": "az-104",
    "acronym": "LRS",
    "expansion": "Locally Redundant Storage",
    "hint": "Three copies in a single datacenter; cheapest, no zonal or regional protection",
    "domainHint": 2
  },
  {
    "id": "az104-ac-010",
    "certId": "az-104",
    "acronym": "ZRS",
    "expansion": "Zone-Redundant Storage",
    "hint": "Three copies across availability zones in one region; survives datacenter loss",
    "domainHint": 2
  },
  {
    "id": "az104-ac-011",
    "certId": "az-104",
    "acronym": "GRS",
    "expansion": "Geo-Redundant Storage",
    "hint": "LRS plus async copies in a paired secondary region; survives regional outage",
    "domainHint": 2
  },
  {
    "id": "az104-ac-012",
    "certId": "az-104",
    "acronym": "RA-GRS",
    "expansion": "Read-Access Geo-Redundant Storage",
    "hint": "GRS plus read access to the secondary replica during a primary outage",
    "domainHint": 2
  },
  {
    "id": "az104-ac-013",
    "certId": "az-104",
    "acronym": "GZRS",
    "expansion": "Geo-Zone-Redundant Storage",
    "hint": "ZRS in the primary region plus asynchronous replication to LRS in the secondary region.",
    "domainHint": 2
  },
  {
    "id": "az104-ac-014",
    "certId": "az-104",
    "acronym": "SAS",
    "expansion": "Shared Access Signature",
    "hint": "Time- and permission-scoped token; types: user delegation, service, account",
    "domainHint": 2
  },
  {
    "id": "az104-ac-015",
    "certId": "az-104",
    "acronym": "SMB",
    "expansion": "Server Message Block",
    "hint": "File-sharing protocol used by Azure Files for Windows mounts",
    "domainHint": 2
  },
  {
    "id": "az104-ac-016",
    "certId": "az-104",
    "acronym": "NFS",
    "expansion": "Network File System",
    "hint": "File-sharing protocol supported by Azure Files for Linux clients",
    "domainHint": 2
  }
];

```

## content/parts/az104-d3.ts

```ts
import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";

// Original practice content. Reviewed 2026-09-25; evidence and full issue log: docs/az104-review/REPORT.md.

export const AZ104_D3_QUESTIONS: Question[] = [
  {
    "id": "az104-3-3.1-001",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "stem": "You are deploying an Azure VM to host an in-memory caching layer. The workload needs a high memory-to-CPU ratio. Which VM series is designed for memory-optimized workloads?",
    "choices": [
      {
        "key": "A",
        "text": "F-series",
        "correct": false
      },
      {
        "key": "B",
        "text": "B-series",
        "correct": false
      },
      {
        "key": "C",
        "text": "D-series",
        "correct": false
      },
      {
        "key": "D",
        "text": "E-series",
        "correct": true
      }
    ],
    "explanation": "The E-series is Azure's memory-optimized family, built for workloads like databases, in-memory analytics, and caching that need lots of RAM per vCPU. B-series is burstable (credits-based, for variable dev/test loads), D-series is general-purpose with a balanced CPU-to-memory ratio, and F-series is compute-optimized with a high CPU-to-memory ratio — the opposite of what this workload needs.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.1-002",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "stem": "A B-series VM earns CPU credits while it runs below its baseline and spends them during bursts. What happens when the VM runs out of banked credits while under heavy load?",
    "choices": [
      {
        "key": "A",
        "text": "The VM is automatically evicted like a Spot VM",
        "correct": false
      },
      {
        "key": "B",
        "text": "Azure bills the overage at standard pay-as-you-go VM rates",
        "correct": false
      },
      {
        "key": "C",
        "text": "The VM is deallocated until credits accumulate again",
        "correct": false
      },
      {
        "key": "D",
        "text": "The VM is throttled back to its baseline CPU performance",
        "correct": true
      }
    ],
    "explanation": "B-series VMs are credit-based: with no credits banked, the VM is capped at its baseline CPU level until it idles and earns credits again. Eviction only applies to Spot VMs (A is wrong), there is no automatic credit purchasing (B is wrong), and the VM is never stopped for being out of credits (C is wrong) — it just runs slower.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.1-003",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "stem": "You need to resize a standalone running VM that is not in an availability set from Standard_D2s_v5 to Standard_E4s_v5, but the portal warns the new size is not available on the current hardware cluster. What must you do before resizing?",
    "choices": [
      {
        "key": "A",
        "text": "Stop (deallocate) the VM so it can be moved to new hardware",
        "correct": true
      },
      {
        "key": "B",
        "text": "Detach all data disks, resize, then reattach them",
        "correct": false
      },
      {
        "key": "C",
        "text": "Delete the VM and recreate it from the OS disk snapshot",
        "correct": false
      },
      {
        "key": "D",
        "text": "Restart the VM from inside the guest OS",
        "correct": false
      }
    ],
    "explanation": "A resize to a size on different physical hardware requires the VM to be deallocated (Stop in the portal releases the hardware lease); a guest-OS restart keeps the same host allocation. Data disks do not need detaching for a resize, and deleting the VM is unnecessary — deallocate, resize, start.",
    "difficulty": 3
  },
  {
    "id": "az104-3-3.1-004",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "stem": "A VM size includes a local temporary disk. Which statement correctly describes its durability?",
    "choices": [
      {
        "key": "A",
        "text": "It is encrypted with the same key as the OS disk and replicated to the paired region",
        "correct": false
      },
      {
        "key": "B",
        "text": "It is the best place to store application data because it is local SSD",
        "correct": false
      },
      {
        "key": "C",
        "text": "It is nonpersistent scratch storage; data can be lost during maintenance, redeploy, or deallocation.",
        "correct": true
      },
      {
        "key": "D",
        "text": "It is backed by Azure Storage and included in managed disk snapshots",
        "correct": false
      }
    ],
    "explanation": "C is correct: temporary storage is not a durable data disk, although a successful standard restart normally preserves it. B mistakes local performance for durability. D incorrectly treats it as a managed disk covered by managed-disk snapshots. A incorrectly promises geo-replication; encryption depends on VM generation and configuration. Store recoverable scratch data there.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.1-005",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "stem": "A supported VM and region need a single managed data disk provisioned for 200,000 IOPS with independently configurable throughput. Assume capacity and VM limits are sufficient. Which disk type supports this IOPS requirement?",
    "choices": [
      {
        "key": "A",
        "text": "Premium SSD v2",
        "correct": false
      },
      {
        "key": "B",
        "text": "Ultra Disk",
        "correct": true
      },
      {
        "key": "C",
        "text": "Standard SSD",
        "correct": false
      },
      {
        "key": "D",
        "text": "Premium SSD",
        "correct": false
      }
    ],
    "explanation": "B supports provisioned IOPS above 80,000, including this requirement. C and D have much lower per-disk performance limits. A offers independently adjustable performance and submillisecond latency but tops out at 80,000 IOPS per disk. The VM and disk capacity must also support the requested performance.",
    "difficulty": 4
  },
  {
    "id": "az104-3-3.1-006",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "stem": "A new Windows VM must download and run an existing PowerShell installation script once after provisioning. The script is idempotent and does not reboot the VM. Which extension directly supports this imperative script execution?",
    "choices": [
      {
        "key": "A",
        "text": "Azure Monitor Agent extension",
        "correct": false
      },
      {
        "key": "B",
        "text": "Microsoft Antimalware extension",
        "correct": false
      },
      {
        "key": "C",
        "text": "Azure Network Watcher extension",
        "correct": false
      },
      {
        "key": "D",
        "text": "Custom Script Extension",
        "correct": true
      }
    ],
    "explanation": "D downloads and executes the supplied script. To deliberately rerun it later, change the configuration or force-update tag; unchanged deployments do not rerun it automatically. A collects monitoring data. B configures antimalware protection. C supports network diagnostics. None of those three is the general-purpose script runner.",
    "difficulty": 3
  },
  {
    "id": "az104-3-3.1-007",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "stem": "You run a batch rendering job on Spot VMs with the eviction policy set to Deallocate. Azure needs the capacity back and issues an eviction notice. What happens to the VMs?",
    "choices": [
      {
        "key": "A",
        "text": "They are permanently deleted along with their OS disks",
        "correct": false
      },
      {
        "key": "B",
        "text": "They are live-migrated to another Azure region automatically",
        "correct": false
      },
      {
        "key": "C",
        "text": "They keep running but are billed at regular pay-as-you-go rates",
        "correct": false
      },
      {
        "key": "D",
        "text": "They are deallocated (stopped without compute charges) and can be restarted later",
        "correct": true
      }
    ],
    "explanation": "With the Deallocate eviction policy, evicted Spot VMs are stopped (no compute billing, disks retained) so the job can resume when capacity returns. The Delete policy is what permanently removes VMs. Azure never live-migrates Spot VMs to another region, and eviction does not convert them to pay-as-you-go pricing.",
    "difficulty": 3
  },
  {
    "id": "az104-3-3.1-008",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "stem": "A regulator requires that your VMs run on physical servers dedicated solely to your organization, with control over host-level maintenance windows. The compliance team rejects any multi-tenant hardware sharing. Which Azure option satisfies this?",
    "choices": [
      {
        "key": "A",
        "text": "Using a proximity placement group for the VMs",
        "correct": false
      },
      {
        "key": "B",
        "text": "Azure Dedicated Host",
        "correct": true
      },
      {
        "key": "C",
        "text": "Deploying the VMs across multiple availability zones",
        "correct": false
      },
      {
        "key": "D",
        "text": "Placing the VMs in an availability set with three fault domains",
        "correct": false
      }
    ],
    "explanation": "Azure Dedicated Host gives you the entire physical server — single-tenant hardware plus control over maintenance timing — which is exactly what the compliance requirement demands. Availability zones and availability sets protect against failures, not tenancy. Proximity placement groups reduce network latency between VMs but say nothing about who shares the host.",
    "difficulty": 4
  },
  {
    "id": "az104-3-3.2-001",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.2",
    "stem": "An availability set is configured with 3 fault domains and 20 update domains. During a planned host OS patching event, what do the update domains guarantee?",
    "choices": [
      {
        "key": "A",
        "text": "Azure reboots one update domain at a time during this planned maintenance.",
        "correct": true
      },
      {
        "key": "B",
        "text": "VMs survive the loss of an entire datacenter rack",
        "correct": false
      },
      {
        "key": "C",
        "text": "VMs are automatically replicated to another Azure region",
        "correct": false
      },
      {
        "key": "D",
        "text": "At least one VM keeps running in every fault domain",
        "correct": false
      }
    ],
    "explanation": "A describes the planned-maintenance sequencing that update domains provide. B describes protection from hardware failures, associated with fault domains. C is not a capability of an availability set. D is not guaranteed by update domains; VM placement and application redundancy still matter. Unrelated failures can occur during maintenance.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.2-002",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.2",
    "stem": "A stateless application has healthy VM backends in zones 1, 2 and 3. Its data dependencies survive a zone outage. Which Standard Load Balancer design keeps routing new connections to surviving healthy backends?",
    "choices": [
      {
        "key": "A",
        "text": "A single availability set inside one zone",
        "correct": false
      },
      {
        "key": "B",
        "text": "All VMs in one zone behind a regional load balancer",
        "correct": false
      },
      {
        "key": "C",
        "text": "Zonal deployment pinned to zone 1 with a standby in zone 2",
        "correct": false
      },
      {
        "key": "D",
        "text": "Zone-redundant frontend with backend VMs spread across all three zones",
        "correct": true
      }
    ],
    "explanation": "D combines a zone-redundant frontend with healthy backends spread across zones; probes remove unhealthy backends from new-flow selection. C requires a separate standby promotion/routing design. A protects a smaller failure scope. B loses all backends in a zone outage. This routing does not itself replicate application state or guarantee uninterrupted existing connections.",
    "difficulty": 3
  },
  {
    "id": "az104-3-3.2-003",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.2",
    "stem": "A scale set must contain standard Microsoft.Compute/virtualMachines resources managed with ordinary VM APIs and support permitted mixtures of VM sizes. Which orchestration mode fits?",
    "choices": [
      {
        "key": "A",
        "text": "Flexible orchestration mode",
        "correct": true
      },
      {
        "key": "B",
        "text": "Uniform orchestration mode",
        "correct": false
      },
      {
        "key": "C",
        "text": "An availability set with autoscale enabled",
        "correct": false
      },
      {
        "key": "D",
        "text": "A proximity placement group",
        "correct": false
      }
    ],
    "explanation": "A uses standard Azure VM resources with individual lifecycle management and supports mixed sizes subject to placement constraints. B uses scale-set VM child resources and its VMSS APIs; it is not true that Uniform instances cannot be individually addressed. C does not provide autoscale. D controls proximity rather than orchestration.",
    "difficulty": 3
  },
  {
    "id": "az104-3-3.2-004",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.2",
    "stem": "A VMSS autoscale profile adds two instances when average CPU exceeds 70% for 10 minutes, and removes one when it drops below 30% for 15 minutes. What kind of scaling is this?",
    "choices": [
      {
        "key": "A",
        "text": "Manual scaling",
        "correct": false
      },
      {
        "key": "B",
        "text": "Availability-zone failover",
        "correct": false
      },
      {
        "key": "C",
        "text": "Metric-based autoscale rules",
        "correct": true
      },
      {
        "key": "D",
        "text": "Schedule-based autoscaling",
        "correct": false
      }
    ],
    "explanation": "These are metric-based autoscale rules: thresholds on a performance metric (CPU) with durations trigger scale-out and scale-in. Schedule-based scaling triggers on time of day, not metrics. Manual scaling means an administrator changes the instance count directly. Zone failover is a resilience concept, not a scaling mechanism.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.2-005",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.2",
    "stem": "A VMSS scales in from 10 instances to 6 during a quiet period. With the default scale-in policy, which instances are terminated first?",
    "choices": [
      {
        "key": "A",
        "text": "Random instances, with no balancing across fault domains",
        "correct": false
      },
      {
        "key": "B",
        "text": "Balance across zones, then fault domains on a best-effort basis, then select the highest instance ID among eligible candidates.",
        "correct": true
      },
      {
        "key": "C",
        "text": "The oldest instances, since they have served the longest",
        "correct": false
      },
      {
        "key": "D",
        "text": "The instances with the highest current CPU utilization",
        "correct": false
      }
    ],
    "explanation": "B is the documented Default order. Protected instances are excluded from automatic scale-in. C corresponds to an age-based OldestVM policy, not Default. D incorrectly uses CPU to select the individual removal candidate. A ignores placement balancing. NewestVM is a separate policy; creation time and instance ID are not interchangeable.",
    "difficulty": 3
  },
  {
    "id": "az104-3-3.2-006",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.2",
    "stem": "A Uniform scale set uses automatic OS image upgrades with health monitoring and automatic rollback enabled. An upgraded instance fails to become healthy within the configured wait. Which protection can the platform apply that a manually triggered OS image upgrade does not provide?",
    "choices": [
      {
        "key": "A",
        "text": "It requires you to approve each batch before it proceeds",
        "correct": false
      },
      {
        "key": "B",
        "text": "It skips the health probe and upgrades on a fixed schedule",
        "correct": false
      },
      {
        "key": "C",
        "text": "Restore the unhealthy instance's previous OS disk as part of automatic OS-upgrade rollback.",
        "correct": true
      },
      {
        "key": "D",
        "text": "It upgrades every instance simultaneously for maximum speed",
        "correct": false
      }
    ],
    "explanation": "C describes the automatic OS-upgrade rollback safeguard. D contradicts rolling batches. A invents a per-batch approval requirement. B ignores required health evaluation. A manual trigger of an OS image upgrade does not provide this automatic rollback capability; do not generalize that to every VMSS update mechanism.",
    "difficulty": 5
  },
  {
    "id": "az104-3-3.2-007",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.2",
    "stem": "What is the minimum number of virtual machines in an availability set required to qualify for the 99.95% Azure SLA for VMs?",
    "choices": [
      {
        "key": "A",
        "text": "4",
        "correct": false
      },
      {
        "key": "B",
        "text": "1",
        "correct": false
      },
      {
        "key": "C",
        "text": "2",
        "correct": true
      },
      {
        "key": "D",
        "text": "3",
        "correct": false
      }
    ],
    "explanation": "C is the minimum: two or more VMs in the same availability set qualify for the applicable 99.95% VM connectivity SLA. B does not meet the multiple-VM requirement. D and A exceed the minimum. Multi-zone deployments and single-VM disk configurations have separate SLA terms; this answer is not a blanket SLA for every VM design.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.2-008",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.2",
    "stem": "Which statement correctly describes an Azure availability zone?",
    "choices": [
      {
        "key": "A",
        "text": "One or more datacenters with independent power, cooling, and networking within a region",
        "correct": true
      },
      {
        "key": "B",
        "text": "A synonym for an Azure region",
        "correct": false
      },
      {
        "key": "C",
        "text": "A single rack of servers inside a datacenter",
        "correct": false
      },
      {
        "key": "D",
        "text": "A logical grouping identical to a fault domain",
        "correct": false
      }
    ],
    "explanation": "Each availability zone is a physically separate set of datacenters in a region with independent power, cooling, and networking, so a zone-level failure does not take the others down. A region contains zones (not the reverse), a rack is far smaller than a zone, and fault domains are a within-datacenter concept used by availability sets.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.3-001",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.3",
    "stem": "You deploy an Azure Container Instances container that runs a one-time database migration. It must never restart after it exits, even if it exits with an error code. Which restart policy should you set on the container group?",
    "choices": [
      {
        "key": "A",
        "text": "OnFailure",
        "correct": false
      },
      {
        "key": "B",
        "text": "Never",
        "correct": true
      },
      {
        "key": "C",
        "text": "Manual",
        "correct": false
      },
      {
        "key": "D",
        "text": "Always",
        "correct": false
      }
    ],
    "explanation": "B stops the container when its process exits, including a nonzero exit, without automatically restarting it. D restarts after any exit. A restarts after failure. C is not an ACI restart-policy value. Never does not guarantee exactly-once processing against manual restarts, redeployments, or application retries.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.3-002",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.3",
    "stem": "A Linux ACI container group contains two cooperating containers. Which statement about the group is true?",
    "choices": [
      {
        "key": "A",
        "text": "Its containers scale independently of one another",
        "correct": false
      },
      {
        "key": "B",
        "text": "Its containers can be spread across multiple Azure regions",
        "correct": false
      },
      {
        "key": "C",
        "text": "Its containers are scheduled on the same host and share a lifecycle, local network, and storage volumes",
        "correct": true
      },
      {
        "key": "D",
        "text": "Each container gets its own public IP address and DNS name",
        "correct": false
      }
    ],
    "explanation": "C is correct: containers are co-scheduled and share a lifecycle and local network, with volumes available for configured mounts. D assigns an IP to each container, whereas network exposure is at group level. A incorrectly assumes independent group-member scaling. B places one group across regions, which is unsupported.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.3-003",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.3",
    "stem": "You deploy a new revision of an Azure Container App and want 90% of traffic on the current revision and 10% on the new revision for canary validation. What makes this possible?",
    "choices": [
      {
        "key": "A",
        "text": "Disabling ingress and exposing the new revision directly",
        "correct": false
      },
      {
        "key": "B",
        "text": "Creating a second Container Apps environment",
        "correct": false
      },
      {
        "key": "C",
        "text": "Keeping multiple active revisions and splitting ingress traffic between them",
        "correct": true
      },
      {
        "key": "D",
        "text": "Setting the app to single-revision mode",
        "correct": false
      }
    ],
    "explanation": "Container Apps supports multiple active revisions with weighted traffic splitting at the ingress — the textbook canary pattern. Single-revision mode deactivates old revisions, so splitting is impossible. Disabling ingress removes external traffic entirely, and a second environment is for isolation boundaries, not traffic weighting.",
    "difficulty": 3
  },
  {
    "id": "az104-3-3.3-004",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.3",
    "stem": "A Container App processes messages from a Service Bus queue. It must scale to zero replicas when the queue is empty and spin up automatically as messages arrive. Which capability enables this event-driven scaling?",
    "choices": [
      {
        "key": "A",
        "text": "Manual replica count changes via the Azure CLI",
        "correct": false
      },
      {
        "key": "B",
        "text": "KEDA scalers",
        "correct": true
      },
      {
        "key": "C",
        "text": "A CPU-utilization autoscale rule with a minimum of one replica",
        "correct": false
      },
      {
        "key": "D",
        "text": "An ACI restart policy of OnFailure",
        "correct": false
      }
    ],
    "explanation": "KEDA (Kubernetes Event-Driven Autoscaling) is built into Container Apps and scales on event sources like queue length — including scale-to-zero when idle. A CPU rule with min replicas of one can never reach zero and reacts to CPU, not queue depth. ACI restart policies govern restarts, not scaling, and manual CLI changes are not automatic.",
    "difficulty": 5
  },
  {
    "id": "az104-3-3.3-005",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.3",
    "stem": "Your team needs container images in Azure Container Registry replicated automatically to a secondary region for disaster recovery. Which ACR SKU is required?",
    "choices": [
      {
        "key": "A",
        "text": "Premium",
        "correct": true
      },
      {
        "key": "B",
        "text": "Standard with an additional repository",
        "correct": false
      },
      {
        "key": "C",
        "text": "Basic",
        "correct": false
      },
      {
        "key": "D",
        "text": "Standard",
        "correct": false
      }
    ],
    "explanation": "A is required for ACR geo-replication. C and D do not provide this feature. B changes repository organization but does not add Premium capabilities. Geo-replication must still be configured for the desired supported regions.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.3-006",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.3",
    "stem": "Multiple Container Apps need to share a virtual network, internal DNS, and centralized logging, with a secure boundary around the group. What should you deploy them into?",
    "choices": [
      {
        "key": "A",
        "text": "A Container Apps environment",
        "correct": true
      },
      {
        "key": "B",
        "text": "An ACI container group",
        "correct": false
      },
      {
        "key": "C",
        "text": "An Azure Container Registry",
        "correct": false
      },
      {
        "key": "D",
        "text": "A Log Analytics workspace alone",
        "correct": false
      }
    ],
    "explanation": "The Container Apps environment is the secure boundary that provides VNet integration, internal networking, and shared logging for the apps inside it. A container group is an ACI concept, not a Container Apps boundary. ACR stores images; it does not host apps. A Log Analytics workspace collects logs but provides no network boundary or hosting.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.3-007",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.3",
    "stem": "A single-container ACI deployment requests 2 vCPU and 4 GiB of memory. Which configuration expresses this allocation to ACI?",
    "choices": [
      {
        "key": "A",
        "text": "Set only the container group restartPolicy to Always.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Set the container resources.requests.cpu and resources.requests.memoryInGB values.",
        "correct": true
      },
      {
        "key": "C",
        "text": "Set only the container image tag to 2cpu-4gb.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Set only environment variables named CPU and MEMORY.",
        "correct": false
      }
    ],
    "explanation": "B is the resource-request configuration ACI uses to allocate resources, subject to service limits and capacity. C names an image version, not an allocation. D passes data to the process but does not reserve resources. A controls restart behavior. Requests describe allocation rather than an application's exact consumption; limits can further constrain usage.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.4-001",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.4",
    "stem": "You move an App Service plan from the B1 tier to the P1v3 tier to get more CPU and memory per instance. What is this change called?",
    "choices": [
      {
        "key": "A",
        "text": "Scale out",
        "correct": false
      },
      {
        "key": "B",
        "text": "Autoscale",
        "correct": false
      },
      {
        "key": "C",
        "text": "Slot swap",
        "correct": false
      },
      {
        "key": "D",
        "text": "Scale up",
        "correct": true
      }
    ],
    "explanation": "Scale up means moving to a bigger pricing tier (more CPU/RAM per instance). Scale out means adding more instances of the same size. Autoscale changes instance count automatically based on rules, and a slot swap exchanges staging and production code — neither changes the tier size.",
    "difficulty": 1
  },
  {
    "id": "az104-3-3.4-002",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.4",
    "stem": "Your web app runs on the Free tier of an App Service plan and traffic is growing. You want to scale out to three instances. What is the problem with this plan?",
    "choices": [
      {
        "key": "A",
        "text": "Three instances are only possible with deployment slots",
        "correct": false
      },
      {
        "key": "B",
        "text": "Scale-out is automatic on Free tier and cannot be set manually",
        "correct": false
      },
      {
        "key": "C",
        "text": "Free and Shared tiers do not support scale-out; you must move to Basic or higher",
        "correct": true
      },
      {
        "key": "D",
        "text": "Scale-out requires an App Service Environment on every tier",
        "correct": false
      }
    ],
    "explanation": "C is correct for manual scale-out: Free/Shared do not support multiple instances, while Basic supports up to three. Azure Monitor rule-based autoscale requires Standard or higher. D incorrectly requires an ASE. A confuses deployment slots with worker instances. B invents Free-tier autoscaling.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.4-003",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.4",
    "stem": "A Standard-or-higher App Service has a validated staging slot and swap-compatible application settings. Which feature promotes the warmed staging application to the production endpoint?",
    "choices": [
      {
        "key": "A",
        "text": "Scaling out the production slot",
        "correct": false
      },
      {
        "key": "B",
        "text": "Restoring the app from a backup snapshot",
        "correct": false
      },
      {
        "key": "C",
        "text": "Rebinding the custom TLS certificate",
        "correct": false
      },
      {
        "key": "D",
        "text": "Swapping the staging and production slots",
        "correct": true
      }
    ],
    "explanation": "D swaps slot routing after warm-up to promote the deployment with minimal disruption. A adds instances but does not promote staging code. B restores a backup rather than staging. C changes TLS bindings. Swapping back can reverse the code deployment, but does not undo database migrations or guarantee preserved application sessions.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.4-004",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.4",
    "stem": "Your app has staging and production slots. The staging slot uses a test database connection string, and that setting must keep pointing at the test database even after a swap. How do you configure this?",
    "choices": [
      {
        "key": "A",
        "text": "Store the connection string in the production slot only",
        "correct": false
      },
      {
        "key": "B",
        "text": "Delete the staging slot immediately after each swap",
        "correct": false
      },
      {
        "key": "C",
        "text": "Mark the connection string as a deployment slot (sticky) setting",
        "correct": true
      },
      {
        "key": "D",
        "text": "Perform the swap with preview enabled",
        "correct": false
      }
    ],
    "explanation": "Marking a setting as slot-specific ('sticky') pins it to the slot so it does not travel during a swap — staging keeps its test database string. Swap-with-preview only lets you validate warmed-up staging before completing the swap; it does not change which settings move. Putting the string only in production leaves staging without it, and deleting the slot is destructive and unnecessary.",
    "difficulty": 4
  },
  {
    "id": "az104-3-3.4-005",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.4",
    "stem": "You need to bind a custom domain to a web app and secure it with an SNI-based TLS certificate. What is the minimum App Service plan tier that supports both?",
    "choices": [
      {
        "key": "A",
        "text": "Free",
        "correct": false
      },
      {
        "key": "B",
        "text": "Shared",
        "correct": false
      },
      {
        "key": "C",
        "text": "Basic",
        "correct": true
      },
      {
        "key": "D",
        "text": "Standard",
        "correct": false
      }
    ],
    "explanation": "Basic is the lowest listed tier that supports both custom domains and SNI-based TLS certificate bindings. Free lacks custom domains. Shared supports custom domains but not custom TLS certificate bindings. Standard adds capabilities such as deployment slots and metric-based autoscale, but is not the minimum tier for this requirement.",
    "difficulty": 3
  },
  {
    "id": "az104-3-3.4-006",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.4",
    "stem": "A web app needs a configurable backup schedule, a customer storage destination, and selectable retention. Which App Service backup option fits?",
    "choices": [
      {
        "key": "A",
        "text": "Automatic backups, with their fixed hourly schedule and fixed retention",
        "correct": false
      },
      {
        "key": "B",
        "text": "Custom backups on a supported Basic-or-higher plan, configured with a storage destination and schedule",
        "correct": true
      },
      {
        "key": "C",
        "text": "Deployment-slot swaps on a Free plan",
        "correct": false
      },
      {
        "key": "D",
        "text": "Only an App Service Environment can provide configurable backups",
        "correct": false
      }
    ],
    "explanation": "B supports scheduled custom backups with a configured storage destination and retention. A provides platform-managed backups but does not expose the requested schedule/retention controls. C deploys code and is not a backup mechanism; Free also lacks slots. D is wrong because supported multitenant Basic, Standard and Premium plans also offer backups.",
    "difficulty": 3
  },
  {
    "id": "az104-3-3.4-007",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.4",
    "stem": "Security policy requires your web apps to run on dedicated, single-tenant compute inside your own virtual network, isolated from other customers' App Service front ends. Which Azure resource provides this environment?",
    "choices": [
      {
        "key": "A",
        "text": "A Private Endpoint on the web app",
        "correct": false
      },
      {
        "key": "B",
        "text": "App Service Environment (ASE)",
        "correct": true
      },
      {
        "key": "C",
        "text": "A Premium v3 App Service plan",
        "correct": false
      },
      {
        "key": "D",
        "text": "VNet integration on a Standard plan",
        "correct": false
      }
    ],
    "explanation": "B provides a single-tenant App Service environment in the customer VNet, including isolated hosting infrastructure. C already provides dedicated workers for its plan but still uses the shared multitenant App Service environment/frontends. D supplies outbound VNet connectivity without creating an ASE. A supplies private inbound connectivity without isolating the hosting environment.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.5-101",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.5",
    "stem": "A Bicep file declares param location string = resourceGroup().location. Deployment passes location=westus3. Which value is used for that parameter?",
    "choices": [
      {
        "key": "A",
        "text": "westus3, because the deployment supplied an explicit value.",
        "correct": true
      },
      {
        "key": "B",
        "text": "The Bicep source file folder name.",
        "correct": false
      },
      {
        "key": "C",
        "text": "The tenant home region.",
        "correct": false
      },
      {
        "key": "D",
        "text": "The resource-group location always overrides supplied parameters.",
        "correct": false
      }
    ],
    "explanation": "A overrides the default with the supplied value. D reverses parameter precedence. B is not a Bicep location expression. C is not the value of resourceGroup().location. Defaults are used when the caller does not supply that parameter.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.5-102",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.5",
    "stem": "A resource-group-scoped main.bicep must be deployed into an existing resource group named study-rg using Azure CLI. Which command creates the deployment?",
    "choices": [
      {
        "key": "A",
        "text": "az deployment group create --resource-group study-rg --template-file main.bicep",
        "correct": true
      },
      {
        "key": "B",
        "text": "az group show --name study-rg",
        "correct": false
      },
      {
        "key": "C",
        "text": "az deployment sub create --location eastus --template-file main.bicep",
        "correct": false
      },
      {
        "key": "D",
        "text": "az bicep build --file main.bicep",
        "correct": false
      }
    ],
    "explanation": "A submits a resource-group deployment. D compiles Bicep to JSON without deploying resources. B reads group metadata. C submits at subscription scope, which does not match this file's stated scope.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.5-103",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.5",
    "stem": "Before deploying a changed Bicep file, you need a preview of expected resource changes without applying them. Which Azure CLI operation fits?",
    "choices": [
      {
        "key": "A",
        "text": "az deployment group create",
        "correct": false
      },
      {
        "key": "B",
        "text": "az group delete",
        "correct": false
      },
      {
        "key": "C",
        "text": "az bicep decompile",
        "correct": false
      },
      {
        "key": "D",
        "text": "az deployment group what-if",
        "correct": true
      }
    ],
    "explanation": "D previews expected changes for a supported group deployment; review the output and its documented limitations. A applies a deployment. B deletes the group. C converts ARM JSON to Bicep and does not preview live changes.",
    "difficulty": 2
  },
  {
    "id": "az104-3-3.5-104",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.5",
    "stem": "An existing ARM JSON template needs to become a starting point for maintainable Bicep. Which operation helps, and what must happen afterward?",
    "choices": [
      {
        "key": "A",
        "text": "Use a what-if operation to generate a complete Bicep source file.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Rename its .json extension to .bicep; no validation is needed.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Run az bicep decompile --file template.json, then review and fix the generated Bicep.",
        "correct": true
      },
      {
        "key": "D",
        "text": "Run az bicep build to convert JSON into Bicep.",
        "correct": false
      }
    ],
    "explanation": "C is best-effort ARM JSON to Bicep conversion and still needs review. B leaves JSON syntax unchanged. D uses the opposite compilation direction. A previews deployment changes rather than generating Bicep source.",
    "difficulty": 3
  },
  {
    "id": "az104-3-3.5-105",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.5",
    "stem": "A Bicep web app resource uses serverFarmId: plan.id, where plan is another resource declared in the same file. What does this symbolic reference normally establish?",
    "choices": [
      {
        "key": "A",
        "text": "Automatic public DNS registration for a custom domain",
        "correct": false
      },
      {
        "key": "B",
        "text": "A permanent deny assignment on the plan",
        "correct": false
      },
      {
        "key": "C",
        "text": "A requirement to use a separate deployment script for ordering",
        "correct": false
      },
      {
        "key": "D",
        "text": "An implicit dependency so the app waits for the plan deployment",
        "correct": true
      }
    ],
    "explanation": "D follows Bicep's dependency inference from a resource reference. A is a separate DNS configuration. B requires a protection mechanism not declared here. C is unnecessary because the declarative reference supplies the dependency. Use explicit dependsOn only when needed.",
    "difficulty": 3
  },
  {
    "id": "az104-3-3.1-101",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "stem": "A supported Azure VM must encrypt temporary disks and disk caches at the host, including data flowing from the host to storage. Which setting addresses this?",
    "choices": [
      {
        "key": "A",
        "text": "A resource lock on the VM",
        "correct": false
      },
      {
        "key": "B",
        "text": "Encryption at host",
        "correct": true
      },
      {
        "key": "C",
        "text": "HTTPS-only application traffic",
        "correct": false
      },
      {
        "key": "D",
        "text": "A customer-managed key for the storage account alone, with no host encryption setting",
        "correct": false
      }
    ],
    "explanation": "B covers supported host caches and temporary storage paths. C protects application transport. D is a separate storage-key configuration that does not alone enable the requested VM host protection. A controls management operations rather than encryption.",
    "difficulty": 3
  },
  {
    "id": "az104-3-3.1-102",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "stem": "A VM must move from one Azure region to another. An administrator proposes changing only its resource group. What should the administrator do instead?",
    "choices": [
      {
        "key": "A",
        "text": "Add a tag named Region to the VM.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Change only the resource group metadata location.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Use a supported regional move workflow, such as Azure Resource Mover for the VM and its dependencies.",
        "correct": true
      },
      {
        "key": "D",
        "text": "Rename the existing resource group.",
        "correct": false
      }
    ],
    "explanation": "C handles regional relocation and associated dependencies using a supported workflow. D and A only change organization or metadata. B does not move the VM's compute and disks. Check support, quotas, networking and post-move validation.",
    "difficulty": 3
  },
  {
    "id": "az104-3-3.1-103",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "stem": "A managed data disk is expanded successfully in Azure, but Windows still shows the old usable volume size. What is the next likely step?",
    "choices": [
      {
        "key": "A",
        "text": "Repeat the Azure capacity change without inspecting guest partitions.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Change the disk caching policy only.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Increase the VM CPU count without changing the partition.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Extend the partition/filesystem in the guest using supported disk-management tools.",
        "correct": true
      }
    ],
    "explanation": "D exposes the expanded capacity to the guest volume. A repeats the completed platform operation but leaves the partition unchanged. B controls caching. C changes compute size. Verify filesystem support and backups before extending.",
    "difficulty": 3
  },
  {
    "id": "az104-3-3.4-101",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.4",
    "stem": "A web app owner wants www.example.com to resolve to an App Service hostname and prove domain ownership. Which external DNS records are typically used for this subdomain mapping?",
    "choices": [
      {
        "key": "A",
        "text": "An NSG rule named www.example.com",
        "correct": false
      },
      {
        "key": "B",
        "text": "A CNAME for www to the app hostname and the required asuid.www TXT verification record",
        "correct": true
      },
      {
        "key": "C",
        "text": "An MX record and an SPF TXT record only",
        "correct": false
      },
      {
        "key": "D",
        "text": "A PTR record for the app private address only",
        "correct": false
      }
    ],
    "explanation": "B provides the subdomain mapping and domain-verification value requested by App Service. C configures mail rather than web routing/ownership. D is reverse DNS rather than the required forward mapping. A is not DNS. Add the validated hostname in App Service and configure TLS separately.",
    "difficulty": 3
  }
];

export const AZ104_D3_FLASHCARDS: Flashcard[] = [
  {
    "id": "az104-fc-3-001",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.2",
    "front": "What do fault domains and update domains in an availability set each protect against?",
    "back": "Fault domains: unplanned hardware failures (rack, power). Update domains: planned maintenance — Azure reboots one UD at a time. Up to 20 update domains on managed disks."
  },
  {
    "id": "az104-fc-3-002",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.4",
    "front": "Scale up vs. scale out in App Service — what is the difference?",
    "back": "Scale up = bigger pricing tier (more CPU/RAM per instance). Scale out = more instances of the same size, manual or via autoscale rules."
  },
  {
    "id": "az104-fc-3-003",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "front": "Which disk types offer independently configurable IOPS and throughput, and which supports more than 80,000 IOPS per disk?",
    "back": "Premium SSD v2 and Ultra Disks offer independent performance settings subject to capacity and VM limits. Premium SSD v2 supports up to 80,000 IOPS; Ultra supports higher provisioned IOPS. Both are data-disk types, not OS disks."
  },
  {
    "id": "az104-fc-3-004",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "front": "What is safe to store on the Azure temporary disk (D:)?",
    "back": "Use local temporary storage only for recoverable scratch data, paging or swap. A normal successful restart usually preserves it, but maintenance, redeploy or deallocation can lose it. Never rely on it for durable application data."
  },
  {
    "id": "az104-fc-3-005",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.3",
    "front": "What is an ACI container group?",
    "back": "One or more containers deployed as a unit: co-scheduled on the same host, sharing a lifecycle, local network, and storage volumes."
  },
  {
    "id": "az104-fc-3-006",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.3",
    "front": "Name the three ACI restart policies and when to use each.",
    "back": "Always (default) — long-running services. Never — one-time tasks like migrations. OnFailure — batch jobs that should retry only on errors."
  },
  {
    "id": "az104-fc-3-007",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.3",
    "front": "What does KEDA provide for Azure Container Apps?",
    "back": "Kubernetes Event-Driven Autoscaling: scales replicas on events (queue length, HTTP traffic, timers) and can scale all the way to zero."
  },
  {
    "id": "az104-fc-3-008",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.4",
    "front": "What happens during an App Service deployment slot swap?",
    "back": "App Service warms the source slot and switches routing with the target. Slot-specific settings stay associated with their slot after completion. A swap-back reverses code routing, not external database changes; plan for warm-up and session behavior."
  },
  {
    "id": "az104-fc-3-009",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "front": "When must you deallocate (not just stop) a VM before resizing it?",
    "back": "When the new size requires different underlying hardware. Deallocate releases the host lease so Azure can place the VM on new hardware."
  },
  {
    "id": "az104-fc-3-010",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "front": "How do Azure Spot VM evictions work?",
    "back": "Spot VMs can be evicted when Azure reclaims capacity or pricing exceeds the configured maximum. Azure provides scheduled eviction notice of at least 30 seconds. Deallocate keeps disks with ongoing storage charges; restart is subject to capacity. Delete removes the VM under its deletion settings."
  },
  {
    "id": "az104-fc-3-011",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.2",
    "front": "Zonal vs. zone-redundant deployment — what is the difference?",
    "back": "A zonal resource is placed in a selected availability zone. A zone-redundant service distributes its supported infrastructure across zones. For an application built from zonal VMs, configure load balancing, healthy capacity and resilient data dependencies; merely spreading VMs does not implement failover."
  },
  {
    "id": "az104-fc-3-012",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.4",
    "front": "What are sticky (slot-specific) app settings in App Service?",
    "back": "Settings marked 'deployment slot setting' stay with their slot during swaps — e.g., staging keeps its own test database connection string."
  }
];

export const AZ104_D3_PERF_QUESTIONS: PerfQuestion[] = [
  {
    "id": "az104-pbq-3-001",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.1",
    "type": "drag-match",
    "prompt": "Match each Azure VM series to the workload it is designed for.",
    "leftLabel": "VM series",
    "rightLabel": "Best-fit workload",
    "pairs": [
      {
        "left": "B-series",
        "right": "Burstable dev/test workloads with variable CPU that earn credits when idle"
      },
      {
        "left": "D-series",
        "right": "General-purpose VMs with a balanced CPU-to-memory ratio"
      },
      {
        "left": "E-series",
        "right": "Memory-optimized workloads such as databases and in-memory caches"
      },
      {
        "left": "F-series",
        "right": "Compute-optimized workloads needing a high CPU-to-memory ratio"
      },
      {
        "left": "N-series",
        "right": "GPU-accelerated workloads such as ML training and rendering"
      }
    ],
    "explanation": "B = burstable credits for spiky low-utilization loads. D = the balanced general-purpose default. E = memory-heavy (databases, caches). F = CPU-heavy batch and web front ends. N = GPUs for AI/ML and graphics rendering.",
    "difficulty": 2
  },
  {
    "id": "az104-pbq-3-002",
    "certId": "az-104",
    "domainId": "az-104:domain:3",
    "objectiveId": "az-104:obj:3.2",
    "type": "drag-match",
    "prompt": "Match each Azure compute option to the scenario it fits best.",
    "leftLabel": "Compute option",
    "rightLabel": "Scenario",
    "pairs": [
      {
        "left": "Azure Virtual Machines",
        "right": "Full OS control for lift-and-shift apps needing custom drivers or domain join"
      },
      {
        "left": "Virtual Machine Scale Sets",
        "right": "A managed VM fleet with supported autoscale and orchestration options"
      },
      {
        "left": "Azure Container Instances",
        "right": "Run a containerized task quickly with no servers or orchestrator to manage"
      },
      {
        "left": "Azure Container Apps",
        "right": "Microservices with HTTP ingress, revisions, and event-driven KEDA scaling"
      },
      {
        "left": "Azure App Service",
        "right": "Managed web hosting with staging-slot promotion on supported plans"
      },
      {
        "left": "Azure Dedicated Host",
        "right": "Compliance requirement for single-tenant physical servers"
      }
    ],
    "explanation": "VMs provide guest OS control. VMSS manages VM fleets with Uniform or Flexible orchestration. ACI runs container groups. Container Apps adds revisions, ingress and event-driven scaling. App Service hosts web apps with supported deployment-slot workflows. Dedicated Host supplies dedicated physical host capacity.",
    "difficulty": 3
  }
];

export const AZ104_D3_ACRONYMS: Acronym[] = [
  {
    "id": "az104-ac-017",
    "certId": "az-104",
    "acronym": "VMSS",
    "expansion": "Virtual Machine Scale Sets",
    "hint": "Manage and scale VM fleets with Uniform or Flexible orchestration; configure load balancing separately when needed.",
    "domainHint": 3
  },
  {
    "id": "az104-ac-018",
    "certId": "az-104",
    "acronym": "ACI",
    "expansion": "Azure Container Instances",
    "hint": "Serverless containers billed per second; deployed as container groups with Always/Never/OnFailure restart policies",
    "domainHint": 3
  },
  {
    "id": "az104-ac-019",
    "certId": "az-104",
    "acronym": "ACA",
    "expansion": "Azure Container Apps",
    "hint": "Managed microservices platform with environments, revisions, ingress, and KEDA event-driven scaling to zero",
    "domainHint": 3
  },
  {
    "id": "az104-ac-020",
    "certId": "az-104",
    "acronym": "ACR",
    "expansion": "Azure Container Registry",
    "hint": "Private Docker image registry; geo-replication and private endpoints require the Premium SKU",
    "domainHint": 3
  },
  {
    "id": "az104-ac-021",
    "certId": "az-104",
    "acronym": "ASE",
    "expansion": "App Service Environment",
    "hint": "Single-tenant App Service deployed in your VNet; what the Isolated tier runs on",
    "domainHint": 3
  },
  {
    "id": "az104-ac-022",
    "certId": "az-104",
    "acronym": "SKU",
    "expansion": "Stock Keeping Unit",
    "hint": "The pricing/size tier of an Azure resource — e.g., App Service plan tiers or ACR Basic/Standard/Premium",
    "domainHint": 3
  },
  {
    "id": "az104-ac-023",
    "certId": "az-104",
    "acronym": "DSC",
    "expansion": "Desired State Configuration",
    "hint": "Declarative configuration management delivered to VMs via the DSC extension to enforce desired state",
    "domainHint": 3
  },
  {
    "id": "az104-ac-024",
    "certId": "az-104",
    "acronym": "KEDA",
    "expansion": "Kubernetes Event-Driven Autoscaling",
    "hint": "Scales Container Apps on events like queue length — including scale-to-zero when idle",
    "domainHint": 3
  }
];

```

## content/parts/az104-d4.ts

```ts
import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";

// Original practice content. Reviewed 2026-09-25; evidence and full issue log: docs/az104-review/REPORT.md.

export const AZ104_D4_QUESTIONS: Question[] = [
  {
    "id": "az104-4-4.1-001",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "stem": "You are planning a virtual network with the address space 10.20.0.0/16. You need subnets for web servers, application servers, databases, and a future DMZ segment. Each subnet must support at least 200 hosts. Which subnet plan satisfies the requirement?",
    "choices": [
      {
        "key": "A",
        "text": "Four /28 subnets",
        "correct": false
      },
      {
        "key": "B",
        "text": "Four /26 subnets",
        "correct": false
      },
      {
        "key": "C",
        "text": "Four /24 subnets",
        "correct": true
      },
      {
        "key": "D",
        "text": "One /22 subnet",
        "correct": false
      }
    ],
    "explanation": "C is correct: a /24 subnet has 256 addresses, minus 5 Azure-reserved addresses leaves 251 usable hosts, which satisfies the 200-host requirement with room to grow. B loses: a /26 has 64 addresses (59 usable), far short of 200. D loses: a single /22 cannot be split into four functional segments without further subnetting, so it fails the segmentation requirement. A loses: a /28 has 16 addresses (11 usable), far short of 200.",
    "difficulty": 2
  },
  {
    "id": "az104-4-4.1-002",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "stem": "You create a subnet with the address range 172.16.4.0/27. How many IP addresses in this subnet are available for assignment to virtual machines?",
    "choices": [
      {
        "key": "A",
        "text": "30",
        "correct": false
      },
      {
        "key": "B",
        "text": "32",
        "correct": false
      },
      {
        "key": "C",
        "text": "31",
        "correct": false
      },
      {
        "key": "D",
        "text": "27",
        "correct": true
      }
    ],
    "explanation": "D is correct: a /27 subnet contains 32 addresses total. Azure reserves the first four and the last one of every subnet (network ID, default gateway, DNS mappings, and broadcast), leaving 32 − 5 = 27 usable addresses. B loses: 32 is the total count before reservations. C loses: it subtracts only the network ID, ignoring the other four reserved addresses. A loses: 30 would be correct only if Azure reserved just two addresses, which it does not.",
    "difficulty": 2
  },
  {
    "id": "az104-4-4.1-003",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "stem": "You are deploying a new VpnGw2AZ VPN gateway. Which subnet configuration meets its gateway-subnet requirements?",
    "choices": [
      {
        "key": "A",
        "text": "A subnet named GatewaySubnet with a /29 address range",
        "correct": false
      },
      {
        "key": "B",
        "text": "Any subnet of at least /27, associated with an NSG that allows UDP 500",
        "correct": false
      },
      {
        "key": "C",
        "text": "A subnet named VPN-Subnet with a /28 address range",
        "correct": false
      },
      {
        "key": "D",
        "text": "A subnet named GatewaySubnet with a /27 address range",
        "correct": true
      }
    ],
    "explanation": "D uses the required GatewaySubnet name and a /27 range; use /27 or a larger address block for non-Basic gateway SKUs. C has the wrong name. A is too small for this SKU. B has an arbitrary name and an NSG; NSGs on GatewaySubnet are unsupported and can disrupt gateway traffic. Basic has different legacy sizing considerations.",
    "difficulty": 2
  },
  {
    "id": "az104-4-4.1-004",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "stem": "A database VM NIC must be allocated the specific unused private address 10.20.2.10 in its Azure subnet. How should the administrator reserve that exact address?",
    "choices": [
      {
        "key": "A",
        "text": "Set 10.20.2.10 only inside the guest OS.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Leave the Azure NIC allocation Dynamic and assume Azure chooses 10.20.2.10.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Set the NIC IP configuration to Static with 10.20.2.10 in Azure.",
        "correct": true
      },
      {
        "key": "D",
        "text": "Attach a static public IP resource to the NIC.",
        "correct": false
      }
    ],
    "explanation": "C explicitly allocates the chosen private address through Azure IP management. A does not reserve it in Azure and risks connectivity problems. B lets Azure choose, so it does not guarantee that specific address. D concerns public addressing. Dynamic ARM private addresses are normally retained through stop/deallocate while the NIC IP configuration remains.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.1-005",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "stem": "Your company policy requires that traffic from VMs to an Azure SQL Database must never traverse the public internet, and the database must not have a public endpoint reachable at all. Which solution meets both requirements?",
    "choices": [
      {
        "key": "A",
        "text": "Regional VNet integration on the SQL server",
        "correct": false
      },
      {
        "key": "B",
        "text": "An NSG rule denying outbound traffic to Internet on the VM subnet",
        "correct": false
      },
      {
        "key": "C",
        "text": "A service endpoint for Microsoft.Sql on the VM subnet",
        "correct": false
      },
      {
        "key": "D",
        "text": "Create a SQL private endpoint, configure private DNS, and disable public network access on the SQL server.",
        "correct": true
      }
    ],
    "explanation": "D combines private connectivity, name resolution and the separate public-access control. C uses the SQL public endpoint over the Azure backbone and cannot meet disabled public-network access. A names an App Service outbound integration feature rather than the SQL Database private endpoint configuration. B filters VM egress but does not disable the SQL server's public endpoint.",
    "difficulty": 4
  },
  {
    "id": "az104-4-4.1-006",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "stem": "You enable regional VNet integration for an Azure App Service web app so it can reach a database in a virtual network. Which statement about the integration subnet is true?",
    "choices": [
      {
        "key": "A",
        "text": "The subnet can be shared with virtual machines as long as it is at least a /26",
        "correct": false
      },
      {
        "key": "B",
        "text": "The subnet must be named GatewaySubnet",
        "correct": false
      },
      {
        "key": "C",
        "text": "The subnet requires a service endpoint for Microsoft.Web",
        "correct": false
      },
      {
        "key": "D",
        "text": "The subnet must be delegated to Microsoft.Web/serverFarms and cannot contain other resource types",
        "correct": true
      }
    ],
    "explanation": "D requires the Microsoft.Web/serverFarms delegation and excludes unrelated resources such as VM NICs. Supported App Service plans may share an integration subnet under the documented limits. A incorrectly permits VM NICs in it. B uses the gateway-only subnet name. C confuses outbound VNet integration with a service endpoint.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.2-001",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "stem": "VNet-A is peered with VNet-B, and B with VNet-C. Their address ranges do not overlap. There is no transit gateway or routing appliance, and adding one is not desired. Which change directly connects A and C?",
    "choices": [
      {
        "key": "A",
        "text": "Create a direct peering between VNet-A and VNet-C",
        "correct": true
      },
      {
        "key": "B",
        "text": "Add a user-defined route in VNet-A pointing to the VPN gateway in VNet-B",
        "correct": false
      },
      {
        "key": "C",
        "text": "Nothing; routing between A and C is automatic through B",
        "correct": false
      },
      {
        "key": "D",
        "text": "Enable 'Allow forwarded traffic' on the A-B peering only",
        "correct": false
      }
    ],
    "explanation": "A adds direct peering between the two VNets. C assumes transit that peering alone does not provide. D permits already-forwarded traffic but creates no router. B points at an unstated gateway and omits the required transit design. In other architectures, a properly configured routing appliance or supported gateway topology can provide transit.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.2-002",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "stem": "You have a hub-and-spoke topology. The hub VNet has a VPN gateway connected to on-premises. You want spoke VNets to use the hub's gateway for on-premises connectivity without deploying a gateway in each spoke. What must you configure on the peering?",
    "choices": [
      {
        "key": "A",
        "text": "Enable 'Allow gateway transit' on both sides of the peering",
        "correct": false
      },
      {
        "key": "B",
        "text": "Deploy a second VPN gateway in the spoke VNet",
        "correct": false
      },
      {
        "key": "C",
        "text": "Enable 'Use remote gateways' on the hub-to-spoke peering",
        "correct": false
      },
      {
        "key": "D",
        "text": "Enable 'Allow gateway transit' on the hub-side peering and 'Use remote gateways' on the spoke-side peering",
        "correct": true
      }
    ],
    "explanation": "D is correct: gateway transit is a two-sided setting — the hub peering must allow gateway transit, and the spoke peering must opt in with 'use remote gateways'. C loses: 'use remote gateways' is set on the spoke side (the VNet without the gateway), and the hub side still needs 'allow gateway transit'. A loses: 'allow gateway transit' on the spoke side does nothing since the spoke has no gateway to share. B loses: the whole point of gateway transit is to avoid deploying a gateway per spoke.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.2-003",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "stem": "You attempt to peer VNet-Prod (10.1.0.0/16) with VNet-Test (10.1.0.0/16). The peering creation fails. What is the most likely cause?",
    "choices": [
      {
        "key": "A",
        "text": "The VNets have overlapping address spaces",
        "correct": true
      },
      {
        "key": "B",
        "text": "Peering requires a VPN gateway in each VNet",
        "correct": false
      },
      {
        "key": "C",
        "text": "The VNets must be in the same resource group",
        "correct": false
      },
      {
        "key": "D",
        "text": "The VNets are in different Azure regions",
        "correct": false
      }
    ],
    "explanation": "A is correct: peered VNets must have non-overlapping address spaces — Azure cannot route between two VNets that both claim 10.1.0.0/16. D loses: global VNet peering supports peering across regions. B loses: peering works without any gateway. C loses: peered VNets can live in different resource groups, subscriptions, and tenants.",
    "difficulty": 2
  },
  {
    "id": "az104-4-4.2-004",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "stem": "For a new deployment, you need a zone-redundant VPN gateway SKU with the documented aggregate throughput benchmark of 10 Gbps and active-active support. Which listed SKU/generation fits? Treat the benchmark as a sizing reference, not guaranteed tunnel throughput.",
    "choices": [
      {
        "key": "A",
        "text": "VpnGw5AZ, Generation 2",
        "correct": true
      },
      {
        "key": "B",
        "text": "VpnGw4AZ, Generation 2",
        "correct": false
      },
      {
        "key": "C",
        "text": "VpnGw2AZ, Generation 1",
        "correct": false
      },
      {
        "key": "D",
        "text": "VpnGw3AZ, Generation 2",
        "correct": false
      }
    ],
    "explanation": "A is listed at a 10 Gbps aggregate benchmark and supports availability-zone deployment and active-active configuration. C is listed at 1 Gbps. D is listed at 2.5 Gbps. B is listed at 5 Gbps. Actual throughput depends on traffic mix, algorithms and tunnel configuration.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.2-005",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "stem": "Match each connectivity need to the correct VPN connection type: (1) branch office to Azure over IPsec, (2) a remote laptop to Azure, (3) encrypted traffic between two Azure VNets.",
    "choices": [
      {
        "key": "A",
        "text": "(1) Point-to-Site, (2) Site-to-Site, (3) VNet-to-VNet",
        "correct": false
      },
      {
        "key": "B",
        "text": "(1) Site-to-Site, (2) Point-to-Site, (3) VNet-to-VNet",
        "correct": true
      },
      {
        "key": "C",
        "text": "(1) VNet-to-VNet, (2) Site-to-Site, (3) Point-to-Site",
        "correct": false
      },
      {
        "key": "D",
        "text": "(1) ExpressRoute, (2) VNet-to-VNet, (3) Site-to-Site",
        "correct": false
      }
    ],
    "explanation": "B is correct: Site-to-Site connects an on-premises network (branch office VPN device) to Azure over IPsec/IKE; Point-to-Site connects individual clients (laptops) via VPN client; VNet-to-VNet connects two Azure VNets through their gateways. A loses: it swaps the first two — a branch office uses Site-to-Site, not Point-to-Site. C loses: every mapping is wrong. D loses: ExpressRoute is a private circuit, not a VPN connection type, and VNet-to-VNet is for VNet pairs, not laptops.",
    "difficulty": 2
  },
  {
    "id": "az104-4-4.2-006",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "stem": "Your company has two ExpressRoute circuits in different regions and needs the two on-premises sites behind them to communicate with each other through Microsoft's network, without traffic going over the public internet. Which feature do you enable?",
    "choices": [
      {
        "key": "A",
        "text": "Microsoft peering on both circuits",
        "correct": false
      },
      {
        "key": "B",
        "text": "ExpressRoute Global Reach",
        "correct": true
      },
      {
        "key": "C",
        "text": "Private peering with gateway transit",
        "correct": false
      },
      {
        "key": "D",
        "text": "A Site-to-Site VPN between the two circuits",
        "correct": false
      }
    ],
    "explanation": "B is correct: ExpressRoute Global Reach links two ExpressRoute circuits so on-premises networks behind each circuit can talk to each other across Microsoft's backbone. A loses: Microsoft peering provides access to Microsoft 365/Dynamics public services, not site-to-site connectivity between circuits. C loses: private peering connects one on-premises site to its Azure VNets; it does not bridge two circuits. D loses: VPN connection types apply to VPN gateways, not to joining ExpressRoute circuits.",
    "difficulty": 4
  },
  {
    "id": "az104-4-4.3-001",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.3",
    "stem": "An NSG has Rule1 at priority 100 allowing TCP 443 from 10.0.0.0/24 and Rule2 at priority 200 denying TCP 443 from 10.0.1.5. No other custom rules apply. A new inbound connection to TCP 443 comes from 10.0.1.5. What happens?",
    "choices": [
      {
        "key": "A",
        "text": "Denied: Rule1 does not match that source, and Rule2 is the first matching rule.",
        "correct": true
      },
      {
        "key": "B",
        "text": "Allowed: the first rule is applied even when its source does not match.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Denied: any deny rule overrides all allows regardless of priority.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Allowed: Rule1 matches 10.0.1.5.",
        "correct": false
      }
    ],
    "explanation": "A is correct: 10.0.0.0/24 covers 10.0.0.0 through 10.0.0.255, excluding 10.0.1.5. Rule1 is skipped and Rule2 denies. D has incorrect subnet math. B ignores matching conditions. C invents deny-always-wins behavior; NSGs use the first matching rule in ascending priority order.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.3-002",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.3",
    "stem": "You associate a brand-new NSG with no custom rules to a subnet. Which traffic is permitted by default?",
    "choices": [
      {
        "key": "A",
        "text": "All inbound and all outbound traffic",
        "correct": false
      },
      {
        "key": "B",
        "text": "Inbound from VirtualNetwork and AzureLoadBalancer; outbound to VirtualNetwork and Internet, followed by catch-all denies.",
        "correct": true
      },
      {
        "key": "C",
        "text": "No traffic in either direction",
        "correct": false
      },
      {
        "key": "D",
        "text": "Only inbound traffic from the internet on port 443",
        "correct": false
      }
    ],
    "explanation": "B lists the default service-tag allow rules followed by DenyAll rules. A wrongly allows arbitrary inbound traffic. C ignores default allows. D invents an inbound HTTPS rule. NSGs filter traffic; routing, public access and an explicit outbound connectivity method may still be needed even when an NSG allows a flow.",
    "difficulty": 2
  },
  {
    "id": "az104-4-4.3-003",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.3",
    "stem": "A subnet has an NSG that allows inbound TCP 3389 from the corporate office range. A VM's NIC in that subnet has an NSG that denies inbound TCP 3389 from everywhere. Can an admin RDP to the VM from the corporate office?",
    "choices": [
      {
        "key": "A",
        "text": "No: the new connection must be permitted by both NSGs, and the NIC NSG denies it.",
        "correct": true
      },
      {
        "key": "B",
        "text": "No, because NIC-level NSGs override subnet-level NSGs entirely",
        "correct": false
      },
      {
        "key": "C",
        "text": "Yes, because the subnet NSG takes precedence over the NIC NSG",
        "correct": false
      },
      {
        "key": "D",
        "text": "Yes, because an allow at either level permits the traffic",
        "correct": false
      }
    ],
    "explanation": "A is correct for a new flow: inbound traffic passes the subnet NSG and then the NIC NSG, and both must allow it. C wrongly gives subnet rules precedence. D wrongly treats either allow as sufficient. B wrongly discards the subnet NSG. Each NSG still uses its own first-match priority evaluation; rules are not merged into one priority list.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.3-004",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.3",
    "stem": "You manage 40 web servers and 25 database servers in the same VNet. You want NSG rules that apply to 'all web servers' and 'all database servers' without updating rules every time a VM is added or removed. What should you use?",
    "choices": [
      {
        "key": "A",
        "text": "Service tags named Web and Database",
        "correct": false
      },
      {
        "key": "B",
        "text": "Azure Firewall application rules with FQDNs",
        "correct": false
      },
      {
        "key": "C",
        "text": "Static lists of all current server IP addresses in each NSG rule",
        "correct": false
      },
      {
        "key": "D",
        "text": "Application security groups (ASGs), referenced as the source/destination in NSG rules",
        "correct": true
      }
    ],
    "explanation": "D lets rules reference logical groups of NICs; maintain membership as servers change. C works only by editing address lists as membership changes, contrary to the goal. A cannot create custom service tags named for server roles. B configures firewall application traffic, not reusable ASG membership in NSGs.",
    "difficulty": 2
  },
  {
    "id": "az104-4-4.3-005",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.3",
    "stem": "An Azure Firewall must port-forward inbound RDP traffic to a specific VM, allow outbound traffic to 10.5.0.0/16 on port 1433, and allow outbound HTTPS only to *.contoso.com. Which rule types, in processing order, do you configure?",
    "choices": [
      {
        "key": "A",
        "text": "All three in a single network rule collection",
        "correct": false
      },
      {
        "key": "B",
        "text": "Application rule, then network rule, then DNAT rule",
        "correct": false
      },
      {
        "key": "C",
        "text": "DNAT rule, then network rule, then application rule",
        "correct": true
      },
      {
        "key": "D",
        "text": "Network rule, then DNAT rule, then application rule",
        "correct": false
      }
    ],
    "explanation": "C is correct: Azure Firewall processes DNAT rules first (inbound port forwarding), then network rules (IP/protocol/port filtering like the 1433 rule), then application rules (FQDN-based filtering like *.contoso.com). B loses: the order is reversed — application rules are evaluated last, not first. D loses: DNAT is evaluated before network rules, not after. A loses: DNAT, network, and application rules are separate rule types and cannot be merged into one network rule.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.3-006",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.3",
    "stem": "Your security team forbids exposing RDP and SSH ports on any VM's public IP, but admins still need graphical and SSH console access to VMs over TLS through the Azure portal. Which service meets this requirement?",
    "choices": [
      {
        "key": "A",
        "text": "Azure Firewall DNAT rules for ports 3389 and 22",
        "correct": false
      },
      {
        "key": "B",
        "text": "An NSG allowing 3389/22 from the admin's home IP",
        "correct": false
      },
      {
        "key": "C",
        "text": "Azure Bastion",
        "correct": true
      },
      {
        "key": "D",
        "text": "A Site-to-Site VPN gateway",
        "correct": false
      }
    ],
    "explanation": "C is correct: Azure Bastion provides RDP/SSH access to VMs directly in the portal over TLS/HTTPS with no public IP needed on the VMs. D loses: a VPN gives network connectivity but still requires RDP/SSH clients and network paths — it doesn't provide portal-based TLS console access. A loses: DNAT rules would publish RDP/SSH to the internet, exactly what the policy forbids. B loses: this still exposes the ports publicly (even if IP-restricted) and requires the VM to have a public IP.",
    "difficulty": 2
  },
  {
    "id": "az104-4-4.4-001",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "stem": "Which Azure Load Balancer SKU family supports zone-redundant frontends, outbound rules on public load balancers, and HA ports on internal load balancers?",
    "choices": [
      {
        "key": "A",
        "text": "Standard",
        "correct": true
      },
      {
        "key": "B",
        "text": "Gateway",
        "correct": false
      },
      {
        "key": "C",
        "text": "Standard with a Basic public IP",
        "correct": false
      },
      {
        "key": "D",
        "text": "The retired Basic SKU",
        "correct": false
      }
    ],
    "explanation": "A provides those capabilities in their supported public/internal configurations. D is retired and did not provide them. B serves network-appliance chaining, not this general load-balancing feature set. C cannot attach a Basic public IP to a Standard load balancer. Do not assume HA ports and public outbound rules belong on the same frontend.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.4-002",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "stem": "Application VMs must be served through a private load-balancer frontend reachable from permitted peered VNets. New flows must avoid an unhealthy backend. Which configuration fits?",
    "choices": [
      {
        "key": "A",
        "text": "Internal Standard load balancer with a private frontend, an appropriate health probe, and network rules allowing only intended clients",
        "correct": true
      },
      {
        "key": "B",
        "text": "Internal frontend with all backends assumed healthy and no probe",
        "correct": false
      },
      {
        "key": "C",
        "text": "Public frontend with DNS name resolution disabled",
        "correct": false
      },
      {
        "key": "D",
        "text": "Public frontend with no health monitoring",
        "correct": false
      }
    ],
    "explanation": "A supplies private addressing, backend health detection and the required access restrictions. D and C still expose a public frontend. B cannot detect the described backend failure. A private frontend is reachable over connected private networks according to routing and security rules; it does not itself authorize only specific peers.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.4-003",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "stem": "On an Azure Load Balancer you need to (1) distribute inbound port-443 traffic across three web VMs and (2) let an admin RDP directly to web VM #2 through the load balancer's public IP. Which configuration achieves this?",
    "choices": [
      {
        "key": "A",
        "text": "A single HA ports rule covering both scenarios",
        "correct": false
      },
      {
        "key": "B",
        "text": "Two load-balancing rules: one for port 443 and one for port 3389",
        "correct": false
      },
      {
        "key": "C",
        "text": "A load-balancing rule for port 443 and an inbound NAT rule mapping a frontend port to VM #2's port 3389",
        "correct": true
      },
      {
        "key": "D",
        "text": "An inbound NAT rule for port 443 and a load-balancing rule for port 3389",
        "correct": false
      }
    ],
    "explanation": "C is correct: load-balancing rules distribute traffic across the backend pool (the three web VMs), while inbound NAT rules forward a specific frontend port to one specific backend VM (admin RDP to VM #2). B loses: a load-balancing rule for 3389 would spray RDP across all three VMs instead of targeting VM #2. D loses: it reverses the two — 443 needs distribution, 3389 needs targeting. A loses: an HA ports rule distributes all traffic across the pool; it cannot pin traffic to a single VM.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.4-004",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "stem": "A fleet of private VMs needs outbound HTTPS through one predictable public IP, without public IPs on individual NICs. The existing shared outbound path suffers SNAT exhaustion. Which design best fits?",
    "choices": [
      {
        "key": "A",
        "text": "Create an inbound NAT rule on a load balancer.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Associate a NAT gateway and a public IP with the subnet.",
        "correct": true
      },
      {
        "key": "C",
        "text": "Increase every VM size without changing network configuration.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Assign a separate public IP to every VM NIC.",
        "correct": false
      }
    ],
    "explanation": "B provides explicit subnet outbound connectivity and a shared source IP with a larger dynamically allocated SNAT pool (64,512 ports per public IP for Standard NAT Gateway). Monitor connection/port limits; no finite pool guarantees unlimited connections. D violates the NIC constraint. A handles inbound mappings. C does not change the outbound SNAT allocation.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.4-005",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "stem": "A regional VNet-hosted web application requires URL-path routing, TLS termination and a web application firewall on its regional reverse proxy. Which listed service fits?",
    "choices": [
      {
        "key": "A",
        "text": "NAT Gateway",
        "correct": false
      },
      {
        "key": "B",
        "text": "Application Gateway with a WAF-capable SKU",
        "correct": true
      },
      {
        "key": "C",
        "text": "Azure Load Balancer, because it supports Layer 7 path rules in the Standard SKU",
        "correct": false
      },
      {
        "key": "D",
        "text": "Traffic Manager, because it terminates TLS at the edge",
        "correct": false
      }
    ],
    "explanation": "B provides the regional Layer 7 reverse proxy with supported WAF functionality. C is a Layer 4 TCP/UDP load balancer and cannot inspect HTTP paths. D uses DNS to direct clients and does not terminate TLS. A performs outbound source NAT and provides neither inbound HTTP routing nor WAF.",
    "difficulty": 4
  },
  {
    "id": "az104-4-4.4-006",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "stem": "You create a private DNS zone named corp.internal and link it to VNet-A with auto-registration enabled. VNet-B is peered with VNet-A but is NOT linked to the zone. Both VNets use Azure-provided DNS with no custom DNS forwarding or Private Resolver. A VM in VNet-B queries web01.corp.internal. What happens?",
    "choices": [
      {
        "key": "A",
        "text": "The name resolves via Azure's default public DNS",
        "correct": false
      },
      {
        "key": "B",
        "text": "The name resolves, because peering automatically shares linked private DNS zones",
        "correct": false
      },
      {
        "key": "C",
        "text": "The name resolves only if VNet-B is also linked to the private DNS zone",
        "correct": true
      },
      {
        "key": "D",
        "text": "The name resolves because auto-registration covers all peered VNets",
        "correct": false
      }
    ],
    "explanation": "C is correct under this DNS configuration: link C to the private zone for its Azure-provided DNS resolution. B wrongly assumes peering inherits DNS links. D confuses VM record registration with DNS resolution access. A incorrectly publishes the private zone. A separate custom resolver/forwarding design could provide another resolution path.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.1-101",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "stem": "A subnet route table contains 0.0.0.0/0 to a virtual appliance and 10.50.0.0/16 to another valid next hop. A packet is destined for 10.50.2.7. Which matching prefix is selected first by Azure route selection?",
    "choices": [
      {
        "key": "A",
        "text": "0.0.0.0/0 because it was entered first",
        "correct": false
      },
      {
        "key": "B",
        "text": "10.50.0.0/16 because it is the longest matching prefix",
        "correct": true
      },
      {
        "key": "C",
        "text": "Both routes in round-robin order",
        "correct": false
      },
      {
        "key": "D",
        "text": "Neither, because overlapping route prefixes are invalid",
        "correct": false
      }
    ],
    "explanation": "B applies longest-prefix match. A incorrectly uses creation order. C assumes multipath distribution between different prefix lengths. D mistakes valid route-prefix overlap for invalid address-space overlap. Equal-prefix route source preferences are a separate decision.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.1-102",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "stem": "A user-defined route sends packets to a network virtual appliance VM. Routes and NSGs are correct, but transit packets do not forward. Which configuration must be checked on the appliance?",
    "choices": [
      {
        "key": "A",
        "text": "Only an NSG allow rule, while NIC IP forwarding remains disabled",
        "correct": false
      },
      {
        "key": "B",
        "text": "Only IP forwarding in the guest, while NIC forwarding remains disabled",
        "correct": false
      },
      {
        "key": "C",
        "text": "Only Azure NIC IP forwarding, with guest routing disabled",
        "correct": false
      },
      {
        "key": "D",
        "text": "IP forwarding enabled on the Azure NIC and appropriate routing/forwarding in its guest OS",
        "correct": true
      }
    ],
    "explanation": "D supplies both forwarding layers. A permits packets but does not enable transit. B leaves the Azure NIC restriction in place. C leaves the guest unable to forward. Routing and NSG permission alone do not make a VM a router.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.1-103",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "stem": "A new public Standard Load Balancer needs an IPv4 frontend public IP resource. Which listed choice is compatible?",
    "choices": [
      {
        "key": "A",
        "text": "A Standard static public IP",
        "correct": true
      },
      {
        "key": "B",
        "text": "An Azure private DNS A record only",
        "correct": false
      },
      {
        "key": "C",
        "text": "A NIC private IP configuration without a public IP resource",
        "correct": false
      },
      {
        "key": "D",
        "text": "A Basic dynamic public IP",
        "correct": false
      }
    ],
    "explanation": "A matches the Standard public frontend requirement and static allocation. D uses the retired incompatible Basic public IP SKU. B creates a name record, not a frontend public IP. C describes private addressing, not the requested public frontend.",
    "difficulty": 2
  },
  {
    "id": "az104-4-4.4-101",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "stem": "You create a public Azure DNS zone for example.com. The domain remains registered elsewhere. What makes the internet use Azure DNS as its authoritative host?",
    "choices": [
      {
        "key": "A",
        "text": "Enable private-zone auto-registration.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Create an NSG inbound rule for port 53 on every VM.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Move every web server into the DNS zone resource group.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Set the registrar delegation to the name servers assigned to the Azure DNS zone.",
        "correct": true
      }
    ],
    "explanation": "D delegates authority through the parent/registrar configuration. A is for private DNS VM registration. B changes VM traffic filtering, not public zone delegation. C changes resource organization. Creating a hosted zone alone does not update registrar delegation.",
    "difficulty": 3
  },
  {
    "id": "az104-4-4.4-102",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "stem": "An Azure public DNS zone needs app.example.com to point to the hostname service.example.net, not a fixed IP address. Which record type fits the app subdomain?",
    "choices": [
      {
        "key": "A",
        "text": "AAAA",
        "correct": false
      },
      {
        "key": "B",
        "text": "CNAME",
        "correct": true
      },
      {
        "key": "C",
        "text": "MX",
        "correct": false
      },
      {
        "key": "D",
        "text": "A",
        "correct": false
      }
    ],
    "explanation": "B aliases the subdomain to another hostname. D stores an IPv4 address. A stores an IPv6 address. C identifies mail exchangers. This question uses a subdomain; a zone apex has additional CNAME restrictions.",
    "difficulty": 2
  },
  {
    "id": "az104-4-4.4-103",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "stem": "A Standard Load Balancer TCP probe marks a VM unhealthy. Its backend service listens on the probe port, but a custom NSG rule denies the AzureLoadBalancer service tag before the default probe allow rule. What should you change?",
    "choices": [
      {
        "key": "A",
        "text": "Open only the client port while leaving the probe source denied.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Change the frontend DNS name without changing the NSG.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Permit the probe traffic with an appropriate higher-precedence NSG rule.",
        "correct": true
      },
      {
        "key": "D",
        "text": "Permit probes only in a lower-precedence rule after the matching deny.",
        "correct": false
      }
    ],
    "explanation": "C lets the probe reach the listener. D is never reached after the matching deny. A fails to fix the blocked health-check flow. B changes name resolution rather than filtering. Also verify the actual probe port and guest firewall.",
    "difficulty": 3
  }
];

export const AZ104_D4_FLASHCARDS: Flashcard[] = [
  {
    "id": "az104-fc-4-001",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "front": "How many IP addresses does Azure reserve in every subnet, and which ones?",
    "back": "Five: the first four addresses (network ID, default gateway, and two DNS-mapped addresses) and the last address (broadcast). A /24 subnet therefore offers 251 usable addresses."
  },
  {
    "id": "az104-fc-4-002",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "front": "What are the naming and sizing requirements for a gateway subnet, and what must you NOT attach to it?",
    "back": "The subnet name is GatewaySubnet. Use /27 or a larger address block for non-Basic VPN gateway SKUs; Basic has different legacy sizing support. Do not attach an NSG to GatewaySubnet."
  },
  {
    "id": "az104-fc-4-003",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.1",
    "front": "Service endpoint vs. private endpoint: what is the key difference?",
    "back": "Service endpoints identify an allowed subnet to a service public endpoint over Azure networking. Private endpoints provide a private IP for a supported service connection; configure DNS and separately disable/restrict public network access for private-only service access."
  },
  {
    "id": "az104-fc-4-004",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "front": "Is VNet peering transitive? What does that imply for a hub-and-spoke design?",
    "back": "No — peering is non-transitive. Spoke VNets cannot reach each other through the hub by peering alone; you need a hub gateway/NVA with gateway transit (or direct spoke-to-spoke peerings)."
  },
  {
    "id": "az104-fc-4-005",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "front": "What two peering settings enable spoke VNets to use a hub VNet's VPN/ExpressRoute gateway?",
    "back": "On the hub-side peering: 'Allow gateway transit'. On the spoke-side peering: 'Use remote gateways'. The spoke VNet must not have its own gateway."
  },
  {
    "id": "az104-fc-4-006",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "front": "What are the two ExpressRoute peering types for, and what does Global Reach do?",
    "back": "Private peering connects on-premises to Azure VNets; Microsoft peering reaches Microsoft 365/Dynamics public services. Global Reach connects two ExpressRoute circuits so their on-premises sites communicate over Microsoft's network."
  },
  {
    "id": "az104-fc-4-007",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.3",
    "front": "How are NSG rules evaluated, and what are the default rules?",
    "back": "Within an NSG, the lowest-numbered matching priority wins. Default inbound allows VirtualNetwork and AzureLoadBalancer, then denies other traffic. Default outbound allows VirtualNetwork and Internet, then denies other traffic. These are filter rules, not a guarantee of routes or internet SNAT."
  },
  {
    "id": "az104-fc-4-008",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.3",
    "front": "When NSGs are attached to both a subnet and a NIC, how are the effective rules determined?",
    "back": "For a new flow, both subnet and NIC NSGs must allow it. Evaluate first-match priorities independently within each NSG; a matching deny in either blocks it. Inbound checks subnet then NIC; outbound checks NIC then subnet."
  },
  {
    "id": "az104-fc-4-009",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.3",
    "front": "In what order does Azure Firewall process its three rule types?",
    "back": "DNAT rules first (inbound port forwarding), then network rules (IP/protocol/port), then application rules (FQDN-based)."
  },
  {
    "id": "az104-fc-4-010",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "front": "Which current Standard Load Balancer capabilities replace common limitations of the retired Basic SKU?",
    "back": "Standard supports zone-redundant frontends, explicit outbound rules for public load balancers, and HA ports for internal load balancers. Public frontends use Standard public IPs; configure NSG permissions. Basic Load Balancer retired September 30, 2025."
  },
  {
    "id": "az104-fc-4-011",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "front": "Load-balancing rule vs. inbound NAT rule — when do you use each?",
    "back": "A load-balancing rule distributes flows among eligible backend instances, using configured health probes to exclude unhealthy backends. An inbound NAT rule forwards a frontend port to a specific backend instance/port rather than balancing that connection across the pool."
  },
  {
    "id": "az104-fc-4-012",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "front": "What is NAT Gateway for, and what must you link to a private DNS zone for each VNet to resolve it?",
    "back": "Standard NAT Gateway provides explicit subnet outbound SNAT with 64,512 ports per public IP, subject to connection limits. With Azure-provided DNS, link each VNet to the private zone it must resolve. Peering does not inherit links; custom DNS forwarding is a separate design."
  }
];

export const AZ104_D4_PERF_QUESTIONS: PerfQuestion[] = [
  {
    "id": "az104-pbq-4-001",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.4",
    "type": "drag-match",
    "prompt": "Match each networking requirement to the Azure service that best satisfies it.",
    "leftLabel": "Requirement",
    "rightLabel": "Azure service",
    "pairs": [
      {
        "left": "URL-path-based routing with TLS termination and WAF",
        "right": "Application Gateway"
      },
      {
        "left": "Distribute raw TCP/UDP traffic across VMs in a region",
        "right": "Azure Load Balancer"
      },
      {
        "left": "DNS-based global routing with priority and weighted methods",
        "right": "Traffic Manager"
      },
      {
        "left": "Global HTTP/S entry point with health-based origin routing and edge caching",
        "right": "Azure Front Door"
      },
      {
        "left": "Stateful filtering of VNet traffic with DNAT, network, and application rules",
        "right": "Azure Firewall"
      },
      {
        "left": "Scalable outbound-only internet access for a subnet",
        "right": "NAT Gateway"
      }
    ],
    "explanation": "Application Gateway is the regional Layer 7 reverse proxy (path routing, TLS, WAF). Azure Load Balancer is the regional Layer 4 distributor. Traffic Manager routes globally at the DNS layer with methods like priority, weighted, and geographic. Azure Front Door is the global Layer 7 entry point with anycast and fast failover. Azure Firewall is the managed stateful network firewall. NAT Gateway provides scalable outbound SNAT for subnets.",
    "difficulty": 4
  },
  {
    "id": "az104-pbq-4-002",
    "certId": "az-104",
    "domainId": "az-104:domain:4",
    "objectiveId": "az-104:obj:4.2",
    "type": "drag-match",
    "prompt": "Match each hybrid-connectivity concept to its correct description.",
    "leftLabel": "Concept",
    "rightLabel": "Description",
    "pairs": [
      {
        "left": "Site-to-Site VPN",
        "right": "IPsec/IKE tunnel from an on-premises VPN device to Azure"
      },
      {
        "left": "Point-to-Site VPN",
        "right": "VPN client connection from an individual device to Azure"
      },
      {
        "left": "VNet-to-VNet connection",
        "right": "Encrypted tunnel between two Azure VNets via their gateways"
      },
      {
        "left": "ExpressRoute private peering",
        "right": "Private circuit path from on-premises to Azure VNets"
      },
      {
        "left": "ExpressRoute Microsoft peering",
        "right": "ExpressRoute path to supported Microsoft public service endpoints"
      },
      {
        "left": "Active-active gateway mode",
        "right": "Two active VPN gateway instances with separate public IPs for resiliency"
      }
    ],
    "explanation": "Site-to-Site connects a site VPN device; Point-to-Site connects individual VPN clients; VNet-to-VNet uses gateway tunnels. ExpressRoute private peering reaches VNets; Microsoft peering reaches supported Microsoft public endpoints with applicable requirements. Active-active provides two gateway instances; configure both tunnels so surviving connectivity can carry traffic after a failure.",
    "difficulty": 3
  }
];

export const AZ104_D4_ACRONYMS: Acronym[] = [
  {
    "id": "az104-ac-025",
    "certId": "az-104",
    "acronym": "NSG",
    "expansion": "Network Security Group",
    "hint": "Filters traffic with priority-ordered allow/deny rules on subnets or NICs",
    "domainHint": 4
  },
  {
    "id": "az104-ac-026",
    "certId": "az-104",
    "acronym": "ASG",
    "expansion": "Application Security Group",
    "hint": "Groups VM NICs by role so NSG rules reference the group, not IPs",
    "domainHint": 4
  },
  {
    "id": "az104-ac-027",
    "certId": "az-104",
    "acronym": "VNet",
    "expansion": "Virtual Network",
    "hint": "Your isolated private network in Azure, divided into subnets",
    "domainHint": 4
  },
  {
    "id": "az104-ac-028",
    "certId": "az-104",
    "acronym": "CIDR",
    "expansion": "Classless Inter-Domain Routing",
    "hint": "The slash notation (e.g. 10.0.0.0/16) used to define address ranges",
    "domainHint": 4
  },
  {
    "id": "az104-ac-029",
    "certId": "az-104",
    "acronym": "VPN",
    "expansion": "Virtual Private Network",
    "hint": "Encrypted tunnel; Azure gateway types include Site-to-Site and Point-to-Site",
    "domainHint": 4
  },
  {
    "id": "az104-ac-030",
    "certId": "az-104",
    "acronym": "ER",
    "expansion": "ExpressRoute",
    "hint": "Private dedicated circuit to Azure; peerings: private and Microsoft",
    "domainHint": 4
  },
  {
    "id": "az104-ac-031",
    "certId": "az-104",
    "acronym": "NAT",
    "expansion": "Network Address Translation",
    "hint": "NAT Gateway gives subnets scalable outbound SNAT without per-VM public IPs",
    "domainHint": 4
  },
  {
    "id": "az104-ac-032",
    "certId": "az-104",
    "acronym": "WAF",
    "expansion": "Web Application Firewall",
    "hint": "Layer 7 protection against web attacks; built into Application Gateway and Front Door",
    "domainHint": 4
  }
];

```

## content/parts/az104-d5.ts

```ts
import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";

// Original practice content. Reviewed 2026-09-25; evidence and full issue log: docs/az104-review/REPORT.md.

export const AZ104_D5_QUESTIONS: Question[] = [
  {
    "id": "az104-5-5.1-001",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "A VM emits the native Azure Monitor Percentage CPU signal. Which data type stores this lightweight numerical time series for Metrics explorer?",
    "choices": [
      {
        "key": "A",
        "text": "Resource logs",
        "correct": false
      },
      {
        "key": "B",
        "text": "Activity logs",
        "correct": false
      },
      {
        "key": "C",
        "text": "Logs",
        "correct": false
      },
      {
        "key": "D",
        "text": "Metrics",
        "correct": true
      }
    ],
    "explanation": "D is the native metrics store for the signal. C can contain CPU samples if guest collection is configured, but is not the native platform metric store. A provides resource diagnostic events. B records management operations, such as resource creation, rather than the CPU time series.",
    "difficulty": 1
  },
  {
    "id": "az104-5-5.1-002",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "A company wants to query security and diagnostic data from multiple Azure VMs and applications with KQL in a single place. Where should this data be collected?",
    "choices": [
      {
        "key": "A",
        "text": "A Log Analytics workspace",
        "correct": true
      },
      {
        "key": "B",
        "text": "An Azure Monitor metric namespace",
        "correct": false
      },
      {
        "key": "C",
        "text": "An Azure Monitor action group",
        "correct": false
      },
      {
        "key": "D",
        "text": "A storage account's $logs container",
        "correct": false
      }
    ],
    "explanation": "A stores Azure Monitor log tables and supports KQL across ingested VM, platform and application data. B identifies metric series rather than log tables. C contains notification/automation destinations. D is a storage log container, not a Log Analytics query store. Modern workspace-based Application Insights stores its telemetry in a Log Analytics workspace.",
    "difficulty": 1
  },
  {
    "id": "az104-5-5.1-003",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "You need supported resource logs and exportable metrics sent for KQL analysis, storage retention and external stream processing. Which set of Azure diagnostic-setting destinations covers those three tasks?",
    "choices": [
      {
        "key": "A",
        "text": "Log Analytics workspace, Recovery Services vault, and Event Hubs",
        "correct": false
      },
      {
        "key": "B",
        "text": "Metrics explorer, Storage account, and Service Bus queue",
        "correct": false
      },
      {
        "key": "C",
        "text": "Log Analytics workspace, Storage account, and Event Hubs",
        "correct": true
      },
      {
        "key": "D",
        "text": "Log Analytics workspace, Storage account, and an action group",
        "correct": false
      }
    ],
    "explanation": "C provides log analysis, storage and streaming destinations. A substitutes a backup vault for a storage destination. B substitutes a viewer and Service Bus for supported routing destinations. D substitutes an alert action group for the event stream destination. Select supported categories; not every metric is exportable, and partner destinations may also be supported.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.1-004",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "You run the following KQL query against the SecurityEvent table: `SecurityEvent | where EventID == 4625 | summarize count() by Account`. What does this query return?",
    "choices": [
      {
        "key": "A",
        "text": "All security events sorted by the number of accounts",
        "correct": false
      },
      {
        "key": "B",
        "text": "Successful logon events for each account",
        "correct": false
      },
      {
        "key": "C",
        "text": "The first failed logon event for every account",
        "correct": false
      },
      {
        "key": "D",
        "text": "The total number of failed logon events, grouped by account name",
        "correct": true
      }
    ],
    "explanation": "D is correct: the filter selects Windows failed-logon event 4625 and summarize count() groups its rows by Account. A is wrong because the query neither sorts nor lists all events. B describes successful-logon event 4624. C would require selecting the earliest timestamped record per account, such as arg_min(TimeGenerated, *), not count().",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.1-005",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "Perf contains Windows CPU samples from many VMs. Which query plots hourly average total CPU for web01 over the last 24 hours?",
    "choices": [
      {
        "key": "A",
        "text": "Perf | where TimeGenerated < ago(24h) and Computer == \"web01\" | summarize avg(CounterValue) by bin(TimeGenerated, 1h) | render timechart",
        "correct": false
      },
      {
        "key": "B",
        "text": "Perf | where TimeGenerated > ago(24h) and Computer == \"web01\" and ObjectName == \"Processor\" and CounterName == \"% Processor Time\" and InstanceName == \"_Total\" | summarize avg(CounterValue) by bin(TimeGenerated, 1h) | render timechart",
        "correct": true
      },
      {
        "key": "C",
        "text": "Perf | where TimeGenerated > ago(24h) | summarize avg(CounterValue) by bin(TimeGenerated, 1h) | render timechart",
        "correct": false
      },
      {
        "key": "D",
        "text": "Perf | where Computer == \"web01\" | summarize count() by bin(TimeGenerated, 1h) | render timechart",
        "correct": false
      }
    ],
    "explanation": "B filters the VM, time range and total Processor counter before averaging into hourly bins. C blends other machines and counters. D counts samples instead of averaging CPU and has no 24-hour filter. A selects older data and mixes counters. The scenario assumes these Windows Perf counters are collected.",
    "difficulty": 3
  },
  {
    "id": "az104-5-5.1-006",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "An Analytics-plan table must retain one year of logs. Only the latest 30 days need interactive queries; older data is rarely requested and search-job latency is acceptable. Which retention design reduces the cost of retaining older data?",
    "choices": [
      {
        "key": "A",
        "text": "Set both analytics and total retention to 30 days.",
        "correct": false
      },
      {
        "key": "B",
        "text": "Keep 365 days of analytics retention.",
        "correct": false
      },
      {
        "key": "C",
        "text": "Disable ingestion after the first 30 days.",
        "correct": false
      },
      {
        "key": "D",
        "text": "Keep 30 days of analytics retention and set table total retention to 365 days.",
        "correct": true
      }
    ],
    "explanation": "D keeps recent data interactive and older data in long-term retention, accessible using search jobs. A deletes data too early. B retains the year interactively, contrary to the lower-cost design for infrequent historical access. C stops new data collection rather than retaining it. Retention settings do not recover data already purged.",
    "difficulty": 3
  },
  {
    "id": "az104-5-5.1-007",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "You want to append a new HourOfDay column to every log row while preserving all existing columns without enumerating them. No column named HourOfDay exists. Which operator is designed for this?",
    "choices": [
      {
        "key": "A",
        "text": "join",
        "correct": false
      },
      {
        "key": "B",
        "text": "extend",
        "correct": true
      },
      {
        "key": "C",
        "text": "project",
        "correct": false
      },
      {
        "key": "D",
        "text": "summarize",
        "correct": false
      }
    ],
    "explanation": "B appends the new calculated column while retaining existing columns. C selects/projects columns, so unlisted existing columns are lost. D aggregates rows rather than preserving each record. A matches tables and is unnecessary for a calculation on each row.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.2-001",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "stem": "You must alert when a VM's native Percentage CPU metric averages above 85% over a 10-minute window, without collecting guest performance logs. Which alert type directly uses that signal?",
    "choices": [
      {
        "key": "A",
        "text": "A log search alert on the Perf table",
        "correct": false
      },
      {
        "key": "B",
        "text": "An activity log alert",
        "correct": false
      },
      {
        "key": "C",
        "text": "A smart detection alert",
        "correct": false
      },
      {
        "key": "D",
        "text": "A metric alert on the Percentage CPU metric",
        "correct": true
      }
    ],
    "explanation": "D evaluates the native CPU metric using the requested aggregation/window and an appropriate evaluation frequency. A would require suitable ingested log data, excluded by the scenario. B monitors management events. C detects supported application anomalies rather than the specified VM metric threshold.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.2-002",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "stem": "A stateless log search alert must keep evaluating every five minutes with the same scope. It repeatedly notifies for the same dimension combination while the condition remains true. Which setting pauses repeat actions for a specified period without changing evaluation frequency?",
    "choices": [
      {
        "key": "A",
        "text": "A narrower alert scope",
        "correct": false
      },
      {
        "key": "B",
        "text": "A longer evaluation frequency",
        "correct": false
      },
      {
        "key": "C",
        "text": "A second action group",
        "correct": false
      },
      {
        "key": "D",
        "text": "Alert suppression (mute actions) for a defined period",
        "correct": true
      }
    ],
    "explanation": "D is the log search alert Mute actions setting: it delays subsequent actions for the configured interval. A changes monitored scope. B violates the fixed evaluation interval. C adds receivers. This is not a universal option for every alert type, and distinct split-by dimension combinations can create distinct alert instances.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.2-003",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "stem": "You need an action group that pages the on-call engineer via SMS, emails the operations team, and triggers an automated remediation runbook. Which notification/action types should the action group include?",
    "choices": [
      {
        "key": "A",
        "text": "SMS, Email, and an alert suppression rule",
        "correct": false
      },
      {
        "key": "B",
        "text": "Push notification, ITSM ticket, and a diagnostic setting",
        "correct": false
      },
      {
        "key": "C",
        "text": "Voice call only",
        "correct": false
      },
      {
        "key": "D",
        "text": "SMS and Email notifications plus an Automation Runbook action",
        "correct": true
      }
    ],
    "explanation": "D includes both requested notification channels and the direct runbook action. A suppresses actions rather than running remediation. B misses the required channels and includes a diagnostic setting, which routes telemetry. C only places a call and cannot satisfy the other two requirements.",
    "difficulty": 1
  },
  {
    "id": "az104-5-5.2-004",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "stem": "Users report they cannot reach a VM on TCP port 443 from the internet. The NSG looks correct at first glance. Which Network Watcher tool lets you test whether a packet from a specific source IP would be allowed or denied by the effective security rules?",
    "choices": [
      {
        "key": "A",
        "text": "Packet capture",
        "correct": false
      },
      {
        "key": "B",
        "text": "Connection troubleshoot",
        "correct": false
      },
      {
        "key": "C",
        "text": "Topology",
        "correct": false
      },
      {
        "key": "D",
        "text": "IP flow verify",
        "correct": true
      }
    ],
    "explanation": "IP flow verify simulates a packet (source/destination IP, port, protocol) against the VM's effective NSG rules and reports allow or deny — exactly the tool for this check. Packet capture is wrong because it records actual traffic for deep inspection, not a quick allow/deny simulation. Connection troubleshoot is wrong because it tests end-to-end connectivity (VM to VM/endpoint) with hop-by-hop diagnostics rather than simulating a single packet against rules. Topology is wrong because it only visualizes resource relationships in a VNet.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.2-005",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "stem": "A security analyst needs to inspect the actual packet contents of suspicious traffic leaving a VM over the next hour. Which Network Watcher capability should you use?",
    "choices": [
      {
        "key": "A",
        "text": "Virtual network flow logs",
        "correct": false
      },
      {
        "key": "B",
        "text": "Effective security rules view",
        "correct": false
      },
      {
        "key": "C",
        "text": "IP flow verify",
        "correct": false
      },
      {
        "key": "D",
        "text": "Packet capture",
        "correct": true
      }
    ],
    "explanation": "D captures packet data from the supported VM for inspection, subject to filters and capture limits. Encrypted application content remains encrypted. A records flow metadata, not application packet payloads. B lists effective rules without traffic content. C evaluates whether a hypothetical flow is allowed rather than recording real traffic.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.2-006",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "stem": "A current log search alert evaluates a brute-force query every 15 minutes over a 30-minute window. The query produces a stable IPAddress string dimension and a count. Each per-IP webhook alert must identify that IP using the common alert schema. Which configuration fits?",
    "choices": [
      {
        "key": "A",
        "text": "Use an activity log alert scoped to the Log Analytics workspace",
        "correct": false
      },
      {
        "key": "B",
        "text": "Use a log search alert with a 30-minute frequency and 15-minute window, and put the IPs in the alert rule name",
        "correct": false
      },
      {
        "key": "C",
        "text": "Use a log search alert with a 15-minute frequency, 30-minute window and split-by IPAddress dimension, delivered to a common-schema webhook.",
        "correct": true
      },
      {
        "key": "D",
        "text": "Use a metric alert with a 15-minute frequency so it evaluates faster than logs",
        "correct": false
      }
    ],
    "explanation": "C exposes the relevant dimension on the per-IP alert while matching the frequency/window. D cannot evaluate this KQL pattern as a native platform metric. A monitors management events. B reverses the timing and a static rule name cannot supply dynamic IP values. Modern common-schema log alerts do not embed query result rows; retrieve linked results separately if needed.",
    "difficulty": 4
  },
  {
    "id": "az104-5-5.3-001",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "stem": "You need to back up Azure VMs with daily snapshots and long-term monthly/yearly retention. Which Azure resource must you create first to hold the backup data and policies?",
    "choices": [
      {
        "key": "A",
        "text": "An Azure Backup vault",
        "correct": false
      },
      {
        "key": "B",
        "text": "A backup storage account with a $backups container",
        "correct": false
      },
      {
        "key": "C",
        "text": "A Recovery Services vault",
        "correct": true
      },
      {
        "key": "D",
        "text": "A Log Analytics workspace",
        "correct": false
      }
    ],
    "explanation": "C hosts Azure VM Backup policies and vault recovery points. D stores logs. A is a real vault type for different supported workloads, such as Azure Disk Backup, not the specified full Azure VM backup policy. B is not how vault-based VM Backup stores its managed recovery points.",
    "difficulty": 1
  },
  {
    "id": "az104-5-5.3-002",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "stem": "A backup policy keeps daily recovery points for 30 days, plus one backup per week kept for 12 weeks and one per month kept for 12 months. What is this retention scheme called?",
    "choices": [
      {
        "key": "A",
        "text": "Continuous replication",
        "correct": false
      },
      {
        "key": "B",
        "text": "Grandfather-father-son (GFS) retention",
        "correct": true
      },
      {
        "key": "C",
        "text": "Incremental snapshot chaining",
        "correct": false
      },
      {
        "key": "D",
        "text": "Soft delete retention",
        "correct": false
      }
    ],
    "explanation": "Grandfather-father-son (GFS) retention is the scheme combining daily, weekly, monthly (and optionally yearly) retention tiers — exactly what the policy describes. Incremental snapshot chaining is wrong because it describes how backup data is stored efficiently, not the retention schedule. Soft delete is wrong because it is a safety feature that retains deleted backup data for a grace period to guard against accidental or malicious deletion. Continuous replication is wrong because it describes Azure Site Recovery, not backup retention.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.3-003",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "stem": "An administrator deletes an Azure VM backup item. Its Recovery Services vault has soft-delete retention explicitly configured to 30 days. What happens to that backup data?",
    "choices": [
      {
        "key": "A",
        "text": "The VM itself is restored automatically",
        "correct": false
      },
      {
        "key": "B",
        "text": "The backup policy is paused until an administrator re-enables it",
        "correct": false
      },
      {
        "key": "C",
        "text": "It enters the soft-deleted state for 30 days and can be undeleted during that period.",
        "correct": true
      },
      {
        "key": "D",
        "text": "The backup data is permanently deleted immediately",
        "correct": false
      }
    ],
    "explanation": "C uses the configured retention. Fourteen days is the default, not a fixed duration; supported settings range from 14 to 180 days. D ignores soft-delete protection. A confuses recovery of backup data with automatically restoring a VM. B incorrectly treats deleting one item as pausing the shared backup policy.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.3-004",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "stem": "You must back up files and folders on an on-premises Windows file server to Azure. The server cannot be virtualized and there is no System Center infrastructure. Which solution should you deploy?",
    "choices": [
      {
        "key": "A",
        "text": "Enable Azure VM backup on the file server",
        "correct": false
      },
      {
        "key": "B",
        "text": "Configure Azure Site Recovery replication for the file server",
        "correct": false
      },
      {
        "key": "C",
        "text": "Install Azure Monitor Agent and a data collection rule",
        "correct": false
      },
      {
        "key": "D",
        "text": "Install the Microsoft Azure Recovery Services (MARS) agent on the file server and back up to a Recovery Services vault",
        "correct": true
      }
    ],
    "explanation": "D backs up supported Windows files, folders and system state to a Recovery Services vault without requiring System Center. A protects Azure VMs, not this physical on-premises server. B performs disaster-recovery replication/failover rather than the requested file backup. C collects telemetry; it is not a backup agent.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.3-005",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "stem": "An application runs on Azure VMs in one region. It needs ongoing replication to another supported Azure region and ordered startup of its database and application tiers during disaster recovery. Which service/feature fits?",
    "choices": [
      {
        "key": "A",
        "text": "Azure Migrate with dependency mapping",
        "correct": false
      },
      {
        "key": "B",
        "text": "VM availability sets without cross-region replication",
        "correct": false
      },
      {
        "key": "C",
        "text": "Azure Site Recovery with a recovery plan",
        "correct": true
      },
      {
        "key": "D",
        "text": "Azure Backup with a GFS retention policy",
        "correct": false
      }
    ],
    "explanation": "C uses Site Recovery replication plus a recovery plan to sequence VM groups and supported automation. D supplies recovery points rather than ongoing DR replication and ordered failover. A supports migration assessment/moves, not this steady-state DR workflow. B supplies local failure-domain distribution, not a second-region replica.",
    "difficulty": 3
  },
  {
    "id": "az104-5-5.3-006",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "stem": "Azure VMs are protected by Site Recovery replication to a second Azure region. You need a DR drill in an isolated test VNet without cutting over production or stopping replication. Which operation should you run?",
    "choices": [
      {
        "key": "A",
        "text": "Production failover to the recovery region",
        "correct": false
      },
      {
        "key": "B",
        "text": "Disable replication for the protected VMs",
        "correct": false
      },
      {
        "key": "C",
        "text": "Failback",
        "correct": false
      },
      {
        "key": "D",
        "text": "Test failover",
        "correct": true
      }
    ],
    "explanation": "D creates test VMs from recovery points for the isolated drill while production and replication continue. A performs the real production recovery operation. B removes protection rather than testing it. C returns production to its original site after actual failover; it is not an isolated drill. Clean up test failover resources after validation.",
    "difficulty": 3
  },
  {
    "id": "az104-5-5.1-008",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "HRRecords.EmployeeId stores the same Entra object IDs as SigninLogs.UserId. You need to correlate matching rows with an explicit equality on those two columns. Which KQL operator fits?",
    "choices": [
      {
        "key": "A",
        "text": "extend",
        "correct": false
      },
      {
        "key": "B",
        "text": "summarize",
        "correct": false
      },
      {
        "key": "C",
        "text": "join",
        "correct": true
      },
      {
        "key": "D",
        "text": "union",
        "correct": false
      }
    ],
    "explanation": "C correlates matching keys, for example an inner join using $left.UserId == $right.EmployeeId. D appends rows and can handle different schemas, but does not match keys. A adds computed columns to existing rows. B aggregates rows. Real employee numbers would need an identity mapping before joining to Entra object IDs.",
    "difficulty": 3
  },
  {
    "id": "az104-5-5.3-007",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "stem": "Leadership asks for two numbers for the disaster recovery plan: the maximum acceptable data loss measured in time, and the maximum acceptable downtime before services are restored. Which pair of concepts are they asking about?",
    "choices": [
      {
        "key": "A",
        "text": "GFS and soft delete",
        "correct": false
      },
      {
        "key": "B",
        "text": "RPO (data loss) and RTO (downtime)",
        "correct": true
      },
      {
        "key": "C",
        "text": "SLA and SLO",
        "correct": false
      },
      {
        "key": "D",
        "text": "MTTR and MTBF",
        "correct": false
      }
    ],
    "explanation": "RPO (Recovery Point Objective) is the maximum tolerable data loss expressed as time, and RTO (Recovery Time Objective) is the maximum tolerable downtime — exactly the two numbers requested. SLA/SLO is wrong because those describe service-level commitments and targets, not data-loss/downtime tolerances. MTTR/MTBF is wrong because those are reliability metrics (mean time to repair / between failures), not DR objectives. GFS and soft delete are wrong because they are backup retention and protection features, not DR objectives.",
    "difficulty": 2
  },
  {
    "id": "az104-5-5.1-101",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "stem": "A VM emits platform metrics, but its Windows event logs are absent from Log Analytics. Which configuration collects the selected guest events with the current Azure Monitor agent model?",
    "choices": [
      {
        "key": "A",
        "text": "A diagnostic setting alone on the VM resource, with no guest agent",
        "correct": false
      },
      {
        "key": "B",
        "text": "Azure Monitor Agent plus an associated data collection rule specifying the events and workspace destination",
        "correct": true
      },
      {
        "key": "C",
        "text": "Azure Monitor Agent alone, without any associated collection rule",
        "correct": false
      },
      {
        "key": "D",
        "text": "A DCR with event selection but no association to the VM",
        "correct": false
      }
    ],
    "explanation": "B connects guest collection, selection and destination. A routes supported platform telemetry but does not install guest event collection. C lacks collection instructions. D never applies the rule to the intended VM. Platform CPU metrics appearing does not prove guest logs are configured.",
    "difficulty": 3
  }
];

export const AZ104_D5_FLASHCARDS: Flashcard[] = [
  {
    "id": "az104-fc-5-001",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "front": "Metrics vs. logs in Azure Monitor — what is the key difference?",
    "back": "Metrics are lightweight numerical time-series values (e.g., CPU %) stored in a time-series database for near-real-time trending. Logs are detailed records (events, traces) collected into a Log Analytics workspace and queried with KQL."
  },
  {
    "id": "az104-fc-5-002",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "front": "Which common Azure destinations can diagnostic settings send supported resource logs and metrics to?",
    "back": "Log Analytics workspaces for log queries, Storage accounts for retention, and Event Hubs for streaming. Supported partner destinations may also exist. Select supported categories; not every metric can be exported through diagnostic settings."
  },
  {
    "id": "az104-fc-5-003",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "front": "In KQL, what do the where, project, extend, and summarize operators do?",
    "back": "where filters rows; project selects/reshapes columns; extend adds calculated columns while keeping existing ones; summarize aggregates rows into groups (e.g., count(), avg(), sum() by ...)."
  },
  {
    "id": "az104-fc-5-004",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.1",
    "front": "How do you produce a timechart in KQL?",
    "back": "Bucket time with bin(TimeGenerated, <interval>) in a summarize, then pipe to render timechart — e.g., ... | summarize avg(CounterValue) by bin(TimeGenerated, 1h) | render timechart."
  },
  {
    "id": "az104-fc-5-002b",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "front": "Metric alert vs. log search alert — when do you use each?",
    "back": "Metric alerts evaluate platform metrics in near real time — best for threshold conditions like CPU > 85%. Log search alerts run a KQL query on a schedule against log data — best for complex patterns (e.g., brute-force sign-ins) not available as metrics."
  },
  {
    "id": "az104-fc-5-006",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "front": "What are the four main components of an Azure alert rule?",
    "back": "Scope identifies resources; condition defines the signal and criteria; action groups optionally deliver notifications or automation; rule details include name, severity and enablement. Some log search alerts offer Mute actions; alert processing rules can suppress actions on matching fired alerts."
  },
  {
    "id": "az104-fc-5-007",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "front": "Name three notification types and two automation actions an action group supports.",
    "back": "Notifications include email, SMS, Azure mobile-app push and voice (subject to regional support). Automation destinations include webhooks, Logic Apps, Azure Functions, Automation runbooks and Event Hubs."
  },
  {
    "id": "az104-fc-5-008",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "front": "Network Watcher: which tool for each task — (1) simulate a packet against NSG rules, (2) capture real packets, (3) view effective NSG rules, (4) map VNet topology?",
    "back": "(1) IP flow verify, (2) packet capture, (3) effective security rules view (part of NSG diagnostics), (4) topology."
  },
  {
    "id": "az104-fc-5-009",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "front": "What is a Recovery Services vault, and what two workloads does it protect in AZ-104 scope?",
    "back": "An RSV is the Azure storage container for backup data and backup policies. It protects Azure VMs (Azure VM backup) and on-premises machines via the MARS agent (files/folders/system state). It is also used by Azure Site Recovery."
  },
  {
    "id": "az104-fc-5-010",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "front": "What is GFS retention in Azure Backup?",
    "back": "Grandfather-father-son retention: keeps daily backups short-term, plus weekly, monthly, and yearly recovery points for long-term retention — e.g., daily for 30 days, weekly for 12 weeks, monthly for 12 months."
  },
  {
    "id": "az104-fc-5-011",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "front": "How does a Site Recovery test failover differ from a production failover?",
    "back": "Test failover starts recovery VMs in an isolated test network without production cutover or interrupting replication; clean up afterward. Production failover starts the recovered workload for real operations. Planned/unplanned terminology and shutdown options depend on the protected source scenario. Reprotect and fail back using the supported workflow."
  },
  {
    "id": "az104-fc-5-012",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.3",
    "front": "RPO vs. RTO?",
    "back": "RPO (Recovery Point Objective): maximum acceptable data loss, measured in time (how far back you can afford to lose). RTO (Recovery Time Objective): maximum acceptable downtime before services are restored."
  }
];

export const AZ104_D5_PERF_QUESTIONS: PerfQuestion[] = [
  {
    "id": "az104-pbq-5-001",
    "certId": "az-104",
    "domainId": "az-104:domain:5",
    "objectiveId": "az-104:obj:5.2",
    "type": "drag-match",
    "prompt": "An administrator is troubleshooting connectivity to an Azure VM. Match each Network Watcher tool to the task it performs.",
    "leftLabel": "Network Watcher tool",
    "rightLabel": "Task",
    "pairs": [
      {
        "left": "IP flow verify",
        "right": "Simulate a packet to check if NSG rules allow or deny it"
      },
      {
        "left": "Packet capture",
        "right": "Record actual network packets from a VM for inspection"
      },
      {
        "left": "Connection troubleshoot",
        "right": "Test end-to-end connectivity and diagnose hop-by-hop issues"
      },
      {
        "left": "Effective security rules",
        "right": "View the combined NSG rules applied to a NIC or subnet"
      },
      {
        "left": "Topology",
        "right": "Visualize resources and relationships in a virtual network"
      }
    ],
    "explanation": "IP flow verify simulates a packet against effective NSG rules (allow/deny) without sending real traffic. Packet capture records real packets including payloads for deep inspection. Connection troubleshoot checks connectivity between a source and destination and reports where it breaks. Effective security rules shows the merged allow/deny rules from all NSGs applied to a NIC or subnet. Topology draws the VNet's resources and their relationships.",
    "difficulty": 3
  }
];

export const AZ104_D5_ACRONYMS: Acronym[] = [
  {
    "id": "az104-ac-033",
    "certId": "az-104",
    "acronym": "KQL",
    "expansion": "Kusto Query Language",
    "hint": "The query language used in Log Analytics to search and analyze log data",
    "domainHint": 5
  },
  {
    "id": "az104-ac-034",
    "certId": "az-104",
    "acronym": "RPO",
    "expansion": "Recovery Point Objective",
    "hint": "Maximum acceptable data loss, measured in time",
    "domainHint": 5
  },
  {
    "id": "az104-ac-035",
    "certId": "az-104",
    "acronym": "RTO",
    "expansion": "Recovery Time Objective",
    "hint": "Maximum acceptable downtime before services are restored",
    "domainHint": 5
  },
  {
    "id": "az104-ac-036",
    "certId": "az-104",
    "acronym": "ASR",
    "expansion": "Azure Site Recovery",
    "hint": "Disaster recovery service that replicates VMs for failover to Azure",
    "domainHint": 5
  },
  {
    "id": "az104-ac-037",
    "certId": "az-104",
    "acronym": "RSV",
    "expansion": "Recovery Services vault",
    "hint": "Stores Azure Backup data and policies; also used by Site Recovery",
    "domainHint": 5
  },
  {
    "id": "az104-ac-038",
    "certId": "az-104",
    "acronym": "SLA",
    "expansion": "Service Level Agreement",
    "hint": "Microsoft's formal commitment for service uptime/availability",
    "domainHint": 5
  },
  {
    "id": "az104-ac-039",
    "certId": "az-104",
    "acronym": "SLO",
    "expansion": "Service Level Objective",
    "hint": "A measurable reliability target; an SLA is a service-level agreement and may use related targets.",
    "domainHint": 5
  },
  {
    "id": "az104-ac-040",
    "certId": "az-104",
    "acronym": "MTTR",
    "expansion": "Mean Time To Repair",
    "hint": "Average time to restore service after an incident",
    "domainHint": 5
  }
];

```

## content/seed.ts

```ts
import type {
  Certification,
  Domain,
  Flashcard,
  Objective,
  PerfQuestion,
  Question,
} from "@/lib/db";
import { liveCerts } from "@/lib/certs";
import {
  LOCAL_FLASHCARDS,
  LOCAL_PERF_QUESTIONS,
  LOCAL_QUESTIONS,
} from "./local-bank";
import {
  AZ104_FLASHCARDS,
  AZ104_PERF_QUESTIONS,
  AZ104_QUESTIONS,
} from "./az-104-bank";

export const CONTENT_VERSION = 2;

const certifications: Certification[] = liveCerts().map((cert) => ({
  id: cert.id,
  name: `${cert.fullName} ${cert.version}`,
  vendor: cert.vendor,
  version: cert.version,
  passingScore: cert.passingScore,
}));

const domains: Domain[] = liveCerts().flatMap((cert) =>
  cert.domains.map((domain) => ({
    id: `${cert.id}:domain:${domain.code}`,
    certId: cert.id,
    number: Number(domain.code),
    name: domain.name,
    weight: domain.weight,
  }))
);

const objectives: Objective[] = liveCerts().flatMap((cert) =>
  cert.domains.flatMap((domain) =>
    domain.objectives.map((objective) => ({
      id: `${cert.id}:obj:${objective.code}`,
      certId: cert.id,
      domainId: `${cert.id}:domain:${domain.code}`,
      code: objective.code,
      name: objective.name,
    }))
  )
);

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export const SEED_DATA: {
  certifications: Certification[];
  domains: Domain[];
  objectives: Objective[];
  questions: Question[];
  flashcards: Flashcard[];
} = {
  certifications,
  domains,
  objectives,
  questions: dedupeById([...LOCAL_QUESTIONS, ...AZ104_QUESTIONS]),
  flashcards: dedupeById([...LOCAL_FLASHCARDS, ...AZ104_FLASHCARDS]),
};

export const perfQuestions: PerfQuestion[] = dedupeById([
  ...LOCAL_PERF_QUESTIONS,
  ...AZ104_PERF_QUESTIONS,
]);

```

## e2e/az104-release.spec.ts

```ts
import { expect, test } from "@playwright/test";

test("AZ-104 announcement, selection and all content modes work on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    localStorage.setItem("tourSeenVersion", "1");
    localStorage.setItem("hecz.analytics.consent.v1", "denied");
  });
  await page.goto("/onboarding");
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page.getByRole("button", { name: "Set date →", exact: true }).click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page.getByRole("button", { name: "Skip, take me to the dashboard" }).click();
  const announcement = page.getByRole("link", { name: /New: Azure Administrator/ });
  await expect(announcement).toBeVisible();
  await page.screenshot({ path: "test-results/az104-announcement-mobile.png" });
  await announcement.click();
  await expect(page.locator("#az-104")).toContainText("160 original questions");
  await page.goto("/settings");
  await page.getByRole("menuitemradio", { name: /AZ-104/ }).click();
  await expect(page.locator(".hero-grid")).toBeVisible();
  const counts = await page.evaluate(async () => {
    const open = indexedDB.open("SecPlusQuestDB");
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });
    try {
      return await Promise.all(["questions", "flashcards", "perfQuestions", "acronyms"].map(store => {
        const request = database.transaction(store).objectStore(store).index("certId").count("az-104");
        return new Promise<number>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }));
    } finally { database.close(); }
  });
  expect(counts).toEqual([160, 60, 8, 40]);
  // Exercise the real IndexedDB upgrade path with existing study progress.
  const preserved = await page.evaluate(async () => {
    const request = indexedDB.open("SecPlusQuestDB");
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const result = await new Promise<{ id: string; due: string }>((resolve, reject) => {
      const tx = database.transaction(["userState", "flashcards", "questions", "perfQuestions", "acronyms"], "readwrite");
      const state = tx.objectStore("userState").get(1);
      state.onsuccess = () => tx.objectStore("userState").put({ ...state.result, xp: 123, contentVersion: state.result.contentVersion - 1 });
      const card = tx.objectStore("flashcards").index("certId").get("secplus-sy0-701");
      let saved: { id: string; due: string };
      card.onsuccess = () => {
        saved = { id: card.result.id, due: "2026-10-10T12:00:00.000Z" };
        tx.objectStore("flashcards").put({ ...card.result, fsrsReps: 7, fsrsDue: saved.due });
      };
      for (const name of ["questions", "flashcards", "perfQuestions", "acronyms"]) {
        const cursor = tx.objectStore(name).index("certId").openCursor("az-104");
        cursor.onsuccess = () => { if (cursor.result) { cursor.result.delete(); cursor.result.continue(); } };
      }
      tx.oncomplete = () => resolve(saved);
      tx.onerror = () => reject(tx.error);
    });
    database.close();
    return result;
  });
  await page.reload();
  await expect(page.locator(".hero-grid")).toBeVisible();
  const restored = await page.evaluate(async ({ id }) => {
    const request = indexedDB.open("SecPlusQuestDB");
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const read = <T,>(req: IDBRequest<T>) => new Promise<T>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const tx = database.transaction(["userState", "flashcards", "questions", "perfQuestions", "acronyms"]);
    const [state, card, ...counts] = await Promise.all([
      read(tx.objectStore("userState").get(1)),
      read(tx.objectStore("flashcards").get(id)),
      ...["questions", "flashcards", "perfQuestions", "acronyms"].map(name => read(tx.objectStore(name).index("certId").count("az-104"))),
    ]);
    database.close();
    return { xp: state.xp, reps: card.fsrsReps, due: card.fsrsDue, counts };
  }, preserved);
  expect(restored).toEqual({ xp: 123, reps: 7, due: preserved.due, counts: [160, 60, 8, 40] });
  await page.getByRole("button", { name: "Dismiss announcement", exact: true }).click();
  await page.reload();
  await expect(announcement).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/az104-dashboard-mobile.png", fullPage: true });
});

```

## lib/certs.ts

```ts
// Cert registry — the single source of truth for certification metadata and
// taxonomy (domains, weights, objectives). Adding a new CompTIA cert later is
// mostly a matter of dropping a fully-populated entry in here plus its content.
//
// The Security+ entry below is the canonical SY0-701 taxonomy. content/seed.ts
// derives its seeded Domain/Objective rows from this registry, so the registry
// and the seeded data can never drift apart.

export interface CertObjectiveDef {
  code: string; // "1.1"
  name: string;
}

export interface CertDomainDef {
  code: string; // "1".."5" — maps to Domain.number
  name: string;
  weight: number; // 0.12, 0.22, etc. (live certs must sum to 1.0)
  objectives: CertObjectiveDef[];
}

export interface CertMeta {
  id: string; // "secplus-sy0-701"
  vendor: string; // "CompTIA"
  name: string; // "Security+"
  fullName: string; // "CompTIA Security+"
  version: string; // "SY0-701"
  passingScore: number; // 750
  scoreMin: number; // 100
  scoreMax: number; // 900
  tagline: string; // short marketing line
  messerPlaylistUrl?: string;
  status: "live" | "coming-soon";
  domains: CertDomainDef[]; // empty [] allowed for coming-soon
}

export const CERTS: CertMeta[] = [
  {
    id: "secplus-sy0-701",
    vendor: "CompTIA",
    name: "Security+",
    fullName: "CompTIA Security+",
    version: "SY0-701",
    passingScore: 750,
    scoreMin: 100,
    scoreMax: 900,
    tagline: "The industry-standard entry point into cybersecurity.",
    messerPlaylistUrl:
      "https://www.youtube.com/playlist?list=PLG49S3nxzAnl4QDVqK-hOnoqcSKEIDDuv",
    status: "live",
    domains: [
      {
        code: "1",
        name: "General Security Concepts",
        weight: 0.12,
        objectives: [
          { code: "1.1", name: "Compare and contrast various types of security controls" },
          { code: "1.2", name: "Summarize fundamental security concepts" },
          { code: "1.3", name: "Explain the importance of change management processes" },
          { code: "1.4", name: "Explain the importance of using appropriate cryptographic solutions" },
        ],
      },
      {
        code: "2",
        name: "Threats, Vulnerabilities & Mitigations",
        weight: 0.22,
        objectives: [
          { code: "2.1", name: "Compare and contrast common threat actors and motivations" },
          { code: "2.2", name: "Explain common threat vectors and attack surfaces" },
          { code: "2.3", name: "Explain various types of vulnerabilities" },
          { code: "2.4", name: "Given a scenario, analyze indicators of malicious activity" },
          { code: "2.5", name: "Explain the purpose of mitigation techniques" },
        ],
      },
      {
        code: "3",
        name: "Security Architecture",
        weight: 0.18,
        objectives: [
          { code: "3.1", name: "Compare and contrast security implications of different architecture models" },
          { code: "3.2", name: "Given a scenario, apply security principles to secure enterprise infrastructure" },
          { code: "3.3", name: "Compare and contrast concepts and strategies to protect data" },
          { code: "3.4", name: "Explain the importance of resilience and recovery in security architecture" },
        ],
      },
      {
        code: "4",
        name: "Security Operations",
        weight: 0.28,
        objectives: [
          { code: "4.1", name: "Given a scenario, apply common security techniques to computing resources" },
          { code: "4.2", name: "Explain the security implications of proper hardware, software, and data asset management" },
          { code: "4.3", name: "Explain various activities associated with vulnerability management" },
          { code: "4.4", name: "Explain security alerting and monitoring concepts and tools" },
          { code: "4.5", name: "Given a scenario, modify enterprise capabilities to enhance security" },
          { code: "4.6", name: "Given a scenario, implement and maintain identity and access management" },
        ],
      },
      {
        code: "5",
        name: "Security Program Management & Oversight",
        weight: 0.2,
        objectives: [
          { code: "5.1", name: "Summarize elements of effective security governance" },
          { code: "5.2", name: "Explain elements of the risk management process" },
          { code: "5.3", name: "Explain the processes associated with third-party risk assessment and management" },
          { code: "5.4", name: "Summarize elements of effective security compliance" },
          { code: "5.5", name: "Explain types and purposes of audits and assessments" },
        ],
      },
    ],
  },
  {
    id: "networkplus-n10-009",
    vendor: "CompTIA",
    name: "Network+",
    fullName: "CompTIA Network+",
    version: "N10-009",
    passingScore: 720,
    scoreMin: 100,
    scoreMax: 900,
    tagline: "Core networking skills every IT pro needs.",
    // Professor Messer's official N10-009 Network+ Training Course playlist.
    messerPlaylistUrl:
      "https://www.youtube.com/playlist?list=PLG49S3nxzAnl_tQe3kvnmeMid0mjF8Le8",
    status: "live",
    domains: [
      {
        code: "1",
        name: "Networking Concepts",
        weight: 0.23,
        objectives: [
          { code: "1.1", name: "Explain concepts related to the Open Systems Interconnection (OSI) reference model" },
          { code: "1.2", name: "Compare and contrast networking appliances, applications, and functions" },
          { code: "1.3", name: "Summarize cloud concepts and connectivity options" },
          { code: "1.4", name: "Explain common networking ports, protocols, services, and traffic types" },
          { code: "1.5", name: "Compare and contrast transmission media and transceivers" },
          { code: "1.6", name: "Compare and contrast network topologies, architectures, and types" },
          { code: "1.7", name: "Given a scenario, use appropriate IPv4 network addressing" },
          { code: "1.8", name: "Summarize evolving use cases for modern network environments" },
        ],
      },
      {
        code: "2",
        name: "Network Implementation",
        weight: 0.2,
        objectives: [
          { code: "2.1", name: "Explain characteristics of routing technologies and bandwidth management" },
          { code: "2.2", name: "Given a scenario, configure switching technologies and features" },
          { code: "2.3", name: "Given a scenario, select and configure wireless devices and technologies" },
          { code: "2.4", name: "Explain important factors of physical installations" },
        ],
      },
      {
        code: "3",
        name: "Network Operations",
        weight: 0.19,
        objectives: [
          { code: "3.1", name: "Explain the purpose of organizational processes and procedures" },
          { code: "3.2", name: "Given a scenario, use network monitoring technologies" },
          { code: "3.3", name: "Explain disaster recovery (DR) concepts" },
          { code: "3.4", name: "Given a scenario, implement IPv4 and IPv6 network services" },
          { code: "3.5", name: "Compare and contrast network access and management methods" },
        ],
      },
      {
        code: "4",
        name: "Network Security",
        weight: 0.14,
        objectives: [
          { code: "4.1", name: "Explain the importance of basic network security concepts" },
          { code: "4.2", name: "Summarize various types of attacks and their impact to the network" },
          { code: "4.3", name: "Given a scenario, apply network security features, defense techniques, and solutions" },
        ],
      },
      {
        code: "5",
        name: "Network Troubleshooting",
        weight: 0.24,
        objectives: [
          { code: "5.1", name: "Explain the troubleshooting methodology" },
          { code: "5.2", name: "Given a scenario, troubleshoot common cabling and physical interface issues" },
          { code: "5.3", name: "Given a scenario, troubleshoot common issues with network services" },
          { code: "5.4", name: "Given a scenario, troubleshoot common performance issues" },
          { code: "5.5", name: "Given a scenario, troubleshoot network security issues" },
        ],
      },
    ],
  },
  {
    // A+ is two separate exams; we model each as its own cert (each has its own
    // objectives, score, and pass line). You need both to earn the A+ cert.
    id: "aplus-220-1101",
    vendor: "CompTIA",
    name: "A+ Core 1",
    fullName: "CompTIA A+ Core 1",
    version: "220-1101",
    passingScore: 675,
    scoreMin: 100,
    scoreMax: 900,
    tagline: "Hardware, networking, mobile, and troubleshooting.",
    // Professor Messer's official 220-1101 A+ Core 1 Training Course playlist.
    messerPlaylistUrl:
      "https://www.youtube.com/playlist?list=PLG49S3nxzAnnOmvg5UGVenB_qQgsh01uC",
    status: "live",
    domains: [
      {
        code: "1",
        name: "Mobile Devices",
        weight: 0.13,
        objectives: [
          { code: "1.1", name: "Given a scenario, install and configure laptop hardware and components" },
          { code: "1.2", name: "Compare and contrast the display components of mobile devices" },
          { code: "1.3", name: "Given a scenario, set up and configure accessories and ports of mobile devices" },
          { code: "1.4", name: "Given a scenario, configure basic mobile-device network connectivity and application support" },
        ],
      },
      {
        code: "2",
        name: "Networking",
        weight: 0.23,
        objectives: [
          { code: "2.1", name: "Compare and contrast TCP and UDP ports, protocols, and their purposes" },
          { code: "2.2", name: "Compare and contrast common networking hardware" },
          { code: "2.3", name: "Compare and contrast protocols for wireless networking" },
          { code: "2.4", name: "Summarize services provided by networked hosts" },
          { code: "2.5", name: "Given a scenario, install and configure basic wired/wireless SOHO networks" },
          { code: "2.6", name: "Compare and contrast common network configuration concepts" },
          { code: "2.7", name: "Compare and contrast Internet connection types, network types, and their features" },
          { code: "2.8", name: "Given a scenario, use networking tools" },
        ],
      },
      {
        code: "3",
        name: "Hardware",
        weight: 0.25,
        objectives: [
          { code: "3.1", name: "Explain basic cable types and their connectors, features, and purposes" },
          { code: "3.2", name: "Given a scenario, install the appropriate RAM" },
          { code: "3.3", name: "Given a scenario, select and install storage devices" },
          { code: "3.4", name: "Given a scenario, install and configure motherboards, CPUs, and add-on cards" },
          { code: "3.5", name: "Given a scenario, install or replace the appropriate power supply" },
          { code: "3.6", name: "Given a scenario, deploy and configure multifunction devices/printers and settings" },
          { code: "3.7", name: "Given a scenario, install and replace printer consumables" },
        ],
      },
      {
        code: "4",
        name: "Virtualization & Cloud Computing",
        weight: 0.11,
        objectives: [
          { code: "4.1", name: "Summarize cloud-computing concepts" },
          { code: "4.2", name: "Summarize aspects of client-side virtualization" },
        ],
      },
      {
        code: "5",
        name: "Hardware & Network Troubleshooting",
        weight: 0.28,
        objectives: [
          { code: "5.1", name: "Given a scenario, apply the best practice methodology to resolve problems" },
          { code: "5.2", name: "Given a scenario, troubleshoot problems related to motherboards, RAM, CPU, and power" },
          { code: "5.3", name: "Given a scenario, troubleshoot and diagnose problems with storage drives and RAID arrays" },
          { code: "5.4", name: "Given a scenario, troubleshoot video, projector, and display issues" },
          { code: "5.5", name: "Given a scenario, troubleshoot common issues with mobile devices" },
          { code: "5.6", name: "Given a scenario, troubleshoot and resolve printer issues" },
          { code: "5.7", name: "Given a scenario, troubleshoot problems with wired and wireless networks" },
        ],
      },
    ],
  },
  {
    id: "aplus-220-1102",
    vendor: "CompTIA",
    name: "A+ Core 2",
    fullName: "CompTIA A+ Core 2",
    version: "220-1102",
    passingScore: 700,
    scoreMin: 100,
    scoreMax: 900,
    tagline: "Operating systems, security, software, and procedures.",
    // Professor Messer's official 220-1102 A+ Core 2 Training Course playlist.
    messerPlaylistUrl:
      "https://www.youtube.com/playlist?list=PLG49S3nxzAnna96gzhJrzkii4hH_mgW4b",
    status: "live",
    domains: [
      {
        code: "1",
        name: "Operating Systems",
        weight: 0.28,
        objectives: [
          { code: "1.1", name: "Identify basic features of Microsoft Windows editions" },
          { code: "1.2", name: "Given a scenario, use the appropriate Microsoft command-line tool" },
          { code: "1.3", name: "Given a scenario, use features and tools of the Microsoft Windows 10 OS" },
          { code: "1.4", name: "Given a scenario, use the appropriate Microsoft Windows 10 Control Panel utility" },
          { code: "1.5", name: "Given a scenario, use the appropriate Windows settings" },
          { code: "1.6", name: "Given a scenario, configure Microsoft Windows networking features on a client/desktop" },
          { code: "1.7", name: "Given a scenario, apply application installation and configuration concepts" },
          { code: "1.8", name: "Explain common OS types and their purposes" },
          { code: "1.9", name: "Given a scenario, perform OS installations and upgrades in a diverse OS environment" },
          { code: "1.10", name: "Identify common features and tools of the macOS/desktop OS" },
          { code: "1.11", name: "Identify common features and tools of the Linux client/desktop OS" },
        ],
      },
      {
        code: "2",
        name: "Security",
        weight: 0.28,
        objectives: [
          { code: "2.1", name: "Summarize various security measures and their purposes" },
          { code: "2.2", name: "Compare and contrast wireless security protocols and authentication methods" },
          { code: "2.3", name: "Given a scenario, detect, remove, and prevent malware using the appropriate tools and methods" },
          { code: "2.4", name: "Explain common social-engineering attacks, threats, and vulnerabilities" },
          { code: "2.5", name: "Given a scenario, manage and configure basic security settings in the Microsoft Windows OS" },
          { code: "2.6", name: "Given a scenario, configure a workstation to meet best practices for security" },
          { code: "2.7", name: "Explain common methods for securing mobile and embedded devices" },
          { code: "2.8", name: "Given a scenario, use common data destruction and disposal methods" },
          { code: "2.9", name: "Given a scenario, configure appropriate security settings on SOHO wireless and wired networks" },
          { code: "2.10", name: "Given a scenario, install and configure browsers and relevant security settings" },
        ],
      },
      {
        code: "3",
        name: "Software Troubleshooting",
        weight: 0.22,
        objectives: [
          { code: "3.1", name: "Given a scenario, troubleshoot common Windows OS problems" },
          { code: "3.2", name: "Given a scenario, troubleshoot common personal computer (PC) security issues" },
          { code: "3.3", name: "Given a scenario, use best practice procedures for malware removal" },
          { code: "3.4", name: "Given a scenario, troubleshoot common mobile OS and application issues" },
          { code: "3.5", name: "Given a scenario, troubleshoot common mobile OS and application security issues" },
        ],
      },
      {
        code: "4",
        name: "Operational Procedures",
        weight: 0.22,
        objectives: [
          { code: "4.1", name: "Given a scenario, implement best practices associated with documentation and support systems information management" },
          { code: "4.2", name: "Explain basic change-management best practices" },
          { code: "4.3", name: "Given a scenario, implement workstation backup and recovery methods" },
          { code: "4.4", name: "Given a scenario, use common safety procedures" },
          { code: "4.5", name: "Summarize environmental impacts and local environmental controls" },
          { code: "4.6", name: "Explain the importance of prohibited content/activity and privacy, licensing, and policy concepts" },
          { code: "4.7", name: "Given a scenario, use proper communication techniques and professionalism" },
          { code: "4.8", name: "Identify the basics of scripting" },
          { code: "4.9", name: "Given a scenario, use remote-access technologies" },
        ],
      },
    ],
  },
  {
    id: "az-104",
    vendor: "Microsoft",
    name: "Azure Administrator",
    fullName: "Microsoft Certified: Azure Administrator Associate",
    version: "AZ-104",
    passingScore: 700,
    scoreMin: 1,
    scoreMax: 1000,
    tagline: "Administer Azure identities, storage, compute, networking, and monitoring.",
    status: "live",
    // April 17, 2026 outline. Point weights are app sampling targets within
    // Microsoft's published ranges, not exact exam percentages. Objective
    // codes are stable app subdivisions, not Microsoft-assigned identifiers.
    // https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104
    domains: [
      {
        code: "1",
        name: "Manage Azure identities and governance",
        weight: 0.25,
        objectives: [
          { code: "1.1", name: "Manage Microsoft Entra users, groups, licenses, external users, and SSPR" },
          { code: "1.2", name: "Supplemental identity practice: Conditional Access and MFA" },
          { code: "1.3", name: "Supplemental identity practice: PIM, access reviews, and Identity Protection" },
          { code: "1.4", name: "Implement role-based access control (RBAC)" },
          { code: "1.5", name: "Manage Policy, locks, tags, resource groups, subscriptions, costs, and management groups" },
        ],
      },
      {
        code: "2",
        name: "Implement and manage storage",
        weight: 0.2,
        objectives: [
          { code: "2.1", name: "Configure storage accounts, redundancy, encryption, and object replication" },
          { code: "2.2", name: "Configure blob access tiers and lifecycle management" },
          { code: "2.3", name: "Secure storage with shared access signatures, keys, and network controls" },
          { code: "2.4", name: "Move data with AzCopy, Azure Storage Explorer, and Azure File Sync" },
          { code: "2.5", name: "Configure Azure Files, identity-based access, snapshots, and soft delete" },
        ],
      },
      {
        code: "3",
        name: "Deploy and manage Azure compute resources",
        weight: 0.25,
        objectives: [
          { code: "3.1", name: "Deploy and configure Azure virtual machines" },
          { code: "3.2", name: "Configure availability sets, availability zones, and Virtual Machine Scale Sets" },
          { code: "3.3", name: "Deploy containers with Azure Container Instances and Azure Container Apps" },
          { code: "3.4", name: "Configure Azure App Service plans, apps, and deployment slots" },
          { code: "3.5", name: "Interpret, modify, deploy, and convert ARM templates and Bicep files" },
        ],
      },
      {
        code: "4",
        name: "Implement and manage virtual networking",
        weight: 0.2,
        objectives: [
          { code: "4.1", name: "Configure virtual networks, subnets, public and private IPs, and user-defined routes" },
          { code: "4.2", name: "Configure VNet peering, VPN Gateway, and ExpressRoute" },
          { code: "4.3", name: "Configure NSGs, ASGs, Bastion, service/private endpoints, and supplemental Azure Firewall practice" },
          { code: "4.4", name: "Configure Azure DNS, load balancing, and NAT Gateway" },
        ],
      },
      {
        code: "5",
        name: "Monitor and maintain Azure resources",
        weight: 0.1,
        objectives: [
          { code: "5.1", name: "Monitor resources with Azure Monitor, Log Analytics, and KQL" },
          { code: "5.2", name: "Configure alerts, action groups, and Network Watcher" },
          { code: "5.3", name: "Protect data with Azure Backup and Azure Site Recovery" },
        ],
      },
    ],
  },
];

export const DEFAULT_CERT_ID = "secplus-sy0-701";

/** Returns the cert with the given id, falling back to the default cert. */
export function getCert(id: string): CertMeta {
  return (
    CERTS.find((c) => c.id === id) ??
    CERTS.find((c) => c.id === DEFAULT_CERT_ID)!
  );
}

/** All live (selectable) certs. */
export function liveCerts(): CertMeta[] {
  return CERTS.filter((c) => c.status === "live");
}

/** Resolve the active cert id from user state, defaulting when unset. */
export function getActiveCertId(state?: { activeCertId?: string }): string {
  return state?.activeCertId ?? DEFAULT_CERT_ID;
}

```

## lib/changelog.ts

```ts
export type ChangeItem = {
  title: string;
  body: string;
};

export type ChangeEntry = {
  id?: string;
  date: string;
  label: string;
  title: string;
  summary: string;
  items: ChangeItem[];
};

export const changelogEntries: ChangeEntry[] = [
  {
    id: "az-104",
    date: "2026-09-25",
    label: "Azure Administrator",
    title: "AZ-104 practice joins the study desk",
    summary: "Practice Azure administration with 160 original questions, 60 flashcards, 8 matching drills and 40 acronym and term drills. Choose AZ-104 from the certification switcher to begin.",
    items: [
      { title: "Learn from every choice", body: "Reviewed explanations cover why the answer fits and why each alternative fails, including corrections for current storage, identity, compute and networking behavior." },
      { title: "More hands-on topics", body: "New scenarios cover ARM and Bicep, self-service password reset, Azure Files, encryption, object replication, routing and guest-log collection." },
      { title: "Know what the bank covers", body: "The five domains follow the April 2026 exam outline. Supplemental identity topics are labeled. Matching drills are learning exercises, not replicas of Microsoft exam labs, and practice scores are not official exam predictions." },
      { title: "Keep your study history", body: "The content update adds Azure practice while preserving existing progress and flashcard scheduling." },
    ],
  },
  {
    date: "2026-07-03",
    label: "Class share pass",
    title: "The lab is easier to share from a phone",
    summary:
      "The lab and changelog now work better as classroom handoff pages, with mobile-first layout, QR sharing, and a clearer demo-bank path.",
    items: [
      {
        title: "Added dashboard discovery",
        body: "The dashboard now surfaces the Study Lab and changelog without adding another primary navigation item.",
      },
      {
        title: "Added class-share tools",
        body: "The lab hub includes a QR code, public repo link, class pack, decks, and short copy for sharing with classmates.",
      },
      {
        title: "Added a demo-bank walkthrough",
        body: "The lab page now shows a five-question workflow so students can understand how to build a small original bank before scaling up.",
      },
      {
        title: "Tightened mobile layout",
        body: "Long labels and cards wrap cleanly on phone-width screens so the lab/changelog pages do not drift sideways.",
      },
    ],
  },
  {
    date: "2026-07-01",
    label: "Lab release",
    title: "Official app, open-source lab split",
    summary:
      "The production app now stays focused on the curated study experience while the public repo gives classmates and builders a clean starter kit.",
    items: [
      {
        title: "Added the Hecz Study Lab hub",
        body: "New /lab page explains the difference between the official app, the forkable lab starter, class resources, decks, and import guidance.",
      },
      {
        title: "Locked imports on production",
        body: "The /import page stays available for transparency, but production builds do not show the upload action unless NEXT_PUBLIC_ENABLE_BANK_IMPORT is explicitly enabled.",
      },
      {
        title: "Updated the public starter",
        body: "The h3cz/study repo ships without the private/generated question bank and points people toward building their own allowed content.",
      },
      {
        title: "Expanded class materials",
        body: "Added the class handout, branded lab guide, PowerPoint decks, import format docs, and class pack template for running a hands-on lab.",
      },
    ],
  },
  {
    date: "2026-06-30",
    label: "Compete polish",
    title: "Duels are slower, clearer, and less abrupt",
    summary:
      "Compete now explains the rules before play and requires both players to advance between rounds.",
    items: [
      {
        title: "Added a rules preview",
        body: "Players see the question count, timer, speed scoring, and round pacing before the first question.",
      },
      {
        title: "Added round-by-round Next flow",
        body: "A duel no longer snaps straight into the next question. Both players answer, then both click Next before the server advances.",
      },
      {
        title: "Made settings explicit",
        body: "Invite and quick-match flows make the selected question count and timer visible so both sides know the rules.",
      },
    ],
  },
  {
    date: "2026-06-30",
    label: "Showcase pass",
    title: "Better public project packaging",
    summary:
      "The repo now reads more like a project people can understand, fork, and evaluate.",
    items: [
      {
        title: "Added showcase visuals",
        body: "README and social-preview assets now show the product instead of only describing it.",
      },
      {
        title: "Clarified the question-bank boundary",
        body: "Docs now explain that the open-source version is a starter, not a redistributed private bank.",
      },
      {
        title: "Removed AI-agent contributor references",
        body: "Public-facing materials were cleaned up so the project is presented under the Hecz brand.",
      },
    ],
  },
];

```

## scripts/report-az104.mjs

```js
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const root = 'docs/az104-review';
const { issues, references } = JSON.parse(fs.readFileSync(`${root}/changes.json`, 'utf8'));
const read = p => fs.readFileSync(p, 'utf8');
const evaluate = p => {
  const context = { exports: {} };
  vm.runInNewContext(ts.transpileModule(read(p), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  return context.exports;
};
const cert = evaluate('lib/certs.ts').CERTS.find(c => c.id === 'az-104');
const originals = Array.from({ length: 5 }, (_, i) => JSON.parse(read(`${root}/original-d${i + 1}.json`)));
const banks = Array.from({ length: 5 }, (_, i) => evaluate(`content/parts/az104-d${i + 1}.ts`));
const issueMap = new Map();
for (const { id, issue } of issues) issueMap.set(id, [...(issueMap.get(id) ?? []), issue]);
const changed = [];
const code = o => '```ts\n' + JSON.stringify(o, null, 2) + '\n```\n';
const sourceLinks = id => [...new Set(references[id] ?? [])].map((url, i) => `[Microsoft Learn ${i + 1}](${url})`).join(' · ');
let report = read(`${root}/SUMMARY.md`) + '\n\n## File-by-file corrections\n';
for (let d = 1; d <= 5; d++) {
  report += `\n### content/parts/az104-d${d}.ts\n\n`;
  const old = new Map(Object.values(originals[d - 1]).flat().map(q => [q.id, q]));
  for (const items of Object.values(banks[d - 1])) for (const q of items) {
    const previous = old.get(q.id);
    if (JSON.stringify(previous) === JSON.stringify(q)) continue;
    changed.push(q.id);
    const entries = issueMap.get(q.id);
    if (!entries) throw Error(`Undocumented edit: ${q.id}`);
    report += `\n#### ${q.id}\n\n**What was wrong / why added:** ${[...new Set(entries)].join(' ')}\n\n`;
    if (sourceLinks(q.id)) report += `**Evidence:** ${sourceLinks(q.id)}\n\n`;
    else report += '**Evidence:** See the related topic sources in the per-domain MCQ audit below; this supporting drill is not an independently weighted exam item.\n\n';
    report += '**Full corrected object:**\n\n' + code(q);
  }
  report += '\n#### Every MCQ: answer and evidence audit\n\n| Stable ID | Correct answer after review | Disposition | Evidence |\n|---|---|---|---|\n';
  for (const q of banks[d - 1][`AZ104_D${d}_QUESTIONS`]) {
    if (!references[q.id]?.length) throw Error(`No primary source: ${q.id}`);
    const c = q.choices.find(c => c.correct);
    const disposition = !old.has(q.id) ? 'New coverage' : changed.includes(q.id) ? 'Corrected above' : 'Retained after review';
    report += `| ${q.id} | ${c.key}: ${c.text.replace(/\|/g, '\\|').replace(/\n/g, ' ')} | ${disposition} | ${sourceLinks(q.id)} |\n`;
  }
}
report += '\n### content/az-104-bank.ts\n\nNo missing exports, repeated arrays or aggregation errors were found. Updated counts, review provenance and matching-drill description. Full file is in COMPLETE-FILES.md and at its repository path.\n';
report += '\n### lib/certs.ts\n\nCorrected the Microsoft score range to 1–1000; 700 is the passing scaled score, not a guaranteed percent-correct threshold. Corrected domain-one weighting to the April 2026 outline; app sampling weights are chosen within published ranges. Kept existing objective IDs stable, labeled supplemental identity topics, and added Azure Files and ARM/Bicep objectives. These numeric objective codes are app-owned subdivisions, not official Microsoft identifiers.\n\nSources: [Exam outline](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-104), [Scoring](https://learn.microsoft.com/en-us/credentials/support/exam-scoring-reports).\n\n**Full corrected certification object:**\n\n' + code(cert);
report += '\n### App integration and release files\n\nThe dashboard has a dismissible announcement with persistent dismissal and 44px controls. Release notes have a stable #az-104 anchor; the existing dashboard release card now displays the current entry. Certification selection exposes all four practice modes. The content version triggers reseeding using the existing history-preserving path. Public starter version: 2. Production version: 18; production-only banks and prior release entries remain intact. Metadata includes Azure. Contract and browser tests cover the announcement, selection, all four seeded counts, dismissal, and a narrow viewport. No Supabase schema or edge functions changed.\n';
report += `\n**Audit totals:** ${changed.length} changed/new content objects; 160 MCQs with primary-source references, 60 flashcards, 8 matching drills, and 40 term drills. Full originals are retained in original-d1.json through original-d5.json for comparison.\n`;
fs.writeFileSync(`${root}/REPORT.md`, report);

// Complete files, not excerpts or diffs. Exclude the generated bundle itself.
const files = JSON.parse(read(`${root}/replacement-files.json`));
let full = '# Complete corrected files\n\nEach section contains the entire file, ready to replace the corresponding file in this checkout. This bundle is specific to this repository; do not replace production seed/cert files with public-starter versions.\n\n';
for (const p of files) full += `## ${p}\n\n\`\`\`${p.endsWith('.mjs') ? 'js' : p.endsWith('.tsx') ? 'tsx' : 'ts'}\n${read(p)}\n\`\`\`\n\n`;
fs.writeFileSync(`${root}/COMPLETE-FILES.md`, full);
console.log(JSON.stringify({ changedObjects: changed.length, primarySourcedMCQs: 160, completeFiles: files.length }));

```

## scripts/review-az104-additions.mjs

```js
import {add} from './review-az104-helpers.mjs';
// New IDs only: existing learning-history identifiers are never reused for unrelated facts.
add(1,'1.1',101,'A licensed tenant wants to pilot self-service password reset for members of one security group. Other ordinary users must not receive SSPR yet. Which configuration fits?', ['Enable SSPR for All users.','Set SSPR to Selected and choose the pilot group.','Create a subscription Contributor assignment for the group.','Enable a resource-group ReadOnly lock.'],1,'B scopes the SSPR rollout to the selected group. A enables it too broadly. C grants Azure resource permissions, not password reset. D controls resource management, not identity recovery. Configure supported authentication methods and registration for the pilot.','entra/identity/authentication/tutorial-enable-sspr');
add(1,'1.1',102,'A synchronized user must reset a forgotten password through SSPR and have the new password applied to on-premises AD DS. Licensing and reset-method registration are ready. Which additional capability is needed?', ['Password hash synchronization alone','An Azure Policy remediation task','Supported password writeback enabled and configured for the hybrid identity deployment','A guest invitation'],2,'C writes the cloud-initiated reset back to the on-premises directory, subject to configuration and AD password policy. A synchronizes hashes toward the cloud but does not itself write resets back. B remediates Azure resource configuration. D changes collaboration access rather than hybrid passwords.','entra/identity/authentication/concept-sspr-writeback');
add(1,'1.1',103,'SSPR is enabled for a pilot group and requires two verification methods. A pilot user has registered only one usable method. What should the administrator address before relying on self-service recovery?', ['Reduce the Azure subscription budget.','Add a DNS TXT record.','Assign the user Storage Blob Data Reader.','Complete registration of enough permitted recovery methods.'],3,'D satisfies the configured reset-verification requirement. A concerns cost alerts. B concerns DNS records. C grants blob permissions. None of those changes supplies the missing password-reset verification method.','entra/identity/authentication/tutorial-enable-sspr',2);
add(1,'1.1',104,'A new cloud user cannot receive a location-restricted Microsoft 365 service license because their usage location is missing. Which user property should you populate with the actual country/region of use?', ['Usage location','Office location','Department','Display name'],0,'A is the licensing location property. B is descriptive workplace information. C identifies an organizational department. D is a friendly name. Those descriptive fields do not replace Usage location for service availability and license assignment.','microsoft-365/admin/manage/assign-licenses-to-users?view=o365-worldwide',2);
add(1,'1.1',105,'An employee receives the same E5 product both directly and through a group. The employee leaves that group, and processing completes without errors. What happens to the product license?', ['It is always removed because group membership ended.','The group assignment is removed, but the direct assignment can keep the product licensed.','The direct assignment is converted into a guest account.','The entire tenant subscription is canceled.'],1,'B distinguishes independent assignment paths. A ignores the direct assignment. C confuses licensing with user type. D confuses an individual license assignment with the tenant subscription. Removing one source does not remove another valid source.','microsoft-365/admin/manage/manage-group-licenses?view=o365-worldwide');
add(1,'1.4',101,'A support engineer needs to restart VMs in one resource group and view their configuration, but should not manage VMs elsewhere. Which assignment scope is the narrowest listed scope that covers every VM in the group?', ['Tenant root management group','Subscription','That resource group','An unrelated storage account'],2,'C confines the VM-management role to the required resource group and its descendants. A and B grant at broader scopes. D neither contains nor grants access to those VMs. The role must also contain the necessary VM operations.','azure/role-based-access-control/scope-overview',2);
add(1,'1.4',102,'A user is Global Administrator in Microsoft Entra ID but has no Azure RBAC assignment and has not elevated access to Azure resources. Can that directory role alone manage VMs in a subscription?', ['Yes, it automatically gives Owner in every subscription.','Yes, but only for Windows VMs.','No; Azure resource management requires appropriate Azure RBAC access.','No; Global Administrators can never obtain Azure resource access.'],2,'C separates directory roles from Azure resource roles. A invents automatic Owner access. B invents an OS-specific exception. D is too broad: an authorized Global Administrator can use the documented elevate-access workflow and then arrange suitable access.','azure/role-based-access-control/rbac-and-directory-admin-roles');
add(1,'1.5',101,'A Modify policy assignment reports existing storage accounts missing a required tag. The assignment has an authorized managed identity. What applies the policy changes to those existing resources?', ['Wait for a compliance scan to rewrite them automatically.','Run a remediation task for the assignment.','Switch the effect to Audit.','Assign Reader to the resources.'],1,'B requests changes to existing noncompliant resources using the assignment identity. A confuses compliance evaluation with remediation. C only observes noncompliance. D grants read access and does not apply tag changes.','azure/governance/policy/how-to/remediate-resources');
add(1,'1.5',102,'A governance team wants allowed regions, required tags and approved VM sizes assigned and tracked together. Which Azure Policy object groups multiple policy definitions into one assignable unit?', ['Initiative definition','Resource lock','Role assignment','Action group'],0,'A groups policy definitions and can be assigned as one initiative. B prevents certain management operations. C grants permissions. D defines alert notification and automation actions. None of those three groups policy definitions.','azure/governance/policy/concepts/initiative-definition-structure',2);
add(1,'1.5',103,'A subscription budget sends an email when actual cost exceeds 80% of its threshold. No automation action has been configured. What happens when that threshold is reached?', ['All VMs are deallocated.','The subscription is suspended.','The configured alert is sent; resources continue running.','All resource creation is denied by Azure Policy.'],2,'C describes a budget notification. A and B would require separate controls or automation; a budget does not inherently stop consumption. D requires a policy assignment that the scenario does not include. Cost data and notifications are not instantaneous spending caps.','azure/cost-management-billing/costs/tutorial-acm-create-budgets',2);
add(1,'1.5',104,'An administrator needs recommendations about underutilized VMs that might be resized or shut down to reduce spend. Which Azure service provides these workload-aware cost recommendations?', ['Azure Advisor','Microsoft Entra access reviews','Azure DNS','Azure Resource Manager locks'],0,'A analyzes usage and offers cost recommendations to assess against workload requirements. B reviews identity access. C hosts DNS records. D blocks management changes but does not analyze utilization or recommend sizes.','azure/advisor/advisor-cost-recommendations',2);
add(1,'1.5',105,'A supported resource is moved from one resource group to another in the same subscription. Does that management move also relocate it to the target resource group metadata location?', ['Yes, every move physically relocates resources.','No; the resource keeps its region unless a separate supported regional move is performed.','Yes, if both resource groups have the same tags.','Only if the user has Reader.'],1,'B separates organizational scope from geographic deployment. A wrongly treats a resource-group move as a region move. C adds an unrelated tagging condition. D cannot perform the move and does not determine physical placement. Resource IDs and inherited access can change.','azure/azure-resource-manager/management/move-resource-group-and-subscription');
add(1,'1.5',106,'A resource is moving between resource groups. Its direct resource-scoped Azure RBAC assignment is needed after the move. What must the administrator plan?', ['Assume the direct assignment is automatically moved with the resource ID.','Remove all subscriptions from the tenant.','Recreate the needed resource-scoped assignment at the new resource ID and check inherited target-scope access.','Apply a tag named Owner to the resource.'],2,'C addresses the new resource ID and changed inheritance. A incorrectly assumes direct resource role assignments move automatically. B is unrelated and destructive. D is metadata, not authorization. Validate effective access after the supported move.','azure/azure-resource-manager/management/move-resource-group-and-subscription');
add(1,'1.5',107,'A subscription will be transferred to another Microsoft Entra directory. Which access-management impact needs explicit planning?', ['Azure RBAC assignments transfer unchanged to the new directory.','Existing role assignments/custom roles are affected and access must be recreated for identities in the target directory.','Resource tags become directory passwords.','Every VM automatically joins the target tenant\'s AD DS domain.'],1,'B reflects the directory-specific identities used by Azure RBAC; inventory roles and identity-dependent services before transfer. A incorrectly preserves tenant-bound assignments. C confuses metadata and credentials. D invents automatic guest-domain reconfiguration. A directory transfer is not merely a billing display change.','azure/role-based-access-control/transfer-subscription',4);
add(1,'1.5',108,'A ReadOnly lock on a storage account blocks an administrator from listing its access keys through Resource Manager. Why can a read-looking task fail?', ['The listKeys operation is a POST management operation blocked by ReadOnly.','ReadOnly invalidates every stored blob.','The lock removes all Entra user accounts.','ReadOnly requires rotating both keys first.'],0,'A explains that lock behavior follows the management operation, not its friendly name. B is wrong because the lock does not delete data. C is wrong because a resource lock does not manage directory users. D invents a prerequisite; key rotation does not bypass the lock.','azure/azure-resource-manager/management/lock-resources');
add(2,'2.5',101,'An Azure Files SMB share has supported identity-based authentication enabled. A user authenticates successfully but has neither a share-level permission nor a default share permission. File ACLs allow the user. What is missing?', ['A blob access tier','An appropriate share-level permission such as Storage File Data SMB Share Reader','A container anonymous-access setting','A lifecycle archive rule'],1,'B supplies the share-level authorization layer; file/directory ACLs must permit the access too. A and D concern blob tiering. C concerns anonymous blob access, not authenticated SMB. Authentication alone does not grant share permissions.','azure/storage/files/storage-files-identity-assign-share-level-permissions');
add(2,'2.5',102,'An identity-based Azure Files SMB user has share-level Contributor access but an NTFS ACL denies writing a particular folder. What is the expected result?', ['Share-level Contributor bypasses every file ACL.','The folder ACL still restricts access, so the denied write fails.','All files become publicly readable.','The SMB session is converted to anonymous blob access.'],1,'B is correct: effective access must pass both share-level authorization and file/directory ACL evaluation. A incorrectly makes RBAC an ACL bypass. C and D confuse SMB identity access with blob anonymous-access settings.','azure/storage/files/storage-files-active-directory-overview');
add(2,'2.5',103,'A file in an Azure Files share was overwritten after yesterday\'s share snapshot. You need the earlier file without reverting every file in the share. Which action fits?', ['Delete the storage account.','Change the share quota.','Browse the snapshot and copy the earlier file back to the live share.','Change a blob from Hot to Cool.'],2,'C restores the selected file content from a read-only point-in-time share snapshot. A destroys resources rather than recovering one file. B changes capacity limits. D affects blob tiering and cannot restore an SMB file version.','azure/storage/files/storage-snapshots-files',2);
add(2,'2.1',101,'A standard Azure Storage account uses Microsoft-managed encryption keys. Must an administrator enable encryption before newly uploaded data is encrypted at rest?', ['Yes, only customer-managed keys encrypt storage.','Yes, by enabling anonymous access.','No, Azure Storage encrypts data at rest by default; key-management options determine who manages the keys.','No, because HTTPS alone encrypts stored disks.'],2,'C separates default server-side encryption from key ownership. A wrongly limits encryption to customer-managed keys. B is unrelated to encryption. D confuses encryption in transit with encryption at rest.','azure/storage/common/storage-service-encryption',2);
add(2,'2.1',102,'Two supported GPv2 accounts must asynchronously replicate selected block blobs using object replication. Which prerequisite set should you configure?', ['Versioning on both accounts and change feed on the source, plus the replication policy','Only a private DNS zone','Only GRS on the destination','Only container soft delete on the source'],0,'A supplies the version/change tracking used by object replication and its policy. B provides naming, not replication. C is account redundancy rather than a selected-container object-replication policy. D protects deleted containers but does not enable object replication. Confirm account/feature compatibility before configuring.','azure/storage/blobs/object-replication-overview');
add(2,'2.5',104,'A script deletes an Azure file share. File-share soft delete was enabled beforehand and its retention period has not expired. What can be recovered?', ['Only the storage account name','The deleted share and its contents by undeleting the share','Any individually overwritten file without snapshots','Only the access keys'],1,'B is the share-deletion recovery operation. A ignores the retained share data. C overstates this protection: share soft delete is not individual-file versioning. D confuses credentials with recovery data. Recovery requires the retained share and surviving storage account.','azure/storage/files/storage-files-prevent-file-share-deletion',2);
add(3,'3.5',101,'A Bicep file declares param location string = resourceGroup().location. Deployment passes location=westus3. Which value is used for that parameter?', ['The resource-group location always overrides supplied parameters.','westus3, because the deployment supplied an explicit value.','The Bicep source file folder name.','The tenant home region.'],1,'B overrides the default with the supplied value. A reverses parameter precedence. C is not a Bicep location expression. D is not the value of resourceGroup().location. Defaults are used when the caller does not supply that parameter.','azure/azure-resource-manager/bicep/parameters',2);
add(3,'3.5',102,'A resource-group-scoped main.bicep must be deployed into an existing resource group named study-rg using Azure CLI. Which command creates the deployment?', ['az bicep build --file main.bicep','az deployment group create --resource-group study-rg --template-file main.bicep','az group show --name study-rg','az deployment sub create --location eastus --template-file main.bicep'],1,'B submits a resource-group deployment. A compiles Bicep to JSON without deploying resources. C reads group metadata. D submits at subscription scope, which does not match this file\'s stated scope.','azure/azure-resource-manager/bicep/deploy-cli',2);
add(3,'3.5',103,'Before deploying a changed Bicep file, you need a preview of expected resource changes without applying them. Which Azure CLI operation fits?', ['az deployment group what-if','az deployment group create','az group delete','az bicep decompile'],0,'A previews expected changes for a supported group deployment; review the output and its documented limitations. B applies a deployment. C deletes the group. D converts ARM JSON to Bicep and does not preview live changes.','azure/azure-resource-manager/bicep/deploy-what-if',2);
add(3,'3.5',104,'An existing ARM JSON template needs to become a starting point for maintainable Bicep. Which operation helps, and what must happen afterward?', ['Rename its .json extension to .bicep; no validation is needed.','Run az bicep decompile --file template.json, then review and fix the generated Bicep.','Run az bicep build on the JSON to deploy it.','Export its contents to a CSV file and import it as users.'],1,'B performs best-effort conversion; decompilation may need corrections and refactoring. A does not change JSON syntax into Bicep. C confuses compilation direction and deployment. D is an identity import workflow, unrelated to ARM.','azure/azure-resource-manager/bicep/decompile',3);
add(3,'3.5',105,'A Bicep web app resource uses serverFarmId: plan.id, where plan is another resource declared in the same file. What does this symbolic reference normally establish?', ['An implicit dependency so the app waits for the plan deployment','Automatic public DNS registration for a custom domain','A permanent deny assignment on the plan','A requirement to use a separate deployment script for ordering'],0,'A follows Bicep\'s dependency inference from a resource reference. B is a separate DNS configuration. C requires a protection mechanism not declared here. D is unnecessary because the declarative reference supplies the dependency. Use explicit dependsOn only when needed.','azure/azure-resource-manager/bicep/resource-dependencies',3);
add(3,'3.1',101,'A supported Azure VM must encrypt temporary disks and disk caches at the host, including data flowing from the host to storage. Which setting addresses this?', ['Encryption at host','Only an NSG inbound deny rule','Only a CanNotDelete lock','Only HTTPS for the application'],0,'A encrypts supported VM host-side storage paths, subject to size and feature compatibility. B filters network traffic. C protects management deletion. D secures application transport but does not encrypt VM temporary storage and caches.','azure/virtual-machines/disks-enable-host-based-encryption-portal',3);
add(3,'3.1',102,'A VM must move from one Azure region to another. An administrator proposes changing only its resource group. What should the administrator do instead?', ['Use a supported regional move workflow, such as Azure Resource Mover for the VM and its dependencies.','Rename the existing resource group.','Add a tag named Region to the VM.','Change only the resource group metadata location.'],0,'A handles regional relocation and associated dependencies using a supported workflow. B and C only change organization or metadata. D does not move the VM\'s compute and disks. Check support, quotas, networking and post-move validation.','azure/resource-mover/tutorial-move-region-virtual-machines',3);
add(3,'3.1',103,'A managed data disk is expanded successfully in Azure, but Windows still shows the old usable volume size. What is the next likely step?', ['Extend the partition/filesystem in the guest using supported disk-management tools.','Change the NSG priority.','Enable a new public IP on the VM.','Move the VM to another tenant.'],0,'A makes the extra block capacity usable inside the guest. B and C change networking. D changes administrative identity context. None of those three extends a guest partition. Check backups, filesystem constraints and disk support before resizing.','azure/virtual-machines/windows/expand-os-disk',3);
add(3,'3.4',101,'A web app owner wants www.example.com to resolve to an App Service hostname and prove domain ownership. Which external DNS records are typically used for this subdomain mapping?', ['A CNAME for www to the app hostname and the required asuid.www TXT verification record','An MX record and an SPF TXT record only','A PTR record for the app private address only','An NSG rule named www.example.com'],0,'A provides the subdomain mapping and domain-verification value requested by App Service. B configures mail rather than web routing/ownership. C is reverse DNS rather than the required forward mapping. D is not DNS. Add the validated hostname in App Service and configure TLS separately.','azure/app-service/app-service-web-tutorial-custom-domain',3);
add(4,'4.1',101,'A subnet route table contains 0.0.0.0/0 to a virtual appliance and 10.50.0.0/16 to another valid next hop. A packet is destined for 10.50.2.7. Which matching prefix is selected first by Azure route selection?', ['0.0.0.0/0 because it was entered first','10.50.0.0/16 because it is the longest matching prefix','Both routes in round-robin order','Neither, because overlapping route prefixes are invalid'],1,'B applies longest-prefix match. A incorrectly uses creation order. C assumes multipath distribution between different prefix lengths. D mistakes valid route-prefix overlap for invalid address-space overlap. Equal-prefix route source preferences are a separate decision.','azure/virtual-network/virtual-networks-udr-overview',3);
add(4,'4.1',102,'A user-defined route sends packets to a network virtual appliance VM. Routes and NSGs are correct, but transit packets do not forward. Which configuration must be checked on the appliance?', ['IP forwarding enabled on the Azure NIC and appropriate routing/forwarding in its guest OS','Blob versioning on its OS disk','A Microsoft 365 license for the route table','A DNS CNAME for each destination packet'],0,'A enables the appliance to accept and forward transit traffic at both Azure NIC and guest levels. B is a blob feature, not IP forwarding. C is unrelated licensing. D changes names and cannot implement transit routing.','azure/virtual-network/virtual-networks-udr-overview',3);
add(4,'4.1',103,'A new public Standard Load Balancer needs an IPv4 frontend public IP resource. Which listed choice is compatible?', ['A Basic dynamic public IP','A Standard static public IP','An Azure private DNS A record only','A NIC private IP configuration without a public IP resource'],1,'B matches the Standard public frontend requirement and static allocation. A uses the retired incompatible Basic public IP SKU. C creates a name record, not a frontend public IP. D describes private addressing, not the requested public frontend.','azure/virtual-network/ip-services/public-ip-addresses',2);
add(4,'4.4',101,'You create a public Azure DNS zone for example.com. The domain remains registered elsewhere. What makes the internet use Azure DNS as its authoritative host?', ['Set the registrar delegation to the name servers assigned to the Azure DNS zone.','Enable private-zone auto-registration.','Create an NSG inbound rule for port 53 on every VM.','Move every web server into the DNS zone resource group.'],0,'A delegates authority through the parent/registrar configuration. B is for private DNS VM registration. C changes VM traffic filtering, not public zone delegation. D changes resource organization. Creating a hosted zone alone does not update registrar delegation.','azure/dns/dns-delegate-domain-azure-dns',3);
add(4,'4.4',102,'An Azure public DNS zone needs app.example.com to point to the hostname service.example.net, not a fixed IP address. Which record type fits the app subdomain?', ['A','AAAA','CNAME','MX'],2,'C aliases the subdomain to another hostname. A stores an IPv4 address. B stores an IPv6 address. D identifies mail exchangers. This question uses a subdomain; a zone apex has additional CNAME restrictions.','azure/dns/dns-zones-records',2);
add(4,'4.4',103,'A Standard Load Balancer TCP probe marks a VM unhealthy. Its backend service listens on the probe port, but a custom NSG rule denies the AzureLoadBalancer service tag before the default probe allow rule. What should you change?', ['Permit the probe traffic with an appropriate higher-precedence NSG rule.','Disable every security rule in the subscription.','Replace the private DNS zone.','Add a lifecycle policy to the backend disk.'],0,'A allows the health probe to reach the listening backend while keeping other restrictions. B is unnecessary and overly broad. C does not override a packet-filter deny. D is unrelated. Use the actual probe port and assess guest-firewall rules too.','azure/load-balancer/load-balancer-custom-probe-overview',3);
add(5,'5.1',101,'A VM emits platform metrics, but its Windows event logs are absent from Log Analytics. Which configuration collects the selected guest events with the current Azure Monitor agent model?', ['Only a resource ReadOnly lock','Azure Monitor Agent plus an associated data collection rule specifying the events and workspace destination','Only a VM CPU metric alert','Only a blob lifecycle rule'],1,'B installs the guest collection agent and associates collection instructions and destination through a DCR. A controls management writes. C evaluates an existing metric rather than collecting events. D manages blob retention. Installing an agent without the right collection rule/destination is insufficient.','azure/azure-monitor/agents/azure-monitor-agent-overview',3);

```

## scripts/review-az104-d1.mjs

```js
import { fix, mcq, source, get } from './review-az104-helpers.mjs';
const id=n=>`az104-1-${n<=5?'1.1':n<=10?'1.2':n<=15?'1.3':n<=20?'1.4':'1.5'}-${String(n).padStart(3,'0')}`;
const src=(ns,url)=>source(ns.map(id).join(' '),url);
src([1],'entra/external-id/user-properties');
src([2],'entra/identity/users/users-bulk-add');
src([3],'microsoft-365/admin/create-groups/compare-groups?view=o365-worldwide');
src([4],'entra/identity/users/groups-dynamic-membership');
src([5],'microsoft-365/admin/manage/manage-group-licenses?view=o365-worldwide');
src([6,8],'entra/identity/conditional-access/concept-conditional-access-policies');
src([7],'entra/identity/conditional-access/policy-block-legacy-authentication');
src([9],'entra/identity/authentication/concept-authentication-strengths');
src([10],'entra/identity/authentication/howto-mfa-userstates');
src([11,12],'entra/id-governance/privileged-identity-management/pim-resource-roles-configure-role-settings');
src([13],'entra/id-governance/access-reviews-overview');
src([14,15],'entra/id-protection/howto-identity-protection-configure-risk-policies');
src([16,17,19,20],'azure/role-based-access-control/overview');
src([16,20],'azure/role-based-access-control/built-in-roles/privileged');
src([18],'azure/role-based-access-control/deny-assignments');
src([19],'azure/role-based-access-control/resource-provider-operations#microsoftcompute');
src([21],'azure/governance/policy/concepts/effect-append');
src([22],'azure/azure-resource-manager/management/lock-resources');
src([23],'azure/azure-resource-manager/management/tag-resources');
src([24],'azure/governance/management-groups/overview');
fix(id(1),'Guest authentication and UserType are independent; distinguish invited external guests and Teams standard channels from shared channels.',{stem:get(id(1)).stem.replace('a Teams channel','a Teams standard channel'),explanation:'A is correct for these invited external guests: their external identity provider or email passcode authenticates them; the resource tenant does not issue their password. B is wrong because invitation does not require directory synchronization. C is wrong because guests can join security groups. D is wrong because accepting a guest invitation does not automatically change UserType to Member. UserType alone does not identify the authentication provider.'});
mcq(id(2),'Invented Conditional Access bulk-upload and subscription CSV distractors are implausible; bulk creation is an asynchronous job, not atomic provisioning.',
'An administrator has a CSV with 200 new cloud-only employees. Which Microsoft Entra operation accepts the user-creation template and submits all rows as one bulk job?',
['Users > Bulk operations > Bulk create','Groups > Bulk operations > Import members','Users > Bulk operations > Bulk invite','Users > Bulk operations > Download users'],0,
'A creates cloud users from the downloaded CSV template, which includes name, UPN, initial password, and block-sign-in fields. Validate the file and inspect job results for row failures. B adds existing users to a group. C invites external collaborators. D exports existing users rather than creating them.',2);
fix(id(3),'Mail-enabled security groups exist in Exchange Online; a Microsoft 365 group does not automatically create a Team, and its group mailbox is not a standalone shared mailbox.',{stem:'A project needs a group mailbox and calendar, a SharePoint team site, and the ability to create a Microsoft Teams team backed by the same membership. Which group type should you choose?',explanation:'A provides the Microsoft 365 collaboration membership and group mailbox/calendar; a Team can be created using that group. B is for access control and has no collaboration mailbox. C is available in Exchange Online but provides mail distribution plus security membership, not the Microsoft 365 collaboration workspace. D contains devices rather than project users. Entra role assignments require a specifically role-assignable group.'});
fix(id(4),'Rule example uses noncanonical single-quoted values and does not state Member status or attribute population; evaluation is asynchronous.',{stem:'A licensed tenant has an enabled dynamic security group with rule (user.department -eq "Sales") -and (user.userType -eq "Member"). A new cloud user has department Sales and UserType Member. What happens after membership processing completes?',explanation:'A is correct because both user attributes match the enabled rule. Membership processing is asynchronous, so it need not appear immediately. B is wrong because rules are reevaluated after relevant changes. C is wrong because this group has no per-member approval workflow. D is wrong because department is a supported string property.',difficulty:2});
fix(id(5),'Group name does not define its rule; department versus city is inconsistent, and another assignment could preserve the same license.',{stem:'The licensed dynamic group All-Seattle-Staff uses user.city -eq "Seattle" and is Maria\'s only source of Microsoft 365 E5. Her city changes to Portland. After membership and license processing succeed, what happens?',explanation:'A is correct: Maria no longer matches this group, so its E5 assignment is removed. B is wrong because group-based assignments follow membership. C is wrong because leaving a group does not create a direct assignment. D is wrong because the dynamic rule processes the change automatically. An independent direct or other-group assignment could retain E5, but the scenario excludes those.',difficulty:3});
fix(id(6),'Access controls also include session controls; original definition omits them.',{choices:get(id(6)).choices.map(c=>c.key==='A'?{...c,text:'Assignments (who and what the policy targets) and access controls (grant/block and session controls).'}:c),explanation:'A names the two policy sections: assignments select users, resources and applicable conditions; access controls specify grant requirements, blocking, and session behavior. B lists inputs within assignments. C lists only two assignment categories. D omits user/resource assignments and grant controls, so neither is the complete pair.',difficulty:2});
fix(id(7),'IMAP/POP are not inherently legacy authentication: OAuth clients exist; target resources and enabled policy state were unstated.',{stem:'A tenant with Conditional Access licensing enables a policy for a pilot user group and All resources, selecting only Exchange ActiveSync clients and Other clients under legacy authentication client apps, with Block access. Which requests does this policy block?',choices:get(id(7)).choices.map(c=>c.key==='A'?{...c,text:'Legacy-authentication requests matching those client-app categories; this policy does not block modern-authentication requests.'}:c),explanation:'A follows the selected legacy client-app condition. Protocols such as IMAP can also use OAuth, so this is not a blanket protocol ban. B is wrong because browser sign-ins do not match that condition. C is wrong because these legacy requests cannot satisfy an interactive MFA challenge. D is wrong because no network restriction is configured. Other policies may still affect modern clients.'});
fix(id(8),'An exclusion from one policy does not guarantee no MFA prompt; other policies and existing MFA claims matter.',{choices:get(id(8)).choices.map(c=>c.key==='A'?{...c,text:'This policy does not require MFA at headquarters; it still imposes an MFA requirement outside that excluded location.'}:c),explanation:'A describes this policy only: the excluded network does not match its assignments. Other policies or per-user MFA can still require MFA, and an existing claim can satisfy a requirement without another prompt. B is wrong because exclusion does not block. C is wrong because each policy must reference a location. D is wrong because named IP locations support both IPv4 and IPv6.'});
fix(id(9),'An app password is an obvious nonfactor distractor; avoid the undefined superlative strongest.',{stem:'Which listed Microsoft Entra authentication method satisfies the built-in phishing-resistant MFA authentication strength?',choices:get(id(9)).choices.map(c=>c.key==='D'?{...c,text:'A password plus a time-based one-time code from an authenticator app'}:c),explanation:'A uses origin-bound public-key credentials and is included in phishing-resistant MFA strength. B and C can be redirected or relayed and do not satisfy that strength. D provides two factors, but a one-time code can be relayed by a phishing site; MFA is not automatically phishing-resistant.'});
fix(id(10),'Enforced per-user MFA does not prompt on every sign-in; remembered sessions and valid MFA claims exist.',{stem:get(id(10)).stem+' Assume the new sign-in has no valid MFA claim or remembered MFA session.',explanation:'A is correct under the stated fresh-session assumption: excluding a user from this Conditional Access policy does not remove independent per-user MFA enforcement. B incorrectly treats exclusion as a global bypass. C invents a block that was not configured. D is wrong because creating a Conditional Access policy does not change per-user MFA state automatically.'});
fix(id(11),'Eligible assignment does not erase permissions from other roles; active does not mean permanent.',{stem:'A contractor has only an eligible PIM Contributor assignment on a subscription, no active role assignments, and has not activated it. What permissions does that eligible assignment currently provide?',explanation:'A is correct: eligibility permits requesting activation but does not itself grant Contributor access. B confuses eligibility with active access; active assignments can be time-bound or permanent. C requires a separate approver designation. D is wrong because activation follows configured requirements and has an expiry; eligibility does not authorize permanent self-assignment.'});
fix(id(12),'Maximum activation duration does not establish the duration actually requested.',{stem:get(id(12)).stem.replace('A developer\'s activation request is approved','A developer requests the full 4 hours; the request is approved'),explanation:'A is correct because the approved four-hour activation runs from 9:00 AM to 1:00 PM. A shorter request would expire earlier. B ignores the expiry. C is wrong because each request is subject to the configured approval requirement. D is wrong because justification does not replace the MFA requirement; a valid existing MFA claim may satisfy it.'});
fix(id(13),'Reviewing guests does not automatically remove every route to a resource group; nonresponses need an explicit fallback decision.',{stem:'External guests receive a resource-group role only through one security group. You want quarterly membership reviews by project managers, with denied memberships and unanswered reviews removed automatically using configured fallback decisions. Which feature provides this?',explanation:'A supports recurring group membership reviews, automatic application of results, and a configured decision for unanswered reviews. Removing this group membership removes the stated access path. B grants temporary privileged access rather than reviewing this group. C responds to risk detections. D controls session behavior rather than recurring membership attestation.'});
fix(id(14),'Legacy ID Protection policies retire October 1, 2026; original explanation incorrectly says policies can never be tenant-wide.',{stem:get(id(14)).stem.replace('Which response matches each detection?','Using risk-based Conditional Access, which response matches each detection?'),choices:get(id(14)).choices.map(c=>c.key==='A'?{...c,text:'Use a sign-in risk condition to require appropriate authentication or block the attempt, and a user risk condition to require secure password remediation for a password-based user.'}:c),explanation:'A distinguishes attempt risk from account-compromise risk. B is wrong because user-risk Conditional Access can enforce controls. C confuses user risk with sign-in risk. D is wrong because sign-in risk does not inherently reset every password; policy scope and grant controls determine the response. Use Conditional Access rather than designing new legacy ID Protection risk policies.'});
fix(id(15),'Password remediation requires MFA/SSPR readiness and supported account configuration; overlaps with 014, so make this test prerequisites rather than repeat risk mapping.',{stem:'A cloud-only password user is covered by an enabled user-risk Conditional Access policy requiring secure password change. The user has not registered any MFA/SSPR methods. What must the rollout address before this user can reliably self-remediate high risk?',choices:[{key:'A',text:'Ensure the user is registered for the required MFA and self-service password reset methods before risk enforcement.',correct:true},{key:'B',text:'Set the same user-risk policy to Block access instead.',correct:false},{key:'C',text:'Replace user risk with a device-compliance condition only.',correct:false},{key:'D',text:'Exclude the user permanently from all risk-based policies.',correct:false}],explanation:'A supplies the authentication and password-reset prerequisites for self-remediation. B blocks the user without enabling password recovery. C does not remediate the compromised password. D removes enforcement rather than making secure self-remediation work.'});
fix(id(16),'Contributor does not exclude all Microsoft.Authorization operations.',{explanation:'A manages resources but cannot assign Azure RBAC roles. B also permits access management, exceeding the requirement. C cannot create or change the VMs. D manages access assignments rather than VM resources. Contributor excludes specific privileged operations; it does not exclude every Microsoft.Authorization operation.'});
fix(id(17),'Union of grants is accurate, but cannot imply bypassing denies, policies or locks.',{stem:get(id(17)).stem+' Assume no deny assignment, lock, or policy blocks the requested operation.',explanation:'A is correct: the resource-group Contributor grant includes those VM management operations, and the inherited Reader grant does not subtract them. B incorrectly treats a higher-scope allow as a restriction. C incorrectly cancels grants. D incorrectly relies on assignment order. Effective allow permissions are additive; separate enforcement such as deny assignments can still block an operation.'});
fix(id(18),'Deny assignments may exclude principals; Owner can sometimes change the protecting stack, though the current delete is denied.',{stem:get(id(18)).stem.replace('Sam attempts','Sam is not an excluded principal and the deny assignment remains in place. Sam attempts'),explanation:'A is correct for this direct delete: the applicable deny blocks it despite Owner. B incorrectly treats Owner as a bypass. C invents a waiting period. D incorrectly limits denies to lower roles. Deny scope and excluded principals matter; changing the protecting stack is a different operation.'});
fix(id(20),'Unrestricted User Access Administrator can grant itself Owner; original requirement incorrectly implies a security boundary against escalation.',{stem:'Which listed built-in role directly grants Azure RBAC access-management permissions without directly granting general creation or deletion of VMs and storage accounts? Consider the role itself, not new roles its holder could assign.',explanation:'A grants access-management permissions and resource read access, not general workload management. B includes general resource management. C manages workloads but cannot assign roles. D is a security read role. An unrestricted access administrator can assign a more powerful role, so this alone is not an anti-escalation boundary.',difficulty:3});
fix(id(21),'Append can deny conflicting requests; DeployIfNotExists is not automatic remediation of all existing resources.',{explanation:'A is the direct effect for rejecting a VM request whose SKU is outside the allowed list. B records noncompliance without blocking. C adds properties and can reject conflicting values, but is not the intended allowed-SKU validation effect. D checks/deploys related configuration after resource provisioning; existing resources need a remediation task and suitable permissions.'});
fix(id(22),'ReadOnly locks affect the control plane, not all writes inside the VM; options B and C were duplicates.',{choices:get(id(22)).choices.map(c=>c.key==='A'?{...c,text:'The portal restart fails because the inherited ReadOnly lock blocks the management-plane restart operation.'}:c.key==='C'?{...c,text:'Azure shuts down the VM as soon as the ReadOnly lock is applied.'}:c),explanation:'A is correct: restarting through Azure Resource Manager is a POST action blocked by ReadOnly. B wrongly exempts power actions. C is wrong because applying the lock does not stop a running VM. D reverses the lock behavior: CanNotDelete permits restart. A control-plane lock does not prevent a guest administrator from changing files or rebooting inside the OS.'});
fix(id(23),'Any scope wrongly includes management groups; prefer Modify for tag inheritance.',{choices:get(id(23)).choices.map(c=>c.key==='A'?{...c,text:'Tags do not automatically inherit; use a suitable Modify policy to copy the resource-group tag.'}:c),explanation:'A is correct: tags on a resource group describe that group. A Modify policy can copy them to supported resources; existing resources require remediation. B is wrong because supported resources, resource groups, and subscriptions can be tagged. C invents a five-tag limit. D invents automatic propagation; waiting does not create inheritance. Management groups do not support tags.'});
fix(id(24),'Tenant root management group is also defensible unless unrelated subscriptions are explicitly excluded.',{stem:'Your tenant contains 20 subscriptions. Enforce an allowed-locations policy on only the dev, test, and prod subscriptions with one assignment, without per-subscription exclusions. Which approach fits?',choices:get(id(24)).choices.map(c=>c.key==='C'?{...c,text:'Assign the policy to the tenant root management group containing all 20 subscriptions.'}:c),explanation:'A scopes one inherited policy assignment to the three subscriptions in a dedicated management group. B would require three assignments. C affects all 20 subscriptions and violates the requested scope. D is wrong because management groups contain subscriptions and other management groups, not resource groups directly.'});
fix('az104-fc-1-001','UserType does not determine where credentials are managed.',{back:'Member and Guest describe the user relationship and default directory permissions. Authentication is separate: invited external guests usually use an external identity provider or email passcode, but external members and internal guests also exist.'});
fix('az104-fc-1-003','Microsoft 365 group mailbox/Team and role-assignable group distinctions.',{back:'Security groups grant resource access; Entra role assignments require a role-assignable group. Microsoft 365 groups provide a group mailbox, calendar and SharePoint site and can back a Team. Creating a group alone does not automatically provision a Team.'});
fix('az104-fc-1-004','Use supported expression syntax and asynchronous evaluation.',{back:'An expression such as user.department -eq "Sales" determines membership from supported attributes. Enabled rules reevaluate changes asynchronously; direct manual membership editing is not supported.'});
fix('az104-fc-1-005','Session controls omitted.',{back:'Assignments select the users, resources and conditions. Access controls specify grant/block requirements and session controls. All applicable enabled policies must be satisfied.'});
fix('az104-fc-1-006','Protocols can use OAuth; legacy authentication is not equivalent to IMAP/POP/SMTP.',{back:'Basic/legacy authentication requests cannot complete modern MFA. Conditional Access can block the legacy client-app categories. IMAP, POP and SMTP can also use OAuth, so blocking legacy authentication does not mean banning every implementation of those protocols.'});
fix('az104-fc-1-007','Active assignments need not be permanent.',{back:'Eligible assignments require activation before their role permissions can be used. Active assignments can be used without further activation and may be permanent or time-bound. Activation requirements depend on role settings.'});
fix('az104-fc-1-008','Use risk-based Conditional Access terminology.',{back:'Sign-in risk estimates whether an authentication attempt is illegitimate; user risk estimates whether the account is compromised. Use these conditions in Conditional Access for appropriate authentication, blocking, or password remediation. Legacy ID Protection risk policies retire October 1, 2026.'});
fix('az104-fc-1-010','Remediation prerequisites omitted.',{back:'Audit records noncompliance. Deny rejects noncompliant creation/update requests. DeployIfNotExists can deploy missing related configuration using the policy assignment identity and permissions; existing noncompliant resources need a remediation task.'});
fix('az104-fc-1-011','Locks do not protect the data plane.',{back:'CanNotDelete blocks management-plane deletion but permits changes. ReadOnly also blocks management-plane writes and actions such as portal restart. Both inherit to child resources; neither blocks data-plane operations such as writes inside a VM.'});
fix('az104-fc-1-012','Management-group locks do not exist.',{back:'Management groups organize subscriptions and other management groups. Azure Policy and RBAC assignments inherit to descendants. Resource locks are applied at subscription, resource-group, or resource scope, not management-group scope.'});
fix('az104-pbq-1-001','Named locations need not be trusted or IP-only; risk response uses Conditional Access.',{pairs:get('az104-pbq-1-001').pairs.map(p=>p.left==='Named locations'?{...p,right:'Defines network locations, including IP ranges or countries, for Conditional Access'}:p.left==='Identity Protection'?{...p,right:'Detects account and sign-in risk that risk-based Conditional Access policies can act on'}:p),explanation:'Conditional Access enforces access requirements; PIM supports temporary role activation; access reviews attest continued access; Identity Protection supplies risk detections; SSPR enables password self-service; named locations describe networks or countries for policy conditions.'});
fix('az104-pbq-1-002','Append and DeployIfNotExists explanation overpromises remediation.',{explanation:'Audit records noncompliance; Deny blocks matching requests; Append adds properties and can deny conflicting values (Modify is preferred for tags); DeployIfNotExists deploys related configuration with suitable identity permissions and needs a remediation task for existing resources; Disabled skips evaluation.'});
fix('az104-ac-008','Azure AD B2C is a distinct legacy offering, not simply renamed into External ID.',{hint:'Customer identity scenario; Microsoft Entra External ID is the current customer identity offering, while Azure AD B2C is a separate legacy product.'});

```

## scripts/review-az104-d2.mjs

```js
import { fix, mcq, source, get } from './review-az104-helpers.mjs';
const id=(o,n)=>`az104-2-2.${o}-${String(n).padStart(3,'0')}`;
const src=(o,ns,url)=>source(ns.map(n=>id(o,n)).join(' '),url);
src(1,[1,2,5],'azure/storage/common/storage-account-overview');
src(1,[3,4,6],'azure/storage/common/storage-redundancy');
src(2,[1],'azure/storage/blobs/access-tiers-overview');
src(2,[2],'azure/storage/blobs/archive-rehydrate-overview');
src(2,[3,4],'azure/storage/blobs/lifecycle-management-policy-structure');
src(2,[5],'azure/storage/blobs/versioning-overview');
src(2,[6],'azure/storage/blobs/soft-delete-container-overview');
src(3,[1],'rest/api/storageservices/define-stored-access-policy');
src(3,[2,6],'rest/api/storageservices/create-user-delegation-sas');
src(3,[3],'azure/storage/common/storage-account-keys-manage');
src(3,[4],'azure/storage/common/storage-private-endpoints');
src(3,[5],'azure/storage/common/storage-network-security');
src(4,[1],'azure/storage/common/storage-use-azcopy-blobs-upload');
src(4,[2],'azure/storage/common/storage-use-azcopy-blobs-synchronize');
src(4,[3],'azure/storage/common/storage-use-azcopy-authorize-service-principal');
src(4,[4],'azure/storage/storage-explorer/vs-azure-tools-storage-manage-with-storage-explorer');
src(4,[5],'azure/storage/file-sync/file-sync-cloud-tiering-overview');
src(4,[6],'azure/storage/file-sync/file-sync-planning');
fix(id(1,1),'Premium Files supports NFS too; avoid unmanaged-disk recommendations and an unsupported universally lowest-cost claim.',{stem:'A team needs one standard-performance storage account for blobs, Azure file shares, queues and tables. Which account type supports all four services?',explanation:'A supports all four services in one general-purpose v2 account. B is specialized for premium block/append blobs. C hosts Azure Files (SMB or NFS, subject to share configuration), not queues and tables. D is specialized for premium page blobs. Choose by supported services and workload economics, not an assumption that one type always costs least.'});
fix(id(1,2),'Very low latency is vague; anchor the selection to the specified premium block-blob workload and HNS capability.',{stem:'A benchmark shows that a data-lake workload needs premium-performance block blob storage with hierarchical namespace. Which listed account type supports that combination?',explanation:'B supports premium block/append blobs and hierarchical namespace. A supports hierarchical namespace but uses standard performance. C is an Azure Files account. D hosts page blobs and does not provide the requested hierarchical block-blob namespace.'});
mcq(id(1,3),'Geo-replication is asynchronous and cannot guarantee zero loss; access tier is a weak redundancy distractor.',
'A standard GPv2 blob account needs an asynchronously replicated copy in a second region. Zonal availability and pre-failover read access to the secondary are not required. Which option provides this at lower cost than its read-access variant?',
['LRS','ZRS','GRS','RA-GRS'],2,
'C adds asynchronous secondary-region replication. Recent writes may be absent from that replica after a disaster. A stays within one primary-region location. B spreads data across primary-region zones only. D also enables secondary reads, an extra capability this scenario does not require.',3);
fix(id(1,4),'Applications must use the secondary endpoint; failover is not solely Microsoft initiated.',{stem:'An application can retry reads against the secondary blob endpoint and tolerate replication lag during a primary-region outage. Which option allows those reads before any account failover?',explanation:'D permits reads from the secondary endpoint before failover. C has a secondary copy but does not expose it for reads before failover. A protects only local copies; versioning does not add another region. B protects against zonal failure in the primary region. Geo-replication is asynchronous, so secondary reads can be stale.'});
mcq(id(1,5),'Impossible starting configuration: premium page blob accounts support LRS, not ZRS; premium redundancy options are not identical.',
'A premium page blob storage account uses LRS. A new requirement calls for a supported built-in geo-redundancy setting on that same account type. Which conclusion is correct?',
['Change the account to GZRS without changing its type.','Change the account to RA-GRS without changing its type.','Enable ZRS, which automatically adds a second region.','Premium page blob accounts do not offer built-in geo-redundancy; redesign data protection for a supported workload/account type.'],3,
'D is correct: premium page blob accounts support LRS, so a supported protection or migration design is required. A and B select unavailable settings for that account type. C is wrong twice: this account type does not support ZRS, and ZRS alone is single-region.',3);
fix(id(1,6),'RA-GZRS uses LRS in the secondary, not ZRS in both regions; GRS and GZRS have the same published durability target.',{stem:'A standard GPv2 blob workload requires zone redundancy in its primary region, an asynchronous copy in a second region, and read access to that secondary before failover. Which option fits?',explanation:'B combines primary-region ZRS with secondary-region LRS and permits secondary reads. A lacks primary-region ZRS. C has no second-region copy. D is local redundancy only. RA-GZRS does not make the secondary zone-redundant, and replication lag can cause stale reads or data loss.'});
mcq(id(2,1),'Cold is online with fast access, not hours-scale retrieval; original few-hours deadline made Archive ambiguous.',
'Compliance block blobs will remain unchanged for at least 180 days and are read very rarely. Auditors require immediate online reads without rehydration. Among these fixed access tiers, which has the lowest storage-capacity price?',
['Hot','Cool','Cold','Archive'],2,
'C is the lowest-capacity-cost online tier listed; it has a 90-day minimum retention charge and higher access charges. A and B remain online but have higher capacity prices. D has lower capacity pricing but is offline and requires rehydration, violating immediate access. Total cost also depends on reads and transactions.',3);
fix(id(2,2),'Set Blob Tier also rehydrates archive data; copying is not mandatory.',{choices:get(id(2,2)).choices.map(c=>c.key==='B'?{...c,text:'Request Set Blob Tier to an online tier, or copy to a new online blob, then wait for rehydration to complete.'}:c),explanation:'B describes both supported paths: rehydrate in place with Set Blob Tier or copy to a new online blob. Standard-priority rehydration can take hours; higher priority is not an unconditional instant-read guarantee. A confuses available metadata with offline content. C wrongly promises immediate reads. D denies a supported recovery operation.'});
fix(id(2,3),'Lifecycle age is selected explicitly by condition; creation time can be used and there is no universal default.',{stem:'A lifecycle rule for current block blobs uses daysAfterModificationGreaterThan: 30 for tierToCool. Which timestamp determines that condition?',explanation:'B is correct because this named condition compares the current time with the blob last-modified timestamp. A would require a creation-time condition. C is unrelated to blob age. D would require last-access tracking and the corresponding condition. Different lifecycle conditions deliberately use different clocks.'});
mcq(id(2,4),'Tag-based filtering is defensible if configured; use actual prefix mistakes instead of an unnecessary alternate workflow.',
'An LRS GPv2 account has block blobs in invoices and receipts. A lifecycle rule must match only names beginning 2024/ in invoices. Which case-sensitive prefixMatch value should it contain?',
['2024/','invoices/2024/','invoices/*/2024/','https://acct.blob.core.windows.net/invoices/2024/'],1,
'B begins with the container name followed by the required blob-name prefix. A omits the container. C treats an asterisk as a wildcard, but prefixMatch uses literal prefixes. D supplies a URL instead of the container/blob prefix. The rule must also specify the supported blob type and desired age/action.',3);
fix(id(2,5),'Versioning must be enabled before the overwrite and supported for the account.',{stem:'Blob versioning is supported on a GPv2 account with hierarchical namespace disabled. You need automatic preservation of earlier block-blob content when an application overwrites a blob. Which feature must be enabled before the overwrite?',explanation:'B records versions when supported write operations change blobs, allowing an earlier version to be copied back to the current blob. A recovers deleted containers, not individual overwrites. C changes storage cost/access characteristics. D deletes eligible data rather than preserving an earlier copy. Versioning does not retroactively recover content overwritten before it was enabled.'});
fix(id(3,1),'Stored access-policy changes can take up to 30 seconds; instant revocation promise is false.',{stem:'A partner needs read-only access to one blob container for 48 hours. You need a revocation control without rotating the account keys, and a short policy-propagation delay is acceptable. Which approach fits?',explanation:'B binds a narrowly scoped service SAS to a stored access policy; changing or deleting that policy revokes its associated access after propagation, which can take up to 30 seconds. A and D distribute an account credential with excessive scope and require key rotation for revocation. C exposes data anonymously and provides no per-partner expiry.'});
fix(id(3,2),'Disabling an Entra user is not a reliable immediate invalidation mechanism for an issued bearer SAS.',{stem:'A blob application must issue a SAS without signing it with an account key. An authorized Microsoft Entra principal first obtains a temporary signing key. Which SAS type does this describe?',explanation:'C is signed with a user delegation key obtained using Entra authorization. A and B are signed with an account key. D is a service-SAS policy, not a SAS type. Revoke delegation keys or remove the issuer\'s data permissions when required; cached keys/permissions can delay revocation. Do not assume disabling sign-in instantly invalidates an issued token.'});
fix(id(3,3),'Zero downtime requires client verification; deletion/wait distractor is nonsensical.',{stem:'All apps use key1; key2 is valid and unused. You need to rotate key1 without invalidating running clients. What must happen before key1 is regenerated?',choices:get(id(3,3)).choices.map(c=>c.key==='B'?{...c,text:'Move every client to key2 and verify successful access.'}:c.key==='D'?{...c,text:'Regenerate key2 and leave every client on key1 indefinitely.'}:c),explanation:'B gets clients off the key being rotated before regeneration invalidates it. A invalidates key1 before clients move. C invalidates both credentials at once. D changes only the unused key and never rotates the target key1. For a full two-key rotation, move clients back to the new key1 before regenerating key2.'});
fix(id(3,4),'Private endpoints are per storage service and do not automatically disable the public endpoint.',{explanation:'C provides a private IP for the selected storage service endpoint (for example, blob); configure its private DNS resolution too. A uses the service public endpoint over the Azure backbone without assigning it a private IP. B authorizes a public source address. D confuses anonymous authorization with connectivity. Disable or restrict public network access separately if private-only access is required.'});
fix(id(3,5),'Service endpoints require public network access enabled for selected networks; not a private endpoint.',{stem:'A blob account permits public network access from selected networks, with its firewall default action Deny. An authorized VM in one subnet must access the public storage endpoint over a service endpoint. Which configuration permits that subnet?',explanation:'A enables the subnet service endpoint and adds that subnet as a permitted virtual-network rule. The endpoint remains public-addressed but network access is restricted. B allows all networks. C changes anonymous authorization, not firewall rules. D changes credentials, not connectivity. Disabling public network access would also prevent this service-endpoint path.'});
fix(id(3,6),'User delegation SAS is constrained by issuer RBAC/ACL permissions; logging must be configured rather than assumed.',{choices:get(id(3,6)).choices.map(c=>c.key==='B'?{...c,text:'Entra authorization supports per-identity blob data roles without distributing shared account keys.'}:c.key==='D'?{...c,text:'The ordinary Reader management role automatically grants permission to read blob content.'}:c),explanation:'B is correct: blob data roles grant data-plane operations; configure storage logs when per-request auditing is needed. A is wrong because disabling Shared Key is optional hardening, not an Entra prerequisite. C is wrong because Entra supports blob data authorization. D is wrong because management Reader alone lacks blob DataActions. User delegation SAS permissions also depend on the issuing principal\'s permissions.'});
mcq(id(4,1),'AzCopy sync can also upload recursively and does not delete by default; original A and B both defensible.',
'You want a one-time recursive copy from C:\\data to an authorized blob-container URL, not a synchronization comparison. Which command explicitly requests recursive copying?',
["azcopy copy 'C:\\data' 'https://acct.blob.core.windows.net/container' --recursive=true","azcopy copy 'C:\\data' 'https://acct.blob.core.windows.net/container' --recursive=false","azcopy copy 'https://acct.blob.core.windows.net/container' 'C:\\data' --recursive=true","azcopy list 'https://acct.blob.core.windows.net/container'"],0,
'A copies the local directory recursively to the container. B explicitly excludes recursive traversal. C reverses source and destination, downloading instead. D lists remote content. AzCopy sync can also upload a tree; deletion requires the appropriate delete-destination setting and is not automatic by default.',2);
fix(id(4,3),'Device-code login may use another machine; account keys are not a generic AzCopy blob-auth method.',{stem:'A scheduled AzCopy blob-upload job must run unattended, with no interactive user/device-code login. Which authentication approach is supported?',explanation:'B supports unattended access with a suitably scoped SAS or an authorized service principal/managed identity. A is wrong because interactive user login is not required. C permits only supported anonymous reads, not anonymous uploads. D is wrong because a raw account key in a blob URL path is not a supported authentication format. Never put secrets in the URL path.'});
fix(id(4,4),'Portal Cloud Shell is an artificially weak distractor; specify standalone desktop app.',{stem:'A technician wants a standalone desktop graphical client to browse Azure containers and upload blobs from Windows, macOS, or Linux without writing commands. Which tool fits?',choices:get(id(4,4)).choices.map(c=>c.key==='D'?{...c,text:'Azure CLI with the storage command group'}:c),explanation:'A is the standalone cross-platform GUI for Azure Storage data. B and D are command-line tools. C synchronizes Windows Server files with Azure Files; it is not a general interactive storage browser.'});
fix(id(4,6),'Sync is asynchronous, not instantaneous global consistency.',{stem:get(id(4,6)).stem.replace('Users at any branch must see the same files.','Changes must synchronize among branches; temporary propagation delays are acceptable.'),explanation:'B connects one cloud endpoint to the registered server endpoints and synchronizes their namespace asynchronously. A manages blob lifecycle rather than file-server replication. C provides private connectivity but no sync topology. D schedules independent copy/sync jobs rather than creating an Azure File Sync replication group.'});
fix('az104-fc-2-001','Premium page blob LRS-only and Files protocol support corrected.',{back:'Standard GPv2 supports blobs, files, queues and tables. Premium block blob accounts support block/append blobs and optional hierarchical namespace. FileStorage accounts support Azure Files, including supported SMB/NFS configurations. Premium page blob accounts support LRS only; premium block blobs and SSD file shares can support LRS or ZRS.'});
fix('az104-fc-2-002','GZRS secondary is LRS; geo copies may lag.',{back:'LRS keeps local replicas. ZRS synchronously spans primary-region zones. GRS adds an asynchronous secondary-region LRS copy; GZRS combines primary ZRS with secondary LRS. Geo replication can lose recent writes after a disaster. RA-GRS/RA-GZRS additionally expose secondary reads.'});
fix('az104-fc-2-003','Customer-managed failover exists and clients must use the secondary URL.',{back:'RA-GRS and RA-GZRS expose a readable secondary endpoint before failover. Applications must use that endpoint and tolerate replication lag. GRS/GZRS permit access to the secondary only after account failover, which can be customer-managed for supported configurations.'});
fix('az104-fc-2-004','Cold latency and archive rehydration corrected.',{back:'Among fixed tiers, capacity pricing decreases Hot → Cool → Cold → Archive while access costs generally rise. Hot/Cool/Cold are online. Cool and Cold have 30/90-day minimum retention charges; Archive is offline with a 180-day minimum. Rehydrate Archive by Set Blob Tier or copying to an online tier; completion takes time.'});
fix('az104-fc-2-005','Lifecycle clocks are explicit.',{back:'Rules filter supported blob types by container/name prefixes or index tags. Supported actions tier or delete data; rules specify their time condition explicitly (such as last modification, last access with tracking, or creation time). Versions and snapshots have separate action rules and limitations.'});
fix('az104-fc-2-007','SAS does not simply follow user disablement.',{back:'User delegation SAS uses an Entra-authorized temporary signing key. Service SAS uses an account key for one storage service and can reference a stored access policy. Account SAS uses an account key across specified services/resource types. Use narrow permissions and expiry; revocation propagation is not guaranteed instantaneous.'});
fix('az104-fc-2-009','Disabling public access blocks service-endpoint access too.',{back:'Selected-network firewall rules plus service endpoints restrict access to a public-addressed storage endpoint over Azure networking. Private endpoints provide service-specific private IPs and need correct DNS. Disabling public network access blocks the service-endpoint route; configured private endpoints can still work.'});
fix('az104-fc-2-010','Account setting permits/prohibits anonymous access, but access level is container-specific.',{back:'At account level, disallowing blob anonymous access overrides container settings. If the account permits it, each container chooses Private, Blob (anonymous reads of known blobs), or Container (also anonymous blob listing). Keep containers private unless public content is intentional.'});
fix('az104-pbq-2-001','Instant SAS revocation is false.',{pairs:get('az104-pbq-2-001').pairs.map((p,i)=>i===0?{...p,left:'Give a vendor 24-hour container read access revocable without rotating account keys; allow policy propagation time'}:p),explanation:'A stored-policy service SAS supports scoped access and policy-based revocation after propagation (up to 30 seconds). Entra data roles authorize identities. A private endpoint supplies a service-specific private IP. Selected-network firewall rules authorize the chosen subnet over its service endpoint. For key rotation, verify clients on the standby key before regenerating the former active key.'});
fix('az104-ac-013','Secondary region is not zone-redundant.',{hint:'ZRS in the primary region plus asynchronous replication to LRS in the secondary region.'});

```

## scripts/review-az104-d3.mjs

```js
import {fix,mcq,source,get} from './review-az104-helpers.mjs';
const id=(o,n)=>`az104-3-3.${o}-${String(n).padStart(3,'0')}`;
const src=(o,ns,url)=>source(ns.map(n=>id(o,n)).join(' '),url);
src(1,[1],'azure/virtual-machines/sizes/overview'); src(1,[2],'azure/virtual-machines/sizes/b-series-cpu-credit-model');
src(1,[3],'azure/virtual-machines/windows/tutorial-manage-vm');src(1,[4],'azure/virtual-machines/managed-disks-overview');src(1,[5],'azure/virtual-machines/disks-types');src(1,[6],'azure/virtual-machines/extensions/custom-script-windows');src(1,[7],'azure/virtual-machines/spot-vms');src(1,[8],'azure/virtual-machines/dedicated-hosts');
src(2,[1,7],'azure/virtual-machines/availability-set-overview');src(2,[2,8],'azure/reliability/availability-zones-overview');src(2,[3],'azure/virtual-machine-scale-sets/virtual-machine-scale-sets-orchestration-modes');src(2,[4],'azure/virtual-machine-scale-sets/virtual-machine-scale-sets-autoscale-overview');src(2,[5],'azure/virtual-machine-scale-sets/virtual-machine-scale-sets-scale-in-policy');src(2,[6],'azure/virtual-machine-scale-sets/virtual-machine-scale-sets-automatic-upgrade');
src(3,[1],'azure/container-instances/container-instances-restart-policy');src(3,[2,7],'azure/container-instances/container-instances-container-groups');src(3,[3],'azure/container-apps/traffic-splitting');src(3,[4],'azure/container-apps/scale-app');src(3,[5],'azure/container-registry/container-registry-skus');src(3,[6],'azure/container-apps/environment');
src(4,[1,2,5],'azure/app-service/overview-hosting-plans');src(4,[2],'azure/app-service/manage-automatic-scaling');src(4,[3,4],'azure/app-service/deploy-staging-slots');src(4,[5],'azure/app-service/configure-ssl-bindings');src(4,[6],'azure/app-service/manage-backup');src(4,[7],'azure/app-service/environment/overview');
fix(id(1,3),'Availability sets can require deallocating every member; scope question to standalone VM.',{stem:get(id(1,3)).stem.replace('a running VM','a standalone running VM that is not in an availability set')});
fix(id(1,4),'Temporary disk loss is possible, not an exhaustive guaranteed event list; Linux device names vary.',{stem:'A VM size includes a local temporary disk. Which statement correctly describes its durability?',choices:get(id(1,4)).choices.map(c=>c.key==='B'?{...c,text:'It is nonpersistent scratch storage; data can be lost during maintenance, redeploy, or deallocation.'}:c),explanation:'B is correct: temporary storage is not a durable data disk, although a successful standard restart normally preserves it. A mistakes local performance for durability. C incorrectly treats it as a managed disk covered by managed-disk snapshots. D incorrectly promises geo-replication; encryption depends on VM generation and configuration. Store recoverable scratch data there.'});
mcq(id(1,5),'Ultra limit is outdated; Premium SSD v2 also offers independently adjustable performance and submillisecond latency.',
'A supported VM and region need a single managed data disk provisioned for 200,000 IOPS with independently configurable throughput. Assume capacity and VM limits are sufficient. Which disk type supports this IOPS requirement?',
['Standard SSD','Premium SSD','Premium SSD v2','Ultra Disk'],3,
'D supports provisioned IOPS above 80,000, including this requirement. A and B have much lower per-disk performance limits. C offers independently adjustable performance and submillisecond latency but tops out at 80,000 IOPS per disk. The VM and disk capacity must also support the requested performance.',4);
mcq(id(1,6),'Custom Script does not rerun on unchanged deployments; reboot/domain-join scripts require care, and non-extension distractors are weak.',
'A new Windows VM must download and run an existing PowerShell installation script once after provisioning. The script is idempotent and does not reboot the VM. Which extension directly supports this imperative script execution?',
['Custom Script Extension','Azure Monitor Agent extension','Microsoft Antimalware extension','Azure Network Watcher extension'],0,
'A downloads and executes the supplied script. To deliberately rerun it later, change the configuration or force-update tag; unchanged deployments do not rerun it automatically. B collects monitoring data. C configures antimalware protection. D supports network diagnostics. None of those three is the general-purpose script runner.',3);
fix(id(2,1),'Never simultaneous is too broad outside planned maintenance.',{choices:get(id(2,1)).choices.map(c=>c.key==='A'?{...c,text:'Azure reboots one update domain at a time during this planned maintenance.'}:c),explanation:'A describes the planned-maintenance sequencing that update domains provide. B describes protection from hardware failures, associated with fault domains. C is not a capability of an availability set. D is not guaranteed by update domains; VM placement and application redundancy still matter. Unrelated failures can occur during maintenance.'});
fix(id(2,2),'Zone-spread VMs do not automatically make the application healthy or implement failover.',{stem:'A stateless application has healthy VM backends in zones 1, 2 and 3. Its data dependencies survive a zone outage. Which Standard Load Balancer design keeps routing new connections to surviving healthy backends?',explanation:'B combines a zone-redundant frontend with healthy backends spread across zones; probes remove unhealthy backends from new-flow selection. A requires a separate standby promotion/routing design. C protects a smaller failure scope. D loses all backends in a zone outage. This routing does not itself replicate application state or guarantee uninterrupted existing connections.'});
fix(id(2,3),'Uniform instances can be addressed/managed individually too; use the standard VM resource/API distinction.',{stem:'A scale set must contain standard Microsoft.Compute/virtualMachines resources managed with ordinary VM APIs and support permitted mixtures of VM sizes. Which orchestration mode fits?',explanation:'A uses standard Azure VM resources with individual lifecycle management and supports mixed sizes subject to placement constraints. B uses scale-set VM child resources and its VMSS APIs; it is not true that Uniform instances cannot be individually addressed. C does not provide autoscale. D controls proximity rather than orchestration.'});
fix(id(2,5),'Default removes highest instance ID after balancing, not strictly newest creation time.',{choices:get(id(2,5)).choices.map(c=>c.key==='A'?{...c,text:'Balance across zones, then fault domains on a best-effort basis, then select the highest instance ID among eligible candidates.'}:c),explanation:'A is the documented Default order. Protected instances are excluded from automatic scale-in. B corresponds to an age-based OldestVM policy, not Default. C incorrectly uses CPU to select the individual removal candidate. D ignores placement balancing. NewestVM is a separate policy; creation time and instance ID are not interchangeable.'});
fix(id(2,6),'Rollback concerns the failing instance OS disk and configured behavior; manual OS trigger differs from all manual rolling updates.',{stem:'A Uniform scale set uses automatic OS image upgrades with health monitoring and automatic rollback enabled. An upgraded instance fails to become healthy within the configured wait. Which protection can the platform apply that a manually triggered OS image upgrade does not provide?',choices:get(id(2,6)).choices.map(c=>c.key==='A'?{...c,text:'Restore the unhealthy instance\'s previous OS disk as part of automatic OS-upgrade rollback.'}:c),explanation:'A describes the automatic OS-upgrade rollback safeguard. B contradicts rolling batches. C invents a per-batch approval requirement. D ignores required health evaluation. A manual trigger of an OS image upgrade does not provide this automatic rollback capability; do not generalize that to every VMSS update mechanism.'});
fix(id(2,7),'Explanation confuses availability-set 99.95%, multi-zone 99.99%, and disk-dependent single-VM SLAs.',{explanation:'B is the minimum: two or more VMs in the same availability set qualify for the applicable 99.95% VM connectivity SLA. A does not meet the multiple-VM requirement. C and D exceed the minimum. Multi-zone deployments and single-VM disk configurations have separate SLA terms; this answer is not a blanket SLA for every VM design.',difficulty:2});
fix(id(3,1),'Never means no automatic restart after exit, not exactly-once execution semantics.',{explanation:'C stops the container when its process exits, including a nonzero exit, without automatically restarting it. A restarts after any exit. B restarts after failure. D is not an ACI restart-policy value. Never does not guarantee exactly-once processing against manual restarts, redeployments, or application retries.'});
fix(id(3,2),'Multiple containers in a group require Linux; volumes must actually be configured for sharing.',{stem:'A Linux ACI container group contains two cooperating containers. Which statement about the group is true?',explanation:'A is correct: containers are co-scheduled and share a lifecycle and local network, with volumes available for configured mounts. B assigns an IP to each container, whereas network exposure is at group level. C incorrectly assumes independent group-member scaling. D places one group across regions, which is unsupported.'});
fix(id(3,5),'Free SKU distractor is fabricated and content-trust aside is unnecessary; replace with plausible configuration error.',{choices:get(id(3,5)).choices.map(c=>c.key==='D'?{...c,text:'Standard with an additional repository'}:c),explanation:'C is required for ACR geo-replication. A and B do not provide this feature. D changes repository organization but does not add Premium capabilities. Geo-replication must still be configured for the desired supported regions.'});
mcq(id(3,7),'Requests are not exact usage caps; App Service also runs containers, so explanation was wrong.',
'A single-container ACI deployment requests 2 vCPU and 4 GiB of memory. Which configuration expresses this allocation to ACI?',
['Set the container resources.requests.cpu and resources.requests.memoryInGB values.','Set only the container image tag to 2cpu-4gb.','Set only environment variables named CPU and MEMORY.','Set only the container group restartPolicy to Always.'],0,
'A is the resource-request configuration ACI uses to allocate resources, subject to service limits and capacity. B names an image version, not an allocation. C passes data to the process but does not reserve resources. D controls restart behavior. Requests describe allocation rather than an application\'s exact consumption; limits can further constrain usage.',2);
fix(id(4,2),'Basic allows manual scale-out, not Azure Monitor autoscale.',{explanation:'A is correct for manual scale-out: Free/Shared do not support multiple instances, while Basic supports up to three. Azure Monitor rule-based autoscale requires Standard or higher. B incorrectly requires an ASE. C confuses deployment slots with worker instances. D invents Free-tier autoscaling.'});
fix(id(4,3),'Instant rollback and unconditional zero downtime overpromise database/session behavior.',{stem:'A Standard-or-higher App Service has a validated staging slot and swap-compatible application settings. Which feature promotes the warmed staging application to the production endpoint?',explanation:'A swaps slot routing after warm-up to promote the deployment with minimal disruption. B adds instances but does not promote staging code. C restores a backup rather than staging. D changes TLS bindings. Swapping back can reverse the code deployment, but does not undo database migrations or guarantee preserved application sessions.'});
mcq(id(4,6),'Basic now supports automatic and custom backups; Standard minimum answer is outdated.',
'A web app needs a configurable backup schedule, a customer storage destination, and selectable retention. Which App Service backup option fits?',
['Automatic backups, with their fixed hourly schedule and fixed retention','Custom backups on a supported Basic-or-higher plan, configured with a storage destination and schedule','Deployment-slot swaps on a Free plan','Only an App Service Environment can provide configurable backups'],1,
'B supports scheduled custom backups with a configured storage destination and retention. A provides platform-managed backups but does not expose the requested schedule/retention controls. C deploys code and is not a backup mechanism; Free also lacks slots. D is wrong because supported multitenant Basic, Standard and Premium plans also offer backups.',3);
fix(id(4,7),'Basic/Standard/Premium already use dedicated workers; ASE additionally isolates the environment/frontend.',{explanation:'A provides a single-tenant App Service environment in the customer VNet, including isolated hosting infrastructure. B already provides dedicated workers for its plan but still uses the shared multitenant App Service environment/frontends. C supplies outbound VNet connectivity without creating an ASE. D supplies private inbound connectivity without isolating the hosting environment.'});
fix('az104-fc-3-003','Premium SSD v2 also satisfies original low-latency independent tuning description.',{front:'Which disk types offer independently configurable IOPS and throughput, and which supports more than 80,000 IOPS per disk?',back:'Premium SSD v2 and Ultra Disks offer independent performance settings subject to capacity and VM limits. Premium SSD v2 supports up to 80,000 IOPS; Ultra supports higher provisioned IOPS. Both are data-disk types, not OS disks.'});
fix('az104-fc-3-004','Temporary storage durability overstated and resize not invariably destructive.',{back:'Use local temporary storage only for recoverable scratch data, paging or swap. A normal successful restart usually preserves it, but maintenance, redeploy or deallocation can lose it. Never rely on it for durable application data.'});
fix('az104-fc-3-008','Swap is not instant rollback of database effects.',{back:'App Service warms the source slot and switches routing with the target. Slot-specific settings stay associated with their slot after completion. A swap-back reverses code routing, not external database changes; plan for warm-up and session behavior.'});
fix('az104-fc-3-010','Notice is at least 30 seconds when Azure schedules eviction; restart depends on capacity.',{back:'Spot VMs can be evicted when Azure reclaims capacity or pricing exceeds the configured maximum. Azure provides scheduled eviction notice of at least 30 seconds. Deallocate keeps disks with ongoing storage charges; restart is subject to capacity. Delete removes the VM under its deletion settings.'});
fix('az104-fc-3-011','Zone-spread application architecture does not itself supply platform failover for every resource.',{back:'A zonal resource is placed in a selected availability zone. A zone-redundant service distributes its supported infrastructure across zones. For an application built from zonal VMs, configure load balancing, healthy capacity and resilient data dependencies; merely spreading VMs does not implement failover.'});
fix('az104-pbq-3-002','VMSS need not be identical; slot swaps are not an unconditional zero-downtime promise.',{pairs:get('az104-pbq-3-002').pairs.map(p=>p.left==='Virtual Machine Scale Sets'?{...p,right:'A managed VM fleet with supported autoscale and orchestration options'}:p.left==='Azure App Service'?{...p,right:'Managed web hosting with staging-slot promotion on supported plans'}:p),explanation:'VMs provide guest OS control. VMSS manages VM fleets with Uniform or Flexible orchestration. ACI runs container groups. Container Apps adds revisions, ingress and event-driven scaling. App Service hosts web apps with supported deployment-slot workflows. Dedicated Host supplies dedicated physical host capacity.'});
fix('az104-ac-017','VMSS fleets need not be identical and load balancing is not automatic.',{expansion:'Virtual Machine Scale Sets',hint:'Manage and scale VM fleets with Uniform or Flexible orchestration; configure load balancing separately when needed.'});

```

## scripts/review-az104-d4.mjs

```js
import {fix,mcq,source,get} from './review-az104-helpers.mjs';
const id=(o,n)=>`az104-4-4.${o}-${String(n).padStart(3,'0')}`;
const src=(o,ns,url)=>source(ns.map(n=>id(o,n)).join(' '),url);
src(1,[1,2],'azure/virtual-network/virtual-networks-faq');src(1,[3],'azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings');src(1,[4],'azure/virtual-network/ip-services/private-ip-addresses');src(1,[5],'azure/private-link/private-endpoint-overview');src(1,[6],'azure/app-service/overview-vnet-integration');
src(2,[1,3],'azure/virtual-network/virtual-network-peering-overview');src(2,[2],'azure/vpn-gateway/vpn-gateway-peering-gateway-transit');src(2,[4],'azure/vpn-gateway/about-gateway-skus');src(2,[5],'azure/vpn-gateway/design');src(2,[6],'azure/expressroute/expressroute-global-reach');
src(3,[1,2],'azure/virtual-network/network-security-groups-overview');src(3,[3],'azure/virtual-network/network-security-group-how-it-works');src(3,[4],'azure/virtual-network/application-security-groups');src(3,[5],'azure/firewall/rule-processing');src(3,[6],'azure/bastion/bastion-overview');
src(4,[1],'azure/load-balancer/load-balancer-overview');src(4,[2],'azure/load-balancer/load-balancer-custom-probe-overview');src(4,[3],'azure/load-balancer/inbound-nat-rules');src(4,[4],'azure/nat-gateway/nat-gateway-resource');src(4,[5],'azure/application-gateway/overview');src(4,[6],'azure/dns/private-dns-virtual-network-links');
fix(id(1,3),'Gateway /27 statement needs a non-Basic SKU; old Basic /29 support makes the generic minimum ambiguous.',{stem:'You are deploying a new VpnGw2AZ VPN gateway. Which subnet configuration meets its gateway-subnet requirements?',explanation:'B uses the required GatewaySubnet name and a /27 range; use /27 or a larger address block for non-Basic gateway SKUs. A has the wrong name. C is too small for this SKU. D has an arbitrary name and an NSG; NSGs on GatewaySubnet are unsupported and can disrupt gateway traffic. Basic has different legacy sizing considerations.'});
mcq(id(1,4),'ARM dynamic private IPs persist through deallocation; original reason for choosing Static is false.',
'A database VM NIC must be allocated the specific unused private address 10.20.2.10 in its Azure subnet. How should the administrator reserve that exact address?',
['Set 10.20.2.10 only inside the guest OS.','Leave the Azure NIC allocation Dynamic and assume Azure chooses 10.20.2.10.','Set the NIC IP configuration to Static with 10.20.2.10 in Azure.','Attach a static public IP resource to the NIC.'],2,
'C explicitly allocates the chosen private address through Azure IP management. A does not reserve it in Azure and risks connectivity problems. B lets Azure choose, so it does not guarantee that specific address. D concerns public addressing. Dynamic ARM private addresses are normally retained through stop/deallocate while the NIC IP configuration remains.',3);
fix(id(1,5),'A private endpoint does not disable public network access automatically; Azure service-endpoint traffic is not ordinary public-internet traffic.',{choices:get(id(1,5)).choices.map(c=>c.key==='B'?{...c,text:'Create a SQL private endpoint, configure private DNS, and disable public network access on the SQL server.'}:c),explanation:'B combines private connectivity, name resolution and the separate public-access control. A uses the SQL public endpoint over the Azure backbone and cannot meet disabled public-network access. C names an App Service outbound integration feature rather than the SQL Database private endpoint configuration. D filters VM egress but does not disable the SQL server\'s public endpoint.'});
fix(id(1,6),'App Service subnet sharing with supported plans is possible; distinguish other resource types from additional app plans.',{explanation:'A requires the Microsoft.Web/serverFarms delegation and excludes unrelated resources such as VM NICs. Supported App Service plans may share an integration subnet under the documented limits. B incorrectly permits VM NICs in it. C uses the gateway-only subnet name. D confuses outbound VNet integration with a service endpoint.'});
fix(id(2,1),'Direct peering is one solution, not the only possible design; specify no transit infrastructure.',{stem:'VNet-A is peered with VNet-B, and B with VNet-C. Their address ranges do not overlap. There is no transit gateway or routing appliance, and adding one is not desired. Which change directly connects A and C?',explanation:'C adds direct peering between the two VNets. A assumes transit that peering alone does not provide. B permits already-forwarded traffic but creates no router. D points at an unstated gateway and omits the required transit design. In other architectures, a properly configured routing appliance or supported gateway topology can provide transit.'});
mcq(id(2,4),'VpnGw4 Gen2 is 5 Gbps and non-AZ; original marked answer satisfies neither stated requirement.',
'For a new deployment, you need a zone-redundant VPN gateway SKU with the documented aggregate throughput benchmark of 10 Gbps and active-active support. Which listed SKU/generation fits? Treat the benchmark as a sizing reference, not guaranteed tunnel throughput.',
['VpnGw2AZ, Generation 1','VpnGw3AZ, Generation 2','VpnGw5AZ, Generation 2','VpnGw4AZ, Generation 2'],2,
'C is listed at a 10 Gbps aggregate benchmark and supports availability-zone deployment and active-active configuration. A is listed at 1 Gbps. B is listed at 2.5 Gbps. D is listed at 5 Gbps. Actual throughput depends on traffic mix, algorithms and tunnel configuration.',3);
mcq(id(3,1),'Wrong subnet arithmetic: 10.0.1.5 is not in 10.0.0.0/24; the original has no correctly reasoned answer.',
'An NSG has Rule1 at priority 100 allowing TCP 443 from 10.0.0.0/24 and Rule2 at priority 200 denying TCP 443 from 10.0.1.5. No other custom rules apply. A new inbound connection to TCP 443 comes from 10.0.1.5. What happens?',
['Allowed: Rule1 matches 10.0.1.5.','Denied: Rule1 does not match that source, and Rule2 is the first matching rule.','Allowed: the first rule is applied even when its source does not match.','Denied: any deny rule overrides all allows regardless of priority.'],1,
'B is correct: 10.0.0.0/24 covers 10.0.0.0 through 10.0.0.255, excluding 10.0.1.5. Rule1 is skipped and Rule2 denies. A has incorrect subnet math. C ignores matching conditions. D invents deny-always-wins behavior; NSGs use the first matching rule in ascending priority order.',3);
fix(id(3,2),'Default outbound rules allow VirtualNetwork and Internet, then deny the rest; NSG permission does not create routing/SNAT.',{choices:get(id(3,2)).choices.map(c=>c.key==='B'?{...c,text:'Inbound from VirtualNetwork and AzureLoadBalancer; outbound to VirtualNetwork and Internet, followed by catch-all denies.'}:c),explanation:'B lists the default service-tag allow rules followed by DenyAll rules. A wrongly allows arbitrary inbound traffic. C ignores default allows. D invents an inbound HTTPS rule. NSGs filter traffic; routing, public access and an explicit outbound connectivity method may still be needed even when an NSG allows a flow.'});
fix(id(3,3),'Union is the wrong permissions model; independent NSG evaluation must both allow.',{choices:get(id(3,3)).choices.map(c=>c.key==='C'?{...c,text:'No: the new connection must be permitted by both NSGs, and the NIC NSG denies it.'}:c),explanation:'C is correct for a new flow: inbound traffic passes the subnet NSG and then the NIC NSG, and both must allow it. A wrongly gives subnet rules precedence. B wrongly treats either allow as sufficient. D wrongly discards the subnet NSG. Each NSG still uses its own first-match priority evaluation; rules are not merged into one priority list.'});
fix(id(3,4),'One subnet per VM distractor is implausible.',{choices:get(id(3,4)).choices.map(c=>c.key==='A'?{...c,text:'Static lists of all current server IP addresses in each NSG rule'}:c),explanation:'B lets rules reference logical groups of NICs; maintain membership as servers change. A works only by editing address lists as membership changes, contrary to the goal. C cannot create custom service tags named for server roles. D configures firewall application traffic, not reusable ASG membership in NSGs.'});
fix(id(4,1),'Basic Load Balancer is retired; HA ports is an internal Standard LB feature, not a public LB outbound-rule combination.',{stem:'Which Azure Load Balancer SKU family supports zone-redundant frontends, outbound rules on public load balancers, and HA ports on internal load balancers?',choices:get(id(4,1)).choices.map(c=>c.key==='A'?{...c,text:'The retired Basic SKU'}:c),explanation:'B provides those capabilities in their supported public/internal configurations. A is retired and did not provide them. C serves network-appliance chaining, not this general load-balancing feature set. D cannot attach a Basic public IP to a Standard load balancer. Do not assume HA ports and public outbound rules belong on the same frontend.'});
mcq(id(4,2),'Private frontend alone does not restrict which private networks can reach it; health-probe absolute is unnecessarily broad.',
'Application VMs must be served through a private load-balancer frontend reachable from permitted peered VNets. New flows must avoid an unhealthy backend. Which configuration fits?',
['Public frontend with no health monitoring','Internal Standard load balancer with a private frontend, an appropriate health probe, and network rules allowing only intended clients','Internal frontend with all backends assumed healthy and no probe','Public frontend with DNS name resolution disabled'],1,
'B supplies private addressing, backend health detection and the required access restrictions. A and D still expose a public frontend. C cannot detect the described backend failure. A private frontend is reachable over connected private networks according to routing and security rules; it does not itself authorize only specific peers.',3);
mcq(id(4,4),'Per-VM public IP is also a defensible SNAT fix without a no-public-IP constraint; 64,000 should be 64,512 and no guarantee of eliminating exhaustion.',
'A fleet of private VMs needs outbound HTTPS through one predictable public IP, without public IPs on individual NICs. The existing shared outbound path suffers SNAT exhaustion. Which design best fits?',
['Assign a separate public IP to every VM NIC.','Create an inbound NAT rule on a load balancer.','Associate a NAT gateway and a public IP with the subnet.','Increase every VM size without changing network configuration.'],2,
'C provides explicit subnet outbound connectivity and a shared source IP with a larger dynamically allocated SNAT pool (64,512 ports per public IP for Standard NAT Gateway). Monitor connection/port limits; no finite pool guarantees unlimited connections. A violates the NIC constraint. B handles inbound mappings. D does not change the outbound SNAT allocation.',3);
fix(id(4,5),'Front Door is also defensible unless the wrong claim is part of the answer; make the regional service requirement explicit.',{stem:'A regional VNet-hosted web application requires URL-path routing, TLS termination and a web application firewall on its regional reverse proxy. Which listed service fits?',choices:get(id(4,5)).choices.map(c=>c.key==='A'?{...c,text:'Application Gateway with a WAF-capable SKU'}:c.key==='D'?{...c,text:'NAT Gateway'}:c),explanation:'A provides the regional Layer 7 reverse proxy with supported WAF functionality. B is a Layer 4 TCP/UDP load balancer and cannot inspect HTTP paths. C uses DNS to direct clients and does not terminate TLS. D performs outbound source NAT and provides neither inbound HTTP routing nor WAF.'});
fix(id(4,6),'Custom resolvers/forwarders can resolve without a local zone link; state Azure-provided DNS and no forwarding.',{stem:get(id(4,6)).stem.replace('A VM in VNet-B queries','Both VNets use Azure-provided DNS with no custom DNS forwarding or Private Resolver. A VM in VNet-B queries'),explanation:'B is correct under this DNS configuration: link B to the private zone for its Azure-provided DNS resolution. A wrongly assumes peering inherits DNS links. C confuses VM record registration with DNS resolution access. D incorrectly publishes the private zone. A separate custom resolver/forwarding design could provide another resolution path.'});
fix('az104-fc-4-002','Gateway subnet minimum varies with Basic versus non-Basic.',{back:'The subnet name is GatewaySubnet. Use /27 or a larger address block for non-Basic VPN gateway SKUs; Basic has different legacy sizing support. Do not attach an NSG to GatewaySubnet.'});
fix('az104-fc-4-003','Private endpoint alone does not disable public access.',{back:'Service endpoints identify an allowed subnet to a service public endpoint over Azure networking. Private endpoints provide a private IP for a supported service connection; configure DNS and separately disable/restrict public network access for private-only service access.'});
fix('az104-fc-4-007','All outbound is overbroad.',{back:'Within an NSG, the lowest-numbered matching priority wins. Default inbound allows VirtualNetwork and AzureLoadBalancer, then denies other traffic. Default outbound allows VirtualNetwork and Internet, then denies other traffic. These are filter rules, not a guarantee of routes or internet SNAT.'});
fix('az104-fc-4-008','Clarify independent evaluation and new flows.',{back:'For a new flow, both subnet and NIC NSGs must allow it. Evaluate first-match priorities independently within each NSG; a matching deny in either blocks it. Inbound checks subnet then NIC; outbound checks NIC then subnet.'});
fix('az104-fc-4-010','Do not teach retired Basic as a new deployment choice; HA ports internal-only.',{front:'Which current Standard Load Balancer capabilities replace common limitations of the retired Basic SKU?',back:'Standard supports zone-redundant frontends, explicit outbound rules for public load balancers, and HA ports for internal load balancers. Public frontends use Standard public IPs; configure NSG permissions. Basic Load Balancer retired September 30, 2025.'});
fix('az104-fc-4-011','Avoid universal probe claim; separate balancing from targeted NAT.',{back:'A load-balancing rule distributes flows among eligible backend instances, using configured health probes to exclude unhealthy backends. An inbound NAT rule forwards a frontend port to a specific backend instance/port rather than balancing that connection across the pool.'});
fix('az104-fc-4-012','Correct port count and private DNS forwarding exception.',{back:'Standard NAT Gateway provides explicit subnet outbound SNAT with 64,512 ports per public IP, subject to connection limits. With Azure-provided DNS, link each VNet to the private zone it must resolve. Peering does not inherit links; custom DNS forwarding is a separate design.'});
fix('az104-pbq-4-001','Front Door failover is not instantaneous.',{pairs:get('az104-pbq-4-001').pairs.map(p=>p.right==='Azure Front Door'?{...p,left:'Global HTTP/S entry point with health-based origin routing and edge caching'}:p)});
fix('az104-pbq-4-002','Active-active does not keep a failed instance tunnel up; Microsoft peering also reaches Azure public services.',{pairs:get('az104-pbq-4-002').pairs.map(p=>p.left==='ExpressRoute Microsoft peering'?{...p,right:'ExpressRoute path to supported Microsoft public service endpoints'}:p),explanation:'Site-to-Site connects a site VPN device; Point-to-Site connects individual VPN clients; VNet-to-VNet uses gateway tunnels. ExpressRoute private peering reaches VNets; Microsoft peering reaches supported Microsoft public endpoints with applicable requirements. Active-active provides two gateway instances; configure both tunnels so surviving connectivity can carry traffic after a failure.'});

```

## scripts/review-az104-d5.mjs

```js
import {fix,mcq,source,get} from './review-az104-helpers.mjs';
const id=(o,n)=>`az104-5-5.${o}-${String(n).padStart(3,'0')}`;
const src=(o,ns,url)=>source(ns.map(n=>id(o,n)).join(' '),url);
src(1,[1],'azure/azure-monitor/fundamentals/data-platform');src(1,[2],'azure/azure-monitor/logs/log-analytics-workspace-overview');src(1,[3],'azure/azure-monitor/data-collection/diagnostic-settings');src(1,[4],'windows/security/threat-protection/auditing/event-4625');src(1,[5],'kusto/query/summarize-operator?view=microsoft-fabric');src(1,[6],'azure/azure-monitor/logs/data-retention-configure');src(1,[7],'kusto/query/extend-operator?view=microsoft-fabric');src(1,[8],'kusto/query/join-operator?view=microsoft-fabric');src(1,[8],'kusto/query/union-operator?view=microsoft-fabric');
src(2,[1],'azure/azure-monitor/alerts/alerts-types');src(2,[2],'azure/azure-monitor/alerts/alerts-create-log-alert-rule');src(2,[3],'azure/azure-monitor/alerts/action-groups');src(2,[4],'azure/network-watcher/ip-flow-verify-overview');src(2,[5],'azure/network-watcher/packet-capture-overview');src(2,[6],'azure/azure-monitor/alerts/alerts-common-schema');src(2,[6],'azure/azure-monitor/alerts/alerts-create-log-alert-rule');
src(3,[1,2],'azure/backup/backup-azure-recovery-services-vault-overview');src(3,[3],'azure/backup/secure-by-default');src(3,[4],'azure/backup/backup-architecture');src(3,[5],'azure/site-recovery/recovery-plan-overview');src(3,[6],'azure/site-recovery/site-recovery-test-failover-to-azure');src(3,[7],'azure/well-architected/reliability/disaster-recovery');
fix(id(1,1),'Logs can also contain numerical CPU data; specify native platform metric rather than dismissing logs as unsuitable.',{stem:'A VM emits the native Azure Monitor Percentage CPU signal. Which data type stores this lightweight numerical time series for Metrics explorer?',explanation:'B is the native metrics store for the signal. A can contain CPU samples if guest collection is configured, but is not the native platform metric store. C provides resource diagnostic events. D records management operations, such as resource creation, rather than the CPU time series.'});
fix(id(1,2),'Classic Application Insights is retired; workspace-based Application Insights also uses Log Analytics.',{choices:get(id(1,2)).choices.map(c=>c.key==='C'?{...c,text:'An Azure Monitor action group'}:c),explanation:'A stores Azure Monitor log tables and supports KQL across ingested VM, platform and application data. B identifies metric series rather than log tables. C contains notification/automation destinations. D is a storage log container, not a Log Analytics query store. Modern workspace-based Application Insights stores its telemetry in a Log Analytics workspace.'});
fix(id(1,3),'Only/most-complete distractors cue the answer; not all metrics export and partner destinations also exist.',{stem:'You need supported resource logs and exportable metrics sent for KQL analysis, storage retention and external stream processing. Which set of Azure diagnostic-setting destinations covers those three tasks?',choices:[{key:'A',text:'Log Analytics workspace, Recovery Services vault, and Event Hubs',correct:false},{key:'B',text:'Metrics explorer, Storage account, and Service Bus queue',correct:false},{key:'C',text:'Log Analytics workspace, Storage account, and Event Hubs',correct:true},{key:'D',text:'Log Analytics workspace, Storage account, and an action group',correct:false}],explanation:'C provides log analysis, storage and streaming destinations. A substitutes a backup vault for a storage destination. B substitutes a viewer and Service Bus for supported routing destinations. D substitutes an alert action group for the event stream destination. Select supported categories; not every metric is exportable, and partner destinations may also be supported.'});
fix(id(1,4),'take/arg_max do not generally return first chronological event.',{explanation:'A is correct: the filter selects Windows failed-logon event 4625 and summarize count() groups its rows by Account. B is wrong because the query neither sorts nor lists all events. C describes successful-logon event 4624. D would require selecting the earliest timestamped record per account, such as arg_min(TimeGenerated, *), not count().'});
mcq(id(1,5),'Original query averages all VMs and processor instances; identify the target and total CPU counter.',
'Perf contains Windows CPU samples from many VMs. Which query plots hourly average total CPU for web01 over the last 24 hours?',
['Perf | where TimeGenerated > ago(24h) and Computer == "web01" and ObjectName == "Processor" and CounterName == "% Processor Time" and InstanceName == "_Total" | summarize avg(CounterValue) by bin(TimeGenerated, 1h) | render timechart','Perf | where TimeGenerated > ago(24h) | summarize avg(CounterValue) by bin(TimeGenerated, 1h) | render timechart','Perf | where Computer == "web01" | summarize count() by bin(TimeGenerated, 1h) | render timechart','Perf | where TimeGenerated < ago(24h) and Computer == "web01" | summarize avg(CounterValue) by bin(TimeGenerated, 1h) | render timechart'],0,
'A filters the VM, time range and total Processor counter before averaging into hourly bins. B blends other machines and counters. C counts samples instead of averaging CPU and has no 24-hour filter. D selects older data and mixes counters. The scenario assumes these Windows Perf counters are collected.',3);
mcq(id(1,6),'Long-term retention is the current name, needs total-retention duration, and old data is retrieved through search jobs rather than ordinary interactive queries.',
'An Analytics-plan table must retain one year of logs. Only the latest 30 days need interactive queries; older data is rarely requested and search-job latency is acceptable. Which retention design reduces the cost of retaining older data?',
['Keep 30 days of analytics retention and set table total retention to 365 days.','Set both analytics and total retention to 30 days.','Keep 365 days of analytics retention.','Disable ingestion after the first 30 days.'],0,
'A keeps recent data interactive and older data in long-term retention, accessible using search jobs. B deletes data too early. C retains the year interactively, contrary to the lower-cost design for infrequent historical access. D stops new data collection rather than retaining it. Retention settings do not recover data already purged.',3);
fix(id(1,7),'project can also compute columns; make preservation of all existing columns the distinguishing requirement.',{stem:'You want to append a new HourOfDay column to every log row while preserving all existing columns without enumerating them. No column named HourOfDay exists. Which operator is designed for this?',explanation:'A appends the new calculated column while retaining existing columns. B selects/projects columns, so unlisted existing columns are lost. C aggregates rows rather than preserving each record. D matches tables and is unnecessary for a calculation on each row.'});
fix(id(1,8),'UserId and EmployeeId do not necessarily share semantics; union supports different schemas.',{stem:'HRRecords.EmployeeId stores the same Entra object IDs as SigninLogs.UserId. You need to correlate matching rows with an explicit equality on those two columns. Which KQL operator fits?',explanation:'A correlates matching keys, for example an inner join using $left.UserId == $right.EmployeeId. B appends rows and can handle different schemas, but does not match keys. C adds computed columns to existing rows. D aggregates rows. Real employee numbers would need an identity mapping before joining to Entra object IDs.'});
fix(id(2,1),'A log alert is valid too; specify the native signal without guest ingestion.',{stem:'You must alert when a VM\'s native Percentage CPU metric averages above 85% over a 10-minute window, without collecting guest performance logs. Which alert type directly uses that signal?',explanation:'A evaluates the native CPU metric using the requested aggregation/window and an appropriate evaluation frequency. B would require suitable ingested log data, excluded by the scenario. C monitors management events. D detects supported application anomalies rather than the specified VM metric threshold.'});
fix(id(2,2),'Mute actions is not a universal alert type setting; changing frequency could also reduce notifications unless evaluation must remain fixed.',{stem:'A stateless log search alert must keep evaluating every five minutes with the same scope. It repeatedly notifies for the same dimension combination while the condition remains true. Which setting pauses repeat actions for a specified period without changing evaluation frequency?',explanation:'A is the log search alert Mute actions setting: it delays subsequent actions for the configured interval. B changes monitored scope. C violates the fixed evaluation interval. D adds receivers. This is not a universal option for every alert type, and distinct split-by dimension combinations can create distinct alert instances.'});
fix(id(2,3),'Choose direct action types, not interchangeable integration chains.',{choices:get(id(2,3)).choices.map(c=>c.key==='A'?{...c,text:'SMS and Email notifications plus an Automation Runbook action'}:c),explanation:'A includes both requested notification channels and the direct runbook action. B suppresses actions rather than running remediation. C misses the required channels and includes a diagnostic setting, which routes telemetry. D only places a call and cannot satisfy the other two requirements.'});
fix(id(2,5),'New NSG flow logs cannot be created; packet capture cannot decrypt arbitrary encrypted payloads.',{choices:get(id(2,5)).choices.map(c=>c.key==='B'?{...c,text:'Virtual network flow logs'}:c),explanation:'A captures packet data from the supported VM for inspection, subject to filters and capture limits. Encrypted application content remains encrypted. B records flow metadata, not application packet payloads. C lists effective rules without traffic content. D evaluates whether a hypothetical flow is allowed rather than recording real traffic.'});
fix(id(2,6),'Modern log alerts do not embed raw results or arbitrary custom JSON in common schema; dimensions supply context.',{stem:'A current log search alert evaluates a brute-force query every 15 minutes over a 30-minute window. The query produces a stable IPAddress string dimension and a count. Each per-IP webhook alert must identify that IP using the common alert schema. Which configuration fits?',choices:get(id(2,6)).choices.map(c=>c.key==='A'?{...c,text:'Use a log search alert with a 15-minute frequency, 30-minute window and split-by IPAddress dimension, delivered to a common-schema webhook.'}:c),explanation:'A exposes the relevant dimension on the per-IP alert while matching the frequency/window. B cannot evaluate this KQL pattern as a native platform metric. C monitors management events. D reverses the timing and a static rule name cannot supply dynamic IP values. Modern common-schema log alerts do not embed query result rows; retrieve linked results separately if needed.'});
fix(id(3,1),'Invented Site Recovery vault distractor misses the important real Backup vault distinction.',{choices:get(id(3,1)).choices.map(c=>c.key==='C'?{...c,text:'An Azure Backup vault'}:c),explanation:'A hosts Azure VM Backup policies and vault recovery points. B stores logs. C is a real vault type for different supported workloads, such as Azure Disk Backup, not the specified full Azure VM backup policy. D is not how vault-based VM Backup stores its managed recovery points.'});
fix(id(3,3),'Soft-delete duration is configurable from 14 to 180 days, not universally 14.',{stem:'An administrator deletes an Azure VM backup item. Its Recovery Services vault has soft-delete retention explicitly configured to 30 days. What happens to that backup data?',choices:get(id(3,3)).choices.map(c=>c.key==='A'?{...c,text:'It enters the soft-deleted state for 30 days and can be undeleted during that period.'}:c),explanation:'A uses the configured retention. Fourteen days is the default, not a fixed duration; supported settings range from 14 to 180 days. B ignores soft-delete protection. C confuses recovery of backup data with automatically restoring a VM. D incorrectly treats deleting one item as pausing the shared backup policy.'});
fix(id(3,4),'Log Analytics agent is retired; use current Azure Monitor Agent.',{choices:get(id(3,4)).choices.map(c=>c.key==='D'?{...c,text:'Install Azure Monitor Agent and a data collection rule'}:c),explanation:'A backs up supported Windows files, folders and system state to a Recovery Services vault without requiring System Center. B protects Azure VMs, not this physical on-premises server. C performs disaster-recovery replication/failover rather than the requested file backup. D collects telemetry; it is not a backup agent.'});
fix(id(3,5),'Main outline targets Azure-resource Site Recovery; align scenario to Azure VMs and remove an obvious AzCopy distractor.',{stem:'An application runs on Azure VMs in one region. It needs ongoing replication to another supported Azure region and ordered startup of its database and application tiers during disaster recovery. Which service/feature fits?',choices:get(id(3,5)).choices.map(c=>c.key==='D'?{...c,text:'VM availability sets without cross-region replication'}:c),explanation:'A uses Site Recovery replication plus a recovery plan to sequence VM groups and supported automation. B supplies recovery points rather than ongoing DR replication and ordered failover. C supports migration assessment/moves, not this steady-state DR workflow. D supplies local failure-domain distribution, not a second-region replica.'});
fix(id(3,6),'Original mixed VMware/Azure and post-failover chronology; make protected direction explicit.',{stem:'Azure VMs are protected by Site Recovery replication to a second Azure region. You need a DR drill in an isolated test VNet without cutting over production or stopping replication. Which operation should you run?',choices:get(id(3,6)).choices.map(c=>c.key==='B'?{...c,text:'Production failover to the recovery region'}:c.key==='C'?{...c,text:'Disable replication for the protected VMs'}:c),explanation:'A creates test VMs from recovery points for the isolated drill while production and replication continue. B performs the real production recovery operation. C removes protection rather than testing it. D returns production to its original site after actual failover; it is not an isolated drill. Clean up test failover resources after validation.'});
fix('az104-fc-5-002','Three-only destination framing is incomplete.',{front:'Which common Azure destinations can diagnostic settings send supported resource logs and metrics to?',back:'Log Analytics workspaces for log queries, Storage accounts for retention, and Event Hubs for streaming. Supported partner destinations may also exist. Select supported categories; not every metric can be exported through diagnostic settings.'});
fix('az104-fc-5-006','Mute not universal; action groups optional.',{back:'Scope identifies resources; condition defines the signal and criteria; action groups optionally deliver notifications or automation; rule details include name, severity and enablement. Some log search alerts offer Mute actions; alert processing rules can suppress actions on matching fired alerts.'});
fix('az104-fc-5-007','ITSM retirement-sensitive aside unnecessary.',{back:'Notifications include email, SMS, Azure mobile-app push and voice (subject to regional support). Automation destinations include webhooks, Logic Apps, Azure Functions, Automation runbooks and Event Hubs.'});
fix('az104-fc-5-011','Azure-to-Azure uses Failover; planned/unplanned labels vary by source scenario.',{front:'How does a Site Recovery test failover differ from a production failover?',back:'Test failover starts recovery VMs in an isolated test network without production cutover or interrupting replication; clean up afterward. Production failover starts the recovered workload for real operations. Planned/unplanned terminology and shutdown options depend on the protected source scenario. Reprotect and fail back using the supported workflow.'});
fix('az104-ac-039','SLO is not necessarily stricter than an SLA.',{hint:'A measurable reliability target; an SLA is a service-level agreement and may use related targets.'});

```

## scripts/review-az104-helpers.mjs

```js
// Reproducible editorial corrections to PR #1 (original snapshots in docs/az104-review).
import fs from 'node:fs';
export const banks = Array.from({ length: 5 }, (_, i) => JSON.parse(fs.readFileSync(`docs/az104-review/original-d${i + 1}.json`, 'utf8')));
export const issues = [];
export const references = {};
export function source(ids, url) {
  for (const id of ids.split(' ')) (references[id] ??= []).push(url.startsWith('https:') ? url : `https://learn.microsoft.com/en-us/${url}`);
}
export function get(id) {
  const item = banks.flatMap(b => Object.values(b).flat()).find(q => q.id === id);
  if (!item) throw new Error(`Unknown ID ${id}`);
  return item;
}
export function fix(id, issue, changes) {
  Object.assign(get(id), changes);
  issues.push({ id, issue });
}
export function mcq(id, issue, stem, answers, right, explanation, difficulty = 3) {
  fix(id, issue, { stem, choices: answers.map((text, i) => ({ key: 'ABCD'[i], text, correct: i === right })), explanation, difficulty });
}
export function add(d, obj, serial, stem, answers, right, explanation, url, difficulty = 3) {
  const id = `az104-${d}-${obj}-${String(serial).padStart(3, '0')}`;
  banks[d - 1][`AZ104_D${d}_QUESTIONS`].push({id,certId:'az-104',domainId:`az-104:domain:${d}`,objectiveId:`az-104:obj:${obj}`,stem,choices:answers.map((text,i)=>({key:'ABCD'[i],text,correct:i===right})),explanation,difficulty});
  issues.push({id,issue:'Coverage gap: added an original scenario for an objective that was absent or thin.'});
  source(id,url);
}


```

## scripts/review-az104-refinements.mjs

```js
import {get,fix} from './review-az104-helpers.mjs';
fix('az104-3-3.4-005','Standard is not the entry tier for backups anymore; Basic supports automatic and custom backups.',{explanation:'Basic is the lowest listed tier that supports both custom domains and SNI-based TLS certificate bindings. Free lacks custom domains. Shared supports custom domains but not custom TLS certificate bindings. Standard adds capabilities such as deployment slots and metric-based autoscale, but is not the minimum tier for this requirement.'});
function revise(id,texts,explanation){fix(id,'Editorial pass: replace unrelated distractors with plausible administrative mistakes.',{choices:get(id).choices.map((c,i)=>({...c,text:texts[i]})),explanation});}
revise('az104-1-1.4-101',['Tenant root management group','Subscription','That resource group','One individual VM in that group'],'C contains every required VM and confines inherited access to that resource group. A and B grant at broader scopes than necessary. D covers only one VM and cannot supply access to every other VM in the group. The assigned role must include the needed management operations.');
revise('az104-1-1.5-104',['Azure Advisor','Azure Cost Management budgets','Azure Policy compliance results','Azure Monitor metric alerts'],'A supplies workload-aware recommendations based on usage and configuration. B tracks spending against thresholds but does not itself recommend VM right-sizing. C reports compliance with assigned rules. D evaluates configured metric conditions; it does not supply Advisor cost recommendations. Evaluate any recommendation against workload requirements.');
revise('az104-1-1.5-105',['Yes, every resource-group move physically relocates its resources.','No; the resource keeps its region unless a separate supported regional move is performed.','Yes, whenever the source and target resource groups have different metadata locations.','The move always fails if the resource region differs from the target resource group location.'],'B separates management scope from geographic deployment. A and C incorrectly make a resource-group move a regional migration. D is wrong because a resource group can contain resources in different regions. A supported move can change the resource ID and inherited permissions without changing its physical region.');
revise('az104-1-1.1-101',['Enable SSPR for All users.','Set SSPR to Selected and choose the pilot group.','Configure authentication methods but leave SSPR disabled.','Require MFA through Conditional Access without enabling SSPR.'],'B enables SSPR for the intended pilot group. A expands the rollout to everyone. C configures available methods but does not enable the reset feature. D requires stronger sign-in authentication without enabling password self-service. Ensure pilot users register the required reset methods.');
revise('az104-1-1.1-102',['Password hash synchronization alone','A cloud-only password policy with no writeback','Supported password writeback enabled and configured for the hybrid identity deployment','Pass-through authentication alone'],'C carries a supported SSPR reset to AD DS and respects the applicable on-premises policy. A synchronizes password hashes toward the cloud. B does not write changes to AD DS. D validates sign-ins against AD DS but does not by itself implement password-reset writeback.');
revise('az104-1-1.1-103',['Add the user to a second pilot group.','Require MFA at sign-in without collecting another recovery method.','Change only the Conditional Access sign-in frequency.','Complete registration of enough permitted recovery methods.'],'D satisfies the required number of verification methods. A does not add a verification method. B can require authentication but does not supply missing registration. C changes session reauthentication timing rather than registering the missing recovery method.');
revise('az104-1-1.1-105',['It is always removed because group membership ended.','The group assignment is removed, but the direct assignment can keep the product licensed.','The direct assignment is automatically removed alongside the group assignment.','The group assignment remains permanently even though membership ended.'],'B accounts for two independent assignment paths. A and C incorrectly remove the direct assignment. D incorrectly preserves the departed group\'s assignment after successful processing. To remove the product entirely, remove all valid assignment sources.');
revise('az104-1-1.5-106',['Assume the direct assignment follows the resource automatically.','Copy only resource-group tags to restore permissions.','Recreate the needed resource-scoped assignment at the new resource ID and check inherited target-scope access.','Rely on the old resource group\'s inherited roles continuing to apply.'],'C addresses the changed resource ID and target inheritance. A incorrectly assumes direct assignments move automatically. B changes metadata rather than permissions. D incorrectly preserves inheritance from a group that no longer contains the resource.');
revise('az104-1-1.5-107',['Azure RBAC assignments transfer unchanged to the new directory.','Existing role assignments/custom roles are affected and access must be recreated for identities in the target directory.','Only resource-group tags need to be copied for access to continue.','Existing managed identities always work unchanged after transfer.'],'B requires an inventory and a target-directory access plan. A incorrectly preserves tenant-bound authorization. C does not address identities or role assignments. D overlooks managed-identity and identity-dependent-service changes that directory transfer requires.');
revise('az104-1-1.5-108',['The listKeys operation is a POST management operation blocked by ReadOnly.','ReadOnly blocks every blob download through the data plane.','ReadOnly removes the caller\'s role assignment.','Listing keys requires a CanNotDelete lock instead.'],'A distinguishes management operations from friendly task names. B wrongly extends management locks to all data-plane reads. C confuses a lock with RBAC assignment deletion. D invents a lock prerequisite; CanNotDelete is not required to list keys.');
revise('az104-2-2.5-101',['The management-plane Reader role only','An appropriate share-level permission such as Storage File Data SMB Share Reader','Storage Blob Data Reader only','A more permissive NTFS ACL without any share-level permission'],'B grants the required share authorization while file/directory ACLs must also allow the access. A reads management configuration. C grants blob permissions, not SMB permissions. D changes only the layer that already allows access and leaves share authorization missing.');
revise('az104-2-2.5-102',['Share-level Contributor bypasses every file ACL.','The folder ACL still restricts access, so the denied write fails.','Membership in any Entra security group automatically overrides that deny.','Enabling SMB transport encryption overrides the folder write denial.'],'B requires authorization at both levels. A incorrectly makes share RBAC an ACL bypass. C ignores which permissions the group actually has. D confuses encryption of the connection with permission to modify a file.');
revise('az104-2-2.5-103',['Undelete the entire share even though the share still exists.','Increase the share quota.','Browse the snapshot and copy the earlier file back to the live share.','Enable share soft delete only after the overwrite.'],'C retrieves the earlier file from the existing point-in-time snapshot. A is a deleted-share operation, not an individual overwrite recovery. B adds capacity. D cannot retroactively recover overwritten file content.');
revise('az104-2-2.1-101',['Yes, only customer-managed keys encrypt storage.','Yes, enabling secure transfer is also what turns on at-rest encryption.','No, Azure Storage encrypts data at rest by default; key-management options determine who manages the keys.','No, because HTTPS alone encrypts stored disks.'],'C describes automatic service-side encryption and the separate key-management choice. A incorrectly excludes Microsoft-managed keys. B and D confuse protected transport with protection of stored data.');
revise('az104-2-2.1-102',['Versioning on both accounts and change feed on the source, plus the replication policy','Versioning only on the destination, with no source change feed','Only GRS on the destination, with no object-replication policy','Change feed only on the destination, with versioning disabled'],'A meets the tracking prerequisites and establishes the policy for supported block blobs. B lacks source tracking and versioning. C configures a different account-redundancy feature. D puts change tracking on the wrong side and omits required versioning. Confirm other account/feature compatibility limits too.');
revise('az104-2-2.5-104',['Only a previously exported copy in a different storage account','The deleted share and its contents by undeleting the share','Any individually overwritten file even without a snapshot','The deleted storage account automatically, even when its recovery window expired'],'B uses the retained share-deletion recovery feature. A ignores the supported undelete operation. C overstates share soft delete as file versioning. D confuses share protection with account recovery and its separate limitations.');
revise('az104-3-3.5-104',['Rename its .json extension to .bicep; no validation is needed.','Run az bicep decompile --file template.json, then review and fix the generated Bicep.','Run az bicep build to convert JSON into Bicep.','Use a what-if operation to generate a complete Bicep source file.'],'B is best-effort ARM JSON to Bicep conversion and still needs review. A leaves JSON syntax unchanged. C uses the opposite compilation direction. D previews deployment changes rather than generating Bicep source.');
revise('az104-3-3.1-101',['Encryption at host','HTTPS-only application traffic','A customer-managed key for the storage account alone, with no host encryption setting','A resource lock on the VM'],'A covers supported host caches and temporary storage paths. B protects application transport. C is a separate storage-key configuration that does not alone enable the requested VM host protection. D controls management operations rather than encryption.');
revise('az104-3-3.1-103',['Extend the partition/filesystem in the guest using supported disk-management tools.','Repeat the Azure capacity change without inspecting guest partitions.','Change the disk caching policy only.','Increase the VM CPU count without changing the partition.'],'A exposes the expanded capacity to the guest volume. B repeats the completed platform operation but leaves the partition unchanged. C controls caching. D changes compute size. Verify filesystem support and backups before extending.');
revise('az104-4-4.1-102',['IP forwarding enabled on the Azure NIC and appropriate routing/forwarding in its guest OS','Only an NSG allow rule, while NIC IP forwarding remains disabled','Only IP forwarding in the guest, while NIC forwarding remains disabled','Only Azure NIC IP forwarding, with guest routing disabled'],'A supplies both forwarding layers. B permits packets but does not enable transit. C leaves the Azure NIC restriction in place. D leaves the guest unable to forward. Routing and NSG permission alone do not make a VM a router.');
revise('az104-4-4.4-103',['Permit the probe traffic with an appropriate higher-precedence NSG rule.','Permit probes only in a lower-precedence rule after the matching deny.','Open only the client port while leaving the probe source denied.','Change the frontend DNS name without changing the NSG.'],'A lets the probe reach the listener. B is never reached after the matching deny. C fails to fix the blocked health-check flow. D changes name resolution rather than filtering. Also verify the actual probe port and guest firewall.');
revise('az104-5-5.1-101',['A diagnostic setting alone on the VM resource, with no guest agent','Azure Monitor Agent plus an associated data collection rule specifying the events and workspace destination','Azure Monitor Agent alone, without any associated collection rule','A DCR with event selection but no association to the VM'],'B connects guest collection, selection and destination. A routes supported platform telemetry but does not install guest event collection. C lacks collection instructions. D never applies the rule to the intended VM. Platform CPU metrics appearing does not prove guest logs are configured.');

```

## scripts/review-az104.mjs

```js
import fs from 'node:fs';
import { banks, issues, references } from './review-az104-helpers.mjs';
await import('./review-az104-d1.mjs');
await import('./review-az104-d2.mjs');
await import('./review-az104-d3.mjs');
await import('./review-az104-d4.mjs');
await import('./review-az104-d5.mjs');
await import('./review-az104-additions.mjs');
await import('./review-az104-refinements.mjs');
// Avoid a learnable answer-position shortcut. Preserve every existing ID and meaning.
// Replace letter references through a callback, so no replacement can cascade.
let index = 0;
const total = banks.reduce((sum, b, i) => sum + b[`AZ104_D${i + 1}_QUESTIONS`].length, 0);
const order = Array.from({ length: total }, (_, i) => i % 4);
let randomState = 20260925;
for (let i = order.length - 1; i > 0; i--) {
  randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
  const j = Math.floor((randomState / 4294967296) * (i + 1));
  [order[i], order[j]] = [order[j], order[i]];
}
for (const bank of banks) for (const [name, items] of Object.entries(bank)) {
  if (!name.endsWith('_QUESTIONS') || name.endsWith('_PERF_QUESTIONS')) continue;
  for (const q of items) {
    const target = order[index++ % order.length];
    const old = q.choices.findIndex(c=>c.correct);
    const offset = (target - old + 4) % 4;
    if (!offset) continue;
    const keyMap = Object.fromEntries(q.choices.map((c,i)=>[c.key,'ABCD'[(i+offset)%4]]));
    q.choices = q.choices.map(c=>({...c,key:keyMap[c.key]})).sort((a,b)=>a.key.localeCompare(b.key));
    // A can be an article; B/D can name VM series. These are prose, not choice labels.
    q.explanation = q.explanation.replace(/\b[A-D]\b/g, (k, offset, text) => {
      const after = text.slice(offset + 1);
      if (/^[-–]series\b/.test(after)) return k;
      if (k === 'A' && /^ (shorter|control-plane|Modify|resize|manual|region|CPU|container|Log|private|separate|supported)\b/.test(after)) return k;
      return keyMap[k];
    });
    issues.push({id:q.id,issue:'Answer-position bias: redistributed the correct choice and updated explanation letters (D1 originally answered A for all 24 items).'});
  }
}
const types={QUESTIONS:'Question',FLASHCARDS:'Flashcard',PERF_QUESTIONS:'PerfQuestion',ACRONYMS:'Acronym'};
for(let d=1;d<=5;d++){
  let out='import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";\n\n// Original practice content. Reviewed 2026-09-25; evidence and full issue log: docs/az104-review/REPORT.md.\n';
  for(const [suffix,type] of Object.entries(types)){
    const name=`AZ104_D${d}_${suffix}`;
    out+=`\nexport const ${name}: ${type}[] = ${JSON.stringify(banks[d-1][name],null,2)};\n`;
  }
  fs.writeFileSync(`content/parts/az104-d${d}.ts`,out);
}
fs.writeFileSync('docs/az104-review/changes.json',JSON.stringify({issues,references},null,2)+'\n');
console.log(banks.map((b,i)=>({domain:i+1,mcqs:b[`AZ104_D${i+1}_QUESTIONS`].length})));


```

## tests/az104-bank.test.ts

```ts
import { describe, expect, it } from "vitest";
import { AZ104_ACRONYMS, AZ104_FLASHCARDS, AZ104_PERF_QUESTIONS, AZ104_QUESTIONS } from "@/content/az-104-bank";
import { SEED_DATA, CONTENT_VERSION, perfQuestions } from "@/content/seed";
import { newCertAcronyms } from "@/content/acronyms-newcerts";
import { getCert } from "@/lib/certs";

describe("AZ-104 publishable content contract", () => {
  const cert = getCert("az-104");
  const scoped = [...AZ104_QUESTIONS, ...AZ104_FLASHCARDS, ...AZ104_PERF_QUESTIONS];
  it("has globally unique stable IDs and valid cert/domain/objective references", () => {
    const all = [...scoped, ...AZ104_ACRONYMS];
    expect(new Set(all.map(q => q.id)).size).toBe(all.length);
    for (const q of all) expect(q.certId, q.id).toBe("az-104");
    for (const q of scoped) {
      const domain = cert.domains.find(d => q.domainId === `az-104:domain:${d.code}`);
      expect(domain, q.id).toBeDefined();
      expect(domain?.objectives.some(o => q.objectiveId === `az-104:obj:${o.code}`), q.id).toBe(true);
    }
  });
  it("requires four distinct A-D choices, one answer, explanation, and valid difficulty", () => {
    for (const q of AZ104_QUESTIONS) {
      expect(q.choices.map(c => c.key), q.id).toEqual(["A", "B", "C", "D"]);
      expect(q.choices.filter(c => c.correct), q.id).toHaveLength(1);
      expect(new Set(q.choices.map(c => c.text.trim())).size, q.id).toBe(4);
      expect(q.stem.trim().length, q.id).toBeGreaterThan(0);
      expect(q.explanation.trim().length, q.id).toBeGreaterThan(0);
      expect(Number.isInteger(q.difficulty) && q.difficulty >= 1 && q.difficulty <= 5, q.id).toBe(true);
    }
  });
  it("has no verbatim duplicate MCQ stems or ambiguous duplicate matching targets", () => {
    expect(new Set(AZ104_QUESTIONS.map(q => q.stem.toLowerCase().trim())).size).toBe(AZ104_QUESTIONS.length);
    for (const q of AZ104_PERF_QUESTIONS) {
      expect(new Set(q.pairs.map(p => p.left)).size, q.id).toBe(q.pairs.length);
      expect(new Set(q.pairs.map(p => p.right)).size, q.id).toBe(q.pairs.length);
    }
  });
  it("keeps domain representation inside the published April 2026 ranges", () => {
    const ranges = [[.2, .25], [.15, .2], [.2, .25], [.15, .2], [.1, .15]];
    expect(cert.domains.reduce((sum, d) => sum + d.weight, 0)).toBeCloseTo(1);
    cert.domains.forEach((d, i) => {
      const proportion = AZ104_QUESTIONS.filter(q => q.domainId === `az-104:domain:${d.code}`).length / AZ104_QUESTIONS.length;
      expect(proportion).toBeGreaterThanOrEqual(ranges[i][0]);
      expect(proportion).toBeLessThanOrEqual(ranges[i][1]);
      expect(d.weight).toBeGreaterThanOrEqual(ranges[i][0]);
      expect(d.weight).toBeLessThanOrEqual(ranges[i][1]);
    });
  });
  it("does not teach an answer-letter shortcut", () => {
    for (const key of ["A", "B", "C", "D"]) {
      const share = AZ104_QUESTIONS.filter(q => q.choices.find(c => c.correct)?.key === key).length / AZ104_QUESTIONS.length;
      expect(share).toBeGreaterThan(.15);
      expect(share).toBeLessThan(.35);
    }
  });
  it("preserves technical names and prose when answer positions change", () => {
    expect(AZ104_QUESTIONS.find(q => q.id === "az104-3-3.1-001")?.explanation).toContain("B-series is burstable");
    expect(AZ104_QUESTIONS.find(q => q.id === "az104-3-3.1-001")?.explanation).toContain("D-series is general-purpose");
    expect(AZ104_QUESTIONS.find(q => q.id === "az104-1-1.5-105")?.explanation).toContain("A supported move can change the resource ID");
  });
  it("wires all content modes into reseeding and matches the announced counts", () => {
    expect(CONTENT_VERSION).toBeGreaterThan(1);
    expect(AZ104_QUESTIONS).toHaveLength(160);
    expect(AZ104_FLASHCARDS).toHaveLength(60);
    expect(AZ104_PERF_QUESTIONS).toHaveLength(8);
    expect(AZ104_ACRONYMS).toHaveLength(40);
    for (const q of AZ104_QUESTIONS) expect(SEED_DATA.questions).toContainEqual(q);
    for (const q of AZ104_FLASHCARDS) expect(SEED_DATA.flashcards).toContainEqual(q);
    for (const q of AZ104_PERF_QUESTIONS) expect(perfQuestions).toContainEqual(q);
    for (const q of AZ104_ACRONYMS) expect(newCertAcronyms).toContainEqual(q);
    expect(cert.scoreMin).toBe(1);
    expect(cert.passingScore).toBe(700);
    expect(cert.scoreMax).toBe(1000);
  });
});

```

## tests/certs.test.ts

```ts
import { describe, it, expect } from "vitest";
import {
  CERTS,
  DEFAULT_CERT_ID,
  getCert,
  liveCerts,
  getActiveCertId,
} from "@/lib/certs";

describe("getCert", () => {
  it("returns the requested cert by id", () => {
    const cert = getCert("secplus-sy0-701");
    expect(cert.id).toBe("secplus-sy0-701");
    expect(cert.version).toBe("SY0-701");
    expect(cert.passingScore).toBe(750);
  });

  it("falls back to the default cert for an unknown id", () => {
    expect(getCert("does-not-exist").id).toBe(DEFAULT_CERT_ID);
    expect(getCert("").id).toBe(DEFAULT_CERT_ID);
  });

  it("default cert id is Security+", () => {
    expect(DEFAULT_CERT_ID).toBe("secplus-sy0-701");
  });
});

describe("liveCerts", () => {
  it("returns Security+, Network+, both A+ cores, and Azure Administrator", () => {
    const live = liveCerts();
    const ids = live.map((c) => c.id);
    expect(ids).toContain("secplus-sy0-701");
    expect(ids).toContain("networkplus-n10-009");
    expect(ids).toContain("aplus-220-1101");
    expect(ids).toContain("aplus-220-1102");
    expect(ids).toContain("az-104");
    expect(live).toHaveLength(5);
  });

  it("both A+ exams are present in the registry and live", () => {
    const ids = CERTS.map((c) => c.id);
    expect(ids).toContain("aplus-220-1101");
    expect(ids).toContain("aplus-220-1102");
    expect(getCert("aplus-220-1101").status).toBe("live");
    expect(getCert("aplus-220-1102").status).toBe("live");
  });
});

describe("getActiveCertId", () => {
  it("defaults to DEFAULT_CERT_ID when state is missing or has no activeCertId", () => {
    expect(getActiveCertId()).toBe(DEFAULT_CERT_ID);
    expect(getActiveCertId({})).toBe(DEFAULT_CERT_ID);
    expect(getActiveCertId({ activeCertId: undefined })).toBe(DEFAULT_CERT_ID);
  });

  it("returns the stored activeCertId when present", () => {
    expect(getActiveCertId({ activeCertId: "networkplus-n10-009" })).toBe(
      "networkplus-n10-009"
    );
  });
});

describe("Security+ taxonomy (SY0-701 regression guard)", () => {
  const secplus = getCert("secplus-sy0-701");

  it("has the exact 5 SY0-701 domain weights in order", () => {
    const weights = secplus.domains.map((d) => d.weight);
    expect(weights).toEqual([0.12, 0.22, 0.18, 0.28, 0.2]);
  });

  it("domain weights sum to 1.0", () => {
    const sum = secplus.domains.reduce((acc, d) => acc + d.weight, 0);
    // float-safe equality
    expect(sum).toBeCloseTo(1.0, 10);
  });

  it("has 5 domains and the exact SY0-701 objective counts per domain", () => {
    expect(secplus.domains).toHaveLength(5);
    // Verbatim from content/seed.ts: D1=4, D2=5, D3=4, D4=6, D5=5 → 24 total.
    expect(secplus.domains.map((d) => d.objectives.length)).toEqual([4, 5, 4, 6, 5]);
    const objectiveCount = secplus.domains.reduce(
      (acc, d) => acc + d.objectives.length,
      0
    );
    expect(objectiveCount).toBe(24);
  });

  it("domain codes map to numbers 1..5 and names are unchanged", () => {
    expect(secplus.domains.map((d) => d.code)).toEqual(["1", "2", "3", "4", "5"]);
    expect(secplus.domains.map((d) => d.name)).toEqual([
      "General Security Concepts",
      "Threats, Vulnerabilities & Mitigations",
      "Security Architecture",
      "Security Operations",
      "Security Program Management & Oversight",
    ]);
  });
});

describe("Network+ taxonomy (N10-009)", () => {
  const netplus = getCert("networkplus-n10-009");

  it("is live and selectable", () => {
    expect(netplus.status).toBe("live");
  });

  it("has 5 domains with codes 1..5", () => {
    expect(netplus.domains).toHaveLength(5);
    expect(netplus.domains.map((d) => d.code)).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("has the exact N10-009 domain weights in order", () => {
    const weights = netplus.domains.map((d) => d.weight);
    expect(weights).toEqual([0.23, 0.2, 0.19, 0.14, 0.24]);
  });

  it("domain weights sum to 1.0", () => {
    const sum = netplus.domains.reduce((acc, d) => acc + d.weight, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });
});

describe("A+ Core 1 taxonomy (220-1101)", () => {
  const core1 = getCert("aplus-220-1101");

  it("is live and selectable", () => {
    expect(core1.status).toBe("live");
  });

  it("has 5 domains with codes 1..5", () => {
    expect(core1.domains).toHaveLength(5);
    expect(core1.domains.map((d) => d.code)).toEqual(["1", "2", "3", "4", "5"]);
  });

  it("has the exact 220-1101 domain weights in order", () => {
    const weights = core1.domains.map((d) => d.weight);
    expect(weights).toEqual([0.13, 0.23, 0.25, 0.11, 0.28]);
  });

  it("domain weights sum to 1.0", () => {
    const sum = core1.domains.reduce((acc, d) => acc + d.weight, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });
});

describe("A+ Core 2 taxonomy (220-1102)", () => {
  const core2 = getCert("aplus-220-1102");

  it("is live and selectable", () => {
    expect(core2.status).toBe("live");
  });

  it("has 4 domains with codes 1..4", () => {
    expect(core2.domains).toHaveLength(4);
    expect(core2.domains.map((d) => d.code)).toEqual(["1", "2", "3", "4"]);
  });

  it("has the exact 220-1102 domain weights in order", () => {
    const weights = core2.domains.map((d) => d.weight);
    expect(weights).toEqual([0.28, 0.28, 0.22, 0.22]);
  });

  it("domain weights sum to 1.0", () => {
    const sum = core2.domains.reduce((acc, d) => acc + d.weight, 0);
    expect(sum).toBeCloseTo(1.0, 10);
  });
});

```

