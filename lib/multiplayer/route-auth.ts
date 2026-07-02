// Resolve the cookie-session user for a duel route. Identity always comes from
// the verified session — never from request input.

import { createClient } from "@/lib/supabase/server";

export const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  "Content-Type": "application/json",
};

export function jsonError(error: string, status: number): Response {
  return new Response(JSON.stringify({ error }), { status, headers: noStore });
}

export function jsonOk(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: noStore });
}

/** Returns the authed user id, or a ready-to-return 401 Response. */
export async function requireUser(): Promise<{ userId: string } | { res: Response }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { res: jsonError("not_authenticated", 401) };
  return { userId: user.id };
}
