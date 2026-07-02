import { describe, it, expect } from "vitest";
import { perfQuestions } from "../content/seed";

// ── PBQ scoring logic ─────────────────────────────────────────────────────────

/**
 * Simulates the scoring logic used in DragMatch / pbq/page.tsx:
 * count how many slots have the canonical right value.
 */
function scorePbq(
  pairs: { left: string; right: string }[],
  playerSlots: string[]
): number {
  return pairs.filter((p, i) => playerSlots[i] === p.right).length;
}

describe("PBQ scoring", () => {
  const q = perfQuestions[0]; // control-type PBQ, 6 pairs

  it("perfect match scores all pairs correct", () => {
    const perfect = q.pairs.map((p) => p.right);
    expect(scorePbq(q.pairs, perfect)).toBe(q.pairs.length);
  });

  it("all wrong scores 0", () => {
    // Rotate the answers so nothing lines up
    const wrong = [...q.pairs.map((p) => p.right).slice(1), q.pairs[0].right];
    expect(scorePbq(q.pairs, wrong)).toBe(0);
  });

  it("partial match scores correctly", () => {
    // First pair correct, rest rotated
    const answers = q.pairs.map((p) => p.right);
    // Swap indices 1 and 2 to break two pairs (may create 0 or 1 accidental hits)
    [answers[1], answers[2]] = [answers[2], answers[1]];
    const result = scorePbq(q.pairs, answers);
    // At minimum index 0 is still correct
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThan(q.pairs.length);
  });

  it("score is always between 0 and total pairs", () => {
    const shuffled = [...q.pairs.map((p) => p.right)].reverse();
    const result = scorePbq(q.pairs, shuffled);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(q.pairs.length);
  });
});

// ── Seed data integrity ───────────────────────────────────────────────────────

describe("perfQuestions seed data", () => {
  it("contains exactly 25 PBQs", () => {
    expect(perfQuestions).toHaveLength(25);
  });

  it("every PBQ has type drag-match", () => {
    for (const q of perfQuestions) {
      expect(q.type).toBe("drag-match");
    }
  });

  it("every PBQ has at least 4 pairs", () => {
    for (const q of perfQuestions) {
      expect(q.pairs.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("pairs have unique left and right values within each PBQ", () => {
    for (const q of perfQuestions) {
      const lefts = q.pairs.map((p) => p.left);
      const rights = q.pairs.map((p) => p.right);
      expect(new Set(lefts).size).toBe(lefts.length);
      expect(new Set(rights).size).toBe(rights.length);
    }
  });

  it("all PBQs have valid difficulty 1-5", () => {
    for (const q of perfQuestions) {
      expect(q.difficulty).toBeGreaterThanOrEqual(1);
      expect(q.difficulty).toBeLessThanOrEqual(5);
    }
  });

  it("IDs follow the pbq ID pattern", () => {
    for (const q of perfQuestions) {
      expect(q.id).toMatch(/^secplus-sy0-701:pbq:/);
    }
  });
});
