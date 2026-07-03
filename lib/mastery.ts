import { db, type Domain, type Objective } from "@/lib/db";

const HALF_LIFE_DAYS = 7;
const PRIOR_CORRECT = 0.5;
const PRIOR_ATTEMPTS = 5;

/** Exponential decay weight for an attempt made `daysAgo` days ago. */
function decayWeight(daysAgo: number): number {
  return Math.pow(0.5, daysAgo / HALF_LIFE_DAYS);
}

/** Count of real (non-prior) attempts for an objective. */
export async function objectiveAttempts(objectiveId: string): Promise<number> {
  const sessions = await db.quizSessions
    .filter((s) => s.completedAt !== undefined)
    .toArray();

  const questions = await db.questions
    .where("objectiveId")
    .equals(objectiveId)
    .toArray();

  const qIds = new Set(questions.map((q) => q.id));
  let count = 0;

  for (const session of sessions) {
    if (!session.completedAt) continue;
    for (const qId of Object.keys(session.answers)) {
      if (qIds.has(qId)) count++;
    }
  }

  return count;
}

/**
 * Bayesian-smoothed, recency-weighted mastery for a single objective.
 * Returns null when the user has zero real attempts (no data yet).
 * Returns 0-1 once there is at least one attempt.
 */
export async function objectiveMastery(objectiveId: string): Promise<number | null> {
  const sessions = await db.quizSessions
    .filter((s) => s.completedAt !== undefined)
    .toArray();

  const questions = await db.questions
    .where("objectiveId")
    .equals(objectiveId)
    .toArray();

  const qIds = new Set(questions.map((q) => q.id));

  const now = Date.now();
  let weightedCorrect = PRIOR_CORRECT * PRIOR_ATTEMPTS;
  let weightedTotal = PRIOR_ATTEMPTS;
  let realAttempts = 0;

  for (const session of sessions) {
    if (!session.completedAt) continue;
    const sessionDate = new Date(session.completedAt).getTime();
    const daysAgo = (now - sessionDate) / (1000 * 60 * 60 * 24);
    const w = decayWeight(daysAgo);

    for (const [qId, chosen] of Object.entries(session.answers)) {
      if (!qIds.has(qId)) continue;
      const question = questions.find((q) => q.id === qId);
      if (!question) continue;
      const correct = question.choices.find(
        (c) => c.key === chosen && c.correct
      );
      weightedTotal += w;
      if (correct) weightedCorrect += w;
      realAttempts++;
    }
  }

  if (realAttempts === 0) return null;
  return weightedCorrect / weightedTotal;
}

/** Per-domain mastery = weighted average of its objective masteries. Returns null if all objectives have no data. */
export async function domainMastery(domainId: string): Promise<number | null> {
  const objectives = await db.objectives
    .where("domainId")
    .equals(domainId)
    .toArray();

  if (objectives.length === 0) return null;

  const masteries = await Promise.all(
    objectives.map((obj) => objectiveMastery(obj.id))
  );
  const withData = masteries.filter((m): m is number => m !== null);
  if (withData.length === 0) return null;
  return withData.reduce((sum, m) => sum + m, 0) / withData.length;
}

/** All domain masteries for a cert. */
export async function allDomainMasteries(
  certId: string
): Promise<Array<{ domain: Domain; mastery: number | null }>> {
  const domains = await db.domains.where("certId").equals(certId).toArray();
  const results = await Promise.all(
    domains.map(async (domain) => ({
      domain,
      mastery: await domainMastery(domain.id),
    }))
  );
  return results.sort((a, b) => a.domain.number - b.domain.number);
}

/**
 * Predicted score on the 100-900 scale.
 * Returns null if every domain has no data (brand-new user).
 * predicted = 100 + 800 * sum(domainWeight * domainMastery)
 */
export async function predictedScore(certId: string): Promise<number | null> {
  const masteries = await allDomainMasteries(certId);
  const withData = masteries.filter(
    (x): x is { domain: Domain; mastery: number } => x.mastery !== null
  );
  if (withData.length === 0) return null;
  const weighted = withData.reduce(
    (sum, { domain, mastery }) => sum + domain.weight * mastery,
    0
  );
  const raw = 100 + 800 * weighted;
  return Math.round(raw / 10) * 10;
}

/**
 * Returns the n weakest objectives (lowest mastery) that have at least
 * 1 real attempt. Falls back to n random untouched objectives if none have attempts.
 * mastery is null for untouched objectives.
 */
export async function weakestObjectives(
  certId: string,
  n = 3
): Promise<Array<{ objective: Objective; mastery: number | null }>> {
  const objectives = await db.objectives
    .where("certId")
    .equals(certId)
    .toArray();

  const scored = await Promise.all(
    objectives.map(async (objective) => ({
      objective,
      mastery: await objectiveMastery(objective.id),
    }))
  );

  // Filter to only objectives with questions
  const withQuestions = await Promise.all(
    scored.map(async (item) => {
      const count = await db.questions
        .where("objectiveId")
        .equals(item.objective.id)
        .count();
      return { ...item, hasQuestions: count > 0 };
    })
  );

  const withQs = withQuestions.filter((x) => x.hasQuestions);

  // Separate attempted vs untouched
  const attempted = withQs.filter((x) => x.mastery !== null);
  if (attempted.length > 0) {
    const sorted = attempted.sort(
      (a, b) => (a.mastery as number) - (b.mastery as number)
    );
    return sorted.slice(0, n).map(({ objective, mastery }) => ({
      objective,
      mastery,
    }));
  }

  // No attempts yet — return n random untouched objectives as starting suggestions
  const untouched = withQs.filter((x) => x.mastery === null);
  const shuffled = untouched.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map(({ objective }) => ({
    objective,
    mastery: null,
  }));
}
