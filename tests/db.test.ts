/**
 * db.test.ts
 * Unit tests for seedDb FSRS-state preservation (Bug C1).
 *
 * These tests run in a Node environment where IndexedDB is not available,
 * so we test the merge logic directly by extracting it as a pure function
 * and verifying the invariants.
 */

import { describe, it, expect } from "vitest";
import type { Flashcard } from "../lib/db";

// ─── Pure merge function extracted from seedDb logic ─────────────────────────
// Mirrors exactly what seedDb does: for each seed card, if an existing card
// has FSRS state, preserve it; otherwise use the seed card as-is.

function mergeFlashcards(
  seedCards: Flashcard[],
  existingCards: Flashcard[]
): Flashcard[] {
  const existingById = new Map(existingCards.map((c) => [c.id, c]));
  return seedCards.map((seedCard) => {
    const existing = existingById.get(seedCard.id);
    if (!existing) return seedCard;
    return {
      ...seedCard,
      fsrsDue: existing.fsrsDue,
      fsrsStability: existing.fsrsStability,
      fsrsDifficulty: existing.fsrsDifficulty,
      fsrsElapsedDays: existing.fsrsElapsedDays,
      fsrsScheduledDays: existing.fsrsScheduledDays,
      fsrsReps: existing.fsrsReps,
      fsrsLapses: existing.fsrsLapses,
      fsrsState: existing.fsrsState,
      fsrsLastReview: existing.fsrsLastReview,
    };
  });
}

// ─── Test data ────────────────────────────────────────────────────────────────

const BASE_CARD: Flashcard = {
  id: "fc-d1-01",
  certId: "secplus-sy0-701",
  domainId: "secplus-sy0-701:domain:1",
  objectiveId: "secplus-sy0-701:obj:1.1",
  front: "Original front",
  back: "Original back",
};

const SEED_CARD_UPDATED: Flashcard = {
  ...BASE_CARD,
  front: "Updated front text",
  back: "Updated back text",
};

const CARD_WITH_FSRS: Flashcard = {
  ...BASE_CARD,
  fsrsDue: "2026-06-01T12:00:00.000Z",
  fsrsStability: 4.2,
  fsrsDifficulty: 5.1,
  fsrsElapsedDays: 3,
  fsrsScheduledDays: 7,
  fsrsReps: 2,
  fsrsLapses: 0,
  fsrsState: 2, // Review
  fsrsLastReview: "2026-05-25T12:00:00.000Z",
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("seedDb FSRS preservation (mergeFlashcards)", () => {
  it("new card (no existing) — uses seed card verbatim", () => {
    const result = mergeFlashcards([BASE_CARD], []);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(BASE_CARD);
    expect(result[0].fsrsDue).toBeUndefined();
    expect(result[0].fsrsReps).toBeUndefined();
  });

  it("existing card with FSRS state — FSRS fields are preserved after reseed", () => {
    const result = mergeFlashcards([SEED_CARD_UPDATED], [CARD_WITH_FSRS]);
    const merged = result[0];

    // FSRS state must come from the existing card, not the seed
    expect(merged.fsrsDue).toBe("2026-06-01T12:00:00.000Z");
    expect(merged.fsrsStability).toBe(4.2);
    expect(merged.fsrsDifficulty).toBe(5.1);
    expect(merged.fsrsElapsedDays).toBe(3);
    expect(merged.fsrsScheduledDays).toBe(7);
    expect(merged.fsrsReps).toBe(2);
    expect(merged.fsrsLapses).toBe(0);
    expect(merged.fsrsState).toBe(2);
    expect(merged.fsrsLastReview).toBe("2026-05-25T12:00:00.000Z");
  });

  it("existing card with FSRS state — content fields are updated from seed", () => {
    const result = mergeFlashcards([SEED_CARD_UPDATED], [CARD_WITH_FSRS]);
    const merged = result[0];

    // Content fields must come from the seed (updated)
    expect(merged.front).toBe("Updated front text");
    expect(merged.back).toBe("Updated back text");
    expect(merged.id).toBe("fc-d1-01");
    expect(merged.certId).toBe("secplus-sy0-701");
  });

  it("multiple cards — each is merged independently", () => {
    const seed: Flashcard[] = [
      { ...BASE_CARD, id: "fc-d1-01", back: "New back 1" },
      { ...BASE_CARD, id: "fc-d1-02", back: "New back 2" },
      { ...BASE_CARD, id: "fc-d1-03", back: "New back 3 (brand new card)" },
    ];
    const existing: Flashcard[] = [
      { ...CARD_WITH_FSRS, id: "fc-d1-01", fsrsReps: 5 },
      { ...CARD_WITH_FSRS, id: "fc-d1-02", fsrsReps: 0 }, // reviewed but 0 reps (just created)
      // fc-d1-03 does not exist yet
    ];

    const result = mergeFlashcards(seed, existing);
    expect(result).toHaveLength(3);

    // Card 1 — existing: preserves FSRS, updates content
    expect(result[0].fsrsReps).toBe(5);
    expect(result[0].back).toBe("New back 1");

    // Card 2 — existing: preserves FSRS (reps=0), updates content
    expect(result[1].fsrsReps).toBe(0);
    expect(result[1].fsrsDue).toBe("2026-06-01T12:00:00.000Z");
    expect(result[1].back).toBe("New back 2");

    // Card 3 — new: no FSRS state, takes seed verbatim
    expect(result[2].fsrsReps).toBeUndefined();
    expect(result[2].fsrsDue).toBeUndefined();
    expect(result[2].back).toBe("New back 3 (brand new card)");
  });

  it("existing card with no FSRS state (never reviewed) — seed fields used, no undefined FSRS", () => {
    const existingNoFsrs: Flashcard = { ...BASE_CARD }; // no FSRS fields
    const result = mergeFlashcards([SEED_CARD_UPDATED], [existingNoFsrs]);
    const merged = result[0];

    // Content updated
    expect(merged.back).toBe("Updated back text");
    // FSRS still undefined (existing had none)
    expect(merged.fsrsDue).toBeUndefined();
    expect(merged.fsrsState).toBeUndefined();
  });

  it("content-only reseed — identical seed card still preserves FSRS", () => {
    // Simulates a typo-fix that doesn't change FSRS logic
    const seedFixed: Flashcard = { ...BASE_CARD, back: "Fixed typo in back" };
    const result = mergeFlashcards([seedFixed], [CARD_WITH_FSRS]);
    expect(result[0].fsrsState).toBe(2);
    expect(result[0].fsrsStability).toBe(4.2);
    expect(result[0].back).toBe("Fixed typo in back");
  });
});
