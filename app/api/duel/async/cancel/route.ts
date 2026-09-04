// POST /api/duel/async/cancel — host cancels an open challenge.
// Body: {matchId}.
import { cancelAsyncChallenge, DuelError } from "@/lib/multiplayer/server";
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
  if (typeof body.matchId !== "string") return jsonError("bad_request", 400);

  try {
    await cancelAsyncChallenge(auth.userId, body.matchId);
    return jsonOk({ ok: true });
  } catch (e) {
    if (e instanceof DuelError) return jsonError(e.message, e.status);
    return jsonError("cancel_failed", 500);
  }
}
