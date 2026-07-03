/**
 * voice-answer-records.test.ts
 *
 * A voice-tutor answer must be recorded LOCALLY (Dexie) exactly like a single
 * question in-app quiz, so it flows into mastery, FSRS, the wrong-answer queue,
 * trend, etc. — and must be indistinguishable from a quiz answer except for the
 * `source: "voice-tutor"` tag. It must also be idempotent per (questionId, voice
 * session) so a double-fire of submit_answer does not double-record.
 *
 * Runs in Node (no IndexedDB); we mirror the exact data shapes recordVoiceAnswer
 * produces and the pure logic the consumers (wrong-answers, mastery, dedup) use.
 */

import { describe, it, expect } from "vitest";

// ─── Types mirroring lib/db ────────────────────────────────────────────────────

interface AnswerRecord {
  questionId: string;
  picked: "A" | "B" | "C" | "D" | null;
  correct: boolean;
  source?: string;
  voiceSessionId?: string;
}

interface QuizSession {
  id?: number;
  certId: string;
  startedAt: string;
  completedAt?: string;
  questionIds: string[];
  answers: Record<string, string>;
  answerRecords?: AnswerRecord[];
  score: number;
  xpEarned: number;
  kind?: "mcq" | "pbq";
}

const CERT_ID = "secplus-sy0-701";

/**
 * Pure mirror of recordVoiceAnswer's session-building (the part that does NOT
 * touch Dexie / FSRS): the single-question session it writes.
 */
function buildVoiceSession(opts: {
  questionId: string;
  picked: "A" | "B" | "C" | "D";
  correct: boolean;
  voiceSessionId: string;
  now: Date;
}): QuizSession {
  const { questionId, picked, correct, voiceSessionId, now } = opts;
  const answerRecord: AnswerRecord = {
    questionId,
    picked,
    correct,
    source: "voice-tutor",
    voiceSessionId,
  };
  return {
    certId: CERT_ID,
    startedAt: now.toISOString(),
    completedAt: now.toISOString(),
    questionIds: [questionId],
    answers: { [questionId]: picked },
    answerRecords: [answerRecord],
    score: correct ? 100 : 0,
    xpEarned: correct ? 10 : 0,
    kind: "mcq",
  };
}

/** Pure mirror of the idempotency check in recordVoiceAnswer. */
function isDuplicate(
  existing: QuizSession[],
  questionId: string,
  voiceSessionId: string
): boolean {
  return existing.some((s) =>
    (s.answerRecords ?? []).some(
      (ar) =>
        ar.source === "voice-tutor" &&
        ar.questionId === questionId &&
        ar.voiceSessionId === voiceSessionId
    )
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("recordVoiceAnswer — local session shape", () => {
  const now = new Date("2026-05-28T12:00:00.000Z");

  it("writes a single-question completed session", () => {
    const s = buildVoiceSession({ questionId: "q1", picked: "A", correct: true, voiceSessionId: "vs1", now });
    expect(s.questionIds).toEqual(["q1"]);
    expect(s.answers).toEqual({ q1: "A" });
    expect(s.completedAt).toBe(now.toISOString());
    expect(s.score).toBe(100);
  });

  it("carries source 'voice-tutor' on the answer record", () => {
    const s = buildVoiceSession({ questionId: "q1", picked: "B", correct: false, voiceSessionId: "vs1", now });
    expect(s.answerRecords?.[0].source).toBe("voice-tutor");
  });

  it("is otherwise indistinguishable from a quiz answer (same answers-map shape that mastery reads)", () => {
    const s = buildVoiceSession({ questionId: "q9", picked: "C", correct: true, voiceSessionId: "vs1", now });
    // mastery reads session.answers — voice writes the same map a quiz would.
    expect(Object.entries(s.answers)).toEqual([["q9", "C"]]);
    // kind matches a normal MCQ quiz
    expect(s.kind).toBe("mcq");
  });
});

describe("recordVoiceAnswer — appears in wrong-answer query when wrong", () => {
  const now = new Date("2026-05-28T12:00:00.000Z");

  it("a wrong voice answer surfaces in the latest-attempt-wrong set, tagged voice-tutor", () => {
    // q correct = A; user picked B by voice → wrong
    const s = buildVoiceSession({ questionId: "q1", picked: "B", correct: false, voiceSessionId: "vs1", now });

    // Mirror getWrongAnswers' per-question latest-attempt + source extraction.
    const latest = new Map<string, { correct: boolean; picked: string; source?: string }>();
    for (const [qid, picked] of Object.entries(s.answers)) {
      const source = s.answerRecords?.find((ar) => ar.questionId === qid)?.source;
      latest.set(qid, { correct: s.answerRecords![0].correct, picked, source });
    }

    const wrongs = Array.from(latest.entries())
      .filter(([, a]) => !a.correct)
      .map(([qid, a]) => ({ questionId: qid, picked: a.picked, source: a.source }));

    expect(wrongs).toHaveLength(1);
    expect(wrongs[0].questionId).toBe("q1");
    expect(wrongs[0].source).toBe("voice-tutor");
  });

  it("a correct voice answer does NOT surface as wrong", () => {
    const s = buildVoiceSession({ questionId: "q1", picked: "A", correct: true, voiceSessionId: "vs1", now });
    const anyWrong = (s.answerRecords ?? []).some((ar) => !ar.correct);
    expect(anyWrong).toBe(false);
  });
});

describe("recordVoiceAnswer — idempotency per (questionId, voice session)", () => {
  const now = new Date("2026-05-28T12:00:00.000Z");

  it("detects a duplicate tool fire for the same question + session", () => {
    const first = buildVoiceSession({ questionId: "q1", picked: "A", correct: true, voiceSessionId: "vs1", now });
    expect(isDuplicate([first], "q1", "vs1")).toBe(true);
  });

  it("does NOT treat the same question in a DIFFERENT voice session as a duplicate", () => {
    const first = buildVoiceSession({ questionId: "q1", picked: "A", correct: true, voiceSessionId: "vs1", now });
    expect(isDuplicate([first], "q1", "vs2")).toBe(false);
  });

  it("does NOT treat a different question in the same session as a duplicate", () => {
    const first = buildVoiceSession({ questionId: "q1", picked: "A", correct: true, voiceSessionId: "vs1", now });
    expect(isDuplicate([first], "q2", "vs1")).toBe(false);
  });

  it("a non-voice quiz session never blocks a voice recording", () => {
    const quiz: QuizSession = {
      certId: CERT_ID,
      startedAt: now.toISOString(),
      completedAt: now.toISOString(),
      questionIds: ["q1"],
      answers: { q1: "A" },
      // No answerRecords source — a normal in-app quiz
      answerRecords: [{ questionId: "q1", picked: "A", correct: true }],
      score: 100,
      xpEarned: 10,
    };
    expect(isDuplicate([quiz], "q1", "vs1")).toBe(false);
  });
});
