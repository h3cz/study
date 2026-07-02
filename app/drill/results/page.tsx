"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { seedDb, db } from "@/lib/db";
import { recordDrillSession } from "@/lib/drill";
import { enqueue } from "@/lib/sync/engine";
import type { Acronym } from "@/lib/db";
import { GuestRunSavePrompt } from "@/components/GuestRunSavePrompt";

interface DrillResultsPayload {
  durationSeconds: number;
  correct: number;
  incorrect: number;
  skipped: number;
  attempts: { acronymId: string; userAnswer: string; correct: boolean; ms: number }[];
}

interface WrongEntry {
  acronymId: string;
  userAnswer: string;
  acronym: string;
  expansion: string;
}

function DrillResultsInner() {
  const [payload, setPayload] = useState<DrillResultsPayload | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [wrongEntries, setWrongEntries] = useState<WrongEntry[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const raw = sessionStorage.getItem("drillResults");
      if (!raw) return;
      const p: DrillResultsPayload = JSON.parse(raw);
      setPayload(p);

      await seedDb();

      // Build wrong entries map
      const wrongAttempts = p.attempts.filter((a) => !a.correct);
      if (wrongAttempts.length > 0) {
        const ids = wrongAttempts.map((a) => a.acronymId);
        const acronyms = await db.acronyms.where("id").anyOf(ids).toArray();
        const map = new Map<string, Acronym>(acronyms.map((a) => [a.id, a]));
        setWrongEntries(
          wrongAttempts.map((a) => ({
            acronymId: a.acronymId,
            userAnswer: a.userAnswer,
            acronym: map.get(a.acronymId)?.acronym ?? a.acronymId,
            expansion: map.get(a.acronymId)?.expansion ?? "—",
          }))
        );
      }

      // Record session (only once)
      if (!saved) {
        setSaved(true);
        const now = new Date().toISOString();
        const startedAt = new Date(Date.now() - p.durationSeconds * 1000).toISOString();
        const session = {
          startedAt,
          completedAt: now,
          durationSeconds: p.durationSeconds,
          correct: p.correct,
          incorrect: p.incorrect,
          skipped: p.skipped,
          attempts: p.attempts,
        };
        const { xpEarned: xp } = await recordDrillSession(session);
        setXpEarned(xp);

        // Enqueue sync
        await enqueue("insert_drill_session", {
          user_id: "",
          started_at: startedAt,
          completed_at: now,
          duration_seconds: p.durationSeconds,
          correct: p.correct,
          incorrect: p.incorrect,
          skipped: p.skipped,
          attempts: p.attempts,
        });
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!payload) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <p style={{ color: "var(--fg-muted)", fontSize: "14px" }}>No drill results found.</p>
        <Link
          href="/drill"
          style={{ color: "var(--accent)", fontSize: "14px", textDecoration: "none" }}
        >
          ← Start a drill
        </Link>
      </div>
    );
  }

  const total = payload.correct + payload.incorrect + payload.skipped;

  return (
    <div className="flex flex-col items-center gap-8 px-4 py-8" style={{ maxWidth: "520px", margin: "0 auto" }}>
      {/* Hero */}
      <div className="text-center space-y-2">
        <div className="flex items-baseline gap-3 justify-center">
          <span
            className="font-display"
            style={{ fontSize: "clamp(72px, 14vw, 96px)", fontWeight: 400, color: "var(--fg)", lineHeight: 1 }}
          >
            {payload.correct}
          </span>
          <span style={{ fontSize: "18px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
            correct
          </span>
        </div>
        <p style={{ fontSize: "14px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
          {payload.incorrect} wrong · {payload.skipped} skipped · {total} seen
        </p>
      </div>

      {/* XP */}
      {xpEarned > 0 && (
        <div
          style={{
            background: "rgba(245,166,35,0.10)",
            border: "1px solid var(--accent)",
            borderRadius: "var(--r-sm)",
            padding: "10px 24px",
            fontFamily: "var(--font-mono)",
            fontSize: "15px",
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: "0.04em",
          }}
        >
          XP earned: +{xpEarned}
        </div>
      )}

      <div style={{ width: "100%" }}>
        <GuestRunSavePrompt
          kind="drill"
          runId={`drill:${payload.durationSeconds}:${payload.correct}:${payload.incorrect}:${payload.skipped}:${xpEarned}`}
          nextPath="/drill/results"
          details={[
            { label: "Correct", value: `${payload.correct}/${total}`, tone: payload.incorrect === 0 ? "success" : "accent" },
            { label: "XP", value: `+${xpEarned}`, tone: "accent" },
            { label: "Wrong", value: `${payload.incorrect}`, tone: payload.incorrect > 0 ? "error" : "success" },
            { label: "Skipped", value: `${payload.skipped}`, tone: payload.skipped > 0 ? "muted" : "success" },
          ]}
        />
      </div>

      {/* Wrong list */}
      {wrongEntries.length > 0 && (
        <div style={{ width: "100%" }}>
          <h2
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-sans)",
              marginBottom: "12px",
            }}
          >
            Misses — learn these
          </h2>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              overflow: "hidden",
              maxHeight: "340px",
              overflowY: "auto",
            }}
          >
            {wrongEntries.map((entry, i) => (
              <div
                key={entry.acronymId}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px 16px",
                  borderTop: i > 0 ? "1px solid var(--border)" : "none",
                }}
              >
                <span
                  className="font-mono shrink-0"
                  style={{
                    background: "rgba(245,166,35,0.12)",
                    color: "var(--accent)",
                    borderRadius: "var(--r-sm)",
                    padding: "2px 7px",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginTop: "1px",
                  }}
                >
                  {entry.acronym}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "13px", color: "var(--fg)" }}>{entry.expansion}</p>
                  {entry.userAnswer && (
                    <p style={{ fontSize: "12px", color: "var(--fg-subtle)", marginTop: "2px", fontFamily: "var(--font-mono)" }}>
                      you said: {entry.userAnswer}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: "flex", gap: "12px", width: "100%", flexWrap: "wrap" }}>
        <Link
          href="/drill"
          style={{
            flex: 1,
            minWidth: "140px",
            height: "48px",
            background: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Drill again
        </Link>
        <Link
          href="/"
          style={{
            flex: 1,
            minWidth: "140px",
            height: "48px",
            background: "transparent",
            color: "var(--fg)",
            borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--border-strong)",
          }}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default function DrillResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)" }}>
          Loading…
        </div>
      }
    >
      <DrillResultsInner />
    </Suspense>
  );
}
