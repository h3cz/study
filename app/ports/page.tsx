"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { seedDb } from "@/lib/db";
import type { Question } from "@/lib/db";
import { loadByMatch, loadByObjective, mergeQuestions, makeDrill } from "@/lib/trainers";
import { TrainerDrill, TrainerQuiz } from "@/components/trainer/TrainerKit";

const CERT = "secplus-sy0-701";

type Row = { port: string; proto: string; note: string };

// Most-tested ports for SY0-701. Secure ↔ insecure pairs are the classic traps.
const PORTS: Row[] = [
  { port: "20/21", proto: "FTP", note: "file transfer — cleartext (use SFTP/FTPS)" },
  { port: "22", proto: "SSH / SFTP / SCP", note: "secure remote admin + file transfer" },
  { port: "23", proto: "Telnet", note: "remote admin — cleartext (replace with SSH)" },
  { port: "25", proto: "SMTP", note: "mail relay (secure: 587/465)" },
  { port: "53", proto: "DNS", note: "name resolution (TCP + UDP)" },
  { port: "67/68", proto: "DHCP", note: "dynamic IP assignment" },
  { port: "69", proto: "TFTP", note: "trivial file transfer — no auth" },
  { port: "80", proto: "HTTP", note: "web — cleartext (secure: 443)" },
  { port: "110", proto: "POP3", note: "mail retrieval (secure: 995)" },
  { port: "143", proto: "IMAP", note: "mail retrieval (secure: 993)" },
  { port: "161/162", proto: "SNMP", note: "device mgmt — use SNMPv3" },
  { port: "389", proto: "LDAP", note: "directory — cleartext (secure: 636)" },
  { port: "443", proto: "HTTPS", note: "web over TLS" },
  { port: "445", proto: "SMB", note: "Windows file sharing" },
  { port: "514", proto: "Syslog", note: "log collection" },
  { port: "636", proto: "LDAPS", note: "directory over TLS" },
  { port: "3389", proto: "RDP", note: "Windows remote desktop" },
];

// Secure-vs-insecure pairs — the swap CompTIA loves to test.
const PAIRS: Row[] = [
  { port: "23 → 22", proto: "Telnet → SSH", note: "cleartext shell → encrypted shell" },
  { port: "80 → 443", proto: "HTTP → HTTPS", note: "web → web over TLS" },
  { port: "21 → 22", proto: "FTP → SFTP", note: "or 989/990 FTPS" },
  { port: "389 → 636", proto: "LDAP → LDAPS", note: "directory over TLS" },
  { port: "110 → 995", proto: "POP3 → POP3S", note: "mail over TLS" },
  { port: "143 → 993", proto: "IMAP → IMAPS", note: "mail over TLS" },
];

const DRILL = makeDrill({
  id: "trainer:ports:drill",
  certId: CERT,
  prompt: "Match each port number to the protocol that uses it.",
  leftLabel: "Port",
  rightLabel: "Protocol",
  pairs: [
    { left: "22", right: "SSH" },
    { left: "443", right: "HTTPS" },
    { left: "53", right: "DNS" },
    { left: "3389", right: "RDP" },
    { left: "389", right: "LDAP" },
    { left: "25", right: "SMTP" },
  ],
  explanation:
    "22 = SSH (secure shell/SFTP), 443 = HTTPS (web over TLS), 53 = DNS (name resolution), 3389 = RDP (Windows remote desktop), 389 = LDAP (directory), 25 = SMTP (mail relay).",
});

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--r-md)",
  padding: "20px 22px",
};

export default function PortsTrainerPage() {
  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const [pool, setPool] = useState<Question[]>([]);

  useEffect(() => {
    (async () => {
      await seedDb();
      // Sec+ has little dedicated port content, so enrich with Network+ obj 1.5
      // ("common ports and protocols") — the dedicated ports objective.
      const [sec, net] = await Promise.all([
        loadByMatch(CERT, (q) => {
          const t = `${q.stem} ${q.explanation}`.toLowerCase();
          return (
            /\bport(s)?\b/.test(t) &&
            /\b(20|21|22|23|25|53|67|68|69|80|110|123|143|161|162|389|443|445|465|514|587|636|853|989|990|993|995|1433|1521|3306|3389)\b/.test(t)
          );
        }),
        loadByObjective("networkplus-n10-009:obj:1.5"),
      ]);
      setPool(mergeQuestions(sec, net));
      setPhase("ready");
    })();
  }, []);

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" style={{ color: "var(--fg-muted)" }}>
        Loading Ports trainer…
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
          Ports &amp; Protocols
        </h1>
        <p style={{ fontSize: 14, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginTop: 4 }}>
          The most-tested memorization topic. Learn the ports, drill the secure-vs-insecure swaps, then quiz yourself.
        </p>
      </div>

      {/* Reference */}
      <div style={card}>
        <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: "14px" }}>
          Common ports
        </p>
        <div className="space-y-0.5">
          {PORTS.map((r) => (
            <div key={r.port} style={{ display: "grid", gridTemplateColumns: "62px 1fr", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--border)", alignItems: "baseline" }}>
              <span className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>{r.port}</span>
              <div style={{ minWidth: 0 }}>
                <span className="font-mono" style={{ fontSize: 13, color: "var(--fg)" }}>{r.proto}</span>
                <span style={{ fontSize: 12, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}> — {r.note}</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", margin: "18px 0 10px" }}>
          Secure ↔ insecure swaps
        </p>
        <div className="space-y-0.5">
          {PAIRS.map((r) => (
            <div key={r.port} style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 10, padding: "6px 0", borderBottom: "1px solid var(--border)", alignItems: "baseline" }}>
              <span className="font-mono" style={{ fontSize: 12.5, fontWeight: 700, color: "var(--accent)" }}>{r.port}</span>
              <div style={{ minWidth: 0 }}>
                <span className="font-mono" style={{ fontSize: 12.5, color: "var(--fg)" }}>{r.proto}</span>
                <span style={{ fontSize: 12, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}> — {r.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TrainerDrill label="Match port → protocol · drag or click" question={DRILL} />
      <TrainerQuiz label="Quiz yourself" pool={pool} topicTag="Ports · Sec+" />

      <div style={{ textAlign: "center" }}>
        <Link href="/practice" style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
          ← Back to Practice
        </Link>
      </div>
    </div>
  );
}
