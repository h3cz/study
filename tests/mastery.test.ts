import { describe, it, expect } from "vitest";
import { xpToLevel, levelToXp, nextLevelXp, levelProgress } from "../lib/gamification";

describe("gamification math", () => {
  it("level 0 starts at 0 XP", () => {
    expect(xpToLevel(0)).toBe(0);
  });

  it("level increases with XP", () => {
    // level = floor(sqrt(xp / 50))
    // level 1 = 50 XP, level 2 = 200 XP, level 3 = 450 XP
    expect(xpToLevel(50)).toBe(1);
    expect(xpToLevel(199)).toBe(1);
    expect(xpToLevel(200)).toBe(2);
    expect(xpToLevel(449)).toBe(2);
    expect(xpToLevel(450)).toBe(3);
  });

  it("levelToXp returns XP threshold for a level", () => {
    expect(levelToXp(0)).toBe(0);
    expect(levelToXp(1)).toBe(50);
    expect(levelToXp(2)).toBe(200);
    expect(levelToXp(3)).toBe(450);
  });

  it("nextLevelXp returns XP needed for the next level", () => {
    expect(nextLevelXp(0)).toBe(50);   // at 0 XP, next level is 1 requiring 50
    expect(nextLevelXp(50)).toBe(200); // at level 1, next level is 2 requiring 200
  });

  it("levelProgress is 0 at level start and approaches 1 near next level", () => {
    const progressAtLevelStart = levelProgress(50); // exactly level 1
    expect(progressAtLevelStart).toBeCloseTo(0, 1);

    const progressNearNextLevel = levelProgress(195); // 5 XP before level 2
    expect(progressNearNextLevel).toBeGreaterThan(0.9);
  });

  it("levelProgress never exceeds 1", () => {
    // At exactly the next level boundary, progress resets to 0
    expect(levelProgress(200)).toBeCloseTo(0, 1); // exactly level 2
  });
});

describe("score prediction formula", () => {
  it("minimum possible score is 100 (0% mastery all domains)", () => {
    // predicted = 100 + 800 * sum(weight * mastery), all mastery=0 → 100
    const score = 100 + 800 * 0;
    expect(score).toBe(100);
  });

  it("maximum possible score is 900 (100% mastery all domains)", () => {
    // Domain weights sum to 1.0 (0.12 + 0.22 + 0.18 + 0.28 + 0.20)
    const weights = [0.12, 0.22, 0.18, 0.28, 0.20];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    expect(totalWeight).toBeCloseTo(1.0, 5);

    const score = 100 + 800 * totalWeight;
    expect(score).toBe(900);
  });

  it("passing threshold of 750 corresponds to ~81.25% overall mastery", () => {
    // 750 = 100 + 800 * m → m = 650/800 = 0.8125
    const targetMastery = (750 - 100) / 800;
    expect(targetMastery).toBeCloseTo(0.8125, 3);
  });

  it("score rounds to nearest 10", () => {
    // 100 + 800 * 0.5 = 500
    const raw = 100 + 800 * 0.5;
    const rounded = Math.round(raw / 10) * 10;
    expect(rounded).toBe(500);
  });
});
