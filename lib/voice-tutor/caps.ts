// Pure, side-effect-free cap math for the Realtime Voice Tutor.
//
// THE FIVE SERVER-ENFORCED SPEND CAPS (see docs/voice-caps.md):
//   1. Per-session 15-min hard disconnect (client) + 16-min tool-call backstop (server).
//   2. Per-user daily 30 min.
//   3. Per-user monthly 60 min.
//   4. Server-side only — durations come from server timestamps on voice_sessions,
//      never client-claimed; checked at mint AND at every tool call.
//   5. Global kill-switch (VOICE_TUTOR_ENABLED) + global monthly budget
//      (VOICE_TUTOR_MONTHLY_BUDGET_MINUTES).
//
// This module holds ONLY the math + threshold constants so the cap logic is unit
// testable with no network/DB. The route layer (session/route.ts, tools/route.ts)
// supplies the summed durations and acts on the verdicts returned here.

// ---------- thresholds (seconds) ----------

export const SESSION_HARD_LIMIT_SECONDS = 15 * 60; // client closes the peer connection at 15:00
export const SESSION_WARN_SECONDS = 14 * 60; // tutor warns at 14:00
export const SESSION_SERVER_BACKSTOP_SECONDS = 16 * 60; // server rejects tool calls past 16:00
export const PER_USER_DAILY_LIMIT_SECONDS = 30 * 60; // 30 min/day
export const PER_USER_MONTHLY_LIMIT_SECONDS = 60 * 60; // 60 min/month

// ---------- date-window helpers ----------
// Daily windows are anchored on the client's LOCAL date (validated ±1 day against
// the server clock so a user cannot spoof "yesterday" to reset their quota).
// Monthly windows are anchored on the server's UTC month.

/** Validate a client-supplied YYYY-MM-DD local date is within ±1 day of the server. */
export function isPlausibleLocalDate(
  localDate: string,
  serverNow: Date = new Date()
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) return false;
  const claimed = Date.parse(`${localDate}T00:00:00Z`);
  if (Number.isNaN(claimed)) return false;
  const serverMidnightUtc = Date.UTC(
    serverNow.getUTCFullYear(),
    serverNow.getUTCMonth(),
    serverNow.getUTCDate()
  );
  const diffDays = Math.abs(claimed - serverMidnightUtc) / (1000 * 60 * 60 * 24);
  return diffDays <= 1;
}

/** [startISO, endISO) covering the client's local calendar day, in UTC terms. */
export function dayWindow(localDate: string): { startISO: string; endISO: string } {
  const start = new Date(`${localDate}T00:00:00Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

/** [startISO, endISO) covering the current UTC calendar month. */
export function monthWindow(serverNow: Date = new Date()): {
  startISO: string;
  endISO: string;
} {
  const start = new Date(
    Date.UTC(serverNow.getUTCFullYear(), serverNow.getUTCMonth(), 1)
  );
  const end = new Date(
    Date.UTC(serverNow.getUTCFullYear(), serverNow.getUTCMonth() + 1, 1)
  );
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

// ---------- cap verdicts ----------

export type CapDenialCode =
  | "service_disabled"
  | "service_capacity_reached"
  | "daily_limit_reached"
  | "monthly_limit_reached";

export interface CapDenial {
  allowed: false;
  status: 503 | 429;
  code: CapDenialCode;
  /** seconds until the relevant window resets, when meaningful */
  resetInSeconds?: number;
}

export interface CapAllow {
  allowed: true;
  minutesRemainingToday: number;
  minutesRemainingThisMonth: number;
}

export type CapVerdict = CapDenial | CapAllow;

export interface CapInputs {
  /** process.env.VOICE_TUTOR_ENABLED === "true" */
  enabled: boolean;
  /** VOICE_TUTOR_MONTHLY_BUDGET_MINUTES (global ceiling across all users) */
  globalMonthlyBudgetMinutes: number;
  /** sum of duration_seconds across ALL users for the current UTC month */
  globalMonthSeconds: number;
  /** sum of this user's duration_seconds for the client's local day */
  userDaySeconds: number;
  /** sum of this user's duration_seconds for the current UTC month */
  userMonthSeconds: number;
  serverNow?: Date;
}

/**
 * Evaluate the mint-time caps in priority order (kill-switch → global budget →
 * daily → monthly). Returns the first denial, or an allow with remaining minutes.
 *
 * Boundary rule: caps trigger at >= the limit (a user who has used exactly the
 * limit is blocked). This matches the spec's "if >= cap → reject".
 */
export function evaluateMintCaps(input: CapInputs): CapVerdict {
  const now = input.serverNow ?? new Date();

  // Cap 5a — global kill-switch.
  if (!input.enabled) {
    return { allowed: false, status: 503, code: "service_disabled" };
  }

  // Cap 5b — global monthly budget across all users.
  const globalBudgetSeconds = Math.max(0, input.globalMonthlyBudgetMinutes) * 60;
  if (globalBudgetSeconds > 0 && input.globalMonthSeconds >= globalBudgetSeconds) {
    return {
      allowed: false,
      status: 503,
      code: "service_capacity_reached",
      resetInSeconds: secondsUntilMonthReset(now),
    };
  }

  // Cap 2 — per-user daily.
  if (input.userDaySeconds >= PER_USER_DAILY_LIMIT_SECONDS) {
    return {
      allowed: false,
      status: 429,
      code: "daily_limit_reached",
      resetInSeconds: secondsUntilLocalDayReset(now),
    };
  }

  // Cap 3 — per-user monthly.
  if (input.userMonthSeconds >= PER_USER_MONTHLY_LIMIT_SECONDS) {
    return {
      allowed: false,
      status: 429,
      code: "monthly_limit_reached",
      resetInSeconds: secondsUntilMonthReset(now),
    };
  }

  return {
    allowed: true,
    minutesRemainingToday: secondsToWholeMinutesRemaining(
      PER_USER_DAILY_LIMIT_SECONDS - input.userDaySeconds
    ),
    minutesRemainingThisMonth: secondsToWholeMinutesRemaining(
      PER_USER_MONTHLY_LIMIT_SECONDS - input.userMonthSeconds
    ),
  };
}

/**
 * Per-session server backstop (cap 1, server half). Given when a session row
 * started, decide whether a tool call should be honoured. Tool calls past the
 * 16-min backstop are rejected even if the client timer failed to disconnect.
 */
export function isSessionWithinBackstop(
  startedAtISO: string,
  serverNow: Date = new Date()
): boolean {
  const started = Date.parse(startedAtISO);
  if (Number.isNaN(started)) return false;
  const elapsedSeconds = (serverNow.getTime() - started) / 1000;
  return elapsedSeconds <= SESSION_SERVER_BACKSTOP_SECONDS;
}

// ---------- small helpers ----------

function secondsToWholeMinutesRemaining(remainingSeconds: number): number {
  return Math.max(0, Math.floor(remainingSeconds / 60));
}

function secondsUntilMonthReset(now: Date): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  return Math.max(1, Math.floor((next - now.getTime()) / 1000));
}

function secondsUntilLocalDayReset(now: Date): number {
  // Approximate with UTC midnight; client shows its own reset hint.
  const next = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  );
  return Math.max(1, Math.floor((next - now.getTime()) / 1000));
}
