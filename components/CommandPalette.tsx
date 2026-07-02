"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Action = {
  label: string;
  href: string;
  keywords: string[];
};

const ACTIONS: Action[] = [
  { label: "Daily Quiz", href: "/quiz", keywords: ["practice", "questions", "weak"] },
  { label: "Review Misses", href: "/review", keywords: ["wrong", "missed", "mistakes"] },
  { label: "Error Notebook", href: "/notebook", keywords: ["mistakes", "overconfident", "weak", "analysis", "clusters"] },
  { label: "Mock Exam", href: "/exam", keywords: ["test", "simulation", "timed"] },
  { label: "Exam Readiness", href: "/timeline", keywords: ["timeline", "plan", "ready", "schedule", "countdown"] },
  { label: "Flashcards", href: "/flashcards", keywords: ["cards", "spaced", "fsrs", "due"] },
  { label: "Acronym Drill", href: "/drill", keywords: ["rapid", "acronyms"] },
  { label: "PBQs", href: "/pbq", keywords: ["performance", "hands-on"] },
  { label: "Versus", href: "/play", keywords: ["duel", "multiplayer", "compete", "co-study"] },
  { label: "Leaderboard", href: "/leaderboard", keywords: ["rank", "board"] },
  { label: "Library", href: "/library", keywords: ["objectives", "videos", "resources"] },
  { label: "Practice", href: "/practice", keywords: ["modes", "study", "hub"] },
  { label: "Compete", href: "/compete", keywords: ["versus", "leaderboard", "duel"] },
  { label: "Changelog", href: "/changelog", keywords: ["release", "updates", "whats new", "lab"] },
  { label: "Dashboard", href: "/", keywords: ["home", "today"] },
  { label: "Settings", href: "/settings", keywords: ["profile", "preferences"] },
];

function matches(action: Action, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = (action.label + " " + action.keywords.join(" ")).toLowerCase();
  // Subsequence (fuzzy) match against the combined label + keywords string.
  let i = 0;
  for (const ch of haystack) {
    if (ch === q[i]) i++;
    if (i === q.length) return true;
  }
  // Fall back to a plain substring match so multi-word queries still hit.
  return haystack.includes(q);
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => ACTIONS.filter((a) => matches(a, query)),
    [query],
  );

  const reset = useCallback(() => {
    setQuery("");
    setHighlight(0);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    reset();
  }, [reset]);

  const run = useCallback(
    (action: Action) => {
      router.push(action.href);
      close();
    },
    [router, close],
  );

  // Global shortcut: ⌘K / Ctrl+K toggles the palette. Intentionally a bespoke
  // window listener — the shared useKeyboardShortcuts hook suppresses modifier
  // keys, which is the opposite of what we need here.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (prev) {
            reset();
            return false;
          }
          reset();
          return true;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reset]);

  // Focus the input whenever the palette opens.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  // Clamp during render so a narrowing query can never point past the list.
  const activeIndex =
    filtered.length === 0 ? 0 : Math.min(highlight, filtered.length - 1);

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filtered.length > 0) setHighlight((activeIndex + 1) % filtered.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filtered.length > 0)
        setHighlight((activeIndex - 1 + filtered.length) % filtered.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const action = filtered[activeIndex];
      if (action) run(action);
    }
  };

  return (
    <div
      role="presentation"
      onMouseDown={(e) => {
        // Backdrop click closes; clicks on the panel are stopped below.
        if (e.target === e.currentTarget) close();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "12vh 16px 16px",
        background: "color-mix(in srgb, var(--bg) 55%, rgba(0, 0, 0, 0.55))",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onPanelKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--surface)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--r-md)",
          overflow: "hidden",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.4)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <div style={{ borderBottom: "1px solid var(--border)" }}>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlight(0);
            }}
            aria-label="Search commands"
            placeholder="Jump to… or search"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 16px",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--fg)",
              fontFamily: "var(--font-mono)",
              fontSize: "15px",
            }}
          />
        </div>

        <div
          role="listbox"
          style={{
            maxHeight: "min(420px, 60vh)",
            overflowY: "auto",
            padding: "6px",
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "16px",
                color: "var(--fg-subtle)",
                fontSize: "14px",
                fontFamily: "var(--font-mono)",
              }}
            >
              No matches
            </div>
          ) : (
            filtered.map((action, i) => {
              const active = i === activeIndex;
              return (
                <button
                  key={action.href}
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => run(action)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    cursor: "pointer",
                    background: active
                      ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                      : "transparent",
                    border: "none",
                    borderLeft: active
                      ? "2px solid var(--accent)"
                      : "2px solid transparent",
                    borderRadius: "var(--r-sm)",
                    color: "var(--fg)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "14px",
                  }}
                >
                  <span>{action.label}</span>
                  <span
                    style={{
                      color: "var(--fg-subtle)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "12px",
                    }}
                  >
                    {action.href}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "8px 14px",
            color: "var(--fg-subtle)",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
          }}
        >
          <span aria-hidden="true">↑↓</span> navigate ·{" "}
          <span aria-hidden="true">↵</span> open ·{" "}
          <span aria-hidden="true">esc</span> close
        </div>
      </div>
    </div>
  );
}
