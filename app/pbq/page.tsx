"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { seedDb, db } from "@/lib/db";
import { getUserState, xpToLevel, XP_PER_CORRECT } from "@/lib/gamification";
import { enqueue } from "@/lib/sync/engine";
import DragMatch from "@/components/pbq/DragMatch";
import type { PerfQuestion } from "@/lib/db";
import { DEFAULT_CERT_ID, getActiveCertId } from "@/lib/certs";
import { GuestRunSavePrompt } from "@/components/GuestRunSavePrompt";

type Phase = "loading" | "question" | "done";

export default function PbqPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [question, setQuestion] = useState<PerfQuestion | null>(null);
  const [result, setResult] = useState<{ correct: number; total: number; xpEarned: number } | null>(null);
  // Active cert resolved from user state; falls back to the default until the
  // first loadQuestion() resolves so the initial render is safe.
  const [certId, setCertId] = useState<string>(DEFAULT_CERT_ID);

  async function loadQuestion() {
    setPhase("loading");
    await seedDb();
    // Resolve the active cert so the PBQ pool targets the selected cert.
    const state = await db.userState.get(1);
    const activeCertId = getActiveCertId(state);
    setCertId(activeCertId);
    const all = await db.perfQuestions.where("certId").equals(activeCertId).toArray();
    if (all.length === 0) {
      setQuestion(null);
      setPhase("done");
      return;
    }
    const pick = all[Math.floor(Math.random() * all.length)];
    setQuestion(pick);
    setResult(null);
    setPhase("question");
  }

  useEffect(() => {
    const timer = setTimeout(() => void loadQuestion(), 0);
    return () => clearTimeout(timer);
  }, []);

  async function handleSubmit(correctCount: number, totalPairs: number) {
    if (!question) return;

    // XP: treat as a 10-Q quiz at the same correct ratio
    const equivalentCorrect = Math.round((correctCount / totalPairs) * 10);
    const xpEarned = equivalentCorrect * XP_PER_CORRECT;
    const score = Math.round((correctCount / totalPairs) * 100);
    const now = new Date().toISOString();

    // Update user state + record session
    const state = await getUserState();
    const newXp = state.xp + xpEarned;
    const newLevel = xpToLevel(newXp);
    const today = now.slice(0, 10);
    const newStreak =
      state.lastStudyDate === today
        ? state.streak
        : state.lastStudyDate === yesterday()
        ? state.streak + 1
        : 1;
    const newTotalDays =
      state.lastStudyDate !== today ? state.totalStudyDays + 1 : state.totalStudyDays;

    await db.transaction("rw", [db.userState, db.quizSessions], async () => {
      await db.userState.put({
        ...state,
        xp: newXp,
        level: newLevel,
        streak: newStreak,
        lastStudyDate: today,
        totalStudyDays: newTotalDays,
      });
      await db.quizSessions.add({
        certId: certId,
        startedAt: now,
        completedAt: now,
        questionIds: [question.id],
        answers: {},
        score,
        xpEarned,
        kind: "pbq",
      });
    });

    enqueue("insert_quiz_session", {
      user_id: "",
      cert_id: certId,
      started_at: now,
      completed_at: now,
      score_pct: score,
      num_questions: totalPairs,
      num_correct: correctCount,
      questions: [{ questionId: question.id, objectiveId: question.objectiveId, picked: null, correct: correctCount === totalPairs }],
    }).catch(() => {});

    getUserState().then((s) => {
      enqueue("upsert_user_state", {
        user_id: "",
        xp: s.xp,
        level: s.level,
        streak: s.streak,
        last_study_date: s.lastStudyDate ?? today,
        total_study_days: s.totalStudyDays,
        predicted_score: s.predictedScore ?? null,
        daily_goal_questions: s.dailyGoalQuestions ?? null,
        updated_at: now,
      }).catch(() => {});
      enqueue("upsert_cert_score", {
        cert_id: certId,
        predicted_score: s.predictedScore ?? null,
        xp: s.xp,
      }).catch(() => {});
    }).catch(() => {});

    setResult({ correct: correctCount, total: totalPairs, xpEarned });
    setPhase("done");
  }

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)" }}>
        Loading PBQ…
      </div>
    );
  }

  if (phase === "done" && result) {
    const pct = Math.round((result.correct / result.total) * 100);
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
            PBQ Complete
          </h2>
          <div className="text-center py-4">
            <div className="flex items-baseline justify-center gap-2">
              <span className="font-display" style={{ fontSize: "80px", fontWeight: 400, color: "var(--fg)", lineHeight: 1 }}>
                {result.correct}
              </span>
              <span className="font-mono" style={{ fontSize: "32px", color: "var(--fg-muted)" }}>
                / {result.total}
              </span>
            </div>
            <div className="font-mono mt-2" style={{ fontSize: "13px", color: "var(--fg-muted)" }}>
              {pct}% correct
            </div>
          </div>
          <div style={{ height: "2px", background: "var(--border-strong)", borderRadius: "1px", overflow: "hidden", margin: "16px 0" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", transition: "width 300ms ease-out" }} />
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            {result.xpEarned > 0 && (
              <span style={{ background: "var(--accent)", color: "var(--accent-fg)", borderRadius: "var(--r-sm)", padding: "4px 10px", fontSize: "12px", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                +{result.xpEarned} XP
              </span>
            )}
            {result.xpEarned === 0 && (
              <span style={{ background: "var(--surface-2)", color: "var(--fg-subtle)", borderRadius: "var(--r-sm)", padding: "4px 10px", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                +0 XP
              </span>
            )}
          </div>
          <div style={{ marginTop: "22px" }}>
            <GuestRunSavePrompt
              kind="pbq"
              runId={`pbq:${result.total}:${result.correct}:${result.xpEarned}`}
              nextPath="/pbq"
              details={[
                { label: "Score", value: `${result.correct}/${result.total}`, tone: pct >= 75 ? "success" : pct >= 50 ? "accent" : "error" },
                { label: "Accuracy", value: `${pct}%`, tone: pct >= 75 ? "success" : pct >= 50 ? "accent" : "error" },
                { label: "XP", value: `+${result.xpEarned}`, tone: "accent" },
              ]}
            />
          </div>
          <div className="flex gap-3 pt-6">
            <Link
              href="/"
              className="flex-1 h-10 flex items-center justify-center text-sm font-medium"
              style={{ background: "var(--accent)", color: "var(--accent-fg)", borderRadius: "var(--r-sm)", textDecoration: "none" }}
            >
              Back to Dashboard
            </Link>
            <button
              className="flex-1 h-10 text-sm font-medium"
              style={{ background: "transparent", color: "var(--fg)", borderRadius: "var(--r-sm)", border: "1px solid var(--border-strong)", cursor: "pointer" }}
              onClick={loadQuestion}
            >
              Next PBQ →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
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
          <p
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "var(--fg)",
              marginBottom: "8px",
              fontFamily: "var(--font-sans)",
            }}
          >
            No performance-based questions loaded yet.
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "var(--fg-muted)",
              marginBottom: "24px",
              lineHeight: "24px",
            }}
          >
            PBQs simulate the drag-and-match tasks on the real exam · they&apos;ll appear here once the content pipeline runs.
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
            Take a quiz instead →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
          }}
        >
          Performance-Based Question
        </h1>
        <span
          className="font-mono"
          style={{
            background: "rgba(245,166,35,0.12)",
            color: "var(--accent)",
            borderRadius: "var(--r-sm)",
            padding: "2px 6px",
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          {question.objectiveId.split(":obj:")[1]}
        </span>
      </div>

      {/* Card */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border)",
          padding: "24px",
        }}
      >
        <DragMatch question={question} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
