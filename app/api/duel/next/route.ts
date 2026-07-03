// POST /api/duel/next — mark this player ready for the next round.
// The server advances only when both players have answered and both clicked Next.
import { readyNextRound, DuelError } from "@/lib/multiplayer/server";
import { requireUser, jsonError, jsonOk } from "@/lib/multiplayer/route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const auth = await requireUser();
  if ("res" in auth) return auth.res;

  let body: { matchId?: string; round?: number };
  try {
    body = await req.json();
  } catch {
    return jsonError("bad_request", 400);
  }
  if (!body.matchId || typeof body.round !== "number") return jsonError("bad_request", 400);

  try {
    const match = await readyNextRound(auth.userId, body.matchId, body.round);
    return jsonOk({ match });
  } catch (e) {
    if (e instanceof DuelError) return jsonError(e.message, e.status);
    return jsonError("ready_failed", 500);
  }
}
