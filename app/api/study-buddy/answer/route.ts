// POST /api/study-buddy/answer
// Body: { questionId: string, picked: "A"|"B"|"C"|"D" }
//
// PAT-gated. Looks up the question server-side (never trusts caller-supplied
// correctness), returns { correct, correctKey, explanation }, AND records the
// answer to the user's quiz_sessions and question_reviews — so agent-driven
// practice updates real mastery, the wrong-answer queue, and the streak.
//
// SECURITY:
//   - Answer key is only revealed AFTER the user has committed a pick.
//   - Recording always uses the PAT-resolved userId — never a caller-supplied id.
//   - Service-role client used only for the write; userId is always .eq filtered.

import { authenticate } from "@/lib/study-buddy/auth";
import { questionMeta } from "@/lib/study-buddy/objectives";
import { recordAnswer } from "@/lib/study-buddy/record-answer";
import { ok, fail, preflight } from "@/lib/study-buddy/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------- route ----------

export function OPTIONS(req: Request) {
  return preflight(req);
}

export async function POST(req: Request) {
  const auth = await authenticate(req);
  if (!auth.ok) return fail(auth, req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail({ status: 400, error: "invalid_json" }, req);
  }

  if (!body || typeof body !== "object") {
    return fail({ status: 400, error: "invalid_body" }, req);
  }

  const { questionId, picked } = body as Record<string, unknown>;

  if (!questionId || typeof questionId !== "string") {
    return fail({ status: 400, error: "missing_questionId" }, req);
  }
  if (!picked || typeof picked !== "string" || !/^[A-D]$/.test(picked)) {
    return fail({ status: 400, error: "invalid_picked" }, req);
  }

  // Server-side question lookup — answer key is never supplied by the caller.
  const meta = questionMeta(questionId);
  if (!meta) {
    return fail({ status: 404, error: "question_not_found" }, req);
  }

  // Look up the full question from SEED_DATA to get explanation.
  const { SEED_DATA } = await import("@/content/seed");
  const question = SEED_DATA.questions.find((q) => q.id === questionId);
  if (!question) {
    return fail({ status: 404, error: "question_not_found" }, req);
  }

  const correctChoice = question.choices.find((c) => c.correct);
  const correctKey = correctChoice?.key ?? null;
  const correct = correctKey !== null && picked === correctKey;
  const objectiveId = meta.objectiveId;

  // Record the answer server-side (fire the write; any error is non-fatal to
  // the response — the user already committed an answer, we return the result).
  try {
    await recordAnswer(
      auth.userId,
      questionId,
      objectiveId,
      picked,
      correct,
      new Date()
    );
  } catch {
    // Recording failure is logged as a warning but does NOT block the response.
    // The user gets the correct/incorrect feedback regardless.
    console.warn("answer: recording failed for user", auth.keyId);
  }

  return ok(
    {
      correct,
      correctKey,
      explanation: question.explanation,
    },
    req
  );
}
