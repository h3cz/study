import { describe, it, expect, afterEach } from "vitest";

// isVoiceAllowed reads process.env at call time, so we can set it per-test.
// Import after env manipulation so the module picks up the right value each call.
import { isVoiceAllowed } from "@/lib/voice-tutor/access";

describe("isVoiceAllowed", () => {
  const ORIGINAL = process.env.VOICE_TUTOR_ALLOWED_EMAILS;

  afterEach(() => {
    if (ORIGINAL === undefined) {
      delete process.env.VOICE_TUTOR_ALLOWED_EMAILS;
    } else {
      process.env.VOICE_TUTOR_ALLOWED_EMAILS = ORIGINAL;
    }
  });

  it("allows an email that is on the allowlist", () => {
    process.env.VOICE_TUTOR_ALLOWED_EMAILS = "jrlop99@gmail.com";
    expect(isVoiceAllowed("jrlop99@gmail.com")).toBe(true);
  });

  it("denies an email that is NOT on the allowlist", () => {
    process.env.VOICE_TUTOR_ALLOWED_EMAILS = "jrlop99@gmail.com";
    expect(isVoiceAllowed("other@example.com")).toBe(false);
  });

  it("denies everyone when the env var is empty (fail closed)", () => {
    process.env.VOICE_TUTOR_ALLOWED_EMAILS = "";
    expect(isVoiceAllowed("jrlop99@gmail.com")).toBe(false);
    expect(isVoiceAllowed("anyone@example.com")).toBe(false);
  });

  it("denies everyone when the env var is unset (fail closed)", () => {
    delete process.env.VOICE_TUTOR_ALLOWED_EMAILS;
    expect(isVoiceAllowed("jrlop99@gmail.com")).toBe(false);
  });

  it("denies null email", () => {
    process.env.VOICE_TUTOR_ALLOWED_EMAILS = "jrlop99@gmail.com";
    expect(isVoiceAllowed(null)).toBe(false);
  });

  it("denies undefined email", () => {
    process.env.VOICE_TUTOR_ALLOWED_EMAILS = "jrlop99@gmail.com";
    expect(isVoiceAllowed(undefined)).toBe(false);
  });

  it("is case-insensitive for matching", () => {
    process.env.VOICE_TUTOR_ALLOWED_EMAILS = "jrlop99@gmail.com";
    expect(isVoiceAllowed("JRLOP99@GMAIL.COM")).toBe(true);
    expect(isVoiceAllowed("Jrlop99@Gmail.Com")).toBe(true);
  });

  it("supports multiple emails in the allowlist", () => {
    process.env.VOICE_TUTOR_ALLOWED_EMAILS = "jrlop99@gmail.com, other@example.com";
    expect(isVoiceAllowed("other@example.com")).toBe(true);
    expect(isVoiceAllowed("notlisted@example.com")).toBe(false);
  });
});
