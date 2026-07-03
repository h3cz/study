/**
 * wrong-answers.test.ts
 *
 * Tests for getWrongAnswers() — deduplication, graduation, filtering.
 * Runs in Node (no IndexedDB); we test the pure logic extracted below.
 */

import { describe, it, expect } from "vitest";

// ─── Types mirroring lib/db ────────────────────────────────────────────────────

interface Choice {
  key: "A" | "B" | "C" | "D";
  text: string;
  correct: boolean;
}

interface Question {
  id: string;
  certId: string;
  domainId: string;
  objectiveId: string;
  stem: string;
  choices: Choice[];
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

interface QuizSession {
  id?: number;
  certId: string;
  startedAt: string;
  completedAt?: string;
  questionIds: string[];
  answers: Record<string, string>;
  score: number;
  xpEarned: number;
}

interface WrongAnswer {
  questionId: string;
  picked: "A" | "B" | "C" | "D" | null;
  attemptedAt: string;
  sessionId: string;
}

// ─── Pure implementation of getWrongAnswers logic ─────────────────────────────

function computeWrongAnswers(
  sessions: QuizSession[],
  questionMap: Map<string, Question>,
  opts?: { sinceDays?: number; limit?: number }
): WrongAnswer[] {
  const sinceDays = opts?.sinceDays ?? 14;
  const limit = opts?.limit;

  const now = new Date("2026-05-25T12:00:00.000Z").getTime();
  const cutoff = new Date(now - sinceDays * 24 * 60 * 60 * 1000).toISOString();

  const filtered = sessions.filter(
    (s) => !!s.completedAt && s.completedAt >= cutoff
  );

  if (filtered.length === 0) return [];

  // Sort ascending so later sessions overwrite earlier ones
  filtered.sort((a, b) =>
    (a.completedAt ?? "").localeCompare(b.completedAt ?? "")
  );

  const latestAttempt = new Map<
    string,
    { correct: boolean; picked: string; attemptedAt: string; sessionId: string }
  >();

  for (const session of filtered) {
    if (!session.completedAt) continue;
    const sessionId = String(session.id ?? "");
    for (const [questionId, picked] of Object.entries(session.answers)) {
      const q = questionMap.get(questionId);
      const correct = !!q?.choices.find((c) => c.key === picked && c.correct);
      latestAttempt.set(questionId, {
        correct,
        picked,
        attemptedAt: session.completedAt,
        sessionId,
      });
    }
  }

  const wrongs: WrongAnswer[] = [];
  for (const [questionId, attempt] of latestAttempt.entries()) {
    if (!attempt.correct) {
      wrongs.push({
        questionId,
        picked: attempt.picked as "A" | "B" | "C" | "D" | null,
        attemptedAt: attempt.attemptedAt,
        sessionId: attempt.sessionId,
      });
    }
  }

  wrongs.sort((a, b) => b.attemptedAt.localeCompare(a.attemptedAt));

  return limit !== undefined ? wrongs.slice(0, limit) : wrongs;
}

// ─── Test data ────────────────────────────────────────────────────────────────

function makeQuestion(id: string, correctKey: "A" | "B" | "C" | "D"): Question {
  return {
    id,
    certId: "secplus-sy0-701",
    domainId: "secplus-sy0-701:domain:1",
    objectiveId: "secplus-sy0-701:obj:1.1",
    stem: `Question ${id}`,
    choices: [
      { key: "A", text: "Option A", correct: correctKey === "A" },
      { key: "B", text: "Option B", correct: correctKey === "B" },
      { key: "C", text: "Option C", correct: correctKey === "C" },
      { key: "D", text: "Option D", correct: correctKey === "D" },
    ],
    explanation: "Explanation",
    difficulty: 2,
  };
}

const Q1 = makeQuestion("q1", "A"); // correct = A
const Q2 = makeQuestion("q2", "B"); // correct = B
const Q3 = makeQuestion("q3", "C"); // correct = C

const questionMap = new Map<string, Question>([
  [Q1.id, Q1],
  [Q2.id, Q2],
  [Q3.id, Q3],
]);

// Session 1 (older): Q1=wrong(picked B), Q2=wrong(picked A)
const session1: QuizSession = {
  id: 1,
  certId: "secplus-sy0-701",
  startedAt: "2026-05-20T10:00:00.000Z",
  completedAt: "2026-05-20T10:10:00.000Z",
  questionIds: ["q1", "q2"],
  answers: { q1: "B", q2: "A" }, // both wrong
  score: 0,
  xpEarned: 0,
};

// Session 2 (newer): Q3=wrong(picked A)
const session2: QuizSession = {
  id: 2,
  certId: "secplus-sy0-701",
  startedAt: "2026-05-22T10:00:00.000Z",
  completedAt: "2026-05-22T10:10:00.000Z",
  questionIds: ["q3"],
  answers: { q3: "A" }, // wrong
  score: 0,
  xpEarned: 0,
};

// Session 3 (newest): Q1=correct(picked A)
const session3Correct: QuizSession = {
  id: 3,
  certId: "secplus-sy0-701",
  startedAt: "2026-05-24T10:00:00.000Z",
  completedAt: "2026-05-24T10:10:00.000Z",
  questionIds: ["q1"],
  answers: { q1: "A" }, // correct — graduates Q1
  score: 100,
  xpEarned: 10,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getWrongAnswers (pure logic)", () => {
  it("returns 3 distinct wrong entries from 2 sessions", () => {
    const result = computeWrongAnswers([session1, session2], questionMap);
    expect(result).toHaveLength(3);
    const ids = result.map((w) => w.questionId).sort();
    expect(ids).toEqual(["q1", "q2", "q3"]);
  });

  it("each entry has the correct picked value", () => {
    const result = computeWrongAnswers([session1, session2], questionMap);
    const byId = new Map(result.map((w) => [w.questionId, w]));
    expect(byId.get("q1")?.picked).toBe("B");
    expect(byId.get("q2")?.picked).toBe("A");
    expect(byId.get("q3")?.picked).toBe("A");
  });

  it("graduates Q1 when a later session answers it correctly", () => {
    const result = computeWrongAnswers(
      [session1, session2, session3Correct],
      questionMap
    );
    const ids = result.map((w) => w.questionId);
    expect(ids).not.toContain("q1"); // graduated
    expect(ids).toContain("q2");
    expect(ids).toContain("q3");
    expect(result).toHaveLength(2);
  });

  it("dedupes — only most recent attempt per question is kept", () => {
    // Session where Q2 is wrong twice — result should still be 1 entry for Q2
    const sessionQ2Again: QuizSession = {
      id: 4,
      certId: "secplus-sy0-701",
      startedAt: "2026-05-23T10:00:00.000Z",
      completedAt: "2026-05-23T10:10:00.000Z",
      questionIds: ["q2"],
      answers: { q2: "C" }, // still wrong, different pick
      score: 0,
      xpEarned: 0,
    };
    const result = computeWrongAnswers(
      [session1, sessionQ2Again],
      questionMap
    );
    const q2Entries = result.filter((w) => w.questionId === "q2");
    expect(q2Entries).toHaveLength(1);
    // Most recent attempt picked "C"
    expect(q2Entries[0].picked).toBe("C");
  });

  it("respects sinceDays filter — excludes old sessions", () => {
    const oldSession: QuizSession = {
      id: 5,
      certId: "secplus-sy0-701",
      startedAt: "2026-05-01T10:00:00.000Z",
      completedAt: "2026-05-01T10:10:00.000Z",
      questionIds: ["q1"],
      answers: { q1: "B" },
      score: 0,
      xpEarned: 0,
    };
    // sinceDays=3 from 2026-05-25 → cutoff ~2026-05-22; old session is outside
    const result = computeWrongAnswers([oldSession], questionMap, {
      sinceDays: 3,
    });
    expect(result).toHaveLength(0);
  });

  it("respects limit parameter", () => {
    const result = computeWrongAnswers([session1, session2], questionMap, {
      limit: 2,
    });
    expect(result).toHaveLength(2);
  });

  it("returns empty array when no sessions", () => {
    const result = computeWrongAnswers([], questionMap);
    expect(result).toHaveLength(0);
  });

  it("returns results sorted descending by attemptedAt", () => {
    const result = computeWrongAnswers([session1, session2], questionMap);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].attemptedAt >= result[i].attemptedAt).toBe(true);
    }
  });
});
