"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  buildErrorNotebook,
  type ErrorCluster,
  type ErrorNotebook,
  type MissFlag,
  type MissItem,
} from "@/lib/error-notebook";
import { getUserState } from "@/lib/gamification";
import { getActiveCertId } from "@/lib/certs";
import { seedDb } from "@/lib/db";
import { formatMs } from "@/lib/pace";

// Amber caution color — distinct from the brand --accent so urgency reads on its
// own, never via color alone (every flag also carries a text label + glyph).
const AMBER = "#D98A2B";

// ─── Small presentational helpers ─────────────────────────────────────────────

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
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

function masteryLabel(mastery: number | null): string {
  return mastery === null ? "new" : `${Math.round(mastery * 100)}%`;
}

function masteryColor(mastery: number | null): string {
  if (mastery === null) return "var(--fg-subtle)";
  if (mastery >= 0.75) return "var(--success)";
  if (mastery >= 0.5) return AMBER;
  return "var(--error)";
}

// ─── Flag presentation ────────────────────────────────────────────────────────

// Each flag is conveyed by a glyph + text label + border color (never color
// alone). Overconfident is the loudest — it's the dangerous gap before a real
// exam (you were sure, and you were wrong).
const FLAG_META: Record<MissFlag, { label: string; glyph: string; color: string }> = {
  overconfident: { label: "Overconfident", glyph: "!", color: "var(--error)" },
  careless: { label: "Careless", glyph: "»", color: "#3B82F6" },
  struggling: { label: "Struggling", glyph: "•", color: "var(--fg-subtle)" },
};

function FlagBadge({ flag }: { flag: MissFlag }) {
  const meta = FLAG_META[flag];
  return (
    <span
      className="font-mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: meta.color,
        border: `1px solid ${meta.color}`,
        borderRadius: 3,
        padding: "1px 5px",
        lineHeight: "16px",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      <span aria-hidden="true">{meta.glyph}</span>
      {meta.label}
    </span>
  );
}

// ─── Summary stat tile ────────────────────────────────────────────────────────

function StatTile({
  label,
  count,
  meaning,
  loud = false,
}: {
  label: string;
  count: number;
  meaning: string;
  loud?: boolean;
}) {
  return (
    <div
      style={{
        border: loud ? `1px solid var(--error)` : "1px solid var(--border)",
        background: loud ? "rgba(217, 138, 43, 0.06)" : "transparent",
        borderRadius: "var(--r-sm)",
        padding: "12px 14px",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          className="font-display"
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: loud ? "var(--error)" : "var(--fg)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count}
        </span>
        <span
          className="font-mono"
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: loud ? "var(--error)" : "var(--fg-muted)",
          }}
        >
          {label}
        </span>
      </div>
      <p
        style={{
          margin: "4px 0 0",
          fontSize: 12,
          color: "var(--fg-muted)",
          fontFamily: "var(--font-sans)",
          lineHeight: 1.35,
          overflowWrap: "anywhere",
        }}
      >
        {meaning}
      </p>
    </div>
  );
}

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({ notebook }: { notebook: ErrorNotebook }) {
  const { overconfidentCount, carelessCount, strugglingCount, calibration } = notebook;
  return (
    <Card>
      <p
        className="font-mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--fg-subtle)",
          margin: "0 0 12px",
        }}
      >
        Why you missed
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
        }}
      >
        <StatTile
          label="Overconfident"
          count={overconfidentCount}
          meaning="Knew it… thought you did. Felt sure, got it wrong."
          loud
        />
        <StatTile label="Careless" count={carelessCount} meaning="Rushed it — answered fast and slipped." />
        <StatTile label="Struggling" count={strugglingCount} meaning="Genuine gap — the material hasn't stuck yet." />
      </div>

      {calibration && (
        <div style={{ marginTop: 16 }}>
          <p
            style={{
              fontSize: 13,
              color: "var(--fg)",
              fontFamily: "var(--font-sans)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            You felt sure on{" "}
            <span className="font-mono" style={{ fontVariantNumeric: "tabular-nums" }}>
              {calibration.highConfTotal}
            </span>{" "}
            answers and got{" "}
            <span
              className="font-mono"
              style={{ color: "var(--error)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
            >
              {calibration.highConfWrong}
            </span>{" "}
            wrong ({calibration.pctWrong}%).
          </p>
          {calibration.pctWrong >= 25 && (
            <p
              style={{
                marginTop: 6,
                fontSize: 12,
                color: AMBER,
                fontFamily: "var(--font-sans)",
                lineHeight: 1.5,
              }}
            >
              <span aria-hidden="true">⚠ </span>
              Your confidence is running ahead of your accuracy — slow down on the ones you&apos;re sure about.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Miss row ─────────────────────────────────────────────────────────────────

function MissRow({ miss }: { miss: MissItem }) {
  return (
    <Link
      href={`/quiz?qid=${miss.questionId}`}
      style={{
        display: "block",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)",
        padding: "10px 12px",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
        <FlagBadge flag={miss.flag} />
        <span
          className="font-mono"
          style={{ fontSize: 11, color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}
        >
          You picked {miss.picked ?? "—"} · Correct {miss.correctKey ?? "—"}
        </span>
      </div>
      <p
        style={{
          margin: "0 0 6px",
          fontSize: 13,
          color: "var(--fg)",
          fontFamily: "var(--font-sans)",
          lineHeight: 1.45,
          overflowWrap: "anywhere",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {miss.stem}
      </p>
      {(miss.confidence || miss.msSpent != null) && (
        <div
          className="font-mono"
          style={{ fontSize: 11, color: "var(--fg-subtle)", display: "flex", gap: 8, flexWrap: "wrap" }}
        >
          {miss.confidence && <span>felt {miss.confidence}</span>}
          {miss.confidence && miss.msSpent != null && <span aria-hidden="true">·</span>}
          {miss.msSpent != null && <span>{formatMs(miss.msSpent)}</span>}
        </div>
      )}
    </Link>
  );
}

// ─── Cluster card ─────────────────────────────────────────────────────────────

const clusterLinkStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "var(--accent)",
  fontFamily: "var(--font-sans)",
  textDecoration: "none",
};

function ClusterCard({ cluster }: { cluster: ErrorCluster }) {
  const missCount = cluster.misses.length;
  return (
    <Card style={{ padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
        <span className="font-mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", flexShrink: 0 }}>
          {cluster.code}
        </span>
        <span
          style={{
            fontSize: 14,
            color: "var(--fg)",
            fontFamily: "var(--font-sans)",
            overflowWrap: "anywhere",
            lineHeight: 1.35,
            flex: 1,
            minWidth: 0,
          }}
        >
          {cluster.name}
        </span>
        <span
          className="font-mono"
          style={{ fontSize: 11, color: "var(--fg-muted)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}
        >
          {missCount} miss{missCount !== 1 ? "es" : ""}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
        {cluster.domainNumber != null && (
          <span className="font-mono" style={{ fontSize: 11, color: "var(--fg-subtle)", flexShrink: 0 }}>
            Domain {cluster.domainNumber}
          </span>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 120, flex: "1 1 120px", maxWidth: 200 }}>
          <Bar value={cluster.mastery ?? 0} color={masteryColor(cluster.mastery)} />
          <span
            className="font-mono"
            style={{
              fontSize: 10,
              color: "var(--fg-subtle)",
              flexShrink: 0,
              fontVariantNumeric: "tabular-nums",
              width: 28,
              textAlign: "right",
            }}
          >
            {masteryLabel(cluster.mastery)}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
        <Link href={`/quiz?objective=${encodeURIComponent(cluster.code)}`} style={clusterLinkStyle}>
          Drill this objective →
        </Link>
        <Link href={`/library/objective/${encodeURIComponent(cluster.code)}`} style={clusterLinkStyle}>
          Deep dive →
        </Link>
      </div>

      <div className="space-y-2">
        {cluster.misses.map((miss) => (
          <MissRow key={miss.questionId} miss={miss} />
        ))}
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotebookPage() {
  const [notebook, setNotebook] = useState<ErrorNotebook | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await seedDb();
        const state = await getUserState();
        const certId = getActiveCertId(state ?? undefined);
        const nb = await buildErrorNotebook(certId);
        if (!cancelled) setNotebook(nb);
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
            Couldn&apos;t load your notebook. Please try again.
          </p>
        </Card>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div style={container}>
        <p style={{ fontSize: 14, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>Loading…</p>
      </div>
    );
  }

  const empty = notebook.totalMisses === 0;

  return (
    <div style={container} className="space-y-5">
      <div>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 400, color: "var(--fg)", margin: "0 0 6px" }}>
          Error Notebook
        </h1>
        <p style={{ fontSize: 14, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", margin: 0, lineHeight: 1.5 }}>
          What you missed in the last {notebook.windowDays} days — and why.
        </p>
      </div>

      {empty ? (
        <>
          <Card>
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "var(--fg)",
                fontFamily: "var(--font-sans)",
                margin: "0 0 8px",
                lineHeight: 1.4,
              }}
            >
              Nothing to fix right now
            </p>
            <p
              style={{
                fontSize: 13,
                color: "var(--fg-muted)",
                fontFamily: "var(--font-sans)",
                lineHeight: 1.55,
                margin: "0 0 16px",
              }}
            >
              Your recent answers are sticking. Do a few quizzes and check back.
            </p>
            <Link
              href="/quiz"
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: "var(--accent)",
                color: "var(--accent-fg)",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "var(--font-sans)",
                textDecoration: "none",
                borderRadius: "var(--r-sm)",
                padding: "11px 20px",
                minHeight: 44,
              }}
            >
              Start a quiz →
            </Link>
          </Card>
          {notebook.calibration && <SummaryCard notebook={notebook} />}
        </>
      ) : (
        <>
          <SummaryCard notebook={notebook} />
          <div className="space-y-4">
            {notebook.clusters.map((cluster) => (
              <ClusterCard key={cluster.objectiveId} cluster={cluster} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
