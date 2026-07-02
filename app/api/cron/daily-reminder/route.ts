// GET /api/cron/daily-reminder
//
// The reminder SENDER. Invoked by a scheduled cron (Vercel Cron) once per hour.
// For every user whose local clock now matches their chosen reminder hour and
// who hasn't studied today, it sends a Web Push notification to all of their
// registered subscriptions.
//
// SECURITY:
//   - Requires `Authorization: Bearer <CRON_SECRET>`. No user session involved.
//     The secret is compared with a constant-time-ish check.
//   - Uses a service-role Supabase client (reads ALL users, bypassing RLS) that
//     is created locally and never exported.
//   - Never logs subscription keys, endpoints, secrets, or any PII.

import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { timingSafeEqual } from "crypto";
import { reminderDecision } from "@/lib/reminder-decision";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: noStore });
}

/** Constant-time string comparison via Node's crypto.timingSafeEqual. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface UserStateRow {
  user_id: string;
  streak: number | null;
  last_study_date: string | null;
  predicted_score: number | null;
}

export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return json({ error: "not_configured" }, 500);

  const header = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  const provided = match ? match[1].trim() : "";
  if (!provided || !safeEqual(provided, cronSecret)) {
    return json({ error: "unauthorized" }, 401);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT;
  if (
    !url ||
    !serviceKey ||
    !vapidPublic ||
    !vapidPrivate ||
    !vapidSubject
  ) {
    return json({ error: "not_configured" }, 500);
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Only users who have opted in (reminder_hour not null).
  const { data: profiles, error: profilesErr } = await admin
    .from("profiles")
    .select("user_id, reminder_hour, reminder_tz")
    .not("reminder_hour", "is", null);

  if (profilesErr) return json({ error: "query_failed" }, 500);

  const now = new Date();
  let checked = 0;
  let sent = 0;
  let pruned = 0;

  for (const profile of profiles ?? []) {
    checked++;

    const reminderHour = profile.reminder_hour as number | null;
    const reminderTz = (profile.reminder_tz as string | null) ?? "UTC";
    if (reminderHour == null) continue;

    // Fetch this user's state to compute the decision.
    const { data: stateRow } = await admin
      .from("user_state")
      .select("user_id, streak, last_study_date, predicted_score")
      .eq("user_id", profile.user_id)
      .maybeSingle();
    const state = (stateRow as UserStateRow | null) ?? null;

    const decision = reminderDecision({
      reminderHour,
      reminderTz,
      lastStudyDate: state?.last_study_date ?? null,
      streak: state?.streak ?? 0,
      predictedScore: state?.predicted_score ?? null,
      now,
    });

    if (!decision.send) continue;

    // Fetch all push subscriptions for this user.
    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", profile.user_id);

    const payload = JSON.stringify({
      title: decision.title,
      body: decision.body,
      url: "/",
    });

    for (const sub of (subs as SubscriptionRow[] | null) ?? []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        sent++;
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Dead subscription — prune it.
          await admin.from("push_subscriptions").delete().eq("id", sub.id);
          pruned++;
        }
        // Other errors are swallowed so one bad subscription doesn't abort the run.
        // Intentionally not logged (would expose endpoints).
      }
    }
  }

  return json({ checked, sent, pruned });
}
