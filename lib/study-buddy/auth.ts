// Study Buddy PAT auth + data-access core.
//
// SECURITY MODEL (addresses security review #2, #5, #6):
//   * The service-role Supabase client is created lazily HERE and is NEVER
//     exported. It is used for EXACTLY three privileged operations:
//       1. resolve a PAT by its SHA-256 hash (the study_buddy_keys table is
//          RLS-locked to auth.uid(), so a header-only PAT request cannot read it
//          via the anon client).
//       2. call the bump_study_buddy_usage RPC (atomic per-key rate counter).
//       3. touch last_used_at.
//   * It is NEVER handed to route code and NEVER used for user-data reads.
//   * All user-data reads go through readUserData() helpers below, each of which
//     REQUIRES a userId and ALWAYS applies .eq("user_id", userId). Route code
//     cannot construct an unfiltered query because it never sees a raw client.
//   * The raw PAT is never logged, never echoed, never put in an error message.
//     Errors reference key_id (a uuid) only.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const RAW_PREFIX = "sq_live_";
const TOKEN_BYTES = 16; // 128 bits
export const DAILY_REQUEST_CAP = 200; // per-key, per UTC day (security review #3 Layer 2)

let _admin: SupabaseClient | null = null;
function admin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("study-buddy: server not configured");
  }
  _admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}

// ---------- token helpers ----------

/** Generate a new raw PAT. Returned ONCE to the user; only the hash is stored. */
export function generateRawToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${RAW_PREFIX}${hex}`;
}

/** SHA-256 hex of a raw token. */
export async function hashToken(raw: string): Promise<string> {
  const data = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function looksLikeToken(raw: string): boolean {
  return /^sq_live_[0-9a-f]{32}$/.test(raw);
}

// ---------- request auth ----------

export interface AuthOk {
  ok: true;
  userId: string;
  keyId: string;
}
export interface AuthErr {
  ok: false;
  status: number;
  error: string;
  retryAfter?: number;
}
export type AuthResult = AuthOk | AuthErr;

function extractBearer(req: Request): string | null {
  const h = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1].trim() : null;
}

/**
 * Authenticate a PAT request and enforce the per-key daily rate cap.
 * Returns the resolved userId + keyId on success, never the token.
 */
export async function authenticate(req: Request): Promise<AuthResult> {
  const raw = extractBearer(req);
  if (!raw || !looksLikeToken(raw)) {
    return { ok: false, status: 401, error: "missing_or_malformed_token" };
  }

  let hash: string;
  try {
    hash = await hashToken(raw);
  } catch {
    return { ok: false, status: 500, error: "hash_failed" };
  }

  const a = admin();
  const { data: row, error } = await a
    .from("study_buddy_keys")
    .select("id, user_id, revoked_at")
    .eq("token_hash", hash)
    .is("revoked_at", null)
    .maybeSingle();

  if (error) {
    return { ok: false, status: 500, error: "auth_lookup_failed" };
  }
  if (!row) {
    return { ok: false, status: 401, error: "invalid_token" };
  }

  // Atomic per-key daily counter via SECURITY DEFINER RPC.
  const { data: count, error: rpcErr } = await a.rpc("bump_study_buddy_usage", {
    p_key_id: row.id,
  });
  if (rpcErr) {
    return { ok: false, status: 500, error: "rate_counter_failed" };
  }
  if (typeof count === "number" && count > DAILY_REQUEST_CAP) {
    return {
      ok: false,
      status: 429,
      error: "daily_rate_limit_exceeded",
      retryAfter: secondsUntilUtcMidnight(),
    };
  }

  // Record last-used. Must be awaited: supabase-js query builders are lazy
  // thenables, so a bare `void a.rpc(...)` never actually sends the request — and
  // in a serverless runtime a dangling promise can be killed before it runs. It's
  // one fast UPDATE; keep it non-fatal so a touch failure never blocks a valid call.
  try {
    await a.rpc("touch_study_buddy_key", { p_key_id: row.id });
  } catch {
    // best-effort; last_used_at is non-critical
  }

  return { ok: true, userId: row.user_id, keyId: row.id };
}

function secondsUntilUtcMidnight(): number {
  const now = new Date();
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  );
  return Math.max(1, Math.floor((next.getTime() - now.getTime()) / 1000));
}

// ---------- guarded user-data reads ----------
// Every function REQUIRES userId and ALWAYS filters by it. The admin client is
// never returned to callers. RLS remains the table-level backstop; this layer is
// the application-level guarantee that no query is ever unfiltered.

const COMPLETED_SESSION_FIELDS = "completed_at, questions";

export async function readQuizSessions(userId: string) {
  const { data, error } = await admin()
    .from("quiz_sessions")
    .select(COMPLETED_SESSION_FIELDS)
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(500);
  if (error) throw new Error("read_failed");
  return (data ?? []) as Array<{
    completed_at: string | null;
    questions: Array<{
      questionId: string;
      objectiveId: string;
      picked: string | null;
      correct: boolean;
    }> | null;
  }>;
}

export async function readBookmarks(userId: string) {
  const { data, error } = await admin()
    .from("bookmarks")
    .select("question_id, cert_id, bookmarked_at, note")
    .eq("user_id", userId)
    .order("bookmarked_at", { ascending: false })
    .limit(200);
  if (error) throw new Error("read_failed");
  return data ?? [];
}

export async function readReportedQuestions(userId: string) {
  const { data, error } = await admin()
    .from("reported_questions")
    .select("question_id, cert_id, reason, reported_at")
    .eq("user_id", userId)
    .order("reported_at", { ascending: false })
    .limit(200);
  if (error) throw new Error("read_failed");
  return data ?? [];
}
