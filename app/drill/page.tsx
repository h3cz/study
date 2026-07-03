"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { seedDb, db } from "@/lib/db";
import { getActiveCertId } from "@/lib/certs";

const DURATIONS = [30, 60, 90] as const;
type Duration = (typeof DURATIONS)[number];

export default function DrillLandingPage() {
  const [selected, setSelected] = useState<Duration>(60);
  const [acronymCount, setAcronymCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      await seedDb();
      const state = await db.userState.get(1);
      const activeCertId = getActiveCertId(state);
      const n = await db.acronyms.where("certId").equals(activeCertId).count();
      if (!cancelled) setAcronymCount(n);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1
          className="font-display"
          style={{ fontSize: "clamp(48px, 10vw, 80px)", fontWeight: 400, color: "var(--fg)", lineHeight: 1.1 }}
        >
          Acronym Drill
        </h1>
        <p style={{ fontSize: "14px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
          How many can you nail?
        </p>
      </div>

      {/* Duration chips */}
      <div className="flex gap-3">
        {DURATIONS.map((d) => (
          <button
            key={d}
            onClick={() => setSelected(d)}
            style={{
              height: "44px",
              minWidth: "72px",
              padding: "0 20px",
              borderRadius: "var(--r-sm)",
              border: selected === d ? "2px solid var(--accent)" : "1px solid var(--border-strong)",
              background: selected === d ? "rgba(245,166,35,0.12)" : "transparent",
              color: selected === d ? "var(--accent)" : "var(--fg-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 120ms ease",
            }}
          >
            {d}s
          </button>
        ))}
      </div>

      {/* Start button */}
      <Link
        href={`/drill/run?duration=${selected}`}
        style={{
          height: "52px",
          padding: "0 40px",
          background: "var(--accent)",
          color: "var(--accent-fg)",
          borderRadius: "var(--r-sm)",
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          fontWeight: 600,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "200px",
        }}
      >
        Start · {selected}s
      </Link>

      <p style={{ fontSize: "12px", color: "var(--fg-subtle)", fontFamily: "var(--font-sans)" }}>
        {acronymCount !== null ? `${acronymCount} acronyms · ` : ""}shuffled · 5 XP per correct
      </p>
    </div>
  );
}
