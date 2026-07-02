import { db } from "@/lib/db";
import type { DrillSession } from "@/lib/db";
import { getUserState, xpToLevel } from "@/lib/gamification";

export const XP_PER_DRILL_CORRECT = 5;

/**
 * Lenient expansion match.
 *
 * Rules:
 * 1. Normalize both strings: lowercase, strip punctuation except hyphens, collapse whitespace.
 * 2. Split into words.
 * 3. If word counts match, check every word pair: the first 4 characters must match.
 *    (Handles "public key infra" → "Public Key Infrastructure" ✓
 *     but rejects "pub key infra" where the first word is only 3 chars for "public" ✗)
 * 4. Full exact match (after normalization) is always accepted.
 */
export function matchExpansion(userAnswer: string, expansion: string): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const norm = normalize(userAnswer);
  const target = normalize(expansion);

  // Exact match
  if (norm === target) return true;

  const userWords = norm.split(" ");
  const targetWords = target.split(" ");

  if (userWords.length !== targetWords.length) return false;

  // Every word must share at least 4 leading characters (or be fully contained if shorter)
  return userWords.every((w, i) => {
    const t = targetWords[i];
    const len = Math.min(4, t.length);
    // User word must be at least as long as the prefix we're checking
    return w.length >= len && w.slice(0, len) === t.slice(0, len);
  });
}

/** Record a completed drill session and award XP. */
export async function recordDrillSession(
  session: Omit<DrillSession, "id">
): Promise<{ xpEarned: number }> {
  const xpEarned = session.correct * XP_PER_DRILL_CORRECT;
  const today = new Date().toISOString().slice(0, 10);

  const state = await getUserState();
  const newXp = state.xp + xpEarned;
  const newLevel = xpToLevel(newXp);

  // Streak helpers (mirrors gamification.ts logic)
  let newStreak = state.streak;
  if (state.lastStudyDate !== today) {
    const last = state.lastStudyDate ? new Date(state.lastStudyDate) : null;
    const todayDate = new Date(today);
    const diffDays = last
      ? Math.round((todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    newStreak = diffDays === 1 ? state.streak + 1 : 1;
  }
  const newTotalDays =
    state.lastStudyDate !== today ? state.totalStudyDays + 1 : state.totalStudyDays;

  await db.transaction("rw", [db.userState, db.drillSessions], async () => {
    await db.userState.put({
      ...state,
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastStudyDate: today,
      totalStudyDays: newTotalDays,
    });
    await db.drillSessions.add(session);
  });

  return { xpEarned };
}

/** Get the all-time best drill result (most correct answers). */
export async function getBestDrillSession(): Promise<DrillSession | null> {
  const sessions = await db.drillSessions.toArray();
  if (sessions.length === 0) return null;
  return sessions.reduce((best, s) => (s.correct > best.correct ? s : best), sessions[0]);
}
