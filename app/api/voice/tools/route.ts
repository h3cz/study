// POST /api/voice/tools — the voice-tutor tool bridge.
//
// The OpenAI Realtime function calls arrive at the BROWSER (it is the WebRTC
// peer). The browser relays each call here; we dispatch to the existing
// study-buddy server functions and return the result, which the browser sends
// back to OpenAI over the data channel as function_call_output.
//
// SECURITY / CAP ENFORCEMENT (cap 1 server half + cap 4):
//   * Auth via Supabase cookie session.
//   * sessionId MUST belong to the authed user, MUST NOT be ended, and MUST be
//     within the 16-min per-session server backstop — tool calls past it are
//     rejected even if the client timer failed to disconnect.
//   * submit_answer is CHECK-ONLY here: the answer key is verified server-side
//     and { correct, correctKey, explanation } is returned. Recording happens
//     CLIENT-SIDE (Dexie, single-writer) so voice answers flow into the local
//     dashboard/mastery/FSRS and sync up the normal way — see lib/voice-tutor
//     and lib/gamification.recordVoiceAnswer.

import { createClient } from "@/lib/supabase/server";
import { isVoiceAllowed } from "@/lib/voice-tutor/access";
import {
  getOwnedSession,
  markSessionActive,
} from "@/lib/voice-tutor/sessions-server";
import { isSessionWithinBackstop } from "@/lib/voice-tutor/caps";
import {
  questionsForObjective,
  questionMeta,
} from "@/lib/study-buddy/objectives";
import {
  computeMasterySummary,
  computeWeakObjectives,
  computeRecentMisses,
} from "@/lib/study-buddy/mastery-server";
import { readQuizSessions } from "@/lib/study-buddy/auth";
import { DEFAULT_CERT_ID } from "@/lib/certs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noStore = { "Cache-Control": "no-store", "Content-Type": "application/json" };
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: noStore });
}

function clampInt(v: unknown, min: number, max: number, dflt: number): number {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n)) return dflt;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

export async function POST(req: Request) {
  // 1. Auth.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, 401);

  // 1b. Allowlist gate (defense in depth).
  if (!isVoiceAllowed(user.email)) {
    return json({ error: "voice_private_beta" }, 403);
  }

  const userId = user.id;

  // 2. Parse the relayed tool call.
  let body: {
    sessionId?: string;
    name?: string;
    certId?: string;
    arguments?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const sessionId = body?.sessionId;
  const name = body?.name;
  const args = (body?.arguments ?? {}) as Record<string, unknown>;
  // Cert-isolation: serve questions / resolve the answer key from the CALLER's
  // active cert, not a hardcoded Security+. Defaults to Security+ when the
  // client omits it (back-compat + the existing Security+ voice flow).
  const certId =
    typeof body?.certId === "string" && body.certId ? body.certId : DEFAULT_CERT_ID;
  if (!sessionId || !/^[0-9a-f-]{36}$/i.test(sessionId)) {
    return json({ error: "bad_session_id" }, 400);
  }
  if (!name || typeof name !== "string") {
    return json({ error: "missing_tool_name" }, 400);
  }

  // 3. Validate the session: owned, not ended, within the server backstop.
  let session;
  try {
    session = await getOwnedSession(userId, sessionId);
  } catch {
    return json({ error: "session_read_failed" }, 500);
  }
  if (!session) return json({ error: "session_not_found" }, 404);
  if (session.ended_at || session.status === "completed" || session.status === "killed") {
    return json({ error: "session_ended" }, 409);
  }
  if (!isSessionWithinBackstop(session.started_at)) {
    // Cap 1 (server backstop): reject tool calls past 16 min.
    return json({ error: "session_time_exceeded" }, 403);
  }

  // Mark active on first tool call (best-effort; non-fatal).
  void markSessionActive(userId, sessionId);

  // 4. Dispatch.
  try {
    switch (name) {
      case "get_weak_objectives": {
        const n = clampInt(args.n, 1, 5, 3);
        const sessions = await readQuizSessions(userId);
        return json({ weakObjectives: computeWeakObjectives(sessions, n) });
      }

      case "get_mastery_summary": {
        const sessions = await readQuizSessions(userId);
        return json(computeMasterySummary(sessions));
      }

      case "get_recent_misses": {
        const limit = clampInt(args.limit, 1, 20, 5);
        const objective =
          typeof args.objective === "string" && /^\d+\.\d+$/.test(args.objective)
            ? args.objective
            : undefined;
        const sessions = await readQuizSessions(userId);
        return json({ misses: computeRecentMisses(sessions, limit, objective) });
      }

      case "get_questions": {
        const objective = typeof args.objective === "string" ? args.objective : "";
        if (!/^\d+\.\d+$/.test(objective)) {
          return json({ error: "invalid_objective" }, 400);
        }
        const n = clampInt(args.n, 1, 5, 3);
        // Answer key is withheld (questionsForObjective strips correct + explanation).
        // Served from the caller's active cert (defaults to Security+).
        const questions = questionsForObjective(objective, n, undefined, certId);
        return json({ objective, questions });
      }

      case "submit_answer": {
        const questionId =
          typeof args.questionId === "string" ? args.questionId : "";
        const picked =
          typeof args.picked === "string" ? args.picked.toUpperCase() : "";
        if (!questionId) return json({ error: "missing_questionId" }, 400);
        if (!/^[A-D]$/.test(picked)) return json({ error: "invalid_picked" }, 400);

        const meta = questionMeta(questionId, certId);
        if (!meta) return json({ error: "question_not_found" }, 404);

        // Server-authoritative answer check from the bank, scoped to the
        // caller's cert so a questionId only resolves within that cert.
        const { SEED_DATA } = await import("@/content/seed");
        const question = SEED_DATA.questions.find(
          (q) => q.id === questionId && q.certId === certId
        );
        if (!question) return json({ error: "question_not_found" }, 404);
        const correctChoice = question.choices.find((c) => c.correct);
        const correctKey = correctChoice?.key ?? null;
        const correct = correctKey !== null && picked === correctKey;

        // NOTE: the voice path does NOT record server-side. The browser is
        // present during a voice session, so it records the answer locally to
        // Dexie (single-writer, identical to an in-app quiz) which then syncs UP
        // to Supabase via the normal queue. Recording here too would double-count.
        // We only resolve correctness + explanation so the tutor can speak it.
        return json({
          correct,
          correctKey,
          explanation: question.explanation,
        });
      }

      default:
        return json({ error: "unknown_tool", name }, 400);
    }
  } catch {
    return json({ error: "tool_dispatch_failed" }, 500);
  }
}
