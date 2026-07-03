import { describe, it, expect } from "vitest";
import {
  isoOf,
  numOf,
  clampRating,
  localQuizSignature,
  remoteQuizSignature,
  remoteQuizToLocal,
} from "@/lib/sync/engine";

// These pure helpers back the cross-device down-sync (hydrateFromRemote).
// The dedup relies on local & remote signatures matching for the SAME session,
// and the FSRS coercion must survive a ts-fsrs Card → JSON → Postgres round-trip
// (Dates become ISO strings, numbers stay numbers).

describe("FSRS state coercion (JSON round-trip safe)", () => {
  it("isoOf passes through ISO strings", () => {
    expect(isoOf("2026-05-30T00:00:00.000Z")).toBe("2026-05-30T00:00:00.000Z");
  });

  it("isoOf converts epoch numbers to ISO", () => {
    expect(isoOf(0)).toBe("1970-01-01T00:00:00.000Z");
  });

  it("isoOf returns undefined for missing/garbage", () => {
    expect(isoOf(undefined)).toBeUndefined();
    expect(isoOf(null)).toBeUndefined();
    expect(isoOf({})).toBeUndefined();
  });

  it("numOf returns finite numbers, else 0", () => {
    expect(numOf(4.2)).toBe(4.2);
    expect(numOf(0)).toBe(0);
    expect(numOf(undefined)).toBe(0);
    expect(numOf("5")).toBe(0);
    expect(numOf(NaN)).toBe(0);
    expect(numOf(Infinity)).toBe(0);
  });

  it("clampRating constrains to 1..4 with a safe default", () => {
    expect(clampRating(1)).toBe(1);
    expect(clampRating(2)).toBe(2);
    expect(clampRating(3)).toBe(3);
    expect(clampRating(4)).toBe(4);
    expect(clampRating(9)).toBe(4);
    expect(clampRating(0)).toBe(1);
    expect(clampRating(undefined)).toBe(3);
  });

  it("coerces a serialized ts-fsrs Card snapshot", () => {
    // What a ts-fsrs Card looks like after JSON.stringify → Supabase jsonb → read.
    const fsrsState = JSON.parse(
      JSON.stringify({
        due: new Date("2026-06-10T00:00:00.000Z"),
        stability: 12.3,
        difficulty: 5.1,
        elapsed_days: 3,
        scheduled_days: 11,
        reps: 4,
        lapses: 1,
        state: 2,
        last_review: new Date("2026-05-30T00:00:00.000Z"),
      })
    );
    expect(isoOf(fsrsState.due)).toBe("2026-06-10T00:00:00.000Z");
    expect(numOf(fsrsState.stability)).toBe(12.3);
    expect(numOf(fsrsState.state)).toBe(2);
    expect(isoOf(fsrsState.last_review)).toBe("2026-05-30T00:00:00.000Z");
  });
});

describe("quiz-session dedup signatures (timestamp-independent)", () => {
  const remote = {
    started_at: "2026-05-30T10:00:00.000Z",
    completed_at: "2026-05-30T10:05:00.000Z",
    score_pct: 80,
    cert_id: "secplus-sy0-701",
    questions: [
      { questionId: "q2", objectiveId: "1.2", picked: "A", correct: true },
      { questionId: "q1", objectiveId: "1.1", picked: "B", correct: false },
    ],
  };

  it("local and remote signatures match for the same session", () => {
    const local = remoteQuizToLocal(remote);
    expect(localQuizSignature(local)).toBe(remoteQuizSignature(remote));
  });

  it("matches even when local/remote timestamps differ (real-world case)", () => {
    // The local Dexie row is written with a different `new Date()` than the
    // pushed remote row — signatures must still match so we never re-import.
    const local = remoteQuizToLocal(remote);
    const localWithDriftedTimestamps = {
      ...local,
      startedAt: "2026-05-30T10:00:00.123Z", // ms drift
      completedAt: "2026-05-30T10:05:00.456Z",
    };
    expect(localQuizSignature(localWithDriftedTimestamps)).toBe(
      remoteQuizSignature(remote)
    );
  });

  it("is order-independent over the question set", () => {
    const reordered = { ...remote, questions: [...remote.questions].reverse() };
    expect(remoteQuizSignature(reordered)).toBe(remoteQuizSignature(remote));
  });

  it("different score → different signature", () => {
    expect(remoteQuizSignature(remote)).not.toBe(
      remoteQuizSignature({ ...remote, score_pct: 90 })
    );
  });

  it("different question set → different signature", () => {
    expect(remoteQuizSignature(remote)).not.toBe(
      remoteQuizSignature({
        ...remote,
        questions: [{ questionId: "q9", objectiveId: "1.1", picked: "A", correct: true }],
      })
    );
  });

  it("handles an in-progress (null) session without throwing", () => {
    const r = { started_at: "x", completed_at: null, score_pct: null, questions: null };
    const local = remoteQuizToLocal(r);
    expect(local.completedAt).toBeUndefined();
    expect(localQuizSignature(local)).toBe(remoteQuizSignature(r));
  });
});

describe("remoteQuizToLocal reconstruction", () => {
  it("rebuilds answers, answerRecords, and questionIds", () => {
    const remote = {
      cert_id: "secplus-sy0-701",
      started_at: "2026-05-30T10:00:00.000Z",
      completed_at: "2026-05-30T10:05:00.000Z",
      score_pct: 50,
      questions: [
        { questionId: "q1", objectiveId: "1.1", picked: "A", correct: true },
        { questionId: "q2", objectiveId: "1.2", picked: "C", correct: false },
        { questionId: "q3", objectiveId: "1.3", picked: null, correct: false },
      ],
    };
    const local = remoteQuizToLocal(remote);
    expect(local.certId).toBe("secplus-sy0-701");
    expect(local.questionIds).toEqual(["q1", "q2", "q3"]);
    expect(local.answers).toEqual({ q1: "A", q2: "C" }); // null pick omitted
    expect(local.answerRecords).toEqual([
      { questionId: "q1", picked: "A", correct: true },
      { questionId: "q2", picked: "C", correct: false },
      { questionId: "q3", picked: null, correct: false },
    ]);
    expect(local.score).toBe(50);
    expect(local.xpEarned).toBe(0);
  });

  it("tolerates a missing questions array", () => {
    const local = remoteQuizToLocal({
      cert_id: "secplus-sy0-701",
      started_at: "2026-05-30T10:00:00.000Z",
      completed_at: null,
      score_pct: null,
      questions: null,
    });
    expect(local.questionIds).toEqual([]);
    expect(local.answers).toEqual({});
    expect(local.score).toBe(0);
  });
});
