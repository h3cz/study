// POST /api/duel/async/create — create an async challenge (mode=async).
// Body: {certId, numRounds?}. The host plays immediately; the code is shared.
import { createAsyncChallenge, DuelError } from "@/lib/multiplayer/server";
import { requireUser, jsonError, jsonOk } from "@/lib/multiplayer/route-auth";
import { getCert } from "@/lib/certs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const auth = await requireUser();
  if ("res" in auth) return auth.res;

  let body: { certId?: string; numRounds?: number };
  try {
    body = await req.json();
  } catch {
    return jsonError("bad_request", 400);
  }
  const certId = getCert(body.certId ?? "").id;

  try {
    const match = await createAsyncChallenge(auth.userId, certId, body);
    return jsonOk({ match });
  } catch (e) {
    if (e instanceof DuelError) return jsonError(e.message, e.status);
    return jsonError("create_failed", 500);
  }
}
