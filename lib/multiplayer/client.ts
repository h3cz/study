// Client-side duel API: thin fetch wrappers over the server routes + Supabase
// Realtime subscriptions for live match state. All authority lives on the
// server; this module only sends intents and listens for the resulting truth.
"use client";

import { createClient } from "@/lib/supabase/client";
import { rowToMatch, rowToAnswer, type DuelMatch, type DuelAnswer } from "./types";

export type DuelSettings = {
  numRounds: number;
  roundLimitMs: number;
};

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? `request_failed_${res.status}`);
  return json as T;
}

export async function createInvite(certId: string, settings?: DuelSettings): Promise<DuelMatch> {
  return (await post<{ match: DuelMatch }>("/api/duel/create", { certId, ...settings })).match;
}

export async function joinByCode(code: string): Promise<DuelMatch> {
  return (await post<{ match: DuelMatch }>("/api/duel/join", { code })).match;
}

/** Enqueue for quick-match. Returns a match when paired, or null while waiting. */
export async function quickMatch(certId: string, settings?: DuelSettings): Promise<DuelMatch | null> {
  const r = await post<{ match?: DuelMatch; pending?: boolean }>("/api/duel/quickmatch", { certId, ...settings });
  return r.match ?? null;
}

export async function leaveQueue(): Promise<void> {
  await fetch("/api/duel/quickmatch", { method: "DELETE" });
}

export async function fetchMatch(id: string): Promise<DuelMatch> {
  const res = await fetch(`/api/duel/match?id=${encodeURIComponent(id)}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? "match_failed");
  if (!json?.match) throw new Error("match_failed");
  return json.match as DuelMatch;
}

export async function submitAnswer(matchId: string, round: number, picked: string): Promise<DuelMatch> {
  return (await post<{ match: DuelMatch }>("/api/duel/answer", { matchId, round, picked })).match;
}

export async function advance(matchId: string): Promise<DuelMatch> {
  return (await post<{ match: DuelMatch }>("/api/duel/advance", { matchId })).match;
}

export async function readyNext(matchId: string, round: number): Promise<DuelMatch> {
  return (await post<{ match: DuelMatch }>("/api/duel/next", { matchId, round })).match;
}

/** Start a rematch vs the same opponent. Returns the new (active) match. */
export async function requestRematch(matchId: string): Promise<DuelMatch> {
  return (await post<{ match: DuelMatch }>("/api/duel/rematch", { matchId })).match;
}

/**
 * Read every recorded answer for a finished match (both players' rows), for the
 * post-duel round-by-round recap. RLS restricts this to the two participants.
 */
export async function fetchAnswers(matchId: string): Promise<DuelAnswer[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("duel_answers")
    .select("*")
    .eq("match_id", matchId)
    .order("round_index", { ascending: true });
  if (error || !data) return [];
  return data.map(rowToAnswer);
}

/**
 * Subscribe to live updates for a match: every UPDATE to the match row and every
 * answer INSERT. Returns an unsubscribe function.
 */
export function subscribeMatch(
  matchId: string,
  handlers: {
    onMatch?: (m: DuelMatch) => void;
    onAnswer?: (a: DuelAnswer) => void;
    /** A rematch of this match was created — both participants get this. */
    onRematch?: (m: DuelMatch) => void;
  }
): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel(`duel:${matchId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "duel_matches", filter: `id=eq.${matchId}` },
      (payload) => handlers.onMatch?.(rowToMatch(payload.new))
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "duel_answers", filter: `match_id=eq.${matchId}` },
      (payload) => handlers.onAnswer?.(rowToAnswer(payload.new))
    )
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "duel_matches", filter: `rematch_of=eq.${matchId}` },
      (payload) => handlers.onRematch?.(rowToMatch(payload.new))
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * While waiting in the quick-match queue, listen for the match that gets created
 * with this user as host (the opponent's pairing call inserts it). Returns an
 * unsubscribe function.
 */
export function subscribeQuickMatch(userId: string, onMatched: (m: DuelMatch) => void): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel(`duel-lobby:${userId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "duel_matches", filter: `host_id=eq.${userId}` },
      (payload) => {
        const m = rowToMatch(payload.new);
        if (m.status === "active") onMatched(m);
      }
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
