import { db } from "@/lib/db";

export interface WrongAnswer {
  questionId: string;
  picked: "A" | "B" | "C" | "D" | null;
  attemptedAt: string; // ISO of the session.completedAt
  sessionId: string;
  source?: string; // e.g. "voice-tutor" when the latest attempt came from voice
}

/**
 * Returns the most recent wrong attempt per question within the window.
 * If a question's most recent attempt was correct, it is excluded ("graduated").
 */
export async function getWrongAnswers(
  opts?: { sinceDays?: number; limit?: number; certId?: string }
): Promise<WrongAnswer[]> {
  const sinceDays = opts?.sinceDays ?? 14;
  const limit = opts?.limit;
  const certId = opts?.certId;

  const cutoff = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000).toISOString();

  // Cert-isolation: when a certId is given, only consider that cert's sessions
  // so a Network+ user never sees Security+ misses (and vice-versa). When no
  // certId is passed, behavior is unchanged (scans all sessions) — keeping the
  // legacy Security+ path identical.
  const sessions = await db.quizSessions
    .filter(
      (s) =>
        !!s.completedAt &&
        s.completedAt >= cutoff &&
        (certId === undefined || s.certId === certId)
    )
    .toArray();

  if (sessions.length === 0) return [];

  // Sort sessions ascending by completedAt so we can keep "latest"
  sessions.sort((a, b) =>
    (a.completedAt ?? "").localeCompare(b.completedAt ?? "")
  );

  // Load all questions touched in these sessions to determine correct answers
  const allQuestionIds = Array.from(
    new Set(sessions.flatMap((s) => Object.keys(s.answers)))
  );
  const questions = await db.questions
    .where("id")
    .anyOf(allQuestionIds)
    .toArray();
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  // For each questionId track the most recent attempt (correct or not)
  // We iterate sessions in ascending order; later sessions overwrite earlier ones.
  const latestAttempt = new Map<
    string,
    { correct: boolean; picked: string; attemptedAt: string; sessionId: string; source?: string }
  >();

  for (const session of sessions) {
    if (!session.completedAt) continue;
    const sessionId = String(session.id ?? "");
    for (const [questionId, picked] of Object.entries(session.answers)) {
      const q = questionMap.get(questionId);
      const correct = !!q?.choices.find((c) => c.key === picked && c.correct);
      const source = session.answerRecords?.find(
        (ar) => ar.questionId === questionId
      )?.source;
      latestAttempt.set(questionId, {
        correct,
        picked,
        attemptedAt: session.completedAt,
        sessionId,
        source,
      });
    }
  }

  // Keep only questions where the latest attempt was WRONG
  const wrongs: WrongAnswer[] = [];
  for (const [questionId, attempt] of latestAttempt.entries()) {
    if (!attempt.correct) {
      wrongs.push({
        questionId,
        picked: attempt.picked as "A" | "B" | "C" | "D" | null,
        attemptedAt: attempt.attemptedAt,
        sessionId: attempt.sessionId,
        ...(attempt.source ? { source: attempt.source } : {}),
      });
    }
  }

  // Sort descending by attemptedAt
  wrongs.sort((a, b) => b.attemptedAt.localeCompare(a.attemptedAt));

  return limit !== undefined ? wrongs.slice(0, limit) : wrongs;
}

export interface WrongAnswerStats {
  totalWrong: number;
  byDomain: Record<string, number>;
  byObjective: Record<string, number>;
}

export async function getWrongAnswerStats(): Promise<WrongAnswerStats> {
  const wrongs = await getWrongAnswers({ sinceDays: 14 });

  if (wrongs.length === 0) {
    return { totalWrong: 0, byDomain: {}, byObjective: {} };
  }

  const questionIds = wrongs.map((w) => w.questionId);
  const questions = await db.questions
    .where("id")
    .anyOf(questionIds)
    .toArray();
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  const byDomain: Record<string, number> = {};
  const byObjective: Record<string, number> = {};

  for (const w of wrongs) {
    const q = questionMap.get(w.questionId);
    if (!q) continue;
    byDomain[q.domainId] = (byDomain[q.domainId] ?? 0) + 1;
    byObjective[q.objectiveId] = (byObjective[q.objectiveId] ?? 0) + 1;
  }

  return { totalWrong: wrongs.length, byDomain, byObjective };
}
