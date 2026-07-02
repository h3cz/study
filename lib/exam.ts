import { db, type Question, type PerfQuestion } from "@/lib/db";

const MCQ_COUNT = 85;
const PBQ_COUNT = 5;
const MOCK_LOOKBACK = 3; // avoid questions used in last N mock exams

/** Generate a UUID v4 (browser-compatible). */
function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Fisher-Yates shuffle (in-place, returns array). */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Weighted random sample: pick `n` items from `pool` weighted by `weightFn`. */
function weightedSample<T>(pool: T[], weightFn: (item: T) => number, n: number): T[] {
  if (pool.length === 0 || n <= 0) return [];
  if (n >= pool.length) return shuffle([...pool]);

  const picked: T[] = [];
  const remaining = [...pool];

  for (let i = 0; i < n && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((sum, item) => sum + weightFn(item), 0);
    let rand = Math.random() * totalWeight;
    let idx = 0;
    for (let j = 0; j < remaining.length; j++) {
      rand -= weightFn(remaining[j]);
      if (rand <= 0) {
        idx = j;
        break;
      }
    }
    picked.push(...remaining.splice(idx, 1));
  }

  return picked;
}

export interface MockExamResult {
  mcqs: Question[];
  pbqs: PerfQuestion[];
  examId: string;
}

/**
 * Build a full-length mock exam: 85 MCQs weighted by domain + 5 random PBQs.
 * Avoids questions used in the last 3 mock exams for variety.
 *
 * `certId` scopes every content query to the selected cert. It is required —
 * there is no hidden Security+ default — so an A+ user never gets Sec+ content.
 */
export async function buildMockExam(certId: string): Promise<MockExamResult> {
  const examId = uuid();

  // --- Collect recently-used MCQ IDs from past mock exams ---
  const recentMocks = await db.mockExamSessions
    .orderBy("startedAt")
    .reverse()
    .limit(MOCK_LOOKBACK)
    .toArray();

  const recentMcqIds = new Set<string>(
    recentMocks.flatMap((s) =>
      s.questions.filter((q) => q.kind === "mcq").map((q) => q.qId)
    )
  );

  // --- Load domains to get weights ---
  const domains = await db.domains.where("certId").equals(certId).toArray();
  const domainWeightById = new Map(domains.map((d) => [d.id, d.weight]));

  // --- Load all MCQs ---
  const allMcqs = await db.questions.where("certId").equals(certId).toArray();

  // Prefer unseen questions; fall back to full pool if pool is too small
  const unseenMcqs = allMcqs.filter((q) => !recentMcqIds.has(q.id));
  const mcqPool = unseenMcqs.length >= MCQ_COUNT ? unseenMcqs : allMcqs;

  // Weight each question by its domain's exam weight
  const mcqs = weightedSample(
    mcqPool,
    (q) => domainWeightById.get(q.domainId) ?? 0.2,
    MCQ_COUNT
  );

  // Stable shuffle so same questions don't always appear first
  shuffle(mcqs);

  // --- Load PBQs (no domain weighting — pool is only 25) ---
  const recentPbqIds = new Set<string>(
    recentMocks.flatMap((s) =>
      s.questions.filter((q) => q.kind === "pbq").map((q) => q.qId)
    )
  );

  const allPbqs = await db.perfQuestions.where("certId").equals(certId).toArray();
  const unseenPbqs = allPbqs.filter((q) => !recentPbqIds.has(q.id));
  const pbqPool = unseenPbqs.length >= PBQ_COUNT ? unseenPbqs : allPbqs;

  const pbqs = shuffle([...pbqPool]).slice(0, PBQ_COUNT);

  return { mcqs, pbqs, examId };
}

/**
 * Translate raw exam score (correct/total) to the 100-900 Sec+ scale.
 * Uses the same formula as predictedScore but applied to this exam's results.
 * This is a simplified linear scaling since we don't have per-domain mastery
 * for a single exam sitting — we treat overall % correct as uniform mastery.
 */
export function examRawToScale(numCorrect: number, total: number): number {
  if (total === 0) return 100;
  const mastery = numCorrect / total;
  const raw = 100 + 800 * mastery;
  return Math.round(raw / 10) * 10;
}

/**
 * Score a PBQ drag-match arrangement during a mock exam.
 *
 * `arrangement[i]` is the right-column value the user placed in slot `i`; a PBQ
 * is correct only when every slot holds its canonical `pairs[i].right` value.
 * This all-or-nothing rule mirrors practice mode (`correctCount === totalPairs`)
 * and keeps the exam's per-question score binary. An empty/short arrangement
 * (e.g. a PBQ the user never engaged) scores incorrect.
 */
export function isPbqArrangementCorrect(
  pairs: { left: string; right: string }[],
  arrangement: readonly string[]
): boolean {
  return pairs.length > 0 && pairs.every((p, idx) => arrangement[idx] === p.right);
}
