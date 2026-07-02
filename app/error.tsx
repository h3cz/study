"use client";

import { useEffect, useState } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  useEffect(() => {
    // Surface to the console in case it's caught upstream
    console.error("[study.hecz.dev] error boundary:", error);
  }, [error]);

  const looksLikeStorageError =
    /indexed|dexie|database|quota|securityerror|storage/i.test(
      `${error?.name} ${error?.message}`
    );

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        textAlign: "center",
        gap: "12px",
        color: "var(--fg)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "32px",
          letterSpacing: "-0.01em",
        }}
      >
        Something didn&apos;t load.
      </h1>
      {looksLikeStorageError ? (
        <p style={{ maxWidth: 420, color: "var(--fg-muted)", fontSize: 14, lineHeight: 1.5 }}>
          This is a local-first study app. Your browser blocked the local storage
          we need to save quizzes. Common cause: opening from inside an in-app
          browser (iMessage, Discord, Instagram). Tap the share or menu icon and
          choose <strong>Open in Safari</strong> (or Chrome).
        </p>
      ) : (
        <p style={{ maxWidth: 420, color: "var(--fg-muted)", fontSize: 14, lineHeight: 1.5 }}>
          The page hit an error during load. Try refresh first. If it keeps
          happening, open in Safari or Chrome directly (not an in-app browser).
        </p>
      )}
      <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "8px 16px",
            border: "1px solid var(--accent)",
            background: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: "var(--r-sm, 4px)",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <a
          href="https://study.hecz.dev"
          style={{
            padding: "8px 16px",
            border: "1px solid var(--border-strong)",
            color: "var(--fg-muted)",
            borderRadius: "var(--r-sm, 4px)",
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Reload from start
        </a>
      </div>
      <button
        type="button"
        onClick={() => setDetailsOpen((v) => !v)}
        style={{
          marginTop: 24,
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          color: "var(--fg-subtle)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textDecoration: "underline",
        }}
      >
        {detailsOpen ? "Hide details" : "Show details"}
      </button>
      {detailsOpen && (
        <pre
          style={{
            marginTop: 8,
            padding: 12,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-sm, 4px)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--fg-muted)",
            maxWidth: 560,
            width: "100%",
            overflowX: "auto",
            textAlign: "left",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
{`${error?.name ?? "Error"}: ${error?.message ?? "(no message)"}
${error?.digest ? `digest: ${error.digest}\n` : ""}${error?.stack ? `\n${error.stack.split("\n").slice(0, 8).join("\n")}` : ""}`}
        </pre>
      )}
    </div>
  );
}
