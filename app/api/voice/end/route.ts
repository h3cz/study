// POST /api/voice/end — finalize a voice session.
//
// Writes ended_at + duration_seconds + status to the voice_sessions row. The
// duration is computed from SERVER timestamps (started_at → now), clamped to the
// per-session hard limit. The client-claimed duration is NEVER trusted — the
// client only tells us WHICH session ended and whether it ended early/killed.
//
// Auth: Supabase cookie session; the session must belong to the authed user.

import { createClient } from "@/lib/supabase/server";
import { isVoiceAllowed } from "@/lib/voice-tutor/access";
import { endSession } from "@/lib/voice-tutor/sessions-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store", "Content-Type": "application/json" };
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: noStore });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  // Allowlist gate (defense in depth).
  if (!isVoiceAllowed(user.email)) {
    return json({ error: "voice_private_beta" }, 403);
  }

  let sessionId: string | null = null;
  let killed = false;
  try {
    const body = await req.json();
    if (body && typeof body.sessionId === "string") sessionId = body.sessionId;
    killed = !!(body && body.killed);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  if (!sessionId || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
    return json({ error: "bad_session_id" }, 400);
  }

  try {
    const result = await endSession(
      user.id,
      sessionId,
      killed ? "killed" : "completed"
    );
    if (!result) return json({ error: "session_not_found" }, 404);
    return json({ ended: true, durationSeconds: result.durationSeconds });
  } catch {
    return json({ error: "end_failed" }, 500);
  }
}
