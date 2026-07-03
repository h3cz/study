"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { seedDb, db } from "@/lib/db";
import { getWrongAnswers } from "@/lib/wrong-answers";
import { recordQuizResult } from "@/lib/gamification";
import type { Question } from "@/lib/db";
import { getExplanationsForQuestion } from "@/lib/distractor-explanations";
import ReportButton from "@/components/ReportButton";
import { EmptyState } from "@/components/icons/EmptyState";
import { MicGlyph } from "@/components/icons/MicGlyph";
import BookmarkButton from "@/components/BookmarkButton";
import RemediationLink from "@/components/RemediationLink";
import { DEFAULT_CERT_ID, getActiveCertId } from "@/lib/certs";

const SESSION_CAP = 10;

interface ReviewItem {
  question: Question;
  lastPicked: "A" | "B" | "C" | "D" | null;
  attemptedAt: string;
  source?: string; // e.g. "voice-tutor" when the missed attempt came from voice
}

type Phase = "loading" | "question" | "revealed" | "done";

export default function ReviewPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [xpEarned, setXpEarned] = useState(0);
  const [wrongExplanations, setWrongExplanations] = useState<Record<string, string> | null>(null);
  // Active cert resolved on mount; falls back to the default until state loads.
  const [certId, setCertId] = useState<string>(DEFAULT_CERT_ID);

  useEffect(() => {
    async function load() {
      await seedDb();
      const state = await db.userState.get(1);
      const activeCertId = getActiveCertId(state);
      setCertId(activeCertId);

      // Get wrong answers sorted desc (latest first), take oldest SESSION_CAP.
      // Cert-scoped so a Network+ user only reviews Network+ misses.
      const wrongs = await getWrongAnswers({ sinceDays: 14, certId: activeCertId });
      if (wrongs.length === 0) {
        setPhase("done");
        setItems([]);
        return;
      }

      // Take oldest SESSION_CAP for spacing effect
      const batch = wrongs.slice().reverse().slice(0, SESSION_CAP);

      const questionIds = batch.map((w) => w.questionId);
      const questions = await db.questions
        .where("id")
        .anyOf(questionIds)
        .toArray();
      const questionMap = new Map(questions.map((q) => [q.id, q]));

      const reviewItems: ReviewItem[] = batch
        .map((w) => {
          const q = questionMap.get(w.questionId);
          if (!q) return null;
          return {
            question: q,
            lastPicked: w.picked,
            attemptedAt: w.attemptedAt,
            ...(w.source ? { source: w.source } : {}),
          } satisfies ReviewItem;
        })
        .filter((x): x is ReviewItem => x !== null);

      if (reviewItems.length === 0) {
        setPhase("done");
        setItems([]);
        return;
      }

      setItems(reviewItems);
      setPhase("question");
    }
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, []);

  const current = items[index];
  const currentQuestionId = current?.question.id;

  useEffect(() => {
    if (phase === "revealed" && currentQuestionId) {
      getExplanationsForQuestion(currentQuestionId).then(setWrongExplanations);
    } else {
      const timer = setTimeout(() => setWrongExplanations(null), 0);
      return () => clearTimeout(timer);
    }
  }, [phase, currentQuestionId]);

  // Select only — changeable until the user commits with handleSubmit.
  function handlePick(key: string) {
    if (phase !== "question") return;
    setChosen(key);
  }

  function handleSubmit() {
    if (phase !== "question" || !chosen) return;
    setPhase("revealed");
  }

  async function handleNext() {
    const current = items[index];
    if (!current || !chosen) return;

    const next = { ...answers, [current.question.id]: chosen };
    setAnswers(next);

    if (index + 1 >= items.length) {
      // Record as a fresh quiz session
      let correct = 0;
      for (const item of items) {
        const picked = next[item.question.id];
        if (item.question.choices.find((c) => c.key === picked && c.correct)) correct++;
      }
      const score = Math.round((correct / items.length) * 100);
      const result = await recordQuizResult(
        correct,
        certId,
        items.map((i) => i.question.id),
        next,
        score,
        undefined, // no answerRecords in review mode
        "mcq"
      );
      setXpEarned(result.xpEarned);
      setPhase("done");
    } else {
      setIndex(index + 1);
      setChosen(null);
      setPhase("question");
    }
  }

  if (phase === "loading") {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        style={{ color: "var(--fg-muted)" }}
      >
        Loading review queue…
      </div>
    );
  }

  // Empty state or done
  if (phase === "done" && items.length === 0) {
    return (
      <div className="space-y-4">
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--border)",
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <EmptyState variant="no-wrong-answers" />
          </div>
          <p
            style={{
              fontSize: "14px",
              color: "var(--fg)",
              marginBottom: "8px",
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
            }}
          >
            No wrong answers to review yet.
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "var(--fg-muted)",
              marginBottom: "24px",
              lineHeight: "24px",
            }}
          >
            Each quiz tracks questions you miss · reviewing them is the fastest way to close gaps before the real exam.
          </p>
          <Link
            href="/quiz"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: "40px",
              padding: "0 20px",
              background: "var(--accent)",
              color: "var(--accent-fg)",
              borderRadius: "4px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
            }}
          >
            Take a quiz →
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    const correct = items.filter((item) => {
      const picked = answers[item.question.id];
      return item.question.choices.find((c) => c.key === picked && c.correct);
    }).length;
    const pct = Math.round((correct / items.length) * 100);

    return (
      <div className="space-y-4">
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--border)",
            padding: "32px 24px",
          }}
        >
          <h2
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
              marginBottom: "24px",
            }}
          >
            Review Complete
          </h2>

          <div className="text-center py-4">
            <div className="flex items-baseline justify-center gap-2">
              <span
                className="font-display"
                style={{ fontSize: "80px", fontWeight: 400, color: "var(--fg)", lineHeight: 1 }}
              >
                {correct}
              </span>
              <span
                className="font-mono"
                style={{ fontSize: "32px", color: "var(--fg-muted)" }}
              >
                / {items.length}
              </span>
            </div>
            <div
              className="font-mono mt-2"
              style={{ fontSize: "13px", color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}
            >
              {pct}% correct
            </div>
          </div>

          <div
            style={{
              height: "2px",
              background: "var(--border-strong)",
              borderRadius: "1px",
              overflow: "hidden",
              margin: "16px 0",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: "var(--accent)",
                transition: "width 300ms ease-out",
              }}
            />
          </div>

          <div className="flex gap-3 justify-center">
            <span
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
                borderRadius: "var(--r-sm)",
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
              }}
            >
              +{xpEarned} XP
            </span>
          </div>

          <div className="flex gap-3 pt-6">
            <Link
              href="/"
              className="flex-1 h-10 flex items-center justify-center text-sm font-medium"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
                borderRadius: "var(--r-sm)",
                textDecoration: "none",
              }}
            >
              Back to Dashboard
            </Link>
            <Link
              href="/quiz"
              className="flex-1 h-10 flex items-center justify-center text-sm font-medium"
              style={{
                background: "transparent",
                color: "var(--fg)",
                borderRadius: "var(--r-sm)",
                border: "1px solid var(--border-strong)",
                textDecoration: "none",
              }}
            >
              Take a Quiz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const correctChoice = current.question.choices.find((c) => c.correct);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
          }}
        >
          Wrong-Answer Review
        </span>
        <span
          className="font-mono"
          style={{ fontSize: "12px", color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}
        >
          {index + 1}/{items.length}
        </span>
      </div>

      {/* Progress bar */}
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
            width: `${((index + 1) / items.length) * 100}%`,
            background: "var(--accent)",
            transition: "width 150ms ease-out",
          }}
        />
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
        {/* Objective code + optional via-voice marker */}
        <div className="mb-3" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link
            href={`/library/objective/${current.question.objectiveId.split(":obj:")[1]}`}
            className="font-mono"
            aria-label="Open objective deep dive"
            title="Deep dive on this objective"
            style={{
              background: "rgba(245, 166, 35, 0.12)",
              color: "var(--accent)",
              borderRadius: "var(--r-sm)",
              padding: "2px 6px",
              fontSize: "11px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {current.question.objectiveId.split(":obj:")[1]} ›
          </Link>
          {current.source === "voice-tutor" && (
            <span
              className="font-mono"
              title="You missed this one with the voice tutor"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                color: "var(--fg-muted)",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <MicGlyph size={11} /> voice
            </span>
          )}
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
          {current.question.stem}
        </p>

        {/* Choices */}
        <div className="space-y-2">
          {current.question.choices.map((choice) => {
            let borderColor = "var(--border-strong)";
            let bgColor = "transparent";
            let textColor = "var(--fg)";

            const isLastPick = choice.key === current.lastPicked;

            if (phase === "revealed") {
              if (choice.correct) {
                borderColor = "var(--success)";
                bgColor = "rgba(95, 179, 124, 0.08)";
                textColor = "var(--success)";
              } else if (choice.key === chosen && !choice.correct) {
                borderColor = "var(--error)";
                bgColor = "rgba(229, 92, 92, 0.08)";
                textColor = "var(--error)";
              } else if (isLastPick && !choice.correct && choice.key !== chosen) {
                // Show amber outline for previous wrong pick (if different from current chosen)
                borderColor = "rgba(245, 166, 35, 0.6)";
              }
            } else {
              if (chosen === choice.key) {
                borderColor = "var(--accent)";
                bgColor = "rgba(245, 166, 35, 0.08)";
              } else if (isLastPick) {
                // Subtle amber outline for last-time pick while answering
                borderColor = "rgba(245, 166, 35, 0.4)";
              }
            }

            return (
              <button
                key={choice.key}
                disabled={phase === "revealed"}
                onClick={() => handlePick(choice.key)}
                className="w-full text-left px-4 py-3 text-sm focus-visible:outline-none"
                style={{
                  border: `1px solid ${borderColor}`,
                  borderRadius: "var(--r-sm)",
                  background: bgColor,
                  color: textColor,
                  transition: "border-color 200ms ease-out, background-color 200ms ease-out",
                  fontFamily: "var(--font-sans)",
                  cursor: phase === "revealed" ? "default" : "pointer",
                  boxShadow: "none",
                }}
                onFocus={(e) => {
                  if (phase !== "revealed") e.currentTarget.style.outline = "2px solid var(--accent)";
                  e.currentTarget.style.outlineOffset = "2px";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "none";
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

        {/* Check answer — commit the (changeable) selection. Question phase only. */}
        {phase === "question" && (
          <button
            onClick={handleSubmit}
            disabled={!chosen}
            className="w-full mt-4"
            style={{
              minHeight: "48px",
              borderRadius: "var(--r-sm)",
              border: "none",
              background: chosen ? "var(--accent)" : "var(--surface-2)",
              color: chosen ? "var(--accent-fg)" : "var(--fg-subtle)",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: "15px",
              cursor: chosen ? "pointer" : "default",
              transition: "background 150ms, color 150ms",
            }}
          >
            {chosen ? "Check answer" : "Select an answer"}
          </button>
        )}

        {/* Explanation + last-pick callout */}
        {phase === "revealed" && (
          <>
            {/* Last-pick reminder */}
            {current.lastPicked && current.lastPicked !== correctChoice?.key && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  background: "rgba(245, 166, 35, 0.08)",
                  border: "1px solid rgba(245, 166, 35, 0.3)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "12px",
                  color: "var(--fg-muted)",
                }}
              >
                Last time you picked{" "}
                <span className="font-mono font-semibold" style={{ color: "var(--accent)" }}>
                  {current.lastPicked}
                </span>{" "}
                — correct is{" "}
                <span className="font-mono font-semibold" style={{ color: "var(--success)" }}>
                  {correctChoice?.key}
                </span>
              </div>
            )}

            {/* Explanation */}
            <div
              style={{
                marginTop: "12px",
                padding: "14px 16px",
                background: "var(--surface-2)",
                borderRadius: "var(--r-sm)",
                fontSize: "13px",
                lineHeight: 1.6,
                color: "var(--fg-muted)",
              }}
            >
              <p
                style={{
                  fontWeight: 600,
                  color: chosen === correctChoice?.key ? "var(--success)" : "var(--error)",
                  marginBottom: "6px",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {chosen === correctChoice?.key ? "Correct" : "Incorrect"}
              </p>
              <p>{current.question.explanation}</p>
            </div>
            {wrongExplanations && Object.keys(wrongExplanations).length > 0 && (
              <details className="mt-4 group">
                <summary className="cursor-pointer text-xs font-mono uppercase tracking-wider text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors list-none">
                  <span className="inline-block mr-1 transition-transform group-open:rotate-90">▸</span>
                  Why each wrong answer is wrong
                </summary>
                <div className="mt-3 space-y-2 text-sm">
                  {(["A", "B", "C", "D"] as const).map((k) => {
                    if (!wrongExplanations[k]) return null;
                    const choice = current.question.choices.find((c) => c.key === k);
                    return (
                      <div key={k} className="border-l-2 border-[var(--border)] pl-3">
                        <div className="text-xs text-[var(--fg-muted)]">
                          <span className="font-mono text-[var(--accent)]">{k})</span> {choice?.text}
                        </div>
                        <div className="mt-1 text-[var(--fg)]">{wrongExplanations[k]}</div>
                      </div>
                    );
                  })}
                </div>
              </details>
            )}
            {/* Remediation chip — review items are always previously-wrong */}
            <RemediationLink question={current.question} />
          </>
        )}

        {/* Bookmark + Report row */}
        {phase === "revealed" && (
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "16px" }}>
            <BookmarkButton questionId={current.question.id} certId={current.question.certId} />
            <ReportButton questionId={current.question.id} certId={current.question.certId} />
          </div>
        )}

        {/* Next button */}
        {phase === "revealed" && (
          <button
            className="w-full h-10 mt-4 text-sm font-medium"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
              borderRadius: "var(--r-sm)",
              border: "none",
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
            }}
            onClick={handleNext}
          >
            {index + 1 >= items.length ? "See Results" : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
}
