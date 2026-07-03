"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildExamTimeline, type ExamTimeline, type FocusObjective, type TimelineWeek } from "@/lib/exam-timeline";
import { getUserState } from "@/lib/gamification";
import { getActiveCertId } from "@/lib/certs";
import { formatMs } from "@/lib/pace";

// Amber caution color for the "behind" verdict. We don't reuse --accent (the
// brand color) so caution reads distinctly from a neutral/brand highlight, and
// readiness is always conveyed in text too — never color alone.
const AMBER = "#D98A2B";

// ─── Small presentational helpers ─────────────────────────────────────────────

function Card({
  children,
  accent = false,
  style,
}: {
  children: React.ReactNode;
  accent?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: accent ? "1px solid var(--accent)" : "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        padding: "20px 22px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** A thin progress bar with a 0..1 fill. */
function Bar({ value, color }: { value: number; color: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      aria-hidden="true"
      style={{
        height: 4,
        borderRadius: 2,
        background: "var(--border)",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2 }} />
    </div>
  );
}

const VERDICT: Record<ExamTimeline["readiness"], { text: string; color: string }> = {
  ready: { text: "You're ready", color: "var(--success)" },
  "on-track": { text: "On track", color: "var(--fg)" },
  behind: { text: "Behind pace — push the weak areas", color: AMBER },
  unknown: { text: "Not enough data yet — do a few quizzes", color: "var(--fg-muted)" },
};

// ─── Stat block ───────────────────────────────────────────────────────────────

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ minWidth: 0 }}>
      <p
        className="font-mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--fg-subtle)",
          margin: "0 0 4px",
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

// ─── Objective chip / row ─────────────────────────────────────────────────────

function masteryLabel(mastery: number | null): string {
  return mastery === null ? "new" : `${Math.round(mastery * 100)}%`;
}

function masteryColor(mastery: number | null): string {
  if (mastery === null) return "var(--fg-subtle)";
  if (mastery >= 0.75) return "var(--success)";
  if (mastery >= 0.5) return AMBER;
  return "var(--error)";
}

function WeakChip({ obj }: { obj: FocusObjective }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)",
        padding: "8px 10px",
        minWidth: 0,
        flex: "1 1 160px",
        maxWidth: 240,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 5 }}>
        <span
          className="font-mono"
          style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}
        >
          {obj.code}
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            overflowWrap: "anywhere",
            lineHeight: 1.3,
          }}
        >
          {obj.name}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <Bar value={obj.mastery ?? 0} color={masteryColor(obj.mastery)} />
        <span
          className="font-mono"
          style={{ fontSize: 10, color: "var(--fg-subtle)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
        >
          {masteryLabel(obj.mastery)}
        </span>
      </div>
    </div>
  );
}

function FocusRow({ obj }: { obj: FocusObjective }) {
  return (
    <Link
      href={`/library/objective/${obj.code}`}
      aria-label={`Deep dive: ${obj.code} ${obj.name}`}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", textDecoration: "none", color: "inherit" }}
    >
      <span
        className="font-mono"
        style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", flexShrink: 0, width: 30 }}
      >
        {obj.code}
      </span>
      <span
        style={{
          fontSize: 13,
          color: "var(--fg)",
          fontFamily: "var(--font-sans)",
          flex: 1,
          minWidth: 0,
          overflowWrap: "anywhere",
          lineHeight: 1.35,
        }}
      >
        {obj.name}
      </span>
      <div style={{ width: 80, flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
        <Bar value={obj.mastery ?? 0} color={masteryColor(obj.mastery)} />
        <span
          className="font-mono"
          style={{ fontSize: 10, color: "var(--fg-subtle)", flexShrink: 0, fontVariantNumeric: "tabular-nums", width: 26, textAlign: "right" }}
        >
          {masteryLabel(obj.mastery)}
        </span>
      </div>
    </Link>
  );
}

// ─── Week card ────────────────────────────────────────────────────────────────

function formatDateLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function weekLabel(week: TimelineWeek): string {
  if (week.index === 0) return "This week";
  if (week.index === 1) return "Next week";
  return `Week of ${formatDateLabel(week.startDate)}`;
}

const linkStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--accent)",
  fontFamily: "var(--font-sans)",
  textDecoration: "none",
};

function WeekCard({ week }: { week: TimelineWeek }) {
  return (
    <Card accent={week.isFinalWeek} style={{ padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <h2
            className="font-display"
            style={{ fontSize: 17, fontWeight: 400, color: "var(--fg)", margin: 0 }}
          >
            {weekLabel(week)}
          </h2>
          {week.isFinalWeek && (
            <span
              className="font-mono"
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent)",
                background: "rgba(245,166,35,0.15)",
                border: "1px solid rgba(245,166,35,0.4)",
                borderRadius: 3,
                padding: "1px 5px",
              }}
            >
              Final week
            </span>
          )}
        </div>
        <span
          className="font-mono"
          style={{ fontSize: 11, color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}
        >
          {formatDateLabel(week.startDate)} – {formatDateLabel(week.endDate)}
        </span>
      </div>

      {week.focus.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <span
              className="font-mono"
              style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-subtle)" }}
            >
              Focus objectives
            </span>
            <Link href="/quiz" style={linkStyle}>
              Drill these →
            </Link>
          </div>
          {week.focus.map((obj) => (
            <FocusRow key={obj.id} obj={obj} />
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
          <span className="font-mono" style={{ color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}>
            {week.dueReviews}
          </span>{" "}
          review{week.dueReviews !== 1 ? "s" : ""} due
          {week.dueReviews > 0 && (
            <>
              {" · "}
              <Link href="/flashcards" style={{ ...linkStyle, fontSize: 12 }}>
                Review →
              </Link>
            </>
          )}
        </span>
      </div>

      {week.recommendMock && (
        <Link
          href="/exam"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
            padding: "8px 12px",
            background: "rgba(245,166,35,0.08)",
            border: "1px solid rgba(245,166,35,0.4)",
            borderRadius: "var(--r-sm)",
            textDecoration: "none",
          }}
        >
          <span aria-hidden="true" className="font-mono" style={{ fontSize: 13, color: "var(--accent)" }}>
            ⏱
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg)", fontFamily: "var(--font-sans)" }}>
            Mock exam checkpoint
          </span>
          <span style={{ ...linkStyle, marginLeft: "auto" }}>Start →</span>
        </Link>
      )}
    </Card>
  );
}

// ─── Readiness header (shared by all non-loading states) ──────────────────────

function ReadinessHeader({ timeline }: { timeline: ExamTimeline }) {
  const verdict = VERDICT[timeline.readiness];
  const { predicted, passingScore, daysUntil, recommendedDailyQuestions, paceAvgMs, paceOnTarget } = timeline;
  const scoreFill =
    predicted === null ? 0 : (predicted - 100) / (900 - 100);

  return (
    <Card>
      <h1
        className="font-display"
        style={{ fontSize: 28, fontWeight: 400, color: "var(--fg)", margin: "0 0 6px" }}
      >
        Exam Readiness
      </h1>
      <p
        style={{
          fontSize: 18,
          fontWeight: 600,
          color: verdict.color,
          fontFamily: "var(--font-sans)",
          margin: "0 0 18px",
        }}
      >
        {verdict.text}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 16,
          marginBottom: timeline.weakObjectives.length > 0 ? 20 : 0,
        }}
      >
        <Stat label="Predicted score">
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span
              className="font-display"
              style={{ fontSize: 24, fontWeight: 400, color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}
            >
              {predicted ?? "—"}
            </span>
            <span style={{ fontSize: 11, color: "var(--fg-subtle)", fontFamily: "var(--font-sans)" }}>
              / {passingScore} to pass
            </span>
          </div>
          <div style={{ marginTop: 6 }}>
            <Bar
              value={scoreFill}
              color={predicted === null ? "var(--fg-subtle)" : predicted >= passingScore ? "var(--success)" : AMBER}
            />
          </div>
        </Stat>

        <Stat label="Days until exam">
          <span
            className="font-display"
            style={{ fontSize: 24, fontWeight: 400, color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}
          >
            {daysUntil ?? "—"}
          </span>
        </Stat>

        <Stat label="Recommended pace">
          <span
            className="font-mono"
            style={{ fontSize: 18, color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}
          >
            {recommendedDailyQuestions}
          </span>
          <span style={{ fontSize: 12, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginLeft: 4 }}>
            Q/day
          </span>
        </Stat>

        <Stat label="Avg speed">
          {paceAvgMs === null ? (
            <span style={{ fontSize: 14, color: "var(--fg-subtle)", fontFamily: "var(--font-sans)" }}>—</span>
          ) : (
            <div>
              <span
                className="font-mono"
                style={{ fontSize: 18, color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}
              >
                {formatMs(paceAvgMs)}
              </span>
              <span style={{ fontSize: 12, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>/Q</span>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-sans)",
                  color: paceOnTarget ? "var(--success)" : AMBER,
                  marginTop: 2,
                }}
              >
                <span aria-hidden="true">{paceOnTarget ? "✓ " : "⚠ "}</span>
                {paceOnTarget ? "on target" : "over 60s/Q"}
              </div>
            </div>
          )}
        </Stat>
      </div>

      {timeline.weakObjectives.length > 0 && (
        <div>
          <p
            className="font-mono"
            style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-subtle)", margin: "0 0 8px" }}
          >
            Weakest objectives
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {timeline.weakObjectives.slice(0, 6).map((obj) => (
              <WeakChip key={obj.id} obj={obj} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Settings link button (shared by empty / passed states) ───────────────────

function SettingsLink({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/settings"
      style={{
        height: 36,
        padding: "0 16px",
        background: "var(--accent)",
        color: "var(--accent-fg)",
        border: "none",
        borderRadius: "var(--r-sm)",
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "var(--font-sans)",
        display: "inline-flex",
        alignItems: "center",
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TimelinePage() {
  const [timeline, setTimeline] = useState<ExamTimeline | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const state = await getUserState();
        const certId = getActiveCertId(state ?? undefined);
        const t = await buildExamTimeline(certId);
        if (!cancelled) setTimeline(t);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const container: React.CSSProperties = { maxWidth: 680, margin: "0 auto", padding: "24px 16px 80px" };

  if (error) {
    return (
      <div style={container}>
        <Card>
          <p style={{ fontSize: 14, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", margin: 0 }}>
            Couldn&apos;t load your timeline. Please try again.
          </p>
        </Card>
      </div>
    );
  }

  if (!timeline) {
    return (
      <div style={container}>
        <p style={{ fontSize: 14, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
          Loading your plan…
        </p>
      </div>
    );
  }

  const passed = timeline.daysUntil !== null && timeline.daysUntil < 0;

  return (
    <div style={container} className="space-y-5">
      <ReadinessHeader timeline={timeline} />

      {!timeline.hasExamDate && (
        <Card>
          <h2
            className="font-display"
            style={{ fontSize: 18, fontWeight: 400, color: "var(--fg)", margin: "0 0 6px" }}
          >
            Set your exam date to unlock your plan
          </h2>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", lineHeight: 1.5, margin: "0 0 16px" }}>
            The readiness timeline builds a week-by-week study plan working back from your exam day —
            focus objectives, review load, and mock-exam checkpoints. Add your exam date in Settings to get started.
          </p>
          <SettingsLink>Set exam date →</SettingsLink>
        </Card>
      )}

      {timeline.hasExamDate && passed && (
        <Card>
          <h2
            className="font-display"
            style={{ fontSize: 18, fontWeight: 400, color: "var(--fg)", margin: "0 0 6px" }}
          >
            Your exam date has passed
          </h2>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", lineHeight: 1.5, margin: "0 0 16px" }}>
            If you&apos;ve rescheduled, update your exam date in Settings to rebuild your timeline.
          </p>
          <SettingsLink>Update exam date →</SettingsLink>
        </Card>
      )}

      {timeline.hasExamDate && !passed && timeline.weeks.length > 0 && (
        <>
          <div className="space-y-4">
            {timeline.weeks.map((week) => (
              <WeekCard key={week.index} week={week} />
            ))}
          </div>
          {timeline.weeksCapped && (
            <p style={{ fontSize: 12, color: "var(--fg-subtle)", fontFamily: "var(--font-sans)", textAlign: "center", marginTop: 4 }}>
              Showing the next {timeline.weeks.length} weeks.
            </p>
          )}
        </>
      )}
    </div>
  );
}
