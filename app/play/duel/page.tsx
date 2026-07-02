"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DuelArena } from "@/components/multiplayer/DuelArena";
import { useMe } from "@/lib/multiplayer/use-me";

export default function DuelPage() {
  return (
    <Suspense fallback={null}>
      <DuelInner />
    </Suspense>
  );
}

function DuelInner() {
  const params = useSearchParams();
  const matchId = params.get("match");
  const { me, signedIn } = useMe();
  const loginHref = matchId
    ? `/login?next=${encodeURIComponent(`/play/duel?match=${matchId}`)}`
    : "/login?next=%2Fplay";

  if (signedIn === false) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 16px", textAlign: "center" }}>
        <h1 className="sr-only">Duel</h1>
        <p style={{ fontFamily: "var(--font-sans)", color: "var(--fg-muted)", marginBottom: 16 }}>
          Sign in to play.
        </p>
        <Link href={loginHref} style={{ color: "var(--accent)", fontFamily: "var(--font-sans)", textDecoration: "none" }}>
          Sign in →
        </Link>
      </div>
    );
  }

  if (!matchId) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 16px", textAlign: "center" }}>
        <h1 className="sr-only">Duel</h1>
        <p style={{ fontFamily: "var(--font-sans)", color: "var(--fg-muted)" }}>No duel specified.</p>
        <Link href="/play" style={{ color: "var(--accent)", fontFamily: "var(--font-sans)", textDecoration: "none" }}>
          ← Back to Versus
        </Link>
      </div>
    );
  }

  if (!me) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "48px 16px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
        Loading…
      </div>
    );
  }

  return <DuelArena key={matchId} me={me} matchId={matchId} />;
}
