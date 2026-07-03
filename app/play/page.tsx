"use client";

import { Suspense, useEffect, useRef, useState } from "react";
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
} from "@/lib/multiplayer/client";
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
  const [busy, setBusy] = useState<null | "invite" | "join" | "quick">(null);
  const [err, setErr] = useState<string | null>(null);
  const [numRounds, setNumRounds] = useState<number>(DUEL_DEFAULTS.numRounds);
  const [roundLimitMs, setRoundLimitMs] = useState<number>(DUEL_DEFAULTS.roundLimitMs);
  const unsubRef = useRef<(() => void) | null>(null);

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
      router.push(`/play/duel?match=${m.id}`);
    } catch (e) {
      setErr(humanError((e as Error).message));
      setBusy(null);
    }
  }

  if (signedIn === false) {
    return (
      <Page>
        <Header />
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--r-md)", background: "var(--surface)", padding: 24, textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-sans)", color: "var(--fg-muted)", marginBottom: 16 }}>
            Sign in to study with others and race head-to-head.
          </p>
          <Link
            href="/login?next=%2Fplay"
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

      {/* Co-study room */}
      {me && <CoStudyRoom me={me} />}
    </Page>
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
    case "not_enough_questions":
      return "Not enough questions for this cert yet.";
    case "not_authenticated":
      return "Please sign in first.";
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
