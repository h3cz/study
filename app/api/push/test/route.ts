// POST /api/push/test
//
// Sends a one-off test push to the AUTHENTICATED user's own devices only.
// Lets a user confirm notifications work without waiting for the daily cron or
// fiddling with reminder times. Session-required; reads only the caller's own
// subscriptions (RLS-scoped). Prunes dead subscriptions on 404/410.

import { createClient } from "@/lib/supabase/server";
import webpush from "web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: noStore });
}

export async function POST(): Promise<Response> {
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) {
    return json({ error: "not_configured" }, 500);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", user.id);
  if (error) return json({ error: "query_failed" }, 500);
  if (!subs || subs.length === 0) {
    return json({ ok: true, sent: 0, note: "no_subscriptions" });
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  const payload = JSON.stringify({
    title: "hecz / study",
    body: "✅ Test notification — your daily reminders are working.",
    url: "/",
  });

  let sent = 0;
  let pruned = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      );
      sent++;
    } catch (err: unknown) {
      const code =
        typeof err === "object" && err !== null && "statusCode" in err
          ? (err as { statusCode?: number }).statusCode
          : undefined;
      if (code === 404 || code === 410) {
        await supabase.from("push_subscriptions").delete().eq("id", s.id);
        pruned++;
      }
    }
  }

  return json({ ok: true, sent, pruned });
}
