import { createHash } from "node:crypto";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface GuestHeartbeatPayload {
  guestId?: unknown;
  path?: unknown;
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

function cleanPath(value: unknown): string {
  if (typeof value !== "string") return "/";
  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) return "/";
  return trimmed.slice(0, 256);
}

async function isSignedIn(): Promise<boolean> {
  if (!isConfiguredSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return false;
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let payload: GuestHeartbeatPayload;
  try {
    payload = (await request.json()) as GuestHeartbeatPayload;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof payload.guestId !== "string" || !GUEST_ID_RE.test(payload.guestId)) {
    return Response.json({ error: "Invalid guest id" }, { status: 400 });
  }

  if (await isSignedIn()) return noContent();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isConfiguredSupabaseUrl(url) || !key) return noContent();

  const guestKey = createHash("sha256").update(payload.guestId).digest("hex");
  const path = cleanPath(payload.path);
  const admin = createSupabaseAdmin(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    await admin.rpc("record_guest_heartbeat", {
      p_guest_key: guestKey,
      p_path: path,
    });
  } catch {
    // Guest metrics are best-effort and must never break study flows.
  }

  return noContent();
}
