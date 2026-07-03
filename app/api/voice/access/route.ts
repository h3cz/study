// GET /api/voice/access — returns { allowed: boolean } for the authed user.
//
// Used by client components to decide whether to show voice UI.
// The allowlist itself is NEVER sent to the client — only the boolean.

import { createClient } from "@/lib/supabase/server";
import { isVoiceAllowed } from "@/lib/voice-tutor/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "Content-Type": "application/json",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: noStore });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  return json({ allowed: isVoiceAllowed(user.email) });
}
