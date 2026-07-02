"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { seedDb, db } from "@/lib/db";
import { getDueFlashcards, rateFlashcard, type FSRSRating } from "@/lib/fsrs";
import { recordFlashcardReview } from "@/lib/gamification";
import { enqueue } from "@/lib/sync/engine";
import type { Flashcard } from "@/lib/db";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";
import { ttsAvailable, speak, stopSpeaking, buildFlashcardSpeech } from "@/lib/tts";
import { SpeakerIcon } from "@/components/icons/SpeakerIcon";
import { DEFAULT_CERT_ID, getActiveCertId } from "@/lib/certs";

type Phase = "loading" | "front" | "back" | "done";

const RATINGS: {
  label: string;
  value: FSRSRating;
  style: "subtle" | "subtle" | "amber-outline" | "amber-fill";
  css: React.CSSProperties;
  hoverBg?: string;
}[] = [
  {
    label: "Again",
    value: "Again",
    style: "subtle",
    css: {
      background: "var(--surface-2)",
      color: "var(--fg-muted)",
      border: "1px solid var(--border)",
    },
  },
  {
    label: "Hard",
    value: "Hard",
    style: "subtle",
    css: {
      background: "var(--surface-2)",
      color: "var(--fg-muted)",
      border: "1px solid var(--border)",
    },
  },
  {
    label: "Good",
    value: "Good",
    style: "amber-outline",
    css: {
      background: "transparent",
      color: "var(--accent)",
      border: "1px solid var(--accent)",
    },
  },
  {
    label: "Easy",
    value: "Easy",
    style: "amber-fill",
    css: {
      background: "var(--accent)",
      color: "var(--accent-fg)",
      border: "1px solid var(--accent)",
    },
  },
];

const ratingNumeric: Record<FSRSRating, number> = {
  Again: 1,
  Hard: 2,
  Good: 3,
  Easy: 4,
};

export default function FlashcardsPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [queue, setQueue] = useState<Flashcard[]>([]);
  // Active cert resolved from user state on mount; falls back to the default
  // until state loads so the initial render is safe.
  const [certId, setCertId] = useState<string>(DEFAULT_CERT_ID);
  const [index, setIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [xpTotal, setXpTotal] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);

  // ── Audio state ─────────────────────────────────────────────────────────────
  const hasTts = ttsAvailable();
  const [speaking, setSpeaking] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [audioRate, setAudioRate] = useState(1.0);
  const [audioVoiceURI, setAudioVoiceURI] = useState<string | undefined>(undefined);
  // Track autoplay timer so we can cancel on unmount/navigation
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function load() {
      await seedDb();
      // Resolve the active cert first so the due-card query targets it.
      const state = await db.userState.get(1);
      const activeCertId = getActiveCertId(state);
      setCertId(activeCertId);
      const due = await getDueFlashcards(activeCertId);
      setQueue(due);
      setTotalCount(due.length);
      setPhase(due.length > 0 ? "front" : "done");

      // Load saved audio prefs
      if (state) {
        setAutoplay(state.audioAutoplay ?? false);
        setAudioRate(state.audioRate ?? 1.0);
        setAudioVoiceURI(state.audioVoiceURI);
      }
    }
    load();

    // Stop speech on unmount
    return () => {
      stopSpeaking();
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    };
  }, []);

  // ── Auto-play: when phase flips to "front", read the front ─────────────────
  useEffect(() => {
    if (!autoplay || !hasTts) return;
    const card = queue[index];
    if (!card) return;

    if (phase === "front") {
      // Small delay so the card has rendered
      autoplayTimerRef.current = setTimeout(() => {
        setSpeaking(true);
        speak(buildFlashcardSpeech(card.front), {
          rate: audioRate,
          voiceURI: audioVoiceURI,
          onEnd: () => {
            setSpeaking(false);
            // After front reads, pause 2.5 s then flip to back
            autoplayTimerRef.current = setTimeout(() => {
              setPhase((p) => (p === "front" ? "back" : p));
            }, 2500);
          },
        });
      }, 200);
    } else if (phase === "back") {
      // Read the back after flip
      autoplayTimerRef.current = setTimeout(() => {
        setSpeaking(true);
        speak(buildFlashcardSpeech(card.front, card.back), {
          rate: audioRate,
          voiceURI: audioVoiceURI,
          onEnd: () => setSpeaking(false),
        });
      }, 200);
    }

    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, autoplay]);

  // ── Manual speak helper ─────────────────────────────────────────────────────
  function handleSpeak() {
    const card = queue[index];
    if (!card || !hasTts) return;
    const text =
      phase === "back"
        ? buildFlashcardSpeech(card.front, card.back)
        : buildFlashcardSpeech(card.front);

    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(text, {
      rate: audioRate,
      voiceURI: audioVoiceURI,
      onEnd: () => setSpeaking(false),
    });
  }

  // ── Toggle auto-play and persist ────────────────────────────────────────────
  async function handleAutoplayToggle() {
    const next = !autoplay;
    setAutoplay(next);
    if (!next) {
      stopSpeaking();
      setSpeaking(false);
    }
    const state = await db.userState.get(1);
    if (state) {
      await db.userState.put({ ...state, audioAutoplay: next });
    }
  }

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  // Must be declared BEFORE any conditional returns so hooks run in the
  // same order on every render (avoids React error #310).
  useKeyboardShortcuts({
    " ": () => { if (phase === "front") setPhase("back"); },
    "1": () => { if (phase === "back") void handleRate("Again"); },
    "2": () => { if (phase === "back") void handleRate("Hard"); },
    "3": () => { if (phase === "back") void handleRate("Good"); },
    "4": () => { if (phase === "back") void handleRate("Easy"); },
    "s": () => { if (phase === "front" || phase === "back") handleSpeak(); },
  });

  const current = queue[index];

  async function handleRate(rating: FSRSRating) {
    if (!current) return;
    // Stop any speech when rating
    stopSpeaking();
    setSpeaking(false);

    const { card: nextCard } = await rateFlashcard(current, rating);
    const { xpEarned, reviewedAt } = await recordFlashcardReview(
      current.id,
      certId,
      ratingNumeric[rating]
    );
    setXpTotal((x) => x + xpEarned);
    setReviewedCount((c) => c + 1);

    // Reuse the exact reviewedAt written to db.reviews so the cross-device
    // down-sync dedups history rows (flashcardId|reviewedAt|rating) cleanly.
    enqueue("insert_flashcard_review", {
      user_id: "",
      flashcard_id: current.id,
      cert_id: certId,
      objective_id: current.objectiveId,
      reviewed_at: reviewedAt,
      rating: ratingNumeric[rating],
      fsrs_state: nextCard as unknown as Record<string, unknown>,
    }).catch(() => {});

    if (index + 1 >= queue.length) {
      setPhase("done");
    } else {
      setIndex(index + 1);
      setPhase("front");
    }
  }

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)" }}>
        Loading flashcards…
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="max-w-3xl mx-auto">
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--border)",
            padding: "40px 24px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "14px", fontWeight: 500, color: "var(--fg)", marginBottom: "8px" }}>
            {totalCount === 0 ? "No flashcards due right now." : "Review complete"}
          </h2>
          {totalCount === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--fg-muted)", lineHeight: "24px", marginBottom: "0" }}>
              Come back in a few hours, or browse the deck while it warms up.
            </p>
          ) : (
            <>
              <p style={{ fontSize: "13px", color: "var(--fg-muted)", marginBottom: "16px" }}>
                Reviewed {reviewedCount} card{reviewedCount !== 1 ? "s" : ""}
              </p>
              <span
                className="font-mono"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  borderRadius: "var(--r-sm)",
                  padding: "4px 10px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                +{xpTotal} XP earned
              </span>
            </>
          )}
          <div className="flex gap-3 pt-6 justify-center flex-wrap">
            <Link
              href="/"
              className="h-10 px-6 flex items-center text-sm font-medium"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
                borderRadius: "var(--r-sm)",
                textDecoration: "none",
              }}
            >
              Back to Dashboard
            </Link>
            {totalCount === 0 && (
              <Link
                href="/library?tab=flashcards"
                className="h-10 px-6 flex items-center text-sm font-medium"
                style={{
                  background: "transparent",
                  color: "var(--fg)",
                  borderRadius: "var(--r-sm)",
                  border: "1px solid var(--border-strong)",
                  textDecoration: "none",
                }}
              >
                Browse deck →
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }
  if (!current) return null;

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Progress + auto-play pill */}
      <div className="flex items-center gap-3">
        <div
          style={{
            flex: 1,
            height: "2px",
            background: "var(--border-strong)",
            borderRadius: "1px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((index + 1) / totalCount) * 100}%`,
              background: "var(--accent)",
              transition: "width 150ms ease-out",
            }}
          />
        </div>
        <span
          className="font-mono shrink-0"
          style={{ fontSize: "12px", color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}
        >
          {index + 1}/{totalCount}
        </span>

        {/* Auto-play pill — only shown when TTS is available */}
        {hasTts && (
          <button
            onClick={handleAutoplayToggle}
            title="Auto-play: reads card front, pauses, then reads back"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              minHeight: "36px",
              padding: "0 12px",
              borderRadius: "var(--r-sm)",
              border: `1px solid ${autoplay ? "var(--accent)" : "var(--border-strong)"}`,
              background: autoplay ? "rgba(245,166,35,0.10)" : "transparent",
              color: autoplay ? "var(--accent)" : "var(--fg-muted)",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 150ms",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <SpeakerIcon size={11} speaking={autoplay} />
            Auto-play
          </button>
        )}
      </div>

      {/* Flashcard */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border)",
          minHeight: "280px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 24px",
            textAlign: "center",
          }}
        >
          {phase === "front" ? (
            <>
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--fg-subtle)",
                  marginBottom: "20px",
                }}
              >
                Term
              </div>
              {/* Front in Fraunces */}
              <p
                className="font-display"
                style={{
                  fontSize: "clamp(22px, 4vw, 34px)",
                  fontWeight: 400,
                  lineHeight: 1.3,
                  color: "var(--fg)",
                  padding: "0 8px",
                }}
              >
                {current.front}
              </p>

              {/* Speaker button for front */}
              {hasTts && (
                <button
                  onClick={handleSpeak}
                  aria-label={speaking ? "Stop reading" : "Read term aloud (S)"}
                  title={speaking ? "Stop" : "Read aloud (S)"}
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    minHeight: "44px",
                    padding: "0 14px",
                    border: `1px solid ${speaking ? "var(--accent)" : "var(--border-strong)"}`,
                    borderRadius: "var(--r-sm)",
                    background: speaking ? "rgba(245,166,35,0.10)" : "transparent",
                    color: speaking ? "var(--accent)" : "var(--fg-muted)",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                    cursor: "pointer",
                    transition: "all 150ms",
                  }}
                >
                  <SpeakerIcon size={12} speaking={speaking} />
                  {speaking ? "Stop" : "S"}
                </button>
              )}

              <button
                className="mt-8 h-10 px-6 text-sm font-medium transition-colors"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  borderRadius: "var(--r-sm)",
                  border: "none",
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                }}
                onClick={() => setPhase("back")}
              >
                Reveal Answer
              </button>
            </>
          ) : (
            <>
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--fg-subtle)",
                  marginBottom: "8px",
                }}
              >
                Answer
              </div>
              <p style={{ fontSize: "12px", color: "var(--fg-muted)", marginBottom: "16px", padding: "0 8px" }}>
                {current.front}
              </p>
              <div style={{ width: "100%", height: "1px", background: "var(--border)", marginBottom: "16px" }} />
              {/* Back in Inter Tight */}
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "var(--fg)",
                  padding: "0 8px",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {current.back}
              </p>

              {/* Speaker button for back */}
              {hasTts && (
                <button
                  onClick={handleSpeak}
                  aria-label={speaking ? "Stop reading" : "Read answer aloud (S)"}
                  title={speaking ? "Stop" : "Read aloud (S)"}
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    minHeight: "44px",
                    padding: "0 14px",
                    border: `1px solid ${speaking ? "var(--accent)" : "var(--border-strong)"}`,
                    borderRadius: "var(--r-sm)",
                    background: speaking ? "rgba(245,166,35,0.10)" : "transparent",
                    color: speaking ? "var(--accent)" : "var(--fg-muted)",
                    fontSize: "11px",
                    fontFamily: "var(--font-mono)",
                    cursor: "pointer",
                    transition: "all 150ms",
                  }}
                >
                  <SpeakerIcon size={12} speaking={speaking} />
                  {speaking ? "Stop" : "S"}
                </button>
              )}

              {/* Rating buttons */}
              <div style={{ marginTop: "28px", width: "100%" }}>
                <p style={{ fontSize: "11px", color: "var(--fg-subtle)", marginBottom: "10px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  How well did you know this?
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {RATINGS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => handleRate(r.value)}
                      className="text-sm font-medium transition-colors relative"
                      style={{
                        ...r.css,
                        minHeight: "48px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "var(--r-sm)",
                        fontFamily: "var(--font-sans)",
                        cursor: "pointer",
                        outline: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.82";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                      onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent)"; }}
                      onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                    >
                      {r.label}
                      <span
                        className="hidden lg:block font-mono"
                        style={{ fontSize: "9px", opacity: 0.45, marginTop: "2px" }}
                      >
                        ({RATINGS.indexOf(r) + 1})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Objective label */}
      <div className="text-center">
        <span
          className="font-mono"
          style={{
            fontSize: "11px",
            color: "var(--fg-subtle)",
          }}
        >
          {current.objectiveId.split(":obj:")[1]}
        </span>
      </div>
    </div>
  );
}
