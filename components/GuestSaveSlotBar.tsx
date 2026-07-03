"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { db } from "@/lib/db";
import { maybeSendGuestHeartbeat } from "@/lib/guest-save-slot";

function savedDateLabel(lastStudyDate: string | undefined): string | null {
  if (!lastStudyDate) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (lastStudyDate === today) return "saved today";
  return `saved ${lastStudyDate}`;
}

const SUPPRESSED_PATHS = ["/onboarding", "/login"];

export function GuestSaveSlotBar() {
  const pathname = usePathname();
  const [signedOut, setSignedOut] = useState(false);
  const [xp, setXp] = useState<number | null>(null);
  const [lastSavedLabel, setLastSavedLabel] = useState<string | null>(null);
  const suppressed = SUPPRESSED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  useEffect(() => {
    if (suppressed) {
      return;
    }

    let cancelled = false;
    async function loadGuestState() {
      let hasSession = false;
      try {
        const { data } = await createClient().auth.getSession();
        hasSession = !!data.session;
      } catch {
        hasSession = false;
      }

      if (cancelled || hasSession) {
        if (!cancelled) setSignedOut(false);
        return;
      }

      setSignedOut(true);
      try {
        const state = await db.userState.get(1);
        if (!cancelled) {
          setXp(state?.xp ?? 0);
          setLastSavedLabel(savedDateLabel(state?.lastStudyDate));
        }
      } catch {
        if (!cancelled) {
          setXp(null);
          setLastSavedLabel(null);
        }
      }

      try {
        maybeSendGuestHeartbeat(pathname || "/");
      } catch {
        // Guest save-slot UI should never block study flows.
      }
    }

    void loadGuestState();
    return () => {
      cancelled = true;
    };
  }, [pathname, suppressed]);

  if (!signedOut || suppressed) return null;

  const next = encodeURIComponent(pathname || "/");
  const detail =
    xp && xp > 0
      ? `${xp.toLocaleString()} XP on this device${lastSavedLabel ? ` · ${lastSavedLabel}` : ""}`
      : "Progress saves on this device";

  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div
        className="max-w-2xl lg:max-w-4xl mx-auto px-4"
        style={{
          minHeight: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          paddingTop: 8,
          paddingBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
          <span
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--accent)",
              whiteSpace: "nowrap",
            }}
          >
            Local progress
          </span>
          <span
            style={{
              fontSize: 12,
              color: "var(--fg-muted)",
              fontFamily: "var(--font-sans)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {detail}
          </span>
        </div>
        <Link
          href={`/login?next=${next}&claim=guest-slot`}
          style={{
            height: 28,
            padding: "0 10px",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--r-sm)",
            color: "var(--fg)",
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            display: "inline-flex",
            alignItems: "center",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          Save to account
        </Link>
      </div>
    </div>
  );
}
