"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRemediation, type Remediation } from "@/lib/remediation";
import type { Question } from "@/lib/db";

interface RemediationLinkProps {
  question: Question;
}

export default function RemediationLink({ question }: RemediationLinkProps) {
  const [remediation, setRemediation] = useState<Remediation | null | undefined>(undefined);
  const { id: questionId } = question;

  useEffect(() => {
    getRemediation(question).then(setRemediation).catch(() => setRemediation(null));
  }, [question, questionId]);

  // undefined = loading (render nothing), null = no remediation
  if (!remediation) return null;

  const chipStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 10px",
    borderRadius: "4px",
    border: "1px solid rgba(245, 166, 35, 0.35)",
    background: "rgba(245, 166, 35, 0.08)",
    color: "var(--fg-muted)",
    fontSize: "12px",
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textDecoration: "none",
    transition: "color 150ms, border-color 150ms, background 150ms",
    cursor: "pointer",
  };

  function handleMouseEnter(e: React.MouseEvent<HTMLElement>) {
    const el = e.currentTarget as HTMLElement;
    el.style.color = "var(--fg)";
    el.style.borderColor = "rgba(245, 166, 35, 0.7)";
    el.style.background = "rgba(245, 166, 35, 0.14)";
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLElement>) {
    const el = e.currentTarget as HTMLElement;
    el.style.color = "var(--fg-muted)";
    el.style.borderColor = "rgba(245, 166, 35, 0.35)";
    el.style.background = "rgba(245, 166, 35, 0.08)";
  }

  if (remediation.kind === "video") {
    return (
      <div style={{ marginTop: "10px" }}>
        <a
          href={remediation.href}
          target="_blank"
          rel="noopener noreferrer"
          style={chipStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Play triangle glyph */}
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="currentColor"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <path d="M2.5 1.5l8 4.5-8 4.5V1.5z" />
          </svg>
          <span style={{ color: "var(--accent)", marginRight: "2px" }}>Professor Messer</span>
          <span style={{ color: "var(--fg-subtle)", margin: "0 3px" }}>·</span>
          {remediation.label}
        </a>
      </div>
    );
  }

  // kind === "objective"
  return (
    <div style={{ marginTop: "10px" }}>
      <Link
        href={remediation.href}
        style={chipStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Book glyph */}
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        {remediation.label}
      </Link>
    </div>
  );
}
