"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { getCert, getActiveCertId, DEFAULT_CERT_ID } from "@/lib/certs";

export default function ExamLandingPage() {
  const router = useRouter();

  // Resolve the active cert so the passing score shown matches the cert the user
  // is studying (falls back to the default cert before state loads).
  const [certId, setCertId] = useState<string>(DEFAULT_CERT_ID);
  useEffect(() => {
    let cancelled = false;
    db.userState
      .get(1)
      .then((state) => {
        if (!cancelled) setCertId(getActiveCertId(state ?? undefined));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const cert = getCert(certId);

  function handleStart() {
    sessionStorage.setItem("exam_ack", "1");
    router.push("/exam/run");
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
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
          Mock Exam
        </p>
        <h1
          className="font-display"
          style={{ fontSize: "32px", fontWeight: 400, color: "var(--fg)", lineHeight: 1.2 }}
        >
          Full-length mock exam
        </h1>
      </div>

      {/* Info card */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border)",
          padding: "28px 24px",
        }}
      >
        {/* Stat row */}
        <div className="flex gap-6 flex-wrap mb-6">
          <div>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
                fontFamily: "var(--font-sans)",
                marginBottom: "4px",
              }}
            >
              Questions
            </p>
            <p className="font-display" style={{ fontSize: "36px", fontWeight: 400, color: "var(--fg)", lineHeight: 1 }}>
              90
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
                fontFamily: "var(--font-sans)",
                marginBottom: "4px",
              }}
            >
              Time limit
            </p>
            <p className="font-display" style={{ fontSize: "36px", fontWeight: 400, color: "var(--fg)", lineHeight: 1 }}>
              90 min
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
                fontFamily: "var(--font-sans)",
                marginBottom: "4px",
              }}
            >
              Format
            </p>
            <p
              className="font-mono"
              style={{ fontSize: "13px", color: "var(--fg)", lineHeight: 1.4, marginTop: "4px" }}
            >
              85 MCQ + 5 PBQ
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
                fontFamily: "var(--font-sans)",
                marginBottom: "4px",
              }}
            >
              Passing score
            </p>
            <p
              className="font-mono"
              style={{ fontSize: "13px", color: "var(--fg)", lineHeight: 1.4, marginTop: "4px" }}
            >
              {cert.passingScore} / {cert.scoreMax}
            </p>
          </div>
        </div>

        <div style={{ height: "1px", background: "var(--border)", marginBottom: "20px" }} />

        {/* Warnings */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <span
              className="font-mono shrink-0"
              style={{ fontSize: "11px", color: "var(--accent)", marginTop: "2px" }}
            >
              ●
            </span>
            <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
              No explanations during the exam — review after submission only.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span
              className="font-mono shrink-0"
              style={{ fontSize: "11px", color: "var(--accent)", marginTop: "2px" }}
            >
              ●
            </span>
            <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
              Pause is not allowed once you start — simulates real test conditions.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span
              className="font-mono shrink-0"
              style={{ fontSize: "11px", color: "var(--accent)", marginTop: "2px" }}
            >
              ●
            </span>
            <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>
              The exam auto-submits when the timer reaches 0:00.
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          className="flex items-center justify-center h-12 text-sm font-medium w-full"
          style={{
            background: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-sans)",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--accent)")}
        >
          Start exam →
        </button>
      </div>

      <div className="flex justify-center">
        <Link
          href="/"
          style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}
        >
          ← Back to dashboard
        </Link>
      </div>
    </div>
  );
}
