"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/db";
import type { MockExamSession, Question, PerfQuestion } from "@/lib/db";
import { getExplanationsForQuestion } from "@/lib/distractor-explanations";
import ReportButton from "@/components/ReportButton";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButton from "@/components/ShareButton";
import RemediationLink from "@/components/RemediationLink";
import { DEFAULT_CERT_ID } from "@/lib/certs";
import { GuestRunSavePrompt } from "@/components/GuestRunSavePrompt";

// Pass/fail is read from the persisted session.passed, which the exam runner
// computes against the active cert's pass line — so there is no hardcoded pass
// score here.

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type ReviewTab = "all" | "wrong" | "flagged";

interface QuestionWithDetail {
  qId: string;
  picked: string | null;
  correct: boolean;
  flagged: boolean;
  kind: "mcq" | "pbq";
  pbqAnswer?: string[]; // PBQ only: the user's right-column arrangement
  mcqData?: Question;
  pbqData?: PerfQuestion;
  expanded: boolean;
}

function ResultsInner() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("id");

  const [session, setSession] = useState<MockExamSession | null>(null);
  const [questions, setQuestions] = useState<QuestionWithDetail[]>([]);
  const [domainNames, setDomainNames] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<ReviewTab>("all");
  const [loading, setLoading] = useState(true);
  const [distractorMap, setDistractorMap] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    async function load() {
      if (!examId) return;
      const s = await db.mockExamSessions.get(examId);
      if (!s) return;
      setSession(s);

      // Load domain names
      const domains = await db.domains.toArray();
      const dMap: Record<string, string> = {};
      for (const d of domains) dMap[d.id] = d.name;
      setDomainNames(dMap);

      // Load question detail
      const mcqIds = s.questions.filter((q) => q.kind === "mcq").map((q) => q.qId);
      const pbqIds = s.questions.filter((q) => q.kind === "pbq").map((q) => q.qId);

      const [mcqs, pbqs] = await Promise.all([
        db.questions.where("id").anyOf(mcqIds).toArray(),
        db.perfQuestions.where("id").anyOf(pbqIds).toArray(),
      ]);
      const mcqMap = new Map(mcqs.map((q) => [q.id, q]));
      const pbqMap = new Map(pbqs.map((q) => [q.id, q]));

      const withDetail: QuestionWithDetail[] = s.questions.map((q) => ({
        ...q,
        mcqData: q.kind === "mcq" ? mcqMap.get(q.qId) : undefined,
        pbqData: q.kind === "pbq" ? pbqMap.get(q.qId) : undefined,
        expanded: false,
      }));
      setQuestions(withDetail);
      setLoading(false);
    }
    load();
  }, [examId]);

  function toggleExpand(qId: string) {
    setQuestions((prev) => {
      const item = prev.find((q) => q.qId === qId);
      const willExpand = item ? !item.expanded : false;
      // Load distractor explanations for wrong MCQ questions when expanding
      if (willExpand && item && !item.correct && item.kind === "mcq" && !distractorMap[qId]) {
        getExplanationsForQuestion(qId).then((expl) => {
          if (expl) setDistractorMap((m) => ({ ...m, [qId]: expl }));
        });
      }
      return prev.map((q) => (q.qId === qId ? { ...q, expanded: !q.expanded } : q));
    });
  }

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)" }}>
        Loading results…
      </div>
    );
  }

  const { predictedScore, passed, numCorrect, totalQuestions, scorePercent, durationMs, domainBreakdown } = session;
  const flaggedCount = session.questions.filter((q) => q.flagged).length;
  const wrongCount = session.questions.filter((q) => !q.correct).length;

  const filteredQuestions = questions.filter((q) => {
    if (tab === "wrong") return !q.correct;
    if (tab === "flagged") return q.flagged;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            marginBottom: "8px",
          }}
        >
          Exam Results
        </p>
      </div>

      {/* Hero score card */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border)",
          padding: "28px 24px",
        }}
      >
        <div className="flex items-end gap-4 flex-wrap mb-4">
          <div className="flex items-baseline gap-2">
            <span
              className="font-display"
              style={{ fontSize: "clamp(72px, 14vw, 112px)", fontWeight: 400, color: "var(--fg)", lineHeight: 1 }}
            >
              {predictedScore}
            </span>
            <span className="font-mono" style={{ fontSize: "clamp(24px, 4vw, 40px)", color: "var(--fg-muted)", fontWeight: 400 }}>
              / 900
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: passed ? "var(--success)" : "var(--error)",
              background: passed ? "rgba(95,179,124,0.12)" : "rgba(229,92,92,0.12)",
              border: `1px solid ${passed ? "var(--success)" : "var(--error)"}`,
              borderRadius: "var(--r-sm)",
              padding: "4px 10px",
              alignSelf: "center",
            }}
          >
            {passed ? "PASS" : "FAIL"}
          </span>
          <div style={{ marginLeft: "auto", alignSelf: "center" }}>
            <ShareButton
              score={predictedScore}
              kind="mock"
              passed={passed}
              certId={session.certId ?? DEFAULT_CERT_ID}
              streak={session.questions.length > 0 ? undefined : undefined}
            />
          </div>
        </div>

        <div style={{ height: "1px", background: "var(--border)", marginBottom: "16px" }} />

        {/* Meta row */}
        <div className="flex gap-6 flex-wrap">
          <div>
            <p style={{ fontSize: "11px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "3px" }}>Score</p>
            <p className="font-mono" style={{ fontSize: "13px", color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}>
              {numCorrect} / {totalQuestions} ({scorePercent}%)
            </p>
          </div>
          {durationMs !== undefined && (
            <div>
              <p style={{ fontSize: "11px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "3px" }}>Time used</p>
              <p className="font-mono" style={{ fontSize: "13px", color: "var(--fg)" }}>
                {formatDuration(durationMs)} of 90:00
              </p>
            </div>
          )}
          {flaggedCount > 0 && (
            <div>
              <p style={{ fontSize: "11px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "3px" }}>Flagged</p>
              <p className="font-mono" style={{ fontSize: "13px", color: "var(--accent)" }}>
                {flaggedCount} questions
              </p>
            </div>
          )}
        </div>
      </div>

      <GuestRunSavePrompt
        kind="exam"
        runId={`exam:${examId ?? session.startedAt}:${predictedScore}:${scorePercent}`}
        nextPath={examId ? `/exam/results?id=${encodeURIComponent(examId)}` : "/exam/results"}
        details={[
          { label: "Predicted", value: `${predictedScore}`, tone: passed ? "success" : "accent" },
          { label: "Score", value: `${scorePercent}%`, tone: passed ? "success" : "error" },
          { label: "Answers", value: `${numCorrect}/${totalQuestions}`, tone: passed ? "success" : "accent" },
          { label: "Review", value: `${wrongCount} misses`, tone: wrongCount > 0 ? "error" : "success" },
        ]}
      />

      {/* Domain breakdown */}
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
          Domain Breakdown
        </h2>
        <div className="space-y-4">
          {Object.entries(domainBreakdown)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([domainId, { correct, total }]) => {
              const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
              return (
                <div key={domainId}>
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span style={{ fontSize: "13px", color: "var(--fg)", fontFamily: "var(--font-sans)" }}>
                      {domainNames[domainId] ?? domainId.split(":domain:")[1]}
                    </span>
                    <span className="font-mono" style={{ fontSize: "12px", color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}>
                      {correct}/{total} · {pct}%
                    </span>
                  </div>
                  <div style={{ height: "2px", background: "var(--border-strong)", borderRadius: "1px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--accent)" : "var(--error)",
                        transition: "width 300ms ease-out",
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Question review */}
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
          Question Review
        </h2>

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {(["all", "wrong", "flagged"] as ReviewTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                height: "30px",
                padding: "0 12px",
                borderRadius: "var(--r-sm)",
                border: "1px solid",
                borderColor: tab === t ? "var(--accent)" : "var(--border-strong)",
                background: tab === t ? "rgba(245,166,35,0.1)" : "transparent",
                color: tab === t ? "var(--accent)" : "var(--fg-muted)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
              }}
            >
              {t}
              {t === "wrong" && (
                <span className="ml-1 font-mono" style={{ opacity: 0.7 }}>
                  {questions.filter((q) => !q.correct).length}
                </span>
              )}
              {t === "flagged" && (
                <span className="ml-1 font-mono" style={{ opacity: 0.7 }}>
                  {questions.filter((q) => q.flagged).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Question list */}
        <div className="space-y-2">
          {filteredQuestions.length === 0 && (
            <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontStyle: "italic", fontFamily: "var(--font-sans)" }}>
              No questions in this category.
            </p>
          )}
          {filteredQuestions.map((item, idx) => (
            <div
              key={item.qId}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--r-sm)",
                overflow: "hidden",
              }}
            >
              {/* Row */}
              <button
                onClick={() => toggleExpand(item.qId)}
                className="w-full text-left"
                style={{
                  padding: "12px 14px",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                {/* Status dot */}
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: item.correct ? "var(--success)" : "var(--error)",
                    flexShrink: 0,
                  }}
                />
                {/* Q number */}
                <span className="font-mono shrink-0" style={{ fontSize: "11px", color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {/* Stem preview */}
                <span
                  style={{
                    flex: 1,
                    fontSize: "13px",
                    color: "var(--fg)",
                    fontFamily: "var(--font-sans)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.kind === "mcq"
                    ? item.mcqData?.stem ?? item.qId
                    : item.pbqData?.prompt ?? item.qId}
                </span>
                {/* Badges */}
                <span className="flex gap-1 shrink-0">
                  {item.flagged && (
                    <span className="font-mono" style={{ fontSize: "10px", color: "var(--accent)", background: "rgba(245,166,35,0.12)", borderRadius: "var(--r-sm)", padding: "1px 5px" }}>
                      flagged
                    </span>
                  )}
                  <span className="font-mono" style={{ fontSize: "10px", color: "var(--fg-subtle)", background: "var(--surface-2)", borderRadius: "var(--r-sm)", padding: "1px 5px" }}>
                    {item.kind.toUpperCase()}
                  </span>
                </span>
                {/* Chevron */}
                <span style={{ color: "var(--fg-muted)", fontSize: "10px", transform: item.expanded ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>▼</span>
              </button>

              {/* Expanded detail */}
              {item.expanded && item.kind === "mcq" && item.mcqData && (
                <div
                  style={{
                    padding: "14px 16px",
                    background: "var(--surface-2)",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <p style={{ fontSize: "14px", color: "var(--fg)", fontFamily: "var(--font-sans)", marginBottom: "12px", lineHeight: 1.5 }}>
                    {item.mcqData.stem}
                  </p>
                  <div className="space-y-1 mb-3">
                    {item.mcqData.choices.map((c) => {
                      const isCorrect = c.correct;
                      const isPicked = c.key === item.picked;
                      return (
                        <div
                          key={c.key}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "var(--r-sm)",
                            border: `1px solid ${isCorrect ? "var(--success)" : isPicked && !isCorrect ? "var(--error)" : "var(--border)"}`,
                            background: isCorrect ? "rgba(95,179,124,0.08)" : isPicked && !isCorrect ? "rgba(229,92,92,0.08)" : "transparent",
                            fontSize: "13px",
                            color: isCorrect ? "var(--success)" : isPicked && !isCorrect ? "var(--error)" : "var(--fg-muted)",
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          <span className="font-mono font-semibold mr-2">{c.key}.</span>
                          {c.text}
                          {isCorrect && <span className="ml-2 font-mono" style={{ fontSize: "10px", opacity: 0.7 }}>✓ correct</span>}
                          {isPicked && !isCorrect && <span className="ml-2 font-mono" style={{ fontSize: "10px", opacity: 0.7 }}>✗ your answer</span>}
                        </div>
                      );
                    })}
                  </div>
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "var(--surface)",
                      borderRadius: "var(--r-sm)",
                      fontSize: "13px",
                      color: "var(--fg-muted)",
                      lineHeight: 1.6,
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {item.mcqData.explanation}
                  </div>
                  {!item.correct && distractorMap[item.qId] && Object.keys(distractorMap[item.qId]).length > 0 && (
                    <details className="mt-4 group">
                      <summary className="cursor-pointer text-xs font-mono uppercase tracking-wider text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors list-none">
                        <span className="inline-block mr-1 transition-transform group-open:rotate-90">▸</span>
                        Why each wrong answer is wrong
                      </summary>
                      <div className="mt-3 space-y-2 text-sm">
                        {(["A", "B", "C", "D"] as const).map((k) => {
                          const expl = distractorMap[item.qId][k];
                          if (!expl) return null;
                          const choice = item.mcqData!.choices.find((c) => c.key === k);
                          return (
                            <div key={k} className="border-l-2 border-[var(--border)] pl-3">
                              <div className="text-xs text-[var(--fg-muted)]">
                                <span className="font-mono text-[var(--accent)]">{k})</span> {choice?.text}
                              </div>
                              <div className="mt-1 text-[var(--fg)]">{expl}</div>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  )}
                  {!item.correct && item.mcqData && (
                    <RemediationLink question={item.mcqData} />
                  )}
                  <div className="mt-4" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <BookmarkButton questionId={item.qId} certId={item.mcqData.certId} />
                    <ReportButton questionId={item.qId} certId={item.mcqData.certId} />
                  </div>
                </div>
              )}

              {item.expanded && item.kind === "pbq" && item.pbqData && (
                <div
                  style={{
                    padding: "14px 16px",
                    background: "var(--surface-2)",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <p style={{ fontSize: "14px", color: "var(--fg)", fontFamily: "var(--font-sans)", marginBottom: "8px" }}>
                    {item.pbqData.prompt}
                  </p>
                  <div className="space-y-1 mb-3">
                    {item.pbqData.pairs.map((pair, pi) => {
                      // pbqAnswer holds the user's right-column arrangement. When
                      // present, mark each pair ✓/✗ and show the wrong pick struck
                      // through next to the correct value. Legacy sessions (no
                      // pbqAnswer) just show the answer key.
                      const userVal = item.pbqAnswer?.[pi];
                      const answered = item.pbqAnswer != null;
                      const pairCorrect = userVal === pair.right;
                      return (
                        <div key={pi} className="flex items-center gap-2 flex-wrap" style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
                          {answered && (
                            <span style={{ fontWeight: 700, color: pairCorrect ? "var(--success)" : "var(--error)", flexShrink: 0, fontFamily: "var(--font-sans)" }}>
                              {pairCorrect ? "✓" : "✗"}
                            </span>
                          )}
                          <span className="font-mono" style={{ color: "var(--fg)" }}>{pair.left}</span>
                          <span style={{ color: "var(--fg-subtle)" }}>→</span>
                          <span className="font-mono" style={{ color: "var(--success)" }}>{pair.right}</span>
                          {answered && !pairCorrect && userVal != null && (
                            <span className="font-mono" style={{ color: "var(--error)", fontSize: "12px", textDecoration: "line-through" }}>
                              ({userVal})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "var(--surface)",
                      borderRadius: "var(--r-sm)",
                      fontSize: "13px",
                      color: "var(--fg-muted)",
                      lineHeight: 1.6,
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {item.pbqData.explanation}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/"
          className="flex-1 h-11 flex items-center justify-center text-sm font-medium"
          style={{
            background: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: "var(--r-sm)",
            textDecoration: "none",
            fontFamily: "var(--font-sans)",
            minWidth: "140px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          Back to dashboard
        </Link>
        <Link
          href="/exam"
          className="flex-1 h-11 flex items-center justify-center text-sm font-medium"
          style={{
            background: "transparent",
            color: "var(--fg)",
            borderRadius: "var(--r-sm)",
            border: "1px solid var(--border-strong)",
            textDecoration: "none",
            fontFamily: "var(--font-sans)",
            minWidth: "140px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
        >
          Take another exam →
        </Link>
      </div>
    </div>
  );
}

export default function ExamResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)" }}>
          Loading results…
        </div>
      }
    >
      <ResultsInner />
    </Suspense>
  );
}
