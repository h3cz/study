"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { hydrateFromRemote, flush, registerOnlineListener } from "@/lib/sync/engine";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";
import { maybeClaimGuestDevice } from "@/lib/guest-save-slot";

/**
 * Unified account control: the avatar trigger collapses what used to be three
 * separate top-bar items (theme toggle, Settings link, sign-out form) into one
 * dropdown, plus an owner-only Admin link.
 *
 * IMPORTANT: this component also owns the app's session bootstrap (flush +
 * hydrateFromRemote on mount and on auth-state-change) — that logic moved here
 * verbatim from the old AuthButton and must keep running on every page, since
 * the menu is always mounted in the nav.
 */
export function AccountMenu() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // No mount guard needed: the theme-dependent label only renders inside the
  // dropdown, which is never open during SSR/hydration, so there's no mismatch.
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");
  // Global `t` toggles theme (unchanged from the old ThemeToggle).
  useKeyboardShortcuts({ t: () => toggleTheme() });

  // ── Session bootstrap (moved verbatim from AuthButton) ──────────────────────
  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setReady(true);
      if (u) {
        try {
          maybeClaimGuestDevice(u.id);
        } catch {
          // Guest attribution should never block account bootstrap.
        }
        flush()
          .catch(() => {})
          .finally(() => {
            hydrateFromRemote(u.id)
              .then((imported) => {
                if (imported > 0 && typeof window !== "undefined") window.location.reload();
              })
              .catch(() => {});
          });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      // Reset owner status on any auth change; the probe effect re-checks for the
      // new user. Closes the window where a previous admin's link could flash for
      // a different account that signs in without a full reload.
      setIsAdmin(false);
      if (nextUser) {
        try {
          maybeClaimGuestDevice(nextUser.id);
        } catch {
          // Guest attribution should never block account bootstrap.
        }
        flush()
          .catch(() => {})
          .finally(() => {
            hydrateFromRemote(nextUser.id)
              .then((imported) => {
                if (imported > 0 && typeof window !== "undefined") window.location.reload();
              })
              .catch(() => {});
          });
      }
    });

    const removeOnlineListener = registerOnlineListener();
    return () => {
      subscription.unsubscribe();
      removeOnlineListener();
    };
  }, []);

  // Owner-only Admin link: probe the capability for signed-in users only. (When
  // signed out the dropdown isn't rendered at all, so isAdmin needs no reset.)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetch("/api/admin/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (!cancelled) setIsAdmin(!!d?.isAdmin); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!ready) return <div style={{ width: 28, height: 28 }} />;

  const loginHref = pathname === "/login" ? "/login" : `/login?next=${encodeURIComponent(pathname)}`;

  if (!user) {
    return (
      <Link
        href={loginHref}
        className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
      >
        Sign in
      </Link>
    );
  }

  const initial = (user.email?.[0] ?? "?").toUpperCase();

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        data-tour="theme-toggle"
        onClick={() => setOpen((v) => !v)}
        className="nav-avatar"
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1px solid var(--border-strong)",
          background: "var(--surface)",
          color: "var(--fg)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          lineHeight: 1,
        }}
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            minWidth: 200,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            boxShadow: "0 8px 28px color-mix(in srgb, var(--fg) 12%, transparent)",
            padding: 6,
            zIndex: 60,
          }}
        >
          <div
            style={{
              padding: "6px 10px 8px",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--fg-subtle)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.email}
          </div>

          <button type="button" role="menuitem" onClick={() => { toggleTheme(); }} className="acct-item" style={itemStyle}>
            <span>{isDark ? "Light mode" : "Dark mode"}</span>
            <span aria-hidden style={{ color: "var(--fg-subtle)", fontFamily: "var(--font-mono)", fontSize: 11 }}>t</span>
          </button>

          <Link href="/settings" role="menuitem" onClick={() => setOpen(false)} className="acct-item" style={itemStyle}>
            Settings
          </Link>

          {isAdmin && (
            <Link href="/admin" role="menuitem" onClick={() => setOpen(false)} className="acct-item" style={itemStyle}>
              Admin
            </Link>
          )}

          <Link href="/credits" role="menuitem" onClick={() => setOpen(false)} className="acct-item" style={itemStyle}>
            Credits &amp; sources
          </Link>

          <div style={{ height: 1, background: "var(--border)", margin: "6px 4px" }} />

          <form action="/auth/logout" method="POST" style={{ margin: 0 }}>
            <button type="submit" role="menuitem" className="acct-item" style={{ ...itemStyle, width: "100%", color: "var(--fg-muted)" }}>
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const itemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  width: "100%",
  textAlign: "left",
  background: "transparent",
  border: "none",
  borderRadius: "var(--r-sm)",
  padding: "8px 10px",
  fontFamily: "var(--font-sans)",
  fontSize: 13,
  color: "var(--fg)",
  textDecoration: "none",
  cursor: "pointer",
};
