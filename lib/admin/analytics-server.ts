// Server-only admin analytics aggregation.
//
// SECURITY MODEL (mirrors lib/voice-tutor/sessions-server.ts):
//   * The service-role client is created lazily here and NEVER exported.
//   * Every read here is an INTENTIONAL cross-user aggregate — that's the whole
//     point of an admin dashboard. RLS is bypassed by the service role, which is
//     correct ONLY because the single caller (app/admin/page.tsx) is gated behind
//     getAdminUser() (an allow-listed-email check). Do not import this module from
//     any non-admin-gated surface.
//
// PostgREST can't SUM/AVG without RPCs, so aggregates are computed in JS over the
// (small) userbase. Every table read is capped with .limit(50000) defensively and
// selects only the columns it needs.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getCert } from "@/lib/certs";

let _admin: SupabaseClient | null = null;
function admin(): SupabaseClient {
  if (_admin) return _admin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("admin-analytics: server not configured");
  _admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _admin;
}

const READ_CAP = 50000;

// ─── Public types ──────────────────────────────────────────────────────────────

export interface AdminOverview {
  totalUsers: number;
  registeredProfiles: number;
  authOnlyUsers: number;
  activeUsers7d: number;
  activeUsers30d: number;
  guestDevices: number;
  guestReturningDevices: number;
  guestReturnRatePct: number | null;
  guestClaimedDevices: number;
  guestSignupRatePct: number | null;
  guestActive7d: number;
  guestActive30d: number;
  guestSavePromptViews: number;
  guestSavePromptClicks: number;
  guestSavePromptClickRatePct: number | null;
  newUsers7d: number;
  totalQuizSessions: number;
  totalMockExams: number;
  totalDrills: number;
  totalDuelsCompleted: number;
  totalQuestionsAnswered: number;
  avgPredictedScore: number | null;
}

export interface RosterCert {
  id: string;
  name: string;
  predictedScore: number | null;
}

export interface RosterRow {
  userId: string;
  displayName: string | null;
  email: string | null;
  source: "registered" | "auth-only";
  certs: RosterCert[];
  xp: number;
  level: number;
  streak: number;
  predictedScore: number | null;
  totalStudyDays: number;
  lastStudyDate: string | null;
  lastSignInAt: string | null;
  createdAt: string | null;
  quizCount: number;
  questionsAnswered: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface AdminTrends {
  signups: TrendPoint[];
  quizActivity: TrendPoint[];
  activeUsers: TrendPoint[];
  guestActivity: TrendPoint[];
}

export interface HistogramBucket {
  bucket: string;
  count: number;
}

export interface WeakDomain {
  domainId: string;
  accuracyPct: number;
  attempts: number;
}

export interface AdminQuality {
  overallAccuracyPct: number | null;
  mockPassRatePct: number | null;
  predictedScoreHistogram: HistogramBucket[];
  weakestDomains: WeakDomain[];
}

export interface ReportedQuestionRow {
  questionId: string;
  certId: string;
  count: number;
  reasons: string[];
}

export interface AdminAnalytics {
  overview: AdminOverview;
  roster: RosterRow[];
  trends: AdminTrends;
  quality: AdminQuality;
  reportedQuestions: ReportedQuestionRow[];
}

// ─── Row shapes (only the columns we read) ─────────────────────────────────────

interface ProfileRow {
  user_id: string;
  display_name: string | null;
  created_at: string | null;
}
interface UserStateRow {
  user_id: string;
  xp: number | null;
  level: number | null;
  streak: number | null;
  last_study_date: string | null;
  total_study_days: number | null;
  predicted_score: number | null;
}
interface CertScoreRow {
  user_id: string;
  cert_id: string;
  predicted_score: number | null;
}
interface QuizRow {
  user_id: string;
  started_at: string;
  num_questions: number | null;
  num_correct: number | null;
}
interface MockRow {
  total_questions: number | null;
  passed: boolean | null;
  domain_breakdown: Record<string, { correct: number; total: number }> | null;
}
interface DrillRow {
  correct: number | null;
  incorrect: number | null;
  skipped: number | null;
}
interface ReportedRow {
  question_id: string;
  cert_id: string;
  reason: string | null;
}
interface DuelRow {
  status: string | null;
}
interface GuestDeviceRow {
  first_seen_at: string;
  last_seen_at: string;
  heartbeat_count: number | null;
  claimed_user_id: string | null;
  save_prompt_view_count: number | null;
  save_prompt_click_count: number | null;
}
interface AuthInfo {
  email: string | null;
  lastSignInAt: string | null;
  createdAt: string | null;
}

// ─── Date helpers (UTC day buckets) ────────────────────────────────────────────

/** Format a Date as YYYY-MM-DD in UTC. */
function utcDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** The YYYY-MM-DD UTC keys for the last `n` days, oldest → newest (inclusive of today). */
function lastNDays(now: Date, n: number): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    keys.push(utcDay(d));
  }
  return keys;
}

/** Build a gap-filled trend series from a map of dayKey → count over the last n days. */
function fillTrend(counts: Map<string, number>, dayKeys: string[]): TrendPoint[] {
  return dayKeys.map((date) => ({ date, count: counts.get(date) ?? 0 }));
}

// ─── Auth email map ────────────────────────────────────────────────────────────

/**
 * Build a userId → {email, lastSignInAt, createdAt} map from the Auth admin API.
 * Paginates until a page returns fewer than perPage rows. Best-effort: on any
 * failure we return whatever we have (possibly empty) so the dashboard never
 * crashes just because Auth listing failed.
 */
async function buildAuthMap(): Promise<Map<string, AuthInfo>> {
  const map = new Map<string, AuthInfo>();
  const perPage = 1000;
  try {
    for (let page = 1; page <= 100; page++) {
      const { data, error } = await admin().auth.admin.listUsers({ page, perPage });
      if (error) break;
      const users = data?.users ?? [];
      for (const u of users) {
        map.set(u.id, {
          email: u.email ?? null,
          lastSignInAt: u.last_sign_in_at ?? null,
          createdAt: u.created_at ?? null,
        });
      }
      if (users.length < perPage) break;
    }
  } catch {
    // Proceed with whatever we collected (possibly empty).
  }
  return map;
}

// ─── Main entry point ──────────────────────────────────────────────────────────

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const now = new Date();
  const ms7 = 7 * 24 * 60 * 60 * 1000;
  const ms30 = 30 * 24 * 60 * 60 * 1000;
  const cutoff7 = new Date(now.getTime() - ms7);
  const cutoff30 = new Date(now.getTime() - ms30);
  const cutoff7Day = utcDay(cutoff7); // for last_study_date (a date column)
  const cutoff30Day = utcDay(cutoff30);
  const dayKeys = lastNDays(now, 30);

  const db = admin();

  const [
    profilesRes,
    statesRes,
    certScoresRes,
    quizzesRes,
    mocksRes,
    drillsRes,
    reportedRes,
    duelsRes,
    guestDevicesRes,
    authMap,
  ] = await Promise.all([
    db.from("profiles").select("user_id, display_name, created_at").limit(READ_CAP),
    db
      .from("user_state")
      .select("user_id, xp, level, streak, last_study_date, total_study_days, predicted_score")
      .limit(READ_CAP),
    db.from("user_cert_scores").select("user_id, cert_id, predicted_score").limit(READ_CAP),
    db.from("quiz_sessions").select("user_id, started_at, num_questions, num_correct").limit(READ_CAP),
    db.from("mock_exam_sessions").select("total_questions, passed, domain_breakdown").limit(READ_CAP),
    db.from("drill_sessions").select("correct, incorrect, skipped").limit(READ_CAP),
    db.from("reported_questions").select("question_id, cert_id, reason").limit(READ_CAP),
    db.from("duel_matches").select("status").limit(READ_CAP),
    db
      .from("guest_devices")
      .select("first_seen_at, last_seen_at, heartbeat_count, claimed_user_id, save_prompt_view_count, save_prompt_click_count")
      .limit(READ_CAP),
    buildAuthMap(),
  ]);

  const profiles = (profilesRes.data ?? []) as ProfileRow[];
  const states = (statesRes.data ?? []) as UserStateRow[];
  const certScores = (certScoresRes.data ?? []) as CertScoreRow[];
  const quizzes = (quizzesRes.data ?? []) as QuizRow[];
  const mocks = (mocksRes.data ?? []) as MockRow[];
  const drills = (drillsRes.data ?? []) as DrillRow[];
  const reported = (reportedRes.data ?? []) as ReportedRow[];
  const duels = (duelsRes.data ?? []) as DuelRow[];
  const guestDevices = (guestDevicesRes.data ?? []) as GuestDeviceRow[];

  // ── Per-user quiz aggregation ──────────────────────────────────────────────
  const quizCountByUser = new Map<string, number>();
  const quizQuestionsByUser = new Map<string, number>();
  let quizQuestionsTotal = 0;
  let quizCorrectTotal = 0;
  const signupCounts = new Map<string, number>();
  const quizActivityCounts = new Map<string, number>();
  const guestActivityCounts = new Map<string, number>();
  const activeUsersByDay = new Map<string, Set<string>>();

  for (const q of quizzes) {
    quizCountByUser.set(q.user_id, (quizCountByUser.get(q.user_id) ?? 0) + 1);
    const nq = q.num_questions ?? 0;
    quizQuestionsByUser.set(q.user_id, (quizQuestionsByUser.get(q.user_id) ?? 0) + nq);
    quizQuestionsTotal += nq;
    quizCorrectTotal += q.num_correct ?? 0;

    const day = q.started_at.slice(0, 10); // started_at is an ISO timestamp; UTC day
    quizActivityCounts.set(day, (quizActivityCounts.get(day) ?? 0) + 1);
    let set = activeUsersByDay.get(day);
    if (!set) {
      set = new Set<string>();
      activeUsersByDay.set(day, set);
    }
    set.add(q.user_id);
  }

  // Signups per day (last 30) from Auth when available, with profiles as the
  // fallback. This makes trigger failures visible instead of hiding signups.
  const signupSources =
    authMap.size > 0
      ? Array.from(authMap.values()).map((u) => u.createdAt)
      : profiles.map((p) => p.created_at);
  for (const createdAt of signupSources) {
    if (!createdAt) continue;
    const day = createdAt.slice(0, 10);
    signupCounts.set(day, (signupCounts.get(day) ?? 0) + 1);
  }

  const activeUserDayCounts = new Map<string, number>();
  for (const [day, set] of activeUsersByDay) {
    activeUserDayCounts.set(day, set.size);
  }

  // ── Per-user cert scores ────────────────────────────────────────────────────
  const certsByUser = new Map<string, RosterCert[]>();
  for (const cs of certScores) {
    const list = certsByUser.get(cs.user_id) ?? [];
    const cert = getCert(cs.cert_id);
    list.push({ id: cert.id, name: cert.name, predictedScore: cs.predicted_score ?? null });
    certsByUser.set(cs.user_id, list);
  }

  const stateByUser = new Map<string, UserStateRow>();
  for (const s of states) stateByUser.set(s.user_id, s);

  // ── Overview ────────────────────────────────────────────────────────────────
  const profileByUser = new Map<string, ProfileRow>();
  for (const p of profiles) profileByUser.set(p.user_id, p);

  const allUserIds = new Set<string>(profiles.map((p) => p.user_id));
  for (const userId of authMap.keys()) allUserIds.add(userId);

  const registeredProfiles = profiles.length;
  const authOnlyUsers = Array.from(authMap.keys()).filter((userId) => !profileByUser.has(userId)).length;
  const totalUsers = authMap.size > 0 ? authMap.size : registeredProfiles;

  let activeUsers7d = 0;
  let activeUsers30d = 0;
  let guestReturningDevices = 0;
  let guestClaimedDevices = 0;
  let guestActive7d = 0;
  let guestActive30d = 0;
  let guestSavePromptViews = 0;
  let guestSavePromptClicks = 0;
  const predictedScores: number[] = [];
  for (const s of states) {
    if (s.last_study_date) {
      if (s.last_study_date >= cutoff7Day) activeUsers7d++;
      if (s.last_study_date >= cutoff30Day) activeUsers30d++;
    }
    if (s.predicted_score != null) predictedScores.push(s.predicted_score);
  }

  for (const guest of guestDevices) {
    if ((guest.heartbeat_count ?? 0) > 1) guestReturningDevices++;
    if (guest.claimed_user_id) guestClaimedDevices++;
    if (!guest.last_seen_at) continue;
    const lastSeen = new Date(guest.last_seen_at);
    if (lastSeen.getTime() >= cutoff7.getTime()) guestActive7d++;
    if (lastSeen.getTime() >= cutoff30.getTime()) guestActive30d++;
    const day = guest.last_seen_at.slice(0, 10);
    guestActivityCounts.set(day, (guestActivityCounts.get(day) ?? 0) + 1);
    guestSavePromptViews += guest.save_prompt_view_count ?? 0;
    guestSavePromptClicks += guest.save_prompt_click_count ?? 0;
  }

  let newUsers7d = 0;
  for (const createdAt of signupSources) {
    if (createdAt && new Date(createdAt).getTime() >= cutoff7.getTime()) newUsers7d++;
  }

  let mockQuestionsTotal = 0;
  let mockPassed = 0;
  for (const m of mocks) {
    mockQuestionsTotal += m.total_questions ?? 0;
    if (m.passed) mockPassed++;
  }

  let drillQuestionsTotal = 0;
  for (const d of drills) {
    drillQuestionsTotal += (d.correct ?? 0) + (d.incorrect ?? 0) + (d.skipped ?? 0);
  }

  const totalDuelsCompleted = duels.filter((d) => d.status === "done").length;

  const avgPredictedScore =
    predictedScores.length > 0
      ? Math.round(predictedScores.reduce((a, b) => a + b, 0) / predictedScores.length)
      : null;

  const overview: AdminOverview = {
    totalUsers,
    registeredProfiles,
    authOnlyUsers,
    activeUsers7d,
    activeUsers30d,
    guestDevices: guestDevices.length,
    guestReturningDevices,
    guestReturnRatePct:
      guestDevices.length > 0 ? Math.round((guestReturningDevices / guestDevices.length) * 100) : null,
    guestClaimedDevices,
    guestSignupRatePct:
      guestDevices.length > 0 ? Math.round((guestClaimedDevices / guestDevices.length) * 100) : null,
    guestActive7d,
    guestActive30d,
    guestSavePromptViews,
    guestSavePromptClicks,
    guestSavePromptClickRatePct:
      guestSavePromptViews > 0 ? Math.round((guestSavePromptClicks / guestSavePromptViews) * 100) : null,
    newUsers7d,
    totalQuizSessions: quizzes.length,
    totalMockExams: mocks.length,
    totalDrills: drills.length,
    totalDuelsCompleted,
    totalQuestionsAnswered: quizQuestionsTotal + mockQuestionsTotal + drillQuestionsTotal,
    avgPredictedScore,
  };

  // ── Roster (one row per profile, sorted by xp desc) ─────────────────────────
  const roster: RosterRow[] = Array.from(allUserIds)
    .map((userId) => {
      const p = profileByUser.get(userId);
      const s = stateByUser.get(userId);
      const auth = authMap.get(userId);
      return {
        userId,
        displayName: p?.display_name ?? null,
        email: auth?.email ?? null,
        source: p ? ("registered" as const) : ("auth-only" as const),
        certs: certsByUser.get(userId) ?? [],
        xp: s?.xp ?? 0,
        level: s?.level ?? 0,
        streak: s?.streak ?? 0,
        predictedScore: s?.predicted_score ?? null,
        totalStudyDays: s?.total_study_days ?? 0,
        lastStudyDate: s?.last_study_date ?? null,
        lastSignInAt: auth?.lastSignInAt ?? null,
        createdAt: p?.created_at ?? auth?.createdAt ?? null,
        quizCount: quizCountByUser.get(userId) ?? 0,
        questionsAnswered: quizQuestionsByUser.get(userId) ?? 0,
      };
    })
    .sort((a, b) => b.xp - a.xp);

  // ── Trends (last 30 days, gap-filled) ───────────────────────────────────────
  const trends: AdminTrends = {
    signups: fillTrend(signupCounts, dayKeys),
    quizActivity: fillTrend(quizActivityCounts, dayKeys),
    activeUsers: fillTrend(activeUserDayCounts, dayKeys),
    guestActivity: fillTrend(guestActivityCounts, dayKeys),
  };

  // ── Quality ─────────────────────────────────────────────────────────────────
  const overallAccuracyPct =
    quizQuestionsTotal > 0 ? Math.round((100 * quizCorrectTotal) / quizQuestionsTotal) : null;
  const mockPassRatePct = mocks.length > 0 ? Math.round((100 * mockPassed) / mocks.length) : null;

  // Predicted-score histogram (Security+ 100-900 scale; ignore nulls).
  const histBuckets: { label: string; lo: number; hi: number }[] = [
    { label: "100-299", lo: 100, hi: 299 },
    { label: "300-499", lo: 300, hi: 499 },
    { label: "500-699", lo: 500, hi: 699 },
    { label: "700-799", lo: 700, hi: 799 },
    { label: "800-900", lo: 800, hi: 900 },
  ];
  const predictedScoreHistogram: HistogramBucket[] = histBuckets.map((b) => ({
    bucket: b.label,
    count: predictedScores.filter((v) => v >= b.lo && v <= b.hi).length,
  }));

  // Weakest domains: aggregate domain_breakdown across ALL mock exams.
  const domainAgg = new Map<string, { correct: number; total: number }>();
  for (const m of mocks) {
    const bd = m.domain_breakdown;
    if (!bd) continue;
    for (const [domainId, v] of Object.entries(bd)) {
      const correct = Number(v?.correct) || 0;
      const total = Number(v?.total) || 0;
      const cur = domainAgg.get(domainId) ?? { correct: 0, total: 0 };
      cur.correct += correct;
      cur.total += total;
      domainAgg.set(domainId, cur);
    }
  }
  const weakestDomains: WeakDomain[] = Array.from(domainAgg.entries())
    .filter(([, v]) => v.total >= 5)
    .map(([domainId, v]) => ({
      domainId,
      accuracyPct: v.total > 0 ? Math.round((100 * v.correct) / v.total) : 0,
      attempts: v.total,
    }))
    .sort((a, b) => a.accuracyPct - b.accuracyPct)
    .slice(0, 8);

  const quality: AdminQuality = {
    overallAccuracyPct,
    mockPassRatePct,
    predictedScoreHistogram,
    weakestDomains,
  };

  // ── Reported questions (group by question_id, count desc, top 25) ───────────
  const reportedAgg = new Map<
    string,
    { questionId: string; certId: string; count: number; reasons: Set<string> }
  >();
  for (const r of reported) {
    const cur =
      reportedAgg.get(r.question_id) ??
      { questionId: r.question_id, certId: r.cert_id, count: 0, reasons: new Set<string>() };
    cur.count++;
    if (r.reason) cur.reasons.add(r.reason);
    reportedAgg.set(r.question_id, cur);
  }
  const reportedQuestions: ReportedQuestionRow[] = Array.from(reportedAgg.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 25)
    .map((r) => ({
      questionId: r.questionId,
      certId: r.certId,
      count: r.count,
      reasons: Array.from(r.reasons),
    }));

  return { overview, roster, trends, quality, reportedQuestions };
}
