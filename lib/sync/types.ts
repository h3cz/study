/** Mirrors the Postgres user_state table columns (snake_case). */
export interface RemoteUserState {
  user_id: string;
  xp: number;
  level: number;
  streak: number;
  last_study_date: string | null;
  total_study_days: number;
  predicted_score: number | null;
  updated_at: string;
  streak_freezes?: number;
  streak_freezes_earned_total?: number;
  last_freeze_applied_at?: string | null;
  last_freeze_earned_at?: string | null;
  daily_goal_questions?: number | null;
}

/** Mirrors the Postgres quiz_sessions table. */
export interface RemoteQuizSession {
  id?: string; // uuid, server-generated
  user_id: string;
  cert_id: string;
  started_at: string;
  completed_at: string | null;
  score_pct: number | null;
  num_questions: number;
  num_correct: number;
  questions: RemoteQuizQuestion[];
}

export interface RemoteQuizQuestion {
  questionId: string;
  objectiveId: string;
  picked: string | null;
  correct: boolean;
}

/** Mirrors the Postgres flashcard_reviews table. */
export interface RemoteFlashcardReview {
  id?: string; // uuid, server-generated
  user_id: string;
  flashcard_id: string;
  cert_id: string;
  objective_id: string;
  reviewed_at: string;
  rating: number;
  fsrs_state: Record<string, unknown>;
}

/** Mirrors the Postgres mock_exam_sessions table. */
export interface RemoteMockExamSession {
  id: string; // uuid
  user_id: string;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  total_questions: number;
  num_correct: number;
  score_percent: number;
  predicted_score: number;
  passed: boolean;
  domain_breakdown: Record<string, { correct: number; total: number }>;
  questions: { qId: string; picked: string | null; correct: boolean; flagged: boolean; kind: "mcq" | "pbq"; pbqAnswer?: string[] }[];
}

/** Mirrors the Postgres drill_sessions table. */
export interface RemoteDrillSession {
  id?: string; // uuid, server-generated
  user_id: string;
  started_at: string;
  completed_at: string;
  duration_seconds: number;
  correct: number;
  incorrect: number;
  skipped: number;
  attempts: { acronymId: string; userAnswer: string; correct: boolean; ms: number }[];
}

/** Mirrors the Postgres reported_questions table. */
export interface RemoteQuestionReport {
  user_id: string;
  question_id: string;
  cert_id: string;
  reason: string;
  note?: string;
  reported_at: string;
}

/** Mirrors the Postgres question_reviews table. */
export interface RemoteQuestionReview {
  id?: string; // uuid, server-generated
  user_id: string;
  question_id: string;
  cert_id: string;
  reviewed_at: string;
  rating: number;
  fsrs_state: Record<string, unknown>;
}

/** Mirrors the Postgres bookmarks table. */
export interface RemoteBookmark {
  user_id: string;
  question_id: string;
  cert_id: string;
  bookmarked_at: string;
  note?: string;
}

/** Mirrors the Postgres user_cert_scores table (per-cert predicted score). */
export interface RemoteCertScore {
  user_id?: string;
  cert_id: string;
  predicted_score: number | null;
  xp: number;
}

/** Operations that can be enqueued for cloud sync. */
export type SyncOp = "upsert_user_state" | "upsert_cert_score" | "insert_quiz_session" | "insert_flashcard_review" | "insert_mock_exam" | "insert_drill_session" | "insert_question_report" | "insert_question_review" | "insert_bookmark" | "delete_bookmark";

/** A pending write stored in Dexie's sync_queue table. */
export interface SyncQueueItem {
  id?: number; // auto-increment
  op: SyncOp;
  payload: RemoteUserState | RemoteCertScore | RemoteQuizSession | RemoteFlashcardReview | RemoteMockExamSession | RemoteDrillSession | RemoteQuestionReport | RemoteQuestionReview | RemoteBookmark | { question_id: string };
  createdAt: string;
  retries: number;
}
