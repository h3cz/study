/**
 * tts.ts — Web Speech API helpers for free on-device TTS.
 *
 * All public functions no-op gracefully when speechSynthesis is unavailable
 * (old browsers, some server-side renders). The UI should hide audio controls
 * when ttsAvailable() returns false.
 */

// ── Feature detection ──────────────────────────────────────────────────────────

export function ttsAvailable(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof SpeechSynthesisUtterance !== "undefined"
  );
}

// ── Voice loading ──────────────────────────────────────────────────────────────

let _voicesCached: SpeechSynthesisVoice[] | null = null;

function _loadVoices(): SpeechSynthesisVoice[] {
  if (!ttsAvailable()) return [];
  const all = window.speechSynthesis.getVoices();
  // Filter to English voices, prefer local/high-quality ones
  const english = all.filter((v) => v.lang.startsWith("en"));
  // Sort: local service first, then alphabetical by name
  english.sort((a, b) => {
    if (a.localService && !b.localService) return -1;
    if (!a.localService && b.localService) return 1;
    return a.name.localeCompare(b.name);
  });
  return english;
}

/**
 * Returns English voices sorted with local/high-quality first.
 * Handles the async voiceschanged pattern — always returns what's available now.
 */
export function listVoices(): SpeechSynthesisVoice[] {
  if (!ttsAvailable()) return [];
  if (_voicesCached && _voicesCached.length > 0) return _voicesCached;
  _voicesCached = _loadVoices();
  return _voicesCached;
}

// Populate cache when voices are loaded async (Chrome, some Androids)
if (ttsAvailable()) {
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    _voicesCached = _loadVoices();
  });
  // Eagerly prime the cache — synchronously available on Safari/iOS/Edge
  _voicesCached = _loadVoices();
}

// ── Pick a default voice ───────────────────────────────────────────────────────

function _pickDefaultVoice(voiceURI?: string): SpeechSynthesisVoice | null {
  const voices = listVoices();
  if (voices.length === 0) return null;
  if (voiceURI) {
    const match = voices.find((v) => v.voiceURI === voiceURI);
    if (match) return match;
  }
  // Prefer a named high-quality local voice if available
  const preferred = [
    "Samantha", // macOS / iOS
    "Alex",     // older macOS
    "Karen",    // iOS AU
    "Daniel",   // iOS UK
    "Microsoft David Desktop", // Windows
    "Microsoft Zira Desktop",  // Windows
    "Google US English",       // Chrome
  ];
  for (const name of preferred) {
    const v = voices.find((v) => v.name.includes(name));
    if (v) return v;
  }
  // Fall back to the first local English voice, then any English voice
  return voices.find((v) => v.localService) ?? voices[0] ?? null;
}

// ── Speak / stop ──────────────────────────────────────────────────────────────

export interface SpeakOptions {
  rate?: number;        // 0.1–10, default 1.0
  voiceURI?: string;    // from listVoices()
  onEnd?: () => void;
}

/**
 * Speaks the given text. Cancels any in-flight utterance first.
 * No-ops silently if speechSynthesis is unavailable.
 */
export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!ttsAvailable()) return;
  // Cancel any in-flight speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = opts.rate ?? 1.0;
  utterance.lang = "en-US";

  const voice = _pickDefaultVoice(opts.voiceURI);
  if (voice) utterance.voice = voice;

  if (opts.onEnd) {
    utterance.addEventListener("end", opts.onEnd, { once: true });
  }

  window.speechSynthesis.speak(utterance);
}

/** Stop any currently speaking utterance. */
export function stopSpeaking(): void {
  if (!ttsAvailable()) return;
  window.speechSynthesis.cancel();
}

// ── Text formatters (pure, unit-testable) ─────────────────────────────────────

/**
 * Formats a flashcard for natural TTS reading.
 * front-only → reads just the term.
 * front+back → reads "Term: …. Answer: …."
 */
export function buildFlashcardSpeech(front: string, back?: string): string {
  const cleanFront = front.trim();
  if (!back) return cleanFront;
  const cleanBack = back.trim();
  return `Term: ${cleanFront}. Answer: ${cleanBack}.`;
}

/**
 * Formats a quiz question for natural TTS reading.
 * Reads "Question: … Option A: … Option B: … Option C: … Option D: …"
 */
export function buildQuestionSpeech(
  stem: string,
  choices: Array<{ key: string; text: string }>
): string {
  const parts: string[] = [`Question: ${stem.trim()}.`];
  for (const c of choices) {
    parts.push(`Option ${c.key}: ${c.text.trim()}.`);
  }
  return parts.join(" ");
}
