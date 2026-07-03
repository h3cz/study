// Co-study room — Supabase Realtime presence + broadcast. No tables, fully
// ephemeral: who's here (presence), what they're doing (activity in presence
// meta), a live activity feed and lightweight chat (broadcast). This is the
// "chill" half — no scoring, never touches the learning engine.
"use client";

import { createClient } from "@/lib/supabase/client";

export interface RoomMe {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface RoomMember extends RoomMe {
  activity: string;
  joinedAt: number;
}

export interface FeedEvent {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  at: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  body: string;
  at: number;
}

export interface RoomHandlers {
  onMembers?: (members: RoomMember[]) => void;
  onFeed?: (e: FeedEvent) => void;
  onChat?: (m: ChatMessage) => void;
  /** Channel failed to connect/authorize (e.g. Realtime Authorization misconfigured). */
  onError?: (status: string) => void;
}

export interface RoomHandle {
  setActivity: (activity: string) => void;
  sendFeed: (text: string) => void;
  sendChat: (body: string) => void;
  leave: () => void;
}

function rid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function joinRoom(certId: string, me: RoomMe, handlers: RoomHandlers): RoomHandle {
  const supabase = createClient();
  let activity = "studying";

  // `private: true` routes presence/broadcast through Realtime Authorization, gated
  // by the realtime.messages RLS policies on the `study-room:*` topic (migration
  // 20260611000000) — only authenticated users can watch or post, no anon spoofing.
  const channel = supabase.channel(`study-room:${certId}`, {
    config: { private: true, presence: { key: me.userId } },
  });

  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState() as Record<string, Array<Record<string, unknown>>>;
    const members: RoomMember[] = [];
    for (const presences of Object.values(state)) {
      const p = presences[0]; // one entry per user key
      if (!p) continue;
      members.push({
        userId: String(p.userId ?? ""),
        displayName: String(p.displayName ?? "anon"),
        avatarUrl: (p.avatarUrl as string | null) ?? null,
        activity: String(p.activity ?? "studying"),
        joinedAt: Number(p.joinedAt ?? Date.now()),
      });
    }
    members.sort((a, b) => a.joinedAt - b.joinedAt);
    handlers.onMembers?.(members);
  });

  channel.on("broadcast", { event: "feed" }, ({ payload }) => {
    handlers.onFeed?.(payload as FeedEvent);
  });
  channel.on("broadcast", { event: "chat" }, ({ payload }) => {
    handlers.onChat?.(payload as ChatMessage);
  });

  const joinedAt = Date.now();
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      void channel.track({ ...me, activity, joinedAt });
    } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      // Private-channel authorization failed (e.g. Realtime Authorization not
      // configured) or the connection timed out. Surface it instead of a silent
      // dead room so the issue is diagnosable rather than looking like "no one's here".
      handlers.onError?.(status);
      if (typeof console !== "undefined") {
        console.error(`[co-study] room "${certId}" channel ${status}`);
      }
    }
  });

  return {
    setActivity(next: string) {
      activity = next;
      void channel.track({ ...me, activity, joinedAt });
    },
    sendFeed(text: string) {
      const e: FeedEvent = { id: rid(), userId: me.userId, displayName: me.displayName, text, at: Date.now() };
      void channel.send({ type: "broadcast", event: "feed", payload: e });
      handlers.onFeed?.(e); // echo locally (broadcast doesn't loop back to sender)
    },
    sendChat(body: string) {
      const m: ChatMessage = { id: rid(), userId: me.userId, displayName: me.displayName, body, at: Date.now() };
      void channel.send({ type: "broadcast", event: "chat", payload: m });
      handlers.onChat?.(m);
    },
    leave() {
      void channel.untrack();
      supabase.removeChannel(channel);
    },
  };
}
