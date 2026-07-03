// Server-side duel question selection + answer key.
//
// Built lazily per-cert from the bundled question bank (content/seed.ts), the
// single source of truth. Used by the duel routes to (a) pick a random set of
// MCQ ids for a match and (b) look up the correct key when scoring an answer.
//
// Only ids and the correct key are exposed — clients render the stems/choices
// from their own bundled copy, so no question text is served from here.

import { SEED_DATA } from "@/content/seed";

interface CertQuestionIndex {
  /** All MCQ question ids for the cert. */
  ids: string[];
  /** questionId -> correct option key ("A".."D"). */
  correctById: Map<string, string>;
}

const cache = new Map<string, CertQuestionIndex>();

function buildIndex(certId: string): CertQuestionIndex {
  const ids: string[] = [];
  const correctById = new Map<string, string>();
  for (const q of SEED_DATA.questions) {
    if (q.certId !== certId) continue;
    const correct = q.choices.find((c) => c.correct);
    if (!correct) continue; // skip malformed questions
    ids.push(q.id);
    correctById.set(q.id, correct.key);
  }
  return { ids, correctById };
}

function idx(certId: string): CertQuestionIndex {
  let cached = cache.get(certId);
  if (!cached) {
    cached = buildIndex(certId);
    cache.set(certId, cached);
  }
  return cached;
}

/** Pick `n` distinct random MCQ ids for a cert. Empty array if the cert is unknown. */
export function pickDuelQuestionIds(certId: string, n: number): string[] {
  const pool = idx(certId).ids;
  if (pool.length === 0) return [];
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

/** Correct option key for a question, or null if unknown. */
export function correctKeyFor(certId: string, questionId: string): string | null {
  return idx(certId).correctById.get(questionId) ?? null;
}

/** Whether the cert has enough MCQs to host a duel of `n` rounds. */
export function hasEnoughQuestions(certId: string, n: number): boolean {
  return idx(certId).ids.length >= n;
}
