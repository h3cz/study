// POST /api/voice/session — mint a short-lived OpenAI Realtime ephemeral token.
//
// THIS ROUTE IS THE GATE. All five spend caps are enforced HERE, server-side,
// BEFORE any OpenAI call is made (see docs/voice-caps.md). The real OPENAI_API_KEY
// is used only on the server to mint a ~60s ephemeral client secret; it is NEVER
// returned to the browser.
//
// Auth: Supabase cookie session (reuse lib/supabase/server.ts).
// Cap math: pure functions in lib/voice-tutor/caps.ts; durations summed from
//           server-written voice_sessions rows via lib/voice-tutor/sessions-server.ts.

import { createClient } from "@/lib/supabase/server";
import {
  evaluateMintCaps,
  isPlausibleLocalDate,
} from "@/lib/voice-tutor/caps";
import { isVoiceAllowed } from "@/lib/voice-tutor/access";
import {
  sumUserDaySeconds,
  sumUserMonthSeconds,
  sumGlobalMonthSeconds,
  createPendingSession,
} from "@/lib/voice-tutor/sessions-server";
import {
  buildClientSecretBody,
  isVoiceTurnMode,
  DEFAULT_TURN_MODE,
  CLIENT_SECRETS_URL,
  REALTIME_MODEL,
  REALTIME_VOICE,
  type VoiceTurnMode,
} from "@/lib/voice-tutor/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200, extra?: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...noStore, ...(extra ?? {}) },
  });
}

export async function POST(req: Request) {
  // 1. Authenticate the user via the Supabase cookie session.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  // 1b. Allowlist gate — MUST run before any OpenAI call (cost protection).
  if (!isVoiceAllowed(user.email)) {
    return json({ error: "voice_private_beta" }, 403);
  }

  const userId = user.id;

  // 2. Resolve the client's local date (for the daily window), validate ±1 day.
  let localDate: string | null = null;
  let turnMode: VoiceTurnMode = DEFAULT_TURN_MODE;
  try {
    const body = await req.json();
    if (body && typeof body.localDate === "string") localDate = body.localDate;
    if (body && isVoiceTurnMode(body.turnMode)) turnMode = body.turnMode;
  } catch {
    // no body — fall back to server UTC date + default turn mode
  }
  const now = new Date();
  if (!localDate || !isPlausibleLocalDate(localDate, now)) {
    localDate = now.toISOString().slice(0, 10); // server UTC date fallback
  }

  // 3. Gather the cap inputs (all server-authoritative).
  const enabled = process.env.VOICE_TUTOR_ENABLED === "true";
  const globalMonthlyBudgetMinutes = parseInt(
    process.env.VOICE_TUTOR_MONTHLY_BUDGET_MINUTES ?? "0",
    10
  );

  let userDaySeconds = 0;
  let userMonthSeconds = 0;
  let globalMonthSeconds = 0;
  try {
    // If the service is disabled we still short-circuit below without DB reads,
    // but reading here keeps the verdict fully populated when enabled.
    if (enabled) {
      [userDaySeconds, userMonthSeconds, globalMonthSeconds] = await Promise.all([
        sumUserDaySeconds(userId, localDate),
        sumUserMonthSeconds(userId, now),
        sumGlobalMonthSeconds(now),
      ]);
    }
  } catch {
    return json({ error: "cap_check_failed" }, 500);
  }

  // 4. Enforce the caps BEFORE minting.
  const verdict = evaluateMintCaps({
    enabled,
    globalMonthlyBudgetMinutes: Number.isFinite(globalMonthlyBudgetMinutes)
      ? globalMonthlyBudgetMinutes
      : 0,
    globalMonthSeconds,
    userDaySeconds,
    userMonthSeconds,
    serverNow: now,
  });

  if (!verdict.allowed) {
    const extra: Record<string, string> = {};
    if (verdict.resetInSeconds) extra["Retry-After"] = String(verdict.resetInSeconds);
    return json(
      { error: verdict.code, resetInSeconds: verdict.resetInSeconds },
      verdict.status,
      extra
    );
  }

  // 5. Create the pending session row (the unit of cap accounting).
  let sessionId: string;
  try {
    const created = await createPendingSession(userId, now);
    sessionId = created.id;
  } catch {
    return json({ error: "session_create_failed" }, 500);
  }

  // 6. Mint the ephemeral client secret with OpenAI. The real key stays here.
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: "voice_not_configured" }, 503);

  let clientSecret: string;
  try {
    const resp = await fetch(CLIENT_SECRETS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildClientSecretBody(turnMode)),
    });
    if (!resp.ok) {
      // Do NOT echo the OpenAI error verbatim (could contain key hints); log id only.
      console.warn("voice/session: mint failed", resp.status, "session", sessionId);
      return json({ error: "mint_failed" }, 502);
    }
    const data = (await resp.json()) as { value?: string };
    if (!data.value) return json({ error: "mint_no_secret" }, 502);
    clientSecret = data.value;
  } catch {
    return json({ error: "mint_request_failed" }, 502);
  }

  // 7. Return ONLY the ephemeral secret + session metadata. Never the real key.
  return json({
    clientSecret,
    sessionId,
    model: REALTIME_MODEL,
    voice: REALTIME_VOICE,
    minutesRemainingToday: verdict.minutesRemainingToday,
    minutesRemainingThisMonth: verdict.minutesRemainingThisMonth,
  });
}
