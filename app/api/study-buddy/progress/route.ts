// GET /api/study-buddy/progress
//
// PAT-gated one-call recap so a re-spawned agent can re-orient without
// calling every individual endpoint. Returns:
//   {
//     answeredToday: number,       // questions answered in sessions completed today (UTC)
//     totalAnswered: number,       // all-time answered questions across sessions
//     predictedScore: number|null, // Bayesian weighted predicted exam score
//     weakObjectives: WeakObjective[],  // top 3 weakest
//     recentMisses: RecentMiss[],       // last 5 incorrect attempts (server-authoritative)
//   }
//
// SECURITY:
//   - Same PAT auth + rate limits as sibling routes.
//   - recentMisses is server-derived from the user's OWN misses — no bulk listing.
//   - answer keys re-derived from bank (server-authoritative), same as /recent-misses.
//   - No new question bank surface beyond what /recent-misses already exposes.

import { authenticate, readQuizSessions } from "@/lib/study-buddy/auth";
import {
  computeMasterySummary,
  computeWeakObjectives,
  computeRecentMisses,
} from "@/lib/study-buddy/mastery-server";
import { ok, fail, preflight } from "@/lib/study-buddy/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEAK_OBJECTIVES_LIMIT = 3;
const RECENT_MISSES_LIMIT = 5;

/** Count questions answered in sessions that completed today (UTC). */
function countAnsweredToday(
  sessions: Awaited<ReturnType<typeof readQuizSessions>>
): number {
  const nowUtc = new Date();
  const todayUtcPrefix = nowUtc.toISOString().slice(0, 10); // "YYYY-MM-DD"
  let count = 0;
  for (const s of sessions) {
    if (!s.completed_at) continue;
    if (!s.completed_at.startsWith(todayUtcPrefix)) continue;
    if (!Array.isArray(s.questions)) continue;
    count += s.questions.length;
  }
  return count;
}

/** Count all questions answered across all sessions. */
function countTotalAnswered(
  sessions: Awaited<ReturnType<typeof readQuizSessions>>
): number {
  let count = 0;
  for (const s of sessions) {
    if (!Array.isArray(s.questions)) continue;
    count += s.questions.length;
  }
  return count;
}

export function OPTIONS(req: Request) {
  return preflight(req);
}

export async function GET(req: Request) {
  const auth = await authenticate(req);
  if (!auth.ok) return fail(auth, req);

  try {
    const sessions = await readQuizSessions(auth.userId);

    const answeredToday = countAnsweredToday(sessions);
    const totalAnswered = countTotalAnswered(sessions);
    const { predictedScore } = computeMasterySummary(sessions);
    const weakObjectives = computeWeakObjectives(sessions, WEAK_OBJECTIVES_LIMIT);
    const recentMisses = computeRecentMisses(sessions, RECENT_MISSES_LIMIT);

    return ok(
      {
        answeredToday,
        totalAnswered,
        predictedScore,
        weakObjectives,
        recentMisses,
      },
      req
    );
  } catch {
    return fail({ status: 500, error: "internal_error" }, req);
  }
}
