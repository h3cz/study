// GET /api/duel/async/list — the caller's async challenges, newest first.
import { listAsyncChallenges } from "@/lib/multiplayer/server";
import { requireUser, jsonError, jsonOk } from "@/lib/multiplayer/route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const auth = await requireUser();
  if ("res" in auth) return auth.res;

  try {
    const challenges = await listAsyncChallenges(auth.userId);
    return jsonOk({ challenges });
  } catch {
    return jsonError("list_failed", 500);
  }
}
