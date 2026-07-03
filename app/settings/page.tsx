"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import type { User } from "@supabase/supabase-js";
import { db, seedDb } from "@/lib/db";
import type { UserState } from "@/lib/db";
import { ttsAvailable, listVoices } from "@/lib/tts";
import { createClient } from "@/lib/supabase/client";
import { syncDb } from "@/lib/sync/queue";
import StudyBuddyKeys from "@/components/StudyBuddyKeys";
import { subscribeToPush, unsubscribeFromPush, isPushSupported } from "@/lib/push";
import { Avatar } from "@/components/Avatar";
import { CertSwitcher } from "@/components/CertSwitcher";
import { getActiveCertId, getCert } from "@/lib/certs";

// ─── Helpers ─────────────────────────────────────────────────────────────────

type SessionLength = 10 | 20 | 30;
type DailyGoal = 5 | 10 | 15 | 20;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        padding: "20px 24px",
      }}
    >
      <h2
        style={{
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          fontFamily: "var(--font-sans)",
          marginBottom: "16px",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({
  label,
  sublabel,
  children,
}: {
  label: string;
  sublabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between gap-4"
      style={{ minHeight: "40px" }}
    >
      <div>
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {label}
        </p>
        {sublabel && (
          <p
            style={{
              fontSize: "12px",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-sans)",
              marginTop: "2px",
            }}
          >
            {sublabel}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{ height: "1px", background: "var(--border)", margin: "8px 0" }}
    />
  );
}

function formatDateLabel(value: string): string {
  if (!value) return "No exam date";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "No exam date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function SummaryMetric({
  label,
  value,
  tone = "var(--fg)",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div
      style={{
        borderTop: "1px solid var(--border)",
        paddingTop: "10px",
        minWidth: 0,
      }}
    >
      <p
        className="font-mono"
        style={{
          fontSize: "10px",
          color: "var(--fg-subtle)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "4px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "13px",
          color: tone,
          fontFamily: "var(--font-sans)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </p>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      style={{
        // 44px-tall tap target; the visible 40x22 track is drawn by the inner
        // span so the switch looks identical but is comfortably tappable.
        height: "44px",
        width: "44px",
        minWidth: "44px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-end",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        padding: 0,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <span
        style={{
          position: "relative",
          width: "40px",
          height: "22px",
          borderRadius: "11px",
          background: checked ? "var(--accent)" : "var(--border-strong)",
          transition: "background 200ms",
          display: "block",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "3px",
            left: checked ? "21px" : "3px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: "#fff",
            transition: "left 200ms",
            display: "block",
          }}
        />
      </span>
    </button>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--r-md)",
          padding: "28px 24px",
          maxWidth: "420px",
          width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="font-display"
          style={{
            fontSize: "20px",
            fontWeight: 400,
            color: "var(--fg)",
            marginBottom: "12px",
          }}
        >
          Reset all my data?
        </h2>
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg-muted)",
            fontFamily: "var(--font-sans)",
            lineHeight: 1.5,
            marginBottom: "24px",
          }}
        >
          This wipes XP, streak, flashcard scheduling, quiz history, and all
          study progress. <strong>Cannot be undone.</strong>
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              height: "40px",
              background: "var(--error, #e55c5c)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--r-sm)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            Yes, reset everything
          </button>
          <button
            onClick={onCancel}
            style={{
              height: "40px",
              background: "transparent",
              color: "var(--fg-muted)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--r-sm)",
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              padding: "0 16px",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [userState, setUserState] = useState<UserState | null>(null);
  const [loadError, setLoadError] = useState(false);

  // Field states (derived from userState on load)
  const [examDate, setExamDate] = useState("");
  const [sessionMinutes, setSessionMinutes] = useState<SessionLength>(10);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(10);
  const [confidencePrompt, setConfidencePrompt] = useState(false);

  // Audio (TTS) field states
  const hasTts = mounted && ttsAvailable();
  const [audioVoiceURI, setAudioVoiceURI] = useState<string>("");
  const [audioRate, setAudioRate] = useState<number>(1.0);
  const [audioAutoplay, setAudioAutoplay] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Auth
  const [user, setUser] = useState<User | null | undefined>(undefined);

  // Public profile
  const [displayName, setDisplayName] = useState("");
  const [isPubliclyListed, setIsPubliclyListed] = useState(false);
  const [profileSaving, setProfileSaving] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Avatar (profile picture)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Daily study reminder (Web Push)
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHour, setReminderHour] = useState<number>(18);
  const [reminderSaving, setReminderSaving] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const pushSupported = mounted && isPushSupported();

  // Sync status
  const [syncPending, setSyncPending] = useState<number | null>(null);
  const [online, setOnline] = useState(true);

  // UI states
  const [saving, setSaving] = useState<string | null>(null); // which field is saving
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    const mountTimer = setTimeout(() => {
      setMounted(true);
      setVoices(listVoices());
    }, 0);
    // Populate voice list — may be empty until voiceschanged fires (Chrome)
    const populate = () => setVoices(listVoices());
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", populate);
      return () => {
        clearTimeout(mountTimer);
        window.speechSynthesis.removeEventListener("voiceschanged", populate);
      };
    }
    return () => clearTimeout(mountTimer);
  }, []);

  useEffect(() => {
    function updateOnline() {
      if (typeof navigator !== "undefined") setOnline(navigator.onLine);
    }

    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  useEffect(() => {
    async function loadPublicProfile(userId: string) {
      const supabase = createClient();
      try {
        const { data } = await supabase
          .from("profiles")
          .select("display_name, is_publicly_listed, reminder_hour, reminder_tz, avatar_url")
          .eq("user_id", userId)
          .single();
        setDisplayName(data?.display_name ?? "");
        setIsPubliclyListed(data?.is_publicly_listed ?? false);
        setAvatarUrl(data?.avatar_url ?? null);
        if (typeof data?.reminder_hour === "number") {
          setReminderEnabled(true);
          setReminderHour(data.reminder_hour);
        } else {
          setReminderEnabled(false);
        }
      } catch {
        // ignore
      } finally {
        setProfileLoaded(true);
      }
    }

    async function load() {
      try {
        await seedDb();
        const state = await db.userState.get(1);
        if (!state) {
          setLoadError(true);
          return;
        }
        setUserState(state);
        setExamDate(state.examDate ?? "");
        setSessionMinutes((state.dailySessionMinutes as SessionLength) ?? 10);
        setDailyGoal((state.dailyGoalQuestions as DailyGoal) ?? 10);
        // Default is ON: the quiz shows the picker unless explicitly set to "off".
        // Mirror that here so the toggle reflects the real default (was wrongly
        // showing OFF for users who never changed it).
        setConfidencePrompt(state.confidencePrompt !== "off");
        setAudioVoiceURI(state.audioVoiceURI ?? "");
        setAudioRate(state.audioRate ?? 1.0);
        setAudioAutoplay(state.audioAutoplay ?? false);
      } catch {
        setLoadError(true);
      }
    }
    load();

    // Load real sync-queue count
    syncDb.syncQueue.count().then(setSyncPending).catch(() => setSyncPending(0));

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadPublicProfile(session.user.id);
      else setProfileLoaded(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => {
        setUser(session?.user ?? null);
        if (session?.user) loadPublicProfile(session.user.id);
        else setProfileLoaded(true);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  async function saveDisplayName() {
    if (!user) return;
    setProfileSaving("displayName");
    const supabase = createClient();
    try {
      const trimmed = displayName.slice(0, 32).trim();
      await supabase
        .from("profiles")
        .update({ display_name: trimmed || null })
        .eq("user_id", user.id);
      setDisplayName(trimmed);
    } finally {
      setProfileSaving(null);
    }
  }

  async function savePublicListed(val: boolean) {
    if (!user) return;
    setProfileSaving("listed");
    const supabase = createClient();
    try {
      await supabase
        .from("profiles")
        .update({ is_publicly_listed: val })
        .eq("user_id", user.id);
      setIsPubliclyListed(val);
    } finally {
      setProfileSaving(null);
    }
  }

  // ── Avatar upload ───────────────────────────────────────────────────────────

  const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];
  const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB

  /**
   * Cover-crop + resize a File to a 256×256 canvas, then export as webp (q0.85),
   * falling back to jpeg if webp encoding isn't supported. This bounds storage
   * size and strips EXIF/metadata (re-encoding via canvas drops it) for privacy.
   */
  async function compressAvatar(file: File): Promise<Blob> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("decode failed"));
      i.src = dataUrl;
    });

    const SIZE = 256;
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas unsupported");

    // Center cover-crop: scale so the shorter side fills the square.
    const scale = Math.max(SIZE / img.width, SIZE / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (SIZE - dw) / 2;
    const dy = (SIZE - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", 0.85)
    );
    if (blob) return blob;

    const jpeg = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
    );
    if (jpeg) return jpeg;
    throw new Error("encode failed");
  }

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset the input so re-selecting the same file fires onChange again.
    if (avatarInputRef.current) avatarInputRef.current.value = "";
    if (!file || !user) return;

    setAvatarError(null);
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Please choose a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image must be 2MB or smaller.");
      return;
    }

    setAvatarBusy(true);
    const supabase = createClient();
    try {
      const blob = await compressAvatar(file);
      const path = `${user.id}/avatar.webp`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, contentType: blob.type });
      if (uploadError) {
        console.error("avatar upload failed", uploadError);
        setAvatarError("Upload failed. Please try again.");
        return;
      }

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${pub.publicUrl}?v=${Date.now()}`;

      const { error: saveError } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("user_id", user.id)
        .select();
      if (saveError) {
        console.error("avatar save failed", saveError);
        setAvatarError("Couldn't save your picture. Please try again.");
        return;
      }
      setAvatarUrl(url);
    } catch {
      setAvatarError("Couldn't process that image — please try another.");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function handleAvatarRemove() {
    if (!user) return;
    setAvatarError(null);
    setAvatarBusy(true);
    const supabase = createClient();
    try {
      await supabase.storage.from("avatars").remove([`${user.id}/avatar.webp`]);
      const { error: saveError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user.id)
        .select();
      if (saveError) {
        console.error("avatar remove failed", saveError);
        setAvatarError("Couldn't remove your picture. Please try again.");
        return;
      }
      setAvatarUrl(null);
    } catch {
      setAvatarError("Couldn't remove your picture — please try again.");
    } finally {
      setAvatarBusy(false);
    }
  }

  // ── Daily reminder (Web Push) ───────────────────────────────────────────────

  async function handleReminderToggle(val: boolean) {
    if (!user) return;
    setReminderMessage(null);
    setReminderSaving(true);
    const supabase = createClient();
    try {
      if (val) {
        const subscribed = await subscribeToPush();
        if (!subscribed) {
          setReminderMessage(
            "Couldn't enable reminders — notifications may be blocked or unsupported on this device."
          );
          return;
        }
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const { error } = await supabase
          .from("profiles")
          .update({ reminder_hour: reminderHour, reminder_tz: tz })
          .eq("user_id", user.id)
          .select();
        if (error) {
          setReminderMessage("Couldn't save your reminder. Please try again.");
          return;
        }
        setReminderEnabled(true);
      } else {
        await unsubscribeFromPush();
        const { error } = await supabase
          .from("profiles")
          .update({ reminder_hour: null })
          .eq("user_id", user.id)
          .select();
        if (error) {
          setReminderMessage("Couldn't turn off reminders. Please try again.");
          return;
        }
        setReminderEnabled(false);
      }
    } finally {
      setReminderSaving(false);
    }
  }

  async function handleReminderHourChange(hour: number) {
    setReminderHour(hour);
    if (!user || !reminderEnabled) return;
    setReminderMessage(null);
    setReminderSaving(true);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ reminder_hour: hour })
        .eq("user_id", user.id)
        .select();
      if (error) {
        setReminderMessage("Couldn't update the reminder time. Please try again.");
      }
    } finally {
      setReminderSaving(false);
    }
  }

  async function handleSendTest() {
    setTestResult(null);
    setTestSending(true);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTestResult("Couldn't send a test — try toggling the reminder off and on.");
      } else if ((data.sent ?? 0) > 0) {
        setTestResult("Sent — check your notifications.");
      } else {
        setTestResult("No device is subscribed yet — toggle the reminder on first.");
      }
    } catch {
      setTestResult("Couldn't send a test — please try again.");
    } finally {
      setTestSending(false);
    }
  }

  // ── Save helpers ──────────────────────────────────────────────────────────

  async function saveField(patch: Partial<UserState>, key: string) {
    if (!userState) return;
    setSaving(key);
    try {
      const fresh = await db.userState.get(1);
      const updated = { ...(fresh ?? userState), ...patch };
      await db.userState.put(updated);
      setUserState(updated);
    } finally {
      setSaving(null);
    }
  }

  async function handleExamDateBlur() {
    await saveField({ examDate: examDate || undefined }, "examDate");
  }

  async function handleSessionChange(min: SessionLength) {
    setSessionMinutes(min);
    await saveField({ dailySessionMinutes: min }, "session");
  }

  async function handleDailyGoalChange(goal: DailyGoal) {
    setDailyGoal(goal);
    await saveField({ dailyGoalQuestions: goal }, "dailyGoal");
  }

  async function handleConfidenceToggle(v: boolean) {
    setConfidencePrompt(v);
    await saveField({ confidencePrompt: v ? "always" : "off" }, "confidence");
  }

  async function handleAudioVoiceChange(uri: string) {
    setAudioVoiceURI(uri);
    await saveField({ audioVoiceURI: uri || undefined }, "audioVoice");
  }

  async function handleAudioRateChange(rate: number) {
    setAudioRate(rate);
    await saveField({ audioRate: rate }, "audioRate");
  }

  async function handleAudioAutoplayToggle(v: boolean) {
    setAudioAutoplay(v);
    await saveField({ audioAutoplay: v }, "audioAutoplay");
  }

  // ── Export ────────────────────────────────────────────────────────────────

  async function handleExport() {
    setExportError(null);
    try {
      const [state, quizSessions, reviews, flashcards, mockExamSessions, drillSessions, questionReviews] =
        await Promise.all([
          db.userState.toArray(),
          db.quizSessions.toArray(),
          db.reviews.toArray(),
          db.flashcards.toArray(),
          db.mockExamSessions.toArray(),
          db.drillSessions.toArray(),
          db.questionReviews.toArray(),
        ]);

      // Bookmarks table may not exist in all db versions — guard with try/catch
      let bookmarks: unknown[] = [];
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bookmarks = await (db as any).bookmarks?.toArray?.() ?? [];
      } catch {
        bookmarks = [];
      }

      const payload = {
        exportedAt: new Date().toISOString(),
        version: 1,
        userState: state,
        quizSessions,
        reviews,
        flashcards,
        mockExamSessions,
        drillSessions,
        questionReviews,
        bookmarks,
      };

      const json = JSON.stringify(payload, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const date = new Date().toISOString().slice(0, 10);
      const a = document.createElement("a");
      a.href = url;
      a.download = `secplus-quest-export-${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: copy to clipboard
      try {
        const simpleState = await db.userState.toArray();
        await navigator.clipboard.writeText(JSON.stringify(simpleState, null, 2));
        setExportError("Export failed — userState copied to clipboard instead.");
      } catch {
        setExportError("Export failed. Please try again.");
      }
    }
  }

  // ── Reset ─────────────────────────────────────────────────────────────────

  async function handleReset() {
    setConfirmOpen(false);
    try {
      // Clear all user-data tables (including bookmarks)
      await db.transaction(
        "rw",
        [
          db.userState,
          db.quizSessions,
          db.reviews,
          db.mockExamSessions,
          db.drillSessions,
          db.questionReviews,
          db.reportedQuestions,
          db.inProgressQuizzes,
          db.bookmarks,
        ],
        async () => {
          await db.userState.clear();
          await db.quizSessions.clear();
          await db.reviews.clear();
          await db.mockExamSessions.clear();
          await db.drillSessions.clear();
          await db.questionReviews.clear();
          await db.reportedQuestions.clear();
          await db.inProgressQuizzes.clear();
          await db.bookmarks.clear();
        }
      );

      // Clear the sync queue so stale items don't push to Supabase after reset
      await syncDb.syncQueue.clear();

      // Reset FSRS state on flashcards but preserve content fields
      const allCards = await db.flashcards.toArray();
      const resetCards = allCards.map((c) => ({
        id: c.id,
        certId: c.certId,
        domainId: c.domainId,
        objectiveId: c.objectiveId,
        front: c.front,
        back: c.back,
        // FSRS fields intentionally omitted to reset to undefined
      }));
      await db.flashcards.bulkPut(resetCards);

      setResetDone(true);
      // Force re-seed on next page load, then navigate to onboarding
      router.push("/onboarding");
    } catch {
      setConfirmOpen(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const isDark = theme === "dark";
  const activeCert = getCert(getActiveCertId(userState ?? undefined));
  const syncSummary =
    user === undefined
      ? "Checking account"
      : user
        ? syncPending === null
          ? "Checking queue"
          : !online
            ? "Offline, saved here"
            : syncPending > 0
              ? `${syncPending} pending`
              : "Synced"
        : "Local only";
  const syncTone =
    user && online && syncPending === 0
      ? "var(--success)"
      : user && syncPending !== null && syncPending > 0
        ? "var(--accent)"
        : "var(--fg-muted)";

  if (loadError) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "40vh",
          gap: "8px",
          color: "var(--fg-muted)",
          fontFamily: "var(--font-sans)",
          fontSize: "14px",
        }}
      >
        <span>Settings unavailable — try refreshing.</span>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "8px",
            height: "44px",
            padding: "0 16px",
            background: "transparent",
            color: "var(--fg-muted)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--r-sm)",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
          }}
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <>
      <ConfirmModal
        open={confirmOpen}
        onConfirm={handleReset}
        onCancel={() => setConfirmOpen(false)}
      />

      <div className="space-y-6">
        {/* Page heading */}
        <div>
          <h1
            className="font-display"
            style={{
              fontSize: "28px",
              fontWeight: 400,
              color: "var(--fg)",
              marginBottom: "4px",
            }}
          >
            Settings
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Preferences, account, and data management.
          </p>
        </div>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "18px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              marginBottom: "14px",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p
                className="font-mono"
                style={{
                  fontSize: "10px",
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "6px",
                }}
              >
                Study setup
              </p>
              <h2
                style={{
                  fontSize: "18px",
                  color: "var(--fg)",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {activeCert.fullName} · {activeCert.version}
              </h2>
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { href: "/practice", label: "Practice" },
                { href: "/library?tab=resources", label: "Resources" },
                { href: "/connect", label: "Connect" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  style={{
                    minHeight: "36px",
                    padding: "0 12px",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--r-sm)",
                    color: "var(--fg)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "12px",
                    display: "inline-flex",
                    alignItems: "center",
                    textDecoration: "none",
                  }}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "12px",
            }}
          >
            <SummaryMetric label="Exam date" value={formatDateLabel(examDate)} />
            <SummaryMetric label="Session" value={`${sessionMinutes} min daily`} />
            <SummaryMetric label="Goal" value={`${dailyGoal} questions`} />
            <SummaryMetric label="Sync" value={syncSummary} tone={syncTone} />
          </div>
        </div>

        {/* ── CERTIFICATION ── (unified: same control as the NavBar switcher) */}
        <Section title="Certification">
          <CertSwitcher variant="panel" />
        </Section>

        {/* ── EXAM ── */}
        <Section title="Exam">
          <div className="space-y-4">
            <Row label="Exam date" sublabel="Used to pace your study schedule.">
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                onBlur={handleExamDateBlur}
                disabled={saving === "examDate"}
                style={{
                  height: "44px",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-sm)",
                  padding: "0 10px",
                  // 16px avoids iOS focus auto-zoom on the date field.
                  fontSize: "16px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--fg)",
                  background: "var(--bg)",
                  cursor: "pointer",
                  minWidth: "150px",
                }}
              />
            </Row>
            <Divider />
            <div>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--fg)",
                  fontFamily: "var(--font-sans)",
                  marginBottom: "10px",
                }}
              >
                Daily session length
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                {([10, 20, 30] as SessionLength[]).map((min) => (
                  <button
                    key={min}
                    onClick={() => handleSessionChange(min)}
                    disabled={saving === "session"}
                    style={{
                      height: "44px",
                      padding: "0 16px",
                      border: `1px solid ${sessionMinutes === min ? "var(--accent)" : "var(--border-strong)"}`,
                      borderRadius: "var(--r-sm)",
                      background:
                        sessionMinutes === min
                          ? "rgba(245,166,35,0.08)"
                          : "transparent",
                      color:
                        sessionMinutes === min ? "var(--accent)" : "var(--fg)",
                      fontSize: "13px",
                      fontWeight: sessionMinutes === min ? 600 : 400,
                      fontFamily: "var(--font-sans)",
                      cursor: "pointer",
                      transition: "all 150ms",
                    }}
                  >
                    {min} min
                  </button>
                ))}
              </div>
            </div>
            <Divider />
            <div>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--fg)",
                  fontFamily: "var(--font-sans)",
                  marginBottom: "4px",
                }}
              >
                Daily goal
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--fg-muted)",
                  fontFamily: "var(--font-sans)",
                  marginBottom: "10px",
                }}
              >
                Daily goal — questions to keep your streak alive.
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {([5, 10, 15, 20] as DailyGoal[]).map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleDailyGoalChange(goal)}
                    disabled={saving === "dailyGoal"}
                    style={{
                      height: "44px",
                      padding: "0 16px",
                      border: `1px solid ${dailyGoal === goal ? "var(--accent)" : "var(--border-strong)"}`,
                      borderRadius: "var(--r-sm)",
                      background:
                        dailyGoal === goal ? "rgba(245,166,35,0.08)" : "transparent",
                      color: dailyGoal === goal ? "var(--accent)" : "var(--fg)",
                      fontSize: "13px",
                      fontWeight: dailyGoal === goal ? 600 : 400,
                      fontFamily: "var(--font-sans)",
                      cursor: "pointer",
                      transition: "all 150ms",
                    }}
                  >
                    {goal} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── DURING STUDY ── */}
        <Section title="During Study">
          <Row
            label="Confidence prompt"
            sublabel="Show a low / medium / high picker before each answer is revealed."
          >
            <Toggle
              checked={confidencePrompt}
              onChange={handleConfidenceToggle}
              ariaLabel="Toggle confidence prompt"
            />
          </Row>
        </Section>

        {/* ── AUDIO ── */}
        <Section title="Audio">
          {!mounted ? (
            <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)" }}>Loading…</p>
          ) : !hasTts ? (
            <p style={{ fontSize: "13px", color: "var(--fg-muted)", fontFamily: "var(--font-sans)", opacity: 0.55 }}>
              Your browser doesn&apos;t support speech synthesis.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Voice picker */}
              <Row label="Voice" sublabel="Text-to-speech voice for read-aloud.">
                <select
                  value={audioVoiceURI}
                  onChange={(e) => handleAudioVoiceChange(e.target.value)}
                  disabled={saving === "audioVoice"}
                  style={{
                    height: "44px",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--r-sm)",
                    padding: "0 10px",
                    // 16px avoids iOS focus auto-zoom on the select.
                    fontSize: "16px",
                    fontFamily: "var(--font-sans)",
                    color: "var(--fg)",
                    background: "var(--bg)",
                    cursor: "pointer",
                    maxWidth: "min(200px, 52vw)",
                  }}
                >
                  <option value="">Default</option>
                  {voices.map((v) => (
                    <option key={v.voiceURI} value={v.voiceURI}>
                      {v.name}{v.localService ? " ●" : ""}
                    </option>
                  ))}
                </select>
              </Row>
              <Divider />
              {/* Speed slider */}
              <Row label="Speed" sublabel={`${audioRate.toFixed(2)}× — drag to adjust reading speed.`}>
                <input
                  type="range"
                  min={0.75}
                  max={1.5}
                  step={0.05}
                  value={audioRate}
                  onChange={(e) => handleAudioRateChange(parseFloat(e.target.value))}
                  onMouseUp={(e) => handleAudioRateChange(parseFloat((e.target as HTMLInputElement).value))}
                  onTouchEnd={(e) => handleAudioRateChange(parseFloat((e.target as HTMLInputElement).value))}
                  style={{
                    width: "120px",
                    accentColor: "var(--accent)",
                    cursor: "pointer",
                  }}
                />
              </Row>
              <Divider />
              {/* Auto-play toggle */}
              <Row
                label="Auto-play flashcards"
                sublabel="Reads the front, pauses 2.5 s, then reads the back. You still rate recall manually."
              >
                <Toggle
                  checked={audioAutoplay}
                  onChange={handleAudioAutoplayToggle}
                  ariaLabel="Toggle auto-play flashcards"
                />
              </Row>
            </div>
          )}
        </Section>

        {/* ── THEME ── */}
        <Section title="Theme">
          <Row label={mounted ? (isDark ? "Dark" : "Light") : "Theme"}>
            {mounted ? (
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                aria-label="Toggle theme"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  height: "44px",
                  padding: "0 14px",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-sm)",
                  background: "transparent",
                  color: "var(--fg-muted)",
                  fontSize: "13px",
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--fg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--fg-muted)")
                }
              >
                {isDark ? (
                  /* Sun */
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="8"
                      y1="1"
                      x2="8"
                      y2="3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="8"
                      y1="13"
                      x2="8"
                      y2="15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="1"
                      y1="8"
                      x2="3"
                      y2="8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="13"
                      y1="8"
                      x2="15"
                      y2="8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="2.929"
                      y1="2.929"
                      x2="4.343"
                      y2="4.343"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="11.657"
                      y1="11.657"
                      x2="13.071"
                      y2="13.071"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="13.071"
                      y1="2.929"
                      x2="11.657"
                      y2="4.343"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="4.343"
                      y1="11.657"
                      x2="2.929"
                      y2="13.071"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  /* Moon */
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                Switch to {isDark ? "light" : "dark"}
              </button>
            ) : (
              <div style={{ width: 80, height: 36 }} />
            )}
          </Row>
        </Section>

        {/* ── ACCOUNT ── */}
        <Section title="Account">
          {user === undefined ? (
            <p
              style={{
                fontSize: "14px",
                color: "var(--fg-muted)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Loading…
            </p>
          ) : user ? (
            <div className="space-y-3">
              <Row label="Signed in as">
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--fg-muted)",
                    fontFamily: "var(--font-mono)",
                    wordBreak: "break-all",
                    textAlign: "right",
                  }}
                >
                  {user.email}
                </span>
              </Row>
              <Divider />
              <Row label="Sync status">
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "13px",
                    color: "var(--fg-muted)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {syncPending === null ? (
                    <>
                      <span style={{ color: "var(--fg-subtle)" }}>●</span>
                      Checking…
                    </>
                  ) : !online ? (
                    <>
                      <span style={{ color: "var(--fg-muted)" }}>●</span>
                      Offline · changes saved locally
                    </>
                  ) : syncPending > 0 ? (
                    <>
                      <span style={{ color: "var(--accent)" }}>●</span>
                      Syncing… ({syncPending} pending)
                    </>
                  ) : (
                    <>
                      <span style={{ color: "var(--success)" }}>●</span>
                      Synced
                    </>
                  )}
                </span>
              </Row>
              <Divider />
              <Row label="Sign out">
                <form action="/auth/logout" method="POST">
                  <button
                    type="submit"
                    style={{
                      height: "44px",
                      padding: "0 16px",
                      background: "transparent",
                      color: "var(--fg-muted)",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "var(--r-sm)",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--fg)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--fg-muted)")
                    }
                  >
                    Sign out
                  </button>
                </form>
              </Row>
            </div>
          ) : (
            <Row label="Not signed in" sublabel="Progress is local only.">
              <a
                href="/login"
                style={{
                  height: "44px",
                  padding: "0 16px",
                  background: "transparent",
                  color: "var(--accent)",
                  border: "1px solid var(--accent)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                Sign in to sync →
              </a>
            </Row>
          )}
        </Section>

        {/* ── PUBLIC PROFILE ── */}
        {user && profileLoaded && (
          <Section title="Public Profile">
            <div className="space-y-4">
              <Row
                label="Profile picture"
                sublabel="Shown on the leaderboard. Keep it classroom-appropriate."
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <Avatar url={avatarUrl} name={displayName || "You"} size={64} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleAvatarSelect}
                      disabled={avatarBusy}
                      style={{ display: "none" }}
                    />
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <button
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={avatarBusy}
                        style={{
                          height: "36px",
                          padding: "0 14px",
                          background: "transparent",
                          color: "var(--fg)",
                          border: "1px solid var(--border-strong)",
                          borderRadius: "var(--r-sm)",
                          fontSize: "13px",
                          fontFamily: "var(--font-sans)",
                          cursor: avatarBusy ? "default" : "pointer",
                          opacity: avatarBusy ? 0.6 : 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {avatarBusy ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
                      </button>
                      {avatarUrl && (
                        <button
                          onClick={handleAvatarRemove}
                          disabled={avatarBusy}
                          style={{
                            height: "36px",
                            padding: "0 14px",
                            background: "transparent",
                            color: "var(--fg-muted)",
                            border: "1px solid var(--border-strong)",
                            borderRadius: "var(--r-sm)",
                            fontSize: "13px",
                            fontFamily: "var(--font-sans)",
                            cursor: avatarBusy ? "default" : "pointer",
                            opacity: avatarBusy ? 0.6 : 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Remove photo
                        </button>
                      )}
                    </div>
                    {avatarError && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: "var(--error, #e55c5c)",
                          fontFamily: "var(--font-sans)",
                          maxWidth: "220px",
                        }}
                      >
                        {avatarError}
                      </p>
                    )}
                  </div>
                </div>
              </Row>
              <Divider />
              <Row
                label="Display name"
                sublabel="Shown on the public leaderboard instead of your email. Max 32 chars."
              >
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value.slice(0, 32))}
                    onBlur={saveDisplayName}
                    onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                    placeholder="anon-XXXX"
                    maxLength={32}
                    disabled={profileSaving === "displayName"}
                    style={{
                      height: "44px",
                      border: "1px solid var(--border-strong)",
                      borderRadius: "var(--r-sm)",
                      padding: "0 10px",
                      // 16px avoids iOS focus auto-zoom.
                      fontSize: "16px",
                      fontFamily: "var(--font-sans)",
                      color: "var(--fg)",
                      background: "var(--bg)",
                      width: "min(180px, 48vw)",
                    }}
                  />
                </div>
              </Row>
              <Divider />
              <Row
                label="Show me on the public leaderboard"
                sublabel="When on, anyone can see your display name, predicted score, and that you're studying. Email, exam date, and quiz history stay private."
              >
                <Toggle
                  checked={isPubliclyListed}
                  onChange={savePublicListed}
                  ariaLabel="Toggle public leaderboard listing"
                />
              </Row>
            </div>
          </Section>
        )}

        {/* ── DAILY REMINDER ── */}
        {user && profileLoaded && (
          <Section title="Daily Study Reminder">
            <div className="space-y-4">
              <Row
                label="Daily study reminder"
                sublabel="A gentle push notification at your chosen time if you haven't studied yet."
              >
                <Toggle
                  checked={reminderEnabled}
                  onChange={handleReminderToggle}
                  ariaLabel="Toggle daily study reminder"
                />
              </Row>
              {reminderEnabled && (
                <>
                  <Divider />
                  <Row
                    label="Reminder time"
                    sublabel="Sent in your local time zone."
                  >
                    <select
                      value={reminderHour}
                      onChange={(e) =>
                        handleReminderHourChange(parseInt(e.target.value, 10))
                      }
                      disabled={reminderSaving}
                      style={{
                        height: "44px",
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--r-sm)",
                        padding: "0 10px",
                        // 16px avoids iOS focus auto-zoom on the select.
                        fontSize: "16px",
                        fontFamily: "var(--font-sans)",
                        color: "var(--fg)",
                        background: "var(--bg)",
                        cursor: "pointer",
                        minWidth: "120px",
                      }}
                    >
                      {Array.from({ length: 18 }, (_, i) => i + 6).map((h) => {
                        const label =
                          h === 12
                            ? "12 pm"
                            : h < 12
                            ? `${h} am`
                            : `${h - 12} pm`;
                        return (
                          <option key={h} value={h}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </Row>
                  <Divider />
                  <Row
                    label="Test it"
                    sublabel="Send a notification to this device right now."
                  >
                    <button
                      onClick={handleSendTest}
                      disabled={testSending}
                      style={{
                        height: "40px",
                        padding: "0 14px",
                        border: "1px solid var(--border-strong)",
                        borderRadius: "var(--r-sm)",
                        background: "transparent",
                        color: "var(--fg)",
                        fontSize: "13px",
                        fontFamily: "var(--font-sans)",
                        fontWeight: 500,
                        cursor: testSending ? "default" : "pointer",
                        opacity: testSending ? 0.6 : 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {testSending ? "Sending…" : "Send test notification"}
                    </button>
                  </Row>
                  {testResult && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--fg-muted)",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {testResult}
                    </p>
                  )}
                </>
              )}
              {reminderMessage && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--error, #e55c5c)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {reminderMessage}
                </p>
              )}
              {!pushSupported && (
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--fg-muted)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Push notifications aren&apos;t supported in this browser.
                </p>
              )}
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--fg-muted)",
                  fontFamily: "var(--font-sans)",
                  lineHeight: 1.5,
                }}
              >
                On iPhone, reminders require adding the app to your Home Screen
                first (iOS limitation).
              </p>
            </div>
          </Section>
        )}

        {/* ── VOICE TUTOR ── */}
        {user && (
          <Section title="Voice Tutor">
            <p
              style={{
                fontSize: "14px",
                color: "var(--fg-muted)",
                lineHeight: 1.6,
                margin: "0 0 12px",
              }}
            >
              Talk to a live AI tutor that quizzes you from the real question
              bank and your weak areas. It uses live OpenAI compute, so it is
              capped at 30 minutes/day and 60 minutes/month — free while in beta.
            </p>
            <a
              href="/voice"
              style={{
                display: "inline-flex",
                alignItems: "center",
                height: "44px",
                padding: "0 16px",
                border: "1px solid var(--accent)",
                borderRadius: "var(--r-sm)",
                color: "var(--accent)",
                fontSize: "13px",
                fontWeight: 500,
                fontFamily: "var(--font-sans)",
                textDecoration: "none",
              }}
            >
              Open voice tutor →
            </a>
          </Section>
        )}

        {/* ── AI STUDY BUDDY ── */}
        {user && (
          <Section title="AI Study Buddy">
            <StudyBuddyKeys />
          </Section>
        )}

        {/* ── DATA ── */}
        <Section title="Data">
          <div className="space-y-4">
            <Row
              label="Export all my data (JSON)"
              sublabel="Downloads a full backup of your study progress."
            >
              <button
                onClick={handleExport}
                style={{
                  height: "44px",
                  padding: "0 16px",
                  background: "transparent",
                  color: "var(--fg-muted)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--fg)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--fg-muted)")
                }
              >
                Export
              </button>
            </Row>
            {exportError && (
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--error, #e55c5c)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {exportError}
              </p>
            )}
            <Divider />
            <Row
              label="Reset all my data"
              sublabel="Wipes XP, streak, quiz history, and flashcard scheduling. Cannot be undone."
            >
              <button
                onClick={() => setConfirmOpen(true)}
                style={{
                  height: "44px",
                  padding: "0 16px",
                  background: "transparent",
                  color: "var(--error, #e55c5c)",
                  border: "1px solid var(--error, #e55c5c)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  whiteSpace: "nowrap",
                  opacity: resetDone ? 0.5 : 1,
                }}
              >
                Reset
              </button>
            </Row>
          </div>
        </Section>

        {/* ── HELP ── */}
        <Section title="HELP">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Row
              label="Credits &amp; sources"
              sublabel="Who built the content this app is based on."
            >
              <a
                href="/credits"
                style={{
                  height: "44px",
                  padding: "0 16px",
                  background: "transparent",
                  color: "var(--fg-muted)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = "var(--fg)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.color = "var(--fg-muted)")
                }
              >
                View →
              </a>
            </Row>
            <Divider />
            <Row
              label="Hecz Study Lab"
              sublabel="Open-source starter, class pack, decks, and local/fork import guidance."
            >
              <Link
                href="/lab"
                style={{
                  height: "44px",
                  padding: "0 16px",
                  background: "transparent",
                  color: "var(--fg-muted)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                Open →
              </Link>
            </Row>
            <Divider />
            <Row
              label="Changelog"
              sublabel="Recent product, lab, and public starter updates."
            >
              <Link
                href="/changelog"
                style={{
                  height: "44px",
                  padding: "0 16px",
                  background: "transparent",
                  color: "var(--fg-muted)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  whiteSpace: "nowrap",
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                Open →
              </Link>
            </Row>
            <Divider />
            <Row
              label="Show me around again"
              sublabel="Replay the welcome tour from the dashboard."
            >
              <button
                onClick={() => {
                  try { localStorage.removeItem("tourSeenVersion"); } catch {}
                  router.push("/?tour=1");
                }}
                style={{
                  height: "44px",
                  padding: "0 16px",
                  background: "transparent",
                  color: "var(--accent)",
                  border: "1px solid var(--accent)",
                  borderRadius: "var(--r-sm)",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  whiteSpace: "nowrap",
                }}
              >
                Replay tour
              </button>
            </Row>
          </div>
        </Section>
      </div>
    </>
  );
}
