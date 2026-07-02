"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { seedDb, db } from "@/lib/db";
import { buildMockExam, examRawToScale, isPbqArrangementCorrect } from "@/lib/exam";
import { enqueue } from "@/lib/sync/engine";
import type { Question, PerfQuestion, MockExamSession } from "@/lib/db";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";
import { getActiveCertId, getCert, DEFAULT_CERT_ID } from "@/lib/certs";
import DragMatch from "@/components/pbq/DragMatch";

const TOTAL_TIME_S = 90 * 60; // 90 minutes

type ExamItem =
  | { kind: "mcq"; q: Question }
  | { kind: "pbq"; q: PerfQuestion };

interface Answer {
  picked: string | null;
  flagged: boolean;
  // PBQ only: the user's right-column arrangement. Parent-owned so it survives
  // navigation between questions (DragMatch remounts when the index changes).
  // null on MCQ items.
  pbqArrangement: string[] | null;
  // PBQ only: true once the user has moved at least one tile. Used so an
  // untouched PBQ counts as "unanswered" in the progress + submit warning.
  pbqTouched: boolean;
}

/** Fisher-Yates shuffle (returns a new array). */
function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ─── Timer display helper ─────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ─── Jump Grid ────────────────────────────────────────────────────────────────

function JumpGrid({
  total,
  current,
  answers,
  answered,
  onJump,
  onClose,
  triggerRef,
}: {
  total: number;
  current: number;
  answers: Answer[];
  answered: boolean[];
  onJump: (i: number) => void;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus first focusable element on open; return focus to trigger on close
  useEffect(() => {
    const trigger = triggerRef?.current;
    const firstBtn = dialogRef.current?.querySelector<HTMLElement>("button");
    firstBtn?.focus();
    return () => {
      trigger?.focus();
    };
  }, [triggerRef]);

  // Escape to close + focus trap
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled"));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Jump to question"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border-strong)",
          padding: "20px",
          maxWidth: "480px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Question Navigator
          </p>
          <button
            onClick={onClose}
            aria-label="Close question navigator"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              margin: "-12px -12px -12px 0",
              background: "transparent",
              border: "none",
              color: "var(--fg-muted)",
              cursor: "pointer",
              fontSize: "22px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        {/* Legend */}
        <div className="flex gap-4 mb-4 flex-wrap">
          <span className="flex items-center gap-1.5" style={{ fontSize: "11px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "var(--accent)", display: "inline-block" }} />
            Answered
          </span>
          <span className="flex items-center gap-1.5" style={{ fontSize: "11px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "transparent", border: "1.5px solid var(--border-strong)", display: "inline-block" }} />
            Unanswered
          </span>
          <span className="flex items-center gap-1.5" style={{ fontSize: "11px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(245,166,35,0.25)", border: "1.5px solid var(--accent)", display: "inline-block" }} />
            Flagged
          </span>
        </div>
        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))",
            gap: "6px",
          }}
        >
          {Array.from({ length: total }).map((_, i) => {
            const ans = answers[i];
            const isAnswered = !!answered[i];
            const isFlagged = !!ans?.flagged;
            const isCurrent = i === current;
            return (
              <button
                key={i}
                onClick={() => onJump(i)}
                style={{
                  height: "40px",
                  borderRadius: "var(--r-sm)",
                  border: isCurrent
                    ? "2px solid var(--fg)"
                    : isFlagged
                    ? "1.5px solid var(--accent)"
                    : "1.5px solid var(--border-strong)",
                  background: isFlagged
                    ? "rgba(245,166,35,0.25)"
                    : isAnswered
                    ? "var(--accent)"
                    : "transparent",
                  color: isAnswered && !isFlagged ? "var(--accent-fg)" : "var(--fg)",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: isCurrent ? 700 : 400,
                  cursor: "pointer",
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main exam runner ─────────────────────────────────────────────────────────

export default function ExamRunPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "running" | "confirm-submit">("loading");
  const [items, setItems] = useState<ExamItem[]>([]);
  const [examId, setExamId] = useState("");
  // Active cert resolved from user state on mount; drives content + pass line.
  // Falls back to the default until state loads so the initial render is safe.
  const [certId, setCertId] = useState<string>(DEFAULT_CERT_ID);
  const [examStartedAt, setExamStartedAt] = useState("");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_S);
  const [showJump, setShowJump] = useState(false);
  const jumpTriggerRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittedRef = useRef(false);

  // Load exam on mount
  useEffect(() => {
    // Guard: require the rules-screen ack flag so direct navigation is blocked
    const ack = typeof window !== "undefined" && sessionStorage.getItem("exam_ack") === "1";
    if (!ack) {
      router.replace("/exam");
      return;
    }
    sessionStorage.removeItem("exam_ack");

    async function load() {
      await seedDb();
      // Resolve the active cert so the exam is built from — and scored against —
      // the cert the user selected in Settings, not a hardcoded Security+.
      const state = await db.userState.get(1);
      const activeCertId = getActiveCertId(state);
      setCertId(activeCertId);
      const { mcqs, pbqs, examId: eid } = await buildMockExam(activeCertId);
      const examItems: ExamItem[] = [
        ...mcqs.map((q): ExamItem => ({ kind: "mcq", q })),
        ...pbqs.map((q): ExamItem => ({ kind: "pbq", q })),
      ];
      setItems(examItems);
      setExamId(eid);
      setExamStartedAt(new Date().toISOString());
      setAnswers(
        examItems.map((it): Answer =>
          it.kind === "pbq"
            ? {
                picked: null,
                flagged: false,
                // Seed a stable shuffled arrangement so the matcher renders the
                // same starting order every time the user revisits this PBQ.
                pbqArrangement: shuffleArray(it.q.pairs.map((p) => p.right)),
                pbqTouched: false,
              }
            : { picked: null, flagged: false, pbqArrangement: null, pbqTouched: false }
        )
      );
      setPhase("running");
    }
    load();
  }, [router]);

  const submitExam = useCallback(
    async (finalAnswers: Answer[], finalTimeLeft: number) => {
      if (submittedRef.current) return;
      submittedRef.current = true;

      if (timerRef.current) clearInterval(timerRef.current);

      const completedAt = new Date().toISOString();
      const durationMs = (TOTAL_TIME_S - finalTimeLeft) * 1000;

      // Build domain breakdown
      const domainBreakdown: Record<string, { correct: number; total: number }> = {};
      const questionsPayload: MockExamSession["questions"] = [];

      let numCorrect = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const ans = finalAnswers[i];

        if (item.kind === "mcq") {
          const picked = ans.picked;
          const correct = picked
            ? !!item.q.choices.find((c) => c.key === picked && c.correct)
            : false;
          if (correct) numCorrect++;

          const domainId = item.q.domainId;
          if (!domainBreakdown[domainId]) domainBreakdown[domainId] = { correct: 0, total: 0 };
          domainBreakdown[domainId].total++;
          if (correct) domainBreakdown[domainId].correct++;

          questionsPayload.push({ qId: item.q.id, picked, correct, flagged: ans.flagged, kind: "mcq" });
        } else {
          // PBQ — score the user's drag-match arrangement. A PBQ is correct only
          // when every pair is placed correctly (mirrors the practice-mode rule
          // `correctCount === totalPairs`). Untouched PBQs keep their seeded
          // shuffle and are graded as-is.
          const arrangement = ans.pbqArrangement ?? [];
          const correct = isPbqArrangementCorrect(item.q.pairs, arrangement);
          if (correct) numCorrect++;

          const domainId = item.q.domainId;
          if (!domainBreakdown[domainId]) domainBreakdown[domainId] = { correct: 0, total: 0 };
          domainBreakdown[domainId].total++;
          if (correct) domainBreakdown[domainId].correct++;

          questionsPayload.push({ qId: item.q.id, picked: null, correct, flagged: ans.flagged, kind: "pbq", pbqAnswer: arrangement });
        }
      }

      const totalQuestions = items.length;
      // PBQs are now interactive and auto-graded, so score across all items.
      // A perfect run (85 MCQ + 5 PBQ) → 90/90 → 100% → 900.
      const scorePercent = totalQuestions > 0 ? Math.round((numCorrect / totalQuestions) * 100) : 0;
      const predictedScore = examRawToScale(numCorrect, totalQuestions);
      const passingScore = getCert(certId).passingScore;
      const passed = predictedScore >= passingScore;

      const session: MockExamSession = {
        id: examId,
        certId, // the active cert this exam was built for
        startedAt: examStartedAt,
        completedAt,
        durationMs,
        totalQuestions,
        numCorrect,
        scorePercent,
        predictedScore,
        passed,
        domainBreakdown,
        questions: questionsPayload,
      };

      await db.mockExamSessions.put(session);

      // Sync to Supabase (fire-and-forget)
      enqueue("insert_mock_exam", {
        id: examId,
        user_id: "",
        started_at: examStartedAt,
        completed_at: completedAt,
        duration_ms: durationMs,
        total_questions: totalQuestions,
        num_correct: numCorrect,
        score_percent: scorePercent,
        predicted_score: predictedScore,
        passed,
        domain_breakdown: domainBreakdown,
        questions: questionsPayload,
      }).catch(() => {});

      router.push(`/exam/results?id=${examId}`);
    },
    [items, examId, examStartedAt, certId, router]
  );

  // Start countdown timer
  useEffect(() => {
    if (phase !== "running") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Auto-submit
          setAnswers((currentAnswers) => {
            submitExam(currentAnswers, 0);
            return currentAnswers;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, submitExam]);

  function toggleFlag(i: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], flagged: !next[i].flagged };
      return next;
    });
  }

  function pickAnswer(key: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], picked: key };
      return next;
    });
  }

  function setPbqArrangement(i: number, slots: string[]) {
    setAnswers((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], pbqArrangement: slots, pbqTouched: true };
      return next;
    });
  }
  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useKeyboardShortcuts({
    "1": () => { if (phase === "running" && currentItem?.kind === "mcq") pickAnswer(currentItem.q.choices[0]?.key ?? ""); },
    "2": () => { if (phase === "running" && currentItem?.kind === "mcq") pickAnswer(currentItem.q.choices[1]?.key ?? ""); },
    "3": () => { if (phase === "running" && currentItem?.kind === "mcq") pickAnswer(currentItem.q.choices[2]?.key ?? ""); },
    "4": () => { if (phase === "running" && currentItem?.kind === "mcq") pickAnswer(currentItem.q.choices[3]?.key ?? ""); },
    "ArrowRight": () => { if (phase === "running") setIndex((i) => Math.min(items.length - 1, i + 1)); },
    "ArrowLeft": () => { if (phase === "running") setIndex((i) => Math.max(0, i - 1)); },
    "f": () => { if (phase === "running") toggleFlag(index); },
    "j": () => { if (phase === "running") setShowJump((v) => !v); },
    "Escape": () => { setShowJump(false); },
  });


  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)" }}>
        Building your exam…
      </div>
    );
  }

  const currentItem = items[index];
  const currentAnswer: Answer = answers[index] ?? { picked: null, flagged: false, pbqArrangement: null, pbqTouched: false };
  // A question counts as answered when an MCQ has a pick, or a PBQ has been
  // touched (its tiles deliberately start pre-filled, so "has a value" isn't
  // a meaningful signal of engagement on its own).
  const answeredFlags = items.map((it, i) =>
    it.kind === "mcq" ? answers[i]?.picked != null : !!answers[i]?.pbqTouched
  );
  const answeredCount = answeredFlags.filter(Boolean).length;
  const flaggedCount = answers.filter((a) => a.flagged).length;

  // Timer color
  let timerColor = "var(--fg)";
  if (timeLeft <= 60) timerColor = "var(--error)";
  else if (timeLeft <= 600) timerColor = "var(--accent)";

  const timerFlash = timeLeft <= 60 && Math.floor(timeLeft) % 2 === 0;

  return (
    <div className="space-y-4 pb-24 max-w-3xl mx-auto">
      {/* Sticky top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 0",
          marginBottom: "8px",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Left: Q counter + answered + flagged */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="font-mono"
              style={{ fontSize: "13px", color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}
            >
              Question {index + 1} of {items.length}
            </span>
            <span
              className="font-mono"
              style={{ fontSize: "11px", color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}
            >
              Answered: {answeredCount}
            </span>
            {flaggedCount > 0 && (
              <span
                className="font-mono"
                style={{ fontSize: "11px", color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}
              >
                Flagged: {flaggedCount}
              </span>
            )}
          </div>
          {/* Right: timer */}
          <span
            className="font-mono"
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: timerColor,
              fontVariantNumeric: "tabular-nums",
              opacity: timerFlash ? 0.3 : 1,
              transition: "opacity 0.3s",
              letterSpacing: "0.04em",
            }}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: "2px",
            background: "var(--border-strong)",
            borderRadius: "1px",
            overflow: "hidden",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((index + 1) / items.length) * 100}%`,
              background: "var(--accent)",
              transition: "width 150ms ease-out",
            }}
          />
        </div>
      </div>

      {/* Question card */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border)",
          padding: "24px",
        }}
      >
        {currentItem.kind === "mcq" ? (
          <>
            {/* Objective chip */}
            <div className="mb-3 flex items-center gap-2">
              <span
                className="font-mono"
                style={{
                  background: "rgba(245, 166, 35, 0.12)",
                  color: "var(--accent)",
                  borderRadius: "var(--r-sm)",
                  padding: "2px 6px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {currentItem.q.objectiveId.split(":obj:")[1]}
              </span>
              <span
                className="font-mono"
                style={{ fontSize: "11px", color: "var(--fg-subtle)", letterSpacing: "0.05em" }}
              >
                MCQ
              </span>
            </div>

            {/* Stem */}
            <p
              style={{
                fontSize: "17px",
                lineHeight: 1.55,
                color: "var(--fg)",
                marginBottom: "20px",
                fontFamily: "var(--font-sans)",
              }}
            >
              {currentItem.q.stem}
            </p>

            {/* Choices — no feedback during exam */}
            <div className="space-y-2">
              {currentItem.q.choices.map((choice) => {
                const isSelected = currentAnswer.picked === choice.key;
                return (
                  <button
                    key={choice.key}
                    onClick={() => pickAnswer(choice.key)}
                    className="w-full text-left px-4 py-3 text-sm focus-visible:outline-none"
                    style={{
                      border: `1px solid ${isSelected ? "var(--accent)" : "var(--border-strong)"}`,
                      borderRadius: "var(--r-sm)",
                      background: isSelected ? "rgba(245, 166, 35, 0.08)" : "transparent",
                      color: "var(--fg)",
                      transition: "border-color 150ms, background-color 150ms",
                      fontFamily: "var(--font-sans)",
                      cursor: "pointer",
                    }}
                  >
                    <span className="font-mono font-semibold mr-2" style={{ color: "var(--fg-muted)" }}>
                      {choice.key}.
                    </span>
                    {choice.text}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            {/* PBQ — interactive drag/tap match. No correctness feedback during
                the exam (consistent with MCQs); the arrangement is persisted in
                answer state and scored at submit. DragMatch renders the prompt. */}
            <div className="mb-3 flex items-center gap-2">
              <span
                className="font-mono"
                style={{
                  background: "rgba(245, 166, 35, 0.12)",
                  color: "var(--accent)",
                  borderRadius: "var(--r-sm)",
                  padding: "2px 6px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                {currentItem.q.objectiveId.split(":obj:")[1]}
              </span>
              <span
                className="font-mono"
                style={{ fontSize: "11px", color: "var(--fg-subtle)", letterSpacing: "0.05em" }}
              >
                PBQ
              </span>
            </div>
            <DragMatch
              key={currentItem.q.id}
              question={currentItem.q}
              mode="exam"
              value={currentAnswer.pbqArrangement ?? undefined}
              onArrangementChange={(slots) => setPbqArrangement(index, slots)}
            />
          </>
        )}
      </div>

      {/* Bottom nav — fixed. Two zones: a nav cluster (Prev/Next/Flag/Jump)
          and Submit. On narrow phones the cluster shares the row evenly and
          Submit sits flush-right; nothing overflows at 360px and the bar
          clears the iPhone home indicator via the safe-area inset. */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--bg)",
          borderTop: "1px solid var(--border)",
          paddingTop: "12px",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
          paddingLeft: "max(12px, env(safe-area-inset-left, 0px))",
          paddingRight: "max(12px, env(safe-area-inset-right, 0px))",
          zIndex: 50,
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-1.5 sm:gap-2">
          {/* Prev */}
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            aria-label="Previous question"
            className="exam-nav-btn"
            style={{
              height: "44px",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--r-sm)",
              background: "transparent",
              color: "var(--fg)",
              fontSize: "13px",
              fontFamily: "var(--font-sans)",
              cursor: index === 0 ? "not-allowed" : "pointer",
              opacity: index === 0 ? 0.4 : 1,
            }}
          >
            ←<span className="exam-btn-label"> Prev</span>
          </button>

          {/* Next */}
          <button
            onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
            disabled={index === items.length - 1}
            aria-label="Next question"
            className="exam-nav-btn"
            style={{
              height: "44px",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--r-sm)",
              background: "transparent",
              color: "var(--fg)",
              fontSize: "13px",
              fontFamily: "var(--font-sans)",
              cursor: index === items.length - 1 ? "not-allowed" : "pointer",
              opacity: index === items.length - 1 ? 0.4 : 1,
            }}
          >
            <span className="exam-btn-label">Next </span>→
          </button>

          {/* Flag */}
          <button
            onClick={() => toggleFlag(index)}
            aria-label={currentAnswer.flagged ? "Unflag question" : "Flag question"}
            className="exam-nav-btn"
            style={{
              height: "44px",
              border: `1px solid ${currentAnswer.flagged ? "var(--accent)" : "var(--border-strong)"}`,
              borderRadius: "var(--r-sm)",
              background: currentAnswer.flagged ? "rgba(245,166,35,0.12)" : "transparent",
              color: currentAnswer.flagged ? "var(--accent)" : "var(--fg-muted)",
              fontSize: "13px",
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
            }}
          >
            {currentAnswer.flagged ? "★" : "☆"}<span className="exam-btn-label">{currentAnswer.flagged ? " Flagged" : " Flag"}</span>
          </button>

          {/* Jump */}
          <button
            ref={jumpTriggerRef}
            onClick={() => setShowJump(true)}
            aria-label="Jump to question"
            className="exam-nav-btn"
            style={{
              height: "44px",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--r-sm)",
              background: "transparent",
              color: "var(--fg-muted)",
              fontSize: "13px",
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
            }}
          >
            Jump
          </button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Submit */}
          <button
            onClick={() => setPhase("confirm-submit")}
            style={{
              height: "44px",
              padding: "0 14px",
              background: "var(--fg)",
              color: "var(--bg)",
              border: "none",
              borderRadius: "var(--r-sm)",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Submit<span className="exam-btn-label"> exam</span>
          </button>
        </div>
      </div>

      {/* Jump grid overlay */}
      {showJump && (
        <JumpGrid
          total={items.length}
          current={index}
          answers={answers}
          answered={answeredFlags}
          onJump={(i) => { setIndex(i); setShowJump(false); }}
          onClose={() => setShowJump(false)}
          triggerRef={jumpTriggerRef}
        />
      )}

      {/* Submit confirm overlay */}
      {phase === "confirm-submit" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--border-strong)",
              padding: "28px 24px",
              maxWidth: "360px",
              width: "100%",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 500,
                color: "var(--fg)",
                marginBottom: "12px",
                fontFamily: "var(--font-sans)",
              }}
            >
              Submit exam?
            </h2>
            <p style={{ fontSize: "13px", color: "var(--fg-muted)", marginBottom: "20px", fontFamily: "var(--font-sans)" }}>
              {answeredCount < items.length
                ? `You have ${items.length - answeredCount} unanswered question${items.length - answeredCount !== 1 ? "s" : ""}. Unanswered questions are marked incorrect.`
                : "All questions answered. This cannot be undone."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => submitExam(answers, timeLeft)}
                style={{
                  flex: 1,
                  height: "40px",
                  background: "var(--fg)",
                  color: "var(--bg)",
                  border: "none",
                  borderRadius: "var(--r-sm)",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
              <button
                onClick={() => setPhase("running")}
                style={{
                  height: "40px",
                  padding: "0 16px",
                  background: "transparent",
                  color: "var(--fg-muted)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
