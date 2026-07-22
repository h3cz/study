"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { recordGuestSavePrompt } from "@/lib/guest-save-slot";

export interface RunSaveDetail {
  label: string;
  value: string;
  tone?: "accent" | "success" | "error" | "muted";
}

interface GuestRunSavePromptProps {
  runId: string;
  details: RunSaveDetail[];
  nextPath?: string;
}

const DISMISS_PREFIX = "hecz.study.saveRun.dismissed.";

function toneColor(tone: RunSaveDetail["tone"]): string {
  if (tone === "success") return "var(--success)";
  if (tone === "error") return "var(--error)";
  if (tone === "muted") return "var(--fg-muted)";
  return "var(--accent)";
}

export function GuestRunSavePrompt({ runId, details, nextPath }: GuestRunSavePromptProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const shownLogged = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { data } = await createClient().auth.getSession();
        if (cancelled || data.session) {
          if (!cancelled) setVisible(false);
          return;
        }

        const dismissed = localStorage.getItem(`${DISMISS_PREFIX}${runId}`);
        if (!cancelled) setVisible(dismissed !== "1");
      } catch {
        if (!cancelled) setVisible(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [runId]);

  useEffect(() => {
    if (!visible || shownLogged.current) return;
    shownLogged.current = true;
    try {
      recordGuestSavePrompt("shown", pathname || "/");
    } catch {
      // Metrics should never interfere with the save prompt.
    }
  }, [pathname, visible]);

  if (!visible) return null;

  const href = `/login?next=${encodeURIComponent(nextPath ?? pathname ?? "/")}&claim=save-progress`;

  return (
    <section
      aria-label="Save your progress"
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface)",
        borderRadius: "var(--r-md)",
        padding: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: "1 1 260px" }}>
          <h2 style={{ fontSize: 18, color: "var(--fg)", fontFamily: "var(--font-sans)", fontWeight: 700, marginBottom: 6 }}>
            Keep your progress
          </h2>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", lineHeight: 1.55, maxWidth: 560 }}>
            Sign in to save your XP, streaks, scores, reviews, and bookmarks across devices.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <Link
            href={href}
            onClick={() => {
              try {
                recordGuestSavePrompt("clicked", pathname || "/");
              } catch {
                // Save-click metrics are best-effort.
              }
            }}
            style={{
              height: 40,
              padding: "0 16px",
              background: "var(--accent)",
              color: "var(--accent-fg)",
              borderRadius: "var(--r-sm)",
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "var(--font-sans)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Sign in to save
          </Link>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(`${DISMISS_PREFIX}${runId}`, "1");
              setVisible(false);
            }}
            style={{
              height: 40,
              padding: "0 14px",
              background: "transparent",
              color: "var(--fg)",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--border-strong)",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
            }}
          >
            Not now
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))", gap: 10, marginTop: 14 }}>
        {details.map((detail) => (
          <div key={`${detail.label}:${detail.value}`} style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
            <div
              className="font-mono"
              style={{ fontSize: 15, color: toneColor(detail.tone), fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
            >
              {detail.value}
            </div>
            <div style={{ marginTop: 3, fontSize: 10, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {detail.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
