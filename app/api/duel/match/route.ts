// GET /api/duel/match?id=<uuid> — fetch a match the caller participates in.
import { getMatch, DuelError } from "@/lib/multiplayer/server";
import { requireUser, jsonError, jsonOk } from "@/lib/multiplayer/route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const auth = await requireUser();
  if ("res" in auth) return auth.res;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return jsonError("bad_request", 400);

  try {
    const match = await getMatch(auth.userId, id);
    return jsonOk({ match });
  } catch (e) {
    if (e instanceof DuelError) return jsonError(e.message, e.status);
    return jsonError("match_failed", 500);
  }
}
