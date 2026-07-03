// POST /api/duel/join — join a waiting invite duel by code. Body: {code}.
import { joinByCode, DuelError } from "@/lib/multiplayer/server";
import { requireUser, jsonError, jsonOk } from "@/lib/multiplayer/route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const auth = await requireUser();
  if ("res" in auth) return auth.res;

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return jsonError("bad_request", 400);
  }
  const code = (body.code ?? "").trim();
  if (!/^[0-9A-Za-z]{6}$/.test(code)) return jsonError("invalid_code", 400);

  try {
    const match = await joinByCode(auth.userId, code);
    return jsonOk({ match });
  } catch (e) {
    if (e instanceof DuelError) return jsonError(e.message, e.status);
    return jsonError("join_failed", 500);
  }
}
