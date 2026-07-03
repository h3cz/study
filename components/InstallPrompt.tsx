"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const DISMISS_KEY = "installDismissedAt";
const VISIT_KEY = "visitCount";
const DISMISS_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const SUPPRESSED_PATHS = ["/leaderboard", "/login", "/onboarding", "/quiz", "/exam", "/drill", "/pbq", "/play/duel"];
const PROMPT_DELAY_MS = 2500;

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
}

function isDismissedRecently(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - parseInt(raw, 10) < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

function incrementVisitCount(): number {
  try {
    const raw = localStorage.getItem(VISIT_KEY);
    const next = (raw ? parseInt(raw, 10) : 0) + 1;
    localStorage.setItem(VISIT_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

export function InstallPrompt() {
  const [show, setShow] = useState<"chrome" | "ios" | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const pathname = usePathname();
  const suppressed = SUPPRESSED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  useEffect(() => {
    if (suppressed) return;
    if (isStandalone()) return;
    if (isDismissedRecently()) return;

    const visits = incrementVisitCount();
    if (visits < 2) return;

    const ios = isIos();

    if (ios) {
      const timer = setTimeout(() => setShow("ios"), PROMPT_DELAY_MS);
      return () => clearTimeout(timer);
    }

    // Chrome / Edge / Android: wait for beforeinstallprompt
    let chromeTimer: number | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleBeforeInstall(e: any) {
      e.preventDefault();
      setDeferredPrompt(e);
      chromeTimer = window.setTimeout(() => setShow("chrome"), PROMPT_DELAY_MS);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      if (chromeTimer !== undefined) window.clearTimeout(chromeTimer);
    };
  }, [suppressed]);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch { /* ignore */ }
    setShow(null);
  }

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShow(null);
  }

  if (!show || suppressed) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: "16px",
        left: "16px",
        marginLeft: "auto",
        zIndex: 60,
        maxWidth: "300px",
        background: "var(--surface)",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--r-md)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        padding: "16px",
        fontFamily: "var(--font-sans)",
      }}
      className="install-prompt-card"
    >
      {show === "ios" ? (
        <p style={{ fontSize: "13px", color: "var(--fg-muted)", lineHeight: 1.5, margin: 0 }}>
          Tap{" "}
          <span style={{ fontWeight: 600, color: "var(--fg)" }}>Share</span>
          {" → "}
          <span style={{ fontWeight: 600, color: "var(--fg)" }}>Add to Home Screen</span>
          {" "}to install{" "}
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>hecz / study</span>.
        </p>
      ) : (
        <p style={{ fontSize: "13px", color: "var(--fg)", lineHeight: 1.5, margin: 0 }}>
          Install{" "}
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>hecz / study</span>
          {" "}— daily CompTIA practice on your home screen.
        </p>
      )}

      <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
        {show === "chrome" && (
          <button
            onClick={install}
            style={{
              flex: 1,
              height: "44px",
              background: "var(--accent)",
              color: "var(--accent-fg)",
              border: "none",
              borderRadius: "var(--r-sm)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            Install
          </button>
        )}
        <button
          onClick={dismiss}
          style={{
            flex: show === "chrome" ? "0 0 auto" : 1,
            height: "44px",
            background: "transparent",
            color: "var(--fg-muted)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--r-sm)",
            fontSize: "12px",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            padding: "0 12px",
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
