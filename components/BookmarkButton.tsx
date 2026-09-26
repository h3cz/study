"use client";
import { useEffect, useState } from "react";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";
import { enqueue } from "@/lib/sync/engine";
export default function BookmarkButton({ questionId, certId = "secplus-sy0-701" }: { questionId: string; certId?: string }) {
  const [bookmark, setBookmark] = useState<{ id: string; value: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ id: string; text: string } | null>(null);
  const ready = bookmark?.id === questionId;
  useEffect(() => {
    let active = true;
    void isBookmarked(questionId).then(value => { if (active) setBookmark({ id: questionId, value }); })
      .catch(() => { if (active) setStatus({ id: questionId, text: "Bookmark unavailable. Reload to try again." }); });
    return () => { active = false; };
  }, [questionId]);
  async function toggle() {
    if (!ready || busy) return;
    setBusy(true);
    try {
      const actual = await toggleBookmark(questionId, certId);
      setBookmark({ id: questionId, value: actual });
      setStatus({ id: questionId, text: actual ? "Saved on this device." : "Removed on this device." });
      try {
        if (actual) await enqueue("insert_bookmark", { user_id: "", question_id: questionId, cert_id: certId, bookmarked_at: new Date().toISOString() });
        else await enqueue("delete_bookmark", { question_id: questionId });
      } catch { setStatus({ id: questionId, text: "Local change saved; cloud sync could not be queued." }); }
    } catch { setStatus({ id: questionId, text: "Couldn’t save the bookmark. Try again." }); }
    finally { setBusy(false); }
  }
  return <span className="inline-flex flex-wrap items-center gap-2">
    <button onClick={() => void toggle()} disabled={!ready || busy} aria-pressed={ready && bookmark.value}
      aria-label={ready && bookmark.value ? "Remove bookmark" : "Bookmark this question"}
      className="min-h-11 min-w-11 px-2 text-sm font-mono text-[var(--fg-muted)] disabled:opacity-60">
      {ready && bookmark.value ? "★ Bookmarked" : "☆ Bookmark"}
    </button>
    <span role="status" className="text-xs text-[var(--fg-muted)]">{status?.id === questionId ? status.text : ""}</span>
  </span>;
}
