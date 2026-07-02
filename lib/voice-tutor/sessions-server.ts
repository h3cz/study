// Guarded server-side data access for voice_sessions.
//
// SECURITY MODEL (mirrors lib/study-buddy/auth.ts):
//   * The service-role client is created lazily here and NEVER exported.
//   * Every per-user read REQUIRES a userId and ALWAYS applies .eq("user_id", userId).
//     The global-budget read is the ONE intentional cross-user aggregate (it sums
//     duration_seconds for ALL users to enforce the global monthly ceiling) and is
//     clearly named sumGlobalMonthSeconds — it returns only a number, never rows.
//   * duration_seconds is written ONLY from server timestamps (started_at vs
//     ended_at) — never from a client-claimed value.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  dayWindow,
  monthWindow,
  SESSION_HARD_LIMIT_SECONDS,
} from "./caps";

let _admin: SupabaseClient | null = null;
function admin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("voice-tutor: server not configured");
  _admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}

/** A voice_sessions row as needed for cap accounting. */
interface CapRow {
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
}

/**
 * Seconds a single row contributes to a cap sum.
 *   * Ended row  → its server-recorded duration_seconds.
 *   * In-flight  → live elapsed (now - started_at), clamped to the hard limit.
 *
 * COST-SAFETY: counting in-flight rows means a session's time counts against the
 * cap the moment it starts, even if /api/voice/end never fired (tab close,
 * navigate away, beacon failed). Without this, a user who never cleanly ends a
 * session bypasses the daily/monthly caps entirely.
 *
 * Exported for unit testing.
 */
export function rowCapSeconds(
  row: CapRow,
  serverNow: Date = new Date()
): number {
  if (row.ended_at) {
    return Math.max(0, Number(row.duration_seconds) || 0);
  }
  const started = Date.parse(row.started_at);
  if (Number.isNaN(started)) return 0;
  const elapsed = Math.max(
    0,
    Math.round((serverNow.getTime() - started) / 1000)
  );
  return Math.min(elapsed, SESSION_HARD_LIMIT_SECONDS);
}

function sumCapRows(rows: CapRow[], serverNow: Date): number {
  return rows.reduce((s, r) => s + rowCapSeconds(r, serverNow), 0);
}

/**
 * Sum this user's voice seconds for their local calendar day. In-flight sessions
 * (ended_at NULL) contribute their live elapsed time, clamped to the hard limit,
 * so a never-ended session still counts against the cap. See rowCapSeconds.
 */
export async function sumUserDaySeconds(
  userId: string,
  localDate: string,
  serverNow: Date = new Date()
): Promise<number> {
  const { startISO, endISO } = dayWindow(localDate);
  const { data, error } = await admin()
    .from("voice_sessions")
    .select("started_at, ended_at, duration_seconds")
    .eq("user_id", userId)
    .gte("started_at", startISO)
    .lt("started_at", endISO);
  if (error) throw new Error("voice_day_read_failed");
  return sumCapRows((data ?? []) as CapRow[], serverNow);
}

/**
 * Sum this user's voice seconds for the current UTC month. In-flight sessions
 * contribute their live elapsed time (see rowCapSeconds).
 */
export async function sumUserMonthSeconds(
  userId: string,
  serverNow: Date = new Date()
): Promise<number> {
  const { startISO, endISO } = monthWindow(serverNow);
  const { data, error } = await admin()
    .from("voice_sessions")
    .select("started_at, ended_at, duration_seconds")
    .eq("user_id", userId)
    .gte("started_at", startISO)
    .lt("started_at", endISO);
  if (error) throw new Error("voice_month_read_failed");
  return sumCapRows((data ?? []) as CapRow[], serverNow);
}

/**
 * Sum voice seconds across ALL users for the current UTC month — the global
 * budget ceiling. This is the single intentional cross-user aggregate; it returns
 * only the total seconds, never any user's rows. In-flight sessions contribute
 * their live elapsed time (see rowCapSeconds).
 */
export async function sumGlobalMonthSeconds(
  serverNow: Date = new Date()
): Promise<number> {
  const { startISO, endISO } = monthWindow(serverNow);
  const { data, error } = await admin()
    .from("voice_sessions")
    .select("started_at, ended_at, duration_seconds")
    .gte("started_at", startISO)
    .lt("started_at", endISO);
  if (error) throw new Error("voice_global_read_failed");
  return sumCapRows((data ?? []) as CapRow[], serverNow);
}

/** Create a pending session row and return its id + started_at. */
export async function createPendingSession(
  userId: string,
  serverNow: Date = new Date()
): Promise<{ id: string; startedAt: string }> {
  const startedAt = serverNow.toISOString();
  const { data, error } = await admin()
    .from("voice_sessions")
    .insert({ user_id: userId, started_at: startedAt, status: "pending" })
    .select("id, started_at")
    .single();
  if (error || !data) throw new Error("voice_session_create_failed");
  return { id: data.id as string, startedAt: data.started_at as string };
}

export interface VoiceSessionRow {
  id: string;
  user_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number;
  status: string;
}

/** Fetch one session row that belongs to the given user (always user_id filtered). */
export async function getOwnedSession(
  userId: string,
  sessionId: string
): Promise<VoiceSessionRow | null> {
  const { data, error } = await admin()
    .from("voice_sessions")
    .select("id, user_id, started_at, ended_at, duration_seconds, status")
    .eq("user_id", userId)
    .eq("id", sessionId)
    .maybeSingle();
  if (error) throw new Error("voice_session_read_failed");
  return (data as VoiceSessionRow | null) ?? null;
}

/**
 * Mark a session active (called the first time a tool call arrives, so a session
 * that successfully connected is reflected even before it ends).
 */
export async function markSessionActive(
  userId: string,
  sessionId: string
): Promise<void> {
  await admin()
    .from("voice_sessions")
    .update({ status: "active" })
    .eq("user_id", userId)
    .eq("id", sessionId)
    .eq("status", "pending");
}

/**
 * End a session: compute duration from SERVER timestamps (started_at → now),
 * clamped to the hard session limit so a stuck/abused session can never record
 * more than the per-session cap. The client-claimed duration is NEVER trusted.
 */
export async function endSession(
  userId: string,
  sessionId: string,
  status: "completed" | "killed" = "completed",
  serverNow: Date = new Date()
): Promise<{ durationSeconds: number } | null> {
  const row = await getOwnedSession(userId, sessionId);
  if (!row) return null;
  if (row.ended_at) {
    // Idempotent: already ended, return the stored duration.
    return { durationSeconds: row.duration_seconds };
  }

  const started = Date.parse(row.started_at);
  const elapsed = Math.max(
    0,
    Math.round((serverNow.getTime() - started) / 1000)
  );
  // Clamp to the per-session hard limit — server backstop against runaway cost.
  const durationSeconds = Math.min(elapsed, SESSION_HARD_LIMIT_SECONDS);

  const { error } = await admin()
    .from("voice_sessions")
    .update({
      ended_at: serverNow.toISOString(),
      duration_seconds: durationSeconds,
      status,
    })
    .eq("user_id", userId)
    .eq("id", sessionId);
  if (error) throw new Error("voice_session_end_failed");
  return { durationSeconds };
}
