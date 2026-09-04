// POST /api/duel/async/answer — submit one async answer (server-scored, flat points).
// Body: {matchId, round, picked}.
import { submitAsyncAnswer, DuelError } from "@/lib/multiplayer/server";
import { requireUser, jsonError, jsonOk } from "@/lib/multiplayer/route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const auth = await requireUser();
  if ("res" in auth) return auth.res;

  let body: { matchId?: string; round?: number; picked?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("bad_request", 400);
  }
  const { matchId, round, picked } = body;
  if (typeof matchId !== "string" || typeof round !== "number" || typeof picked !== "string") {
    return jsonError("bad_request", 400);
  }

  try {
    const match = await submitAsyncAnswer(auth.userId, matchId, round, picked);
    return jsonOk({ match });
  } catch (e) {
    if (e instanceof DuelError) return jsonError(e.message, e.status);
    return jsonError("submit_failed", 500);
  }
}
