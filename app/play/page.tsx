"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getCert } from "@/lib/certs";
import { CoStudyRoom } from "@/components/multiplayer/CoStudyRoom";
import { useMe } from "@/lib/multiplayer/use-me";
import {
  createInvite,
  joinByCode,
  quickMatch,
  leaveQueue,
  subscribeQuickMatch,
  createAsyncChallenge,
  listAsyncChallenges,
  cancelAsyncChallenge,
  rematchAsync,
} from "@/lib/multiplayer/client";
import type { AsyncChallengeView } from "@/lib/multiplayer/types";
import { outcomeFor } from "@/lib/multiplayer/scoring";
import { reconcileCompletedChallenge } from "@/lib/multiplayer/async-rewards";
import {
  DUEL_DEFAULTS,
  DUEL_ROUND_OPTIONS,
  DUEL_TIME_LIMIT_OPTIONS_MS,
} from "@/lib/multiplayer/scoring";

export default function PlayPage() {
  return (
    <Suspense fallback={null}>
      <PlayInner />
    </Suspense>
  );
}

function PlayInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { me, signedIn } = useMe();

  const [searching, setSearching] = useState(false);
  // Deep link: /play?duel=CODE prefills the join field (seeded once at mount).
  const [joinCode, setJoinCode] = useState(() => (params.get("duel") ?? "").toUpperCase().slice(0, 6));
  const [busy, setBusy] = useState<null | "invite" | "join" | "quick" | "async">(null);
  const [err, setErr] = useState<string | null>(null);
  const [numRounds, setNumRounds] = useState<number>(DUEL_DEFAULTS.numRounds);
  const [roundLimitMs, setRoundLimitMs] = useState<number>(DUEL_DEFAULTS.roundLimitMs);
  const [challenges, setChallenges] = useState<AsyncChallengeView[] | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  const refreshChallenges = useCallback(async () => {
    try {
      setChallenges(await listAsyncChallenges());
    } catch {
      // list stays whatever it was; challenges are never load-bearing
    }
  }, []);

  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    listAsyncChallenges()
      .then(async (rows) => {
        if (cancelled) return;
        setChallenges(rows);
        // Reconcile completed challenges the player never had open (offline at
        // completion) so local XP mirrors and win streaks catch up.
        for (const view of rows) {
          if (view.match.status === "done") {
            await reconcileCompletedChallenge(view.match, me);
          }
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [me]);

  useEffect(() => () => unsubRef.current?.(), []);

  async function onQuick() {
    if (!me) return;
    setErr(null);
    setBusy("quick");
    try {
      const m = await quickMatch(me.certId, { numRounds, roundLimitMs });
      if (m) {
        router.push(`/play/duel?match=${m.id}`);
        return;
      }
      // Enqueued — wait for an opponent to pair with us.
      setSearching(true);
      unsubRef.current = subscribeQuickMatch(me.userId, (match) => {
        router.push(`/play/duel?match=${match.id}`);
      });
    } catch (e) {
      setSearching(false);
      setErr(humanError((e as Error).message));
    } finally {
      setBusy(null);
    }
  }

  async function cancelSearch() {
    unsubRef.current?.();
    unsubRef.current = null;
    setSearching(false);
    await leaveQueue().catch(() => {});
  }

  async function onInvite() {
    if (!me) return;
    setErr(null);
    setBusy("invite");
    try {
      const m = await createInvite(me.certId, { numRounds, roundLimitMs });
      router.push(`/play/duel?match=${m.id}`);
    } catch (e) {
      setErr(humanError((e as Error).message));
      setBusy(null);
    }
  }

  async function onJoin() {
    setErr(null);
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      setErr("Enter a 6-character code.");
      return;
    }
    setBusy("join");
    try {
      const m = await joinByCode(code);
      router.push(m.mode === "async" ? `/play/duel-async?match=${m.id}` : `/play/duel?match=${m.id}`);
    } catch (e) {
      setErr(humanError((e as Error).message));
      setBusy(null);
    }
  }

  async function onAsyncChallenge() {
    if (!me) return;
    setErr(null);
    setBusy("async");
    try {
      const m = await createAsyncChallenge(me.certId, numRounds);
      router.push(`/play/duel-async?match=${m.id}`);
    } catch (e) {
      setErr(humanError((e as Error).message));
      setBusy(null);
    }
  }

  async function onContinue(id: string) {
    router.push(`/play/duel-async?match=${id}`);
  }

  async function onCancel(id: string) {
    setBusy("async");
    try {
      await cancelAsyncChallenge(id);
      await refreshChallenges();
    } catch {
      // stale list entry; refresh anyway
      await refreshChallenges();
    } finally {
      setBusy(null);
    }
  }

  async function onAsyncRematch(id: string) {
    setBusy("async");
    try {
      const m = await rematchAsync(id);
      router.push(`/play/duel-async?match=${m.id}`);
    } catch {
      setBusy(null);
    }
  }

  if (signedIn === false) {
    // Preserve a shared challenge code through the sign-in redirect, so a
    // recipient lands back on the prefilled join field after authenticating.
    const duelParam = params.get("duel");
    const next = duelParam ? `/play?duel=${encodeURIComponent(duelParam)}` : "/play";
    return (
      <Page>
        <Header />
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface)", padding: 24, textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-sans)", color: "var(--fg-muted)", marginBottom: 16 }}>
            Sign in to study with others and race head-to-head.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
              borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 500,
              padding: "10px 20px",
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </div>
      </Page>
    );
  }

  const certName = me ? getCert(me.certId).name : "";

  return (
    <Page>
      <Header />

      {/* Race panel */}
      <section
        style={{
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          background: "var(--surface)",
          padding: 20,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
          <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--fg)", margin: 0 }}>1v1 Duel</h2>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-muted)", letterSpacing: "0.06em" }}>
            {certName}
          </span>
        </div>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg-muted)", margin: "0 0 16px" }}>
          Pick the rules, then race. Correct answers score more when they are faster, but each round waits until both players click Next.
        </p>

        {!searching && (
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              background: "var(--surface-2)",
              padding: 12,
              marginBottom: 14,
              display: "grid",
              gap: 12,
            }}
          >
            <SettingRow label="Questions">
              <Segmented
                value={numRounds}
                values={[...DUEL_ROUND_OPTIONS]}
                format={(v) => String(v)}
                onChange={setNumRounds}
                disabled={busy !== null}
              />
            </SettingRow>
            <SettingRow label="Timer">
              <Segmented
                value={roundLimitMs}
                values={[...DUEL_TIME_LIMIT_OPTIONS_MS]}
                format={(v) => `${Math.round(v / 1000)}s`}
                onChange={setRoundLimitMs}
                disabled={busy !== null}
              />
            </SettingRow>
            <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--fg-subtle)", lineHeight: 1.4 }}>
              Quick Match pairs you with someone using the same question count and timer. Invites show these rules before play starts.
            </p>
          </div>
        )}

        {searching ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14 }}>
              <span
                className="mp-spin"
                aria-hidden
                style={{
                  width: 16,
                  height: 16,
                  border: "2px solid var(--border-strong)",
                  borderTopColor: "var(--accent)",
                  borderRadius: "50%",
                }}
              />
              <span aria-live="polite" style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--fg)" }}>
                Finding an opponent…
              </span>
            </div>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--fg-subtle)", marginBottom: 14 }}>
              No one around? Invite a friend instead — they can jump in instantly.
            </p>
            <button onClick={cancelSearch} style={outlineBtn}>
              Cancel
            </button>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
              .mp-spin { animation: spin 0.8s linear infinite; }
              @media (prefers-reduced-motion: reduce) { .mp-spin { animation: none; } }
            `}</style>
          </div>
        ) : (
          <>
            <button onClick={onQuick} disabled={busy !== null} style={{ ...primaryBtn, width: "100%", marginBottom: 10 }}>
              {busy === "quick" ? "…" : "Quick Match"}
            </button>
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <button onClick={onInvite} disabled={busy !== null} style={{ ...outlineBtn, flex: 1 }}>
                {busy === "invite" ? "…" : "Invite a friend"}
              </button>
              <button onClick={onAsyncChallenge} disabled={busy !== null} style={{ ...outlineBtn, flex: 1 }}>
                {busy === "async" ? "…" : "Challenge (they play later)"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onJoin();
                }}
                placeholder="Enter code"
                aria-label="Duel invite code"
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-sm)",
                  color: "var(--fg)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.12em",
                  fontSize: 14,
                  padding: "8px 12px",
                  outline: "none",
                  textTransform: "uppercase",
                }}
              />
              <button onClick={onJoin} disabled={busy !== null} style={outlineBtn}>
                {busy === "join" ? "…" : "Join"}
              </button>
            </div>
          </>
        )}

        {err && (
          <p style={{ marginTop: 12, fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--error)" }}>{err}</p>
        )}
      </section>

      {/* Async challenges */}
      {me && challenges && challenges.length > 0 && (
        <section
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            background: "var(--surface)",
            padding: 20,
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--fg)", margin: "0 0 4px" }}>
            Your challenges
          </h2>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg-muted)", margin: "0 0 14px" }}>
            Same questions, played whenever each of you has time. Expire after 14 days.
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {challenges.map((c) => (
              <ChallengeRow
                key={c.match.id}
                view={c}
                meId={me.userId}
                busy={busy !== null}
                onContinue={onContinue}
                onCancel={onCancel}
                onRematch={onAsyncRematch}
              />
            ))}
          </div>
        </section>
      )}

      {/* Co-study room */}
      {me && <CoStudyRoom me={me} />}
    </Page>
  );
}

function ChallengeRow({
  view,
  meId,
  busy,
  onContinue,
  onCancel,
  onRematch,
}: {
  view: AsyncChallengeView;
  meId: string;
  busy: boolean;
  onContinue: (id: string) => void;
  onCancel: (id: string) => void;
  onRematch: (id: string) => void;
}) {
  const m = view.match;
  const iAmHost = m.hostId === meId;
  const otherName = (iAmHost ? view.guestName : view.hostName) ?? "Opponent";
  const myReady = (iAmHost ? m.hostReadyRound : m.guestReadyRound) ?? -1;
  const oppReady = (iAmHost ? m.guestReadyRound : m.hostReadyRound) ?? -1;
  const myDone = myReady >= m.numRounds - 1;
  const myScore = iAmHost ? m.hostScore : m.guestScore;
  const oppScore = iAmHost ? m.guestScore : m.hostScore;
  const myCorrect = iAmHost ? m.hostCorrect : m.guestCorrect;
  const oppCorrect = iAmHost ? m.guestCorrect : m.hostCorrect;

  let badge = "";
  let action: React.ReactNode = null;

  if (m.status === "abandoned") {
    badge = "Expired";
  } else if (m.status === "done") {
    const outcome = outcomeFor(myScore, oppScore, myCorrect, oppCorrect);
    badge = outcome === "win" ? `Won ${myScore}–${oppScore} vs ${otherName}` : outcome === "loss" ? `Lost ${myScore}–${oppScore} vs ${otherName}` : `Draw ${myScore}–${oppScore} vs ${otherName}`;
    action = (
      <button onClick={() => onRematch(m.id)} disabled={busy} style={outlineBtnSmall}>
        Rematch
      </button>
    );
  } else if (!myDone) {
    badge = oppReady >= 0 ? `${otherName} already played — your turn` : iAmHost ? m.guestId ? "Your turn" : "Your turn (share the code)" : "Your turn";
    action = (
      <button onClick={() => onContinue(m.id)} disabled={busy} style={outlineBtnSmall}>
        {myReady >= 0 ? "Continue" : "Play now"}
      </button>
    );
  } else {
    badge = m.status === "waiting" ? `Waiting for someone · code ${m.inviteCode ?? ""}` : `Waiting for ${otherName}`;
    action = (
      <span style={{ display: "inline-flex", gap: 8 }}>
        {m.status === "waiting" && !m.guestId && (
          <>
            <button onClick={() => onContinue(m.id)} disabled={busy} style={outlineBtnSmall}>
              Your run
            </button>
            <button onClick={() => onCancel(m.id)} disabled={busy} style={outlineBtnSmall}>
              Cancel
            </button>
          </>
        )}
      </span>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)",
        background: "var(--surface-2)",
        padding: "10px 12px",
      }}
    >
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg)", minWidth: 0 }}>
        {badge}
      </span>
      {action}
    </div>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 80px" }}>{children}</div>;
}

function Header() {
  return (
    <div style={{ marginBottom: 20 }}>
      <h1 style={{ fontFamily: "var(--font-sans)", fontSize: 24, fontWeight: 600, color: "var(--fg)", margin: 0 }}>
        Versus & Co-study
      </h1>
      <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--fg-muted)", margin: "4px 0 0" }}>
        Study alongside others, or race a rival.
      </p>
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", gap: 10, alignItems: "center" }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

function Segmented<T extends number>({
  value,
  values,
  format,
  onChange,
  disabled,
}: {
  value: T | number;
  values: T[];
  format: (value: T) => string;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))`, gap: 6 }}>
      {values.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            disabled={disabled}
            style={{
              minWidth: 0,
              border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
              background: active ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "transparent",
              color: active ? "var(--accent)" : "var(--fg-muted)",
              borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              padding: "7px 8px",
              cursor: disabled ? "default" : "pointer",
            }}
          >
            {format(option)}
          </button>
        );
      })}
    </div>
  );
}

function humanError(code: string): string {
  switch (code) {
    case "invalid_code":
      return "That code isn't valid.";
    case "match_unavailable":
      return "That duel already started or filled up.";
    case "cannot_join_own_match":
      return "You can't join your own invite — share it with a friend.";
    case "challenge_expired":
      return "That challenge expired — ask for a fresh one.";
    case "not_enough_questions":
      return "Not enough questions for this cert yet.";
    case "not_authenticated":
      return "Please sign in first.";
    case "cancel_too_late":
      return "Too late to cancel — the seat was already claimed.";
    case "not_async":
    case "match_not_active":
      return "That challenge is no longer playable.";
    default:
      return "Something went wrong. Try again.";
  }
}

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

const outlineBtn: React.CSSProperties = {
  background: "transparent",
  color: "var(--fg)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--r-sm)",
  fontFamily: "var(--font-sans)",
  fontSize: 14,
  padding: "8px 16px",
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
