// POST /api/duel/rematch — start a fresh duel vs the same opponent. Body: {matchId}.
import { rematch, DuelError } from "@/lib/multiplayer/server";
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
  if (!body.matchId || typeof body.matchId !== "string") {
    return jsonError("bad_request", 400);
  }

  try {
    const match = await rematch(auth.userId, body.matchId);
    return jsonOk({ match });
  } catch (e) {
    if (e instanceof DuelError) return jsonError(e.message, e.status);
    return jsonError("rematch_failed", 500);
  }
}
