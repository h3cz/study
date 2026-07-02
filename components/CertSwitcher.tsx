"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { db } from "@/lib/db";
import { liveCerts, getCert, getActiveCertId, type CertMeta } from "@/lib/certs";

/**
 * CertSwitcher — the single, app-wide control for picking the active CompTIA
 * certification. Shows the current cert compactly (mono version code + short
 * name) with a dropdown affordance; clicking opens a popover listing every live
 * cert. Selecting writes userState.activeCertId (merged, never clobbering other
 * fields) and HARD-NAVIGATES to "/" so every per-page content-load effect
 * re-runs against the new cert.
 *
 * Terminal-Editorial: warm paper surface, restrained borders, JetBrains Mono
 * micro-labels, amber accent for the active row.
 *
 * `variant="bar"` is the compact NavBar trigger. `variant="panel"` renders the
 * open list inline (no trigger/popover) for embedding in Settings, so there is
 * ONE coherent cert-selection design across the app.
 */

type Variant = "bar" | "panel";

export function CertSwitcher({ variant = "bar" }: { variant?: Variant }) {
  if (variant === "panel") return <CertPanel />;
  return <CertBar />;
}

// ─── Shared row ───────────────────────────────────────────────────────────────

function CertRow({
  cert,
  active,
  onSelect,
  pending,
}: {
  cert: CertMeta;
  active: boolean;
  onSelect: (id: string) => void;
  pending: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={active}
      aria-current={active ? "true" : undefined}
      disabled={pending}
      onClick={() => onSelect(cert.id)}
      className="cert-switcher-row"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        background: active ? "rgba(245,166,35,0.08)" : "transparent",
        border: "1px solid",
        borderColor: active ? "var(--accent)" : "transparent",
        borderRadius: "var(--r-sm)",
        cursor: pending ? "default" : "pointer",
        fontFamily: "var(--font-sans)",
        opacity: pending && !active ? 0.6 : 1,
      }}
    >
      {/* Check column — keeps text left edges aligned whether checked or not */}
      <span
        aria-hidden="true"
        style={{
          width: 14,
          flexShrink: 0,
          marginTop: 2,
          color: "var(--accent)",
          display: "inline-flex",
          justifyContent: "center",
        }}
      >
        {active && (
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 4.5 6.5 11 3 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: active ? 600 : 500,
              color: active ? "var(--accent)" : "var(--fg)",
            }}
          >
            {cert.name}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.04em",
              color: "var(--fg-muted)",
            }}
          >
            {cert.version}
          </span>
        </span>
        <span
          style={{
            display: "block",
            fontSize: 12,
            color: "var(--fg-muted)",
            marginTop: 2,
            lineHeight: 1.4,
          }}
        >
          {cert.tagline}
        </span>
      </span>
    </button>
  );
}

// ─── Persistence ──────────────────────────────────────────────────────────────

/** Merge-write the active cert id, then hard-navigate so the whole app retargets. */
async function commitCert(id: string) {
  try {
    const fresh = await db.userState.get(1);
    if (fresh) {
      await db.userState.put({ ...fresh, activeCertId: id });
    } else {
      // No state yet (pre-onboarding) — create the singleton with sane defaults.
      await db.userState.put({
        id: 1,
        xp: 0,
        level: 0,
        streak: 0,
        totalStudyDays: 0,
        activeCertId: id,
      });
    }
  } finally {
    // Hard navigation: a router.push won't reliably re-run per-page content-load
    // effects, so reload the whole app rooted at the dashboard.
    window.location.assign("/");
  }
}

// ─── Bar variant (NavBar trigger + popover) ─────────────────────────────────────

function CertBar() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [mounted, setMounted] = useState(false);
  // Trigger position captured on open so the portaled popover can anchor under
  // it (the popover is rendered to document.body to escape the NavBar's
  // backdrop-filter, which would otherwise trap fixed/absolute children).
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const openMenu = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) setAnchor({ top: r.bottom + 8, right: Math.max(12, window.innerWidth - r.right) });
    setOpen(true);
  }, []);

  useEffect(() => {
    let alive = true;
    db.userState
      .get(1)
      .then((s) => {
        if (alive) setActiveId(getActiveCertId(s ?? undefined));
      })
      .catch(() => {
        if (alive) setActiveId(getActiveCertId());
      });
    return () => {
      alive = false;
    };
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Escape + close-on-scroll. Outside-click is handled by the portaled backdrop
  // below (the popover is rendered to document.body, so it's no longer inside
  // rootRef — a document mousedown check would wrongly fire on the popover).
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        close();
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
    };
  }, [open, close]);

  function handleSelect(id: string) {
    if (pending) return;
    if (id === activeId) {
      close();
      return;
    }
    setPending(true);
    commitCert(id);
  }

  // Resolve the current cert (defaults to Security+ when unset).
  const cert = getCert(activeId ?? "");
  const certs = liveCerts();

  return (
    <div ref={rootRef} style={{ position: "relative" }} data-tour="cert-switcher">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Active certification: ${cert.fullName}. Change certification.`}
        onClick={() => (open ? close() : openMenu())}
        className="cert-switcher-trigger"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          height: 32,
          padding: "0 9px",
          background: "transparent",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--r-sm)",
          cursor: "pointer",
          color: "var(--fg)",
          fontFamily: "var(--font-sans)",
          lineHeight: 1,
          maxWidth: "44vw",
        }}
      >
        {/* Amber tick — the "you are studying" dot */}
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            borderRadius: 1,
            background: "var(--accent)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.03em",
            color: "var(--fg)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {cert.version}
        </span>
        {/* Short name — hidden on the tightest phones to stay compact */}
        <span
          className="cert-switcher-name"
          style={{
            fontSize: 12,
            color: "var(--fg-muted)",
            whiteSpace: "nowrap",
          }}
        >
          {cert.name}
        </span>
        <svg
          aria-hidden="true"
          width="10"
          height="10"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            color: "var(--fg-muted)",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
          }}
          className="cert-switcher-chevron"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && mounted && anchor && createPortal(
        <>
          {/* Backdrop + popover are portaled to <body> so they escape the
              NavBar's backdrop-filter, which creates a containing block that
              would otherwise trap these fixed children to the ~48px nav strip
              (leaving the page undimmed and the menu bleeding over content). */}
          <div
            aria-hidden="true"
            onClick={close}
            style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.4)" }}
          />
          <div
            role="menu"
            id={menuId}
            aria-label="Choose certification"
            className="cert-switcher-popover"
            style={{
              position: "fixed",
              top: anchor.top,
              right: anchor.right,
              zIndex: 1001,
            // Cap width so the right-anchored popover never overflows the left
            // edge (keeps a 12px left margin on narrow screens).
            width: `min(320px, calc(100vw - ${anchor.right + 12}px))`,
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--r-md)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            padding: 8,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
              padding: "4px 12px 8px",
              margin: 0,
            }}
          >
            Active certification
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {certs.map((c) => (
              <CertRow
                key={c.id}
                cert={c}
                active={c.id === (activeId ?? cert.id)}
                onSelect={handleSelect}
                pending={pending}
              />
            ))}
          </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

// ─── Panel variant (Settings embed) ─────────────────────────────────────────────

function CertPanel() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let alive = true;
    db.userState
      .get(1)
      .then((s) => {
        if (alive) setActiveId(getActiveCertId(s ?? undefined));
      })
      .catch(() => {
        if (alive) setActiveId(getActiveCertId());
      });
    return () => {
      alive = false;
    };
  }, []);

  function handleSelect(id: string) {
    if (pending || id === activeId) return;
    setPending(true);
    commitCert(id);
  }

  const cert = getCert(activeId ?? "");
  const certs = liveCerts();

  return (
    <div role="radiogroup" aria-label="Active certification" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {certs.map((c) => (
        <CertRow
          key={c.id}
          cert={c}
          active={c.id === (activeId ?? cert.id)}
          onSelect={handleSelect}
          pending={pending}
        />
      ))}
      <p
        style={{
          fontSize: 12,
          color: "var(--fg-muted)",
          fontFamily: "var(--font-sans)",
          marginTop: 6,
        }}
      >
        Switching reloads the app so every page retargets the new cert.
      </p>
    </div>
  );
}
