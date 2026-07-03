// Server-safe cert objective tree, derived from the canonical content bundle
// (content/seed.ts). This keeps the question bank as the single source of truth
// while giving server routes a Dexie-free way to resolve objective codes, domain
// weights, and question metadata WITHOUT exposing the full bank.
//
// IMPORTANT (security review #3): we deliberately do NOT export an endpoint that
// bulk-lists questions. This module exposes only objective/domain metadata and a
// private lookup for answer-key correctness used by server mastery math. The full
// stems/choices/explanations are NOT served by any Phase 1 route.
//
// CERT-ISOLATION: the lookups are now built per-cert (lazily, cached). Every
// public function takes an optional certId, defaulting to Security+ so existing
// Security+ callers behave identically.

import { SEED_DATA } from "@/content/seed";
import type { Domain, Objective, Question } from "@/lib/db";

export const CERT_ID = "secplus-sy0-701";

interface CertIndex {
  domains: Domain[];
  objectives: Objective[];
  questions: Question[];
  objectiveById: Map<
    string,
    { code: string; name: string; domainNumber: number; weight: number }
  >;
  objectiveByCode: Map<string, string>;
  domainByNumber: Map<number, Domain>;
  questionById: Map<
    string,
    { objectiveId: string; code: string; stem: string; correctKey: string | null }
  >;
}

const indexCache = new Map<string, CertIndex>();

function buildIndex(certId: string): CertIndex {
  const domains = SEED_DATA.domains.filter((d) => d.certId === certId);
  const objectives = SEED_DATA.objectives.filter((o) => o.certId === certId);
  const questions = SEED_DATA.questions.filter((q) => q.certId === certId);

  const objectiveById = new Map<
    string,
    { code: string; name: string; domainNumber: number; weight: number }
  >();
  const objectiveByCode = new Map<string, string>();

  const domainByNumber = new Map<number, Domain>();
  for (const d of domains) domainByNumber.set(d.number, d);

  for (const o of objectives) {
    const domainNum = parseInt(o.code.split(".")[0], 10);
    const domain = domainByNumber.get(domainNum);
    objectiveById.set(o.id, {
      code: o.code,
      name: o.name,
      domainNumber: domainNum,
      weight: domain?.weight ?? 0,
    });
    objectiveByCode.set(o.code, o.id);
  }

  const questionById = new Map<
    string,
    { objectiveId: string; code: string; stem: string; correctKey: string | null }
  >();
  for (const q of questions) {
    const meta = objectiveById.get(q.objectiveId);
    const correct = q.choices.find((c) => c.correct);
    questionById.set(q.id, {
      objectiveId: q.objectiveId,
      code: meta?.code ?? "",
      stem: q.stem,
      correctKey: correct?.key ?? null,
    });
  }

  return {
    domains,
    objectives,
    questions,
    objectiveById,
    objectiveByCode,
    domainByNumber,
    questionById,
  };
}

function idx(certId: string = CERT_ID): CertIndex {
  let cached = indexCache.get(certId);
  if (!cached) {
    cached = buildIndex(certId);
    indexCache.set(certId, cached);
  }
  return cached;
}

export interface DomainNode {
  number: number;
  name: string;
  weight: number;
  objectives: { code: string; name: string }[];
}

/** Static cert tree for grounding — domains, weights, objectives. No question text. */
export function getObjectiveTree(certId: string = CERT_ID): DomainNode[] {
  const { domains, objectives } = idx(certId);
  return domains
    .slice()
    .sort((a, b) => a.number - b.number)
    .map((d) => ({
      number: d.number,
      name: d.name,
      weight: d.weight,
      objectives: objectives
        .filter((o) => parseInt(o.code.split(".")[0], 10) === d.number)
        .map((o) => ({ code: o.code, name: o.name }))
        .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true })),
    }));
}

export function domainWeights(certId: string = CERT_ID): Map<number, number> {
  const { domains } = idx(certId);
  const m = new Map<number, number>();
  for (const d of domains) m.set(d.number, d.weight);
  return m;
}

export function domainName(num: number, certId: string = CERT_ID): string {
  return idx(certId).domainByNumber.get(num)?.name ?? `Domain ${num}`;
}

export function objectiveMeta(objectiveId: string, certId: string = CERT_ID) {
  return idx(certId).objectiveById.get(objectiveId);
}

/** Code ("1.1") -> internal objectiveId, or null. */
export function objectiveIdForCode(code: string, certId: string = CERT_ID): string | null {
  return idx(certId).objectiveByCode.get(code) ?? null;
}

export function allObjectives(
  certId: string = CERT_ID
): { code: string; name: string; domainNumber: number; weight: number }[] {
  return Array.from(idx(certId).objectiveById.values()).sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { numeric: true })
  );
}

/**
 * Private question lookup for server mastery / recent-misses ONLY.
 * Returns the objective code, a trimmed stem, and the correct answer key.
 * NOT a bulk listing — callers must already hold a specific questionId that
 * the user has interacted with (i.e. it appears in their own quiz_sessions).
 */
export function questionMeta(questionId: string, certId: string = CERT_ID) {
  return idx(certId).questionById.get(questionId) ?? null;
}

/**
 * Return a CAPPED, STRIPPED set of questions for one objective.
 * Strips `correct` and `explanation` — answer key is never returned here.
 * Hard cap enforced here AND at the route; callers must not exceed MAX_QUESTIONS.
 *
 * SECURITY (anti-scraping): small cap, intent-based only, never bulk.
 */
export const MAX_QUESTIONS_PER_FETCH = 5;

export interface QuestionStripped {
  id: string;
  objectiveId: string;
  stem: string;
  choices: { key: string; text: string }[];
}

export function questionsForObjective(
  objectiveCode: string,
  n: number,
  excludeIds?: Set<string>,
  certId: string = CERT_ID
): QuestionStripped[] {
  const { objectiveByCode, questions } = idx(certId);
  const objectiveId = objectiveByCode.get(objectiveCode);
  if (!objectiveId) return [];

  const fullPool = questions.filter((q) => q.objectiveId === objectiveId);
  if (fullPool.length === 0) return [];

  // Hard cap enforced here regardless of what the caller passes.
  const count = Math.min(Math.max(1, n), MAX_QUESTIONS_PER_FETCH);

  // Attempt exclusion. Fall back to full pool if it would empty the candidate set.
  const candidatePool =
    excludeIds && excludeIds.size > 0
      ? fullPool.filter((q) => !excludeIds.has(q.id))
      : fullPool;
  const pool = candidatePool.length > 0 ? candidatePool : fullPool;

  // Fisher-Yates shuffle for randomness
  const shuffled = pool.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count).map((q) => ({
    id: q.id,
    objectiveId: q.objectiveId,
    stem: q.stem,
    choices: q.choices.map((c) => ({ key: c.key, text: c.text })),
    // NOTE: `correct` and `explanation` are deliberately omitted here.
  }));
}
