"use client";

import { useEffect, useState } from "react";
import { getCert, getActiveCertId, DEFAULT_CERT_ID } from "@/lib/certs";
import { db } from "@/lib/db";

interface ShareButtonProps {
  score: number;
  kind: "predicted" | "mock";
  streak?: number;
  passed?: boolean;
  /** Cert this score is for. If omitted, resolved from the active cert. */
  certId?: string;
}

export default function ShareButton({ score, kind, streak, passed, certId }: ShareButtonProps) {
  const [toastVisible, setToastVisible] = useState(false);

  // The share copy + card pass line follow the cert this score is for. Callers
  // pass certId; if they don't, fall back to the user's active cert (then the
  // default). Resolves to Security+ today — identical to before.
  const [resolvedCertId, setResolvedCertId] = useState<string>(certId ?? DEFAULT_CERT_ID);
  useEffect(() => {
    if (certId) {
      const timer = setTimeout(() => setResolvedCertId(certId), 0);
      return () => clearTimeout(timer);
    }
    let cancelled = false;
    db.userState
      .get(1)
      .then((state) => {
        if (!cancelled) setResolvedCertId(getActiveCertId(state ?? undefined));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [certId]);
  const cert = getCert(resolvedCertId);

  function buildCardUrl(): string {
    const params = new URLSearchParams({ score: String(score), kind });
    if (streak !== undefined && streak > 0) params.set("streak", String(streak));
    if (kind === "mock" && passed !== undefined) params.set("passed", String(passed));
    if (resolvedCertId !== DEFAULT_CERT_ID) params.set("cert", resolvedCertId);
    return `/api/share?${params.toString()}`;
  }

  function buildAbsoluteCardUrl(): string {
    if (typeof window === "undefined") return buildCardUrl();
    return `${window.location.origin}${buildCardUrl()}`;
  }

  async function handleShare() {
    const cardUrl = buildAbsoluteCardUrl();
    const shareText =
      `I'm studying for ${cert.fullName} on hecz / study — study.hecz.dev`;

    // Mobile: Web Share API
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `${cert.name} Score: ${score}/${cert.scoreMax}`,
          text: shareText,
          url: cardUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share failed — fall through to clipboard
        if ((err as DOMException).name === "AbortError") return;
      }
    }

    // Desktop: copy app URL + score summary, open card in new tab
    try {
      const clipText = `${cert.name} Score: ${score}/${cert.scoreMax} — study free at https://study.hecz.dev\n${cardUrl}`;
      await navigator.clipboard.writeText(clipText);
    } catch {
      // Clipboard unavailable — still open the card
    }
    window.open(buildCardUrl(), "_blank", "noopener,noreferrer");
    showToast();
  }

  function showToast() {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  }

  return (
    <>
      <button
        onClick={handleShare}
        style={{
          height: "32px",
          padding: "0 14px",
          background: "transparent",
          color: "var(--accent)",
          border: "1px solid var(--accent)",
          borderRadius: "var(--r-sm)",
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: "var(--font-sans)",
          letterSpacing: "0.04em",
          cursor: "pointer",
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          transition: "background 150ms ease-out, color 150ms ease-out",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(245,166,35,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
        aria-label={`Share your ${kind === "mock" ? "mock exam result" : "predicted score"} of ${score}`}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M9 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM4 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM9 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"
            stroke="currentColor"
            strokeWidth="1.25"
          />
          <path
            d="M7.5 3.5 5 5.5M5 7.5l2.5 2"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
        Share
      </button>

      {/* Toast */}
      {toastVisible && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface)",
            color: "var(--fg)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--r-sm)",
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: "var(--font-sans)",
            zIndex: 1000,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          Score card + link copied
        </div>
      )}
    </>
  );
}
