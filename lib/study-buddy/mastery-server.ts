// Server-side port of the READ side of lib/mastery.ts. The web app computes
// mastery client-side from Dexie; here we compute the SAME math from the
// server's authoritative mirror: quiz_sessions.questions (jsonb), each row of
// which carries { questionId, objectiveId, picked, correct }.
//
// We trust the stored `correct` flag that the client wrote, but for tutor-facing
// fields (recent misses) we ALSO re-derive the correct key from the bank so the
// API is server-authoritative about answer keys (security review #4 spirit).

import {
  domainWeights,
  domainName,
  objectiveMeta,
  questionMeta,
  allObjectives,
} from "./objectives";

const HALF_LIFE_DAYS = 7;
const PRIOR_CORRECT = 0.5;
const PRIOR_ATTEMPTS = 5;

function decayWeight(daysAgo: number): number {
  return Math.pow(0.5, daysAgo / HALF_LIFE_DAYS);
}

export interface SessionRow {
  completed_at: string | null;
  questions: Array<{
    questionId: string;
    objectiveId: string;
    picked: string | null;
    correct: boolean;
  }> | null;
}

interface Attempt {
  objectiveId: string;
  questionId: string;
  picked: string | null;
  correct: boolean;
  whenMs: number;
}

function flatten(sessions: SessionRow[]): Attempt[] {
  const out: Attempt[] = [];
  for (const s of sessions) {
    if (!s.completed_at) continue;
    const whenMs = new Date(s.completed_at).getTime();
    if (!Array.isArray(s.questions)) continue;
    for (const q of s.questions) {
      if (!q || typeof q.questionId !== "string") continue;
      out.push({
        objectiveId: q.objectiveId,
        questionId: q.questionId,
        picked: q.picked ?? null,
        correct: !!q.correct,
        whenMs,
      });
    }
  }
  return out;
}

/** Bayesian-smoothed, recency-weighted mastery per objectiveId. null = no attempts. */
function masteryByObjective(attempts: Attempt[]): Map<string, number | null> {
  const now = Date.now();
  const acc = new Map<string, { wc: number; wt: number; real: number }>();

  for (const a of attempts) {
    const daysAgo = (now - a.whenMs) / (1000 * 60 * 60 * 24);
    const w = decayWeight(daysAgo);
    const cur = acc.get(a.objectiveId) ?? {
      wc: PRIOR_CORRECT * PRIOR_ATTEMPTS,
      wt: PRIOR_ATTEMPTS,
      real: 0,
    };
    cur.wt += w;
    if (a.correct) cur.wc += w;
    cur.real += 1;
    acc.set(a.objectiveId, cur);
  }

  const out = new Map<string, number | null>();
  for (const [objId, v] of acc) {
    out.set(objId, v.real === 0 ? null : v.wc / v.wt);
  }
  return out;
}

function attemptsByObjective(attempts: Attempt[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const a of attempts) m.set(a.objectiveId, (m.get(a.objectiveId) ?? 0) + 1);
  return m;
}

export interface MasterySummary {
  predictedScore: number | null;
  domains: Array<{
    number: number;
    name: string;
    weight: number;
    mastery: number | null;
  }>;
  updatedAt: string | null;
}

export function computeMasterySummary(sessions: SessionRow[]): MasterySummary {
  const attempts = flatten(sessions);
  const objMastery = masteryByObjective(attempts);
  const weights = domainWeights();

  // domain -> list of objective masteries (only those with data)
  const domainBuckets = new Map<number, number[]>();
  for (const [objId, m] of objMastery) {
    if (m === null) continue;
    const meta = objectiveMeta(objId);
    if (!meta) continue;
    const arr = domainBuckets.get(meta.domainNumber) ?? [];
    arr.push(m);
    domainBuckets.set(meta.domainNumber, arr);
  }

  const domains = Array.from(weights.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([number, weight]) => {
      const arr = domainBuckets.get(number);
      const mastery =
        arr && arr.length > 0
          ? arr.reduce((s, x) => s + x, 0) / arr.length
          : null;
      return { number, name: domainName(number), weight, mastery };
    });

  const withData = domains.filter((d) => d.mastery !== null) as Array<{
    weight: number;
    mastery: number;
  }>;
  let predictedScore: number | null = null;
  if (withData.length > 0) {
    const weighted = withData.reduce((s, d) => s + d.weight * d.mastery, 0);
    predictedScore = Math.round((100 + 800 * weighted) / 10) * 10;
  }

  const latest = sessions
    .map((s) => s.completed_at)
    .filter((x): x is string => !!x)
    .sort()
    .pop() ?? null;

  return { predictedScore, domains, updatedAt: latest };
}

export interface WeakObjective {
  objectiveCode: string;
  name: string;
  domainNumber: number;
  mastery: number | null;
  attempts: number;
}

export function computeWeakObjectives(
  sessions: SessionRow[],
  n: number
): WeakObjective[] {
  const attempts = flatten(sessions);
  const objMastery = masteryByObjective(attempts);
  const objAttempts = attemptsByObjective(attempts);

  const scored: WeakObjective[] = [];
  for (const [objId, mastery] of objMastery) {
    if (mastery === null) continue;
    const meta = objectiveMeta(objId);
    if (!meta) continue;
    scored.push({
      objectiveCode: meta.code,
      name: meta.name,
      domainNumber: meta.domainNumber,
      mastery,
      attempts: objAttempts.get(objId) ?? 0,
    });
  }

  if (scored.length > 0) {
    return scored.sort((a, b) => a.mastery! - b.mastery!).slice(0, n);
  }

  // No attempts anywhere: suggest first n objectives as starting points.
  return allObjectives()
    .slice(0, n)
    .map((o) => ({
      objectiveCode: o.code,
      name: o.name,
      domainNumber: o.domainNumber,
      mastery: null,
      attempts: 0,
    }));
}

export interface RecentMiss {
  questionId: string;
  objectiveCode: string;
  stem: string;
  picked: string | null;
  correctKey: string | null;
  reviewedAt: string;
}

/**
 * Most recent incorrect attempts, newest first, capped. Re-derives correctKey
 * from the bank (server-authoritative). Stem is included because the user has
 * already seen these exact questions (their own misses) — this is NOT a bulk
 * bank listing.
 */
export function computeRecentMisses(
  sessions: SessionRow[],
  limit: number,
  objectiveCode?: string
): RecentMiss[] {
  const rows: RecentMiss[] = [];
  for (const s of sessions) {
    if (!s.completed_at || !Array.isArray(s.questions)) continue;
    for (const q of s.questions) {
      if (!q || q.correct) continue; // misses only
      const meta = questionMeta(q.questionId);
      const code = meta?.code ?? objectiveMeta(q.objectiveId)?.code ?? "";
      if (objectiveCode && code !== objectiveCode) continue;
      rows.push({
        questionId: q.questionId,
        objectiveCode: code,
        stem: meta?.stem ?? "",
        picked: q.picked ?? null,
        correctKey: meta?.correctKey ?? null,
        reviewedAt: s.completed_at,
      });
    }
  }
  rows.sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt));
  return rows.slice(0, limit);
}
