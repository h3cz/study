import { getCaseStudy } from "@/content/az104-case-studies";
import type { Question } from "@/lib/db";

/** Text-only consumers (speech and tutor tools) need the scenario too. */
export function fullQuestionStem(question: Pick<Question, "stem" | "caseStudyId">): string {
  const study = getCaseStudy(question.caseStudyId);
  return study ? `${study.title}. ${study.scenario}\n\n${question.stem}` : question.stem;
}
