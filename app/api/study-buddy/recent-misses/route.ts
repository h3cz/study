import { authenticate, readQuizSessions } from "@/lib/study-buddy/auth";
import { computeRecentMisses } from "@/lib/study-buddy/mastery-server";
import { ok, fail, preflight } from "@/lib/study-buddy/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Hard cap: recent-misses is the user's OWN past mistakes, not a bank listing.
// Capped small (security review #3 — no bulk question exfiltration surface).
const MAX_LIMIT = 10;

export function OPTIONS(req: Request) {
  return preflight(req);
}

export async function GET(req: Request) {
  const auth = await authenticate(req);
  if (!auth.ok) return fail(auth, req);

  const { searchParams } = new URL(req.url);
  const limRaw = parseInt(searchParams.get("limit") ?? String(MAX_LIMIT), 10);
  const limit = Math.max(1, Math.min(MAX_LIMIT, isNaN(limRaw) ? MAX_LIMIT : limRaw));
  const objectiveParam = searchParams.get("objective") ?? undefined;
  const objective =
    objectiveParam && /^\d+\.\d+$/.test(objectiveParam) ? objectiveParam : undefined;

  try {
    const sessions = await readQuizSessions(auth.userId);
    return ok(
      { recentMisses: computeRecentMisses(sessions, limit, objective) },
      req
    );
  } catch {
    return fail({ status: 500, error: "internal_error" }, req);
  }
}
