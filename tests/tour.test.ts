import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock driver.js so it doesn't try to touch the DOM during test
vi.mock("driver.js", () => ({
  driver: () => ({ drive: () => {} }),
}));
vi.mock("driver.js/dist/driver.css", () => ({}));

// localStorage shim for node
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(k: string) { return this.store.get(k) ?? null; }
  setItem(k: string, v: string) { this.store.set(k, String(v)); }
  removeItem(k: string) { this.store.delete(k); }
  clear() { this.store.clear(); }
}

beforeEach(() => {
  // @ts-expect-error attaching to globalThis for tests
  globalThis.localStorage = new MemoryStorage();
});

describe("tour", () => {
  it("shouldShowTour returns true when localStorage is empty", async () => {
    const { shouldShowTour } = await import("@/lib/tour");
    expect(shouldShowTour()).toBe(true);
  });

  it("shouldShowTour returns false after markTourSeen at current version", async () => {
    const { shouldShowTour, markTourSeen } = await import("@/lib/tour");
    markTourSeen();
    expect(shouldShowTour()).toBe(false);
  });

  it("shouldShowTour returns true if stored version doesn't match TOUR_VERSION", async () => {
    const { shouldShowTour, TOUR_VERSION } = await import("@/lib/tour");
    localStorage.setItem("tourSeenVersion", String(TOUR_VERSION - 1));
    expect(shouldShowTour()).toBe(true);
  });

  it("shouldShowTour gracefully returns false if localStorage throws", async () => {
    // @ts-expect-error simulating no storage
    globalThis.localStorage = undefined;
    const { shouldShowTour } = await import("@/lib/tour");
    expect(shouldShowTour()).toBe(false);
  });
});
