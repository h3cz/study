import { describe, it, expect } from "vitest";
import { questionsForObjective, MAX_QUESTIONS_PER_FETCH } from "@/lib/study-buddy/objectives";
import { objectiveIdForCode } from "@/lib/study-buddy/objectives";
import {
  computeWeakObjectives,
  computeRecentMisses,
  computeMasterySummary,
  type SessionRow,
} from "@/lib/study-buddy/mastery-server";

// ── helpers that mirror the route logic (pure, no DB) ──────────────────────

const MS_24H = 24 * 60 * 60 * 1000;

function recentlyAnsweredIds(
  sessions: SessionRow[],
  nowMs = Date.now()
): Set<string> {
  const cutoff = nowMs - MS_24H;
  const ids = new Set<string>();
  for (const s of sessions) {
    if (!s.completed_at) continue;
    if (new Date(s.completed_at).getTime() < cutoff) continue;
    if (!Array.isArray(s.questions)) continue;
    for (const q of s.questions) {
      if (q?.questionId) ids.add(q.questionId);
    }
  }
  return ids;
}

function countAnsweredToday(sessions: SessionRow[], nowUtc = new Date()): number {
  const todayUtcPrefix = nowUtc.toISOString().slice(0, 10);
  let count = 0;
  for (const s of sessions) {
    if (!s.completed_at) continue;
    if (!s.completed_at.startsWith(todayUtcPrefix)) continue;
    if (!Array.isArray(s.questions)) continue;
    count += s.questions.length;
  }
  return count;
}

function countTotalAnswered(sessions: SessionRow[]): number {
  let count = 0;
  for (const s of sessions) {
    if (!Array.isArray(s.questions)) continue;
    count += s.questions.length;
  }
  return count;
}

// ── test data ──────────────────────────────────────────────────────────────

const obj11 = objectiveIdForCode("1.1")!;

// Build sessions using real question IDs from objective 1.1 so we can test
// exclusion against the actual bank (questionsForObjective uses the real bank).
function makeSession(questionIds: string[], hoursAgo: number): SessionRow {
  const completedAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
  return {
    completed_at: completedAt,
    questions: questionIds.map((id) => ({
      questionId: id,
      objectiveId: obj11,
      picked: "A",
      correct: true,
    })),
  };
}

// ── recentlyAnsweredIds ─────────────────────────────────────────────────────

describe("recentlyAnsweredIds", () => {
  it("includes questions from sessions completed within 24h", () => {
    const sessions = [makeSession(["q-new-1", "q-new-2"], 1)];
    const ids = recentlyAnsweredIds(sessions);
    expect(ids.has("q-new-1")).toBe(true);
    expect(ids.has("q-new-2")).toBe(true);
  });

  it("excludes questions from sessions completed more than 24h ago", () => {
    const sessions = [makeSession(["q-old"], 25)];
    const ids = recentlyAnsweredIds(sessions);
    expect(ids.has("q-old")).toBe(false);
  });

  it("handles sessions with null questions gracefully", () => {
    const sessions: SessionRow[] = [
      { completed_at: new Date().toISOString(), questions: null },
    ];
    expect(recentlyAnsweredIds(sessions).size).toBe(0);
  });

  it("handles sessions without completed_at gracefully", () => {
    const sessions: SessionRow[] = [
      { completed_at: null, questions: [{ questionId: "q-x", objectiveId: obj11, picked: null, correct: false }] },
    ];
    expect(recentlyAnsweredIds(sessions).size).toBe(0);
  });

  it("mixes old and new sessions correctly", () => {
    const sessions = [
      makeSession(["q-new"], 1),
      makeSession(["q-old"], 25),
    ];
    const ids = recentlyAnsweredIds(sessions);
    expect(ids.has("q-new")).toBe(true);
    expect(ids.has("q-old")).toBe(false);
  });
});

// ── questionsForObjective exclusion ────────────────────────────────────────

describe("questionsForObjective with excludeIds", () => {
  it("returns questions without exclusion by default", () => {
    const qs = questionsForObjective("1.1", MAX_QUESTIONS_PER_FETCH);
    expect(qs.length).toBeGreaterThan(0);
    expect(qs.length).toBeLessThanOrEqual(MAX_QUESTIONS_PER_FETCH);
  });

  it("excludes specified IDs when the pool has remaining questions", () => {
    // Get all available IDs for objective 1.1 by fetching without exclusion several times.
    // We only need to exclude some — leave at least one available.
    const allFetched = questionsForObjective("1.1", MAX_QUESTIONS_PER_FETCH);
    if (allFetched.length < 2) return; // not enough questions to test exclusion

    // Exclude all except conceptually — exclude n-1 IDs so there's 1 left at minimum.
    const excludeIds = new Set(allFetched.slice(0, allFetched.length - 1).map((q) => q.id));
    const result = questionsForObjective("1.1", MAX_QUESTIONS_PER_FETCH, excludeIds);

    // Should not contain excluded IDs (unless fallback triggered)
    const returnedIds = new Set(result.map((q) => q.id));
    for (const id of excludeIds) {
      // At least one returned ID must NOT be in the excluded set (since pool had remainders)
      expect(returnedIds.has(id)).toBe(false);
    }
  });

  it("falls back to full pool when all questions are excluded (never returns empty)", () => {
    // Fetch questions first to know real IDs, then exclude ALL of them.
    const first = questionsForObjective("1.1", MAX_QUESTIONS_PER_FETCH);
    // We don't know all IDs upfront, so we build a set of clearly-all IDs by
    // collecting several samples and excluding them — then verify we still get results.
    // Build a large exclude set by collecting IDs from multiple fetches.
    const collected = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const batch = questionsForObjective("1.1", MAX_QUESTIONS_PER_FETCH);
      for (const q of batch) collected.add(q.id);
    }
    // By now collected should contain all (or most) IDs. Exclude them all.
    const result = questionsForObjective("1.1", MAX_QUESTIONS_PER_FETCH, collected);
    // CRITICAL: must never return empty due to exclusion
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(MAX_QUESTIONS_PER_FETCH);
    // Returned IDs must all be valid questions
    expect(result.every((q) => typeof q.id === "string" && q.id.length > 0)).toBe(true);
    // Confirm first fetch returned something too (sanity)
    expect(first.length).toBeGreaterThan(0);
  });

  it("treats empty excludeIds set same as no exclusion", () => {
    const withEmpty = questionsForObjective("1.1", MAX_QUESTIONS_PER_FETCH, new Set());
    expect(withEmpty.length).toBeGreaterThan(0);
  });

  it("never returns more than MAX_QUESTIONS_PER_FETCH even with exclusion", () => {
    const result = questionsForObjective("1.1", MAX_QUESTIONS_PER_FETCH, new Set(["q-fake"]));
    expect(result.length).toBeLessThanOrEqual(MAX_QUESTIONS_PER_FETCH);
  });
});

// ── progress helpers ────────────────────────────────────────────────────────

describe("progress: countAnsweredToday", () => {
  it("counts questions from sessions completed today (UTC)", () => {
    const now = new Date();
    const sessions = [makeSession(["a", "b", "c"], 0.5)]; // 30 min ago
    expect(countAnsweredToday(sessions, now)).toBe(3);
  });

  it("excludes sessions completed before today UTC", () => {
    // Create a session completed exactly yesterday.
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const sessions: SessionRow[] = [
      {
        completed_at: yesterday.toISOString(),
        questions: [{ questionId: "q-old", objectiveId: obj11, picked: "A", correct: true }],
      },
    ];
    expect(countAnsweredToday(sessions)).toBe(0);
  });

  it("returns 0 for empty sessions", () => {
    expect(countAnsweredToday([])).toBe(0);
  });

  it("handles null questions in session", () => {
    const sessions: SessionRow[] = [
      { completed_at: new Date().toISOString(), questions: null },
    ];
    expect(countAnsweredToday(sessions)).toBe(0);
  });
});

describe("progress: countTotalAnswered", () => {
  it("sums all questions across sessions", () => {
    const sessions = [
      makeSession(["a", "b"], 1),
      makeSession(["c"], 25),
    ];
    expect(countTotalAnswered(sessions)).toBe(3);
  });

  it("returns 0 for empty sessions", () => {
    expect(countTotalAnswered([])).toBe(0);
  });
});

describe("progress: integration shape", () => {
  const obj41 = objectiveIdForCode("4.1")!;
  const sessions: SessionRow[] = [
    {
      completed_at: new Date().toISOString(),
      questions: [
        { questionId: "q-a", objectiveId: obj11, picked: "A", correct: true },
        { questionId: "q-b", objectiveId: obj41, picked: "B", correct: false },
      ],
    },
  ];

  it("computeMasterySummary returns a predictedScore from sessions", () => {
    const { predictedScore } = computeMasterySummary(sessions);
    expect(predictedScore).not.toBeNull();
  });

  it("computeWeakObjectives returns at most 3 items", () => {
    const weak = computeWeakObjectives(sessions, 3);
    expect(weak.length).toBeLessThanOrEqual(3);
    expect(weak[0]).toHaveProperty("objectiveCode");
    expect(weak[0]).toHaveProperty("mastery");
  });

  it("computeRecentMisses returns at most 5 items with expected shape", () => {
    const misses = computeRecentMisses(sessions, 5);
    expect(misses.length).toBeLessThanOrEqual(5);
    for (const m of misses) {
      expect(m).toHaveProperty("questionId");
      expect(m).toHaveProperty("objectiveCode");
      expect(m).toHaveProperty("stem");
      expect(m).toHaveProperty("picked");
      expect(m).toHaveProperty("correctKey");
      expect(m).toHaveProperty("reviewedAt");
      // answer key present but that's the same surface /recent-misses already exposes
    }
  });

  it("recentMisses does not contain correct answers", () => {
    const misses = computeRecentMisses(sessions, 5);
    // q-a was correct, should not appear
    expect(misses.some((m) => m.questionId === "q-a")).toBe(false);
  });
});
