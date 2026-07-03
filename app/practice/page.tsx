"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { NewBanner, NewPill } from "@/components/NewBanner";

type Mode = {
  href: string;
  label: string;
  desc: string;
  glyph: string;
  group: "start" | "focus" | "review";
  isNew?: boolean;
};

const MODES: Mode[] = [
  { href: "/timeline", label: "Exam Readiness", desc: "Your week-by-week plan from the exam date.", glyph: "◷", group: "start" },
  { href: "/quiz", label: "Daily Quiz", desc: "Adaptive questions tuned to your weak objectives.", glyph: "?", group: "start" },
  { href: "/flashcards", label: "Flashcards", desc: "Spaced-repetition cards (FSRS). Review what's due.", glyph: "▦", group: "start" },
  { href: "/exam", label: "Mock Exam", desc: "Full timed exam simulation with a predicted score.", glyph: "⏱", group: "review" },
  { href: "/pbq", label: "PBQs", desc: "Performance-based questions — the hands-on ones.", glyph: "⌘", group: "focus" },
  // Focused topic trainers — reference + matching drill + quiz, one topic at a time.
  { href: "/osi", label: "OSI Layers", desc: "Master the 7-layer model — reference, matching drill, and quiz.", glyph: "☰", group: "focus", isNew: true },
  { href: "/ports", label: "Ports & Protocols", desc: "Drill the must-know ports and secure-vs-insecure swaps.", glyph: "⊞", group: "focus", isNew: true },
  { href: "/controls", label: "Control Types", desc: "Categories × functions — the classic 1.1 matrix.", glyph: "▣", group: "focus", isNew: true },
  { href: "/crypto", label: "Cryptography", desc: "Symmetric vs asymmetric vs hashing, and when to use each.", glyph: "⊕", group: "focus", isNew: true },
  { href: "/attacks", label: "Attacks & Social Eng", desc: "Spot the attack from its indicator — phishing, injection, DDoS & more.", glyph: "⚠", group: "focus", isNew: true },
  { href: "/drill", label: "Acronym Drill", desc: "Rapid-fire acronym recall against the clock.", glyph: "⚡", group: "focus" },
  { href: "/review", label: "Review Misses", desc: "Re-attempt the questions you've gotten wrong.", glyph: "↺", group: "review" },
  { href: "/notebook", label: "Error Notebook", desc: "Your misses clustered by topic — and why you missed them.", glyph: "✗", group: "review" },
];

const VOICE_MODE: Mode = {
  href: "/voice",
  label: "Voice Tutor",
  desc: "Talk through concepts with the AI tutor.",
  glyph: "◍",
  group: "review",
};

const GROUPS: { id: Mode["group"]; title: string; description: string }[] = [
  { id: "start", title: "Start here", description: "Use these when you have one short study window." },
  { id: "focus", title: "Focused trainers", description: "Drill one skill or question type until it stops feeling slippery." },
  { id: "review", title: "Review loop", description: "Turn misses into score gains and pressure-test exam readiness." },
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
        {mode.isNew && <NewPill />}
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

export default function PracticePage() {
  const [voiceAllowed, setVoiceAllowed] = useState(false);

  useEffect(() => {
    // Mirror the NavBar probe: only check voice access for signed-in users,
    // avoiding a needless 401 on /api/voice/access for signed-out visitors.
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) return;
      fetch("/api/voice/access")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => { if (d?.allowed) setVoiceAllowed(true); })
        .catch(() => {});
    });
  }, []);

  const modes = voiceAllowed ? [...MODES, VOICE_MODE] : MODES;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 80px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1
          className="font-display"
          style={{ fontSize: 28, fontWeight: 400, color: "var(--fg)", margin: "0 0 4px" }}
        >
          Practice
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--fg-muted)", margin: 0 }}>
          Every way to drill for the exam, in one place.
        </p>
      </div>

      <NewBanner featureId="trainers-v1" href="/osi">
        New focused trainers — drill one Sec+ topic at a time
      </NewBanner>

      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          background: "var(--surface)",
          padding: "16px",
          marginBottom: 18,
        }}
      >
        <p className="font-mono" style={{ fontSize: 10, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Study this next
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          {[
            { href: "/quiz", label: "Daily Quiz", sub: "Find today's weak spot" },
            { href: "/review", label: "Review Misses", sub: "Fix what cost points" },
            { href: "/flashcards", label: "Flashcards", sub: "Lock in recall" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: 10,
                textDecoration: "none",
                minHeight: 54,
                display: "block",
              }}
            >
              <p style={{ color: "var(--fg)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700 }}>{item.label}</p>
              <p style={{ color: "var(--fg-muted)", fontFamily: "var(--font-sans)", fontSize: 12, marginTop: 2 }}>{item.sub}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {GROUPS.map((group) => (
          <section key={group.id}>
            <div style={{ marginBottom: 10 }}>
              <h2 style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--fg)", fontWeight: 700, margin: "0 0 2px" }}>
                {group.title}
              </h2>
              <p style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--fg-muted)", margin: 0 }}>
                {group.description}
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              {modes
                .filter((mode) => mode.group === group.id)
                .map((mode) => (
                  <ModeCard key={mode.href} mode={mode} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
