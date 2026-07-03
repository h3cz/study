import { db } from "@/lib/db";

/**
 * Count answers recorded by the voice tutor (source:"voice-tutor") within the
 * last `days` days. Reads the local Dexie quiz sessions — the same store the
 * dashboard reads — so the count reflects exactly what flowed into mastery/FSRS.
 */
export async function countVoiceAnswers(days = 7, now: Date = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  const sessions = await db.quizSessions
    .filter((s) => !!s.completedAt && s.completedAt >= cutoff)
    .toArray();

  let count = 0;
  for (const s of sessions) {
    for (const ar of s.answerRecords ?? []) {
      if (ar.source === "voice-tutor") count++;
    }
  }
  return count;
}
