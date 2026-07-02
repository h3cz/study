"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { seedDb, db } from "@/lib/db";
import { matchExpansion } from "@/lib/drill";
import type { Acronym } from "@/lib/db";
import { getActiveCertId } from "@/lib/certs";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";

interface Attempt {
  acronymId: string;
  userAnswer: string;
  correct: boolean;
  ms: number;
}

type FlashState = "idle" | "correct" | "wrong";

function DrillRunner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const durationParam = searchParams.get("duration");
  const totalSeconds = Math.max(10, Math.min(300, parseInt(durationParam ?? "60", 10)));

  const [deck, setDeck] = useState<Acronym[]>([]);
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [inputVal, setInputVal] = useState("");
  const [flash, setFlash] = useState<FlashState>("idle");
  const [showCorrect, setShowCorrect] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardStartRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneRef = useRef(false);

  // Load + shuffle deck
  useEffect(() => {
    async function load() {
      await seedDb();
      const state = await db.userState.get(1);
      const activeCertId = getActiveCertId(state);
      const all = await db.acronyms.where("certId").equals(activeCertId).toArray();
      // Fisher-Yates shuffle
      const arr = [...all];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setDeck(arr);
      setReady(true);
      cardStartRef.current = Date.now();
    }
    load();
  }, []);

  // Timer
  useEffect(() => {
    if (!ready) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [ready]);

  // When timer hits 0, save to sessionStorage and navigate to results
  useEffect(() => {
    if (timeLeft === 0 && ready && !doneRef.current) {
      doneRef.current = true;
      finishDrill();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, ready]);

  function finishDrill(finalAttempts?: Attempt[], finalSkipped?: number) {
    const att = finalAttempts ?? attempts;
    const sk = finalSkipped ?? skipped;
    const correct = att.filter((a) => a.correct).length;
    const incorrect = att.filter((a) => !a.correct).length;
    const payload = {
      durationSeconds: totalSeconds,
      correct,
      incorrect,
      skipped: sk,
      attempts: att,
    };
    sessionStorage.setItem("drillResults", JSON.stringify(payload));
    router.push("/drill/results");
  }

  function advance(newAttempts: Attempt[], newSkipped: number) {
    setIndex((i) => i + 1);
    setInputVal("");
    setShowCorrect(null);
    setFlash("idle");
    cardStartRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 50);

    // If we've exhausted the deck, finish early
    if (index + 1 >= deck.length) {
      doneRef.current = true;
      clearInterval(timerRef.current!);
      finishDrill(newAttempts, newSkipped);
    }
  }

  function handleSubmit() {
    if (!currentCard || flash !== "idle") return;
    const ms = Date.now() - cardStartRef.current;
    const correct = matchExpansion(inputVal.trim(), currentCard.expansion);
    const newAttempt: Attempt = {
      acronymId: currentCard.id,
      userAnswer: inputVal.trim(),
      correct,
      ms,
    };
    const newAttempts = [...attempts, newAttempt];
    setAttempts(newAttempts);

    if (correct) {
      setFlash("correct");
      setTimeout(() => {
        advance(newAttempts, skipped);
      }, 100);
    } else {
      setFlash("wrong");
      setShowCorrect(currentCard.expansion);
      setTimeout(() => {
        advance(newAttempts, skipped);
      }, 1600);
    }
  }

  function handleSkip() {
    if (!currentCard || flash !== "idle") return;
    const ms = Date.now() - cardStartRef.current;
    const newAttempt: Attempt = {
      acronymId: currentCard.id,
      userAnswer: "",
      correct: false,
      ms,
    };
    const newAttempts = [...attempts, newAttempt];
    const newSkipped = skipped + 1;
    setAttempts(newAttempts);
    setSkipped(newSkipped);
    advance(newAttempts, newSkipped);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Tab" || e.key === "?") {
      e.preventDefault();
      handleSkip();
    }
  }

  const currentCard = deck[index] ?? null;

  const flashBg =
    flash === "correct"
      ? "rgba(95,179,124,0.18)"
      : flash === "wrong"
      ? "rgba(229,92,92,0.14)"
      : "var(--surface)";

  const flashBorder =
    flash === "correct"
      ? "var(--success)"
      : flash === "wrong"
      ? "var(--error)"
      : "var(--border)";

  // Format time as M:SS
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
  const timeUrgent = timeLeft <= 10;

  const correct = attempts.filter((a) => a.correct).length;
  const [confirmEnd, setConfirmEnd] = useState(false);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useKeyboardShortcuts({
    "Escape": () => { if (!doneRef.current) setConfirmEnd(true); },
  });


  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)" }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-[70vh] px-4 pt-6 pb-8 gap-6 relative">
      {/* Top bar: score + timer */}
      <div className="w-full flex items-center justify-between" style={{ maxWidth: "520px" }}>
        <div
          className="font-mono"
          style={{ fontSize: "13px", color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}
        >
          {correct} correct
        </div>
        <div
          className="font-mono"
          style={{
            fontSize: "28px",
            fontWeight: 700,
            fontVariantNumeric: "tabular-nums",
            color: timeUrgent ? "var(--error)" : "var(--fg)",
            letterSpacing: "-0.02em",
            transition: "color 300ms",
          }}
        >
          {timeStr}
        </div>
      </div>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: flashBg,
          border: `1px solid ${flashBorder}`,
          borderRadius: "var(--r-md)",
          padding: "40px 32px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          transition: "background 80ms, border-color 80ms",
          minHeight: "220px",
          justifyContent: "center",
        }}
      >
        {currentCard ? (
          <>
            {/* Acronym */}
            <span
              className="font-mono"
              style={{ fontSize: "clamp(56px, 14vw, 80px)", fontWeight: 700, color: "var(--fg)", letterSpacing: "-0.02em", lineHeight: 1 }}
            >
              {currentCard.acronym}
            </span>

            {/* Hint */}
            {currentCard.hint && (
              <span style={{ fontSize: "13px", color: "var(--fg-subtle)", fontFamily: "var(--font-sans)", textAlign: "center" }}>
                {currentCard.hint}
              </span>
            )}

            {/* Wrong answer correction */}
            {showCorrect && (
              <div
                style={{
                  background: "rgba(229,92,92,0.10)",
                  border: "1px solid var(--error)",
                  borderRadius: "var(--r-sm)",
                  padding: "8px 14px",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: "13px", color: "var(--error)", fontFamily: "var(--font-mono)" }}>
                  {showCorrect}
                </span>
              </div>
            )}
          </>
        ) : (
          <span style={{ fontSize: "18px", color: "var(--fg-muted)" }}>Loading…</span>
        )}
      </div>

      {/* Input */}
      <div style={{ width: "100%", maxWidth: "520px", display: "flex", gap: "8px" }}>
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Type the expansion…"
          disabled={flash !== "idle"}
          style={{
            flex: 1,
            height: "48px",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--r-sm)",
            padding: "0 14px",
            // 16px minimum prevents iOS Safari from auto-zooming on focus.
            fontSize: "16px",
            fontFamily: "var(--font-mono)",
            color: "var(--fg)",
            background: "var(--bg)",
            outline: "none",
            opacity: flash !== "idle" ? 0.5 : 1,
          }}
        />
        <button
          onClick={handleSkip}
          disabled={flash !== "idle"}
          style={{
            height: "48px",
            padding: "0 16px",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--r-sm)",
            background: "transparent",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            opacity: flash !== "idle" ? 0.5 : 1,
          }}
        >
          Skip (Tab)
        </button>
      </div>

      {/* Progress hint */}
      <p style={{ fontSize: "11px", color: "var(--fg-subtle)", fontFamily: "var(--font-sans)" }}>
        Enter to submit · Tab or ? to skip · Esc to end early
      </p>

      {/* End early confirm */}
      {confirmEnd && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "var(--r-md)",
              border: "1px solid var(--border-strong)",
              padding: "24px",
              maxWidth: "320px",
              width: "100%",
            }}
          >
            <p style={{ fontSize: "15px", color: "var(--fg)", marginBottom: "8px", fontFamily: "var(--font-sans)" }}>
              End drill early?
            </p>
            <p style={{ fontSize: "13px", color: "var(--fg-muted)", marginBottom: "20px", fontFamily: "var(--font-sans)" }}>
              Your current score will be saved.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  setConfirmEnd(false);
                  doneRef.current = true;
                  clearInterval(timerRef.current!);
                  finishDrill(attempts, skipped);
                }}
                style={{
                  flex: 1,
                  height: "40px",
                  background: "var(--fg)",
                  color: "var(--bg)",
                  border: "none",
                  borderRadius: "var(--r-sm)",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                }}
              >
                End Drill
              </button>
              <button
                onClick={() => setConfirmEnd(false)}
                style={{
                  height: "40px",
                  padding: "0 16px",
                  background: "transparent",
                  color: "var(--fg-muted)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                }}
              >
                Keep Going
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DrillRunPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)" }}>
          Loading…
        </div>
      }
    >
      <DrillRunner />
    </Suspense>
  );
}
