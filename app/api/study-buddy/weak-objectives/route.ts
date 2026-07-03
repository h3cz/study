import { authenticate, readQuizSessions } from "@/lib/study-buddy/auth";
import { computeWeakObjectives } from "@/lib/study-buddy/mastery-server";
import { ok, fail, preflight } from "@/lib/study-buddy/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(req: Request) {
  return preflight(req);
}

export async function GET(req: Request) {
  const auth = await authenticate(req);
  if (!auth.ok) return fail(auth, req);

  const { searchParams } = new URL(req.url);
  const nRaw = parseInt(searchParams.get("n") ?? "3", 10);
  const n = Math.max(1, Math.min(10, isNaN(nRaw) ? 3 : nRaw));

  try {
    const sessions = await readQuizSessions(auth.userId);
    return ok({ weakObjectives: computeWeakObjectives(sessions, n) }, req);
  } catch {
    return fail({ status: 500, error: "internal_error" }, req);
  }
}
