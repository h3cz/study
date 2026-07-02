"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudyBuddyKeys from "@/components/StudyBuddyKeys";
import { createClient } from "@/lib/supabase/client";

const BASE_URL = "https://study.hecz.dev/api/study-buddy";

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }
  return (
    <button
      onClick={copy}
      style={{
        height: "28px",
        padding: "0 12px",
        background: "transparent",
        color: copied ? "var(--accent)" : "var(--fg-muted)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)",
        fontSize: "11px",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ─── Code block ───────────────────────────────────────────────────────────────

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div style={{ marginTop: "8px" }}>
      {label && (
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            marginBottom: "6px",
          }}
        >
          {label}
        </p>
      )}
      <div
        style={{
          position: "relative",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-sm)",
          padding: "12px 48px 12px 14px",
        }}
      >
        <pre
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--fg)",
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            lineHeight: "1.6",
          }}
        >
          {code}
        </pre>
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
          }}
        >
          <CopyButton text={code} />
        </div>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <h2
        style={{
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          fontFamily: "var(--font-sans)",
          margin: 0,
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function StatusCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "accent" | "success" | "muted";
}) {
  const color =
    tone === "success"
      ? "var(--success)"
      : tone === "accent"
        ? "var(--accent)"
        : "var(--fg-muted)";

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)",
        background: "var(--surface)",
        padding: "12px 14px",
      }}
    >
      <p
        className="font-mono"
        style={{
          fontSize: "10px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          marginBottom: "6px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          fontSize: "13px",
          color: "var(--fg)",
          fontFamily: "var(--font-sans)",
          margin: 0,
          minWidth: 0,
        }}
      >
        <span style={{ color, flexShrink: 0 }}>●</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
      </p>
    </div>
  );
}

// ─── Endpoint row ─────────────────────────────────────────────────────────────

function EndpointRow({
  method,
  path,
  description,
}: {
  method: string;
  path: string;
  description: string;
}) {
  const methodColor =
    method === "GET" ? "var(--accent)" : "var(--fg-muted)";
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: methodColor,
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-sm)",
          padding: "2px 6px",
          flexShrink: 0,
          marginTop: "1px",
        }}
      >
        {method}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <code
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--fg)",
            wordBreak: "break-all",
          }}
        >
          {path}
        </code>
        <p
          style={{
            fontSize: "13px",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            margin: "4px 0 0 0",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Example flow ─────────────────────────────────────────────────────────────

const TOKEN_PLACEHOLDER = "sq_live_<your-key>";

const EXAMPLE_CURL_WEAK = `curl -s \\
  -H "Authorization: Bearer ${TOKEN_PLACEHOLDER}" \\
  "${BASE_URL}/weak-objectives?n=3"`;

const EXAMPLE_CURL_QUESTIONS = `curl -s \\
  -H "Authorization: Bearer ${TOKEN_PLACEHOLDER}" \\
  "${BASE_URL}/questions?objective=4.1&n=4"`;

const EXAMPLE_CURL_ANSWER = `curl -s -X POST \\
  -H "Authorization: Bearer ${TOKEN_PLACEHOLDER}" \\
  -H "Content-Type: application/json" \\
  -d '{"questionId":"secplus-sy0-701:q:4.1-001","picked":"B"}' \\
  "${BASE_URL}/answer"`;

const EXAMPLE_RESPONSE_WEAK = `{
  "weakObjectives": [
    { "objectiveCode": "4.1", "name": "Apply common security techniques...",
      "mastery": 0.38, "attempts": 9 },
    { "objectiveCode": "2.3", "name": "Explain various types of vulnerabilities",
      "mastery": 0.45, "attempts": 6 }
  ]
}`;

const EXAMPLE_RESPONSE_QUESTIONS = `{
  "objective": "4.1",
  "questions": [
    {
      "id": "secplus-sy0-701:q:4.1-001",
      "objectiveId": "secplus-sy0-701:obj:4.1",
      "stem": "Which hardening technique removes unused services...",
      "choices": [
        { "key": "A", "text": "Patching the OS" },
        { "key": "B", "text": "Disabling unnecessary features" },
        { "key": "C", "text": "Enabling full-disk encryption" },
        { "key": "D", "text": "Installing a HIDS" }
      ]
    }
  ]
}`;

const EXAMPLE_RESPONSE_ANSWER = `{
  "correct": true,
  "correctKey": "B",
  "explanation": "Disabling unnecessary features reduces the attack surface..."
}`;

const HTTP_CLIENT_CONFIG = `{
  "studyBuddy": {
    "type": "http",
    "baseUrl": "https://study.hecz.dev/api/study-buddy",
    "headers": {
      "Authorization": "Bearer sq_live_<your-key>"
    }
  }
}`;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConnectPage() {
  const [userEmail, setUserEmail] = useState<string | null | undefined>(undefined);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    function updateOnline() {
      if (typeof navigator !== "undefined") setOnline(navigator.onLine);
    }

    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) setUserEmail(session?.user?.email ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            marginBottom: "8px",
          }}
        >
          Agent Integration
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(24px, 5vw, 36px)",
            color: "var(--fg)",
            margin: "0 0 12px 0",
            lineHeight: 1.15,
          }}
        >
          Connect your study agent
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            lineHeight: "1.6",
            maxWidth: "600px",
          }}
        >
          Point OpenClaw, Cursor, or your own HTTP client at your study data.
          It is <strong>free</strong>: your agent brings the
          compute; we serve your questions and progress. Your key only ever reads{" "}
          <strong>your</strong> data, never the full bank in bulk.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
        }}
      >
        <StatusCard
          label="Profile"
          value={
            userEmail === undefined
              ? "Checking account"
              : userEmail
                ? userEmail
                : "Sign in needed"
          }
          tone={userEmail ? "success" : userEmail === undefined ? "muted" : "accent"}
        />
        <StatusCard
          label="Agent key"
          value={userEmail ? "Ready to mint" : userEmail === undefined ? "Checking" : "Locked until sign-in"}
          tone={userEmail ? "success" : "accent"}
        />
        <StatusCard
          label="Endpoint"
          value={online ? "HTTP API online" : "Browser offline"}
          tone={online ? "success" : "muted"}
        />
      </div>

      {/* Step 1 — Get a key */}
      <Section title="Step 1 — Sign in and mint a key">
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            margin: 0,
          }}
        >
          Mint a personal access token, copy it once, and put it in your
          agent&apos;s HTTP config. You can also manage keys from{" "}
          <Link
            href="/settings"
            style={{ color: "var(--accent)", textDecoration: "underline" }}
          >
            Settings
          </Link>
          .
        </p>
        {userEmail === undefined ? (
          <p
            style={{
              fontSize: "13px",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-sans)",
              margin: 0,
            }}
          >
            Checking your sign-in state…
          </p>
        ) : userEmail ? (
          <StudyBuddyKeys />
        ) : (
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--r-sm)",
              background: "var(--bg)",
              padding: "14px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                color: "var(--fg)",
                fontFamily: "var(--font-sans)",
                lineHeight: 1.5,
                margin: "0 0 12px",
              }}
            >
              Agent keys are tied to your account so the API can scope every request to your own progress.
            </p>
            <Link
              href="/login?next=%2Fconnect"
              style={{
                height: "44px",
                padding: "0 16px",
                background: "var(--accent)",
                color: "var(--accent-fg)",
                borderRadius: "var(--r-sm)",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "var(--font-sans)",
                display: "inline-flex",
                alignItems: "center",
                textDecoration: "none",
              }}
            >
              Sign in to mint a key
            </Link>
          </div>
        )}
      </Section>

      {/* Step 2 — Base URL + auth */}
      <Section title="Step 2 — Point your HTTP client">
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            margin: 0,
          }}
        >
          All endpoints live under a single base URL. Authenticate with a{" "}
          <code
            style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
          >
            Bearer
          </code>{" "}
          header on every request.
        </p>
        <CodeBlock label="Base URL" code={BASE_URL} />
        <CodeBlock
          label="Auth header"
          code={`Authorization: Bearer sq_live_<your-key>`}
        />
        <CodeBlock label="Generic HTTP client config" code={HTTP_CLIENT_CONFIG} />
      </Section>

      {/* Step 3 — Endpoints */}
      <Section title="Step 3 — Available endpoints">
        <p
          style={{
            fontSize: "13px",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            margin: 0,
          }}
        >
          Daily limit: 200 requests per key. Questions are capped at 5 per fetch
          — no bulk export.
        </p>
        <div>
          <EndpointRow
            method="GET"
            path="/weak-objectives?n=3"
            description="Your lowest-mastery objectives, scored by recency-weighted accuracy. Start here."
          />
          <EndpointRow
            method="GET"
            path="/recent-misses?limit=5&objective=4.1"
            description="Questions you got wrong recently (your own history only). Includes stem + correct key."
          />
          <EndpointRow
            method="GET"
            path="/mastery-summary"
            description="Per-domain mastery scores and a predicted CompTIA score (100–900 scale)."
          />
          <EndpointRow
            method="GET"
            path="/objectives"
            description="Static domain + objective tree with weights. No question content."
          />
          <EndpointRow
            method="GET"
            path="/questions?objective=4.1&n=4"
            description="Up to 5 randomized questions for one objective — stem + choices only, no answer key."
          />
          <EndpointRow
            method="POST"
            path="/answer"
            description="Submit a picked answer. Returns correct/incorrect + explanation and records the result to your mastery."
          />
        </div>
        <p
          style={{
            fontSize: "12px",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            margin: 0,
            fontStyle: "italic",
          }}
        >
          There is no endpoint to list all questions at once. The questions
          endpoint is intent-based (per-objective, max 5) to keep the data
          useful for quizzing without enabling bulk export.
        </p>
      </Section>

      {/* Step 4 — Example flow */}
      <Section title="Example agent flow (curl)">
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            margin: 0,
          }}
        >
          A complete quiz-me session: find weak spots, fetch questions, submit
          answers, and have the results update your mastery automatically.
        </p>

        {/* 1 */}
        <div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--fg)",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              marginBottom: "4px",
            }}
          >
            1. Find weak objectives
          </p>
          <CodeBlock code={EXAMPLE_CURL_WEAK} />
          <CodeBlock label="Response" code={EXAMPLE_RESPONSE_WEAK} />
        </div>

        {/* 2 */}
        <div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--fg)",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              marginBottom: "4px",
            }}
          >
            2. Fetch questions for the weakest objective
          </p>
          <CodeBlock code={EXAMPLE_CURL_QUESTIONS} />
          <CodeBlock label="Response (no answer key)" code={EXAMPLE_RESPONSE_QUESTIONS} />
        </div>

        {/* 3 */}
        <div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--fg)",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              marginBottom: "4px",
            }}
          >
            3. Present question to user, then submit their answer
          </p>
          <CodeBlock code={EXAMPLE_CURL_ANSWER} />
          <CodeBlock label="Response (now safe to reveal)" code={EXAMPLE_RESPONSE_ANSWER} />
        </div>

        <p
          style={{
            fontSize: "12px",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            margin: 0,
          }}
        >
          Each POST to <code style={{ fontFamily: "var(--font-mono)" }}>/answer</code>{" "}
          records the result to your mastery and spaced-repetition queue — the
          same as practising in the app.
        </p>
      </Section>

      {/* HTTP descriptor note */}
      <Section title="HTTP tool descriptor">
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            margin: 0,
            lineHeight: "1.6",
          }}
        >
          A static tool descriptor is available at{" "}
          <a
            href="/.well-known/study-buddy-mcp.json"
            style={{ color: "var(--accent)", textDecoration: "underline", fontFamily: "var(--font-mono)", fontSize: "12px" }}
          >
            /.well-known/study-buddy-mcp.json
          </a>
          . It describes the REST tools for agent clients that can ingest an
          HTTP descriptor. This is not a separate MCP transport server; the six
          REST endpoints above map
          to the tools described there: <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>get_weak_objectives</code>,{" "}
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>get_recent_misses</code>,{" "}
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>get_mastery_summary</code>,{" "}
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>get_objectives</code>,{" "}
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>get_questions</code>, and{" "}
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>submit_answer</code>.
        </p>
      </Section>

      {/* Free forever callout */}
      <div
        style={{
          border: "1px solid var(--accent)",
          borderRadius: "var(--r-md)",
          padding: "16px 20px",
          background: "var(--surface)",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg)",
            fontFamily: "var(--font-sans)",
            margin: 0,
            lineHeight: "1.6",
          }}
        >
          <strong>Always free.</strong> There is no billing, no message cap, and
          no LLM running on our side. Your agent brings the reasoning; we provide
          your questions and progress. The limits are the 200-request daily cap
          and the 5-question-per-fetch ceiling.
        </p>
      </div>
    </div>
  );
}
