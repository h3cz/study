// Pure decision logic for the daily study-reminder cron.
//
// Kept dependency-free and side-effect-free so it can be unit-tested in
// isolation (no Supabase, no web-push, no Date.now() ambient state — `now` is
// always injected by the caller).

export interface ReminderDecisionInput {
  /** The user's chosen local reminder hour, 0-23. */
  reminderHour: number;
  /** IANA timezone string, e.g. "America/Chicago". */
  reminderTz: string;
  /** Last study date as YYYY-MM-DD (local to the user), or null. */
  lastStudyDate: string | null;
  /** Current streak length. */
  streak: number;
  /** Predicted exam score out of 900, or null if unknown. */
  predictedScore: number | null;
  /** The instant at which the cron is evaluating. */
  now: Date;
}

export interface ReminderDecision {
  send: boolean;
  title?: string;
  body?: string;
}

/** Hour (0-23) at `date` in the given IANA timezone. */
function hourInTz(date: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    hour12: false,
  }).formatToParts(date);
  const hourPart = parts.find((p) => p.type === "hour")?.value ?? "0";
  // Intl can render midnight as "24" in some engines; normalize to 0.
  const h = parseInt(hourPart, 10) % 24;
  return Number.isNaN(h) ? 0 : h;
}

/** YYYY-MM-DD for `date` in the given IANA timezone (en-CA yields ISO order). */
function dateInTz(date: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Local YYYY-MM-DD one day before `localDate` (pure string/UTC math). */
function previousLocalDate(localDate: string): string {
  const [y, m, d] = localDate.split("-").map((n) => parseInt(n, 10));
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10);
}

/**
 * Decide whether to send a reminder to a single user right now, and with what copy.
 * Pure: identical inputs always yield identical output.
 */
export function reminderDecision(input: ReminderDecisionInput): ReminderDecision {
  const { reminderHour, reminderTz, lastStudyDate, streak, predictedScore, now } =
    input;

  const localHour = hourInTz(now, reminderTz);
  if (localHour !== reminderHour) return { send: false };

  const todayLocal = dateInTz(now, reminderTz);
  // Already studied today — don't nag.
  if (lastStudyDate === todayLocal) return { send: false };

  const yesterdayLocal = previousLocalDate(todayLocal);

  // At-risk: an active streak whose last study was yesterday is about to break.
  if (streak > 0 && lastStudyDate === yesterdayLocal) {
    return {
      send: true,
      title: "Keep your streak alive 🔥",
      body: `Don't lose your ${streak}-day streak — 2 minutes of practice keeps it going.`,
    };
  }

  // Gentle nudge otherwise.
  return {
    send: true,
    title: "Time to study 📚",
    body:
      predictedScore != null
        ? `Your predicted score is ${predictedScore}/900 — a quick session moves it up.`
        : `A few questions a day builds your Security+ score.`,
  };
}
