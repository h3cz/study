import { createHash } from "node:crypto";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface GuestClaimPayload {
  guestId?: unknown;
}

const GUEST_ID_RE = /^[a-zA-Z0-9._:-]{16,96}$/;

function noContent(): Response {
  return new Response(null, { status: 204 });
}

function isConfiguredSupabaseUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    return new URL(value).hostname !== "placeholder.supabase.co";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let payload: GuestClaimPayload;
  try {
    payload = (await request.json()) as GuestClaimPayload;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof payload.guestId !== "string" || !GUEST_ID_RE.test(payload.guestId)) {
    return Response.json({ error: "Invalid guest id" }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isConfiguredSupabaseUrl(url) || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !serviceKey) {
    return noContent();
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const guestKey = createHash("sha256").update(payload.guestId).digest("hex");
  const admin = createSupabaseAdmin(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    await admin.rpc("claim_guest_device", {
      p_guest_key: guestKey,
      p_user_id: data.user.id,
    });
  } catch {
    // Guest attribution is best-effort and must never block a signed-in session.
  }

  return noContent();
}
