"use client";

import { useEffect, useRef, useState } from "react";
import type { PerfQuestion } from "@/lib/db";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";

interface Props {
  question: PerfQuestion;
  /**
   * "practice" (default): self-contained — shows Check Answers + answer key with
   * correctness feedback, then Continue → onSubmit.
   * "exam": a controlled arranger only. No feedback, no buttons. The parent owns
   * the arrangement via `value` (so it survives navigation between questions) and
   * is notified of every move via `onArrangementChange`; scoring happens at submit.
   */
  mode?: "practice" | "exam";
  onSubmit?: (correctCount: number, totalPairs: number) => void;
  /** Exam mode: parent-owned right-column arrangement. Source of truth when set. */
  value?: string[];
  /** Exam mode: fired whenever the user re-arranges a pair. */
  onArrangementChange?: (slots: string[]) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function DragMatch({ question, mode = "practice", onSubmit, value, onArrangementChange }: Props) {
  const { pairs, leftLabel, rightLabel, prompt, explanation } = question;
  const isExam = mode === "exam";

  // shuffled right-column values; index corresponds to left-column slot.
  // In exam mode the parent owns the arrangement via `value` (so it persists
  // across question navigation); internal state is the fallback for first paint
  // and the only source of truth in practice mode.
  const [internalSlots, setInternalSlots] = useState<string[]>(() =>
    value ?? shuffleArray(pairs.map((p) => p.right))
  );
  const rightSlots = isExam && value ? value : internalSlots;

  // Apply a new arrangement: update local state and, in exam mode, lift it to
  // the parent so it is persisted and scored.
  function commitSlots(next: string[]) {
    setInternalSlots(next);
    if (isExam) onArrangementChange?.(next);
  }

  const [checked, setChecked] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // Touch-mode selection state
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  // Drag state
  const dragSource = useRef<string | null>(null); // value being dragged
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsTouch("ontouchstart" in window), 0);
    return () => clearTimeout(timer);
  }, []);

  // ── Drag handlers ──────────────────────────────────────────────────────────

  function handleDragStart(e: React.DragEvent, value: string) {
    dragSource.current = value;
    setSelectedRight(null); // a drag cancels any pending click-selection
    // Setting dataTransfer is REQUIRED for the drag to start in Firefox and some
    // Chromium configs — without it the drag silently never begins.
    try {
      e.dataTransfer.setData("text/plain", value);
      e.dataTransfer.effectAllowed = "move";
    } catch {
      // restricted dataTransfer — the dragSource ref still drives the drop
    }
  }

  function handleDrop(slotIndex: number) {
    const src = dragSource.current;
    setDragOverIndex(null);
    if (!src) return;
    const destValue = rightSlots[slotIndex];
    if (src === destValue) return;

    const srcIndex = rightSlots.indexOf(src);
    const next = [...rightSlots];
    if (srcIndex !== -1) {
      next[srcIndex] = destValue;
    }
    next[slotIndex] = src;
    commitSlots(next);
    dragSource.current = null;
  }

  function handleDragOver(e: React.DragEvent, slotIndex: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(slotIndex);
  }

  function handleDragLeave() {
    setDragOverIndex(null);
  }

  // ── Desktop click-to-place ──────────────────────────────────────────────────
  // Click a tile to pick it up, click another to swap. A reliable alternative to
  // HTML5 drag, which is browser-fragile — so a mouse user is never stuck.
  function handleDeskClick(slotIndex: number) {
    if (checked) return;
    const clicked = rightSlots[slotIndex];
    if (selectedRight === null) {
      setSelectedRight(clicked); // pick up
      return;
    }
    if (selectedRight === clicked) {
      setSelectedRight(null); // click the same tile → deselect
      return;
    }
    const srcIndex = rightSlots.indexOf(selectedRight);
    const next = [...rightSlots];
    if (srcIndex !== -1) next[srcIndex] = clicked;
    next[slotIndex] = selectedRight;
    commitSlots(next);
    setSelectedRight(null);
  }

  // ── Touch tap-to-select handlers ──────────────────────────────────────────

  function handleTapRight(value: string) {
    if (checked) return;
    setSelectedRight((prev) => (prev === value ? null : value));
  }

  function handleTapSlot(slotIndex: number) {
    if (checked || !selectedRight) return;
    const destValue = rightSlots[slotIndex];
    if (selectedRight === destValue) {
      setSelectedRight(null);
      return;
    }
    const srcIndex = rightSlots.indexOf(selectedRight);
    const next = [...rightSlots];
    if (srcIndex !== -1) {
      next[srcIndex] = destValue;
    }
    next[slotIndex] = selectedRight;
    commitSlots(next);
    setSelectedRight(null);
  }

  // ── Scoring ────────────────────────────────────────────────────────────────

  const [correctCount, setCorrectCount] = useState<number | null>(null);

  function handleCheck() {
    const correct = pairs.filter((p, i) => rightSlots[i] === p.right).length;
    setCorrectCount(correct);
    setChecked(true);
    // NOTE: onSubmit is NOT called here — the user must click "Continue" after
    // reviewing the answer key so DragMatch stays mounted long enough to show feedback.
  }

  function handleContinue() {
    if (correctCount !== null) {
      onSubmit?.(correctCount, pairs.length);
    }
  }
  // ── Keyboard shortcuts ─────────────────────────────────────────────────────

  const allFilled = rightSlots.every((s) => s !== "");
  useKeyboardShortcuts({
    "Enter": () => {
      // Exam mode has no Check/Continue — navigation is owned by the exam runner.
      if (isExam) return;
      if (!checked && allFilled) handleCheck();
      else if (checked) handleContinue();
    },
  });


  // ── Render helpers ─────────────────────────────────────────────────────────

  function slotBorder(i: number): string {
    if (checked) return rightSlots[i] === pairs[i].right ? "var(--success)" : "var(--error)";
    if (rightSlots[i] === selectedRight) return "var(--accent)"; // picked up via click
    return dragOverIndex === i ? "var(--accent)" : "var(--border-strong)";
  }

  function slotBg(i: number): string {
    if (checked) {
      return rightSlots[i] === pairs[i].right
        ? "rgba(95,179,124,0.08)"
        : "rgba(229,92,92,0.08)";
    }
    if (rightSlots[i] === selectedRight) return "rgba(245,166,35,0.08)";
    return dragOverIndex === i ? "rgba(245,166,35,0.08)" : "transparent";
  }

  function slotIcon(i: number): string | null {
    if (!checked) return null;
    return rightSlots[i] === pairs[i].right ? "✓" : "✗";
  }

  return (
    <div className="space-y-4">
      {/* Prompt */}
      <p
        style={{
          fontSize: "15px",
          lineHeight: 1.6,
          color: "var(--fg)",
          fontFamily: "var(--font-sans)",
        }}
      >
        {prompt}
      </p>

      {isTouch && !checked && selectedRight && (
        <p
          style={{
            fontSize: "12px",
            color: "var(--accent)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Selected: {selectedRight} — tap a left-side row to place it
        </p>
      )}

      {!isTouch && !checked && (
        <p
          style={{
            fontSize: "12px",
            color: selectedRight ? "var(--accent)" : "var(--fg-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {selectedRight
            ? `Selected: ${selectedRight} — click another row to swap`
            : "Drag a row to reorder, or click one then another to swap."}
        </p>
      )}

      {/* Column headers */}
      <div className="grid grid-cols-2 gap-3">
        <p
          className="font-mono"
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--fg-muted)",
            paddingLeft: "4px",
          }}
        >
          {leftLabel}
        </p>
        <p
          className="font-mono"
          style={{
            fontSize: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--fg-muted)",
            paddingLeft: "4px",
          }}
        >
          {rightLabel}
        </p>
      </div>

      {/* Pair rows */}
      <div className="space-y-2">
        {pairs.map((pair, i) => (
          <div key={pair.left} className="grid grid-cols-2 gap-3 items-center">
            {/* Left — locked */}
            <div
              className="font-mono"
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--r-sm)",
                padding: "10px 12px",
                fontSize: "13px",
                color: "var(--fg)",
                background: "var(--surface-2)",
                lineHeight: 1.4,
              }}
            >
              {pair.left}
            </div>

            {/* Right — draggable / tap target */}
            {isTouch ? (
              <div
                onClick={() => handleTapSlot(i)}
                style={{
                  border: `1px solid ${checked ? slotBorder(i) : selectedRight !== null ? "var(--accent)" : "var(--border-strong)"}`,
                  borderRadius: "var(--r-sm)",
                  minHeight: "44px",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: checked
                    ? (rightSlots[i] === pairs[i].right ? "var(--success)" : "var(--error)")
                    : rightSlots[i] === selectedRight ? "var(--accent)" : "var(--fg)",
                  background: checked
                    ? slotBg(i)
                    : rightSlots[i] === selectedRight
                    ? "rgba(245,166,35,0.08)"
                    : "transparent",
                  cursor: checked ? "default" : "pointer",
                  lineHeight: 1.4,
                  fontFamily: "var(--font-mono)",
                  transition: "border-color 100ms, background 100ms",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <span>{rightSlots[i]}</span>
                {slotIcon(i) && (
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "14px", flexShrink: 0 }}>
                    {slotIcon(i)}
                  </span>
                )}
              </div>
            ) : (
              <div
                draggable={!checked}
                onDragStart={(e) => handleDragStart(e, rightSlots[i])}
                onDrop={() => handleDrop(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragLeave={handleDragLeave}
                onClick={() => handleDeskClick(i)}
                style={{
                  border: `1px solid ${slotBorder(i)}`,
                  borderRadius: "var(--r-sm)",
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: checked
                    ? (rightSlots[i] === pairs[i].right ? "var(--success)" : "var(--error)")
                    : rightSlots[i] === selectedRight ? "var(--accent)" : "var(--fg)",
                  background: slotBg(i),
                  cursor: checked ? "default" : "grab",
                  lineHeight: 1.4,
                  fontFamily: "var(--font-mono)",
                  transition: "border-color 150ms, background 150ms, color 150ms",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <span>{rightSlots[i]}</span>
                {slotIcon(i) && (
                  <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "14px", flexShrink: 0 }}>
                    {slotIcon(i)}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Touch: floating right-item picker */}
      {isTouch && !checked && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "12px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--fg-muted)",
              marginBottom: "8px",
              fontFamily: "var(--font-mono)",
            }}
          >
            Tap to select, then tap a row above to place
          </p>
          <div className="space-y-2">
            {rightSlots.map((val) => (
              <button
                key={val}
                onClick={() => handleTapRight(val)}
                className="w-full text-left font-mono"
                style={{
                  border: `1px solid ${selectedRight === val ? "var(--accent)" : "var(--border-strong)"}`,
                  borderRadius: "var(--r-sm)",
                  minHeight: "44px",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: selectedRight === val ? "var(--accent)" : "var(--fg)",
                  background:
                    selectedRight === val ? "rgba(245,166,35,0.08)" : "transparent",
                  cursor: "pointer",
                  lineHeight: 1.4,
                  transition: "border-color 100ms, background 100ms",
                }}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Check answers button — practice mode only */}
      {!isExam && !checked && (
        <button
          onClick={handleCheck}
          className="w-full h-10 text-sm font-medium"
          style={{
            background: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: "var(--r-sm)",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          Check Answers
        </button>
      )}

      {/* Continue button — shown after answer key is visible */}
      {checked && (
        <button
          onClick={handleContinue}
          className="w-full h-10 text-sm font-medium"
          style={{
            background: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: "var(--r-sm)",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            marginTop: "8px",
          }}
        >
          Continue →
        </button>
      )}

      {/* Results + explanation */}
      {checked && (
        <div
          style={{
            marginTop: "8px",
            padding: "16px",
            background: "var(--surface-2)",
            borderRadius: "var(--r-sm)",
            fontSize: "13px",
            lineHeight: 1.6,
            color: "var(--fg-muted)",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--fg-muted)",
              marginBottom: "10px",
            }}
          >
            Answer Key
          </p>
          <div className="space-y-1 mb-4">
            {pairs.map((p, i) => {
              const correct = rightSlots[i] === p.right;
              return (
                <div key={p.left} className="flex gap-2 flex-wrap items-center">
                  <span style={{ fontWeight: 700, fontSize: "13px", color: correct ? "var(--success)" : "var(--error)", fontFamily: "var(--font-sans)", flexShrink: 0 }}>
                    {correct ? "✓" : "✗"}
                  </span>
                  <span className="font-mono" style={{ color: "var(--fg)", fontSize: "12px" }}>
                    {p.left}
                  </span>
                  <span style={{ color: "var(--fg-subtle)" }}>→</span>
                  <span className="font-mono" style={{ color: "var(--success)", fontSize: "12px" }}>
                    {p.right}
                  </span>
                  {!correct && (
                    <span className="font-mono" style={{ color: "var(--error)", fontSize: "12px", textDecoration: "line-through" }}>
                      ({rightSlots[i]})
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "12px",
            }}
          >
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
}
