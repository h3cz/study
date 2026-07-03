import { describe, it, expect } from "vitest";
import { resolveDisplayName, generateInviteCode } from "@/lib/leaderboard";

// ─── Display name fallback ────────────────────────────────────────────────────

describe("resolveDisplayName", () => {
  it("returns display_name when set", () => {
    const result = resolveDisplayName("Alice", "abcd1234-ef56-7890-abcd-ef1234567890");
    expect(result).toBe("Alice");
  });

  it("falls back to anon-XXXX when display_name is null", () => {
    const userId = "abcd1234-ef56-7890-abcd-ef1234567890";
    const result = resolveDisplayName(null, userId);
    expect(result).toBe("anon-abcd");
  });

  it("falls back to anon-XXXX when display_name is empty string", () => {
    const userId = "xyz9abcd-ef56-7890-abcd-ef1234567890";
    const result = resolveDisplayName("", userId);
    expect(result).toBe("anon-xyz9");
  });

  it("falls back to anon-XXXX when display_name is whitespace only", () => {
    const userId = "1234abcd-ef56-7890-abcd-ef1234567890";
    const result = resolveDisplayName("   ", userId);
    expect(result).toBe("anon-1234");
  });

  it("trims whitespace from display_name", () => {
    const result = resolveDisplayName("  Bob  ", "aaaa1111-ef56-7890-abcd-ef1234567890");
    expect(result).toBe("Bob");
  });
});

// ─── Invite code generator ────────────────────────────────────────────────────

describe("generateInviteCode", () => {
  it("produces a 6-character string", () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(6);
  });

  it("produces only uppercase alphanumeric characters (no ambiguous 0/O/1/I)", () => {
    // Run multiple times to reduce flakiness
    for (let i = 0; i < 50; i++) {
      const code = generateInviteCode();
      expect(code).toMatch(/^[A-Z2-9]+$/);
      expect(code).not.toMatch(/[01OI]/);
    }
  });

  it("produces unique codes across calls (probabilistic — 1 in 32^6 chance of collision)", () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateInviteCode()));
    expect(codes.size).toBe(20);
  });
});

// ─── Sort order (pure logic, no Supabase) ────────────────────────────────────

describe("leaderboard sort logic", () => {
  interface RawRow { userId: string; predictedScore: number | null }

  function toSorted(rows: RawRow[]) {
    return rows
      .filter((r) => r.predictedScore !== null)
      .sort((a, b) => (b.predictedScore ?? 0) - (a.predictedScore ?? 0));
  }

  it("sorts highest score first", () => {
    const rows: RawRow[] = [
      { userId: "a", predictedScore: 650 },
      { userId: "b", predictedScore: 800 },
      { userId: "c", predictedScore: 500 },
    ];
    const sorted = toSorted(rows);
    expect(sorted.map((r) => r.predictedScore)).toEqual([800, 650, 500]);
  });

  it("excludes rows with null predicted_score", () => {
    const rows: RawRow[] = [
      { userId: "a", predictedScore: 700 },
      { userId: "b", predictedScore: null },
      { userId: "c", predictedScore: 600 },
    ];
    const sorted = toSorted(rows);
    expect(sorted).toHaveLength(2);
    expect(sorted.every((r) => r.predictedScore !== null)).toBe(true);
  });
});

// ─── isMe flag ────────────────────────────────────────────────────────────────

describe("isMe detection", () => {
  function buildRows(
    userIds: string[],
    scores: number[],
    currentUserId: string | null
  ) {
    return userIds.map((userId, i) => ({
      userId,
      displayName: `user-${i}`,
      predictedScore: scores[i],
      isMe: currentUserId !== null && userId === currentUserId,
    }));
  }

  it("marks the current user row as isMe", () => {
    const rows = buildRows(["aaa", "bbb", "ccc"], [700, 650, 600], "bbb");
    const meRow = rows.find((r) => r.isMe);
    expect(meRow?.userId).toBe("bbb");
  });

  it("does not mark any row when currentUserId is null", () => {
    const rows = buildRows(["aaa", "bbb", "ccc"], [700, 650, 600], null);
    expect(rows.every((r) => !r.isMe)).toBe(true);
  });
});
