"use client";

import { useEffect, useState } from "react";

/**
 * Detect common in-app browsers that block IndexedDB / cookies and break the app.
 * Returns one of: "instagram" | "facebook" | "tiktok" | "twitter" | "linkedin"
 *               | "snapchat" | "discord" | "imessage" | "line" | "wechat"
 *               | "other" | null
 */
function detectInAppBrowser(): string | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent || "";
  // Order matters — more specific first
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";
  if (/Messenger/i.test(ua)) return "facebook"; // Messenger uses similar webview
  if (/Twitter|TwitterAndroid/i.test(ua)) return "twitter";
  if (/TikTok|musical_ly/i.test(ua)) return "tiktok";
  if (/LinkedInApp/i.test(ua)) return "linkedin";
  if (/Snapchat/i.test(ua)) return "snapchat";
  if (/DiscordBot|discord/i.test(ua)) return "discord";
  if (/Line\//i.test(ua)) return "line";
  if (/MicroMessenger/i.test(ua)) return "wechat";
  // iMessage / Apple Mail webviews: iOS Safari WebView without Safari ("Version/")
  // signature, but with AppleWebKit. Detect generic iOS in-app webview.
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const hasSafari = /Safari\//i.test(ua) && /Version\//i.test(ua);
  if (isIOS && !hasSafari && /AppleWebKit/i.test(ua)) return "other";
  return null;
}

const NAMES: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  snapchat: "Snapchat",
  discord: "Discord",
  line: "LINE",
  wechat: "WeChat",
  other: "an in-app browser",
};

export function InAppBrowserBanner() {
  const [which, setWhich] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWhich(detectInAppBrowser());
      try {
        if (localStorage.getItem("inAppBannerDismissed") === "1") {
          setDismissed(true);
        }
      } catch {
        // localStorage may also be locked down in some webviews — ignore
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!which || dismissed) return null;

  const url = typeof window !== "undefined" ? window.location.href : "https://study.hecz.dev";
  const name = NAMES[which] ?? "an in-app browser";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // some webviews block clipboard — fall back to a visible textarea
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // give up
      }
      document.body.removeChild(ta);
    }
  };

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "var(--accent)",
        color: "var(--accent-fg)",
        padding: "10px 14px",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        lineHeight: 1.4,
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong>Open in Safari or Chrome.</strong>{" "}
        You&apos;re viewing inside {name}. The app needs offline storage that in-app
        browsers block. Tap the share/menu icon and pick <strong>Open in Safari</strong>{" "}
        (or Chrome on Android).
      </div>
      <button
        type="button"
        onClick={copy}
        style={{
          border: "1px solid var(--accent-fg)",
          background: "transparent",
          color: "var(--accent-fg)",
          padding: "4px 10px",
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Copy link
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          setDismissed(true);
          try {
            localStorage.setItem("inAppBannerDismissed", "1");
          } catch {
            // ignore
          }
        }}
        style={{
          border: "none",
          background: "transparent",
          color: "var(--accent-fg)",
          fontSize: 18,
          lineHeight: 1,
          cursor: "pointer",
          padding: "0 4px",
        }}
      >
        ×
      </button>
    </div>
  );
}
