"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { seedDb } from "@/lib/db";
import type { Question } from "@/lib/db";
import { loadByObjective, makeDrill } from "@/lib/trainers";
import { TrainerDrill, TrainerQuiz } from "@/components/trainer/TrainerKit";

const CERT = "secplus-sy0-701";
const OBJ = "secplus-sy0-701:obj:1.1";

// SY0-701 objective 1.1 — the categories × functions matrix.
const CATEGORIES = [
  { name: "Technical", desc: "implemented in tech/hardware/software", ex: "firewall, encryption, MFA, antivirus" },
  { name: "Managerial", desc: "policies & oversight (administrative)", ex: "risk assessments, security policy, SDLC" },
  { name: "Operational", desc: "done by people, day-to-day", ex: "user training, guard rotation, backups" },
  { name: "Physical", desc: "protect the tangible world", ex: "locks, fences, bollards, mantraps, CCTV" },
];

const FUNCTIONS = [
  { name: "Preventive", desc: "stop it before it happens", ex: "firewall, password policy, lock" },
  { name: "Deterrent", desc: "discourage the attacker", ex: "warning sign, login banner, guard" },
  { name: "Detective", desc: "identify/record an event", ex: "IDS, CCTV, log review, alarm" },
  { name: "Corrective", desc: "fix/recover after an event", ex: "backups, patching, IPS quarantine" },
  { name: "Compensating", desc: "alternative when the primary isn’t feasible", ex: "extra monitoring while a patch is pending" },
  { name: "Directive", desc: "instruct/require an action", ex: "acceptable use policy, procedures" },
];

const DRILL = makeDrill({
  id: "trainer:controls:drill",
  certId: CERT,
  prompt: "Match each control to its FUNCTION (what it does), not its category.",
  leftLabel: "Control",
  rightLabel: "Function",
  pairs: [
    { left: "Firewall blocking a port", right: "Preventive" },
    { left: "“Authorized personnel only” sign", right: "Deterrent" },
    { left: "Intrusion detection system (IDS)", right: "Detective" },
    { left: "Restoring from backup after ransomware", right: "Corrective" },
    { left: "Extra logging while a patch is pending", right: "Compensating" },
    { left: "Acceptable use policy", right: "Directive" },
  ],
  explanation:
    "Function = what the control DOES. Preventive stops it (firewall), deterrent discourages (sign), detective spots it (IDS), corrective recovers (restore from backup), compensating substitutes when the ideal control isn’t feasible (extra logging), directive instructs (AUP). Category (technical/managerial/operational/physical) is a separate axis — every control has one of each.",
});

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--r-md)",
  padding: "20px 22px",
};

function AxisCard({ label, items }: { label: string; items: { name: string; desc: string; ex: string }[] }) {
  return (
    <div style={card}>
      <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: "14px" }}>
        {label}
      </p>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.name} style={{ padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)", fontFamily: "var(--font-sans)" }}>{it.name}</span>
            <span style={{ fontSize: 12.5, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}> — {it.desc}</span>
            <div className="font-mono" style={{ fontSize: 11.5, color: "var(--fg-subtle)", marginTop: 2 }}>{it.ex}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ControlsTrainerPage() {
  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const [pool, setPool] = useState<Question[]>([]);

  useEffect(() => {
    (async () => {
      await seedDb();
      setPool(await loadByObjective(OBJ));
      setPhase("ready");
    })();
  }, []);

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" style={{ color: "var(--fg-muted)" }}>
        Loading Control Types trainer…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 80px" }} className="space-y-6">
      <div>
        <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: "8px" }}>
          Focused Trainer
        </p>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 400, color: "var(--fg)", lineHeight: 1.2 }}>
          Security Control Types
        </h1>
        <p style={{ fontSize: 14, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginTop: 4 }}>
          Objective 1.1. Every control has a <em>category</em> (how it’s implemented) AND a <em>function</em> (what it does) — the exam loves to mix them up.
        </p>
      </div>

      <AxisCard label="Categories · how it’s implemented" items={CATEGORIES} />
      <AxisCard label="Functions · what it does" items={FUNCTIONS} />

      <TrainerDrill label="Match control → function · drag or click" question={DRILL} />
      <TrainerQuiz label="Quiz yourself" pool={pool} topicTag="Controls · 1.1" />

      <div style={{ textAlign: "center" }}>
        <Link href="/practice" style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
          ← Back to Practice
        </Link>
      </div>
    </div>
  );
}
