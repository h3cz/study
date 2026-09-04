"use client";

// Async duel arena: play a challenge's rounds at your own pace, no timers, no
// simultaneous presence. Server-authoritative like the live duel (correctness
// + points + XP decided by the server); this component only sends intents and
// renders the resulting truth.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { db, seedDb, type Question } from "@/lib/db";
import { reconcileCompletedChallenge } from "@/lib/multiplayer/async-rewards";
import {
  fetchMatch,
  fetchAnswers,
  submitAsyncAnswer,
  rematchAsync,
} from "@/lib/multiplayer/client";
import { outcomeFor, duelXp } from "@/lib/multiplayer/scoring";
import type { DuelMatch, DuelAnswer } from "@/lib/multiplayer/types";
import type { Me } from "@/lib/multiplayer/use-me";

type Side = "host" | "guest";

/**
 * Monotonic progress score for a match from one participant's perspective:
 * my answered rounds dominate, then the opponent's, then lifecycle status.
 * A snapshot with a lower score than what is on screen is a stale response
 * and must not overwrite newer state.
 */
function matchProgressScore(m: DuelMatch, userId: string): number {
  const myR = ((m.hostId === userId ? m.hostReadyRound : m.guestReadyRound) ?? -1) + 1;
  const opR = ((m.hostId === userId ? m.guestReadyRound : m.hostReadyRound) ?? -1) + 1;
  const sRank = m.status === "done" || m.status === "abandoned" ? 3 : m.status === "active" ? 2 : 1;
  return myR * 100 + opR * 10 + sRank;
}

export function AsyncDuelArena({ me, matchId }: { me: Me; matchId: string }) {
  const [match, setMatch] = useState<DuelMatch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rematchBusy, setRematchBusy] = useState(false);

  const [recapAnswers, setRecapAnswers] = useState<DuelAnswer[] | null>(null);
  const [recapQuestions, setRecapQuestions] = useState<Record<string, Question>>({});
  const reconciled = useRef(false);
  const recapLoaded = useRef(false);
  const loadedRound = useRef<number>(-1);
  // Which round is on screen. null = follow myNext (the round to answer);
  // frozen to the answered round after a pick so the feedback stays readable
  // until the player clicks Next (or See results on the final round).
  const [viewRound, setViewRound] = useState<number | null>(null);
  // Set right after a successful submit; holds the question + verdict on
  // screen. Cleared by Next question / See results. Without this, the final
  // answer's feedback would be replaced the instant myDone flips true.
  const [feedbackRound, setFeedbackRound] = useState<number | null>(null);

  const mySide: Side = match && match.hostId === me.userId ? "host" : "guest";
  const status = match?.status;
  const numRounds = match?.numRounds ?? 0;
  const myReady = match ? ((mySide === "host" ? match.hostReadyRound : match.guestReadyRound) ?? -1) : -1;
  const oppReady = match ? ((mySide === "host" ? match.guestReadyRound : match.hostReadyRound) ?? -1) : -1;
  const myNext = myReady + 1;
  const effectiveViewRound = viewRound ?? myNext;
  const myDone = myReady >= numRounds - 1 && numRounds > 0;
  const bothDone = status === "done";
  const shareUrl =
    match?.inviteCode && typeof window !== "undefined"
      ? `${window.location.origin}/play?duel=${match.inviteCode}`
      : null;

  const applyMatch = useCallback(
    (m: DuelMatch) => {
      setMatch((cur) => (cur && matchProgressScore(m, me.userId) < matchProgressScore(cur, me.userId) ? cur : m));
    },
    [me.userId]
  );

  // Initial load + slow poll while the challenge is undecided (no realtime
  // dependency — the opponent may finish hours later). Every update passes
  // through applyMatch, which never lets a stale snapshot regress progress
  // (e.g. a poll that started before an answer submit but landed after it).
  useEffect(() => {
    let cancelled = false;
    fetchMatch(matchId)
      .then((m) => !cancelled && applyMatch(m))
      .catch((e) => !cancelled && setError(e.message ?? "match_failed"));
    const t = setInterval(() => {
      fetchMatch(matchId)
        .then((m) => !cancelled && applyMatch(m))
        .catch(() => {});
    }, 5000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, me.userId]);

  // Load the on-screen round's question from the local bundle.
  useEffect(() => {
    if (!match || (status !== "waiting" && status !== "active")) return;
    if (myDone) return;
    if (loadedRound.current === effectiveViewRound) return;
    loadedRound.current = effectiveViewRound;
    setPicked(null);
    setQuestion(null);
    const qId = match.questionIds[effectiveViewRound];
    if (!qId) return;
    (async () => {
      await seedDb().catch(() => {});
      const q = await db.questions.get(qId);
      if (loadedRound.current === effectiveViewRound) setQuestion(q ?? null);
    })();
  }, [match, status, effectiveViewRound, myDone]);

  const pick = useCallback(
    async (key: string) => {
      if (!match || picked || busy || myDone) return;
      if (effectiveViewRound !== myNext) return; // feedback view is frozen
      setPicked(key);
      setBusy(true);
      try {
        const m = await submitAsyncAnswer(matchId, myNext, key);
        setViewRound(myNext); // freeze the answered round so feedback is readable
        setFeedbackRound(myNext);
        applyMatch(m);
      } catch {
        setPicked(null);
      } finally {
        setBusy(false);
      }
    },
    [match, picked, busy, myDone, matchId, myNext, effectiveViewRound, applyMatch]
  );

  const nextQuestion = useCallback(() => {
    setViewRound(null); // re-follow myNext → loads the next question
    setPicked(null);
    setFeedbackRound(null);
  }, []);

  const seeResults = useCallback(() => {
    setViewRound(null);
    setPicked(null);
    setFeedbackRound(null);
  }, []);

  // Results reconciliation — runs when the match completes and retried by the
  // poll until it actually succeeds (the helper only reports success after the
  // server pull and local mirrors went through; the ref blocks re-runs only
  // after a real success).
  useEffect(() => {
    if (!match || match.status !== "done" || reconciled.current) return;
    void reconcileCompletedChallenge(match, me).then((ran) => {
      if (ran) reconciled.current = true;
    });
  }, [match, me]);

  // Load the recap once the match is done.
  useEffect(() => {
    if (!match || match.status !== "done" || recapLoaded.current) return;
    recapLoaded.current = true;
    (async () => {
      const answers = await fetchAnswers(match.id);
      setRecapAnswers(answers);
      await seedDb().catch(() => {});
      const bodies: Record<string, Question> = {};
      for (const a of answers) {
        if (!bodies[a.questionId]) {
          const q = await db.questions.get(a.questionId);
          if (q) bodies[a.questionId] = q;
        }
      }
      setRecapQuestions(bodies);
    })();
  }, [match]);

  const onRematch = useCallback(async () => {
    if (!match || rematchBusy) return;
    setRematchBusy(true);
    try {
      const m = await rematchAsync(match.id);
      window.location.href = `/play/duel-async?match=${m.id}`;
    } catch {
      setRematchBusy(false);
    }
  }, [match, rematchBusy]);

  async function copyShare() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (older browsers) — the code is visible anyway.
    }
  }

  if (error) {
    return (
      <Shell backHref="/play">
        <p style={mutedP}>This challenge could not be loaded.</p>
        <Link href="/play" style={linkStyle}>
          ← Back to Versus
        </Link>
      </Shell>
    );
  }

  if (!match) {
    return (
      <Shell backHref="/play">
        <p style={mutedP}>Loading…</p>
      </Shell>
    );
  }

  const myScore = mySide === "host" ? match.hostScore : match.guestScore;
  const oppScore = mySide === "host" ? match.guestScore : match.hostScore;
  const myCorrect = mySide === "host" ? match.hostCorrect : match.guestCorrect;
  const oppCorrect = mySide === "host" ? match.guestCorrect : match.hostCorrect;
  const outcome = bothDone ? outcomeFor(myScore, oppScore, myCorrect, oppCorrect) : null;

  // ── Done: results (held off while final-question feedback is on screen) ────
  if (bothDone && feedbackRound == null) {
    return (
      <Shell backHref="/play">
        <Header match={match} me={me} />
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            background: "var(--surface)",
            padding: 20,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          <p
            className="font-display"
            style={{
              fontSize: 30,
              margin: "0 0 6px",
              color: outcome === "win" ? "var(--accent)" : "var(--fg)",
            }}
          >
            {outcome === "win" ? "You win" : outcome === "loss" ? "You lost" : "Draw"}
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 20, color: "var(--fg)", margin: "0 0 4px" }}>
            {myScore} — {oppScore}
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>
            {myCorrect}/{numRounds} correct vs {oppCorrect}/{numRounds} · +{duelXp(myCorrect, outcome === "win")} XP
          </p>
        </div>

        <RecapList
          answers={recapAnswers}
          questions={recapQuestions}
          meId={me.userId}
          questionIds={match.questionIds}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={onRematch} disabled={rematchBusy} style={{ ...primaryBtn, flex: 1 }}>
            {rematchBusy ? "…" : "Rematch"}
          </button>
        </div>
      </Shell>
    );
  }

  // ── Expired ────────────────────────────────────────────────────────────────
  if (status === "abandoned") {
    return (
      <Shell backHref="/play">
        <Header match={match} me={me} />
        <div style={{ ...panel, textAlign: "center" }}>
          <p style={mutedP}>This challenge expired after 14 days.</p>
        </div>
      </Shell>
    );
  }

  // ── My run is finished: waiting on the opponent (after final feedback) ─────
  if (myDone && feedbackRound == null) {
    return (
      <Shell backHref="/play">
        <Header match={match} me={me} />
        <div style={{ ...panel, textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--fg)", margin: "0 0 4px" }}>
            Your run is in: {myScore} pts · {myCorrect}/{numRounds} correct
          </p>
          <p style={{ ...mutedP, marginBottom: 16 }}>
            {match.guestId
              ? "Waiting for your opponent to finish their run."
              : "Waiting for someone to accept the challenge."}
          </p>
          {match.inviteCode && (
            <ShareBlock
              code={match.inviteCode}
              copied={copied}
              onCopy={copyShare}
            />
          )}
        </div>
      </Shell>
    );
  }

  // ── Playing (or reviewing the just-answered round, even if that finished
  // the run — the verdict + explanation stay up until the player continues) ──
  const correctKey = question?.choices.find((c) => c.correct)?.key ?? null;
  const answered = feedbackRound != null && picked != null && question != null;
  const revealed = answered || busy;

  return (
    <Shell backHref="/play">
      <Header match={match} me={me} />

      <div style={{ ...panel, padding: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 12,
          }}
        >
          <span style={monoLabel}>
            Question {effectiveViewRound + 1} / {numRounds}
          </span>
          <span style={monoLabel}>
            {myScore} pts · {myCorrect}/{myNext} correct
          </span>
        </div>

        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 16,
            color: "var(--fg)",
            lineHeight: 1.5,
            margin: "0 0 14px",
          }}
        >
          {question ? question.stem : "…"}
        </p>

        <div style={{ display: "grid", gap: 8 }}>
          {question?.choices.map((c) => {
            const isPicked = picked === c.key;
            const isCorrectKey = correctKey === c.key;
            const showTruth = answered && (isPicked || isCorrectKey);
            return (
              <button
                key={c.key}
                onClick={() => pick(c.key)}
                disabled={revealed}
                style={{
                  textAlign: "left",
                  background:
                    showTruth && isCorrectKey
                      ? "color-mix(in srgb, var(--accent) 16%, transparent)"
                      : showTruth && isPicked
                        ? "color-mix(in srgb, var(--error) 12%, transparent)"
                        : "var(--surface-2)",
                  border: `1px solid ${
                    showTruth && isCorrectKey
                      ? "var(--accent)"
                      : showTruth && isPicked
                        ? "var(--error)"
                        : "var(--border)"
                  }`,
                  borderRadius: "var(--r-sm)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
                  color: "var(--fg)",
                  padding: "11px 14px",
                  cursor: revealed ? "default" : "pointer",
                  display: "flex",
                  gap: 10,
                  alignItems: "baseline",
                }}
              >
                <span style={{ ...monoLabel, flexShrink: 0 }}>{c.key}</span>
                <span>{c.text}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div style={{ marginTop: 14 }}>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                fontWeight: 600,
                margin: "0 0 4px",
                color: picked === correctKey ? "var(--accent)" : "var(--error)",
              }}
            >
              {picked === correctKey ? `Correct · +${match.basePoints}` : "Incorrect"}
            </p>
            {question?.explanation && (
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.5, margin: 0 }}>
                {question.explanation}
              </p>
            )}
            {effectiveViewRound + 1 < numRounds ? (
              <button onClick={nextQuestion} style={{ ...primaryBtn, marginTop: 12 }}>
                Next question →
              </button>
            ) : (
              <button onClick={seeResults} style={{ ...primaryBtn, marginTop: 12 }}>
                {myDone && oppReady >= 0 ? "See results" : "Finish my run"}
              </button>
            )}
          </div>
        )}

        {!question && !answered && (
          <p style={{ ...mutedP, margin: 0 }}>Loading question…</p>
        )}
      </div>

      {mySide === "host" && !match.guestId && status === "waiting" && (
        <div style={{ ...panel, marginTop: 14 }}>
          <p style={{ ...mutedP, marginBottom: 10 }}>
            While you play: share this code and anyone can accept the challenge — they run the
            same questions whenever they like.
          </p>
          <ShareBlock
            code={match.inviteCode ?? ""}
            copied={copied}
            onCopy={copyShare}
          />
        </div>
      )}
    </Shell>
  );
}

// ─── Shared pieces ────────────────────────────────────────────────────────────

function Header({ match, me }: { match: DuelMatch; me: Me }) {
  const iAmHost = match.hostId === me.userId;
  const roleLabel = iAmHost ? "Your challenge" : "Accepted challenge";
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ ...monoLabel, margin: "0 0 2px" }}>{roleLabel}</p>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 600, color: "var(--fg)", margin: 0 }}>
        Async duel
      </h1>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg-muted)", margin: "4px 0 0" }}>
        {match.numRounds} questions · no timer · same set for both players
      </p>
    </div>
  );
}

function RecapList({
  answers,
  questions,
  meId,
  questionIds,
}: {
  answers: DuelAnswer[] | null;
  questions: Record<string, Question>;
  meId: string;
  questionIds: string[];
}) {
  if (!answers) {
    return (
      <div style={panel}>
        <p style={{ ...mutedP, margin: 0 }}>Loading recap…</p>
      </div>
    );
  }
  const byRound = new Map<number, DuelAnswer[]>();
  for (const a of answers) {
    const list = byRound.get(a.roundIndex) ?? [];
    list.push(a);
    byRound.set(a.roundIndex, list);
  }
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {questionIds.map((qid, i) => {
        const rows = byRound.get(i) ?? [];
        const mine = rows.find((r) => r.userId === meId);
        const theirs = rows.find((r) => r.userId !== meId);
        const q = questions[qid];
        return (
          <div key={qid + i} style={{ ...panel, padding: "12px 14px" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg)", margin: "0 0 6px" }}>
              <span style={{ ...monoLabel, marginRight: 8 }}>Q{i + 1}</span>
              {q ? q.stem : "…"}
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <RecapPick label="You" answer={mine} question={q} />
              <RecapPick label="Them" answer={theirs} question={q} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecapPick({
  label,
  answer,
  question,
}: {
  label: string;
  answer?: DuelAnswer;
  question?: Question;
}) {
  const text = answer
    ? answer.isCorrect
      ? "correct"
      : `picked ${answer.picked ?? "—"}`
    : "no answer";
  const chosen = question && answer?.picked ? question.choices.find((c) => c.key === answer.picked)?.text : null;
  return (
    <span
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        color: answer?.isCorrect ? "var(--accent)" : answer ? "var(--error)" : "var(--fg-subtle)",
      }}
    >
      {label}: {text}
      {chosen ? ` · ${chosen}` : ""}
    </span>
  );
}

function ShareBlock({
  code,
  copied,
  onCopy,
}: {
  code: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)",
        padding: "8px 12px",
      }}
    >
      <span
        aria-label="Challenge code"
        style={{ fontFamily: "var(--font-mono)", fontSize: 18, letterSpacing: "0.18em", color: "var(--fg)" }}
      >
        {code}
      </span>
      <button onClick={onCopy} style={outlineBtnSmall}>
        {copied ? "Copied link" : "Copy link"}
      </button>
    </div>
  );
}

function Shell({ children, backHref }: { children: React.ReactNode; backHref: string }) {
  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 80px" }}>
      <Link
        href={backHref}
        style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg-muted)", textDecoration: "none", display: "inline-block", marginBottom: 14 }}
      >
        ← Versus
      </Link>
      {children}
    </div>
  );
}

const panel: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: "var(--r-md)",
  background: "var(--surface)",
  padding: 20,
};

const mutedP: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  color: "var(--fg-muted)",
  margin: "0 0 12px",
};

const monoLabel: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--fg-muted)",
};

const linkStyle: React.CSSProperties = {
  color: "var(--accent)",
  fontFamily: "var(--font-sans)",
  textDecoration: "none",
};

const primaryBtn: React.CSSProperties = {
  background: "var(--accent)",
  color: "var(--accent-fg)",
  border: "none",
  borderRadius: "var(--r-sm)",
  fontFamily: "var(--font-sans)",
  fontSize: 15,
  fontWeight: 600,
  padding: "12px 20px",
  cursor: "pointer",
};

const outlineBtnSmall: React.CSSProperties = {
  background: "transparent",
  color: "var(--fg)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--r-sm)",
  fontFamily: "var(--font-sans)",
  fontSize: 12,
  padding: "6px 10px",
  cursor: "pointer",
};
