"use client";

// Async duel reward reconciliation.
//
// The server awards duel XP to BOTH players at finalize time (authoritative,
// in the SQL finalizer). What lives only on each device is the local XP
// mirror, the per-cert XP mirror, and the win streak — and in the async flow
// the player who is offline at completion never has an arena open to run the
// usual reconciliation. This module closes that gap: whenever a completed
// challenge is discovered (challenges list on /play, or the arena itself),
// reconcile it locally exactly once per browser.

import { flushDetailed, pullLatest, enqueue } from "@/lib/sync/engine";
import { getUserState, creditDuelWin } from "@/lib/gamification";
import { outcomeFor } from "@/lib/multiplayer/scoring";
import type { DuelMatch } from "@/lib/multiplayer/types";
import type { Me } from "@/lib/multiplayer/use-me";

const STORE_KEY = "async-duel-reconciled";

function readSet(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeSet(set: Set<string>): void {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([...set]));
  } catch {
    // Private mode / quota: worst case we reconcile again later (idempotent).
  }
}

// Records are scoped per user: two participants sharing a browser profile
// must each reconcile the same completed match for their own local mirrors.
function recordId(matchId: string, userId: string): string {
  return `${matchId}:${userId}`;
}

export function isReconciled(matchId: string, userId: string): boolean {
  return readSet().has(recordId(matchId, userId));
}

function markReconciled(matchId: string, userId: string): void {
  const set = readSet();
  set.add(recordId(matchId, userId));
  writeSet(set);
}

// Guard against concurrent reconciliation (list + arena, or many rows at once).
const inFlight = new Set<string>();

/**
 * Reconcile one completed async challenge locally (XP mirrors, win streak).
 * Runs at most once per (match, user, browser). Returns true when
 * reconciliation actually ran for this match.
 */
export async function reconcileCompletedChallenge(
  match: DuelMatch,
  me: Me
): Promise<boolean> {
  if (match.status !== "done" || isReconciled(match.id, me.userId) || inFlight.has(match.id)) {
    return false;
  }
  inFlight.add(match.id);
  try {
    const myScore = match.hostId === me.userId ? match.hostScore : match.guestScore;
    const oppScore = match.hostId === me.userId ? match.guestScore : match.hostScore;
    const myCorrect = match.hostId === me.userId ? match.hostCorrect : match.guestCorrect;
    const oppCorrect = match.hostId === me.userId ? match.guestCorrect : match.hostCorrect;

    // Track real success: marking reconciled after a swallowed failure would
    // permanently skip a stale mirror. flushDetailed must report zero failed
    // pushes, and pullLatest must report a real remote read ("merged") — the
    // server always writes a user_state row at finalize, so "empty" here means
    // the read silently failed. Unmarked = retry later.
    //
    // Streak credit is day-scoped: a win from an earlier day must not advance
    // today's streak when reconciled late (creditDuelWin is idempotent per
    // day, so same-day retries are safe; cross-day retries would not be).
    // Known limit of the sync model (pre-existing, shared with live duels):
    // user_state merges with GREATEST, so unsynced LOCAL study gains that are
    // smaller than the server-side duel award can be dropped when both land at
    // once. Global XP remains authoritative server-side; the durable fix is a
    // delta-based XP sync op (tracked in docs/ROADMAP.md).
    const won = outcomeFor(myScore, oppScore, myCorrect, oppCorrect) === "win";
    const endedToday =
      !!match.endedAt && match.endedAt.slice(0, 10) === new Date().toISOString().slice(0, 10);
    const shouldCreditStreak = won && endedToday;

    let ok = true;
    const flushed = await flushDetailed();
    if (flushed.failed > 0) ok = false;
    const pulled = await pullLatest(me.userId);
    if (pulled !== "merged") ok = false;
    if (shouldCreditStreak) {
      const credited = await creditDuelWin()
        .then(() => true)
        .catch(() => false);
      if (!credited) ok = false;
    }
    try {
      const state = await getUserState();
      const today = new Date().toISOString().slice(0, 10);
      await enqueue("upsert_user_state", {
        user_id: "",
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        last_study_date: state.lastStudyDate ?? today,
        total_study_days: state.totalStudyDays,
        predicted_score: state.predictedScore ?? null,
        daily_goal_questions: state.dailyGoalQuestions ?? null,
        updated_at: new Date().toISOString(),
      });
      // Credit the cert the challenge was actually played on, not the player's
      // currently selected one — unlike live quick-matches (where DuelArena
      // credits the viewer's own cert because the match cert belongs to the
      // pairer), an async guest deliberately accepted a challenge on the
      // host's cert, so that is where the XP was earned.
      await enqueue("upsert_cert_score", {
        cert_id: match.certId,
        predicted_score: state.predictedScore ?? null,
        xp: state.xp,
      });
    } catch {
      ok = false;
    }
    if (ok) markReconciled(match.id, me.userId);
    return ok;
  } finally {
    inFlight.delete(match.id);
  }
}
