// Server-authoritative duel engine.
//
// The lazy service-role client is created here and NEVER exported (mirrors the
// study-buddy / voice security model). All match mutations funnel through these
// helpers so correctness, timing, scoring, and XP are written only by the server.
// User identity is resolved from the cookie session by the calling route; this
// layer never trusts a client-supplied user id.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { rowToMatch, type DuelMatch, type AsyncChallengeView } from "./types";
import { DUEL_DEFAULTS, normalizeDuelSettings, roundPoints } from "./scoring";
import {
  pickDuelQuestionIds,
  correctKeyFor,
  hasEnoughQuestions,
} from "./questions-server";

let _admin: SupabaseClient | null = null;
function admin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("multiplayer: server not configured");
  _admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}

const INVITE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no ambiguous 0/O/1/I
function inviteCode(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => INVITE_CHARS[b % INVITE_CHARS.length])
    .join("");
}

export class DuelError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Create an invite duel (status=waiting). Returns the match + invite code. */
type DuelSettingsInput = {
  numRounds?: unknown;
  roundLimitMs?: unknown;
};

export async function createInviteMatch(
  userId: string,
  certId: string,
  settingsInput: DuelSettingsInput = {}
): Promise<DuelMatch> {
  const settings = normalizeDuelSettings(settingsInput);
  if (!hasEnoughQuestions(certId, settings.numRounds)) {
    throw new DuelError("not_enough_questions", 422);
  }
  const a = admin();
  // Tidy up any of the user's own stale unstarted invites so they don't pile up.
  await a
    .from("duel_matches")
    .delete()
    .eq("host_id", userId)
    .eq("status", "waiting")
    .eq("mode", "invite");

  const questionIds = pickDuelQuestionIds(certId, settings.numRounds);

  // Retry on the (vanishingly rare) invite-code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = inviteCode();
    const { data, error } = await a
      .from("duel_matches")
      .insert({
        cert_id: certId,
        status: "waiting",
        mode: "invite",
        invite_code: code,
        host_id: userId,
        question_ids: questionIds,
        num_rounds: settings.numRounds,
        round_limit_ms: settings.roundLimitMs,
        base_points: DUEL_DEFAULTS.basePoints,
      })
      .select("*")
      .single();
    if (!error && data) return rowToMatch(data);
    if (error && !error.message.includes("duel_matches_invite_idx") && error.code !== "23505") {
      throw new DuelError("create_failed", 500);
    }
  }
  throw new DuelError("create_failed", 500);
}

/** Join a waiting invite match by code. Returns the now-active match. */
export async function joinByCode(userId: string, code: string): Promise<DuelMatch> {
  const a = admin();
  // Route by mode: async challenges claim the guest seat without touching the
  // live round cursor, live invites use the original RPC.
  const { data: probe } = await a
    .from("duel_matches")
    .select("mode")
    .eq("invite_code", code.toUpperCase().trim())
    .maybeSingle();
  const rpc = probe?.mode === "async" ? "mp_async_join" : "mp_join_by_code";
  const { data, error } = await a.rpc(rpc, {
    p_user: userId,
    p_code: code.toUpperCase().trim(),
  });
  if (error) {
    const msg = error.message || "";
    if (msg.includes("match_not_found")) throw new DuelError("invalid_code", 404);
    if (msg.includes("cannot_join_own_match")) throw new DuelError("cannot_join_own_match", 409);
    if (msg.includes("challenge_expired")) throw new DuelError("challenge_expired", 410);
    if (msg.includes("match_unavailable")) throw new DuelError("match_unavailable", 409);
    throw new DuelError("join_failed", 500);
  }
  return rowToMatch(data);
}

/**
 * Quick-match: returns a paired (active) match, or null if the user was enqueued
 * to wait. The caller completing a pair supplies the questions, so the match is
 * played on their cert.
 */
export async function quickMatch(
  userId: string,
  certId: string,
  settingsInput: DuelSettingsInput = {}
): Promise<DuelMatch | null> {
  const settings = normalizeDuelSettings(settingsInput);
  if (!hasEnoughQuestions(certId, settings.numRounds)) {
    throw new DuelError("not_enough_questions", 422);
  }
  const a = admin();
  const questionIds = pickDuelQuestionIds(certId, settings.numRounds);
  const { data: matchId, error } = await a.rpc("mp_quickmatch", {
    p_user: userId,
    p_cert: certId,
    p_question_ids: questionIds,
    p_num_rounds: settings.numRounds,
    p_round_limit_ms: settings.roundLimitMs,
    p_base_points: DUEL_DEFAULTS.basePoints,
  });
  if (error) throw new DuelError("quickmatch_failed", 500);
  if (!matchId) return null; // enqueued — wait for an opponent

  const { data, error: readErr } = await a
    .from("duel_matches")
    .select("*")
    .eq("id", matchId)
    .single();
  if (readErr || !data) throw new DuelError("quickmatch_failed", 500);
  return rowToMatch(data);
}

/** Leave the quick-match queue. */
export async function leaveQueue(userId: string): Promise<void> {
  await admin().from("duel_queue").delete().eq("user_id", userId);
}

/** Fetch a match the user participates in. */
export async function getMatch(userId: string, matchId: string): Promise<DuelMatch> {
  const { data, error } = await admin()
    .from("duel_matches")
    .select("*")
    .eq("id", matchId)
    .single();
  if (error || !data) throw new DuelError("match_not_found", 404);
  if (data.host_id !== userId && data.guest_id !== userId) {
    throw new DuelError("not_participant", 403);
  }
  return rowToMatch(data);
}

/**
 * Submit an answer for the current round. The server computes correctness (from
 * the bundled key) and points (from server-measured elapsed time), then records
 * + advances atomically. Returns the resulting match truth.
 */
export async function submitAnswer(
  userId: string,
  matchId: string,
  round: number,
  picked: string
): Promise<DuelMatch> {
  const a = admin();
  const { data: row, error } = await a
    .from("duel_matches")
    .select("*")
    .eq("id", matchId)
    .single();
  if (error || !row) throw new DuelError("match_not_found", 404);
  const match = rowToMatch(row);
  if (match.mode === "async") throw new DuelError("not_async", 400);
  if (match.hostId !== userId && match.guestId !== userId) {
    throw new DuelError("not_participant", 403);
  }
  if (match.status !== "active") throw new DuelError("match_not_active", 409);
  if (round !== match.currentRound) {
    // Out of turn — return current truth without erroring so the client re-syncs.
    return match;
  }

  const questionId = match.questionIds[round] ?? "";
  const correctKey = correctKeyFor(match.certId, questionId);
  const isCorrect = correctKey != null && picked === correctKey;

  // Server-measured elapsed time (ignore any client-supplied timing).
  const startedAt = match.roundStartedAt ? new Date(match.roundStartedAt).getTime() : Date.now();
  const msElapsed = Math.max(0, Date.now() - startedAt);
  const points = roundPoints(isCorrect, msElapsed, match.roundLimitMs, match.basePoints);

  const { data: updated, error: rpcErr } = await a.rpc("mp_submit_answer", {
    p_match: matchId,
    p_user: userId,
    p_round: round,
    p_question: questionId,
    p_picked: picked,
    p_correct: isCorrect,
    p_points: points,
    p_ms: msElapsed,
  });
  if (rpcErr || !updated) throw new DuelError("submit_failed", 500);
  return rowToMatch(updated);
}

/** Mark the caller ready for the next round; advances only when both players agree. */
export async function readyNextRound(
  userId: string,
  matchId: string,
  round: number
): Promise<DuelMatch> {
  const a = admin();
  const { data: row, error } = await a
    .from("duel_matches")
    .select("host_id, guest_id, mode")
    .eq("id", matchId)
    .single();
  if (error || !row) throw new DuelError("match_not_found", 404);
  if (row.mode === "async") throw new DuelError("not_async", 400);
  if (row.host_id !== userId && row.guest_id !== userId) {
    throw new DuelError("not_participant", 403);
  }
  const { data: updated, error: rpcErr } = await a.rpc("mp_ready_next", {
    p_match: matchId,
    p_user: userId,
    p_round: round,
  });
  if (rpcErr || !updated) throw new DuelError("ready_failed", 500);
  return rowToMatch(updated);
}

/**
 * Rematch: start a fresh active match against the same opponent, same cert, with a
 * new server-chosen question set. Idempotent (the RPC returns the existing rematch
 * if both players clicked it). Both clients discover the new match via a Realtime
 * INSERT on duel_matches filtered by rematch_of (RLS exposes it to both players).
 */
export async function rematch(userId: string, matchId: string): Promise<DuelMatch> {
  const a = admin();
  const { data: row, error } = await a
    .from("duel_matches")
    .select("cert_id, host_id, guest_id, status, mode")
    .eq("id", matchId)
    .single();
  if (error || !row) throw new DuelError("match_not_found", 404);
  if (row.mode === "async") throw new DuelError("not_async", 400);
  if (row.host_id !== userId && row.guest_id !== userId) {
    throw new DuelError("not_participant", 403);
  }
  const certId = row.cert_id as string;
  if (!hasEnoughQuestions(certId, DUEL_DEFAULTS.numRounds)) {
    throw new DuelError("not_enough_questions", 422);
  }
  const questionIds = pickDuelQuestionIds(certId, DUEL_DEFAULTS.numRounds);
  const { data: newId, error: rpcErr } = await a.rpc("mp_rematch", {
    p_match: matchId,
    p_user: userId,
    p_question_ids: questionIds,
    p_num_rounds: DUEL_DEFAULTS.numRounds,
    p_round_limit_ms: DUEL_DEFAULTS.roundLimitMs,
    p_base_points: DUEL_DEFAULTS.basePoints,
  });
  if (rpcErr || !newId) {
    const msg = rpcErr?.message || "";
    if (msg.includes("match_unavailable")) throw new DuelError("match_unavailable", 409);
    if (msg.includes("not_participant")) throw new DuelError("not_participant", 403);
    if (msg.includes("match_not_found")) throw new DuelError("match_not_found", 404);
    throw new DuelError("rematch_failed", 500);
  }
  const { data, error: readErr } = await a
    .from("duel_matches")
    .select("*")
    .eq("id", newId)
    .single();
  if (readErr || !data) throw new DuelError("rematch_failed", 500);
  return rowToMatch(data);
}

/** Advance the match if its round deadline has passed (called on client timeout). */
export async function advanceMatch(userId: string, matchId: string): Promise<DuelMatch> {
  const a = admin();
  const { data: row, error } = await a
    .from("duel_matches")
    .select("host_id, guest_id, mode")
    .eq("id", matchId)
    .single();
  if (error || !row) throw new DuelError("match_not_found", 404);
  if (row.mode === "async") throw new DuelError("not_async", 400);
  if (row.host_id !== userId && row.guest_id !== userId) {
    throw new DuelError("not_participant", 403);
  }
  const { data: updated, error: rpcErr } = await a.rpc("mp_advance", { p_match: matchId });
  if (rpcErr || !updated) throw new DuelError("advance_failed", 500);
  return rowToMatch(updated);
}

// ─── Async duels ─────────────────────────────────────────────────────────────
//
// A challenge the opponent plays whenever they like. Host creates + plays
// immediately; the opponent joins by code (or is pre-seated by a rematch) and
// plays later. Correct answers score the full base points — no speed decay,
// because cross-day reaction times are not comparable. XP matches live duels
// and is awarded exactly once, inside the SQL finalizer.

/** How long an unfinished async challenge stays joinable/playable. */
export const ASYNC_CHALLENGE_TTL_DAYS = 14;

/** Create an async challenge. The host plays immediately; the code is shared. */
export async function createAsyncChallenge(
  userId: string,
  certId: string,
  settingsInput: DuelSettingsInput = {}
): Promise<DuelMatch> {
  const settings = normalizeDuelSettings(settingsInput);
  if (!hasEnoughQuestions(certId, settings.numRounds)) {
    throw new DuelError("not_enough_questions", 422);
  }
  const a = admin();
  // Lazy expiry: abandon own unfinished challenges past the TTL so lists stay honest.
  await a
    .from("duel_matches")
    .update({ status: "abandoned" })
    .eq("host_id", userId)
    .eq("mode", "async")
    .in("status", ["waiting", "active"])
    .lt("created_at", new Date(Date.now() - ASYNC_CHALLENGE_TTL_DAYS * 86_400_000).toISOString());

  const questionIds = pickDuelQuestionIds(certId, settings.numRounds);
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = inviteCode();
    const { data, error } = await a
      .from("duel_matches")
      .insert({
        cert_id: certId,
        status: "waiting",
        mode: "async",
        invite_code: code,
        host_id: userId,
        question_ids: questionIds,
        num_rounds: settings.numRounds,
        round_limit_ms: settings.roundLimitMs,
        base_points: DUEL_DEFAULTS.basePoints,
      })
      .select("*")
      .single();
    if (!error && data) return rowToMatch(data);
    if (error && !error.message.includes("duel_matches_invite_idx") && error.code !== "23505") {
      throw new DuelError("create_failed", 500);
    }
  }
  throw new DuelError("create_failed", 500);
}

/** How many rounds a player has answered in an async match so far. */
function asyncProgress(m: DuelMatch, userId: string): number {
  return (m.hostId === userId ? m.hostReadyRound : m.guestReadyRound) + 1;
}

/** Submit one async answer. Server computes correctness; points are flat. */
export async function submitAsyncAnswer(
  userId: string,
  matchId: string,
  round: number,
  picked: string
): Promise<DuelMatch> {
  const a = admin();
  const { data: row, error } = await a
    .from("duel_matches")
    .select("*")
    .eq("id", matchId)
    .single();
  if (error || !row) throw new DuelError("match_not_found", 404);
  const match = rowToMatch(row);
  if (match.mode !== "async") throw new DuelError("not_async", 400);
  if (match.hostId !== userId && match.guestId !== userId) {
    throw new DuelError("not_participant", 403);
  }
  if (match.status !== "waiting" && match.status !== "active") {
    throw new DuelError("match_not_active", 409);
  }
  if (round !== asyncProgress(match, userId)) {
    // Out of turn — return current truth so the client re-syncs.
    return match;
  }

  const questionId = match.questionIds[round] ?? "";
  const correctKey = correctKeyFor(match.certId, questionId);
  const isCorrect = correctKey != null && picked === correctKey;
  const points = isCorrect ? match.basePoints : 0;

  const { data: updated, error: rpcErr } = await a.rpc("mp_async_answer", {
    p_match: matchId,
    p_user: userId,
    p_round: round,
    p_question: questionId,
    p_picked: picked,
    p_correct: isCorrect,
    p_points: points,
    p_ms: 0,
  });
  if (rpcErr || !updated) throw new DuelError("submit_failed", 500);
  return rowToMatch(updated);
}

/**
 * List the caller's async challenges (most recent first), lazily expiring
 * stale ones. Server-side only: service-role reads bypass RLS by design and
 * the route filters strictly to the caller's rows.
 */
export async function listAsyncChallenges(userId: string): Promise<AsyncChallengeView[]> {
  const a = admin();
  await a
    .from("duel_matches")
    .update({ status: "abandoned" })
    .eq("mode", "async")
    .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
    .in("status", ["waiting", "active"])
    .lt("created_at", new Date(Date.now() - ASYNC_CHALLENGE_TTL_DAYS * 86_400_000).toISOString());

  const { data, error } = await a
    .from("duel_matches")
    .select("*")
    .eq("mode", "async")
    .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(25);
  if (error || !data) return [];

  const otherIds = [
    ...new Set(
      data.map((r) => (r.host_id === userId ? r.guest_id : r.host_id)).filter(Boolean)
    ),
  ];
  const names = new Map<string, string>();
  if (otherIds.length > 0) {
    const { data: profs } = await a
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", otherIds);
    for (const p of profs ?? []) {
      if (p.display_name) names.set(p.user_id, p.display_name);
    }
  }

  return data.map((r) => {
    const match = rowToMatch(r);
    const otherId = match.hostId === userId ? match.guestId : match.hostId;
    return {
      match,
      hostName: match.hostId === userId ? null : names.get(match.hostId) ?? null,
      guestName: match.guestId === userId ? null : otherId ? names.get(otherId) ?? null : null,
    };
  });
}

/** Host cancels an open challenge before anyone claims the guest seat. */
export async function cancelAsyncChallenge(userId: string, matchId: string): Promise<void> {
  const a = admin();
  // Conditional update: the WHERE predicates make the cancel atomic against a
  // concurrent mp_async_join claiming the guest seat. Zero rows affected means
  // the seat was claimed (or the match isn't the caller's open challenge).
  const { data, error } = await a
    .from("duel_matches")
    .update({ status: "abandoned" })
    .eq("id", matchId)
    .eq("host_id", userId)
    .eq("status", "waiting")
    .is("guest_id", null)
    .select("id");
  if (error) throw new DuelError("cancel_failed", 500);
  if (!data || data.length === 0) {
    // Distinguish "not yours / not found" from "too late" for the human error.
    const { data: row } = await a
      .from("duel_matches")
      .select("host_id, status, guest_id")
      .eq("id", matchId)
      .single();
    if (!row || row.host_id !== userId) throw new DuelError("match_not_found", 404);
    throw new DuelError("cancel_too_late", 409);
  }
}

/** Rematch an async duel: fresh set, opponent pre-seated, caller plays first. */
export async function rematchAsync(userId: string, matchId: string): Promise<DuelMatch> {
  const a = admin();
  const { data: row, error } = await a
    .from("duel_matches")
    .select("cert_id, host_id, guest_id, num_rounds, status, mode")
    .eq("id", matchId)
    .single();
  if (error || !row) throw new DuelError("match_not_found", 404);
  if (row.host_id !== userId && row.guest_id !== userId) {
    throw new DuelError("not_participant", 403);
  }
  if (row.mode !== "async" || row.status !== "done") {
    throw new DuelError("rematch_failed", 409);
  }
  const numRounds = row.num_rounds ?? DUEL_DEFAULTS.numRounds;
  if (!hasEnoughQuestions(row.cert_id, numRounds)) {
    throw new DuelError("not_enough_questions", 422);
  }
  const questionIds = pickDuelQuestionIds(row.cert_id, numRounds);
  const { data: newId, error: rpcErr } = await a.rpc("mp_async_rematch", {
    p_match: matchId,
    p_user: userId,
    p_question_ids: questionIds,
    p_num_rounds: numRounds,
  });
  if (rpcErr || !newId) throw new DuelError("rematch_failed", 500);
  const { data, error: readErr } = await a
    .from("duel_matches")
    .select("*")
    .eq("id", newId)
    .single();
  if (readErr || !data) throw new DuelError("rematch_failed", 500);
  return rowToMatch(data);
}
