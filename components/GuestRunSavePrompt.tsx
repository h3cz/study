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
  kind: "quiz" | "exam" | "drill" | "pbq" | "duel";
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

function kindLabel(kind: GuestRunSavePromptProps["kind"]): string {
  if (kind === "pbq") return "PBQ";
  return kind;
}

export function GuestRunSavePrompt({ runId, kind, details, nextPath }: GuestRunSavePromptProps) {
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

  const href = `/login?next=${encodeURIComponent(nextPath ?? pathname ?? "/")}&claim=guest-run`;

  return (
    <section
      aria-label="Save your run"
      style={{
        border: "1px solid rgba(245,166,35,0.45)",
        background: "rgba(245,166,35,0.08)",
        borderRadius: "var(--r-md)",
        padding: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0, flex: "1 1 260px" }}>
          <p
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: 6,
            }}
          >
            Local progress · {kindLabel(kind)} run
          </p>
          <h2 style={{ fontSize: 18, color: "var(--fg)", fontFamily: "var(--font-sans)", fontWeight: 700, marginBottom: 6 }}>
            Save your run?
          </h2>
          <p style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", lineHeight: 1.55, maxWidth: 560 }}>
            This run is saved on this browser. Create a profile on this device so future XP, streaks,
            predicted scores, teams, reviews, and bookmarks can sync when you sign in.
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
            Save to account
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
            Keep playing
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 10,
          marginTop: 14,
        }}
      >
        {[
          ["Now", "Local slot on this device"],
          ["After save", "Profile tied to this browser"],
          ["Keeps", "XP, streaks, scores, reviews"],
        ].map(([label, text]) => (
          <div key={label} style={{ borderTop: "1px solid rgba(245,166,35,0.28)", paddingTop: 10 }}>
            <div
              className="font-mono"
              style={{ fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}
            >
              {label}
            </div>
            <div style={{ fontSize: 12, color: "var(--fg)", fontFamily: "var(--font-sans)", lineHeight: 1.4 }}>
              {text}
            </div>
          </div>
        ))}
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
