"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Props {
  /** YYYY-MM-DD of the most recent freeze application; at most one frozen day shown. */
  lastFreezeAppliedAt?: string;
  /** Override today's date (YYYY-MM-DD) — mainly for tests/SSR safety. */
  today?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function localToday(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

/** Format a YYYY-MM-DD string as "June 2026". */
function monthTitle(yyyymmdd: string): string {
  // yyyymmdd is "YYYY-MM" here in practice, but handle full dates too
  const parts = yyyymmdd.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/** Returns "YYYY-MM" for a month offset from the given "YYYY-MM". */
function offsetMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0")
  );
}

/** Returns the "YYYY-MM" for today. */
function currentYM(): string {
  return localToday().slice(0, 7);
}

/** Number of days in a given "YYYY-MM". */
function daysInMonth(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/** 0=Sun … 6=Sat for the first day of the month. */
function firstWeekday(ym: string): number {
  const [y, m] = ym.split("-").map(Number);
  return new Date(y, m - 1, 1).getDay();
}

/** "YYYY-MM-DD" for day `d` in month `ym`. */
function dayKey(ym: string, d: number): string {
  return ym + "-" + String(d).padStart(2, "0");
}

/** Load per-day activity (any session) across all of Dexie, up to `cutoffIso`. */
async function loadActivitySet(cutoffIso: string): Promise<Set<string>> {
  const active = new Set<string>();

  const [quizSessions, reviews, drillSessions, mockExams] = await Promise.all([
    db.quizSessions.filter((s) => !!s.completedAt && s.completedAt >= cutoffIso).toArray(),
    db.reviews.filter((r) => r.reviewedAt >= cutoffIso).toArray(),
    db.drillSessions.filter((s) => s.completedAt >= cutoffIso).toArray(),
    db.mockExamSessions.filter((s) => !!s.completedAt && s.completedAt >= cutoffIso).toArray(),
  ]);

  for (const s of quizSessions) {
    if (s.completedAt) active.add(toDateKey(s.completedAt));
  }
  for (const r of reviews) {
    active.add(toDateKey(r.reviewedAt));
  }
  for (const s of drillSessions) {
    active.add(toDateKey(s.completedAt));
  }
  for (const s of mockExams) {
    if (s.completedAt) active.add(toDateKey(s.completedAt));
  }

  return active;
}

const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

// ── Cell ──────────────────────────────────────────────────────────────────────

type CellState = "completed" | "frozen" | "today" | "empty";

function DayCell({
  day,
  state,
  isToday,
}: {
  day: number;
  state: CellState;
  isToday: boolean;
}) {
  const size = 32;

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
    position: "relative",
    boxSizing: "border-box",
    flexShrink: 0,
  };

  if (state === "completed") {
    return (
      <div
        style={{
          ...baseStyle,
          background: "var(--accent)",
          color: "#fff",
          outline: isToday ? "2px solid var(--accent)" : "none",
          outlineOffset: isToday ? "2px" : "0",
        }}
        aria-label={`Day ${day}, completed`}
      >
        🔥
      </div>
    );
  }

  if (state === "frozen") {
    return (
      <div
        style={{
          ...baseStyle,
          background: "#7BAEC4",
          color: "#fff",
          outline: isToday ? "2px solid var(--accent)" : "none",
          outlineOffset: isToday ? "2px" : "0",
        }}
        aria-label={`Day ${day}, streak freeze applied`}
      >
        ❄️
      </div>
    );
  }

  if (isToday && state === "empty") {
    return (
      <div
        style={{
          ...baseStyle,
          background: "var(--surface-2)",
          border: "2px solid var(--accent)",
          color: "var(--fg)",
        }}
        aria-label={`Day ${day}, today`}
      >
        {day}
      </div>
    );
  }

  // plain empty (past or future)
  return (
    <div
      style={{
        ...baseStyle,
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        color: "var(--fg-subtle)",
      }}
      aria-label={`Day ${day}`}
    >
      {day}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function StreakCalendar({ lastFreezeAppliedAt, today: todayProp }: Props) {
  const [activeMonth, setActiveMonth] = useState<string>(() => currentYM());
  const [activitySet, setActivitySet] = useState<Set<string>>(new Set());
  const [earliestMonth, setEarliestMonth] = useState<string>(() => {
    // Default: 12 months back
    return offsetMonth(currentYM(), -12);
  });
  const [todayKey, setTodayKey] = useState<string>(() => todayProp ?? "");

  // Load activity data on mount (client-only — SSR safe)
  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      const today = todayProp ?? localToday();
      setTodayKey(today);
      setActiveMonth(today.slice(0, 7));

      // Cutoff: 12 months back
      const cutoff = offsetMonth(today.slice(0, 7), -12);
      const cutoffIso = cutoff + "-01T00:00:00";

      loadActivitySet(cutoffIso).then((set) => {
        if (!alive) return;
        setActivitySet(set);
        // Find earliest month with activity, but no earlier than 12mo back
        if (set.size > 0) {
          const dates = [...set].sort();
          const earliest = dates[0].slice(0, 7);
          setEarliestMonth(earliest < cutoff ? cutoff : earliest);
        }
      }).catch(() => {/* fail silently */});
    }, 0);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = todayKey || localToday();
  const currentMonth = today.slice(0, 7);

  const canGoBack = activeMonth > earliestMonth;
  const canGoForward = activeMonth < currentMonth;

  const numDays = daysInMonth(activeMonth);
  const startWeekday = firstWeekday(activeMonth);

  // Count completed days for aria-label
  let completedCount = 0;
  for (let d = 1; d <= numDays; d++) {
    if (activitySet.has(dayKey(activeMonth, d))) completedCount++;
  }

  // Build grid cells: leading blanks + day cells
  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: numDays }, (_, i) => i + 1),
  ];

  return (
    <div
      style={{
        fontFamily: "var(--font-sans)",
        width: "100%",
      }}
    >
      {/* Month nav header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <button
          onClick={() => canGoBack && setActiveMonth(offsetMonth(activeMonth, -1))}
          disabled={!canGoBack}
          aria-label="Previous month"
          style={{
            background: "none",
            border: "none",
            cursor: canGoBack ? "pointer" : "default",
            fontSize: "16px",
            color: canGoBack ? "var(--fg)" : "var(--fg-subtle)",
            opacity: canGoBack ? 1 : 0.35,
            padding: "4px 8px",
            borderRadius: "var(--r-sm)",
            lineHeight: 1,
          }}
        >
          ‹
        </button>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--fg)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {monthTitle(activeMonth + "-01")}
        </span>
        <button
          onClick={() => canGoForward && setActiveMonth(offsetMonth(activeMonth, 1))}
          disabled={!canGoForward}
          aria-label="Next month"
          style={{
            background: "none",
            border: "none",
            cursor: canGoForward ? "pointer" : "default",
            fontSize: "16px",
            color: canGoForward ? "var(--fg)" : "var(--fg-subtle)",
            opacity: canGoForward ? 1 : 0.35,
            padding: "4px 8px",
            borderRadius: "var(--r-sm)",
            lineHeight: 1,
          }}
        >
          ›
        </button>
      </div>

      {/* Calendar grid */}
      <div
        role="img"
        aria-label={`Study calendar for ${monthTitle(activeMonth + "-01")}, ${completedCount} day${completedCount !== 1 ? "s" : ""} completed`}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "4px",
        }}
      >
        {/* Weekday header row */}
        {WEEKDAY_INITIALS.map((lbl, i) => (
          <div
            key={i}
            aria-hidden="true"
            style={{
              textAlign: "center",
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--fg-subtle)",
              fontFamily: "var(--font-sans)",
              paddingBottom: "4px",
              letterSpacing: "0.06em",
            }}
          >
            {lbl}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`blank-${idx}`} aria-hidden="true" />;
          }

          const key = dayKey(activeMonth, day);
          const isToday = key === today;
          const isFrozen = !!lastFreezeAppliedAt && key === lastFreezeAppliedAt;
          const isCompleted = activitySet.has(key);

          let state: CellState;
          if (isCompleted) {
            state = "completed";
          } else if (isFrozen) {
            state = "frozen";
          } else {
            state = "empty";
          }

          return (
            <div
              key={key}
              style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              <DayCell day={day} state={state} isToday={isToday} />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "14px",
          marginTop: "12px",
          flexWrap: "wrap",
        }}
        aria-hidden="true"
      >
        {[
          { icon: "🔥", label: "Studied", bg: "var(--accent)" },
          { icon: "❄️", label: "Freeze", bg: "#7BAEC4" },
          { icon: null, label: "Today", bg: "var(--surface-2)", border: "2px solid var(--accent)" },
          { icon: null, label: "Empty", bg: "var(--surface-2)", border: "1px solid var(--border)" },
        ].map(({ icon, label, bg, border }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: bg,
                border: border ?? "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
            <span
              style={{
                fontSize: "11px",
                color: "var(--fg-muted)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
