import { describe, it, expect } from "vitest";
import { generateRawToken, looksLikeToken, hashToken } from "@/lib/study-buddy/auth";
import {
  computeMasterySummary,
  computeWeakObjectives,
  computeRecentMisses,
  type SessionRow,
} from "@/lib/study-buddy/mastery-server";
import { getObjectiveTree, objectiveIdForCode } from "@/lib/study-buddy/objectives";

describe("study-buddy token", () => {
  it("generates a well-formed sq_live token", () => {
    const t = generateRawToken();
    expect(t).toMatch(/^sq_live_[0-9a-f]{32}$/);
    expect(looksLikeToken(t)).toBe(true);
  });

  it("rejects malformed tokens", () => {
    expect(looksLikeToken("nope")).toBe(false);
    expect(looksLikeToken("sq_live_zzzz")).toBe(false);
    expect(looksLikeToken("sq_test_" + "a".repeat(32))).toBe(false);
  });

  it("hashes deterministically and never returns the raw token", async () => {
    const t = generateRawToken();
    const h1 = await hashToken(t);
    const h2 = await hashToken(t);
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
    expect(h1).not.toContain(t);
  });
});

describe("study-buddy objective tree", () => {
  it("exposes domains with weights and objective codes (no question text)", () => {
    const tree = getObjectiveTree();
    expect(tree.length).toBe(5);
    expect(tree[0].number).toBe(1);
    expect(tree[0].objectives.length).toBeGreaterThan(0);
    const totalWeight = tree.reduce((s, d) => s + d.weight, 0);
    expect(totalWeight).toBeCloseTo(1, 1);
    // no stem/choices/explanation leak
    expect(JSON.stringify(tree)).not.toContain("explanation");
  });

  it("maps objective codes to internal ids", () => {
    expect(objectiveIdForCode("1.1")).toContain("obj:1.1");
    expect(objectiveIdForCode("99.9")).toBeNull();
  });
});

// Build synthetic sessions referencing real objective ids.
const obj11 = objectiveIdForCode("1.1")!;
const obj41 = objectiveIdForCode("4.1")!;

const sessions: SessionRow[] = [
  {
    completed_at: new Date().toISOString(),
    questions: [
      { questionId: "q-a", objectiveId: obj11, picked: "A", correct: true },
      { questionId: "q-b", objectiveId: obj41, picked: "B", correct: false },
      { questionId: "q-c", objectiveId: obj41, picked: "C", correct: false },
    ],
  },
];

describe("study-buddy mastery (server)", () => {
  it("returns null predictedScore for an empty history", () => {
    const s = computeMasterySummary([]);
    expect(s.predictedScore).toBeNull();
    expect(s.domains.length).toBe(5);
  });

  it("computes a predicted score and per-domain mastery from sessions", () => {
    const s = computeMasterySummary(sessions);
    expect(s.predictedScore).not.toBeNull();
    expect(s.predictedScore!).toBeGreaterThanOrEqual(100);
    expect(s.predictedScore!).toBeLessThanOrEqual(900);
    const d4 = s.domains.find((d) => d.number === 4)!;
    const d1 = s.domains.find((d) => d.number === 1)!;
    // 4.1 was missed twice → lower mastery than 1.1 which was correct.
    expect(d4.mastery!).toBeLessThan(d1.mastery!);
  });

  it("surfaces the weakest objective first", () => {
    const weak = computeWeakObjectives(sessions, 3);
    expect(weak[0].objectiveCode).toBe("4.1");
    expect(weak[0].attempts).toBe(2);
  });

  it("returns only misses, newest first, capped", () => {
    const misses = computeRecentMisses(sessions, 10);
    expect(misses.length).toBe(2); // q-a was correct, excluded
    expect(misses.every((m) => m.objectiveCode === "4.1")).toBe(true);
  });

  it("respects the recent-misses limit cap", () => {
    const misses = computeRecentMisses(sessions, 1);
    expect(misses.length).toBe(1);
  });

  it("filters recent-misses by objective code", () => {
    const misses = computeRecentMisses(sessions, 10, "1.1");
    expect(misses.length).toBe(0); // 1.1 had no misses
  });
});
