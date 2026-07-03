"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { db, seedDb, type Question } from "@/lib/db";
import { getCert } from "@/lib/certs";
import { flush, pullLatest, enqueue } from "@/lib/sync/engine";
import { getUserState, creditDuelWin } from "@/lib/gamification";
import {
  fetchMatch,
  submitAnswer,
  advance,
  readyNext,
  subscribeMatch,
  fetchAnswers,
  requestRematch,
} from "@/lib/multiplayer/client";
import { outcomeFor, duelXp, type DuelOutcome } from "@/lib/multiplayer/scoring";
import type { DuelMatch, DuelAnswer } from "@/lib/multiplayer/types";
import type { Me } from "@/lib/multiplayer/use-me";

type Side = "host" | "guest";

export function DuelArena({ me, matchId }: { me: Me; matchId: string }) {
  const [match, setMatch] = useState<DuelMatch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [oppAnswered, setOppAnswered] = useState(false);
  const [readySent, setReadySent] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  // Post-duel recap + rematch state.
  const [recapAnswers, setRecapAnswers] = useState<DuelAnswer[] | null>(null);
  const [recapQuestions, setRecapQuestions] = useState<Record<string, Question>>({});
  const [rematchMatchId, setRematchMatchId] = useState<string | null>(null);
  const [rematchBusy, setRematchBusy] = useState(false);
  const [rematchError, setRematchError] = useState<string | null>(null);

  const advancedForRound = useRef<number>(-1);
  const loadedRound = useRef<number>(-1);
  const reconciled = useRef(false);
  const recapLoaded = useRef(false);

  const mySide: Side = match && match.hostId === me.userId ? "host" : "guest";
  const status = match?.status;

  // Initial load + realtime subscription.
  useEffect(() => {
    let cancelled = false;
    fetchMatch(matchId)
      .then((m) => {
        if (!cancelled) setMatch(m);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? "match_failed");
      });

    const unsub = subscribeMatch(matchId, {
      onMatch: (m) => setMatch(m),
      onAnswer: (a) => {
        // Opponent's answer for the current round → flip the "answered" pip.
        if (a.userId !== me.userId) setOppAnswered(true);
      },
      onRematch: (m) => setRematchMatchId(m.id),
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [matchId, me.userId]);

  // Clock tick for the countdown.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(t);
  }, []);

  // Resilience backstop. Realtime can silently drop, and an opponent who simply
  // closes their tab never emits an event — so we poll the authoritative match
  // state on a slow interval while the duel is live. Combined with the
  // deadline-triggered advance, this guarantees the UI never stays stuck.
  useEffect(() => {
    if (status !== "active" && status !== "waiting") return;
    const t = setInterval(() => {
      fetchMatch(matchId)
        .then(setMatch)
        .catch(() => {});
    }, 3000);
    return () => clearInterval(t);
  }, [status, matchId]);

  // Load the current round's question from the local bundle when the round changes.
  useEffect(() => {
    if (!match || match.status !== "active") return;
    if (loadedRound.current === match.currentRound) return;
    const round = match.currentRound;
    loadedRound.current = round;
    setPicked(null);
    setOppAnswered(false);
    setReadySent(false);
    setQuestion(null);
    const qId = match.questionIds[round];
    if (!qId) return;
    (async () => {
      await seedDb().catch(() => {});
      const q = await db.questions.get(qId);
      // Ignore a stale load if the round advanced while we were fetching.
      if (loadedRound.current === round) setQuestion(q ?? null);
    })();
  }, [match]);

  const deadlineMs = match?.roundStartedAt
    ? new Date(match.roundStartedAt).getTime() + match.roundLimitMs
    : null;
  const remainingMs = deadlineMs ? Math.max(0, deadlineMs - now) : match?.roundLimitMs ?? 0;

  // When my local timer hits the deadline, ask the server to advance (idempotent).
  useEffect(() => {
    if (!match || match.status !== "active" || !deadlineMs) return;
    if (now >= deadlineMs && advancedForRound.current !== match.currentRound) {
      advancedForRound.current = match.currentRound;
      advance(matchId)
        .then((m) => setMatch(m))
        .catch(() => {});
    }
  }, [now, deadlineMs, match, matchId]);

  const pick = useCallback(
    async (key: string) => {
      if (!match || picked || match.status !== "active") return;
      setPicked(key);
      try {
        const m = await submitAnswer(matchId, match.currentRound, key);
        setMatch(m);
      } catch {
        // Server is the source of truth; a realtime update will reconcile.
      }
    },
    [match, picked, matchId]
  );

  const nextRound = useCallback(async () => {
    if (!match || match.status !== "active" || picked == null || readySent) return;
    setReadySent(true);
    try {
      const m = await readyNext(matchId, match.currentRound);
      setMatch(m);
    } catch {
      setReadySent(false);
    }
  }, [match, matchId, picked, readySent]);

  // Results reconciliation — runs exactly once when the match completes.
  useEffect(() => {
    if (!match || match.status !== "done" || reconciled.current) return;
    reconciled.current = true;
    (async () => {
      // Order matters (see docs/multiplayer-spec.md §1.1): push local study XP
      // first so the server's increment lands on a current base, then pull the
      // server-awarded duel XP down, then credit the win streak locally.
      await flush().catch(() => {});
      await pullLatest(me.userId).catch(() => {});
      const iWon = match.winnerId === me.userId;
      if (iWon) await creditDuelWin().catch(() => {});
      try {
        const state = await getUserState();
        const today = new Date().toISOString().slice(0, 10);
        await enqueue("upsert_user_state", {
          user_id: "",
          xp: state.xp,
          level: state.level,
          streak: state.streak,
          last_study_date: state.lastStudyDate ?? today,
          total_study_days: state.totalStudyDays,
          predicted_score: state.predictedScore ?? null,
          daily_goal_questions: state.dailyGoalQuestions ?? null,
          updated_at: new Date().toISOString(),
        });
        // Reconcile per-cert xp against the PLAYER'S OWN active cert, not the
        // match cert — in a cross-cert quick-match the match runs on the
        // opponent's cert, and writing this player's global xp onto that foreign
        // cert would pollute a leaderboard they don't study. (Global xp already
        // carries the duel award; cert xp mirrors global xp per app convention.)
        await enqueue("upsert_cert_score", {
          cert_id: me.certId,
          predicted_score: state.predictedScore ?? null,
          xp: state.xp,
        });
      } catch {
        // best-effort; XP is already authoritative server-side
      }
    })();
  }, [match, me.userId, me.certId]);

  // Load the round-by-round recap once the match is done. Runs exactly once
  // (guarded by a ref): fetch every recorded answer plus the question bodies.
  useEffect(() => {
    if (!match || match.status !== "done" || recapLoaded.current) return;
    recapLoaded.current = true;
    const qIds = match.questionIds;
    (async () => {
      const ans = await fetchAnswers(matchId).catch(() => [] as DuelAnswer[]);
      await seedDb().catch(() => {});
      const entries = await Promise.all(
        qIds.map(async (qId) => [qId, await db.questions.get(qId)] as const)
      );
      const map: Record<string, Question> = {};
      for (const [qId, q] of entries) if (q) map[qId] = q;
      setRecapQuestions(map);
      setRecapAnswers(ans);
    })();
  }, [match, matchId]);

  const startRematch = useCallback(async () => {
    setRematchBusy(true);
    setRematchError(null);
    try {
      const m = await requestRematch(matchId);
      window.location.assign(`/play/duel?match=${m.id}`);
    } catch {
      setRematchError("Couldn't start a rematch. Try again.");
      setRematchBusy(false);
    }
  }, [matchId]);

  if (error) {
    return (
      <Shell>
        <p style={{ color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
          {error === "not_participant"
            ? "This duel isn't yours to watch."
            : error === "match_not_found"
            ? "This duel no longer exists."
            : "Couldn't load this duel."}
        </p>
        <BackLink />
      </Shell>
    );
  }

  if (!match) {
    return (
      <Shell>
        <p style={{ color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>Loading duel…</p>
      </Shell>
    );
  }

  // ── Waiting (invite host waiting for an opponent) ──
  if (match.status === "waiting") {
    return <WaitingRoom match={match} />;
  }

  const myScore = mySide === "host" ? match.hostScore : match.guestScore;
  const oppScore = mySide === "host" ? match.guestScore : match.hostScore;
  const myCorrect = mySide === "host" ? match.hostCorrect : match.guestCorrect;
  const oppCorrect = mySide === "host" ? match.guestCorrect : match.hostCorrect;

  // ── Done (results) ──
  if (match.status === "done") {
    const outcome: DuelOutcome = outcomeFor(myScore, oppScore, myCorrect, oppCorrect);
    const xp = duelXp(myCorrect, outcome === "win");
    return (
      <Shell>
        <Results outcome={outcome} myScore={myScore} oppScore={oppScore} myCorrect={myCorrect} numRounds={match.numRounds} xp={xp} />
        <RematchControls
          busy={rematchBusy}
          error={rematchError}
          rivalRematchId={rematchMatchId}
          onRematch={startRematch}
        />
        <Recap
          numRounds={match.numRounds}
          questionIds={match.questionIds}
          answers={recapAnswers}
          questions={recapQuestions}
          myUserId={me.userId}
        />
      </Shell>
    );
  }

  // ── Active round ──
  const correctKey = question?.choices.find((c) => c.correct)?.key ?? null;
  const pickedChoice = picked ? question?.choices.find((c) => c.key === picked) ?? null : null;
  const pickedCorrect = picked != null && picked === correctKey;
  const secs = Math.ceil(remainingMs / 1000);
  const certName = getCert(match.certId).name;
  const myReady = mySide === "host"
    ? match.hostReadyRound >= match.currentRound
    : match.guestReadyRound >= match.currentRound;
  const readyForNext = readySent || myReady;
  const oppReady = mySide === "host"
    ? match.guestReadyRound >= match.currentRound
    : match.hostReadyRound >= match.currentRound;

  return (
    <Shell>
      {rulesOpen && (
        <RulesDialog
          certName={certName}
          numRounds={match.numRounds}
          roundLimitMs={match.roundLimitMs}
          onClose={() => setRulesOpen(false)}
        />
      )}

      {/* Scoreboard */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <ScorePill label="You" score={myScore} accent answered={picked != null} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-muted)" }}>
            Round {match.currentRound + 1}/{match.numRounds}
          </div>
          <div
            aria-hidden
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 40,
              lineHeight: 1,
              color: secs <= 5 ? "var(--error)" : "var(--fg)",
              fontVariantNumeric: "tabular-nums",
              marginTop: 2,
            }}
          >
            {secs}
          </div>
        </div>
        <ScorePill label="Rival" score={oppScore} answered={oppAnswered} alignRight />
      </div>

      {/* Question */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--fg-subtle)",
          marginBottom: 8,
        }}
      >
        {certName} duel
      </div>
      <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 19, lineHeight: 1.35, color: "var(--fg)", margin: "0 0 18px" }}>
        {question ? question.stem : "…"}
      </h2>

      <div style={{ display: "grid", gap: 10 }}>
        {question?.choices.map((c) => {
          const isPicked = picked === c.key;
          const revealed = picked != null;
          const isCorrect = revealed && correctKey === c.key;
          const isWrongPick = revealed && isPicked && correctKey !== c.key;
          let border = "var(--border-strong)";
          let bg = "transparent";
          if (isCorrect) {
            border = "var(--success)";
            bg = "color-mix(in srgb, var(--success) 12%, transparent)";
          } else if (isWrongPick) {
            border = "var(--error)";
            bg = "color-mix(in srgb, var(--error) 12%, transparent)";
          } else if (isPicked) {
            border = "var(--accent)";
          }
          return (
            <button
              key={c.key}
              onClick={() => pick(c.key)}
              disabled={picked != null}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                textAlign: "left",
                padding: "14px 16px",
                border: `1px solid ${border}`,
                background: bg,
                borderRadius: "var(--r-sm)",
                color: "var(--fg)",
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                cursor: picked ? "default" : "pointer",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--fg-muted)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-sm)",
                  padding: "2px 6px",
                  flexShrink: 0,
                }}
              >
                {c.key}
              </span>
              <span style={{ overflowWrap: "anywhere", minWidth: 0 }}>{c.text}</span>
              {/* Symbol so correctness isn't conveyed by color alone (WCAG 1.4.1). */}
              {isCorrect && (
                <span aria-label="correct" style={{ marginLeft: "auto", color: "var(--success)", flexShrink: 0 }}>✓</span>
              )}
              {isWrongPick && (
                <span aria-label="your incorrect pick" style={{ marginLeft: "auto", color: "var(--error)", flexShrink: 0 }}>✗</span>
              )}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" style={{ marginTop: 14, minHeight: 18, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg-muted)" }}>
        {picked
          ? oppAnswered
            ? readyForNext
              ? oppReady
                ? "Both ready. Opening the next round…"
                : "Ready. Waiting for your rival to click Next."
              : "Both answered. Review it, then move on when you're ready."
            : "Locked in. Waiting on your rival."
          : ""}
      </p>

      {picked && (
        <div
          style={{
            marginTop: 16,
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            background: "var(--surface)",
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "baseline",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: pickedCorrect ? "var(--success)" : "var(--error)",
              }}
            >
              {pickedCorrect ? "Correct" : "Missed"}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)" }}>
              You picked {pickedChoice?.key ?? picked}
            </div>
          </div>
          {question?.explanation && (
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.5, color: "var(--fg-muted)", margin: "0 0 14px" }}>
              {question.explanation}
            </p>
          )}
          <button
            onClick={nextRound}
            disabled={readyForNext}
            style={{
              width: "100%",
              background: readyForNext ? "transparent" : "var(--accent)",
              color: readyForNext ? "var(--fg-muted)" : "var(--accent-fg)",
              border: readyForNext ? "1px solid var(--border-strong)" : "none",
              borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 600,
              padding: "11px 16px",
              cursor: readyForNext ? "default" : "pointer",
            }}
          >
            {readyForNext ? "Waiting for rival" : "Next round"}
          </button>
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 80px" }}>{children}</div>;
}

function BackLink() {
  return (
    <Link
      href="/play"
      style={{
        display: "inline-block",
        marginTop: 16,
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        color: "var(--accent)",
        textDecoration: "none",
      }}
    >
      ← Back to Versus
    </Link>
  );
}

function ScorePill({
  label,
  score,
  accent,
  answered,
  alignRight,
}: {
  label: string;
  score: number;
  accent?: boolean;
  answered?: boolean;
  alignRight?: boolean;
}) {
  return (
    <div style={{ textAlign: alignRight ? "right" : "left" }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: accent ? "var(--accent)" : "var(--fg-muted)",
          display: "flex",
          gap: 6,
          alignItems: "center",
          justifyContent: alignRight ? "flex-end" : "flex-start",
        }}
      >
        {label}
        <span
          aria-hidden
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: answered ? "var(--success)" : "var(--border-strong)",
            display: "inline-block",
          }}
        />
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 32, lineHeight: 1, color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}>
        {score}
      </div>
    </div>
  );
}

function WaitingRoom({ match }: { match: DuelMatch }) {
  const [copied, setCopied] = useState(false);
  const code = match.inviteCode ?? "";
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/play?duel=${code}`
      : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(url || code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <Shell>
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-muted)" }}>
          Waiting for opponent
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(36px, 14vw, 56px)",
            letterSpacing: "0.1em",
            color: "var(--accent)",
            margin: "12px 0 4px",
            wordBreak: "break-all",
          }}
        >
          {code}
        </div>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--fg-muted)", maxWidth: 360, margin: "8px auto 24px" }}>
          Share this code or the link with a friend. They will see the rules before the first round.
        </p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-muted)", margin: "0 0 16px" }}>
          {match.numRounds} questions · {Math.round(match.roundLimitMs / 1000)}s each · both click Next
        </p>
        <button
          onClick={copy}
          style={{
            background: "var(--accent)",
            color: "var(--accent-fg)",
            border: "none",
            borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 500,
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          {copied ? "Copied!" : "Copy invite link"}
        </button>
        <div style={{ marginTop: 24 }}>
          <span
            className="mp-spin"
            aria-hidden
            style={{
              display: "inline-block",
              width: 18,
              height: 18,
              border: "2px solid var(--border-strong)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>
      <BackLink />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .mp-spin { animation: spin 0.8s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .mp-spin { animation: none; } }
      `}</style>
    </Shell>
  );
}

function RulesDialog({
  certName,
  numRounds,
  roundLimitMs,
  onClose,
}: {
  certName: string;
  numRounds: number;
  roundLimitMs: number;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="duel-rules-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.66)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "min(100%, 440px)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--r-lg)",
          background: "var(--surface)",
          padding: 20,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            marginBottom: 8,
          }}
        >
          {certName} duel
        </div>
        <h2 id="duel-rules-title" style={{ fontFamily: "var(--font-sans)", fontSize: 22, color: "var(--fg)", margin: "0 0 12px" }}>
          Rules before you race
        </h2>
        <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
          <RuleLine label="Format" value={`${numRounds} shared questions`} />
          <RuleLine label="Timer" value={`${Math.round(roundLimitMs / 1000)} seconds per question`} />
          <RuleLine label="Scoring" value="Correct answers score more when answered faster" />
          <RuleLine label="Pacing" value="After each answer, both players click Next to continue" />
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: "var(--accent)",
            color: "var(--accent-fg)",
            border: "none",
            borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 600,
            padding: "11px 16px",
            cursor: "pointer",
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
}

function RuleLine({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 10, alignItems: "baseline" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-subtle)", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--fg)" }}>{value}</span>
    </div>
  );
}

function Results({
  outcome,
  myScore,
  oppScore,
  myCorrect,
  numRounds,
  xp,
}: {
  outcome: DuelOutcome;
  myScore: number;
  oppScore: number;
  myCorrect: number;
  numRounds: number;
  xp: number;
}) {
  const title = outcome === "win" ? "Victory" : outcome === "loss" ? "Defeat" : "Draw";
  const color = outcome === "win" ? "var(--accent)" : outcome === "loss" ? "var(--error)" : "var(--fg-muted)";
  return (
    <div style={{ textAlign: "center", padding: "24px 0" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-muted)" }}>
        Duel complete
      </div>
      {/* Outcome word in sans (DESIGN.md: Fraunces is for large NUMBERS only). */}
      <h1 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 48, letterSpacing: "-0.02em", lineHeight: 1, color, margin: "8px 0 20px" }}>{title}</h1>

      <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 24 }}>
        <Stat label="You" value={myScore} accent />
        <Stat label="Rival" value={oppScore} />
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 28, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", fontSize: 14 }}>
        <span>
          {myCorrect}/{numRounds} correct
        </span>
        <span style={{ color: "var(--accent)" }}>+{xp} XP</span>
        {outcome === "win" && <span style={{ color: "var(--success)" }}>Streak credited 🔥</span>}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <Link
          href="/play"
          style={{
            background: "var(--accent)",
            color: "var(--accent-fg)",
            border: "none",
            borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 500,
            padding: "10px 20px",
            textDecoration: "none",
          }}
        >
          Play again
        </Link>
        <Link
          href="/"
          style={{
            border: "1px solid var(--border-strong)",
            color: "var(--fg)",
            borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            padding: "10px 20px",
            textDecoration: "none",
          }}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: accent ? "var(--accent)" : "var(--fg-muted)" }}>
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 44, lineHeight: 1, color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </div>
    </div>
  );
}

function RematchControls({
  busy,
  error,
  rivalRematchId,
  onRematch,
}: {
  busy: boolean;
  error: string | null;
  rivalRematchId: string | null;
  onRematch: () => void;
}) {
  return (
    <div style={{ marginTop: 4 }}>
      {/* Rival started a rematch — prominent join banner. */}
      {rivalRematchId && (
        <button
          onClick={() => window.location.assign(`/play/duel?match=${rivalRematchId}`)}
          style={{
            display: "block",
            width: "100%",
            background: "color-mix(in srgb, var(--accent) 12%, transparent)",
            border: "1px solid var(--accent)",
            borderRadius: "var(--r-md)",
            color: "var(--fg)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 500,
            padding: "12px 16px",
            cursor: "pointer",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Your rival started a rematch —{" "}
          <span style={{ color: "var(--accent)" }}>Join</span>
        </button>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button
          onClick={onRematch}
          disabled={busy}
          style={{
            border: "1px solid var(--border-strong)",
            background: "transparent",
            color: "var(--fg)",
            borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: 500,
            padding: "10px 20px",
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? "Starting…" : "Rematch"}
        </button>
      </div>

      {error && (
        <p
          aria-live="polite"
          style={{
            marginTop: 10,
            textAlign: "center",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: "var(--error)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

function Recap({
  numRounds,
  questionIds,
  answers,
  questions,
  myUserId,
}: {
  numRounds: number;
  questionIds: string[];
  answers: DuelAnswer[] | null;
  questions: Record<string, Question>;
  myUserId: string;
}) {
  if (answers === null) {
    return (
      <p style={{ marginTop: 32, textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--fg-muted)" }}>
        Loading recap…
      </p>
    );
  }
  if (answers.length === 0) {
    return (
      <p style={{ marginTop: 32, textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg-muted)" }}>
        Round details unavailable.
      </p>
    );
  }

  return (
    <div style={{ marginTop: 32, maxHeight: "70vh", overflowY: "auto" }}>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        Round-by-round
      </div>
      <div style={{ display: "grid", gap: 0 }}>
        {Array.from({ length: numRounds }, (_, r) => {
          const qId = questionIds[r];
          const q = qId ? questions[qId] : undefined;
          const correct = q?.choices.find((c) => c.correct) ?? null;
          const myAns = answers.find((a) => a.userId === myUserId && a.roundIndex === r) ?? null;
          const oppAns = answers.find((a) => a.userId !== myUserId && a.roundIndex === r) ?? null;
          const myPickText =
            myAns && myAns.picked != null
              ? q?.choices.find((c) => c.key === myAns.picked)?.text ?? myAns.picked
              : null;
          return (
            <div
              key={r}
              style={{
                borderTop: "1px solid var(--border)",
                padding: "16px 0",
                overflowWrap: "anywhere",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--fg-subtle)",
                  marginBottom: 6,
                }}
              >
                Round {r + 1}
              </div>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, lineHeight: 1.4, color: "var(--fg)", margin: "0 0 12px" }}>
                {q ? q.stem : "Question unavailable"}
              </p>

              {/* Correct answer */}
              {correct && (
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 10 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--success)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--r-sm)",
                      padding: "2px 6px",
                      flexShrink: 0,
                    }}
                  >
                    {correct.key}
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--success)" }}>{correct.text}</span>
                </div>
              )}

              {/* Your result */}
              <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 6 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    flexShrink: 0,
                    width: 44,
                  }}
                >
                  You
                </span>
                <span aria-label={myAns?.isCorrect ? "correct" : "incorrect"} style={{ color: myAns?.isCorrect ? "var(--success)" : "var(--error)", flexShrink: 0 }}>
                  {myAns?.isCorrect ? "✓" : "✗"}
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--fg)", flex: 1, minWidth: 0 }}>
                  {myPickText ?? "No answer / timed out"}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-muted)", flexShrink: 0 }}>
                  {myAns ? `${(myAns.msElapsed / 1000).toFixed(1)}s` : "—"} +{myAns?.points ?? 0}
                </span>
              </div>

              {/* Rival result */}
              <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--fg-muted)",
                    flexShrink: 0,
                    width: 44,
                  }}
                >
                  Rival
                </span>
                <span aria-label={oppAns?.isCorrect ? "correct" : "incorrect"} style={{ color: oppAns?.isCorrect ? "var(--success)" : "var(--error)", flexShrink: 0 }}>
                  {oppAns?.isCorrect ? "✓" : "✗"}
                </span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--fg-muted)", flex: 1, minWidth: 0 }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--fg-muted)", flexShrink: 0 }}>
                  +{oppAns?.points ?? 0}
                </span>
              </div>

              {/* Explanation */}
              {q?.explanation && (
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 13,
                    lineHeight: 1.45,
                    color: "var(--fg-muted)",
                    margin: "12px 0 0",
                  }}
                >
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
