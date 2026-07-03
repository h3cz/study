"use client";

import { useEffect, useState } from "react";

interface KeyMeta {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
}

const btn = (border = "var(--border-strong)", color = "var(--fg-muted)"): React.CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "44px",
  padding: "0 16px",
  background: "transparent",
  color,
  border: `1px solid ${border}`,
  borderRadius: "var(--r-sm)",
  fontSize: "13px",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
  whiteSpace: "nowrap",
});

const muted: React.CSSProperties = {
  fontSize: "12px",
  color: "var(--fg-muted)",
  fontFamily: "var(--font-sans)",
};

export default function StudyBuddyKeys() {
  const [keys, setKeys] = useState<KeyMeta[] | null>(null);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [freshToken, setFreshToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/study-buddy/keys", { cache: "no-store" });
      if (res.status === 401) {
        setAuthRequired(true);
        setKeys([]);
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAuthRequired(false);
      setKeys(data.keys ?? []);
    } catch {
      setKeys([]);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, []);

  async function mint() {
    setMinting(true);
    setError(null);
    setFreshToken(null);
    try {
      const res = await fetch("/api/study-buddy/keys", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setAuthRequired(true);
          setError("Sign in to mint a key.");
          return;
        }
        setError(
          data.error === "key_limit_reached"
            ? `You can have at most ${data.max} active keys. Revoke one first.`
            : "Could not create a key. Try again."
        );
        return;
      }
      setFreshToken(data.token);
      await load();
    } catch {
      setError("Could not create a key. Try again.");
    } finally {
      setMinting(false);
    }
  }

  async function revoke(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/study-buddy/keys?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      if (freshToken) setFreshToken(null);
      await load();
    } catch {
      setError("Could not revoke. Try again.");
    }
  }

  async function copyToken() {
    if (!freshToken) return;
    try {
      await navigator.clipboard.writeText(freshToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — user can select manually */
    }
  }

  return (
    <div className="space-y-4">
      <p style={muted}>
        Mint a key to let an external AI agent (like OpenClaw) read your own study
        data — your weak objectives, recent misses, and mastery — to tutor you. The
        key only ever reads <strong>your</strong> data, never anyone else&apos;s,
        and never the question bank in bulk. Reading your data is free and always
        will be.{" "}
        <a
          href="/connect"
          style={{ color: "var(--accent)", textDecoration: "underline" }}
        >
          Connect your agent →
        </a>
      </p>

      {freshToken && (
        <div
          style={{
            border: "1px solid var(--accent)",
            borderRadius: "var(--r-sm)",
            padding: "12px 14px",
            background: "var(--surface)",
          }}
        >
          <p style={{ ...muted, marginBottom: "8px", color: "var(--fg)" }}>
            Copy this key now — it is shown <strong>once</strong> and cannot be
            retrieved again.
          </p>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <code
              style={{
                flex: 1,
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "var(--fg)",
                wordBreak: "break-all",
                background: "var(--bg)",
                padding: "8px 10px",
                borderRadius: "var(--r-sm)",
                border: "1px solid var(--border)",
              }}
            >
              {freshToken}
            </code>
            <button onClick={copyToken} style={btn("var(--accent)", "var(--accent)")}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {authRequired ? (
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--r-sm)",
            padding: "12px 14px",
            background: "var(--bg)",
          }}
        >
          <p style={{ ...muted, color: "var(--fg)", marginBottom: "10px" }}>
            Sign in on this device before minting an agent key.
          </p>
          <a
            href="/login?next=%2Fconnect"
            style={{
              ...btn("var(--accent)", "var(--accent)"),
              textDecoration: "none",
              width: "fit-content",
            }}
          >
            Sign in to connect
          </a>
        </div>
      ) : keys === null ? (
        <p style={muted}>Loading…</p>
      ) : keys.length === 0 ? (
        <p style={muted}>No agent keys yet. Mint one when you are ready to connect Cursor, OpenClaw, or your own HTTP client.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="space-y-2">
          {keys.map((k) => (
            <li
              key={k.id}
              className="flex items-center justify-between gap-4"
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--r-sm)",
                padding: "10px 12px",
              }}
            >
              <div>
                <p style={{ fontSize: "13px", color: "var(--fg)", fontFamily: "var(--font-sans)" }}>
                  {k.name}
                </p>
                <p style={{ ...muted, fontFamily: "var(--font-mono)" }}>
                  {k.prefix}…{"  "}·{"  "}
                  {k.last_used_at
                    ? `last used ${new Date(k.last_used_at).toLocaleDateString()}`
                    : "never used"}
                </p>
              </div>
              <button onClick={() => revoke(k.id)} style={btn()}>
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}

      {!authRequired && (
        <button onClick={mint} disabled={minting} style={btn("var(--accent)", "var(--accent)")}>
          {minting ? "Minting…" : "Mint API key"}
        </button>
      )}

      {error && (
        <p style={{ ...muted, color: "var(--error, #e55c5c)" }}>{error}</p>
      )}
    </div>
  );
}
