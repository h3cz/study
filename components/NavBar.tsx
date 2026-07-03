"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CertSwitcher } from "@/components/CertSwitcher";
import { AccountMenu } from "@/components/AccountMenu";

// Primary IA: four destinations. Practice and Compete are hub pages that group
// the individual modes, so the top bar never needs to scroll. Each tab is
// "active" for any route inside its section (not just the hub URL).
type Section = { href: string; label: string; match: (p: string) => boolean; tour?: string };

const inSection = (p: string, roots: string[]) =>
  roots.some((r) => p === r || p.startsWith(r + "/"));

const SECTIONS: Section[] = [
  { href: "/", label: "Dashboard", match: (p) => p === "/" },
  {
    href: "/practice",
    label: "Practice",
    match: (p) => inSection(p, ["/practice", "/quiz", "/flashcards", "/exam", "/pbq", "/osi", "/ports", "/controls", "/crypto", "/attacks", "/drill", "/review", "/voice", "/import"]),
  },
  { href: "/library", label: "Library", match: (p) => inSection(p, ["/library"]), tour: "nav-library" },
  {
    href: "/compete",
    label: "Compete",
    match: (p) => inSection(p, ["/compete", "/play", "/leaderboard"]),
  },
];

const SUPPRESSED_PATHS = ["/onboarding", "/login"];

function openCommandPalette() {
  // The palette listens for (meta|ctrl)+K globally; dispatch a synthetic event
  // so the in-bar affordance and the keyboard shortcut share one code path.
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
}

export function NavBar() {
  const pathname = usePathname();
  const suppressed = SUPPRESSED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

  if (suppressed) return null;

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-10 backdrop-blur"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "color-mix(in srgb, var(--bg) 85%, transparent)",
      }}
    >
      <div className="max-w-2xl lg:max-w-4xl mx-auto px-4 flex items-center h-12 gap-1 min-w-0">
        {/* Wordmark */}
        <Link
          href="/"
          aria-label="Go to dashboard"
          className="shrink-0 text-sm"
          style={{ color: "var(--fg)", fontFamily: "var(--font-sans)", textDecoration: "none", display: "flex", alignItems: "center" }}
        >
          <span style={{ fontWeight: 500 }}>hecz</span>
          <span style={{ color: "var(--fg-muted)", margin: "0 3px" }}>/</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 400 }}>study</span>
          <span className="wordmark-cursor" aria-hidden="true" />
        </Link>

        {/* Primary tabs — desktop only (mobile uses the bottom nav). Four items,
            no horizontal scroll. */}
        <div className="hidden sm:flex items-center gap-1 ml-4 text-sm">
          {SECTIONS.map((s) => {
            const active = s.match(pathname);
            return (
              <Link
                key={s.href}
                href={s.href}
                className="nav-tab"
                data-active={active}
                aria-current={active ? "page" : undefined}
                {...(s.tour ? { "data-tour": s.tour } : {})}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        {/* Right cluster: command palette (desktop), cert context, account. */}
        <div className="shrink-0 flex items-center gap-2 ml-auto">
          <button
            type="button"
            className="nav-cmdk hidden md:inline-flex"
            onClick={openCommandPalette}
            aria-label="Open command palette"
          >
            <span>Search</span>
            <kbd>⌘K</kbd>
          </button>
          <CertSwitcher />
          <AccountMenu />
        </div>
      </div>
    </nav>
  );
}
