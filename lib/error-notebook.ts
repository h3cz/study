// Post-Quiz Error Notebook — clusters the user's recent misses by exam objective
// and flags WHY each was missed using the confidence + speed signals already
// captured per answer. The headline signal is "overconfident" (wrong while marked
// high-confidence) — the most dangerous gap before a real exam.

import { db, type ConfidenceLevel } from "@/lib/db";
import { objectiveMastery } from "@/lib/mastery";

export type MissFlag = "overconfident" | "careless" | "struggling";

const CARELESS_MS = 12_000; // answered in under 12s and still wrong → rushed

export interface MissItem {
  questionId: string;
  stem: string;
  picked: string | null;
  correctKey: string | null;
  confidence: ConfidenceLevel | null;
  msSpent: number | null;
  flag: MissFlag;
}

export interface ErrorCluster {
  objectiveId: string;
  code: string;
  name: string;
  domainNumber: number | null;
  mastery: number | null; // 0..1
  misses: MissItem[];
}

export interface Calibration {
  highConfTotal: number; // # answers marked high-confidence in window
  highConfWrong: number; // …of those, how many were wrong
  pctWrong: number; // 0..100
}

export interface ErrorNotebook {
  windowDays: number;
  totalMisses: number;
  overconfidentCount: number;
  carelessCount: number;
  strugglingCount: number;
  calibration: Calibration | null;
  clusters: ErrorCluster[]; // sorted by miss count desc
}

const MS_DAY = 24 * 60 * 60 * 1000;

/** Why was this question missed? Overconfidence dominates, then carelessness. */
export function classifyMiss(confidence: ConfidenceLevel | null, msSpent: number | null): MissFlag {
  if (confidence === "high") return "overconfident";
  if (msSpent != null && msSpent < CARELESS_MS) return "careless";
  return "struggling";
}

interface Attempt {
  correct: boolean;
  picked: string | null;
  confidence: ConfidenceLevel | null;
  msSpent: number | null;
  at: string;
}

export async function buildErrorNotebook(
  certId: string,
  now: Date = new Date(),
  windowDays = 14
): Promise<ErrorNotebook> {
  const cutoff = new Date(now.getTime() - windowDays * MS_DAY).toISOString();

  const sessions = await db.quizSessions
    .filter((s) => !!s.completedAt && s.completedAt >= cutoff && s.certId === certId)
    .toArray();

  const empty: ErrorNotebook = {
    windowDays,
    totalMisses: 0,
    overconfidentCount: 0,
    carelessCount: 0,
    strugglingCount: 0,
    calibration: null,
    clusters: [],
  };
  if (sessions.length === 0) return empty;

  sessions.sort((a, b) => (a.completedAt ?? "").localeCompare(b.completedAt ?? ""));

  // Resolve correctness from the bundled question bank.
  const touchedIds = Array.from(new Set(sessions.flatMap((s) => Object.keys(s.answers))));
  const questions = await db.questions.where("id").anyOf(touchedIds).toArray();
  const qMap = new Map(questions.map((q) => [q.id, q]));

  // Latest attempt per question (ascending sessions → later overwrites), plus a
  // running calibration tally over every high-confidence answer in the window.
  const latest = new Map<string, Attempt>();
  let highConfTotal = 0;
  let highConfWrong = 0;

  for (const s of sessions) {
    if (!s.completedAt) continue;
    const recordByQ = new Map((s.answerRecords ?? []).map((r) => [r.questionId, r]));
    for (const [questionId, picked] of Object.entries(s.answers)) {
      const q = qMap.get(questionId);
      const rec = recordByQ.get(questionId);
      // Skip a question we can't judge: pruned from the bank AND no rich record.
      // Counting it would wrongly mark a correct high-confidence answer as wrong
      // and inflate the calibration tally.
      if (!rec && !q) continue;
      const correct = rec?.correct ?? !!q?.choices.find((c) => c.key === picked && c.correct);
      // Confidence is persisted per answer on the record; the live `confidences`
      // map only exists on an in-progress quiz, never on a saved session.
      const confidence = rec?.confidence ?? null;
      const msSpent = rec?.msSpent ?? null;
      if (confidence === "high") {
        highConfTotal++;
        if (!correct) highConfWrong++;
      }
      latest.set(questionId, { correct, picked: picked ?? null, confidence, msSpent, at: s.completedAt });
    }
  }

  // Cluster the still-wrong questions by objective.
  const byObjective = new Map<string, MissItem[]>();
  let overconfidentCount = 0;
  let carelessCount = 0;
  let strugglingCount = 0;

  for (const [questionId, a] of latest) {
    if (a.correct) continue; // graduated — most recent attempt was right
    const q = qMap.get(questionId);
    if (!q) continue;
    const correctKey = q.choices.find((c) => c.correct)?.key ?? null;
    const flag = classifyMiss(a.confidence, a.msSpent);
    if (flag === "overconfident") overconfidentCount++;
    else if (flag === "careless") carelessCount++;
    else strugglingCount++;
    const item: MissItem = {
      questionId,
      stem: q.stem,
      picked: a.picked,
      correctKey,
      confidence: a.confidence,
      msSpent: a.msSpent,
      flag,
    };
    const list = byObjective.get(q.objectiveId) ?? [];
    list.push(item);
    byObjective.set(q.objectiveId, list);
  }

  const totalMisses = overconfidentCount + carelessCount + strugglingCount;
  if (totalMisses === 0) {
    return {
      ...empty,
      calibration: highConfTotal > 0
        ? { highConfTotal, highConfWrong, pctWrong: Math.round((100 * highConfWrong) / highConfTotal) }
        : null,
    };
  }

  // Resolve objective metadata + mastery for each cluster.
  const objectives = await db.objectives.where("certId").equals(certId).toArray();
  const objMap = new Map(objectives.map((o) => [o.id, o]));
  const domains = await db.domains.where("certId").equals(certId).toArray();
  const domMap = new Map(domains.map((d) => [d.id, d]));

  const clusters: ErrorCluster[] = await Promise.all(
    Array.from(byObjective.entries()).map(async ([objectiveId, misses]) => {
      const obj = objMap.get(objectiveId);
      const dom = obj ? domMap.get(obj.domainId) : undefined;
      // Sort within a cluster: overconfident first (most urgent), then careless, then struggling.
      const order: Record<MissFlag, number> = { overconfident: 0, careless: 1, struggling: 2 };
      misses.sort((a, b) => order[a.flag] - order[b.flag]);
      return {
        objectiveId,
        code: obj?.code ?? objectiveId.split(":obj:")[1] ?? objectiveId,
        name: obj?.name ?? "Unknown objective",
        domainNumber: dom?.number ?? null,
        mastery: await objectiveMastery(objectiveId),
        misses,
      };
    })
  );

  clusters.sort((a, b) => b.misses.length - a.misses.length);

  return {
    windowDays,
    totalMisses,
    overconfidentCount,
    carelessCount,
    strugglingCount,
    calibration: highConfTotal > 0
      ? { highConfTotal, highConfWrong, pctWrong: Math.round((100 * highConfWrong) / highConfTotal) }
      : null,
    clusters,
  };
}
