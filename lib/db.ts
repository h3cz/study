import Dexie, { type Table } from "dexie";

// ─── Domain Types ───────────────────────────────────────────────────────────

export interface Certification {
  id: string; // e.g. "secplus-sy0-701"
  name: string;
  vendor: string;
  version: string;
  passingScore: number; // 750 for Sec+
}

export interface Domain {
  id: string; // e.g. "secplus-sy0-701:domain:1"
  certId: string;
  number: number; // 1-5
  name: string;
  weight: number; // 0.12, 0.22, etc.
}

export interface Objective {
  id: string; // e.g. "secplus-sy0-701:obj:1.1"
  certId: string;
  domainId: string;
  code: string; // "1.1"
  name: string;
}

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface Choice {
  key: "A" | "B" | "C" | "D";
  text: string;
  correct: boolean;
}

export interface VideoSource {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  channel: "Professor Messer";
  objectiveCode?: string;
  timestamp?: number; // seconds offset for deep-link into video
}

export interface Question {
  id: string;
  certId: string;
  domainId: string;
  objectiveId: string;
  stem: string;
  choices: Choice[];
  explanation: string;
  difficulty: Difficulty;
  videoSource?: VideoSource;
}

export interface Flashcard {
  id: string;
  certId: string;
  domainId: string;
  objectiveId: string;
  front: string;
  back: string;
  // FSRS scheduling state (stored as JSON-serializable fields)
  fsrsDue?: string; // ISO date string
  fsrsStability?: number;
  fsrsDifficulty?: number;
  fsrsElapsedDays?: number;
  fsrsScheduledDays?: number;
  fsrsReps?: number;
  fsrsLapses?: number;
  fsrsState?: number; // 0=New,1=Learning,2=Review,3=Relearning
  fsrsLastReview?: string;
}

export type ConfidenceLevel = "low" | "medium" | "high";

export interface AnswerRecord {
  questionId: string;
  picked: "A" | "B" | "C" | "D" | null;
  correct: boolean;
  confidence?: ConfidenceLevel;
  msSpent?: number;
  /** Origin of this answer, e.g. "voice-tutor". Absent for normal in-app quizzes. */
  source?: string;
  /** Voice session id — used only for voice-tutor answers, for idempotency. */
  voiceSessionId?: string;
}

export interface QuizSession {
  id?: number; // auto-increment
  certId: string;
  startedAt: string; // ISO
  completedAt?: string;
  questionIds: string[];
  answers: Record<string, string>; // questionId -> chosen key (legacy compat)
  answerRecords?: AnswerRecord[]; // NEW: rich answer records with confidence
  score: number; // 0-100
  xpEarned: number;
  kind?: "mcq" | "pbq";
}

export interface PerfQuestion {
  id: string;
  certId: string;
  domainId: string;
  objectiveId: string;
  type: "drag-match";
  prompt: string;
  leftLabel: string;
  rightLabel: string;
  pairs: { left: string; right: string }[];
  explanation: string;
  difficulty: Difficulty;
}

export interface ReviewRecord {
  id?: number;
  flashcardId: string;
  certId: string;
  reviewedAt: string; // ISO
  rating: number; // 1=Again,2=Hard,3=Good,4=Easy
  xpEarned: number;
}

export interface MockExamSession {
  id: string; // uuid (matches examId)
  certId: string; // cert this exam was built for; absent on legacy rows → default secplus
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  totalQuestions: number;
  numCorrect: number;
  scorePercent: number;
  predictedScore: number; // 100-900
  passed: boolean;
  domainBreakdown: Record<string, { correct: number; total: number }>;
  // pbqAnswer: the user's right-column arrangement for a PBQ (so results can show
  // their answer vs the key). Optional — absent on MCQ rows and legacy sessions.
  questions: { qId: string; picked: string | null; correct: boolean; flagged: boolean; kind: "mcq" | "pbq"; pbqAnswer?: string[] }[];
}

export interface Acronym {
  id: string;        // "secplus-sy0-701:ac:AAA"
  certId: string;
  acronym: string;
  expansion: string;
  hint?: string;
  domainHint?: 1 | 2 | 3 | 4 | 5;
}

export interface DrillSession {
  id?: number; // auto-increment
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  correct: number;
  incorrect: number;
  skipped: number;
  attempts: { acronymId: string; userAnswer: string; correct: boolean; ms: number }[];
}

export interface QuestionReview {
  id?: number;            // auto-increment
  questionId: string;
  certId: string;
  reviewedAt: string;     // ISO
  rating: 1 | 2 | 3 | 4; // 1=Again 2=Hard 3=Good 4=Easy
  // FSRS state snapshot AFTER this review
  fsrsDue: string;        // ISO date when next review is due
  fsrsStability: number;
  fsrsDifficulty: number;
  fsrsElapsedDays: number;
  fsrsScheduledDays: number;
  fsrsReps: number;
  fsrsLapses: number;
  fsrsState: number;      // 0=New 1=Learning 2=Review 3=Relearning
}

export interface ReportedQuestion {
  id?: number; // auto-increment
  questionId: string;
  certId: string;
  reason: "wrong-answer" | "ambiguous" | "stale" | "typo" | "other";
  note?: string; // optional user-typed note
  reportedAt: string; // ISO
  syncedAt?: string; // ISO once synced to Supabase
}

export interface InProgressQuiz {
  id: "current"; // singleton — only one in-progress quiz at a time
  kind: "daily" | "fsrs" | "review" | "final-week" | "calibration";
  certId: string;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, "A" | "B" | "C" | "D">; // qId → picked
  confidences: Record<string, "low" | "medium" | "high">; // qId → confidence
  flagged?: string[]; // qIds flagged for review
  startedAt: string; // ISO
  updatedAt: string; // ISO — for staleness check
  mode?: string; // quiz mode (e.g. "fsrs", "daily") — persisted for correct resume URL
  params?: Record<string, string>; // extra URL params (n, videoId, etc.)
}

export interface Bookmark {
  id?: number;
  questionId: string;
  certId: string;
  bookmarkedAt: string; // ISO
  note?: string; // optional one-liner
}

export interface UserState {
  id: 1; // singleton
  xp: number;
  level: number;
  streak: number;
  lastStudyDate?: string; // YYYY-MM-DD
  totalStudyDays: number;
  contentVersion?: number;
  examDate?: string; // ISO date e.g. "2025-09-15"
  dailySessionMinutes?: 10 | 20 | 30;
  dailyGoalQuestions?: 5 | 10 | 15 | 20; // questions/day to keep the streak alive; default 10
  onboardedAt?: number; // ms epoch when onboarding completed
  confidencePrompt?: "always" | "off"; // show pre-reveal confidence picker
  streakFreezes?: number; // current freeze inventory, default 0
  streakFreezesEarnedTotal?: number; // lifetime earned
  lastFreezeAppliedAt?: string; // YYYY-MM-DD of last auto-apply
  lastFreezeEarnedAt?: string; // YYYY-MM-DD to avoid double-earning on same day
  predictedScore?: number; // cached 100-900 predicted exam score for leaderboard sync
  // Audio (Web Speech TTS) — all optional, no migration needed
  audioVoiceURI?: string;   // voiceURI from SpeechSynthesisVoice
  audioRate?: number;       // 0.75–1.5, default 1.0
  audioAutoplay?: boolean;  // hands-free flashcard auto-play
  // Voice tutor turn-detection mode: "auto" = hands-free (semantic_vad),
  // "ptt" = push-to-talk. Default "auto". Persisted so the choice sticks.
  voiceTurnMode?: "auto" | "ptt";
  // Active certification id (e.g. "secplus-sy0-701"). Absent → DEFAULT_CERT_ID.
  // Optional Dexie field, no index, no version bump needed.
  activeCertId?: string;
}

// ─── Database ────────────────────────────────────────────────────────────────

export class SecPlusDb extends Dexie {
  certifications!: Table<Certification, string>;
  domains!: Table<Domain, string>;
  objectives!: Table<Objective, string>;
  questions!: Table<Question, string>;
  flashcards!: Table<Flashcard, string>;
  quizSessions!: Table<QuizSession, number>;
  reviews!: Table<ReviewRecord, number>;
  userState!: Table<UserState, number>;
  perfQuestions!: Table<PerfQuestion, string>;
  mockExamSessions!: Table<MockExamSession, string>;
  acronyms!: Table<Acronym, string>;
  drillSessions!: Table<DrillSession, number>;
  questionReviews!: Table<QuestionReview, number>;
  reportedQuestions!: Table<ReportedQuestion, number>;
  inProgressQuizzes!: Table<InProgressQuiz, string>;
  bookmarks!: Table<Bookmark, number>;

  constructor() {
    super("SecPlusQuestDB");
    this.version(1).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
    });
    this.version(2).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
    });
    // v3: adds examDate, dailySessionMinutes, onboardedAt to UserState (no index changes needed)
    this.version(3).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
    });
    // v4: adds mockExamSessions table
    this.version(4).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
      mockExamSessions: "id, startedAt",
    });
    // v5: adds videoSource field on questions (no index changes — videoSource is a compound object)
    this.version(5).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
      mockExamSessions: "id, startedAt",
    });
    // v6: adds acronyms and drillSessions tables
    this.version(6).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
      mockExamSessions: "id, startedAt",
      acronyms: "id, certId, acronym",
      drillSessions: "++id, startedAt",
    });
    // v7: adds questionReviews table for per-question FSRS scheduling
    this.version(7).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
      mockExamSessions: "id, startedAt",
      acronyms: "id, certId, acronym",
      drillSessions: "++id, startedAt",
      questionReviews: "++id, questionId, certId, fsrsDue, reviewedAt",
    });
    // v8: adds streakFreezes, streakFreezesEarnedTotal, lastFreezeAppliedAt, lastFreezeEarnedAt to UserState (no index changes)
    this.version(8).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
      mockExamSessions: "id, startedAt",
      acronyms: "id, certId, acronym",
      drillSessions: "++id, startedAt",
      questionReviews: "++id, questionId, certId, fsrsDue, reviewedAt",
    });
    // v9: adds reportedQuestions table for user question-quality feedback
    this.version(9).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
      mockExamSessions: "id, startedAt",
      acronyms: "id, certId, acronym",
      drillSessions: "++id, startedAt",
      questionReviews: "++id, questionId, certId, fsrsDue, reviewedAt",
      reportedQuestions: "++id, questionId, certId, reportedAt",
    });
    // v10: adds inProgressQuizzes table for mid-quiz persistence / resume
    this.version(10).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
      mockExamSessions: "id, startedAt",
      acronyms: "id, certId, acronym",
      drillSessions: "++id, startedAt",
      questionReviews: "++id, questionId, certId, fsrsDue, reviewedAt",
      reportedQuestions: "++id, questionId, certId, reportedAt",
      inProgressQuizzes: "id",
    });
    // v11: adds flagged[] to InProgressQuiz (no index change — flagged is a stored array, not indexed)
    this.version(11).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
      mockExamSessions: "id, startedAt",
      acronyms: "id, certId, acronym",
      drillSessions: "++id, startedAt",
      questionReviews: "++id, questionId, certId, fsrsDue, reviewedAt",
      reportedQuestions: "++id, questionId, certId, reportedAt",
      inProgressQuizzes: "id",
    });
    // v12: adds bookmarks table — unique per questionId (&questionId prevents duplicates)
    this.version(12).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
      mockExamSessions: "id, startedAt",
      acronyms: "id, certId, acronym",
      drillSessions: "++id, startedAt",
      questionReviews: "++id, questionId, certId, fsrsDue, reviewedAt",
      reportedQuestions: "++id, questionId, certId, reportedAt",
      inProgressQuizzes: "id",
      bookmarks: "++id, &questionId, certId, bookmarkedAt",
    });
    // v13: adds mode + params fields to InProgressQuiz (no index changes — stored fields only)
    this.version(13).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
      mockExamSessions: "id, startedAt",
      acronyms: "id, certId, acronym",
      drillSessions: "++id, startedAt",
      questionReviews: "++id, questionId, certId, fsrsDue, reviewedAt",
      reportedQuestions: "++id, questionId, certId, reportedAt",
      inProgressQuizzes: "id",
      bookmarks: "++id, &questionId, certId, bookmarkedAt",
    });
    // v14: adds audioVoiceURI, audioRate, audioAutoplay to UserState (no index changes — stored fields only)
    this.version(14).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
      mockExamSessions: "id, startedAt",
      acronyms: "id, certId, acronym",
      drillSessions: "++id, startedAt",
      questionReviews: "++id, questionId, certId, fsrsDue, reviewedAt",
      reportedQuestions: "++id, questionId, certId, reportedAt",
      inProgressQuizzes: "id",
      bookmarks: "++id, &questionId, certId, bookmarkedAt",
    });
    // v15: adds voiceTurnMode to UserState (no index changes — stored field only)
    this.version(15).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
      mockExamSessions: "id, startedAt",
      acronyms: "id, certId, acronym",
      drillSessions: "++id, startedAt",
      questionReviews: "++id, questionId, certId, fsrsDue, reviewedAt",
      reportedQuestions: "++id, questionId, certId, reportedAt",
      inProgressQuizzes: "id",
      bookmarks: "++id, &questionId, certId, bookmarkedAt",
    });
    // v16: adds dailyGoalQuestions to UserState (no index changes — stored field only)
    this.version(16).stores({
      certifications: "id",
      domains: "id, certId",
      objectives: "id, certId, domainId",
      questions: "id, certId, domainId, objectiveId, difficulty",
      flashcards: "id, certId, domainId, objectiveId, fsrsDue",
      quizSessions: "++id, certId, startedAt",
      reviews: "++id, flashcardId, certId, reviewedAt",
      userState: "id",
      perfQuestions: "id, certId, domainId, objectiveId, difficulty",
      mockExamSessions: "id, startedAt",
      acronyms: "id, certId, acronym",
      drillSessions: "++id, startedAt",
      questionReviews: "++id, questionId, certId, fsrsDue, reviewedAt",
      reportedQuestions: "++id, questionId, certId, reportedAt",
      inProgressQuizzes: "id",
      bookmarks: "++id, &questionId, certId, bookmarkedAt",
    });
  }
}

export const db = new SecPlusDb();

// ─── Seed ────────────────────────────────────────────────────────────────────

let _seeded = false;

export async function seedDb(): Promise<void> {
  if (_seeded) return;

  const [{ SEED_DATA, CONTENT_VERSION, perfQuestions: secplusPbqs }, { ACRONYMS }, { newCertPbqs }, { newCertAcronyms }] = await Promise.all([
    import("@/content/seed"),
    import("@/content/acronyms"),
    import("@/content/pbq-newcerts-generated"),
    import("@/content/acronyms-newcerts"),
  ]);
  // Security+ PBQs (from seed) + Network+/A+ PBQs (separate bank). Distinct id
  // prefixes, so a plain concat is collision-free.
  const pbqs = [...secplusPbqs, ...newCertPbqs];

  const [count, existing] = await Promise.all([
    db.certifications.count(),
    db.userState.get(1),
  ]);

  const storedVersion = existing?.contentVersion ?? 0;
  const needsSeed = count === 0 || storedVersion < CONTENT_VERSION;

  if (!needsSeed) {
    _seeded = true;
    return;
  }

  await db.transaction(
    "rw",
    [
      db.certifications,
      db.domains,
      db.objectives,
      db.questions,
      db.flashcards,
      db.userState,
      db.perfQuestions,
      db.acronyms,
    ],
    async () => {
      await db.certifications.bulkPut(SEED_DATA.certifications);
      await db.domains.bulkPut(SEED_DATA.domains);
      await db.objectives.bulkPut(SEED_DATA.objectives);
      await db.questions.bulkPut(SEED_DATA.questions);
      // Prune retired/removed questions so corrected content drops actually
      // disappear for existing users (bulkPut only upserts, never deletes).
      // Content-only table — never touches user progress, answers, or FSRS.
      const seedQIds = new Set(SEED_DATA.questions.map((q) => q.id));
      const staleQIds = (await db.questions.toArray())
        .filter((q) => !seedQIds.has(q.id))
        .map((q) => q.id);
      if (staleQIds.length) await db.questions.bulkDelete(staleQIds);
      await db.acronyms.bulkPut([...ACRONYMS, ...newCertAcronyms]);

      // Preserve FSRS scheduling state on existing flashcards.
      // Only update content fields; never overwrite user progress.
      const existingCards = await db.flashcards
        .where("id")
        .anyOf(SEED_DATA.flashcards.map((c) => c.id))
        .toArray();
      const existingById = new Map(existingCards.map((c) => [c.id, c]));

      const mergedCards: Flashcard[] = SEED_DATA.flashcards.map((seedCard) => {
        const existing = existingById.get(seedCard.id);
        if (!existing) return seedCard;
        // Keep user FSRS state; take updated content fields from seed
        return {
          ...seedCard,
          fsrsDue: existing.fsrsDue,
          fsrsStability: existing.fsrsStability,
          fsrsDifficulty: existing.fsrsDifficulty,
          fsrsElapsedDays: existing.fsrsElapsedDays,
          fsrsScheduledDays: existing.fsrsScheduledDays,
          fsrsReps: existing.fsrsReps,
          fsrsLapses: existing.fsrsLapses,
          fsrsState: existing.fsrsState,
          fsrsLastReview: existing.fsrsLastReview,
        };
      });
      await db.flashcards.bulkPut(mergedCards);

      await db.perfQuestions.bulkPut(pbqs);

      const currentState = await db.userState.get(1);
      if (!currentState) {
        await db.userState.put({
          id: 1,
          xp: 0,
          level: 0,
          streak: 0,
          totalStudyDays: 0,
          contentVersion: CONTENT_VERSION,
        });
      } else {
        await db.userState.put({ ...currentState, contentVersion: CONTENT_VERSION });
      }
    }
  );

  _seeded = true;
}
