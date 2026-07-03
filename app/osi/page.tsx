"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { seedDb, db } from "@/lib/db";
import type { Question, PerfQuestion } from "@/lib/db";
import DragMatch from "@/components/pbq/DragMatch";

// OSI content lives under the Network+ cert. This trainer pulls it directly from
// IndexedDB (seeded for every user) so it works WITHOUT changing the active cert —
// a side trainer that never disturbs your Security+ (or other) progress.
const OSI_OBJECTIVE = "networkplus-n10-009:obj:1.1";
const QUIZ_SIZE = 10;

type Layer = { n: number; name: string; fn: string; ex: string; pdu: string };

const LAYERS: Layer[] = [
  { n: 7, name: "Application", fn: "User-facing network services", ex: "HTTP, DNS, SMTP, FTP", pdu: "Data" },
  { n: 6, name: "Presentation", fn: "Translation, encryption, compression", ex: "TLS/SSL, JPEG, ASCII", pdu: "Data" },
  { n: 5, name: "Session", fn: "Open / manage / close sessions", ex: "RPC, NetBIOS, PPTP", pdu: "Data" },
  { n: 4, name: "Transport", fn: "End-to-end delivery, ports, reliability", ex: "TCP, UDP", pdu: "Segment" },
  { n: 3, name: "Network", fn: "Logical addressing & routing", ex: "IP, ICMP, routers", pdu: "Packet" },
  { n: 2, name: "Data Link", fn: "Framing & MAC addressing", ex: "Ethernet, switches, MAC", pdu: "Frame" },
  { n: 1, name: "Physical", fn: "Bits on the medium", ex: "Cables, hubs, fiber, NICs", pdu: "Bit" },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--r-md)",
  padding: "20px 22px",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--fg-muted)",
  fontFamily: "var(--font-sans)",
  marginBottom: "14px",
};

export default function OsiTrainerPage() {
  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const [mcqPool, setMcqPool] = useState<Question[]>([]);
  const [pbq, setPbq] = useState<PerfQuestion | null>(null);

  useEffect(() => {
    (async () => {
      await seedDb();
      const [mcqs, pbqs] = await Promise.all([
        db.questions.where("objectiveId").equals(OSI_OBJECTIVE).toArray(),
        db.perfQuestions.where("objectiveId").equals(OSI_OBJECTIVE).toArray(),
      ]);
      setMcqPool(mcqs);
      setPbq(pbqs[0] ?? null);
      setPhase("ready");
    })();
  }, []);

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" style={{ color: "var(--fg-muted)" }}>
        Loading OSI trainer…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 80px" }} className="space-y-6">
      {/* Heading */}
      <div>
        <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: "8px" }}>
          Focused Trainer
        </p>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 400, color: "var(--fg)", lineHeight: 1.2 }}>
          OSI Layers
        </h1>
        <p style={{ fontSize: 14, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginTop: 4 }}>
          Get proficient with the 7-layer model: study the reference, match the layers, then quiz yourself.
        </p>
      </div>

      <ReferenceCard />
      <DrillCard pbq={pbq} />
      <QuizCard pool={mcqPool} />

      <div style={{ textAlign: "center" }}>
        <Link href="/practice" style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
          ← Back to Practice
        </Link>
      </div>
    </div>
  );
}

// ─── 1. Reference ─────────────────────────────────────────────────────────────

function ReferenceCard() {
  return (
    <div style={card}>
      <p style={sectionLabel}>The 7 Layers · top → bottom</p>
      <div className="space-y-1.5">
        {LAYERS.map((l) => (
          <div
            key={l.n}
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              alignItems: "baseline",
              gap: "10px",
              padding: "8px 0",
              borderBottom: l.n > 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <span className="font-mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", minWidth: 18 }}>
              {l.n}
            </span>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)", fontFamily: "var(--font-sans)" }}>{l.name}</span>
              <span style={{ fontSize: 12.5, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}> — {l.fn}</span>
              <div className="font-mono" style={{ fontSize: 11.5, color: "var(--fg-subtle)", marginTop: 2 }}>{l.ex}</div>
            </div>
            <span
              className="font-mono"
              style={{ fontSize: 10, color: "var(--fg-muted)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "1px 6px", whiteSpace: "nowrap" }}
            >
              {l.pdu}
            </span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", lineHeight: 1.6 }}>
        <strong style={{ color: "var(--fg)" }}>Mnemonics</strong> · L1→L7: <em>Please Do Not Throw Sausage Pizza Away</em> · L7→L1: <em>All People Seem To Need Data Processing</em>
      </div>
    </div>
  );
}

// ─── 2. Drag-match drill ──────────────────────────────────────────────────────

function DrillCard({ pbq }: { pbq: PerfQuestion | null }) {
  const [attempt, setAttempt] = useState(0); // remount key for "try again"
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null);

  if (!pbq) {
    return (
      <div style={card}>
        <p style={sectionLabel}>Match the layers</p>
        <p style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
          The layer-matching exercise isn’t loaded yet — try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div style={card}>
      <p style={sectionLabel}>Match the layers · drag or click</p>
      <DragMatch
        key={attempt}
        question={pbq}
        onSubmit={(correct, total) => setResult({ correct, total })}
      />
      {result && (
        <button
          onClick={() => { setResult(null); setAttempt((a) => a + 1); }}
          className="w-full h-10 text-sm font-medium"
          style={{
            marginTop: 10,
            background: "transparent",
            color: "var(--fg)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--r-sm)",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          Try again ↺
        </button>
      )}
    </div>
  );
}

// ─── 3. Focused MCQ quiz ──────────────────────────────────────────────────────

function QuizCard({ pool }: { pool: Question[] }) {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  function start() {
    setQuestions(shuffle(pool).slice(0, QUIZ_SIZE));
    setIndex(0);
    setPicked(null);
    setRevealed(false);
    setCorrectCount(0);
    setFinished(false);
  }

  function check() {
    if (picked === null || !questions) return;
    const q = questions[index];
    const isRight = !!q.choices.find((c) => c.key === picked && c.correct);
    if (isRight) setCorrectCount((n) => n + 1);
    setRevealed(true);
  }

  function next() {
    if (!questions) return;
    if (index >= questions.length - 1) { setFinished(true); return; }
    setIndex((i) => i + 1);
    setPicked(null);
    setRevealed(false);
  }

  // Idle state — start button
  if (!questions) {
    return (
      <div style={card}>
        <p style={sectionLabel}>Quiz yourself</p>
        {pool.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
            No OSI questions loaded yet — try refreshing.
          </p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: 14, lineHeight: 1.5 }}>
              {Math.min(QUIZ_SIZE, pool.length)} questions, immediate feedback. {pool.length} in the OSI pool.
            </p>
            <button
              onClick={start}
              className="w-full h-11 text-sm font-medium"
              style={{ background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: "var(--r-sm)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Start {Math.min(QUIZ_SIZE, pool.length)}-question quiz →
            </button>
          </>
        )}
      </div>
    );
  }

  // Results state
  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div style={card}>
        <p style={sectionLabel}>Quiz complete</p>
        <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
          <div className="flex items-baseline justify-center" style={{ gap: 6 }}>
            <span className="font-display" style={{ fontSize: 64, fontWeight: 400, color: "var(--fg)", lineHeight: 1 }}>{correctCount}</span>
            <span className="font-mono" style={{ fontSize: 26, color: "var(--fg-muted)" }}>/ {questions.length}</span>
          </div>
          <div className="font-mono" style={{ fontSize: 13, color: pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--accent)" : "var(--error)", marginTop: 6 }}>
            {pct}% correct
          </div>
        </div>
        <button
          onClick={start}
          className="w-full h-11 text-sm font-medium"
          style={{ background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: "var(--r-sm)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 600 }}
        >
          New quiz ↺
        </button>
      </div>
    );
  }

  // Question state
  const q = questions[index];
  return (
    <div style={card}>
      <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
        <p style={{ ...sectionLabel, marginBottom: 0 }}>Question {index + 1} of {questions.length}</p>
        <span className="font-mono" style={{ fontSize: 11, color: "var(--fg-subtle)" }}>OSI · Network+</span>
      </div>

      <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--fg)", fontFamily: "var(--font-sans)", marginBottom: 16 }}>
        {q.stem}
      </p>

      <div className="space-y-2">
        {q.choices.map((c) => {
          const isPicked = picked === c.key;
          let border = "var(--border-strong)";
          let bg = "transparent";
          let color = "var(--fg)";
          if (revealed) {
            if (c.correct) { border = "var(--success)"; bg = "rgba(95,179,124,0.08)"; color = "var(--success)"; }
            else if (isPicked) { border = "var(--error)"; bg = "rgba(229,92,92,0.08)"; color = "var(--error)"; }
          } else if (isPicked) {
            border = "var(--accent)"; bg = "rgba(245,166,35,0.08)";
          }
          return (
            <button
              key={c.key}
              onClick={() => !revealed && setPicked(c.key)}
              disabled={revealed}
              className="w-full text-left px-4 py-3 text-sm"
              style={{
                border: `1px solid ${border}`,
                borderRadius: "var(--r-sm)",
                background: bg,
                color,
                fontFamily: "var(--font-sans)",
                cursor: revealed ? "default" : "pointer",
                transition: "border-color 120ms, background 120ms",
              }}
            >
              <span className="font-mono font-semibold" style={{ marginRight: 8, color: "var(--fg-muted)" }}>{c.key}.</span>
              {c.text}
              {revealed && c.correct && <span className="font-mono" style={{ marginLeft: 8, fontSize: 10, opacity: 0.7 }}>✓</span>}
              {revealed && isPicked && !c.correct && <span className="font-mono" style={{ marginLeft: 8, fontSize: 10, opacity: 0.7 }}>✗</span>}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div style={{ marginTop: 14, padding: "12px 14px", background: "var(--surface-2)", borderRadius: "var(--r-sm)", fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.6, fontFamily: "var(--font-sans)" }}>
          {q.explanation}
        </div>
      )}

      <button
        onClick={revealed ? next : check}
        disabled={picked === null}
        className="w-full h-11 text-sm font-medium"
        style={{
          marginTop: 14,
          background: picked === null ? "var(--surface-2)" : "var(--fg)",
          color: picked === null ? "var(--fg-subtle)" : "var(--bg)",
          border: "none",
          borderRadius: "var(--r-sm)",
          cursor: picked === null ? "not-allowed" : "pointer",
          fontFamily: "var(--font-sans)",
          fontWeight: 600,
        }}
      >
        {revealed ? (index >= questions.length - 1 ? "See results →" : "Next question →") : "Check answer"}
      </button>
    </div>
  );
}
