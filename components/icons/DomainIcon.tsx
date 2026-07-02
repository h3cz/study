/**
 * DomainIcon — one minimal line-icon per Sec+ SY0-701 domain.
 * 24×24 viewBox, 1.5px stroke, strokeLinecap="round", strokeLinejoin="round",
 * stroke="currentColor" fill="none" — matches MobileBottomNav icon language.
 * aria-hidden="true" on every glyph (domain name is always adjacent).
 */
import type { ReactElement } from "react";

interface DomainIconProps {
  domain: 1 | 2 | 3 | 4 | 5;
  className?: string;
  size?: number;
}

// Domain 1 — General Security Concepts → shield outline
function ShieldIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 3L4 6.5V12c0 4 3.5 7.2 8 8.5 4.5-1.3 8-4.5 8-8.5V6.5L12 3z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Domain 2 — Threats, Vulnerabilities & Mitigations → bug / pathogen
function BugIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Body */}
      <ellipse cx="12" cy="13" rx="4" ry="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Head */}
      <circle cx="12" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
      {/* Antennae */}
      <path d="M10 5.5L8.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 5.5L15.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Legs */}
      <path d="M8 11H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 13H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 15H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 11H18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 13H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 15H18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Domain 3 — Security Architecture → blueprint / layered stack
function StackIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Bottom layer */}
      <path
        d="M4 17l8 3.5 8-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Middle layer */}
      <path
        d="M4 13l8 3.5 8-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top layer */}
      <path
        d="M4 9l8-3.5 8 3.5-8 3.5L4 9z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Domain 4 — Security Operations → radar sweep / ops console
function RadarIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outer circle */}
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      {/* Middle ring */}
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.5 2.5" />
      {/* Center dot */}
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      {/* Sweep arm */}
      <path
        d="M12 12L18.5 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Domain 5 — Security Program Management & Oversight → clipboard / checklist
function ClipboardIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Clipboard body */}
      <rect x="5" y="5" width="14" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Clip at top */}
      <path
        d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Check line 1 */}
      <path d="M8.5 11l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Text lines */}
      <path d="M14.5 10.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.5 15.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.5 17.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const GLYPHS: Record<1 | 2 | 3 | 4 | 5, () => ReactElement> = {
  1: ShieldIcon,
  2: BugIcon,
  3: StackIcon,
  4: RadarIcon,
  5: ClipboardIcon,
};

export function DomainIcon({ domain, className, size = 24 }: DomainIconProps) {
  const Glyph = GLYPHS[domain];
  // Scale via a wrapper span when size differs from the native 24
  if (size === 24) {
    return (
      <span className={className} style={{ display: "inline-flex", flexShrink: 0 }}>
        <Glyph />
      </span>
    );
  }
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        flexShrink: 0,
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ width: size, height: size }}
      >
        {/* Re-render the path data at target size — delegate to per-domain inner */}
        {domain === 1 && (
          <path
            d="M12 3L4 6.5V12c0 4 3.5 7.2 8 8.5 4.5-1.3 8-4.5 8-8.5V6.5L12 3z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {domain === 2 && (
          <>
            <ellipse cx="12" cy="13" rx="4" ry="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 5.5L8.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M14 5.5L15.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 11H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 13H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8 15H5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 11H18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 13H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 15H18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
        {domain === 3 && (
          <>
            <path d="M4 17l8 3.5 8-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 13l8 3.5 8-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 9l8-3.5 8 3.5-8 3.5L4 9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {domain === 4 && (
          <>
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.5 2.5" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <path d="M12 12L18.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
        {domain === 5 && (
          <>
            <rect x="5" y="5" width="14" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8.5 11l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14.5 10.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8.5 15.5h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M8.5 17.5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
      </svg>
    </span>
  );
}
