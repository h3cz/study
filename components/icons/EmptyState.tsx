/**
 * EmptyState — minimal amber line-art spot illustrations.
 * ~64×64 viewBox, 1.5px stroke, currentColor for structure, amber accent
 * for one detail per illustration via inline style override on the accent path.
 * Variants map to empty queue states across the app.
 */
import type { ReactElement } from "react";

type EmptyStateVariant =
  | "no-wrong-answers"   // review/page.tsx — target with checkmark (queue cleared)
  | "all-caught-up"      // quiz/page.tsx fsrs-empty — calm checkmark-in-circle
  | "first-quiz"         // dashboard — compass / starting flag
  | "no-search-results"  // library search — magnifier with dash
  | "no-sources";        // library sources — play-triangle in frame

interface EmptyStateProps {
  variant: EmptyStateVariant;
  size?: number;
}

// Target with checkmark — "you've cleared the wrong-answer queue"
function NoWrongAnswers() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Outer ring */}
      <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="1.5" />
      {/* Middle ring */}
      <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="1.5" />
      {/* Inner target dot */}
      <circle cx="32" cy="32" r="6" stroke="currentColor" strokeWidth="1.5" />
      {/* Crosshair lines */}
      <line x1="32" y1="4" x2="32" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="50" x2="32" y2="60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="32" x2="14" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="32" x2="60" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Amber checkmark in center */}
      <path
        d="M27 32l3.5 3.5 6.5-7"
        stroke="#F5A623"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Calm checkmark in circle — "all caught up, come back tomorrow"
function AllCaughtUp() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Circle */}
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1.5" />
      {/* Stack of lines (tidy deck) */}
      <line x1="22" y1="25" x2="42" y2="25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="31" x2="38" y2="31" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Amber checkmark on bottom */}
      <path
        d="M24 38l5 5 11-10"
        stroke="#F5A623"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Compass / starting flag — "begin the journey"
function FirstQuiz() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Compass outer ring */}
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="1.5" />
      {/* Compass inner ring (subtle) */}
      <circle cx="32" cy="32" r="3" stroke="currentColor" strokeWidth="1.5" />
      {/* Cardinal tick marks */}
      <line x1="32" y1="8" x2="32" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="32" y1="50" x2="32" y2="56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="32" x2="14" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="32" x2="56" y2="32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* N label */}
      <path d="M30 17v5l2-3 2 3v-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Amber compass needle — pointing NE */}
      <path
        d="M32 32L39 19"
        stroke="#F5A623"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* South needle */}
      <path
        d="M32 32L25 45"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Magnifier with a dash — "no search results"
function NoSearchResults() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Lens circle */}
      <circle cx="27" cy="27" r="16" stroke="currentColor" strokeWidth="1.5" />
      {/* Handle */}
      <line x1="38.5" y1="38.5" x2="52" y2="52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Amber dash inside lens (no result) */}
      <line
        x1="21"
        y1="27"
        x2="33"
        y2="27"
        stroke="#F5A623"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Play triangle in a frame — "no video sources"
function NoSources() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Screen frame */}
      <rect x="8" y="14" width="48" height="32" rx="3" stroke="currentColor" strokeWidth="1.5" />
      {/* Stand */}
      <line x1="32" y1="46" x2="32" y2="54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="54" x2="42" y2="54" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Amber play triangle */}
      <path
        d="M26 22l16 8-16 8V22z"
        stroke="#F5A623"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const VARIANTS: Record<EmptyStateVariant, () => ReactElement> = {
  "no-wrong-answers": NoWrongAnswers,
  "all-caught-up": AllCaughtUp,
  "first-quiz": FirstQuiz,
  "no-search-results": NoSearchResults,
  "no-sources": NoSources,
};

export function EmptyState({ variant, size = 64 }: EmptyStateProps) {
  const Illustration = VARIANTS[variant];
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        opacity: 0.7,
        width: size,
        height: size,
        color: "var(--fg-subtle)",
      }}
    >
      <Illustration />
    </span>
  );
}
