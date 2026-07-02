"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { getCert } from "@/lib/certs";
import {
  joinRoom,
  type RoomHandle,
  type RoomMember,
  type FeedEvent,
  type ChatMessage,
} from "@/lib/multiplayer/room";
import { pomodoroAt, formatRemaining, type PomodoroState } from "@/lib/multiplayer/pomodoro";
import type { Me } from "@/lib/multiplayer/use-me";

const REACTIONS = ["🔥", "💪", "🧠", "👏", "☕"];

/**
 * The ambient "study alongside" room: a shared wall-clock Pomodoro, live
 * presence, an activity feed, and lightweight chat/reactions. Pure Realtime —
 * no scoring, never touches the learning engine.
 */
export function CoStudyRoom({ me }: { me: Me }) {
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [feed, setFeed] = useState<FeedEvent[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pomo, setPomo] = useState<PomodoroState>(() => pomodoroAt(Date.now()));

  const handleRef = useRef<RoomHandle | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const pushFeed = useCallback((e: FeedEvent) => {
    setFeed((prev) => [...prev.slice(-19), e]);
  }, []);

  // Shared Pomodoro tick (purely derived from the clock — always in sync).
  useEffect(() => {
    const t = setInterval(() => setPomo(pomodoroAt(Date.now())), 1000);
    return () => clearInterval(t);
  }, []);

  // Surface the shared Pomodoro phase as this member's presence activity, so the
  // rail shows who's heads-down vs. on a break.
  useEffect(() => {
    handleRef.current?.setActivity(pomo.phase === "focus" ? "in focus" : "on break");
  }, [pomo.phase]);

  // Join the room for the active cert.
  useEffect(() => {
    seenRef.current = new Set([me.userId]); // don't announce ourselves
    const handle = joinRoom(me.certId, me, {
      onMembers: (list) => {
        setMembers(list);
        // Derive an ambient feed entry when someone new appears.
        for (const m of list) {
          if (!seenRef.current.has(m.userId)) {
            seenRef.current.add(m.userId);
            pushFeed({
              id: `join-${m.userId}-${Date.now()}`,
              userId: m.userId,
              displayName: m.displayName,
              text: "joined the room",
              at: Date.now(),
            });
          }
        }
      },
      onFeed: (e) => pushFeed(e),
      onChat: (m) => setChat((prev) => [...prev.slice(-49), m]),
    });
    handleRef.current = handle;
    return () => handle.leave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.userId, me.certId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ block: "nearest" });
  }, [chat]);

  function sendChat() {
    const body = draft.trim().slice(0, 240);
    if (!body) return;
    handleRef.current?.sendChat(body);
    setDraft("");
  }

  function react(emoji: string) {
    handleRef.current?.sendFeed(`reacted ${emoji}`);
  }

  const certName = getCert(me.certId).name;
  const isFocus = pomo.phase === "focus";
  const ring = 2 * Math.PI * 34;

  return (
    <section
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        background: "var(--surface)",
        overflow: "hidden",
      }}
    >
      {/* Header: shared Pomodoro + presence count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: 16,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}
          role="timer"
          aria-label={`${isFocus ? "Focus" : "Break"} — ${formatRemaining(pomo.remainingMs)} remaining`}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }} aria-hidden>
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="3" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke={isFocus ? "var(--accent)" : "var(--success)"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={ring}
              strokeDashoffset={ring * pomo.progress}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontSize: 20,
              color: "var(--fg)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatRemaining(pomo.remainingMs)}
          </div>
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: isFocus ? "var(--accent)" : "var(--success)",
            }}
          >
            {isFocus ? "Focus" : "Break"}
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--fg)", marginTop: 2 }}>
            {certName} study room
          </div>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>
            {members.length} {members.length === 1 ? "person" : "people"} studying now
          </div>
        </div>
      </div>

      {/* Presence rail */}
      <div style={{ display: "flex", gap: 8, padding: "12px 16px", flexWrap: "wrap", borderBottom: "1px solid var(--border)" }}>
        {members.length === 0 && (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--fg-muted)" }}>
            Connecting…
          </span>
        )}
        {members.map((m) => (
          <div
            key={m.userId}
            title={`${m.displayName} — ${m.activity}`}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <Avatar url={m.avatarUrl} name={m.displayName} size={24} />
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: m.userId === me.userId ? "var(--accent)" : "var(--fg-muted)",
                maxWidth: 90,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {m.userId === me.userId ? "You" : m.displayName}
            </span>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div style={{ maxHeight: 96, overflowY: "auto", padding: "8px 16px", borderBottom: "1px solid var(--border)" }}>
        {feed.length === 0 ? (
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--fg-subtle)" }}>
            Room activity will show up here.
          </div>
        ) : (
          feed.map((e) => (
            <div key={e.id} style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.6 }}>
              <span style={{ color: "var(--fg)" }}>{e.userId === me.userId ? "You" : e.displayName}</span> {e.text}
            </div>
          ))
        )}
      </div>

      {/* Chat */}
      <div style={{ maxHeight: 140, overflowY: "auto", padding: "10px 16px" }}>
        {chat.map((m) => (
          <div key={m.id} style={{ fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6 }}>
            <span style={{ color: m.userId === me.userId ? "var(--accent)" : "var(--fg-muted)", fontWeight: 500 }}>
              {m.userId === me.userId ? "You" : m.displayName}
            </span>
            <span style={{ color: "var(--fg)" }}>: {m.body}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Composer + reactions */}
      <div style={{ display: "flex", gap: 6, padding: "8px 12px", borderTop: "1px solid var(--border)", alignItems: "center" }}>
        {REACTIONS.map((r) => (
          <button
            key={r}
            onClick={() => react(r)}
            aria-label={`React ${r}`}
            title={`React ${r}`}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              padding: "8px",
              borderRadius: "var(--r-sm)",
            }}
          >
            {r}
          </button>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendChat();
          }}
          placeholder="Say something…"
          aria-label="Chat message"
          maxLength={240}
          style={{
            flex: 1,
            minWidth: 0,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-sm)",
            color: "var(--fg)",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            padding: "6px 10px",
            outline: "none",
          }}
        />
        <button
          onClick={sendChat}
          style={{
            background: "var(--accent)",
            color: "var(--accent-fg)",
            border: "none",
            borderRadius: "var(--r-sm)",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: 500,
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </section>
  );
}
