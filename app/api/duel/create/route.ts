// POST /api/duel/create — create an invite duel (status=waiting).
// Body: {certId, numRounds?, roundLimitMs?}.
import { createInviteMatch, DuelError } from "@/lib/multiplayer/server";
import { requireUser, jsonError, jsonOk } from "@/lib/multiplayer/route-auth";
import { getCert } from "@/lib/certs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const auth = await requireUser();
  if ("res" in auth) return auth.res;

  let body: { certId?: string; numRounds?: number; roundLimitMs?: number };
  try {
    body = await req.json();
  } catch {
    return jsonError("bad_request", 400);
  }
  const certId = getCert(body.certId ?? "").id; // normalize / validate against the registry

  try {
    const match = await createInviteMatch(auth.userId, certId, body);
    return jsonOk({ match });
  } catch (e) {
    if (e instanceof DuelError) return jsonError(e.message, e.status);
    return jsonError("create_failed", 500);
  }
}
