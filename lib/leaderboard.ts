"use client";

import { createClient } from "@/lib/supabase/client";

export interface LeaderRow {
  userId: string;
  displayName: string;
  predictedScore: number | null;
  avatarUrl: string | null;
  isMe: boolean;
  /** Total XP — populated for the global (XP-ranked) board. */
  xp?: number;
}

export interface CohortInfo {
  id: string;
  name: string;
  inviteCode: string;
  memberCount: number;
  isOwner: boolean;
}

/** Derive display name: profiles.display_name if set, else anon-XXXX from userId. */
export function resolveDisplayName(
  displayName: string | null | undefined,
  userId: string
): string {
  if (displayName && displayName.trim().length > 0) return displayName.trim();
  return `anon-${userId.slice(0, 4)}`;
}

/** Generate a 6-char base36 invite code (uppercase, no ambiguous chars 0/O/1/I). */
export function generateInviteCode(): string {
  const CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => CHARS[b % CHARS.length])
    .join("");
}

/**
 * Public global leaderboard. Top 100 by predicted_score desc.
 * Only opted-in users (is_publicly_listed = true) with a non-null score.
 */
export async function fetchPublicLeaderboard(
  currentUserId: string | null
): Promise<LeaderRow[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("public_leaderboard")
      .select("user_id, predicted_score, display_name, avatar_url")
      .not("predicted_score", "is", null)
      .order("predicted_score", { ascending: false })
      .limit(100);

    if (error) return [];

    return (data ?? []).map((row) => ({
      userId: row.user_id,
      displayName: resolveDisplayName(row.display_name, row.user_id),
      predictedScore: row.predicted_score,
      avatarUrl: row.avatar_url ?? null,
      isMe: currentUserId !== null && row.user_id === currentUserId,
    }));
  } catch {
    return [];
  }
}

/**
 * Public GLOBAL leaderboard. Top 100 by total XP desc.
 * XP is a single global accumulator across all certs, so it's comparable across
 * people regardless of which cert they're studying. Only opted-in users
 * (is_publicly_listed = true) appear.
 */
export async function fetchGlobalLeaderboard(
  currentUserId: string | null
): Promise<LeaderRow[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("public_leaderboard")
      .select("user_id, xp, predicted_score, display_name, avatar_url")
      .order("xp", { ascending: false })
      .limit(100);

    if (error) return [];

    return (data ?? []).map((row) => ({
      userId: row.user_id,
      displayName: resolveDisplayName(row.display_name, row.user_id),
      predictedScore: row.predicted_score ?? null,
      xp: row.xp ?? 0,
      avatarUrl: row.avatar_url ?? null,
      isMe: currentUserId !== null && row.user_id === currentUserId,
    }));
  } catch {
    return [];
  }
}

/**
 * Public PER-CERT leaderboard. Top 100 by that cert's predicted_score desc.
 * Only opted-in users (is_publicly_listed = true) with a non-null score appear.
 */
export async function fetchCertLeaderboard(
  certId: string,
  currentUserId: string | null
): Promise<LeaderRow[]> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("public_cert_leaderboard")
      .select("user_id, cert_id, predicted_score, xp, display_name, avatar_url")
      .eq("cert_id", certId)
      .not("predicted_score", "is", null)
      .order("predicted_score", { ascending: false })
      .limit(100);

    if (error) return [];

    return (data ?? []).map((row) => ({
      userId: row.user_id,
      displayName: resolveDisplayName(row.display_name, row.user_id),
      predictedScore: row.predicted_score,
      xp: row.xp ?? 0,
      avatarUrl: row.avatar_url ?? null,
      isMe: currentUserId !== null && row.user_id === currentUserId,
    }));
  } catch {
    return [];
  }
}

/**
 * Cohort-specific leaderboard. All members sorted by predicted_score desc.
 * Members with null predicted_score are excluded.
 */
export async function fetchCohortLeaderboard(
  cohortId: string,
  currentUserId: string | null
): Promise<LeaderRow[]> {
  const supabase = createClient();
  try {
    // Get all members of this cohort
    const { data: members, error: membersError } = await supabase
      .from("cohort_members")
      .select("user_id")
      .eq("cohort_id", cohortId);

    if (membersError || !members || members.length === 0) return [];

    const userIds = members.map((m) => m.user_id);

    // Fetch user_state for all members
    const { data: states, error: statesError } = await supabase
      .from("user_state")
      .select("user_id, predicted_score")
      .in("user_id", userIds)
      .not("predicted_score", "is", null)
      .order("predicted_score", { ascending: false });

    if (statesError || !states) return [];

    // Fetch profiles for display names + avatars
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds);

    const profileMap = new Map<
      string,
      { displayName: string | null; avatarUrl: string | null }
    >(
      (profiles ?? []).map((p) => [
        p.user_id,
        { displayName: p.display_name, avatarUrl: p.avatar_url ?? null },
      ])
    );

    return states.map((row) => {
      const profile = profileMap.get(row.user_id);
      return {
        userId: row.user_id,
        displayName: resolveDisplayName(profile?.displayName, row.user_id),
        predictedScore: row.predicted_score,
        avatarUrl: profile?.avatarUrl ?? null,
        isMe: currentUserId !== null && row.user_id === currentUserId,
      };
    });
  } catch {
    return [];
  }
}

/** Get all cohorts the current user owns or is a member of. */
export async function fetchMyCohorts(): Promise<CohortInfo[]> {
  const supabase = createClient();
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return [];

    const userId = session.user.id;

    // Get cohorts user is a member of (includes owned ones since owner is also a member)
    const { data: memberships, error: membershipsError } = await supabase
      .from("cohort_members")
      .select("cohort_id")
      .eq("user_id", userId);

    if (membershipsError || !memberships || memberships.length === 0) return [];

    const cohortIds = memberships.map((m) => m.cohort_id);

    const { data: cohorts, error: cohortsError } = await supabase
      .from("cohorts")
      .select("id, name, owner_id, invite_code")
      .in("id", cohortIds);

    if (cohortsError || !cohorts) return [];

    // Get member counts
    const { data: allMembers } = await supabase
      .from("cohort_members")
      .select("cohort_id")
      .in("cohort_id", cohortIds);

    const countMap = new Map<string, number>();
    for (const m of allMembers ?? []) {
      countMap.set(m.cohort_id, (countMap.get(m.cohort_id) ?? 0) + 1);
    }

    return cohorts.map((c) => ({
      id: c.id,
      name: c.name,
      inviteCode: c.invite_code,
      memberCount: countMap.get(c.id) ?? 0,
      isOwner: c.owner_id === userId,
    }));
  } catch {
    return [];
  }
}

/** Create a new cohort. Owner is auto-added as a member. Returns the invite code. */
export async function createCohort(name: string): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const inviteCode = generateInviteCode();

  const { data: cohort, error: cohortError } = await supabase
    .from("cohorts")
    .insert({ name: name.trim(), owner_id: session.user.id, invite_code: inviteCode })
    .select("id")
    .single();

  if (cohortError || !cohort) throw new Error(cohortError?.message ?? "Failed to create cohort");

  // Add owner as member
  await supabase
    .from("cohort_members")
    .insert({ cohort_id: cohort.id, user_id: session.user.id });

  return inviteCode;
}

/** Join a cohort by invite code. Returns the cohort id. No-op if already a member. */
export async function joinCohort(inviteCode: string): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data: cohort, error: cohortError } = await supabase
    .from("cohorts")
    .select("id")
    .eq("invite_code", inviteCode.toUpperCase().trim())
    .single();

  if (cohortError || !cohort) throw new Error("Invalid invite code");

  // Check member count cap (100)
  const { count } = await supabase
    .from("cohort_members")
    .select("user_id", { count: "exact", head: true })
    .eq("cohort_id", cohort.id);

  if ((count ?? 0) >= 100) throw new Error("Cohort is full (max 100 members)");

  // Idempotent: upsert so joining twice is a no-op
  const { error: joinError } = await supabase
    .from("cohort_members")
    .upsert(
      { cohort_id: cohort.id, user_id: session.user.id },
      { onConflict: "cohort_id,user_id" }
    );

  if (joinError) throw new Error(joinError.message);

  return cohort.id;
}

/** Leave a cohort. Owners cannot leave — they must delete. */
export async function leaveCohort(cohortId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  // Verify not owner
  const { data: cohort } = await supabase
    .from("cohorts")
    .select("owner_id")
    .eq("id", cohortId)
    .single();

  if (cohort?.owner_id === session.user.id) {
    throw new Error("Owners cannot leave — delete the cohort instead");
  }

  const { error } = await supabase
    .from("cohort_members")
    .delete()
    .eq("cohort_id", cohortId)
    .eq("user_id", session.user.id);

  if (error) throw new Error(error.message);
}

/** Delete a cohort (owner only). Cascades to members. */
export async function deleteCohort(cohortId: string): Promise<void> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("cohorts")
    .delete()
    .eq("id", cohortId)
    .eq("owner_id", session.user.id);

  if (error) throw new Error(error.message);
}
