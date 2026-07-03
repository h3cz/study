// Admin analytics dashboard. Server Component (no "use client").
//
// Gated behind getAdminUser() — a non-admin (or signed-out) visitor gets a 404
// via notFound(), so the dashboard's existence is never disclosed. The heavy
// cross-user aggregation lives in lib/admin/analytics-server.ts (service role).

import { notFound } from "next/navigation";
import { getAdminUser } from "@/lib/admin/access";
import { getCert } from "@/lib/certs";
import {
  getAdminAnalytics,
  type RosterRow,
  type TrendPoint,
  type HistogramBucket,
  type WeakDomain,
  type ReportedQuestionRow,
} from "@/lib/admin/analytics-server";
import { Sparkline } from "@/components/admin/Sparkline";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── Shared presentational primitives ──────────────────────────────────────────

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
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
          marginBottom: subtitle ? "2px" : "16px",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: "12px", color: "var(--fg-subtle)", fontFamily: "var(--font-sans)", marginBottom: "16px" }}>
          {subtitle}
        </p>
      )}
      {children}
    </section>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        padding: "16px 18px",
      }}
    >
      <div
        className="font-mono"
        style={{
          fontSize: "26px",
          fontWeight: 600,
          color: "var(--fg)",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: "6px",
          fontSize: "11px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          fontFamily: "var(--font-sans)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Growth (sparklines) ───────────────────────────────────────────────────────

function SparkCard({ label, series, color }: { label: string; series: TrendPoint[]; color?: string }) {
  const points = series.map((p) => p.count);
  const latest = points.length > 0 ? points[points.length - 1] : 0;
  const total = points.reduce((a, b) => a + b, 0);
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)",
        padding: "14px 16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "10px" }}>
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {label}
        </span>
        <span
          className="font-mono"
          style={{ fontSize: "16px", fontWeight: 600, color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}
        >
          {latest}
        </span>
      </div>
      <Sparkline points={points} color={color} />
      <div style={{ marginTop: "8px", fontSize: "11px", color: "var(--fg-subtle)", fontFamily: "var(--font-sans)" }}>
        {total} over 30 days
      </div>
    </div>
  );
}

// ─── Quality bars ──────────────────────────────────────────────────────────────

function BarRow({ label, valueLabel, fraction, color = "var(--accent)" }: { label: string; valueLabel: string; fraction: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, fraction)) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "5px 0" }}>
      <span
        style={{
          width: "92px",
          flexShrink: 0,
          fontSize: "12px",
          color: "var(--fg)",
          fontFamily: "var(--font-sans)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: "8px", background: "var(--border)", borderRadius: "999px", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "999px" }} />
      </div>
      <span
        className="font-mono"
        style={{ width: "64px", flexShrink: 0, textAlign: "right", fontSize: "12px", color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}
      >
        {valueLabel}
      </span>
    </div>
  );
}

function Histogram({ buckets }: { buckets: HistogramBucket[] }) {
  const max = Math.max(...buckets.map((b) => b.count), 1);
  return (
    <div>
      {buckets.map((b) => (
        <BarRow
          key={b.bucket}
          label={b.bucket}
          valueLabel={String(b.count)}
          fraction={b.count / max}
          color={b.bucket === "700-799" || b.bucket === "800-900" ? "var(--accent)" : "var(--fg-muted)"}
        />
      ))}
    </div>
  );
}

function WeakDomains({ domains }: { domains: WeakDomain[] }) {
  if (domains.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
        Not enough mock-exam data yet (need 5+ attempts per domain).
      </p>
    );
  }
  return (
    <div>
      {domains.map((d) => (
        <BarRow
          key={d.domainId}
          label={`Domain ${d.domainId}`}
          valueLabel={`${d.accuracyPct}% · ${d.attempts}`}
          fraction={d.accuracyPct / 100}
          color={d.accuracyPct < 60 ? "#e55c5c" : "var(--fg-muted)"}
        />
      ))}
    </div>
  );
}

// ─── Reported questions table ──────────────────────────────────────────────────

function ReportedTable({ rows }: { rows: ReportedQuestionRow[] }) {
  if (rows.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
        No reported questions. 🎉
      </p>
    );
  }
  const th: React.CSSProperties = {
    fontSize: "10px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--fg-subtle)",
    fontFamily: "var(--font-mono)",
    textAlign: "left",
    padding: "0 12px 8px 0",
    whiteSpace: "nowrap",
  };
  const td: React.CSSProperties = {
    fontSize: "12px",
    color: "var(--fg)",
    fontFamily: "var(--font-sans)",
    padding: "8px 12px 8px 0",
    borderTop: "1px solid var(--border)",
    verticalAlign: "top",
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "520px" }}>
        <thead>
          <tr>
            <th style={th}>Question</th>
            <th style={th}>Cert</th>
            <th style={{ ...th, textAlign: "right" }}>Reports</th>
            <th style={th}>Reasons</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.questionId}>
              <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: "11px" }}>{r.questionId}</td>
              <td style={td}>{getCert(r.certId).name}</td>
              <td style={{ ...td, fontFamily: "var(--font-mono)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {r.count}
              </td>
              <td style={{ ...td, color: "var(--fg-muted)" }}>{r.reasons.join(", ") || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Roster table ──────────────────────────────────────────────────────────────

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00Z" : iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10);
}

function RosterTable({ rows }: { rows: RosterRow[] }) {
  const th: React.CSSProperties = {
    fontSize: "10px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--fg-subtle)",
    fontFamily: "var(--font-mono)",
    textAlign: "left",
    padding: "0 12px 8px 0",
    whiteSpace: "nowrap",
  };
  const thR: React.CSSProperties = { ...th, textAlign: "right" };
  const td: React.CSSProperties = {
    fontSize: "12px",
    color: "var(--fg)",
    fontFamily: "var(--font-sans)",
    padding: "9px 12px 9px 0",
    borderTop: "1px solid var(--border)",
    whiteSpace: "nowrap",
  };
  const tdNum: React.CSSProperties = {
    ...td,
    fontFamily: "var(--font-mono)",
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "880px" }}>
        <thead>
          <tr>
            <th style={th}>Name</th>
            <th style={th}>Email</th>
            <th style={th}>Status</th>
            <th style={th}>Certs</th>
            <th style={thR}>XP</th>
            <th style={thR}>Lvl</th>
            <th style={thR}>Streak</th>
            <th style={thR}>Predicted</th>
            <th style={thR}>Questions</th>
            <th style={th}>Last active</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.userId}>
              <td style={td}>{u.displayName || "—"}</td>
              <td style={{ ...td, color: "var(--fg-muted)" }}>{u.email || "—"}</td>
              <td style={td}>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.06em",
                    color: u.source === "registered" ? "var(--success)" : "var(--error)",
                    border: `1px solid ${u.source === "registered" ? "var(--success)" : "var(--error)"}`,
                    borderRadius: "var(--r-sm)",
                    padding: "2px 6px",
                    textTransform: "uppercase",
                  }}
                >
                  {u.source === "registered" ? "registered" : "auth only"}
                </span>
              </td>
              <td style={{ ...td, color: "var(--fg-muted)", whiteSpace: "normal", minWidth: "180px" }}>
                {u.certs.length === 0
                  ? "—"
                  : u.certs
                      .map((c) => `${c.name} (${c.predictedScore ?? "—"})`)
                      .join(", ")}
              </td>
              <td style={tdNum}>{u.xp.toLocaleString()}</td>
              <td style={tdNum}>{u.level}</td>
              <td style={tdNum}>{u.streak}</td>
              <td style={tdNum}>{u.predictedScore ?? "—"}</td>
              <td style={tdNum}>{u.questionsAnswered.toLocaleString()}</td>
              <td style={{ ...td, color: "var(--fg-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                {fmtDate(u.lastStudyDate)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const admin = await getAdminUser();
  if (!admin) notFound();

  const data = await getAdminAnalytics();
  const { overview, trends, quality, reportedQuestions, roster } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <header>
        <h1 className="font-display" style={{ fontSize: "28px", fontWeight: 400, color: "var(--fg)", marginBottom: "4px" }}>
          Admin · Analytics
        </h1>
        <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: "6px" }}>
          Cross-user aggregates across the whole userbase.
        </p>
        <p style={{ fontSize: "12px", color: "var(--fg-subtle)", fontFamily: "var(--font-sans)" }}>
          Signed in as <span className="font-mono" style={{ color: "var(--fg-muted)" }}>{admin.email}</span>
          {" · "}Visible only to allow-listed admins.
        </p>
      </header>

      {/* KPI cards */}
      <div
        style={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        }}
      >
        <KpiCard label="Total users" value={overview.totalUsers.toLocaleString()} />
        <KpiCard label="Registered profiles" value={overview.registeredProfiles.toLocaleString()} />
        <KpiCard label="Auth-only signups" value={overview.authOnlyUsers.toLocaleString()} />
        <KpiCard label="Active (7d)" value={overview.activeUsers7d.toLocaleString()} />
        <KpiCard label="Guest devices" value={overview.guestDevices.toLocaleString()} />
        <KpiCard label="Returning guests" value={overview.guestReturningDevices.toLocaleString()} />
        <KpiCard label="Guest return rate" value={overview.guestReturnRatePct != null ? `${overview.guestReturnRatePct}%` : "—"} />
        <KpiCard label="Guest signups" value={overview.guestClaimedDevices.toLocaleString()} />
        <KpiCard label="Guest signup rate" value={overview.guestSignupRatePct != null ? `${overview.guestSignupRatePct}%` : "—"} />
        <KpiCard label="Guest active (7d)" value={overview.guestActive7d.toLocaleString()} />
        <KpiCard label="Guest active (30d)" value={overview.guestActive30d.toLocaleString()} />
        <KpiCard label="Save prompts" value={overview.guestSavePromptViews.toLocaleString()} />
        <KpiCard label="Save clicks" value={overview.guestSavePromptClicks.toLocaleString()} />
        <KpiCard label="Save click rate" value={overview.guestSavePromptClickRatePct != null ? `${overview.guestSavePromptClickRatePct}%` : "—"} />
        <KpiCard label="New (7d)" value={overview.newUsers7d.toLocaleString()} />
        <KpiCard label="Questions answered" value={overview.totalQuestionsAnswered.toLocaleString()} />
        <KpiCard label="Avg predicted score" value={overview.avgPredictedScore != null ? String(overview.avgPredictedScore) : "—"} />
        <KpiCard label="Duels played" value={overview.totalDuelsCompleted.toLocaleString()} />
      </div>

      {/* Growth */}
      <Section title="Growth" subtitle="Last 30 days">
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <SparkCard label="Signups" series={trends.signups} />
          <SparkCard label="Quiz activity" series={trends.quizActivity} color="#5fb37c" />
          <SparkCard label="Active users" series={trends.activeUsers} color="#6a9bd8" />
          <SparkCard label="Guest activity" series={trends.guestActivity} color="#f5a623" />
        </div>
      </Section>

      {/* Learning quality */}
      <Section title="Learning quality">
        <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          <div>
            <div style={{ display: "flex", gap: "24px", marginBottom: "18px" }}>
              <div>
                <div className="font-mono" style={{ fontSize: "22px", fontWeight: 600, color: "var(--fg)" }}>
                  {quality.overallAccuracyPct != null ? `${quality.overallAccuracyPct}%` : "—"}
                </div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginTop: "4px" }}>
                  Overall accuracy
                </div>
              </div>
              <div>
                <div className="font-mono" style={{ fontSize: "22px", fontWeight: 600, color: "var(--fg)" }}>
                  {quality.mockPassRatePct != null ? `${quality.mockPassRatePct}%` : "—"}
                </div>
                <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginTop: "4px" }}>
                  Mock pass rate
                </div>
              </div>
            </div>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-subtle)", fontFamily: "var(--font-sans)", marginBottom: "8px" }}>
              Predicted-score distribution
            </p>
            <Histogram buckets={quality.predictedScoreHistogram} />
          </div>
          <div>
            <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-subtle)", fontFamily: "var(--font-sans)", marginBottom: "8px" }}>
              Weakest domains (mock exams)
            </p>
            <WeakDomains domains={quality.weakestDomains} />
          </div>
        </div>
      </Section>

      {/* Content feedback */}
      <Section title="Content feedback" subtitle="Most-reported questions">
        <ReportedTable rows={reportedQuestions} />
      </Section>

      {/* Roster */}
      <Section title="Roster" subtitle={`${roster.length} user${roster.length === 1 ? "" : "s"} · sorted by XP`}>
        <RosterTable rows={roster} />
      </Section>
    </div>
  );
}
