// Shared server-side answer recording (FSRS + quiz_sessions + question_reviews).
//
// Extracted from app/api/study-buddy/answer/route.ts so BOTH the PAT-authed
// /answer route and the voice-tutor tool bridge record attempts identically.
// The service-role client is used ONLY for these writes and ALWAYS filters by
// the resolved userId — callers never supply a userId from request input.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CERT_ID } from "./objectives";
import { FSRS, createEmptyCard, Rating } from "ts-fsrs";

let _admin: SupabaseClient | null = null;
function admin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("record-answer: server not configured");
  _admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}

const fsrs = new FSRS({});

/**
 * Record one tutor/voice-driven answer for a user.
 * @param source tag written into the quiz_sessions row, e.g. "tutor" | "voice-tutor".
 */
export async function recordAnswer(
  userId: string,
  questionId: string,
  objectiveId: string,
  picked: string,
  correct: boolean,
  now: Date = new Date(),
  source: string = "tutor"
): Promise<void> {
  const a = admin();

  // 1. quiz_sessions — a single-question completed session so the server mastery
  //    math picks it up (same shape the local-first client writes).
  const questions = [
    { questionId, objectiveId, picked, correct, msSpent: 0, source },
  ];
  await a.from("quiz_sessions").insert({
    user_id: userId,
    cert_id: CERT_ID,
    started_at: now.toISOString(),
    completed_at: now.toISOString(),
    score_pct: correct ? 100 : 0,
    num_questions: 1,
    num_correct: correct ? 1 : 0,
    questions,
  });

  // 2. FSRS rating: correct → Good (3), wrong → Again (1).
  const ratingGrade = correct ? Rating.Good : Rating.Again;

  // 3. Seed FSRS card from the latest stored review for this user+question.
  const { data: latestRows } = await a
    .from("question_reviews")
    .select("fsrs_state, reviewed_at")
    .eq("user_id", userId)
    .eq("question_id", questionId)
    .order("reviewed_at", { ascending: false })
    .limit(1);

  const latestFsrsState = latestRows?.[0]?.fsrs_state ?? null;

  let card = createEmptyCard(now);
  if (latestFsrsState && typeof latestFsrsState === "object") {
    const s = latestFsrsState as Record<string, unknown>;
    card = {
      due: s.due ? new Date(s.due as string) : now,
      stability: (s.stability as number) ?? 0,
      difficulty: (s.difficulty as number) ?? 0,
      elapsed_days: (s.elapsed_days as number) ?? 0,
      scheduled_days: (s.scheduled_days as number) ?? 0,
      learning_steps: (s.learning_steps as number) ?? 0,
      reps: (s.reps as number) ?? 0,
      lapses: (s.lapses as number) ?? 0,
      state: (s.state as number) ?? 0,
      last_review: s.last_review ? new Date(s.last_review as string) : now,
    };
  }

  const result = fsrs.next(card, now, ratingGrade);
  const nextCard = result.card;

  const ratingNum: 1 | 3 = correct ? 3 : 1;
  await a.from("question_reviews").insert({
    user_id: userId,
    question_id: questionId,
    cert_id: CERT_ID,
    reviewed_at: now.toISOString(),
    rating: ratingNum,
    fsrs_state: {
      due: nextCard.due.toISOString(),
      stability: nextCard.stability,
      difficulty: nextCard.difficulty,
      elapsed_days: nextCard.elapsed_days,
      scheduled_days: nextCard.scheduled_days,
      learning_steps: nextCard.learning_steps ?? 0,
      reps: nextCard.reps,
      lapses: nextCard.lapses,
      state: nextCard.state,
      last_review: now.toISOString(),
    },
  });
}
