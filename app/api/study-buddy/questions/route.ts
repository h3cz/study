// GET /api/study-buddy/questions?objective=<code>&n=<1-5>
//
// PAT-gated. Returns a randomized, STRIPPED subset of questions for one
// objective. The `correct` flag and `explanation` are NEVER returned here —
// the agent quizzes the user; answers are checked server-side via /answer.
//
// SECURITY (anti-scraping):
//   - Hard cap: max 5 questions, never bulk.
//   - No endpoint to list all objectives' questions at once (see objectives.ts note).
//   - Per-key rate limits enforced by authenticate() (60/min, 200/day).
//   - Rejecting n>5 at the route layer AND in the helper.

import { authenticate, readQuizSessions } from "@/lib/study-buddy/auth";
import {
  questionsForObjective,
  MAX_QUESTIONS_PER_FETCH,
  objectiveIdForCode,
} from "@/lib/study-buddy/objectives";
import { ok, fail, preflight } from "@/lib/study-buddy/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MS_24H = 24 * 60 * 60 * 1000;

/** Build a set of questionIds the user answered in the last 24 hours. */
function recentlyAnsweredIds(
  sessions: Awaited<ReturnType<typeof readQuizSessions>>
): Set<string> {
  const cutoff = Date.now() - MS_24H;
  const ids = new Set<string>();
  for (const s of sessions) {
    if (!s.completed_at) continue;
    if (new Date(s.completed_at).getTime() < cutoff) continue;
    if (!Array.isArray(s.questions)) continue;
    for (const q of s.questions) {
      if (q?.questionId) ids.add(q.questionId);
    }
  }
  return ids;
}

export function OPTIONS(req: Request) {
  return preflight(req);
}

export async function GET(req: Request) {
  const auth = await authenticate(req);
  if (!auth.ok) return fail(auth, req);

  const { searchParams } = new URL(req.url);

  // Validate objective code ("1.1", "4.2", etc.)
  const objectiveParam = searchParams.get("objective") ?? "";
  if (!objectiveParam || !/^\d+\.\d+$/.test(objectiveParam)) {
    return fail({ status: 400, error: "missing_or_invalid_objective" }, req);
  }

  // Validate and hard-cap n
  const nRaw = parseInt(searchParams.get("n") ?? String(MAX_QUESTIONS_PER_FETCH), 10);
  if (isNaN(nRaw) || nRaw < 1) {
    return fail({ status: 400, error: "invalid_n" }, req);
  }
  if (nRaw > MAX_QUESTIONS_PER_FETCH) {
    return fail(
      { status: 400, error: "n_exceeds_cap", retryAfter: undefined },
      req
    );
  }

  // Unknown objective code is not an error — just 0 questions.
  const objId = objectiveIdForCode(objectiveParam);
  if (!objId) {
    return ok({ questions: [], objective: objectiveParam }, req);
  }

  // Build exclusion set unless caller explicitly opts out.
  const includeAnswered = searchParams.get("include_answered") === "true";
  let excludeIds: Set<string> | undefined;
  if (!includeAnswered) {
    try {
      const sessions = await readQuizSessions(auth.userId);
      excludeIds = recentlyAnsweredIds(sessions);
    } catch (err) {
      // Non-fatal: if session read fails, proceed without exclusion rather than
      // blocking the quiz flow. Log (no sensitive data) so a persistent DB issue
      // isn't masked by best-effort degradation.
      console.warn(
        "[study-buddy/questions] exclusion read failed, proceeding without:",
        err instanceof Error ? err.message : "unknown"
      );
      excludeIds = undefined;
    }
  }

  const questions = questionsForObjective(objectiveParam, nRaw, excludeIds);
  return ok({ questions, objective: objectiveParam }, req);
}
