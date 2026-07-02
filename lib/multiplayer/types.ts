// Shared multiplayer types, used by both server routes and client code.

export type DuelStatus = "waiting" | "active" | "done" | "abandoned";
export type DuelMode = "invite" | "quick";

/** A duel match row, as returned to clients (no answer keys are ever included). */
export interface DuelMatch {
  id: string;
  certId: string;
  status: DuelStatus;
  mode: DuelMode;
  inviteCode: string | null;
  hostId: string;
  guestId: string | null;
  questionIds: string[];
  numRounds: number;
  roundLimitMs: number;
  basePoints: number;
  currentRound: number;
  roundStartedAt: string | null;
  hostScore: number;
  guestScore: number;
  hostCorrect: number;
  guestCorrect: number;
  hostReadyRound: number;
  guestReadyRound: number;
  winnerId: string | null;
  endedAt: string | null;
}

/** One recorded answer, visible to both participants for the live scoreboard. */
export interface DuelAnswer {
  matchId: string;
  userId: string;
  roundIndex: number;
  questionId: string;
  picked: string | null;
  isCorrect: boolean;
  msElapsed: number;
  points: number;
}

/** Map a snake_case DB row into the camelCase client shape. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToMatch(r: any): DuelMatch {
  return {
    id: r.id,
    certId: r.cert_id,
    status: r.status,
    mode: r.mode,
    inviteCode: r.invite_code ?? null,
    hostId: r.host_id,
    guestId: r.guest_id ?? null,
    questionIds: Array.isArray(r.question_ids) ? r.question_ids : [],
    numRounds: r.num_rounds,
    roundLimitMs: r.round_limit_ms,
    basePoints: r.base_points,
    currentRound: r.current_round,
    roundStartedAt: r.round_started_at ?? null,
    hostScore: r.host_score ?? 0,
    guestScore: r.guest_score ?? 0,
    hostCorrect: r.host_correct ?? 0,
    guestCorrect: r.guest_correct ?? 0,
    hostReadyRound: r.host_ready_round ?? -1,
    guestReadyRound: r.guest_ready_round ?? -1,
    winnerId: r.winner_id ?? null,
    endedAt: r.ended_at ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToAnswer(r: any): DuelAnswer {
  return {
    matchId: r.match_id,
    userId: r.user_id,
    roundIndex: r.round_index,
    questionId: r.question_id,
    picked: r.picked ?? null,
    isCorrect: !!r.is_correct,
    msElapsed: r.ms_elapsed ?? 0,
    points: r.points ?? 0,
  };
}
