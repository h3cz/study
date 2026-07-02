import type { DistractorExplanations } from "@/content/distractor-explanations";

let cache: DistractorExplanations | null = null;
let loadAttempted = false;

export async function getExplanationsForQuestion(
  questionId: string
): Promise<Record<string, string> | null> {
  if (!loadAttempted) {
    loadAttempted = true;
    try {
      const mod = await import("@/content/distractor-explanations");
      cache = mod.distractorExplanations;
    } catch {
      cache = null; // file may not exist yet
    }
  }
  return cache?.[questionId] ?? null;
}
