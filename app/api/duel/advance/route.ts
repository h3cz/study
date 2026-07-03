// POST /api/duel/advance — advance the match if its round deadline has passed.
// Clients call this when their local round timer expires; it's idempotent and
// only advances when the server agrees the deadline is up. Normal review pacing
// advances through /api/duel/next after both players click Next.
import { advanceMatch, DuelError } from "@/lib/multiplayer/server";
import { requireUser, jsonError, jsonOk } from "@/lib/multiplayer/route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const auth = await requireUser();
  if ("res" in auth) return auth.res;

  let body: { matchId?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("bad_request", 400);
  }
  if (!body.matchId) return jsonError("bad_request", 400);

  try {
    const match = await advanceMatch(auth.userId, body.matchId);
    return jsonOk({ match });
  } catch (e) {
    if (e instanceof DuelError) return jsonError(e.message, e.status);
    return jsonError("advance_failed", 500);
  }
}
