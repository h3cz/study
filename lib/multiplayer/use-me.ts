// Client hook: the signed-in player's multiplayer identity — id, display name,
// avatar (from profiles), and active cert (from local user state). Shared by the
// hub and duel screens.
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { db } from "@/lib/db";
import { getActiveCertId } from "@/lib/certs";
import { resolveDisplayName } from "@/lib/leaderboard";

export interface Me {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  certId: string;
}

export interface UseMe {
  me: Me | null;
  /** undefined while auth is still resolving; null once known signed-out. */
  signedIn: boolean | undefined;
}

export function useMe(): UseMe {
  const [me, setMe] = useState<Me | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load(userId: string) {
      const [{ data: profile }, state] = await Promise.all([
        supabase.from("profiles").select("display_name, avatar_url").eq("user_id", userId).single(),
        db.userState.get(1),
      ]);
      if (cancelled) return;
      setMe({
        userId,
        displayName: resolveDisplayName(profile?.display_name, userId),
        avatarUrl: profile?.avatar_url ?? null,
        certId: getActiveCertId(state),
      });
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        setSignedIn(true);
        void load(session.user.id);
      } else {
        setSignedIn(false);
        setMe(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { me, signedIn };
}
