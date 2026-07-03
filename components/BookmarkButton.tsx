"use client";

import { useEffect, useState } from "react";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";
import { enqueue } from "@/lib/sync/engine";

interface BookmarkButtonProps {
  questionId: string;
  certId?: string;
}

export default function BookmarkButton({
  questionId,
  certId = "secplus-sy0-701",
}: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isBookmarked(questionId).then((v) => {
      setBookmarked(v);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [questionId]);

  async function handleToggle() {
    // Optimistic update
    const next = !bookmarked;
    setBookmarked(next);
    try {
      const actual = await toggleBookmark(questionId, certId);
      setBookmarked(actual);
      if (actual) {
        enqueue("insert_bookmark", {
          user_id: "",
          question_id: questionId,
          cert_id: certId,
          bookmarked_at: new Date().toISOString(),
        }).catch(() => {});
      } else {
        enqueue("delete_bookmark", { question_id: questionId }).catch(() => {});
      }
    } catch {
      // Revert on error
      setBookmarked(!next);
    }
  }

  if (loading) return null;

  return (
    <button
      onClick={handleToggle}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark this question"}
      style={{
        background: "none",
        border: "none",
        // Vertical padding gives a ~40px tappable height without changing the
        // inline text look; negative margin keeps row spacing tight.
        padding: "10px 4px",
        margin: "-10px -4px",
        minHeight: "40px",
        fontSize: "12px",
        color: bookmarked ? "var(--accent)" : "var(--fg-subtle, var(--fg-muted))",
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.04em",
        cursor: "pointer",
        opacity: bookmarked ? 1 : 0.6,
        transition: "opacity 150ms, color 150ms",
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = bookmarked ? "1" : "0.6"; }}
    >
      <span style={{ fontSize: "13px", lineHeight: 1 }}>{bookmarked ? "★" : "☆"}</span>
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </button>
  );
}
