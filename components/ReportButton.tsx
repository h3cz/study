"use client";

import { useEffect, useRef, useState } from "react";
import { reportQuestion, isQuestionReported } from "@/lib/reports";
import type { ReportedQuestion } from "@/lib/db";

const REASONS: { value: ReportedQuestion["reason"]; label: string }[] = [
  { value: "wrong-answer", label: "Wrong answer" },
  { value: "ambiguous", label: "Ambiguous wording" },
  { value: "stale", label: "Stale info" },
  { value: "typo", label: "Typo" },
  { value: "other", label: "Other" },
];

interface ReportButtonProps {
  questionId: string;
  certId?: string;
}

export default function ReportButton({
  questionId,
  certId = "secplus-sy0-701",
}: ReportButtonProps) {
  const [reported, setReported] = useState(false);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportedQuestion["reason"]>("wrong-answer");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Check if already reported on mount
  useEffect(() => {
    isQuestionReported(questionId).then(setReported).catch(() => {});
  }, [questionId]);

  // Close popover on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent | TouchEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [open]);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await reportQuestion({
        questionId,
        certId,
        reason,
        note: note.trim() || undefined,
      });
      setReported(true);
      setOpen(false);
      setNote("");
    } catch {
      // Silent fail — report is best-effort
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      ref={popoverRef}
      style={{ marginTop: "12px", position: "relative" }}
    >
      {/* Trigger button — shows "✓ Reported" when already reported but remains clickable */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none",
          border: "none",
          // ~40px tappable height while staying an inline text trigger.
          padding: "10px 4px",
          margin: "-10px -4px",
          minHeight: "40px",
          display: "inline-flex",
          alignItems: "center",
          fontSize: "12px",
          color: "var(--fg-subtle, var(--fg-muted))",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.04em",
          cursor: "pointer",
          opacity: 0.6,
          transition: "opacity 150ms",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.6"; }}
        aria-label={reported ? "Already reported — click to report again" : "Flag this question"}
      >
        {reported ? "✓ Reported" : "Report"}
      </button>

      {/* Popover */}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            zIndex: 50,
            background: "var(--surface)",
            border: "1px solid var(--border-strong)",
            borderRadius: "4px",
            padding: "14px 16px",
            width: "clamp(240px, 90vw, 320px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--fg-muted)",
              marginBottom: reported ? "6px" : "10px",
            }}
          >
            Flag this question
          </p>
          {reported && (
            <p
              style={{
                fontSize: "11px",
                fontFamily: "var(--font-sans)",
                color: "var(--fg-muted)",
                marginBottom: "10px",
                lineHeight: "1.4",
              }}
            >
              Already reported. Submitting again creates a new entry (e.g., updated note).
            </p>
          )}

          {/* Reason radios */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "10px" }}>
            {REASONS.map(({ value, label }) => (
              <label
                key={value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  color: reason === value ? "var(--fg)" : "var(--fg-muted)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "color 100ms",
                }}
              >
                <input
                  type="radio"
                  name={`report-reason-${questionId}`}
                  value={value}
                  checked={reason === value}
                  onChange={() => setReason(value)}
                  style={{ accentColor: "var(--accent)", cursor: "pointer" }}
                />
                {label}
              </label>
            ))}
          </div>

          {/* Optional note */}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 200))}
            placeholder="Optional note (max 200 chars)"
            rows={2}
            style={{
              width: "100%",
              background: "var(--surface-2)",
              border: "1px solid var(--border-strong)",
              borderRadius: "4px",
              color: "var(--fg)",
              // 16px avoids iOS focus auto-zoom on the note field.
              fontSize: "16px",
              fontFamily: "var(--font-sans)",
              padding: "8px 8px",
              resize: "none",
              marginBottom: "10px",
              boxSizing: "border-box",
              outline: "none",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
          />

          {/* Actions */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                flex: 1,
                height: "40px",
                background: "var(--accent)",
                color: "var(--accent-fg)",
                border: "none",
                borderRadius: "4px",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                cursor: submitting ? "default" : "pointer",
                opacity: submitting ? 0.6 : 1,
                transition: "opacity 150ms",
              }}
            >
              {submitting ? "Submitting…" : "Submit"}
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--fg-muted)",
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
                padding: "0 4px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
