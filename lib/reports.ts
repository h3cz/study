import { db } from "@/lib/db";
import type { ReportedQuestion } from "@/lib/db";
import { enqueue } from "@/lib/sync/engine";

export async function reportQuestion(opts: {
  questionId: string;
  certId: string;
  reason: ReportedQuestion["reason"];
  note?: string;
}): Promise<void> {
  const reportedAt = new Date().toISOString();
  await db.reportedQuestions.add({
    questionId: opts.questionId,
    certId: opts.certId,
    reason: opts.reason,
    note: opts.note,
    reportedAt,
  });

  // Enqueue sync — fire-and-forget
  enqueue("insert_question_report", {
    user_id: "",
    question_id: opts.questionId,
    cert_id: opts.certId,
    reason: opts.reason,
    note: opts.note,
    reported_at: reportedAt,
  }).catch(() => {});
}

export async function isQuestionReported(questionId: string): Promise<boolean> {
  const count = await db.reportedQuestions
    .where("questionId")
    .equals(questionId)
    .count();
  return count > 0;
}
