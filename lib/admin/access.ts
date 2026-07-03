/**
 * Admin allowlist gate for the analytics dashboard.
 *
 * Mirrors the voice-tutor model (lib/voice-tutor/access.ts): a comma-separated
 * env allowlist, matched case-insensitively against the verified session email.
 *
 * Fail CLOSED: if ADMIN_ALLOWED_EMAILS is empty/unset, NO ONE is an admin. The
 * env value is never sent to the client — only the resolved identity (for an
 * allow-listed caller) or `null` ever leaves this module.
 *
 * To invite a collaborator: add their email to ADMIN_ALLOWED_EMAILS (env), no
 * code change or deploy of new logic required.
 */
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export function isAdminAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_ALLOWED_EMAILS ?? "";
  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) return false; // fail closed
  return allowed.includes(email.trim().toLowerCase());
}

export type AdminIdentity = { userId: string; email: string };

async function hasAuthCookie(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return false;
  const projectRef = new URL(url).hostname.split(".")[0];
  const authCookieName = `sb-${projectRef}-auth-token`;
  const cookieStore = await cookies();
  return cookieStore.getAll().some((cookie) => cookie.name === authCookieName || cookie.name.startsWith(`${authCookieName}.`));
}

/**
 * Resolve the cookie-session user and confirm they're an allow-listed admin.
 * Returns the identity, or `null` for anyone who is not signed in OR not an
 * admin — callers should treat `null` as "this resource does not exist" (render
 * a 404) so the dashboard's existence isn't disclosed to non-admins.
 */
export async function getAdminUser(): Promise<AdminIdentity | null> {
  if (!(await hasAuthCookie())) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  if (!user?.email || !isAdminAllowed(user.email)) return null;
  return { userId: user.id, email: user.email };
}
