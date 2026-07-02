"use client";

import { useState } from "react";
import type { Question, PerfQuestion } from "@/lib/db";
import { shuffle } from "@/lib/trainers";
import DragMatch from "@/components/pbq/DragMatch";

const QUIZ_SIZE = 10;

export const trainerCard: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--r-md)",
  padding: "20px 22px",
};

export const trainerLabel: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--fg-muted)",
  fontFamily: "var(--font-sans)",
  marginBottom: "14px",
};

/** Card chrome with an uppercase section label. */
export function TrainerSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={trainerCard}>
      <p style={trainerLabel}>{label}</p>
      {children}
    </div>
  );
}

// ─── Matching drill (drag or click) ───────────────────────────────────────────

export function TrainerDrill({ label, question }: { label: string; question: PerfQuestion | null }) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{ correct: number; total: number } | null>(null);

  if (!question) {
    return (
      <TrainerSection label={label}>
        <p style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
          The matching exercise isn’t loaded yet — try refreshing.
        </p>
      </TrainerSection>
    );
  }

  return (
    <TrainerSection label={label}>
      <DragMatch key={attempt} question={question} onSubmit={(correct, total) => setResult({ correct, total })} />
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
    </TrainerSection>
  );
}

// ─── Focused MCQ quiz ─────────────────────────────────────────────────────────

export function TrainerQuiz({ label, pool, topicTag }: { label: string; pool: Question[]; topicTag: string }) {
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
    if (q.choices.find((c) => c.key === picked && c.correct)) setCorrectCount((n) => n + 1);
    setRevealed(true);
  }

  function next() {
    if (!questions) return;
    if (index >= questions.length - 1) { setFinished(true); return; }
    setIndex((i) => i + 1);
    setPicked(null);
    setRevealed(false);
  }

  if (!questions) {
    const n = Math.min(QUIZ_SIZE, pool.length);
    return (
      <TrainerSection label={label}>
        {pool.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
            No questions loaded yet — try refreshing.
          </p>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: 14, lineHeight: 1.5 }}>
              {n} questions, immediate feedback. {pool.length} in the pool.
            </p>
            <button
              onClick={start}
              className="w-full h-11 text-sm font-medium"
              style={{ background: "var(--accent)", color: "var(--accent-fg)", border: "none", borderRadius: "var(--r-sm)", cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: 600 }}
            >
              Start {n}-question quiz →
            </button>
          </>
        )}
      </TrainerSection>
    );
  }

  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <TrainerSection label={label}>
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
      </TrainerSection>
    );
  }

  const q = questions[index];
  return (
    <TrainerSection label={label}>
      <div className="flex items-center justify-between" style={{ marginTop: -4, marginBottom: 12 }}>
        <span className="font-mono" style={{ fontSize: 11, color: "var(--fg-muted)" }}>Question {index + 1} of {questions.length}</span>
        <span className="font-mono" style={{ fontSize: 11, color: "var(--fg-subtle)" }}>{topicTag}</span>
      </div>

      <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--fg)", fontFamily: "var(--font-sans)", marginBottom: 16 }}>{q.stem}</p>

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
              style={{ border: `1px solid ${border}`, borderRadius: "var(--r-sm)", background: bg, color, fontFamily: "var(--font-sans)", cursor: revealed ? "default" : "pointer", transition: "border-color 120ms, background 120ms" }}
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
    </TrainerSection>
  );
}
