/**
 * Allowlist gate for the voice tutor.
 *
 * Fail CLOSED: if the env var is empty/unset, NO ONE is allowed (cost safety).
 * The env var value is never exposed to the client — only the boolean result
 * is surfaced via /api/voice/access.
 */
export function isVoiceAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const raw = process.env.VOICE_TUTOR_ALLOWED_EMAILS ?? "";
  const allowed = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowed.length === 0) return false; // fail closed
  return allowed.includes(email.trim().toLowerCase());
}
