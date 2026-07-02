// Cookie-authenticated key management for the Settings UI (NOT PAT-authenticated).
// Mint / list / revoke study-buddy keys for the signed-in user. Writes go through
// the user's own RLS-locked session — no service role here.

import { createClient } from "@/lib/supabase/server";
import { generateRawToken, hashToken } from "@/lib/study-buddy/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_KEYS_PER_USER = 3; // throwaway-token-farm guard (security review #3)

const noStore = { "Cache-Control": "no-store", "Content-Type": "application/json" };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: noStore });
}

// List the user's active keys (metadata only — never the raw token, which is
// not stored).
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  const { data, error } = await supabase
    .from("study_buddy_keys")
    .select("id, name, prefix, created_at, last_used_at")
    .is("revoked_at", null)
    .order("created_at", { ascending: false });
  if (error) return json({ error: "list_failed" }, 500);
  return json({ keys: data ?? [] });
}

// Mint a new key. The raw token is returned EXACTLY ONCE in this response and
// never again — only its SHA-256 hash is persisted.
export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  // Enforce per-user key cap.
  const { count } = await supabase
    .from("study_buddy_keys")
    .select("id", { count: "exact", head: true })
    .is("revoked_at", null);
  if ((count ?? 0) >= MAX_KEYS_PER_USER) {
    return json({ error: "key_limit_reached", max: MAX_KEYS_PER_USER }, 409);
  }

  let name = "AI Study Buddy";
  try {
    const body = await req.json();
    if (body && typeof body.name === "string" && body.name.trim()) {
      name = body.name.trim().slice(0, 60);
    }
  } catch {
    // no body — use default name
  }

  const raw = generateRawToken();
  const token_hash = await hashToken(raw);
  const prefix = raw.slice(0, 12); // "sq_live_xxxx" for display

  const { data, error } = await supabase
    .from("study_buddy_keys")
    .insert({ user_id: user.id, token_hash, name, prefix })
    .select("id, name, prefix, created_at")
    .single();
  if (error) return json({ error: "mint_failed" }, 500);

  // token is returned ONCE here and never stored in raw form.
  return json({ key: data, token: raw }, 201);
}

// Revoke a key by id (soft-delete via revoked_at).
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return json({ error: "bad_id" }, 400);
  }

  // RLS ensures the user can only update their own row; we also filter by id.
  const { error } = await supabase
    .from("study_buddy_keys")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id)
    .is("revoked_at", null);
  if (error) return json({ error: "revoke_failed" }, 500);
  return json({ revoked: true });
}
