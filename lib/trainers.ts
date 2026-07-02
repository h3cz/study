// Shared helpers for focused topic trainers (OSI, Ports, Control Types, Crypto…).
// Each trainer is a reference card + a drag/click matching drill + a short quiz
// over a slice of the existing question bank — no new question content needed.
import { db } from "@/lib/db";
import type { Question, PerfQuestion } from "@/lib/db";

export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** All questions for one objective, e.g. "secplus-sy0-701:obj:1.1". */
export async function loadByObjective(objectiveId: string): Promise<Question[]> {
  return db.questions.where("objectiveId").equals(objectiveId).toArray();
}

/** All questions across several objectives (deduped by id). */
export async function loadByObjectives(objectiveIds: string[]): Promise<Question[]> {
  return db.questions.where("objectiveId").anyOf(objectiveIds).toArray();
}

/** Merge several question lists, deduped by id. */
export function mergeQuestions(...lists: Question[][]): Question[] {
  const byId = new Map<string, Question>();
  for (const list of lists) for (const q of list) byId.set(q.id, q);
  return [...byId.values()];
}

/** Questions for a cert filtered by a predicate (for topics that span objectives). */
export async function loadByMatch(
  certId: string,
  test: (q: Question) => boolean
): Promise<Question[]> {
  const all = await db.questions.where("certId").equals(certId).toArray();
  return all.filter(test);
}

/** First PerfQuestion for an objective (used as a trainer's matching drill). */
export async function loadPbqByObjective(objectiveId: string): Promise<PerfQuestion | null> {
  const pbqs = await db.perfQuestions.where("objectiveId").equals(objectiveId).toArray();
  return pbqs[0] ?? null;
}

/**
 * Build a PerfQuestion-shaped object for a hand-authored matching drill so a
 * trainer can feed DragMatch without depending on a seeded PBQ existing.
 */
export function makeDrill(opts: {
  id: string;
  certId: string;
  prompt: string;
  leftLabel: string;
  rightLabel: string;
  pairs: { left: string; right: string }[];
  explanation: string;
}): PerfQuestion {
  return {
    id: opts.id,
    certId: opts.certId,
    domainId: "",
    objectiveId: "",
    type: "drag-match",
    prompt: opts.prompt,
    leftLabel: opts.leftLabel,
    rightLabel: opts.rightLabel,
    pairs: opts.pairs,
    explanation: opts.explanation,
    difficulty: 2,
  };
}
