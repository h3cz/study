"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Mirrors the desktop IA (NavBar): the same four destinations + Account, with
// section-aware active states so a mode route (e.g. /quiz) lights up Practice.
const inSection = (p: string, roots: string[]) =>
  roots.some((r) => p === r || p.startsWith(r + "/"));

const tabs = [
  {
    href: "/",
    label: "Home",
    match: (p: string) => p === "/",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M2.5 8.33L10 2.5l7.5 5.83V17a.833.833 0 0 1-.833.833H12.5V12.5h-5v5.333H3.333A.833.833 0 0 1 2.5 17V8.33z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/practice",
    label: "Practice",
    match: (p: string) => inSection(p, ["/practice", "/quiz", "/flashcards", "/exam", "/pbq", "/osi", "/ports", "/controls", "/crypto", "/attacks", "/drill", "/review", "/voice", "/import"]),
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/library",
    label: "Library",
    match: (p: string) => inSection(p, ["/library"]),
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M3 15V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10M3 15h6M3 15H2m7 0h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 7h4.5a1 1 0 0 1 1 1v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14.5 15H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14.5 9l2.5 1v5h-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/compete",
    label: "Compete",
    match: (p: string) => inSection(p, ["/compete", "/play", "/leaderboard"]),
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M3 3l6 6M3 5.5V3h2.5M12 12l4.5 4.5M16.5 14v2.5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 3l-6 6M17 5.5V3h-2.5M8 12l-4.5 4.5M3.5 14v2.5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Account",
    match: (p: string) => inSection(p, ["/settings"]),
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3.5 17c0-3.038 2.91-5.5 6.5-5.5s6.5 2.462 6.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

const SUPPRESSED_PATHS = ["/onboarding", "/login"];

export function MobileBottomNav() {
  const pathname = usePathname();
  const suppressed = SUPPRESSED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (suppressed) return null;

  return (
    <nav
      role="navigation"
      aria-label="Primary"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "color-mix(in srgb, var(--bg) 88%, transparent)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderTop: "1px solid var(--border-strong)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      // Tailwind responsive classes (NOT inline display) so sm:hidden wins on desktop.
      className="flex sm:hidden"
    >
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              height: "56px",
              minWidth: "44px",
              color: active ? "var(--accent)" : "var(--fg-muted)",
              textDecoration: "none",
              transition: "color 0.15s ease",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {tab.icon}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
