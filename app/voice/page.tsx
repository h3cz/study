"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  VoiceTutorClient,
  type VoiceStatus,
  type VoiceQuestion,
  type VoiceAnswerReveal,
  type CaptionRole,
} from "@/lib/voice-tutor/client";
import {
  SESSION_HARD_LIMIT_SECONDS,
  SESSION_WARN_SECONDS,
} from "@/lib/voice-tutor/caps";
import { seedDb, db } from "@/lib/db";
import { recordVoiceAnswer } from "@/lib/gamification";
import type { VoiceTurnMode } from "@/lib/voice-tutor/config";
import { DEFAULT_CERT_ID, getActiveCertId } from "@/lib/certs";

function fmt(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function localDateString(): string {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD local
}

interface CaptionLine {
  id: number;
  role: CaptionRole;
  text: string;
  done: boolean;
}

export default function VoicePage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clientRef = useRef<VoiceTutorClient | null>(null);
  const warnedRef = useRef(false);
  const captionsEndRef = useRef<HTMLDivElement | null>(null);
  const captionIdRef = useRef(0);

  const [authUser, setAuthUser] = useState<User | null | undefined>(undefined);
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [remaining, setRemaining] = useState(SESSION_HARD_LIMIT_SECONDS);
  const [minutesToday, setMinutesToday] = useState<number | null>(null);
  // undefined = still checking, false = not allowed, true = allowed
  const [voiceAllowed, setVoiceAllowed] = useState<boolean | undefined>(undefined);

  // On-screen question card + answer reveal (enhancement 1).
  const [question, setQuestion] = useState<VoiceQuestion | null>(null);
  const [reveal, setReveal] = useState<VoiceAnswerReveal | null>(null);
  // Live captions (enhancement 2).
  const [captions, setCaptions] = useState<CaptionLine[]>([]);

  // Active cert resolved from user state on mount; falls back to the default
  // until state loads. Drives which cert a resolved voice answer is recorded to.
  const [certId, setCertId] = useState<string>(DEFAULT_CERT_ID);

  // Turn-detection mode: "auto" (hands-free, semantic_vad) vs "ptt" (push-to-talk).
  const [turnMode, setTurnMode] = useState<VoiceTurnMode>("auto");
  // Whether the user is currently holding the push-to-talk button.
  const [talking, setTalking] = useState(false);

  // Load the persisted mode from Dexie on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await seedDb();
        const state = await db.userState.get(1);
        if (!cancelled) setCertId(getActiveCertId(state));
        if (!cancelled && state?.voiceTurnMode) setTurnMode(state.voiceTurnMode);
      } catch {
        // best-effort — default "auto"
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist the mode whenever the user changes it (only when not in a session).
  const changeTurnMode = useCallback((mode: VoiceTurnMode) => {
    setTurnMode(mode);
    void (async () => {
      try {
        const fresh = await db.userState.get(1);
        if (fresh) await db.userState.put({ ...fresh, voiceTurnMode: mode });
      } catch {
        // best-effort
      }
    })();
  }, []);

  // Seed Dexie on mount so voice answers can be recorded locally even when the
  // voice page is the first page visited this session (questions must exist in
  // Dexie for FSRS / wrong-answer resolution).
  useEffect(() => {
    void seedDb();
  }, []);

  // Auth check.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setAuthUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setAuthUser(session?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  // Refresh remaining minutes from the server WITHOUT a full reload.
  const refreshQuota = useCallback(async () => {
    try {
      const r = await fetch(
        `/api/voice/quota?localDate=${encodeURIComponent(localDateString())}`
      );
      if (!r.ok) return;
      const d = await r.json();
      if (typeof d?.minutesRemainingToday === "number") {
        setMinutesToday(d.minutesRemainingToday);
      }
    } catch {
      // best-effort
    }
  }, []);

  // Voice access check — only when signed in (avoids needless 401s for signed-out users).
  // On allow, also seed the meter so the CTA reflects reality before any session.
  useEffect(() => {
    if (authUser === undefined) return; // still resolving auth
    if (!authUser) {
      const timer = setTimeout(() => setVoiceAllowed(false), 0);
      return () => clearTimeout(timer);
    }
    fetch("/api/voice/access")
      .then((r) => {
        if (r.status === 401) { setVoiceAllowed(false); return null; }
        return r.ok ? r.json() : null;
      })
      .then((d) => {
        if (d !== null) {
          const allowed = d?.allowed === true;
          setVoiceAllowed(allowed);
          if (allowed) void refreshQuota();
        }
      })
      .catch(() => setVoiceAllowed(false));
  }, [authUser, refreshQuota]);

  const handleEnd = useCallback(
    async (killed: boolean) => {
      await clientRef.current?.end(killed);
      setSpeaking(false);
      // Re-fetch remaining minutes so the meter reflects this session immediately.
      await refreshQuota();
    },
    [refreshQuota]
  );

  // Caption appender: stream tutor/user transcript into a scrolling list. A
  // delta extends the current open line of that role; `done` closes it.
  const appendCaption = useCallback(
    (role: CaptionRole, text: string, done: boolean) => {
      setCaptions((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === role && !last.done) {
          const updated = [...prev];
          updated[updated.length - 1] = done
            ? { ...last, text: text || last.text, done: true }
            : { ...last, text: last.text + text };
          return updated;
        }
        const line: CaptionLine = {
          id: captionIdRef.current++,
          role,
          text,
          done,
        };
        // Keep the transcript bounded so very long sessions stay light.
        const next = [...prev, line];
        return next.length > 60 ? next.slice(next.length - 60) : next;
      });
    },
    []
  );

  // Auto-scroll captions to the latest line.
  useEffect(() => {
    captionsEndRef.current?.scrollIntoView({ block: "end" });
  }, [captions]);

  // Per-session 15-min countdown (cap 1, client half).
  useEffect(() => {
    if (status !== "connected") return;
    warnedRef.current = false;
    const started = Date.now();
    const id = setInterval(() => {
      const elapsed = (Date.now() - started) / 1000;
      const left = SESSION_HARD_LIMIT_SECONDS - elapsed;
      setRemaining(left);

      // 14:00 warning — ask the tutor to wrap up.
      if (!warnedRef.current && elapsed >= SESSION_WARN_SECONDS) {
        warnedRef.current = true;
        clientRef.current?.sendSystemNudge(
          "The session has about one minute left. Wrap up your current point and encourage the user to start a new session if they want to continue."
        );
      }

      // 15:00 — hard disconnect.
      if (left <= 0) {
        clearInterval(id);
        void handleEnd(false);
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Reliable end on abrupt exit (Fix B): sendBeacon on pagehide AND on
  // visibilitychange → hidden (covers tab close, navigate away, mobile
  // background). Beacon survives unload where fetch is cancelled. The normal
  // "End session" button path still runs the clean end() with cap refresh.
  useEffect(() => {
    const endBeacon = () => clientRef.current?.endViaBeacon();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") endBeacon();
    };
    window.addEventListener("pagehide", endBeacon);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", endBeacon);
      document.removeEventListener("visibilitychange", onVisibility);
      clientRef.current?.cleanup();
    };
  }, []);

  // Record a resolved voice answer to Dexie — the SAME local-first path an
  // in-app quiz uses (single-question session + FSRS review), tagged
  // source:"voice-tutor". Idempotent per (questionId, voice session) so a
  // double-fire of submit_answer never double-records. Best-effort; a failure
  // here must never break the live session.
  const recordReveal = useCallback((reveal: VoiceAnswerReveal) => {
    const picked = reveal.picked;
    const voiceSessionId = clientRef.current?.getSessionId();
    if (!voiceSessionId) return;
    if (picked !== "A" && picked !== "B" && picked !== "C" && picked !== "D") return;
    void recordVoiceAnswer({
      questionId: reveal.questionId,
      certId,
      picked,
      correct: reveal.correct,
      voiceSessionId,
    }).catch(() => {
      // best-effort; the on-screen reveal already happened
    });
  }, [certId]);

  const handleStart = useCallback(async () => {
    setError(null);
    setRemaining(SESSION_HARD_LIMIT_SECONDS);
    setQuestion(null);
    setReveal(null);
    setCaptions([]);
    setTalking(false);
    const client = new VoiceTutorClient(audioRef.current!, {
      onStatus: setStatus,
      onError: setError,
      onSpeakingChange: setSpeaking,
      onSession: ({ minutesRemainingToday }) =>
        setMinutesToday(minutesRemainingToday),
      onQuestion: (q) => {
        setReveal(null);
        setQuestion(q);
      },
      onAnswerReveal: (r) => {
        setReveal(r);
        recordReveal(r);
      },
      onCaption: appendCaption,
    }, certId);
    clientRef.current = client;
    await client.start(localDateString(), turnMode);
  }, [appendCaption, recordReveal, turnMode, certId]);

  const connecting =
    status === "requesting-mic" || status === "minting" || status === "connecting";
  const live = status === "connected";

  // Push-to-talk press/release handlers. Pointer events cover mouse + touch +
  // pen in one path; we also stop on pointer cancel/leave so a finger sliding
  // off the button still commits the turn rather than hanging open.
  const handleTalkStart = useCallback(() => {
    if (turnMode !== "ptt" || !live) return;
    setTalking(true);
    clientRef.current?.startTalking();
  }, [turnMode, live]);

  const handleTalkEnd = useCallback(() => {
    if (turnMode !== "ptt") return;
    setTalking((wasTalking) => {
      if (wasTalking) clientRef.current?.stopTalking();
      return false;
    });
  }, [turnMode]);

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 24, paddingBottom: 80 }}>
      <audio ref={audioRef} hidden />

      {/* Header */}
      <p
        style={{
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          fontFamily: "var(--font-mono)",
          marginBottom: 8,
        }}
      >
        Live AI Tutor · Beta
      </p>
      <h1
        className="font-display"
        style={{
          fontSize: "clamp(26px, 5vw, 38px)",
          color: "var(--fg)",
          margin: "0 0 12px",
          lineHeight: 1.15,
        }}
      >
        Voice tutor
      </h1>
      <p
        style={{
          fontSize: 15,
          color: "var(--fg-muted)",
          lineHeight: 1.6,
          marginBottom: 28,
        }}
      >
        Talk to a live AI tutor that quizzes you from the real Security+ question
        bank and your weakest objectives — and talks back. Free while in beta,
        capped at <strong>30 minutes per day</strong> and 15 minutes per session.
        This uses live OpenAI compute, so it is honestly metered.{" "}
        <Link href="/credits" style={{ color: "var(--accent)", textDecoration: "underline" }}>
          Why this isn&apos;t free forever like the rest of the app.
        </Link>
      </p>

      {/* Not signed in */}
      {authUser === null && (
        <Card>
          <p style={{ fontSize: 14, color: "var(--fg-muted)", margin: 0 }}>
            Please{" "}
            <Link href="/login" style={{ color: "var(--accent)", textDecoration: "underline" }}>
              sign in
            </Link>{" "}
            to use the voice tutor. Your minutes are tracked to your account so the
            free caps can be enforced.
          </p>
        </Card>
      )}

      {/* Signed in but not on the allowlist */}
      {authUser && voiceAllowed === false && (
        <Card>
          <p style={{ fontSize: 14, color: "var(--fg-muted)", margin: 0, lineHeight: 1.6 }}>
            Voice tutor is in private beta and not yet available on your account.
          </p>
        </Card>
      )}

      {/* Signed in and allowed */}
      {authUser && voiceAllowed === true && (
        <Card>
          {/* Viz / status */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              padding: "12px 0 4px",
            }}
          >
            <Pulse active={live} speaking={speaking} />

            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  color: live ? "var(--fg)" : "var(--fg-muted)",
                  margin: 0,
                }}
              >
                {statusLabel(status, speaking, turnMode, talking)}
              </p>
              {live && (
                <p
                  style={{
                    fontSize: 28,
                    fontFamily: "var(--font-mono)",
                    color: remaining <= 60 ? "var(--accent)" : "var(--fg)",
                    margin: "6px 0 0",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {fmt(remaining)}
                </p>
              )}
            </div>
          </div>

          {error && (
            <p
              style={{
                fontSize: 13,
                color: "var(--accent)",
                background: "rgba(245,166,35,0.08)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-sm)",
                padding: "10px 12px",
                margin: "16px 0 0",
                lineHeight: 1.5,
              }}
            >
              {error}
            </p>
          )}

          {/* Question card — appears as the tutor starts reading it */}
          {live && question && (
            <QuestionCard question={question} reveal={reveal} />
          )}

          {/* Live captions */}
          {live && captions.length > 0 && (
            <Captions lines={captions} endRef={captionsEndRef} />
          )}

          {/* Mode toggle — pick how the tutor decides you're done talking.
              Hidden once a session is live (mode is locked for the session). */}
          {!live && status !== "ended" && (
            <ModeToggle mode={turnMode} onChange={changeTurnMode} disabled={connecting} />
          )}

          {/* Push-to-talk control — the bulletproof option for noisy rooms.
              Holding the button is the ONLY way a turn fires in PTT mode. */}
          {live && turnMode === "ptt" && (
            <TalkButton
              talking={talking}
              speaking={speaking}
              onStart={handleTalkStart}
              onEnd={handleTalkEnd}
            />
          )}

          {/* Controls */}
          <div style={{ marginTop: 20 }}>
            {!live && status !== "ended" && (
              <button
                onClick={handleStart}
                disabled={connecting}
                style={{
                  width: "100%",
                  height: 48,
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  border: "none",
                  borderRadius: "var(--r-sm)",
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: "var(--font-sans)",
                  cursor: connecting ? "default" : "pointer",
                  opacity: connecting ? 0.7 : 1,
                }}
              >
                {connecting ? "Connecting…" : "Start session"}
              </button>
            )}

            {live && (
              <button
                onClick={() => handleEnd(false)}
                style={{
                  width: "100%",
                  height: 48,
                  background: "transparent",
                  color: "var(--fg)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-sm)",
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                }}
              >
                End session
              </button>
            )}

            {status === "ended" && (
              <button
                onClick={() => {
                  setStatus("idle");
                  setError(null);
                  setQuestion(null);
                  setReveal(null);
                  setCaptions([]);
                }}
                style={{
                  width: "100%",
                  height: 48,
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                  border: "none",
                  borderRadius: "var(--r-sm)",
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                }}
              >
                Start another session
              </button>
            )}
          </div>

          {/* Minutes remaining */}
          <p
            style={{
              fontSize: 12,
              color: "var(--fg-muted)",
              fontFamily: "var(--font-mono)",
              textAlign: "center",
              margin: "16px 0 0",
            }}
          >
            {minutesToday !== null
              ? `${minutesToday} of 30 min left today`
              : "30 min/day · 60 min/month · free in beta"}
          </p>
        </Card>
      )}

      {/* Tips */}
      {authUser && voiceAllowed === true && status !== "connected" && (
        <div style={{ marginTop: 24 }}>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-mono)",
              marginBottom: 10,
            }}
          >
            Try saying
          </p>
          {[
            "Quiz me out loud on PKI.",
            "Explain why I keep missing 4.1.",
            "Give me a 10-minute drill on my weakest areas.",
          ].map((t) => (
            <p
              key={t}
              style={{
                fontSize: 14,
                color: "var(--fg-muted)",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              &ldquo;{t}&rdquo;
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── sub-components ───────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        padding: "24px",
      }}
    >
      {children}
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
  disabled,
}: {
  mode: VoiceTurnMode;
  onChange: (m: VoiceTurnMode) => void;
  disabled: boolean;
}) {
  const options: { value: VoiceTurnMode; label: string; sub: string }[] = [
    { value: "auto", label: "Hands-free", sub: "Just talk — best in a quiet room" },
    { value: "ptt", label: "Push to talk", sub: "Hold to speak — best for noise" },
  ];
  return (
    <div style={{ marginTop: 4 }}>
      <p
        style={{
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          fontFamily: "var(--font-mono)",
          margin: "0 0 8px",
        }}
      >
        Input mode
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        {options.map((o) => {
          const active = mode === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => !disabled && onChange(o.value)}
              disabled={disabled}
              aria-pressed={active}
              style={{
                flex: 1,
                textAlign: "left",
                padding: "10px 12px",
                borderRadius: "var(--r-sm)",
                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                background: active ? "rgba(245,166,35,0.08)" : "transparent",
                cursor: disabled ? "default" : "pointer",
                opacity: disabled ? 0.6 : 1,
                transition: "border-color 150ms ease, background 150ms ease",
              }}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: 500,
                  color: active ? "var(--fg)" : "var(--fg-muted)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {o.label}
              </span>
              <span
                style={{
                  display: "block",
                  fontSize: 11,
                  color: "var(--fg-muted)",
                  marginTop: 2,
                  lineHeight: 1.35,
                }}
              >
                {o.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TalkButton({
  talking,
  speaking,
  onStart,
  onEnd,
}: {
  talking: boolean;
  speaking: boolean;
  onStart: () => void;
  onEnd: () => void;
}) {
  return (
    <button
      type="button"
      // Pointer events unify mouse/touch/pen. Release, cancel, and leave all
      // commit the turn so a slipped finger never hangs the mic open.
      onPointerDown={(e) => {
        e.preventDefault();
        onStart();
      }}
      onPointerUp={onEnd}
      onPointerCancel={onEnd}
      onPointerLeave={onEnd}
      // Stop the long-press selection/callout on mobile.
      onContextMenu={(e) => e.preventDefault()}
      aria-pressed={talking}
      style={{
        width: "100%",
        marginTop: 20,
        minHeight: 88,
        background: talking ? "var(--accent)" : "transparent",
        color: talking ? "var(--accent-fg)" : "var(--fg)",
        border: `2px solid ${talking ? "var(--accent)" : "var(--border-strong)"}`,
        borderRadius: "var(--r-md)",
        fontSize: 18,
        fontWeight: 600,
        fontFamily: "var(--font-sans)",
        cursor: speaking ? "default" : "pointer",
        opacity: speaking ? 0.5 : 1,
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        transition: "background 120ms ease, border-color 120ms ease, transform 120ms ease",
        transform: talking ? "scale(0.99)" : "scale(1)",
      }}
    >
      {talking ? "Listening… release to send" : "Hold to talk"}
    </button>
  );
}

function QuestionCard({
  question,
  reveal,
}: {
  question: VoiceQuestion;
  reveal: VoiceAnswerReveal | null;
}) {
  const showReveal = reveal !== null && reveal.questionId === question.id;
  return (
    <div
      style={{
        marginTop: 18,
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        padding: "18px 18px 14px",
      }}
    >
      <p
        style={{
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          fontFamily: "var(--font-mono)",
          margin: "0 0 10px",
        }}
      >
        Objective {question.objectiveId}
      </p>
      <p
        className="font-display"
        style={{
          fontSize: 16,
          color: "var(--fg)",
          lineHeight: 1.5,
          margin: "0 0 14px",
        }}
      >
        {question.stem}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {question.choices.map((c) => {
          const isCorrect = showReveal && reveal!.correctKey === c.key;
          const isPicked = showReveal && reveal!.picked === c.key;
          const isWrongPick = isPicked && !isCorrect;

          let borderColor = "var(--border)";
          let bg = "transparent";
          let fg = "var(--fg)";
          if (isCorrect) {
            borderColor = "var(--success, #2e7d32)";
            bg = "rgba(46,125,50,0.10)";
            fg = "var(--fg)";
          } else if (isWrongPick) {
            borderColor = "var(--accent)";
            bg = "rgba(245,166,35,0.08)";
          }

          return (
            <div
              key={c.key}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                border: `1px solid ${borderColor}`,
                background: bg,
                borderRadius: "var(--r-sm)",
                padding: "10px 12px",
                transition: "border-color 150ms ease, background 150ms ease",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: isCorrect
                    ? "var(--success, #2e7d32)"
                    : "var(--fg-muted)",
                  minWidth: 16,
                }}
              >
                {c.key}
              </span>
              <span style={{ fontSize: 14, color: fg, lineHeight: 1.45 }}>
                {c.text}
                {isCorrect && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--success, #2e7d32)",
                    }}
                  >
                    correct
                  </span>
                )}
                {isWrongPick && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      color: "var(--accent)",
                    }}
                  >
                    your pick
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      {showReveal && reveal!.explanation && (
        <p
          style={{
            fontSize: 13,
            color: "var(--fg-muted)",
            lineHeight: 1.6,
            margin: "14px 0 0",
            paddingTop: 12,
            borderTop: "1px solid var(--border)",
          }}
        >
          {reveal!.explanation}
        </p>
      )}
    </div>
  );
}

function Captions({
  lines,
  endRef,
}: {
  lines: CaptionLine[];
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      aria-live="polite"
      style={{
        marginTop: 16,
        maxHeight: 180,
        overflowY: "auto",
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-sm)",
        padding: "12px 14px",
        fontFamily: "var(--font-sans)",
      }}
    >
      {lines.map((l) => (
        <p
          key={l.id}
          style={{
            fontSize: 13,
            lineHeight: 1.55,
            margin: "0 0 6px",
            color: l.role === "tutor" ? "var(--fg)" : "var(--fg-muted)",
            fontStyle: l.role === "user" ? "italic" : "normal",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--fg-muted)",
              marginRight: 8,
            }}
          >
            {l.role === "tutor" ? "Tutor" : "You"}
          </span>
          {l.text}
        </p>
      ))}
      <div ref={endRef} />
    </div>
  );
}

function Pulse({ active, speaking }: { active: boolean; speaking: boolean }) {
  const size = 96;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "rgba(245,166,35,0.10)" : "var(--bg)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        transition: "transform 200ms ease",
        transform: speaking ? "scale(1.06)" : "scale(1)",
        animation: speaking ? "voicePulse 1.1s ease-in-out infinite" : "none",
      }}
    >
      {/* Mic glyph */}
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="9"
          y="3"
          width="6"
          height="11"
          rx="3"
          stroke={active ? "var(--accent)" : "var(--fg-muted)"}
          strokeWidth="1.6"
        />
        <path
          d="M5 11a7 7 0 0 0 14 0M12 18v3"
          stroke={active ? "var(--accent)" : "var(--fg-muted)"}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <style>{`@keyframes voicePulse {0%,100%{box-shadow:0 0 0 0 rgba(245,166,35,0.25)}50%{box-shadow:0 0 0 12px rgba(245,166,35,0)}}`}</style>
    </div>
  );
}

function statusLabel(
  status: VoiceStatus,
  speaking: boolean,
  mode: VoiceTurnMode,
  talking: boolean
): string {
  switch (status) {
    case "requesting-mic":
      return "Requesting microphone…";
    case "minting":
      return "Starting session…";
    case "connecting":
      return "Connecting…";
    case "connected":
      if (speaking) return "Tutor speaking…";
      if (mode === "ptt") return talking ? "Listening…" : "Hold to talk to answer";
      return "Listening — your turn";
    case "ended":
      return "Session ended";
    case "error":
      return "Something went wrong";
    default:
      return "Ready when you are";
  }
}
