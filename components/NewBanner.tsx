"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * A cute, one-time dismissible announcement. Keyed by `featureId` in
 * localStorage so it shows once per device, then stays gone. Renders nothing
 * until mount (no SSR flash). Reuse for every new feature/trainer.
 */
export function NewBanner({
  featureId,
  href,
  children,
}: {
  featureId: string;
  href: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const key = `new-banner-dismissed:${featureId}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        setShow(localStorage.getItem(key) !== "1");
      } catch {
        setShow(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [key]);

  if (!show) return null;

  function dismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      localStorage.setItem(key, "1");
    } catch {
      // ignore
    }
    setShow(false);
  }

  return (
    <div
      style={{
        position: "relative",
        background: "rgba(245,166,35,0.08)",
        border: "1px solid rgba(245,166,35,0.4)",
        borderRadius: "var(--r-md)",
        padding: "12px 14px",
        marginBottom: 16,
      }}
    >
      <Link
        href={href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          textDecoration: "none",
          color: "var(--fg)",
          fontFamily: "var(--font-sans)",
          fontSize: 13.5,
          paddingRight: 24,
        }}
      >
        <span aria-hidden="true">🆕</span>
        <span style={{ flex: 1 }}>{children}</span>
        <span aria-hidden="true" style={{ color: "var(--accent)", fontWeight: 600, flexShrink: 0 }}>→</span>
      </Link>
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        style={{
          position: "absolute",
          top: 6,
          right: 8,
          width: 24,
          height: 24,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          color: "var(--fg-muted)",
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          borderRadius: "var(--r-sm)",
        }}
      >
        ×
      </button>
    </div>
  );
}

/** Small amber "NEW" pill for cards / nav items. */
export function NewPill() {
  return (
    <span
      className="font-mono"
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "var(--accent)",
        background: "rgba(245,166,35,0.15)",
        border: "1px solid rgba(245,166,35,0.4)",
        borderRadius: 3,
        padding: "1px 5px",
        verticalAlign: "middle",
        marginLeft: 6,
      }}
    >
      NEW
    </span>
  );
}
