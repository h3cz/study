"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { seedDb } from "@/lib/db";
import type { Question } from "@/lib/db";
import { loadByObjectives, makeDrill } from "@/lib/trainers";
import { TrainerDrill, TrainerQuiz } from "@/components/trainer/TrainerKit";

const CERT = "secplus-sy0-701";
// 2.2 = threat vectors / social engineering, 2.4 = indicators of malicious activity.
const OBJS = ["secplus-sy0-701:obj:2.2", "secplus-sy0-701:obj:2.4"];

type Group = { title: string; items: { name: string; tell: string }[] };

const GROUPS: Group[] = [
  {
    title: "Social engineering",
    items: [
      { name: "Phishing", tell: "fraudulent email for creds/links" },
      { name: "Vishing / Smishing", tell: "voice call / SMS variants" },
      { name: "Pretexting / Impersonation", tell: "invented scenario or fake identity" },
      { name: "BEC", tell: "spoofed exec asking for wire/gift cards" },
      { name: "Watering hole", tell: "compromise a site the target trusts" },
      { name: "Pharming / Typosquatting", tell: "redirect via DNS / look-alike domain" },
    ],
  },
  {
    title: "Malware",
    items: [
      { name: "Ransomware", tell: "encrypts files, demands payment" },
      { name: "Worm", tell: "self-propagates, no host file" },
      { name: "Trojan / RAT", tell: "disguised; RAT = remote control" },
      { name: "Keylogger / Spyware", tell: "captures keystrokes / activity" },
      { name: "Rootkit", tell: "hides at kernel level, hard to detect" },
      { name: "Logic bomb", tell: "triggers on a condition/date" },
    ],
  },
  {
    title: "Application / web",
    items: [
      { name: "SQL injection", tell: "malicious SQL in input fields" },
      { name: "XSS", tell: "injected script runs in victim's browser" },
      { name: "CSRF", tell: "forces an action using your session" },
      { name: "Buffer overflow", tell: "writes past a buffer to run code" },
      { name: "Privilege escalation", tell: "gain higher rights than granted" },
      { name: "Replay", tell: "captured data re-sent to authenticate" },
    ],
  },
  {
    title: "Network & password",
    items: [
      { name: "DDoS", tell: "flood from many hosts → outage" },
      { name: "On-path (MITM)", tell: "relays/alters traffic between two parties" },
      { name: "ARP / DNS poisoning", tell: "corrupts mappings to redirect traffic" },
      { name: "Password spraying", tell: "one common password across many accounts" },
      { name: "Credential stuffing", tell: "reuses leaked username/password pairs" },
      { name: "Brute force / dictionary", tell: "tries many guesses / a wordlist" },
    ],
  },
];

const DRILL = makeDrill({
  id: "trainer:attacks:drill",
  certId: CERT,
  prompt: "Match each attack to the indicator that gives it away.",
  leftLabel: "Indicator",
  rightLabel: "Attack",
  pairs: [
    { left: "Files encrypted, ransom note demands Bitcoin", right: "Ransomware" },
    { left: "Text message with an urgent fake link", right: "Smishing" },
    { left: "' OR 1=1 -- typed into a login field", right: "SQL injection" },
    { left: "Attacker silently relays traffic between two hosts", right: "On-path (MITM)" },
    { left: "One password tried against hundreds of accounts", right: "Password spraying" },
    { left: "Huge traffic flood from a botnet takes a site offline", right: "DDoS" },
  ],
  explanation:
    "Read the indicator, name the attack: encryption + ransom note = ransomware; SMS lure = smishing; SQL meta-characters in input = SQL injection; silent relay between parties = on-path/MITM; one password × many accounts (avoids lockout) = password spraying; distributed traffic flood = DDoS.",
});

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--r-md)",
  padding: "20px 22px",
};

export default function AttacksTrainerPage() {
  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const [pool, setPool] = useState<Question[]>([]);

  useEffect(() => {
    (async () => {
      await seedDb();
      setPool(await loadByObjectives(OBJS));
      setPhase("ready");
    })();
  }, []);

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" style={{ color: "var(--fg-muted)" }}>
        Loading Attacks trainer…
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
          Attacks &amp; Social Engineering
        </h1>
        <p style={{ fontSize: 14, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginTop: 4 }}>
          Objectives 2.2 &amp; 2.4. The exam shows you an <em>indicator</em> and asks for the attack — learn the tells.
        </p>
      </div>

      <div style={card}>
        <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: "14px" }}>
          Attack types &amp; their tells
        </p>
        <div className="space-y-4">
          {GROUPS.map((g) => (
            <div key={g.title} style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)", fontFamily: "var(--font-sans)", marginBottom: 6 }}>{g.title}</p>
              <div className="space-y-1">
                {g.items.map((it) => (
                  <div key={it.name} style={{ display: "grid", gridTemplateColumns: "minmax(120px, 38%) 1fr", gap: 8, alignItems: "baseline" }}>
                    <span className="font-mono" style={{ fontSize: 12.5, color: "var(--accent)" }}>{it.name}</span>
                    <span style={{ fontSize: 12.5, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>{it.tell}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <TrainerDrill label="Match indicator → attack · drag or click" question={DRILL} />
      <TrainerQuiz label="Quiz yourself" pool={pool} topicTag="Attacks · 2.2 / 2.4" />

      <div style={{ textAlign: "center" }}>
        <Link href="/practice" style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
          ← Back to Practice
        </Link>
      </div>
    </div>
  );
}
