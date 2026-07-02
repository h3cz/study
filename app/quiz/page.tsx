"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { buildDailyQuiz, type QuizMode } from "@/lib/quiz";
import { recordQuizResult, getUserState } from "@/lib/gamification";
import { enqueue } from "@/lib/sync/engine";
import { db } from "@/lib/db";
import { seedDb } from "@/lib/db";
import type { Question, AnswerRecord, ConfidenceLevel, InProgressQuiz } from "@/lib/db";
import { getExplanationsForQuestion } from "@/lib/distractor-explanations";
import { useKeyboardShortcuts } from "@/lib/useKeyboardShortcuts";
import { getQuestionBankAvgMs, formatMs } from "@/lib/pace";
import { ttsAvailable, speak, stopSpeaking, buildQuestionSpeech } from "@/lib/tts";
import { SpeakerIcon } from "@/components/icons/SpeakerIcon";
import BookmarkButton from "@/components/BookmarkButton";
import ReportButton from "@/components/ReportButton";
import RemediationLink from "@/components/RemediationLink";
import { EmptyState } from "@/components/icons/EmptyState";
import { DEFAULT_CERT_ID, getActiveCertId } from "@/lib/certs";
import { GuestRunSavePrompt } from "@/components/GuestRunSavePrompt";

type Phase = "loading" | "question" | "confidence" | "revealed" | "flag-review" | "done" | "no-video-questions" | "qid-not-found" | "fsrs-empty";

const CONFIDENCE_OPTIONS: { level: ConfidenceLevel; label: string; sub: string }[] = [
  { level: "low", label: "Low", sub: "Wild guess" },
  { level: "medium", label: "Medium", sub: "Pretty sure" },
  { level: "high", label: "High", sub: "Confident" },
];

function QuizInner() {
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  // Active cert resolved from user state on mount; drives all content queries +
  // scoring. Falls back to the default until state loads so the first render
  // (before the load effect resolves) never crashes.
  const [certId, setCertId] = useState<string>(DEFAULT_CERT_ID);
  const [quizSize, setQuizSize] = useState(10);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answerRecords, setAnswerRecords] = useState<AnswerRecord[]>([]);
  const [confidences, setConfidences] = useState<Record<string, "low" | "medium" | "high">>({});
  const [displayXp, setDisplayXp] = useState(0);
  const xpAnimRef = useRef(false);
  const [newStreak, setNewStreak] = useState(0);
  const [missedObjectives, setMissedObjectives] = useState<string[]>([]);
  const [confidencePromptPref, setConfidencePromptPref] = useState<"always" | "off">("always");
  const [wrongExplanations, setWrongExplanations] = useState<Record<string, string> | null>(null);
  const [quizMode, setQuizMode] = useState<QuizMode>("daily");
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [bankAvgMs, setBankAvgMs] = useState<number | null>(null);
  const [currentQuestionMs, setCurrentQuestionMs] = useState<number | null>(null);
  const [finalWeekLocked, setFinalWeekLocked] = useState(false);
  const questionStartRef = useRef<number>(0);
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quizStartedAtRef = useRef<string>(new Date().toISOString());
  // ── Audio (TTS) ─────────────────────────────────────────────────────────────
  const hasTts = ttsAvailable();
  const [quizSpeaking, setQuizSpeaking] = useState(false);
  const [audioRate, setAudioRate] = useState(1.0);
  const [audioVoiceURI, setAudioVoiceURI] = useState<string | undefined>(undefined);

  // Stop speech on unmount (navigation away)
  useEffect(() => {
    return () => { stopSpeaking(); };
  }, []);

  // Stop speech when answer is revealed or question advances
  useEffect(() => {
    if (phase === "revealed" || phase === "question") {
      stopSpeaking();
      const timer = setTimeout(() => setQuizSpeaking(false), 0);
      return () => clearTimeout(timer);
    }
  }, [phase, index]);

  function handleQuizSpeak() {
    if (!current || !hasTts) return;
    if (quizSpeaking) {
      stopSpeaking();
      setQuizSpeaking(false);
      return;
    }
    const text = buildQuestionSpeech(current.stem, current.choices);
    setQuizSpeaking(true);
    speak(text, {
      rate: audioRate,
      voiceURI: audioVoiceURI,
      onEnd: () => setQuizSpeaking(false),
    });
  }

  useKeyboardShortcuts({
    "1": () => { const c = current?.choices[0]; if (c) handlePick(c.key); },
    "2": () => { const c = current?.choices[1]; if (c) handlePick(c.key); },
    "3": () => { const c = current?.choices[2]; if (c) handlePick(c.key); },
    "4": () => { const c = current?.choices[3]; if (c) handlePick(c.key); },
    "Enter": () => {
      if (phase === "revealed") void handleNext();
      else if (phase === "question" && chosen) handleSubmit();
    },
    "ArrowRight": () => { if (phase === "revealed") void handleNext(); },
    "l": () => { if (phase === "confidence") handleConfidencePick("low"); },
    "m": () => { if (phase === "confidence") handleConfidencePick("medium"); },
    "h": () => { if (phase === "confidence") handleConfidencePick("high"); },
    "f": () => {
      if ((phase === "question" || phase === "revealed") && current) {
        setFlagged((prev) => {
          const next = new Set(prev);
          if (next.has(current.id)) next.delete(current.id);
          else next.add(current.id);
          schedulePersist(quizMode, questions, index, answers, confidences, next);
          return next;
        });
      }
    },
    "s": () => { if (phase === "question" || phase === "revealed") handleQuizSpeak(); },
  });

  // Persist current quiz state to IndexedDB (debounced 200ms)
  function schedulePersist(
    mode: QuizMode,
    qs: Question[],
    idx: number,
    ans: Record<string, string>,
    confs: Record<string, "low" | "medium" | "high">,
    flaggedIds?: Set<string>
  ) {
    // Calibration is a one-shot diagnostic — never resumable.
    // Single-question mode (qs.length === 1 from ?qid=) is also not resumable.
    // weak-domain is intentionally NOT resumable: its question set depends on the
    // ?domain= param, which the resume record doesn't persist — resuming would
    // silently fall back to a generic quiz. It's a short (~12Q) targeted drill, so
    // we skip persistence rather than thread the domain through resume plumbing.
    const resumableKinds: InProgressQuiz["kind"][] = ["daily", "fsrs", "review", "final-week"];
    if (!resumableKinds.includes(mode as InProgressQuiz["kind"])) return;
    if (qs.length === 1) return;
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      const record: InProgressQuiz = {
        id: "current",
        kind: mode as InProgressQuiz["kind"],
        certId: certId,
        questionIds: qs.map((q) => q.id),
        currentIndex: idx,
        answers: ans as Record<string, "A" | "B" | "C" | "D">,
        confidences: confs,
        flagged: flaggedIds ? Array.from(flaggedIds) : [],
        startedAt: quizStartedAtRef.current,
        updatedAt: new Date().toISOString(),
        mode: mode,
      };
      db.inProgressQuizzes.put(record).catch(() => {});
    }, 200);
  }

  useEffect(() => {
    const nParam = searchParams.get("n");
    const size = nParam ? Math.max(1, parseInt(nParam, 10)) : 10;
    const modeParam = searchParams.get("mode");
    const videoId = searchParams.get("videoId");
    const objectiveId = searchParams.get("objective");
    const qid = searchParams.get("qid");
    const domainParam = searchParams.get("domain");
    const domainNumber = domainParam ? parseInt(domainParam, 10) : undefined;
    let mode: QuizMode =
      modeParam === "final-week" ? "final-week" :
      modeParam === "calibration" ? "calibration" :
      modeParam === "fsrs" ? "fsrs" :
      modeParam === "weak-domain" ? "weak-domain" :
      "daily";
    async function load() {
      setQuizSize(qid ? 1 : size);
      setQuizMode(mode);
      await seedDb();
      // Load user pref for confidence prompt
      const state = await db.userState.get(1);
      // Resolve the active cert so every content query + scoring call below
      // targets the cert the user selected, not a hardcoded Security+.
      const activeCertId = getActiveCertId(state);
      setCertId(activeCertId);

      // Final-week gate: only allow if examDate is within 7 days
      if (mode === "final-week") {
        const examDate = state?.examDate;
        let downgradeFinalWeek = false;
        if (!examDate) {
          downgradeFinalWeek = true;
        } else {
          const exam = new Date(examDate);
          const now = new Date();
          const daysUntil = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysUntil > 7 || daysUntil < 0) downgradeFinalWeek = true;
        }
        if (downgradeFinalWeek) {
          mode = "daily";
          setQuizMode("daily");
          setFinalWeekLocked(true);
        }
      }
      if (state?.confidencePrompt) {
        setConfidencePromptPref(state.confidencePrompt);
      }
      if (state?.audioRate) setAudioRate(state.audioRate);
      if (state?.audioVoiceURI) setAudioVoiceURI(state.audioVoiceURI);

      // Single-question deep-link mode — skip resume/history logic
      if (qid) {
        const qs = await buildDailyQuiz(activeCertId, 1, mode, { singleQuestionId: qid });
        if (qs.length === 0) {
          setPhase("qid-not-found");
          return;
        }
        quizStartedAtRef.current = new Date().toISOString();
        setQuestions(qs);
        questionStartRef.current = new Date().getTime();
        setPhase("question");
        return;
      }

      // Check for resumable in-progress quiz
      const STALE_MS = 24 * 60 * 60 * 1000;
      const inProgress = await db.inProgressQuizzes.get("current");
      if (inProgress) {
        const age = new Date().getTime() - new Date(inProgress.updatedAt).getTime();
        if (age > STALE_MS) {
          await db.inProgressQuizzes.delete("current");
        } else if (inProgress.certId !== activeCertId) {
          // Cert-isolation: a saved quiz belongs to a different cert (e.g. the
          // user switched from Security+ to Network+). Never restore another
          // cert's questions — drop it and start fresh for the active cert.
          await db.inProgressQuizzes.delete("current");
        } else if (inProgress.kind === mode && !videoId) {
          // Restore state from saved quiz
          const allQuestions = await db.questions
            .where("id")
            .anyOf(inProgress.questionIds)
            .toArray();
          // Preserve original order
          const orderedQuestions = inProgress.questionIds
            .map((id) => allQuestions.find((q) => q.id === id))
            .filter((q): q is Question => q !== undefined);

          if (orderedQuestions.length > 0) {
            quizStartedAtRef.current = inProgress.startedAt;
            setQuestions(orderedQuestions);
            setQuizSize(orderedQuestions.length);
            setIndex(inProgress.currentIndex);
            setAnswers(inProgress.answers as Record<string, string>);
            setFlagged(new Set(inProgress.flagged ?? []));
            questionStartRef.current = new Date().getTime();
            setPhase("question");
            return;
          }
        }
      }

      const qs = await buildDailyQuiz(
        activeCertId,
        size,
        mode,
        videoId ? { filterVideoId: videoId } :
        objectiveId ? { filterObjectiveId: objectiveId } :
        mode === "weak-domain" && domainNumber ? { domainNumber } :
        undefined
      );
      if (qs.length === 0 && (videoId || objectiveId)) {
        setPhase("no-video-questions" as Phase);
        return;
      }
      if (qs.length === 0 && mode === "fsrs") {
        setPhase("fsrs-empty");
        return;
      }
      quizStartedAtRef.current = new Date().toISOString();
      setQuestions(qs);
      questionStartRef.current = new Date().getTime();
      setPhase("question");
    }
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const current = questions[index];
  const currentId = current?.id;

  useEffect(() => {
    if (phase === "revealed" && currentId) {
      getExplanationsForQuestion(currentId).then(setWrongExplanations);
      // Capture time spent on this question
      setCurrentQuestionMs(new Date().getTime() - questionStartRef.current);
      // Load bank avg for this question
      getQuestionBankAvgMs(currentId).then(setBankAvgMs);
    } else {
      setWrongExplanations(null);
      setBankAvgMs(null);
      setCurrentQuestionMs(null);
    }
  }, [phase, currentId]);

  // Tapping a choice only SELECTS it — the pick stays changeable (tap a different
  // choice to switch) until the user explicitly commits with handleSubmit. This
  // matches the exam UI and fixes "can't unpress to choose a different answer."
  function handlePick(key: string) {
    if (phase !== "question") return;
    setChosen(key);
  }

  // Commit the selected answer → confidence step (if enabled) or straight to reveal.
  function handleSubmit() {
    if (phase !== "question" || !chosen) return;
    if (confidencePromptPref === "always") {
      setPhase("confidence");
      schedulePersist(quizMode, questions, index, answers, confidences, flagged);
    } else {
      recordAnswer(chosen, undefined);
      setPhase("revealed");
      schedulePersist(quizMode, questions, index, answers, confidences, flagged);
    }
  }

  function recordAnswer(key: string, confidence: ConfidenceLevel | undefined) {
    if (!current) return;
    const isCorrect = !!current.choices.find((c) => c.key === key && c.correct);
    const msSpent = new Date().getTime() - questionStartRef.current;
    const record: AnswerRecord = {
      questionId: current.id,
      picked: key as "A" | "B" | "C" | "D",
      correct: isCorrect,
      confidence,
      msSpent,
    };
    setAnswerRecords((prev) => [...prev, record]);
  }

  function handleConfidencePick(confidence: ConfidenceLevel) {
    if (!chosen || !current) return;
    recordAnswer(chosen, confidence);
    const newConfs = { ...confidences, [current.id]: confidence };
    setConfidences(newConfs);
    setPhase("revealed");
    schedulePersist(quizMode, questions, index, answers, newConfs, flagged);
  }

  function handleSkipConfidence() {
    if (!chosen) return;
    recordAnswer(chosen, undefined);
    setPhase("revealed");
    schedulePersist(quizMode, questions, index, answers, confidences, flagged);
  }

  async function handleTurnOffConfidence() {
    if (!chosen) return;
    recordAnswer(chosen, undefined);
    setConfidencePromptPref("off");
    // Persist pref
    const state = await db.userState.get(1);
    if (state) {
      await db.userState.put({ ...state, confidencePrompt: "off" });
    }
    setPhase("revealed");
    schedulePersist(quizMode, questions, index, answers, confidences, flagged);
  }

  async function handleNext() {
    if (!current || !chosen) return;
    const next = { ...answers, [current.id]: chosen };
    setAnswers(next);

    if (index + 1 >= questions.length) {
      // If there are flagged questions, show the flag-review step before done
      if (flagged.size > 0) {
        setPhase("flag-review");
        return;
      }
      await finishQuiz(next);
    } else {
      const nextIndex = index + 1;
      setIndex(nextIndex);
      setChosen(null);
      questionStartRef.current = new Date().getTime();
      setPhase("question");
      schedulePersist(quizMode, questions, nextIndex, next, confidences, flagged);
    }
  }

  async function finishQuiz(finalAnswers: Record<string, string>) {
    // Quiz complete — remove in-progress record
    db.inProgressQuizzes.delete("current").catch(() => {});
    let correct = 0;
    for (const q of questions) {
      const picked = finalAnswers[q.id];
      if (q.choices.find((c) => c.key === picked && c.correct)) correct++;
    }
    const score = Math.round((correct / questions.length) * 100);

    const missed: string[] = [];
    for (const q of questions) {
      const picked = finalAnswers[q.id];
      if (!q.choices.find((c) => c.key === picked && c.correct)) {
        if (!missed.includes(q.objectiveId)) missed.push(q.objectiveId);
      }
    }
    setMissedObjectives(missed);

    // Calibration and single-Q modes are diagnostic — skip XP/streak recording
    const isSingleQ = !!searchParams.get("qid");
    const isCalibration = quizMode === "calibration";
    const skipReward = isCalibration || isSingleQ;

    let result = { xpEarned: 0, newStreak: 0 };
    if (!skipReward) {
      result = await recordQuizResult(
        correct,
        certId,
        questions.map((q) => q.id),
        finalAnswers,
        score,
        answerRecords
      );
    }
    setNewStreak(result.newStreak);

    // XP count-up animation (~400ms) — only when XP was actually earned
    if (!xpAnimRef.current && result.xpEarned > 0) {
      xpAnimRef.current = true;
      const target = result.xpEarned;
      const duration = 400;
      const startTime = new Date().getTime();
      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducedMotion) {
        setDisplayXp(target);
      } else {
        function tickXp() {
          const now = new Date().getTime();
          const t = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 2);
          setDisplayXp(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(tickXp);
        }
        requestAnimationFrame(tickXp);
      }
    } else if (!xpAnimRef.current) {
      xpAnimRef.current = true;
      setDisplayXp(0);
    }

    const now = new Date().toISOString();
    enqueue("insert_quiz_session", {
      user_id: "",
      cert_id: certId,
      started_at: now,
      completed_at: now,
      score_pct: score,
      num_questions: questions.length,
      num_correct: correct,
      questions: questions.map((q) => ({
        questionId: q.id,
        objectiveId: q.objectiveId,
        picked: finalAnswers[q.id] ?? null,
        correct: !!q.choices.find((c) => c.key === finalAnswers[q.id] && c.correct),
      })),
    }).catch(() => {});
    getUserState().then((state) => {
      enqueue("upsert_user_state", {
        user_id: "",
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        last_study_date: state.lastStudyDate ?? now.slice(0, 10),
        total_study_days: state.totalStudyDays,
        predicted_score: state.predictedScore ?? null,
        daily_goal_questions: state.dailyGoalQuestions ?? null,
        updated_at: now,
      }).catch(() => {});
      enqueue("upsert_cert_score", {
        cert_id: certId,
        predicted_score: state.predictedScore ?? null,
        xp: state.xp,
      }).catch(() => {});
    }).catch(() => {});

    setPhase("done");
  }

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)" }}>
        Building your quiz…
      </div>
    );
  }

  if (phase === "done") {
    const correct = questions.filter((q) => {
      const picked = answers[q.id];
      return q.choices.find((c) => c.key === picked && c.correct);
    }).length;
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--border)",
            padding: "32px 24px",
          }}
        >
          <h2
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
              marginBottom: "24px",
            }}
          >
            Quiz Complete
          </h2>

          {/* Score */}
          <div className="text-center py-4">
            <div className="flex items-baseline justify-center gap-2">
              <span
                className="font-display"
                style={{ fontSize: "80px", fontWeight: 400, color: "var(--fg)", lineHeight: 1 }}
              >
                {correct}
              </span>
              <span
                className="font-mono"
                style={{ fontSize: "32px", color: "var(--fg-muted)" }}
              >
                / {questions.length}
              </span>
            </div>
            <div
              className="font-mono mt-2"
              style={{ fontSize: "13px", color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}
            >
              {pct}% correct
            </div>
          </div>

          {/* Thin progress bar */}
          <div
            style={{
              height: "2px",
              background: "var(--border-strong)",
              borderRadius: "1px",
              overflow: "hidden",
              margin: "16px 0",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: "var(--accent)",
                transition: "width 300ms ease-out",
              }}
            />
          </div>

          {/* XP + streak */}
          <div className="flex gap-3 justify-center flex-wrap">
            <span
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
                borderRadius: "var(--r-sm)",
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
                minWidth: "60px",
                display: "inline-block",
                textAlign: "center",
              }}
            >
              +{displayXp} XP
            </span>
            <span
              style={{
                background: "var(--surface-2)",
                color: "var(--fg-muted)",
                borderRadius: "var(--r-sm)",
                padding: "4px 10px",
                fontSize: "12px",
                fontFamily: "var(--font-sans)",
              }}
            >
              🔥 {newStreak} day streak
            </span>
          </div>

          <div style={{ marginTop: "22px" }}>
            <GuestRunSavePrompt
              kind="quiz"
              runId={`quiz:${questions.length}:${correct}:${displayXp}:${newStreak}`}
              nextPath="/"
              details={[
                { label: "Score", value: `${correct}/${questions.length}`, tone: pct >= 75 ? "success" : pct >= 50 ? "accent" : "error" },
                { label: "Accuracy", value: `${pct}%`, tone: pct >= 75 ? "success" : pct >= 50 ? "accent" : "error" },
                { label: "XP", value: `+${displayXp}`, tone: "accent" },
                { label: "Review", value: `${missedObjectives.length} misses`, tone: missedObjectives.length > 0 ? "error" : "success" },
              ]}
            />
          </div>

          {/* Missed objectives */}
          {missedObjectives.length > 0 && (
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
              <p style={{ fontSize: "11px", color: "var(--fg-muted)", marginBottom: "8px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Review these objectives
              </p>
              <div className="space-y-1">
                {missedObjectives.map((objId) => (
                  <div key={objId} style={{ fontSize: "13px", color: "var(--error)" }}>
                    <span className="font-mono">{objId.split(":obj:")[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-6">
            <Link
              href="/"
              className="flex-1 h-10 flex items-center justify-center text-sm font-medium transition-colors"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
                borderRadius: "var(--r-sm)",
                textDecoration: "none",
              }}
            >
              Back to Dashboard
            </Link>
            <button
              className="flex-1 h-10 text-sm font-medium transition-colors"
              style={{
                background: "transparent",
                color: "var(--fg)",
                borderRadius: "var(--r-sm)",
                border: "1px solid var(--border-strong)",
              }}
              onClick={() => {
                db.inProgressQuizzes.delete("current").catch(() => {});
                setIndex(0);
                setChosen(null);
                setAnswers({});
                setAnswerRecords([]);
                setConfidences({});
                xpAnimRef.current = false;
                quizStartedAtRef.current = new Date().toISOString();
                setPhase("loading");
                buildDailyQuiz(certId, quizSize).then((qs) => {
                  setQuestions(qs);
                  questionStartRef.current = new Date().getTime();
                  setPhase("question");
                });
              }}
            >
              New Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "no-video-questions") {
    return (
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border)",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--fg)", marginBottom: "8px", fontFamily: "var(--font-sans)" }}>
          No questions yet for this video.
        </p>
        <p style={{ fontSize: "13px", color: "var(--fg-muted)", marginBottom: "24px", lineHeight: "24px" }}>
          Questions sourced from this Professor Messer video will appear here once the pipeline finishes · browse other sources in the meantime.
        </p>
        <Link
          href="/library?tab=sources"
          style={{
            display: "inline-block",
            background: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: "var(--r-sm)",
            padding: "8px 20px",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          ← Back to Sources
        </Link>
      </div>
    );
  }

  if (phase === "qid-not-found") {
    return (
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border)",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--fg)", marginBottom: "8px", fontFamily: "var(--font-sans)" }}>
          Question not found.
        </p>
        <p style={{ fontSize: "13px", color: "var(--fg-muted)", marginBottom: "24px", lineHeight: "24px" }}>
          The question ID in the link doesn&apos;t match any question in your library. It may have been removed or the link may be incorrect.
        </p>
        <Link
          href="/quiz"
          style={{
            display: "inline-block",
            background: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: "var(--r-sm)",
            padding: "8px 20px",
            fontSize: "13px",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          ← Back to Quiz
        </Link>
      </div>
    );
  }

  if (phase === "fsrs-empty") {
    return (
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border)",
          padding: "40px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
          <EmptyState variant="all-caught-up" />
        </div>
        <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--fg)", marginBottom: "8px", fontFamily: "var(--font-sans)" }}>
          You&apos;ve cleared today&apos;s scheduled review queue.
        </p>
        <p style={{ fontSize: "13px", color: "var(--fg-muted)", marginBottom: "24px", lineHeight: "24px" }}>
          Your next review surfaces tomorrow when older cards mature · in the meantime, a daily quiz keeps new material coming.
        </p>
        <Link
          href="/quiz"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: "40px",
            padding: "0 20px",
            background: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: "4px",
            textDecoration: "none",
            fontSize: "13px",
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
          }}
        >
          Daily quiz →
        </Link>
      </div>
    );
  }

  // ── Flag-review step ─────────────────────────────────────────────────────
  if (phase === "flag-review") {
    const flaggedQuestions = questions.filter((q) => flagged.has(q.id));
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--border)",
            padding: "24px",
          }}
        >
          <h2
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
              marginBottom: "16px",
              fontFamily: "var(--font-sans)",
            }}
          >
            You flagged {flaggedQuestions.length} question{flaggedQuestions.length !== 1 ? "s" : ""} for review
          </h2>
          <div className="space-y-3">
            {flaggedQuestions.map((q) => {
              const picked = answers[q.id] as "A" | "B" | "C" | "D" | undefined;
              const correctChoice = q.choices.find((c) => c.correct);
              const pickedChoice = picked ? q.choices.find((c) => c.key === picked) : undefined;
              const wasCorrect = pickedChoice?.correct ?? false;
              return (
                <div
                  key={q.id}
                  style={{
                    padding: "12px 14px",
                    background: "var(--surface-2)",
                    borderRadius: "var(--r-sm)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--fg)",
                      marginBottom: "6px",
                      lineHeight: 1.5,
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    {q.stem.length > 120 ? q.stem.slice(0, 120) + "…" : q.stem}
                  </p>
                  <div className="flex gap-3 flex-wrap" style={{ fontSize: "11px", fontFamily: "var(--font-mono)" }}>
                    <span style={{ color: wasCorrect ? "var(--success)" : "var(--error)" }}>
                      You: {picked ?? "—"}{pickedChoice ? ` — ${pickedChoice.text.slice(0, 40)}${pickedChoice.text.length > 40 ? "…" : ""}` : ""}
                    </span>
                    {!wasCorrect && correctChoice && (
                      <span style={{ color: "var(--success)" }}>
                        Correct: {correctChoice.key} — {correctChoice.text.slice(0, 40)}{correctChoice.text.length > 40 ? "…" : ""}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            className="w-full h-10 mt-6 text-sm font-medium"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg)",
              borderRadius: "var(--r-sm)",
              border: "none",
              fontFamily: "var(--font-sans)",
              cursor: "pointer",
            }}
            onClick={() => void finishQuiz(answers)}
          >
            Got them →
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const correctChoice = current.choices.find((c) => c.correct);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <h1 className="sr-only">Practice quiz</h1>
      {/* Final-week locked banner */}
      {finalWeekLocked && (
        <div
          style={{
            padding: "10px 14px",
            background: "rgba(245,166,35,0.10)",
            border: "1px solid rgba(245,166,35,0.35)",
            borderRadius: "var(--r-sm)",
            fontSize: "13px",
            color: "var(--fg)",
            fontFamily: "var(--font-sans)",
            lineHeight: "1.5",
          }}
        >
          Final-week mode unlocks when your exam is ≤7 days away. Running daily mode instead.
        </div>
      )}
      {/* Mode title */}
      {quizMode === "fsrs" && !searchParams.get("qid") && (
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
          }}
        >
          FSRS Review
        </p>
      )}
      {searchParams.get("qid") && (
        <p
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
          }}
        >
          Single Question
        </p>
      )}
      {/* Progress */}
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
              width: `${((index + 1) / questions.length) * 100}%`,
              background: "var(--accent)",
              transition: "width 150ms ease-out",
            }}
          />
        </div>
        <span
          className="font-mono shrink-0"
          style={{ fontSize: "12px", color: "var(--fg-muted)", fontVariantNumeric: "tabular-nums" }}
        >
          {index + 1}/{questions.length}
        </span>
      </div>

      {/* Question card */}
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-md)",
          border: "1px solid var(--border)",
          padding: "24px",
        }}
      >
        {/* Objective code + flag button */}
        <div className="mb-3 flex items-center justify-between">
          <span
            className="font-mono"
            style={{
              background: "rgba(245, 166, 35, 0.12)",
              color: "var(--accent)",
              borderRadius: "var(--r-sm)",
              padding: "2px 6px",
              fontSize: "11px",
              fontWeight: 600,
            }}
          >
            {current.objectiveId.split(":obj:")[1]}
          </span>
          {(phase === "question" || phase === "confidence" || phase === "revealed") && (
            <button
              title="Flag for review (F)"
              onClick={() => {
                setFlagged((prev) => {
                  const next = new Set(prev);
                  if (next.has(current.id)) next.delete(current.id);
                  else next.add(current.id);
                  schedulePersist(quizMode, questions, index, answers, confidences, next);
                  return next;
                });
              }}
              style={{
                background: flagged.has(current.id) ? "rgba(245,166,35,0.18)" : "transparent",
                border: `1px solid ${flagged.has(current.id) ? "var(--accent)" : "var(--border-strong)"}`,
                borderRadius: "var(--r-sm)",
                display: "inline-flex",
                alignItems: "center",
                minHeight: "36px",
                padding: "0 12px",
                fontSize: "12px",
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                color: flagged.has(current.id) ? "var(--accent)" : "var(--fg-muted)",
                cursor: "pointer",
                transition: "background 150ms, border-color 150ms, color 150ms",
              }}
            >
              🚩 {flagged.has(current.id) ? "Flagged" : "Flag"}
            </button>
          )}
        </div>

        {/* Speaker button — tap to read question + choices aloud */}
        {hasTts && (phase === "question" || phase === "confidence" || phase === "revealed") && (
          <button
            onClick={handleQuizSpeak}
            aria-label={quizSpeaking ? "Stop reading" : "Read question aloud (S)"}
            title={quizSpeaking ? "Stop reading" : "Read question aloud (S)"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              minHeight: "36px",
              padding: "0 12px",
              marginBottom: "12px",
              border: `1px solid ${quizSpeaking ? "var(--accent)" : "var(--border-strong)"}`,
              borderRadius: "var(--r-sm)",
              background: quizSpeaking ? "rgba(245,166,35,0.10)" : "transparent",
              color: quizSpeaking ? "var(--accent)" : "var(--fg-muted)",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              transition: "all 150ms",
            }}
          >
            <SpeakerIcon size={12} speaking={quizSpeaking} />
            {quizSpeaking ? "Stop" : "S"}
          </button>
        )}

        {/* Stem */}
        <p
          style={{
            fontSize: "17px",
            lineHeight: 1.55,
            color: "var(--fg)",
            marginBottom: "20px",
            fontFamily: "var(--font-sans)",
          }}
        >
          {current.stem}
        </p>

        {/* Choices */}
        <div className="space-y-2">
          {current.choices.map((choice) => {
            let borderColor = "var(--border-strong)";
            let bgColor = "transparent";
            let textColor = "var(--fg)";

            if (phase === "revealed") {
              if (choice.correct) {
                borderColor = "var(--success)";
                bgColor = "rgba(95, 179, 124, 0.08)";
                textColor = "var(--success)";
              } else if (choice.key === chosen && !choice.correct) {
                borderColor = "var(--error)";
                bgColor = "rgba(229, 92, 92, 0.08)";
                textColor = "var(--error)";
              }
            } else if (chosen === choice.key) {
              borderColor = "var(--accent)";
              bgColor = "rgba(245, 166, 35, 0.08)";
            }

            return (
              <button
                key={choice.key}
                disabled={phase === "revealed" || phase === "confidence"}
                onClick={() => handlePick(choice.key)}
                className="w-full text-left px-4 py-3 text-sm flex items-center justify-between"
                style={{
                  border: `1px solid ${borderColor}`,
                  borderRadius: "var(--r-sm)",
                  background: bgColor,
                  color: textColor,
                  transition: "border-color 200ms ease-out, background-color 200ms ease-out",
                  fontFamily: "var(--font-sans)",
                  cursor: (phase === "revealed" || phase === "confidence") ? "default" : "pointer",
                  boxShadow: "none",
                }}
                onMouseEnter={(e) => {
                  if (phase !== "revealed" && phase !== "confidence" && chosen !== choice.key) {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.background = "rgba(245,166,35,0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (phase !== "revealed" && phase !== "confidence" && chosen !== choice.key) {
                    e.currentTarget.style.borderColor = "var(--border-strong)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
                onFocus={(e) => {
                  if (phase !== "revealed" && phase !== "confidence") e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent)";
                }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              >
                <span className="font-mono font-semibold mr-2" style={{ color: "var(--fg-muted)" }}>
                  {choice.key}.
                </span>
                <span style={{ flex: 1 }}>{choice.text}</span>
                {phase === "question" && (
                  <span
                    className="font-mono ml-3 hidden lg:inline-block"
                    style={{ fontSize: "10px", color: "var(--fg-subtle)", opacity: 0.5 }}
                  >
                    ({["1","2","3","4"][current.choices.indexOf(choice)]})
                  </span>
                )}
                {flagged.has(current.id) && (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--accent)",
                      display: "inline-block",
                      marginLeft: "8px",
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Check answer — commit the (changeable) selection. In question phase only. */}
        {phase === "question" && (
          <button
            onClick={handleSubmit}
            disabled={!chosen}
            className="w-full mt-4"
            style={{
              minHeight: "48px",
              borderRadius: "var(--r-sm)",
              border: "none",
              background: chosen ? "var(--accent)" : "var(--surface-2)",
              color: chosen ? "var(--accent-fg)" : "var(--fg-subtle)",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: "15px",
              cursor: chosen ? "pointer" : "default",
              transition: "background 150ms, color 150ms",
            }}
          >
            {chosen ? "Check answer" : "Select an answer"}
          </button>
        )}

        {/* Confidence picker — shown after pick, before reveal */}
        {phase === "confidence" && (
          <div
            style={{
              marginTop: "16px",
              padding: "14px 16px",
              background: "var(--surface-2)",
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "var(--fg-muted)",
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "10px",
              }}
            >
              How confident?
            </p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {CONFIDENCE_OPTIONS.map(({ level, label, sub }) => (
                <button
                  key={level}
                  onClick={() => handleConfidencePick(level)}
                  style={{
                    flex: "1 1 0",
                    minWidth: "80px",
                    padding: "8px 10px",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "4px",
                    background: "transparent",
                    color: "var(--fg-muted)",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    textAlign: "center",
                    transition: "border-color 120ms, color 120ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.color = "var(--fg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-strong)";
                    e.currentTarget.style.color = "var(--fg-muted)";
                  }}
                >
                  <div>{label}</div>
                  <div style={{ fontSize: "10px", fontWeight: 400, marginTop: "2px", opacity: 0.7 }}>{sub}</div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "10px", alignItems: "center" }}>
              <button
                onClick={handleSkipConfidence}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--fg-muted)",
                  fontSize: "12px",
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                  textDecorationColor: "var(--border-strong)",
                }}
              >
                skip
              </button>
              <button
                onClick={handleTurnOffConfidence}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--fg-muted)",
                  fontSize: "11px",
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                  padding: 0,
                  opacity: 0.6,
                }}
              >
                turn off
              </button>
            </div>
          </div>
        )}

        {/* Explanation */}
        {phase === "revealed" && (
          <div
            style={{
              marginTop: "16px",
              padding: "14px 16px",
              background: "var(--surface-2)",
              borderRadius: "var(--r-sm)",
              fontSize: "13px",
              lineHeight: 1.6,
              color: "var(--fg-muted)",
            }}
          >
            <p
              style={{
                fontWeight: 600,
                color: chosen === correctChoice?.key ? "var(--success)" : "var(--error)",
                marginBottom: "6px",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {chosen === correctChoice?.key ? "Correct" : "Incorrect"}
            </p>
            <p>{current.explanation}</p>
            {/* Time tracking line */}
            {currentQuestionMs !== null && (
              <p
                className="font-mono"
                style={{
                  fontSize: "11px",
                  color: "var(--fg-subtle)",
                  marginTop: "8px",
                  opacity: 0.7,
                }}
              >
                You: {formatMs(currentQuestionMs)}
                {bankAvgMs !== null && ` · Bank avg: ${formatMs(bankAvgMs)} on this Q`}
              </p>
            )}
            {current.videoSource && (
              <a
                href={`${current.videoSource.videoUrl}${current.videoSource.timestamp ? `&t=${current.videoSource.timestamp}` : ""}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  color: "var(--fg-muted)",
                  textDecoration: "none",
                  transition: "color 150ms ease-out",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--fg)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--fg-muted)"; }}
              >
                <span
                  className="font-mono"
                  style={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}
                >
                  SOURCE
                </span>
                <span>Professor Messer — {current.videoSource.videoTitle}</span>
                <span aria-hidden>→</span>
              </a>
            )}
            {wrongExplanations && Object.keys(wrongExplanations).length > 0 && (
              <details className="mt-4 group">
                <summary className="cursor-pointer text-xs font-mono uppercase tracking-wider text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors list-none">
                  <span className="inline-block mr-1 transition-transform group-open:rotate-90">▸</span>
                  Why each wrong answer is wrong
                </summary>
                <div className="mt-3 space-y-2 text-sm">
                  {(["A", "B", "C", "D"] as const).map((k) => {
                    if (!wrongExplanations[k]) return null;
                    const choice = current.choices.find((c) => c.key === k);
                    return (
                      <div key={k} className="border-l-2 border-[var(--border)] pl-3">
                        <div className="text-xs text-[var(--fg-muted)]">
                          <span className="font-mono text-[var(--accent)]">{k})</span> {choice?.text}
                        </div>
                        <div className="mt-1 text-[var(--fg)]">{wrongExplanations[k]}</div>
                      </div>
                    );
                  })}
                </div>
              </details>
            )}
            {/* Remediation chip — only on wrong answers */}
            {chosen !== correctChoice?.key && (
              <RemediationLink question={current} />
            )}
          </div>
        )}

        {/* Bookmark + Report row */}
        {phase === "revealed" && (
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "16px" }}>
            <BookmarkButton questionId={current.id} certId={certId} />
            <ReportButton questionId={current.id} certId={certId} />
          </div>
        )}

        {/* Next button */}
        {phase === "revealed" && (() => {
          const isSingleQ = !!searchParams.get("qid");
          if (isSingleQ) {
            return (
              <Link
                href="/library?tab=bookmarks"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  height: "40px",
                  marginTop: "16px",
                  background: "transparent",
                  color: "var(--fg)",
                  borderRadius: "var(--r-sm)",
                  border: "1px solid var(--border-strong)",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 500,
                  fontFamily: "var(--font-sans)",
                }}
              >
                ← Back to library
              </Link>
            );
          }
          return (
            <button
              className="w-full h-10 mt-4 text-sm font-medium transition-colors"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
                borderRadius: "var(--r-sm)",
                border: "none",
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
              }}
              onClick={handleNext}
            >
              {index + 1 >= questions.length ? "See Results" : "Next Question →"}
            </button>
          );
        })()}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]" style={{ color: "var(--fg-muted)" }}>
          Building your quiz…
        </div>
      }
    >
      <QuizInner />
    </Suspense>
  );
}
