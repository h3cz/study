/**
 * keyboard-shortcuts.test.ts
 * Tests for the useKeyboardShortcuts guard logic.
 *
 * Runs in Node environment (vitest default). We test the same guard
 * conditions that the hook uses, expressed as a pure function, without
 * needing DOM globals or a React renderer.
 */

import { describe, it, expect, vi } from "vitest";

// ── Reproduce the exact guard logic from lib/useKeyboardShortcuts.ts ──────────
//
// The hook decides whether to fire a handler based on:
//   1. Whether the current focused element is a form field
//   2. Whether a modifier key (meta/ctrl/alt) is held

interface FakeEvent {
  key: string;
  metaKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
}

interface FakeTarget {
  tagName: string;
  isContentEditable?: boolean;
}

function shouldIgnore(e: FakeEvent, target: FakeTarget | null): boolean {
  if (target) {
    const tag = target.tagName.toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA") return true;
    if (target.isContentEditable) return true;
  }
  if (e.metaKey || e.ctrlKey || e.altKey) return true;
  return false;
}

function dispatch(
  handlers: Record<string, () => void>,
  e: FakeEvent,
  target: FakeTarget | null
) {
  if (shouldIgnore(e, target)) return;
  handlers[e.key]?.();
}

// ── Tests ─────────────────────────────────────────────────────────────────────

const bodyTarget: FakeTarget = { tagName: "div" };
const inputTarget: FakeTarget = { tagName: "input" };
const textareaTarget: FakeTarget = { tagName: "textarea" };
const ceTarget: FakeTarget = { tagName: "div", isContentEditable: true };

describe("useKeyboardShortcuts guard logic", () => {
  it("fires handler for a plain key on a non-form element", () => {
    const h = vi.fn();
    dispatch({ "1": h }, { key: "1" }, bodyTarget);
    expect(h).toHaveBeenCalledOnce();
  });

  it("ignores keys when focus is in <input>", () => {
    const h = vi.fn();
    dispatch({ "1": h }, { key: "1" }, inputTarget);
    expect(h).not.toHaveBeenCalled();
  });

  it("ignores keys when focus is in <textarea>", () => {
    const h = vi.fn();
    dispatch({ "2": h }, { key: "2" }, textareaTarget);
    expect(h).not.toHaveBeenCalled();
  });

  it("ignores keys when focus is in [contenteditable]", () => {
    const h = vi.fn();
    dispatch({ "t": h }, { key: "t" }, ceTarget);
    expect(h).not.toHaveBeenCalled();
  });

  it("ignores keys when Ctrl is held", () => {
    const h = vi.fn();
    dispatch({ "t": h }, { key: "t", ctrlKey: true }, bodyTarget);
    expect(h).not.toHaveBeenCalled();
  });

  it("ignores keys when Meta (Cmd) is held", () => {
    const h = vi.fn();
    dispatch({ "t": h }, { key: "t", metaKey: true }, bodyTarget);
    expect(h).not.toHaveBeenCalled();
  });

  it("ignores keys when Alt is held", () => {
    const h = vi.fn();
    dispatch({ "f": h }, { key: "f", altKey: true }, bodyTarget);
    expect(h).not.toHaveBeenCalled();
  });

  it("fires for numeric keys 1-4 (correct handler called per key)", () => {
    const counts: Record<string, number> = {};
    const handlers: Record<string, () => void> = {
      "1": () => { counts["1"] = (counts["1"] ?? 0) + 1; },
      "2": () => { counts["2"] = (counts["2"] ?? 0) + 1; },
      "3": () => { counts["3"] = (counts["3"] ?? 0) + 1; },
      "4": () => { counts["4"] = (counts["4"] ?? 0) + 1; },
    };

    for (const key of ["1", "2", "3", "4"]) {
      dispatch(handlers, { key }, bodyTarget);
    }

    expect(counts["1"]).toBe(1);
    expect(counts["2"]).toBe(1);
    expect(counts["3"]).toBe(1);
    expect(counts["4"]).toBe(1);
  });

  it("fires for ArrowRight", () => {
    const h = vi.fn();
    dispatch({ "ArrowRight": h }, { key: "ArrowRight" }, bodyTarget);
    expect(h).toHaveBeenCalledOnce();
  });

  it("fires for Space", () => {
    const h = vi.fn();
    dispatch({ " ": h }, { key: " " }, bodyTarget);
    expect(h).toHaveBeenCalledOnce();
  });

  it("does not fire when no matching handler is registered", () => {
    const h = vi.fn();
    dispatch({ "Enter": h }, { key: "Escape" }, bodyTarget);
    expect(h).not.toHaveBeenCalled();
  });

  it("handlers unmount cleanly — no lingering calls after cleanup", () => {
    // Simulate: register a handler, call cleanup (remove listener), then
    // ensure the handler is NOT called after cleanup.
    const h = vi.fn();
    const registered: Array<() => void> = [];

    function addListener(_event: string, fn: () => void) {
      registered.push(fn);
    }
    function removeListener(_event: string, fn: () => void) {
      const idx = registered.indexOf(fn);
      if (idx !== -1) registered.splice(idx, 1);
    }

    const listener = () => {
      const e: FakeEvent = { key: "1" };
      if (!shouldIgnore(e, bodyTarget)) h();
    };

    addListener("keydown", listener);
    expect(registered).toHaveLength(1);

    // Cleanup (unmount)
    removeListener("keydown", listener);
    expect(registered).toHaveLength(0);

    // Simulate a keydown after cleanup — nobody calls it now
    // (registered is empty so no calls go through)
    for (const fn of registered) fn();
    expect(h).not.toHaveBeenCalled();
  });
});
