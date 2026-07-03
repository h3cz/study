"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  fetchGlobalLeaderboard,
  fetchCertLeaderboard,
  fetchCohortLeaderboard,
  fetchMyCohorts,
  createCohort,
  joinCohort,
  leaveCohort,
  deleteCohort,
} from "@/lib/leaderboard";
import type { LeaderRow, CohortInfo } from "@/lib/leaderboard";
import { Avatar } from "@/components/Avatar";
import { RankBadge } from "@/components/RankBadge";
import { db } from "@/lib/db";
import { liveCerts, getCert, getActiveCertId } from "@/lib/certs";
import { FLAGS } from "@/lib/flags";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inviteUrl(code: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/leaderboard?join=${code}`;
}

// Reads ?join= query param and fires callbacks into the page.
// Must be wrapped in <Suspense> because useSearchParams opts out of prerendering.
function JoinParamHandler({
  userId,
  onAutoJoin,
  onPendingGuest,
}: {
  userId: string | null | undefined; // undefined = still loading
  onAutoJoin: (code: string) => void;
  onPendingGuest: (code: string) => void;
}) {
  const searchParams = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (userId === undefined) return; // still loading auth — wait
    if (handled.current) return;
    handled.current = true;

    const urlCode = searchParams.get("join")?.trim().toUpperCase() ?? null;

    // Always clean the URL so a refresh doesn't re-trigger
    if (urlCode) {
      window.history.replaceState({}, "", "/leaderboard");
    }

    if (urlCode) {
      if (userId) {
        onAutoJoin(urlCode);
      } else {
        localStorage.setItem("pendingCohortJoin", urlCode);
        onPendingGuest(urlCode);
      }
    } else if (userId) {
      // No ?join= in URL — check localStorage for pending code left before login
      const pending = localStorage.getItem("pendingCohortJoin");
      if (pending) {
        localStorage.removeItem("pendingCohortJoin");
        onAutoJoin(pending);
      }
    }
  }, [userId, searchParams, onAutoJoin, onPendingGuest]);

  return null;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
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
        {title}
      </h2>
      {children}
    </div>
  );
}

type ActiveTab = "public" | "cohorts";

function teamErrorMessage(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : fallback;
  return message
    .replace(/\bcohorts\b/g, "teams")
    .replace(/\bCohorts\b/g, "Teams")
    .replace(/\bcohort\b/g, "team")
    .replace(/\bCohort\b/g, "Team");
}

// ─── Cohort detail modal ──────────────────────────────────────────────────────

function CohortDetailModal({
  cohort,
  currentUserId,
  onClose,
  onLeft,
  onDeleted,
}: {
  cohort: CohortInfo;
  currentUserId: string;
  onClose: () => void;
  onLeft: () => void;
  onDeleted: () => void;
}) {
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchCohortLeaderboard(cohort.id, currentUserId)
      .then((r) => { setRows(r); setLoading(false); })
      .catch(() => { setError("Could not load team scores."); setLoading(false); });
  }, [cohort.id, currentUserId]);

  async function handleLeave() {
    setBusy(true);
    try {
      await leaveCohort(cohort.id);
      onLeft();
    } catch (e) {
      setActionError(teamErrorMessage(e, "Failed to leave team"));
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete team "${cohort.name}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await deleteCohort(cohort.id);
      onDeleted();
    } catch (e) {
      setActionError(teamErrorMessage(e, "Failed to delete team"));
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--r-md)",
          padding: "28px 24px",
          maxWidth: "480px",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "4px" }}>
          <h2
            className="font-display"
            style={{ fontSize: "20px", fontWeight: 400, color: "var(--fg)" }}
          >
            {cohort.name}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--fg-muted)", fontSize: "18px", padding: "0 4px" }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p style={{ fontSize: "12px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: "16px" }}>
          {cohort.memberCount} member{cohort.memberCount !== 1 ? "s" : ""}
        </p>

        {loading ? (
          <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>Loading…</p>
        ) : error ? (
          <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>{error}</p>
        ) : rows.length === 0 ? (
          <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
            No scores yet — take a quiz to appear here.
          </p>
        ) : (
          <div style={{ marginBottom: "20px" }}>
            <RankTable rows={rows} />
          </div>
        )}

        {actionError && (
          <p style={{ fontSize: "12px", color: "var(--error, #e55c5c)", fontFamily: "var(--font-sans)", marginBottom: "12px" }}>
            {actionError}
          </p>
        )}

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {cohort.isOwner ? (
            <button
              onClick={handleDelete}
              disabled={busy}
              style={{
                height: "36px",
                padding: "0 16px",
                background: "transparent",
                color: "var(--error, #e55c5c)",
                border: "1px solid var(--error, #e55c5c)",
                borderRadius: "var(--r-sm)",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                opacity: busy ? 0.5 : 1,
              }}
            >
              Delete team
            </button>
          ) : (
            <button
              onClick={handleLeave}
              disabled={busy}
              style={{
                height: "36px",
                padding: "0 16px",
                background: "transparent",
                color: "var(--fg-muted)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--r-sm)",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                opacity: busy ? 0.5 : 1,
              }}
            >
              Leave team
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Rank table (shared between public + cohort) ──────────────────────────────

function RankTable({
  rows,
  mode = "score",
  passingScore = 750,
}: {
  rows: LeaderRow[];
  // "xp" → global board: rank/display total XP. "score" → cert/cohort board: predicted score.
  mode?: "xp" | "score";
  passingScore?: number;
}) {
  const isXp = mode === "xp";
  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "40px minmax(0, 1fr) 72px",
          gap: "8px",
          padding: "0 0 8px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "4px",
        }}
      >
        <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>Rank</span>
        <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-subtle)", fontFamily: "var(--font-mono)" }}>Name</span>
        <span style={{ fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fg-subtle)", fontFamily: "var(--font-mono)", textAlign: "right" }}>{isXp ? "XP" : "Score"}</span>
      </div>
      {rows.map((row, i) => {
        const rank = i + 1;
        const medal =
          rank === 1 ? { emoji: "🥇", color: "#F5A623" } :
          rank === 2 ? { emoji: "🥈", color: "#C0C0C8" } :
          rank === 3 ? { emoji: "🥉", color: "#CD7F32" } :
          null;
        return (
        <div
          key={row.userId}
          style={{
            display: "grid",
            gridTemplateColumns: "40px minmax(0, 1fr) 72px",
            gap: "8px",
            padding: "10px 8px",
            borderRadius: "var(--r-sm)",
            background: row.isMe ? "rgba(245,166,35,0.07)" : "transparent",
            borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none",
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: "12px",
              color: medal ? medal.color : "var(--fg-muted)",
              fontVariantNumeric: "tabular-nums",
              fontWeight: medal ? 700 : 400,
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            {medal ? (
              <span aria-label={`Rank ${rank}`} style={{ fontSize: "14px", lineHeight: 1 }}>{medal.emoji}</span>
            ) : (
              rank
            )}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
            <Avatar url={row.avatarUrl} name={row.displayName} size={28} />
            <div style={{ display: "grid", gap: "4px", minWidth: 0 }}>
              <span
                style={{
                  fontSize: "13px",
                  color: row.isMe ? "var(--accent)" : "var(--fg)",
                  fontFamily: "var(--font-sans)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  minWidth: 0,
                }}
              >
                {row.displayName}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                {!isXp && <RankBadge score={row.predictedScore} size="sm" passingScore={passingScore} />}
                {row.isMe && (
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: "var(--accent)",
                      background: "rgba(245,166,35,0.15)",
                      border: "1px solid rgba(245,166,35,0.4)",
                      borderRadius: "3px",
                      padding: "1px 4px",
                      flexShrink: 0,
                    }}
                  >
                    you
                  </span>
                )}
              </div>
            </div>
          </div>
          <span
            className="font-display"
            style={{ fontSize: "18px", fontWeight: 400, color: "var(--fg)", textAlign: "right", lineHeight: 1.4 }}
          >
            {isXp ? (row.xp ?? 0).toLocaleString() : (row.predictedScore ?? "—")}
          </span>
        </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [tab, setTab] = useState<ActiveTab>("public");
  // undefined = loading, null = signed out, User = signed in
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isPubliclyListed, setIsPubliclyListed] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Public tab state
  // Segmented sub-tab inside the public section: "global" (XP) or a cert id.
  const [boardTab, setBoardTab] = useState<string>("global");
  const [boardTabReady, setBoardTabReady] = useState(false);
  const [publicRows, setPublicRows] = useState<LeaderRow[]>([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState(false);
  const [optInBusy, setOptInBusy] = useState(false);

  // Cohorts tab state
  const [cohorts, setCohorts] = useState<CohortInfo[]>([]);
  const [cohortsLoading, setCohortsLoading] = useState(false);
  const [cohortsError, setCohortsError] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newInviteCode, setNewInviteCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [selectedCohort, setSelectedCohort] = useState<CohortInfo | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Deep-link / auto-join state
  const [joinNotice, setJoinNotice] = useState<{ type: "success" | "error" | "pending"; msg: string } | null>(null);

  // Auth + profile
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfileLoaded(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfileLoaded(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    const supabase = createClient();
    try {
      const { data } = await supabase
        .from("profiles")
        .select("is_publicly_listed")
        .eq("user_id", userId)
        .single();
      setIsPubliclyListed(data?.is_publicly_listed ?? false);
    } catch {
      // ignore
    } finally {
      setProfileLoaded(true);
    }
  }

  // Default the board sub-tab to the user's active cert (once). Falls back to
  // "global" if the active cert isn't a live/selectable cert.
  useEffect(() => {
    if (boardTabReady) return;
    let cancelled = false;
    (async () => {
      try {
        const st = await db.userState.get(1);
        const active = getActiveCertId(st);
        if (cancelled) return;
        if (liveCerts().some((c) => c.id === active)) setBoardTab(active);
      } catch {
        // keep "global"
      } finally {
        if (!cancelled) setBoardTabReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [boardTabReady]);

  // Load public leaderboard when tab = public and user is signed in.
  // Global tab → XP-ranked; cert tab → that cert's predicted-score-ranked.
  useEffect(() => {
    if (tab !== "public" || !user) return;
    // The loading state tracks this effect's query lifecycle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPublicLoading(true);
    setPublicError(false);
    const load = boardTab === "global"
      ? fetchGlobalLeaderboard(user.id)
      : fetchCertLeaderboard(boardTab, user.id);
    load
      .then((rows) => { setPublicRows(rows); setPublicLoading(false); })
      .catch(() => { setPublicError(true); setPublicLoading(false); });
  }, [tab, user, boardTab]);

  // Load cohorts when tab = cohorts and user is signed in
  useEffect(() => {
    if (tab !== "cohorts" || !user) return;
    loadCohorts();
  }, [tab, user]);

  function loadCohorts() {
    setCohortsLoading(true);
    setCohortsError(false);
    fetchMyCohorts()
      .then((c) => { setCohorts(c); setCohortsLoading(false); })
      .catch(() => { setCohortsError(true); setCohortsLoading(false); });
  }

  async function handleOptInToggle() {
    if (!user) return;
    const supabase = createClient();
    setOptInBusy(true);
    const newVal = !isPubliclyListed;
    try {
      // .select() so we actually detect failures (RLS, 0-row) instead of
      // optimistically flipping the toggle on a silent no-op.
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_publicly_listed: newVal })
        .eq("user_id", user.id)
        .select("is_publicly_listed")
        .single();
      if (error || !data) {
        setJoinNotice({
          type: "error",
          msg: "Couldn't update your listing — please try again. " + (error?.message ?? ""),
        });
        // Re-sync the real state from the DB so the UI matches reality.
        await loadProfile(user.id);
        return;
      }
      setIsPubliclyListed(data.is_publicly_listed);
      const rows = boardTab === "global"
        ? await fetchGlobalLeaderboard(user.id)
        : await fetchCertLeaderboard(boardTab, user.id);
      setPublicRows(rows);
    } catch (e) {
      setJoinNotice({
        type: "error",
        msg: "Couldn't update your listing — please try again.",
      });
      console.warn("[leaderboard] opt-in toggle failed:", e);
    } finally {
      setOptInBusy(false);
    }
  }

  async function handleCreate() {
    if (!createName.trim()) return;
    setCreateBusy(true);
    setCreateError(null);
    setNewInviteCode(null);
    try {
      const code = await createCohort(createName.trim());
      setNewInviteCode(code);
      setCreateName("");
      loadCohorts();
    } catch (e) {
      setCreateError(teamErrorMessage(e, "Failed to create team"));
    } finally {
      setCreateBusy(false);
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return;
    setJoinBusy(true);
    setJoinError(null);
    try {
      await joinCohort(joinCode.trim());
      setJoinCode("");
      loadCohorts();
    } catch (e) {
      setJoinError(teamErrorMessage(e, "Invalid invite code"));
    } finally {
      setJoinBusy(false);
    }
  }

  // Called by JoinParamHandler when user is signed in and a code is present
  async function handleAutoJoin(code: string) {
    try {
      await joinCohort(code);
      setTab("cohorts");
      loadCohorts();
      setJoinNotice({ type: "success", msg: `Joined team! Welcome.` });
      setTimeout(() => setJoinNotice(null), 4000);
    } catch (e) {
      const msg = teamErrorMessage(e, "Could not join team");
      setJoinNotice({ type: "error", msg });
      setTimeout(() => setJoinNotice(null), 5000);
    }
  }

  // Called by JoinParamHandler when user is NOT signed in
  function handlePendingGuest(code: string) {
    setJoinNotice({ type: "pending", msg: code });
  }

  function copyInviteLink(code: string) {
    navigator.clipboard.writeText(inviteUrl(code)).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  async function shareInviteLink(code: string) {
    const url = inviteUrl(code);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Join my Security+ study team",
          text: `Use invite code ${code} to join my Security+ study team on hecz / study.`,
          url,
        });
        return;
      } catch {
        // user dismissed or API error — fall through to clipboard
      }
    }
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(inviteUrl(code)).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const tabStyle = (active: boolean): React.CSSProperties => ({
    height: "32px",
    padding: "0 16px",
    background: active ? "var(--accent)" : "transparent",
    color: active ? "var(--accent-fg)" : "var(--fg-muted)",
    border: active ? "none" : "1px solid var(--border-strong)",
    borderRadius: "var(--r-sm)",
    fontSize: "13px",
    fontWeight: active ? 600 : 400,
    fontFamily: "var(--font-sans)",
    cursor: "pointer",
    transition: "all 150ms",
    whiteSpace: "nowrap",
  });

  const authGate = (mode: "public" | "teams") => (
    <div
      style={{
        padding: "32px 0",
        textAlign: "center",
        color: "var(--fg-muted)",
        fontFamily: "var(--font-sans)",
        fontSize: "14px",
      }}
    >
      <p style={{ marginBottom: "4px", color: "var(--fg)" }}>
        {mode === "teams" ? "Save your profile to create or join teams." : "Save your profile to enter the leaderboard."}
      </p>
      <p style={{ marginBottom: "14px", fontSize: "13px" }}>
        {mode === "teams" ? "Your invite codes, scores, and team rank follow you across devices." : "Your XP, streak, and predicted scores stay synced."}
      </p>
      <Link
        href="/login?next=%2Fleaderboard&claim=guest-slot"
        style={{
          height: "36px",
          padding: "0 16px",
          background: "transparent",
          color: "var(--accent)",
          border: "1px solid var(--accent)",
          borderRadius: "var(--r-sm)",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "var(--font-sans)",
          display: "inline-flex",
          alignItems: "center",
          textDecoration: "none",
        }}
      >
        Create save slot →
      </Link>
    </div>
  );

  const currentUserId = user?.id ?? null;
  const boardCert = boardTab === "global" ? null : getCert(boardTab);

  return (
    <>
      {/* Deep-link handler — reads ?join= and pending localStorage. Dormant when
          Teams are flagged off so invite links don't trigger a hidden tab. */}
      {FLAGS.cohorts && (
        <Suspense fallback={null}>
          <JoinParamHandler
            userId={user === undefined ? undefined : currentUserId}
            onAutoJoin={handleAutoJoin}
            onPendingGuest={handlePendingGuest}
          />
        </Suspense>
      )}

      {FLAGS.cohorts && selectedCohort && user && (
        <CohortDetailModal
          cohort={selectedCohort}
          currentUserId={user.id}
          onClose={() => setSelectedCohort(null)}
          onLeft={() => { setSelectedCohort(null); loadCohorts(); }}
          onDeleted={() => { setSelectedCohort(null); loadCohorts(); }}
        />
      )}

      <div className="space-y-6">
        {/* Pending-guest invite banner (signed-out user arrived via invite link) */}
        {joinNotice?.type === "pending" && (
          <div
            style={{
              background: "rgba(245,166,35,0.08)",
              border: "1px solid rgba(245,166,35,0.4)",
              borderRadius: "var(--r-md)",
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <p style={{ fontSize: "13px", color: "var(--fg)", fontFamily: "var(--font-sans)" }}>
              You&apos;ve been invited to join a study team — sign in to join.
            </p>
            <Link
              href="/login"
              style={{
                height: "32px",
                padding: "0 14px",
                background: "var(--accent)",
                color: "var(--accent-fg)",
                border: "none",
                borderRadius: "var(--r-sm)",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              Sign in →
            </Link>
          </div>
        )}

        {/* Auto-join result notice */}
        {joinNotice && joinNotice.type !== "pending" && (
          <div
            style={{
              background: joinNotice.type === "success" ? "rgba(95,179,124,0.08)" : "rgba(229,92,92,0.08)",
              border: `1px solid ${joinNotice.type === "success" ? "rgba(95,179,124,0.4)" : "rgba(229,92,92,0.4)"}`,
              borderRadius: "var(--r-md)",
              padding: "12px 18px",
            }}
          >
            <p style={{ fontSize: "13px", color: "var(--fg)", fontFamily: "var(--font-sans)" }}>
              {joinNotice.msg}
            </p>
          </div>
        )}

        {/* Page heading */}
        <div>
          <h1
            className="font-display"
            style={{ fontSize: "28px", fontWeight: 400, color: "var(--fg)", marginBottom: "4px" }}
          >
            Leaderboard
          </h1>
          <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
            Predicted exam scores · ranked 100–900
          </p>
        </div>

        {/* Tab switcher — only shown when Teams are enabled; otherwise the board
            is a single public view and the lone tab adds no value. */}
        {FLAGS.cohorts && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={tabStyle(tab === "public")} onClick={() => setTab("public")}>
              Public
            </button>
            <button style={tabStyle(tab === "cohorts")} onClick={() => setTab("cohorts")}>
              Teams
            </button>
          </div>
        )}

        {/* ── PUBLIC TAB ── */}
        {tab === "public" && (
          <div className="space-y-4">
            {user === undefined ? (
              <Section title="Global Rankings">
                <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>Loading…</p>
              </Section>
            ) : user === null ? (
              <Section title="Global Rankings">{authGate("public")}</Section>
            ) : (
              <>
                {/* Opt-in banner */}
                {profileLoaded && (
                  <div
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--r-md)",
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      {isPubliclyListed ? (
                        <>
                          <p style={{ fontSize: "13px", color: "var(--fg)", fontFamily: "var(--font-sans)", marginBottom: "2px" }}>
                            You&apos;re listed on the public leaderboard.
                          </p>
                          <p style={{ fontSize: "12px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
                            Others can see your display name and predicted score.
                          </p>
                        </>
                      ) : (
                        <>
                          <p style={{ fontSize: "13px", color: "var(--fg)", fontFamily: "var(--font-sans)", marginBottom: "2px" }}>
                            You&apos;re not listed publicly.
                          </p>
                          <p style={{ fontSize: "12px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
                            Toggle on to appear on the public board. Set your display name in Settings.
                          </p>
                        </>
                      )}
                    </div>
                    <button
                      onClick={handleOptInToggle}
                      disabled={optInBusy}
                      style={{
                        height: "34px",
                        padding: "0 14px",
                        background: isPubliclyListed ? "transparent" : "var(--accent)",
                        color: isPubliclyListed ? "var(--fg-muted)" : "var(--accent-fg)",
                        border: isPubliclyListed ? "1px solid var(--border-strong)" : "none",
                        borderRadius: "var(--r-sm)",
                        fontSize: "12px",
                        fontWeight: 600,
                        fontFamily: "var(--font-sans)",
                        cursor: "pointer",
                        flexShrink: 0,
                        opacity: optInBusy ? 0.5 : 1,
                      }}
                    >
                      {isPubliclyListed ? "Remove me" : "List me publicly"}
                    </button>
                  </div>
                )}

                {/* Board segmented control: Global (XP) + one tab per live cert */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button style={tabStyle(boardTab === "global")} onClick={() => setBoardTab("global")}>
                    Global
                  </button>
                  {liveCerts().map((c) => (
                    <button key={c.id} style={tabStyle(boardTab === c.id)} onClick={() => setBoardTab(c.id)}>
                      {c.name}
                    </button>
                  ))}
                </div>

                {/* Rankings table */}
                <Section title={boardTab === "global" ? "Global Rankings · by XP" : `${boardCert?.name ?? ""} Rankings`}>
                  {publicLoading ? (
                    <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>Loading…</p>
                  ) : publicError ? (
                    <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
                      Leaderboard temporarily unavailable.
                    </p>
                  ) : publicRows.length === 0 ? (
                    <div>
                      <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: "12px", lineHeight: 1.5 }}>
                        {boardTab === "global"
                          ? (isPubliclyListed
                              ? "You're listed. Finish a quiz to post fresh XP here."
                              : "No one's ranked yet. Finish a quiz, then toggle on above.")
                          : `No one's listed for ${boardCert?.name ?? "this cert"} yet. Finish a quiz to post the first score.`}
                      </p>
                      <Link
                        href="/quiz"
                        style={{
                          height: "34px",
                          padding: "0 14px",
                          background: "var(--accent)",
                          color: "var(--accent-fg)",
                          border: "none",
                          borderRadius: "var(--r-sm)",
                          fontSize: "12px",
                          fontWeight: 600,
                          fontFamily: "var(--font-sans)",
                          display: "inline-flex",
                          alignItems: "center",
                          textDecoration: "none",
                        }}
                      >
                        Take a quiz →
                      </Link>
                    </div>
                  ) : boardTab === "global" ? (
                    <RankTable rows={publicRows} mode="xp" />
                  ) : (
                    <RankTable rows={publicRows} mode="score" passingScore={boardCert?.passingScore ?? 750} />
                  )}
                </Section>
              </>
            )}
          </div>
        )}

        {/* ── TEAMS TAB ── */}
        {FLAGS.cohorts && tab === "cohorts" && (
          <div className="space-y-4">
            {user === undefined ? (
              <Section title="Your Teams">
                <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>Loading…</p>
              </Section>
            ) : user === null ? (
              <Section title="Your Teams">{authGate("teams")}</Section>
            ) : (
              <>
                {/* Create team */}
                <Section title="Create a Team">
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <input
                      type="text"
                      placeholder="Team name (e.g. Security+ Study Team)"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                      maxLength={60}
                      style={{
                        flex: 1,
                        minWidth: "200px",
                        height: "36px",
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--r-sm)",
                        padding: "0 12px",
                        fontSize: "13px",
                        fontFamily: "var(--font-sans)",
                        color: "var(--fg)",
                        background: "var(--bg)",
                      }}
                    />
                    <button
                      onClick={handleCreate}
                      disabled={createBusy || !createName.trim()}
                      style={{
                        height: "36px",
                        padding: "0 16px",
                        background: "var(--accent)",
                        color: "var(--accent-fg)",
                        border: "none",
                        borderRadius: "var(--r-sm)",
                        fontSize: "13px",
                        fontWeight: 600,
                        fontFamily: "var(--font-sans)",
                        cursor: "pointer",
                        opacity: (createBusy || !createName.trim()) ? 0.5 : 1,
                        flexShrink: 0,
                      }}
                    >
                      Create
                    </button>
                  </div>
                  {createError && (
                    <p style={{ fontSize: "12px", color: "var(--error, #e55c5c)", fontFamily: "var(--font-sans)", marginTop: "8px" }}>
                      {createError}
                    </p>
                  )}
                  {newInviteCode && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px 14px",
                        background: "rgba(245,166,35,0.07)",
                        border: "1px solid rgba(245,166,35,0.3)",
                        borderRadius: "var(--r-sm)",
                      }}
                    >
                      <p style={{ fontSize: "12px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: "6px" }}>
                        Team created! Share this invite code:
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          className="font-mono"
                          style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "0.15em", color: "var(--accent)" }}
                        >
                          {newInviteCode}
                        </span>
                        <button
                          onClick={() => copyCode(newInviteCode)}
                          style={{
                            height: "28px",
                            padding: "0 10px",
                            background: "transparent",
                            color: copiedCode === newInviteCode ? "var(--success, #5fb37c)" : "var(--fg-muted)",
                            border: "1px solid var(--border-strong)",
                            borderRadius: "var(--r-sm)",
                            fontSize: "11px",
                            fontFamily: "var(--font-sans)",
                            cursor: "pointer",
                          }}
                        >
                          {copiedCode === newInviteCode ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>
                  )}
                </Section>

                {/* Join team */}
                <Section title="Join a Team">
                  <p style={{ fontSize: "12px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: "10px" }}>
                    Paste the 6-character invite code from your study partner.
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <input
                      type="text"
                      placeholder="K7QM2P"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => { if (e.key === "Enter") handleJoin(); }}
                      maxLength={6}
                      style={{
                        flex: 1,
                        minWidth: "180px",
                        height: "36px",
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--r-sm)",
                        padding: "0 12px",
                        fontSize: "14px",
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.12em",
                        color: "var(--fg)",
                        background: "var(--bg)",
                      }}
                    />
                    <button
                      onClick={handleJoin}
                      disabled={joinBusy || !joinCode.trim()}
                      style={{
                        height: "36px",
                        padding: "0 16px",
                        background: "transparent",
                        color: "var(--fg)",
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--r-sm)",
                        fontSize: "13px",
                        fontFamily: "var(--font-sans)",
                        cursor: "pointer",
                        opacity: (joinBusy || !joinCode.trim()) ? 0.5 : 1,
                        flexShrink: 0,
                      }}
                    >
                      Join
                    </button>
                  </div>
                  {joinError && (
                    <p style={{ fontSize: "12px", color: "var(--error, #e55c5c)", fontFamily: "var(--font-sans)", marginTop: "8px" }}>
                      {joinError}
                    </p>
                  )}
                </Section>

                {/* Team list */}
                <Section title="Your Teams">
                  {cohortsLoading ? (
                    <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>Loading…</p>
                  ) : cohortsError ? (
                    <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
                      Leaderboard temporarily unavailable.
                    </p>
                  ) : cohorts.length === 0 ? (
                    <div>
                      <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", lineHeight: 1.5, marginBottom: "12px" }}>
                        Create or join a team, then take a quiz to put a score on the board.
                      </p>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <Link
                          href="/quiz"
                          style={{
                            height: "34px",
                            padding: "0 14px",
                            background: "var(--accent)",
                            color: "var(--accent-fg)",
                            border: "none",
                            borderRadius: "var(--r-sm)",
                            fontSize: "12px",
                            fontWeight: 600,
                            fontFamily: "var(--font-sans)",
                            display: "inline-flex",
                            alignItems: "center",
                            textDecoration: "none",
                          }}
                        >
                          Take a quiz →
                        </Link>
                        <button
                          onClick={() => {
                            setCreateName(createName || "Security+ Study Team");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          style={{
                            height: "34px",
                            padding: "0 14px",
                            background: "transparent",
                            color: "var(--fg)",
                            border: "1px solid var(--border-strong)",
                            borderRadius: "var(--r-sm)",
                            fontSize: "12px",
                            fontFamily: "var(--font-sans)",
                            cursor: "pointer",
                          }}
                        >
                          Start a team
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {cohorts.map((cohort) => (
                        <div
                          key={cohort.id}
                          style={{
                            border: "1px solid var(--border)",
                            borderRadius: "var(--r-sm)",
                            padding: "14px 16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "12px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--fg)", fontFamily: "var(--font-sans)", marginBottom: "3px" }}>
                              {cohort.name}
                              {cohort.isOwner && (
                                <span
                                  className="font-mono"
                                  style={{
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    letterSpacing: "0.08em",
                                    color: "var(--accent)",
                                    background: "rgba(245,166,35,0.15)",
                                    border: "1px solid rgba(245,166,35,0.4)",
                                    borderRadius: "3px",
                                    padding: "1px 4px",
                                    marginLeft: "6px",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  owner
                                </span>
                              )}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "12px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
                                {cohort.memberCount} member{cohort.memberCount !== 1 ? "s" : ""}
                              </span>
                              <span style={{ fontSize: "12px", color: "var(--fg-subtle)", fontFamily: "var(--font-sans)" }}>·</span>
                              <span
                                className="font-mono"
                                style={{ fontSize: "12px", letterSpacing: "0.1em", color: "var(--fg-muted)" }}
                              >
                                {cohort.inviteCode}
                              </span>
                              <button
                                onClick={() => copyInviteLink(cohort.inviteCode)}
                                style={{
                                  height: "22px",
                                  padding: "0 7px",
                                  background: "transparent",
                                  color: copiedCode === cohort.inviteCode ? "var(--success, #5fb37c)" : "var(--fg-subtle)",
                                  border: "1px solid var(--border-strong)",
                                  borderRadius: "3px",
                                  fontSize: "10px",
                                  fontFamily: "var(--font-sans)",
                                  cursor: "pointer",
                                }}
                              >
                                {copiedCode === cohort.inviteCode ? "Copied!" : "Copy invite link"}
                              </button>
                              <button
                                onClick={() => shareInviteLink(cohort.inviteCode)}
                                style={{
                                  height: "22px",
                                  padding: "0 7px",
                                  background: "transparent",
                                  color: "var(--fg-subtle)",
                                  border: "1px solid var(--border-strong)",
                                  borderRadius: "3px",
                                  fontSize: "10px",
                                  fontFamily: "var(--font-sans)",
                                  cursor: "pointer",
                                }}
                              >
                                Share
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedCohort(cohort)}
                            style={{
                              height: "32px",
                              padding: "0 14px",
                              background: "transparent",
                              color: "var(--accent)",
                              border: "1px solid var(--accent)",
                              borderRadius: "var(--r-sm)",
                              fontSize: "12px",
                              fontWeight: 500,
                              fontFamily: "var(--font-sans)",
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                          >
                            View →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
