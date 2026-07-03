import { authenticate, readQuizSessions } from "@/lib/study-buddy/auth";
import { computeMasterySummary } from "@/lib/study-buddy/mastery-server";
import { ok, fail, preflight } from "@/lib/study-buddy/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS(req: Request) {
  return preflight(req);
}

export async function GET(req: Request) {
  const auth = await authenticate(req);
  if (!auth.ok) return fail(auth, req);
  try {
    const sessions = await readQuizSessions(auth.userId);
    return ok(computeMasterySummary(sessions), req);
  } catch {
    return fail({ status: 500, error: "internal_error" }, req);
  }
}
