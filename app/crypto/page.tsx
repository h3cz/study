"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { seedDb } from "@/lib/db";
import type { Question } from "@/lib/db";
import { loadByObjective, makeDrill } from "@/lib/trainers";
import { TrainerDrill, TrainerQuiz } from "@/components/trainer/TrainerKit";

const CERT = "secplus-sy0-701";
const OBJ = "secplus-sy0-701:obj:1.4";

type Group = { title: string; tag: string; items: string[]; note: string };

const GROUPS: Group[] = [
  {
    title: "Symmetric",
    tag: "one shared key",
    items: ["AES (128/192/256)", "3DES", "ChaCha20", "Blowfish / Twofish", "RC4 (stream, weak)"],
    note: "Fast — used for bulk data (data at rest, full-disk, VPN payload). Same key encrypts + decrypts; key distribution is the hard part.",
  },
  {
    title: "Asymmetric",
    tag: "public + private key pair",
    items: ["RSA", "ECC (small keys)", "Diffie-Hellman (key exchange)", "DSA / ECDSA (signing)", "ElGamal"],
    note: "Slow — used to exchange keys and sign. Encrypt with public, decrypt with private (confidentiality); sign with private, verify with public (integrity + non-repudiation).",
  },
  {
    title: "Hashing",
    tag: "one-way, integrity",
    items: ["SHA-256 / SHA-2", "SHA-3", "SHA-1 (deprecated)", "MD5 (broken)", "HMAC (keyed)"],
    note: "One-way fingerprint — verifies integrity, stores passwords (with salt). No key, not reversible. HMAC adds a key for authenticated integrity.",
  },
];

const CONCEPTS = [
  "Salt — random value added before hashing passwords (defeats rainbow tables).",
  "Digital signature — hash, then encrypt the hash with your private key (integrity + non-repudiation).",
  "PKI / CA — issues and vouches for certificates that bind a public key to an identity.",
  "Key exchange — DH / ECDHE establish a shared symmetric key over an insecure channel.",
  "Data states — at rest (AES/FDE), in transit (TLS/IPsec), in use (enclaves/encryption).",
];

const DRILL = makeDrill({
  id: "trainer:crypto:drill",
  certId: CERT,
  prompt: "Match each algorithm to its cryptographic type.",
  leftLabel: "Algorithm",
  rightLabel: "Type",
  pairs: [
    { left: "AES", right: "Symmetric cipher" },
    { left: "RSA", right: "Asymmetric cipher" },
    { left: "SHA-256", right: "Hashing" },
    { left: "ECC", right: "Asymmetric (small keys)" },
    { left: "3DES", right: "Symmetric (legacy)" },
    { left: "HMAC", right: "Keyed hash (integrity)" },
  ],
  explanation:
    "AES and 3DES are symmetric (one shared key, bulk encryption). RSA and ECC are asymmetric (key pair — exchange/signing; ECC gets equivalent strength with smaller keys). SHA-256 is a one-way hash; HMAC is a hash keyed for authenticated integrity.",
});

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--r-md)",
  padding: "20px 22px",
};

export default function CryptoTrainerPage() {
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
        Loading Cryptography trainer…
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
          Cryptography
        </h1>
        <p style={{ fontSize: 14, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginTop: 4 }}>
          Objective 1.4. Know which algorithm is which type, and when to reach for each.
        </p>
      </div>

      {/* Algorithm reference */}
      <div style={card}>
        <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: "14px" }}>
          Algorithms by type
        </p>
        <div className="space-y-4">
          {GROUPS.map((g) => (
            <div key={g.title} style={{ paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)", fontFamily: "var(--font-sans)" }}>{g.title}</span>
                <span className="font-mono" style={{ fontSize: 11, color: "var(--accent)" }}>{g.tag}</span>
              </div>
              <div className="font-mono" style={{ fontSize: 12.5, color: "var(--fg)", marginTop: 4 }}>{g.items.join("  ·  ")}</div>
              <p style={{ fontSize: 12, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginTop: 4, lineHeight: 1.5 }}>{g.note}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <p style={{ fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", marginBottom: 8 }}>
            Key concepts
          </p>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, color: "var(--fg-muted)", fontFamily: "var(--font-sans)", lineHeight: 1.6 }}>
            {CONCEPTS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      <TrainerDrill label="Match algorithm → type · drag or click" question={DRILL} />
      <TrainerQuiz label="Quiz yourself" pool={pool} topicTag="Crypto · 1.4" />

      <div style={{ textAlign: "center" }}>
        <Link href="/practice" style={{ fontSize: 13, color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
          ← Back to Practice
        </Link>
      </div>
    </div>
  );
}
