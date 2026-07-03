// GET /api/voice/quota?localDate=YYYY-MM-DD — current remaining voice minutes.
//
// Lets the /voice UI refresh "X of 30 min left today" WITHOUT a full reload,
// especially right after a session ends. Mirrors the mint route's cap math but
// performs NO OpenAI call and creates NO session row — it is read-only.
//
// Auth: Supabase cookie session + allowlist gate (defense in depth).

import { createClient } from "@/lib/supabase/server";
import { isVoiceAllowed } from "@/lib/voice-tutor/access";
import {
  PER_USER_DAILY_LIMIT_SECONDS,
  PER_USER_MONTHLY_LIMIT_SECONDS,
  isPlausibleLocalDate,
} from "@/lib/voice-tutor/caps";
import {
  sumUserDaySeconds,
  sumUserMonthSeconds,
} from "@/lib/voice-tutor/sessions-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: noStore });
}

function wholeMinutesRemaining(remainingSeconds: number): number {
  return Math.max(0, Math.floor(remainingSeconds / 60));
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  if (!isVoiceAllowed(user.email)) {
    return json({ error: "voice_private_beta" }, 403);
  }

  const now = new Date();
  const url = new URL(req.url);
  let localDate = url.searchParams.get("localDate");
  if (!localDate || !isPlausibleLocalDate(localDate, now)) {
    localDate = now.toISOString().slice(0, 10); // server UTC date fallback
  }

  let userDaySeconds = 0;
  let userMonthSeconds = 0;
  try {
    [userDaySeconds, userMonthSeconds] = await Promise.all([
      sumUserDaySeconds(user.id, localDate, now),
      sumUserMonthSeconds(user.id, now),
    ]);
  } catch {
    return json({ error: "quota_read_failed" }, 500);
  }

  return json({
    minutesRemainingToday: wholeMinutesRemaining(
      PER_USER_DAILY_LIMIT_SECONDS - userDaySeconds
    ),
    minutesRemainingThisMonth: wholeMinutesRemaining(
      PER_USER_MONTHLY_LIMIT_SECONDS - userMonthSeconds
    ),
  });
}
