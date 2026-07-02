import { db, type Question } from "@/lib/db";
import { weakestObjectives } from "@/lib/mastery";
import { getWrongAnswers } from "@/lib/wrong-answers";
import { getDueQuestionIds } from "@/lib/fsrs-mcq";

const RECENT_SESSION_LOOKBACK = 3;
const WEAK_OBJECTIVE_RATIO = 0.7;

// Slot allocation for the standard 10-Q daily quiz
const FSRS_SLOTS = 4;
const WRONG_SLOTS = 2;
// remaining slots split between weak-objective and breadth via WEAK_OBJECTIVE_RATIO

export type QuizMode = "daily" | "final-week" | "calibration" | "fsrs" | "weak-domain";

/** Pick `size` questions for today's adaptive quiz. */
export async function buildDailyQuiz(
  certId: string,
  size = 10,
  mode: QuizMode = "daily",
  options?: { filterVideoId?: string; singleQuestionId?: string; filterObjectiveId?: string; domainNumber?: number }
): Promise<Question[]> {
  // Single-question mode — return exactly that one question
  if (options?.singleQuestionId) {
    const q = await db.questions.get(options.singleQuestionId);
    return q ? [q] : [];
  }

  // If filtering by video source, return all matching questions (up to size)
  if (options?.filterVideoId) {
    const all = await db.questions.where("certId").equals(certId).toArray();
    const filtered = all.filter(
      (q) => q.videoSource?.videoId === options.filterVideoId
    );
    return shuffle(filtered).slice(0, size);
  }

  // If filtering by objective, return up to size questions for that objective
  if (options?.filterObjectiveId) {
    const objId = `${certId}:obj:${options.filterObjectiveId}`;
    const all = await db.questions.where("objectiveId").equals(objId).toArray();
    return shuffle(all).slice(0, size);
  }

  // Collect question IDs used in the last N sessions (to avoid repeats)
  const recentSessions = await db.quizSessions
    .where("certId")
    .equals(certId)
    .reverse()
    .limit(RECENT_SESSION_LOOKBACK)
    .toArray();

  const recentQIds = new Set<string>(
    recentSessions.flatMap((s) => s.questionIds)
  );

  if (mode === "calibration") {
    // Calibration: sample uniformly across all domains (proportional to domain weight).
    // No FSRS/wrong-answer bias — this is a diagnostic baseline, not a reward session.
    const allQuestions = await db.questions.where("certId").equals(certId).toArray();
    const domains = await db.domains.where("certId").equals(certId).toArray();
    const totalWeight = domains.reduce((s, d) => s + d.weight, 0) || 1;

    const picked: Question[] = [];
    const usedCalIds = new Set<string>();

    for (const domain of domains) {
      const domainQuestions = allQuestions.filter((q) => q.domainId === domain.id);
      const domainSlots = Math.round((domain.weight / totalWeight) * size);
      const sample = sampleN(domainQuestions, Math.min(domainSlots, domainQuestions.length));
      for (const q of sample) {
        if (!usedCalIds.has(q.id)) {
          picked.push(q);
          usedCalIds.add(q.id);
        }
      }
    }

    // Backfill if rounding left us short
    if (picked.length < size) {
      const remainder = allQuestions.filter((q) => !usedCalIds.has(q.id));
      picked.push(...sampleN(remainder, size - picked.length));
    }

    return shuffle(picked.slice(0, size));
  }

  if (mode === "final-week") {
    // 100% from weakest 3 domains' objectives only — no wrong-answer slots, no breadth
    const weak = await weakestObjectives(certId, 3);
    const weakDomainIds = new Set(weak.map((w) => w.objective.domainId));

    const allQuestions = await db.questions.where("certId").equals(certId).toArray();
    const unseen = allQuestions.filter((q) => !recentQIds.has(q.id));
    const pool = unseen.length >= size ? unseen : allQuestions;

    const weakDomainPool = pool.filter((q) => weakDomainIds.has(q.domainId));
    const finalPool = weakDomainPool.length >= size ? weakDomainPool : pool;
    const picked = sampleN(finalPool, Math.min(size, finalPool.length));

    if (picked.length < size) {
      const pickedIds = new Set(picked.map((q) => q.id));
      const remainder = pool.filter((q) => !pickedIds.has(q.id));
      picked.push(...sampleN(remainder, size - picked.length));
    }

    return shuffle(picked.slice(0, size));
  }

  if (mode === "fsrs") {
    // Only FSRS-due questions, sorted oldest-due first, capped at size
    const allQuestions = await db.questions.where("certId").equals(certId).toArray();
    const questionById = new Map(allQuestions.map((q) => [q.id, q]));
    const dueIds = await getDueQuestionIds(certId);
    const picked: Question[] = [];
    for (const qId of dueIds) {
      if (picked.length >= size) break;
      const q = questionById.get(qId);
      if (q) picked.push(q);
    }
    return picked;
  }

  if (mode === "weak-domain") {
    // Prioritized mix WITHIN a single target domain:
    //   1. previously-wrong → 2. FSRS-due → 3. unseen from the weakest objective
    //   → 4. remaining domain questions. Dedup, cap to `size`.
    const domainId = options?.domainNumber
      ? `${certId}:domain:${options.domainNumber}`
      : undefined;

    const allDomainQs = domainId
      ? await db.questions.where("domainId").equals(domainId).toArray()
      : [];

    if (allDomainQs.length === 0) {
      // No target domain resolved / no questions — fall back to standard daily.
      return buildDailyQuiz(certId, size, "daily");
    }

    const domainQById = new Map(allDomainQs.map((q) => [q.id, q]));
    const domainQIdSet = new Set(allDomainQs.map((q) => q.id));

    const [dueIds, weak, wrongAnswers] = await Promise.all([
      getDueQuestionIds(certId),
      weakestObjectives(certId, 3),
      getWrongAnswers({ sinceDays: 14 }),
    ]);

    // The weakest objective that belongs to this domain (for slot 3).
    const weakObjInDomain = weak.find((w) => w.objective.domainId === domainId);
    const weakObjId = weakObjInDomain?.objective.id;

    const picked: Question[] = [];
    const usedIds = new Set<string>();
    const push = (q: Question | undefined) => {
      if (q && !usedIds.has(q.id) && picked.length < size) {
        picked.push(q);
        usedIds.add(q.id);
      }
    };

    // 1. previously-wrong questions in this domain (most recent first)
    for (const w of wrongAnswers) {
      if (picked.length >= size) break;
      if (domainQIdSet.has(w.questionId)) push(domainQById.get(w.questionId));
    }

    // 2. FSRS-due questions in this domain (oldest-due first)
    for (const qId of dueIds) {
      if (picked.length >= size) break;
      if (domainQIdSet.has(qId)) push(domainQById.get(qId));
    }

    // 3. unseen questions from the weakest objective in this domain
    if (weakObjId && picked.length < size) {
      const objQs = shuffle(
        allDomainQs.filter((q) => q.objectiveId === weakObjId && !usedIds.has(q.id))
      );
      for (const q of objQs) push(q);
    }

    // 4. remaining domain questions to fill
    if (picked.length < size) {
      const remaining = shuffle(allDomainQs.filter((q) => !usedIds.has(q.id)));
      for (const q of remaining) push(q);
    }

    return picked.slice(0, size);
  }

  // ── Standard daily mode ──────────────────────────────────────────────────

  const [dueIds, weak, wrongAnswers] = await Promise.all([
    getDueQuestionIds(certId),
    weakestObjectives(certId, 3),
    getWrongAnswers({ sinceDays: 14 }),
  ]);
  const weakObjIds = new Set(weak.map((w) => w.objective.id));

  const allQuestions = await db.questions
    .where("certId")
    .equals(certId)
    .toArray();

  const questionById = new Map(allQuestions.map((q) => [q.id, q]));

  // Prefer unseen questions; fall back to all if pool is small
  const unseen = allQuestions.filter((q) => !recentQIds.has(q.id));
  const pool = unseen.length >= size ? unseen : allQuestions;

  const usedIds = new Set<string>();

  // --- Slot 1-4: FSRS-due questions (top priority) ---
  const fsrsPicked: Question[] = [];
  for (const qId of dueIds) {
    if (fsrsPicked.length >= FSRS_SLOTS) break;
    const q = questionById.get(qId);
    if (q && !usedIds.has(qId)) {
      fsrsPicked.push(q);
      usedIds.add(qId);
    }
  }

  // --- Slot 5-6: Wrong-answer queue ---
  const wrongQIds = wrongAnswers
    .filter((w) => questionById.has(w.questionId))
    .map((w) => w.questionId);
  const wrongCandidates = wrongQIds.slice().reverse(); // oldest first
  const wrongPicked: Question[] = [];
  const wrongSlotsAvail = WRONG_SLOTS + Math.max(0, FSRS_SLOTS - fsrsPicked.length);
  for (const qId of wrongCandidates) {
    if (wrongPicked.length >= wrongSlotsAvail) break;
    if (usedIds.has(qId)) continue;
    const q = questionById.get(qId);
    if (q) {
      wrongPicked.push(q);
      usedIds.add(qId);
    }
  }

  // --- Remaining slots: weak-objective + breadth ---
  const filled = fsrsPicked.length + wrongPicked.length;
  const remaining = size - filled;
  const poolExcluding = pool.filter((q) => !usedIds.has(q.id));

  const weakPool = poolExcluding.filter((q) => weakObjIds.has(q.objectiveId));
  const broadPool = poolExcluding.filter((q) => !weakObjIds.has(q.objectiveId));

  const weakCount = Math.round(remaining * WEAK_OBJECTIVE_RATIO);
  const broadCount = remaining - weakCount;

  const adaptivePicked: Question[] = [
    ...sampleN(weakPool, Math.min(weakCount, weakPool.length)),
    ...sampleN(broadPool, Math.min(broadCount, broadPool.length)),
  ];

  // Backfill if ratio couldn't fill
  if (adaptivePicked.length < remaining) {
    const pickedAdaptIds = new Set(adaptivePicked.map((q) => q.id));
    const remainder2 = poolExcluding.filter((q) => !pickedAdaptIds.has(q.id));
    adaptivePicked.push(...sampleN(remainder2, remaining - adaptivePicked.length));
  }

  const picked = [...fsrsPicked, ...wrongPicked, ...adaptivePicked];
  return shuffle(picked.slice(0, size));
}

function sampleN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  shuffle(copy);
  return copy.slice(0, n);
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
