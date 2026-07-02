"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db, seedDb } from "@/lib/db";
import type { Domain, Objective, Question, PerfQuestion, Acronym } from "@/lib/db";
import { getUserState } from "@/lib/gamification";
import { getActiveCertId } from "@/lib/certs";
import { objectiveMastery } from "@/lib/mastery";
import { applyMesserMapFallback } from "@/lib/remediation";
import { getWrongAnswers } from "@/lib/wrong-answers";
import { getBookmarks } from "@/lib/bookmarks";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ObjectiveVideo {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  timestamp?: number;
}

interface DeepDiveData {
  objective: Objective;
  domain: Domain | undefined;
  mastery: number | null;
  questions: Question[];
  pbqs: PerfQuestion[];
  video: ObjectiveVideo | null;
  missedIds: Set<string>;
  bookmarkedIds: Set<string>;
  acronyms: Acronym[];
}

// ─── Shared style helpers (match app conventions) ────────────────────────────

const codePillStyle: React.CSSProperties = {
  background: "rgba(245, 166, 35, 0.12)",
  color: "var(--accent)",
  borderRadius: "var(--r-sm)",
  padding: "2px 8px",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.02em",
  fontFamily: "var(--font-mono)",
  whiteSpace: "nowrap",
};

function MasteryBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      role="presentation"
      style={{
        height: "8px",
        width: "100%",
        background: "var(--border)",
        borderRadius: "var(--r-sm)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${pct}%`,
          background: "var(--accent)",
          borderRadius: "var(--r-sm)",
          transition: "width 240ms ease",
        }}
      />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ObjectiveDeepDivePage() {
  const { code } = useParams<{ code: string }>();
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<DeepDiveData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await seedDb();
      const state = await getUserState();
      const certId = getActiveCertId(state ?? undefined);

      const objectives = await db.objectives
        .where("certId")
        .equals(certId)
        .toArray();
      const objective = objectives.find((o) => o.code === code);

      if (!objective) {
        if (!cancelled) {
          setData(null);
          setReady(true);
        }
        return;
      }

      const domain = await db.domains.get(objective.domainId);

      const [mastery, questions, pbqs, wrongs, bookmarks, allAcronyms] =
        await Promise.all([
          objectiveMastery(objective.id),
          db.questions.where("objectiveId").equals(objective.id).toArray(),
          db.perfQuestions.where("objectiveId").equals(objective.id).toArray(),
          getWrongAnswers({ certId, sinceDays: 60 }),
          getBookmarks(),
          db.acronyms.where("certId").equals(certId).toArray(),
        ]);

      // Resolve a video for this objective. Prefer a videoSource carried on one
      // of the objective's own questions; otherwise fall back to the Professor
      // Messer objective→video map (covers certs whose questions have no
      // videoSource). getObjectiveVideoIndex in lib/remediation is private, so
      // we build the same lookup inline using the exported fallback helper.
      let video: ObjectiveVideo | null = null;
      const withSource = questions.find((q) => q.videoSource);
      if (withSource?.videoSource) {
        video = {
          videoId: withSource.videoSource.videoId,
          videoTitle: withSource.videoSource.videoTitle,
          videoUrl: withSource.videoSource.videoUrl,
          timestamp: withSource.videoSource.timestamp,
        };
      } else {
        const fallbackIndex = new Map<
          string,
          { videoId: string; videoTitle: string; videoUrl: string; timestamp?: number }
        >();
        applyMesserMapFallback(certId, fallbackIndex);
        const fb = fallbackIndex.get(objective.id);
        if (fb) {
          video = {
            videoId: fb.videoId,
            videoTitle: fb.videoTitle,
            videoUrl: fb.videoUrl,
            timestamp: fb.timestamp,
          };
        }
      }

      const objectiveQIds = new Set(questions.map((q) => q.id));
      const missedIds = new Set(
        wrongs
          .map((w) => w.questionId)
          .filter((qid) => objectiveQIds.has(qid))
      );
      const bookmarkedIds = new Set(
        bookmarks
          .map((b) => b.questionId)
          .filter((qid) => objectiveQIds.has(qid))
      );

      // Acronyms for this domain. domainHint is optional content metadata; if no
      // acronym carries a matching hint, the section simply stays hidden.
      const acronyms = domain
        ? allAcronyms
            .filter((a) => a.domainHint === domain.number)
            .sort((a, b) => a.acronym.localeCompare(b.acronym))
        : [];

      if (!cancelled) {
        setData({
          objective,
          domain,
          mastery,
          questions,
          pbqs,
          video,
          missedIds,
          bookmarkedIds,
          acronyms,
        });
        setReady(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (!ready) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        style={{ color: "var(--fg-muted)" }}
      >
        Loading…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4" style={{ maxWidth: "44rem", margin: "0 auto" }}>
        <Link
          href="/library?tab=objectives"
          style={{
            fontSize: "13px",
            color: "var(--fg-muted)",
            textDecoration: "none",
            fontFamily: "var(--font-sans)",
          }}
        >
          ← Library
        </Link>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "15px",
              color: "var(--fg)",
              fontWeight: 600,
              marginBottom: "8px",
              fontFamily: "var(--font-sans)",
            }}
          >
            Objective not found
          </p>
          <p style={{ fontSize: "13px", color: "var(--fg-muted)", lineHeight: 1.6 }}>
            No objective with code{" "}
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg)" }}>
              {code}
            </span>{" "}
            exists for your active certification.
          </p>
        </div>
      </div>
    );
  }

  const {
    objective,
    domain,
    mastery,
    questions,
    pbqs,
    video,
    missedIds,
    bookmarkedIds,
    acronyms,
  } = data;

  // Order questions: missed first, then bookmarked, then the rest. Cap the tail
  // when there are many so the page stays scannable.
  const QUESTION_CAP = 12;
  const priority = (q: Question): number => {
    if (missedIds.has(q.id)) return 0;
    if (bookmarkedIds.has(q.id)) return 1;
    return 2;
  };
  const ordered = [...questions].sort((a, b) => priority(a) - priority(b));
  const shown =
    ordered.length > QUESTION_CAP ? ordered.slice(0, QUESTION_CAP) : ordered;
  const remaining = ordered.length - shown.length;

  const ACRONYM_CAP = 20;
  const shownAcronyms = acronyms.slice(0, ACRONYM_CAP);
  const remainingAcronyms = acronyms.length - shownAcronyms.length;

  return (
    <div className="space-y-4" style={{ maxWidth: "44rem", margin: "0 auto" }}>
      {/* Header card */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          padding: "20px",
        }}
      >
        <Link
          href="/library?tab=objectives"
          style={{
            fontSize: "13px",
            color: "var(--fg-muted)",
            textDecoration: "none",
            fontFamily: "var(--font-sans)",
            display: "inline-block",
            marginBottom: "14px",
          }}
        >
          ← Library
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "8px",
          }}
        >
          <span style={codePillStyle}>{objective.code}</span>
          {domain && (
            <span
              style={{
                fontSize: "12px",
                color: "var(--fg-muted)",
                fontFamily: "var(--font-sans)",
                overflowWrap: "anywhere",
              }}
            >
              Domain {domain.number} — {domain.name}
            </span>
          )}
        </div>

        <h1
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "var(--fg)",
            lineHeight: 1.35,
            fontFamily: "var(--font-display, var(--font-sans))",
            overflowWrap: "anywhere",
            marginBottom: "16px",
          }}
        >
          {objective.name}
        </h1>

        {/* Mastery */}
        <div style={{ marginBottom: "18px" }}>
          {mastery === null ? (
            <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
              Not attempted yet
            </p>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--fg-subtle)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Mastery
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--fg)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {Math.round(mastery * 100)}% mastery
                </span>
              </div>
              <MasteryBar value={mastery} />
            </>
          )}
        </div>

        {/* Primary CTA */}
        <Link
          href={`/quiz?objective=${encodeURIComponent(objective.code)}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--accent)",
            color: "var(--accent-fg)",
            fontSize: "14px",
            fontWeight: 700,
            fontFamily: "var(--font-sans)",
            textDecoration: "none",
            borderRadius: "var(--r-sm)",
            padding: "11px 20px",
            minHeight: "44px",
          }}
        >
          Drill this objective →
        </Link>
      </div>

      {/* Watch */}
      {video && (
        <section
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "16px 20px",
          }}
        >
          <h2
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-sans)",
              marginBottom: "10px",
            }}
          >
            Watch
          </h2>
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch on Professor Messer: ${video.videoTitle}`}
            style={{
              display: "block",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--r-sm)",
              padding: "12px 14px",
              textDecoration: "none",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--fg)",
                fontFamily: "var(--font-sans)",
                lineHeight: 1.4,
                overflowWrap: "anywhere",
              }}
            >
              {video.videoTitle}
            </p>
            <p
              style={{
                marginTop: "6px",
                fontSize: "11px",
                fontFamily: "var(--font-mono)",
                color: "var(--accent)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Watch on YouTube ↗
              {typeof video.timestamp === "number" && video.timestamp > 0
                ? ` · from ${Math.floor(video.timestamp / 60)}:${String(
                    video.timestamp % 60
                  ).padStart(2, "0")}`
                : ""}
            </p>
          </a>
        </section>
      )}

      {/* Questions */}
      <section
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "12px",
          }}
        >
          <h2
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Questions
          </h2>
          <span
            style={{
              fontSize: "11px",
              color: "var(--fg-subtle)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {questions.length}
          </span>
        </div>

        {questions.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
            No questions yet for this objective.
          </p>
        ) : (
          <div className="space-y-2">
            {shown.map((q) => {
              const missed = missedIds.has(q.id);
              const bookmarked = bookmarkedIds.has(q.id);
              return (
                <Link
                  key={q.id}
                  href={`/quiz?qid=${q.id}`}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-sm)",
                    padding: "10px 12px",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ display: "flex", gap: "4px", flexShrink: 0, marginTop: "1px" }}>
                    {missed && (
                      <span
                        title="Missed recently"
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "var(--error)",
                          fontFamily: "var(--font-mono)",
                          border: "1px solid var(--error)",
                          borderRadius: "3px",
                          padding: "0 4px",
                          lineHeight: "16px",
                        }}
                      >
                        <span aria-hidden="true">✗</span> missed
                      </span>
                    )}
                    {bookmarked && (
                      <span
                        title="Bookmarked"
                        aria-label="Bookmarked"
                        style={{
                          fontSize: "13px",
                          color: "var(--accent)",
                          lineHeight: "16px",
                        }}
                      >
                        ★
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--fg)",
                      fontFamily: "var(--font-sans)",
                      lineHeight: 1.5,
                      overflowWrap: "anywhere",
                      minWidth: 0,
                    }}
                  >
                    {q.stem.length > 140 ? q.stem.slice(0, 140) + "…" : q.stem}
                  </span>
                </Link>
              );
            })}
            {remaining > 0 && (
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--fg-subtle)",
                  fontFamily: "var(--font-mono)",
                  paddingTop: "4px",
                }}
              >
                +{remaining} more
              </p>
            )}
          </div>
        )}
      </section>

      {/* Performance-based questions */}
      {pbqs.length > 0 && (
        <section
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "16px 20px",
          }}
        >
          <h2
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-sans)",
              marginBottom: "10px",
            }}
          >
            Performance-based questions
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--fg)",
              fontFamily: "var(--font-sans)",
              lineHeight: 1.5,
              marginBottom: "10px",
            }}
          >
            {pbqs.length} performance-based question
            {pbqs.length === 1 ? "" : "s"} cover this objective.
          </p>
          <Link
            href="/pbq"
            style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--accent)",
              textDecoration: "none",
              border: "1px solid var(--accent)",
              borderRadius: "var(--r-sm)",
              padding: "8px 14px",
              minHeight: "40px",
              fontFamily: "var(--font-sans)",
            }}
          >
            Open the PBQ trainer →
          </Link>
        </section>
      )}

      {/* Acronyms */}
      {acronyms.length > 0 && (
        <section
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "12px",
            }}
          >
            <h2
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Acronyms
            </h2>
            <span
              style={{
                fontSize: "11px",
                color: "var(--fg-subtle)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {acronyms.length}
            </span>
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }} className="space-y-1">
            {shownAcronyms.map((a) => (
              <li
                key={a.id}
                style={{
                  fontSize: "13px",
                  color: "var(--fg)",
                  fontFamily: "var(--font-sans)",
                  lineHeight: 1.5,
                  overflowWrap: "anywhere",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    color: "var(--accent)",
                  }}
                >
                  {a.acronym}
                </span>{" "}
                — {a.expansion}
              </li>
            ))}
          </ul>
          {remainingAcronyms > 0 && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--fg-subtle)",
                fontFamily: "var(--font-mono)",
                paddingTop: "8px",
              }}
            >
              +{remainingAcronyms} more
            </p>
          )}
        </section>
      )}
    </div>
  );
}
