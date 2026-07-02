"use client";

import Link from "next/link";

type Mode = {
  href: string;
  label: string;
  desc: string;
  glyph: string;
};

const MODES: Mode[] = [
  { href: "/play", label: "Versus", desc: "1v1 duels and ambient co-study rooms.", glyph: "⚔" },
  { href: "/leaderboard", label: "Leaderboard", desc: "Global and per-cert rankings.", glyph: "▲" },
];

function ModeCard({ mode }: { mode: Mode }) {
  return (
    <Link
      href={mode.href}
      style={{
        display: "block",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        padding: "18px 18px 16px",
        textDecoration: "none",
        transition: "border-color 150ms, transform 150ms",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <span
        aria-hidden="true"
        className="font-mono"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          marginBottom: 12,
          borderRadius: "var(--r-sm)",
          border: "1px solid var(--border)",
          color: "var(--accent)",
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        {mode.glyph}
      </span>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--fg)",
          margin: "0 0 4px",
        }}
      >
        {mode.label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 13,
          color: "var(--fg-muted)",
          margin: 0,
          lineHeight: 1.45,
        }}
      >
        {mode.desc}
      </p>
    </Link>
  );
}

export default function CompetePage() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1
          className="font-display"
          style={{ fontSize: 28, fontWeight: 400, color: "var(--fg)", margin: "0 0 4px" }}
        >
          Compete
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--fg-muted)", margin: 0 }}>
          Race a rival or climb the board.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {MODES.map((mode) => (
          <ModeCard key={mode.href} mode={mode} />
        ))}
      </div>
    </div>
  );
}
