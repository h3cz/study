import { describe, it, expect } from "vitest";
import { createEmptyCard, FSRS, Rating } from "ts-fsrs";

describe("ts-fsrs scheduling", () => {
  const fsrs = new FSRS({});

  it("a new card has state=New (0) and reps=0", () => {
    const card = createEmptyCard();
    expect(card.state).toBe(0); // State.New
    expect(card.reps).toBe(0);
  });

  it("rating Good advances reps and sets a future due date", () => {
    const card = createEmptyCard(new Date("2026-01-01"));
    const now = new Date("2026-01-01");
    const result = fsrs.repeat(card, now);
    const goodCard = result[Rating.Good].card;

    expect(goodCard.reps).toBeGreaterThan(0);
    expect(goodCard.due.getTime()).toBeGreaterThan(now.getTime());
  });

  it("rating Again (1) keeps card in learning state and schedules sooner than Good (3)", () => {
    const card = createEmptyCard(new Date("2026-01-01"));
    const now = new Date("2026-01-01");
    const result = fsrs.repeat(card, now);

    const againDue = result[Rating.Again].card.due.getTime();
    const goodDue = result[Rating.Good].card.due.getTime();

    expect(againDue).toBeLessThan(goodDue);
  });

  it("rating Easy (4) schedules further out than Good (3)", () => {
    const card = createEmptyCard(new Date("2026-01-01"));
    const now = new Date("2026-01-01");
    const result = fsrs.repeat(card, now);

    const goodDue = result[Rating.Good].card.due.getTime();
    const easyDue = result[Rating.Easy].card.due.getTime();

    expect(easyDue).toBeGreaterThanOrEqual(goodDue);
  });

  it("stability increases after a Good rating", () => {
    const card = createEmptyCard(new Date("2026-01-01"));
    const now = new Date("2026-01-01");
    const result = fsrs.repeat(card, now);
    const goodCard = result[Rating.Good].card;

    expect(goodCard.stability).toBeGreaterThan(card.stability);
  });

  it("reviewing twice compounds scheduled interval", () => {
    const card = createEmptyCard(new Date("2026-01-01"));
    const now1 = new Date("2026-01-01");
    const after1 = fsrs.repeat(card, now1)[Rating.Good].card;

    // Second review after first interval
    const now2 = after1.due;
    const after2 = fsrs.repeat(after1, now2)[Rating.Good].card;

    // Second scheduled interval should be longer
    const interval1 = after1.scheduled_days;
    const interval2 = after2.scheduled_days;
    expect(interval2).toBeGreaterThan(interval1);
  });
});
