import { describe, it, expect } from "vitest";
import {
  buildClientSecretBody,
  turnDetectionFor,
  isVoiceTurnMode,
  DEFAULT_TURN_MODE,
} from "@/lib/voice-tutor/config";

describe("voice turn-detection config", () => {
  it("defaults to hands-free (auto)", () => {
    expect(DEFAULT_TURN_MODE).toBe("auto");
  });

  it("isVoiceTurnMode narrows valid values and rejects junk", () => {
    expect(isVoiceTurnMode("auto")).toBe(true);
    expect(isVoiceTurnMode("ptt")).toBe(true);
    expect(isVoiceTurnMode("nope")).toBe(false);
    expect(isVoiceTurnMode(undefined)).toBe(false);
    expect(isVoiceTurnMode(null)).toBe(false);
    expect(isVoiceTurnMode(1)).toBe(false);
  });

  it("auto mode uses conservative semantic_vad (eagerness low)", () => {
    const td = turnDetectionFor("auto");
    expect(td).not.toBeNull();
    expect(td).toMatchObject({
      type: "semantic_vad",
      eagerness: "low",
      create_response: true,
      interrupt_response: true,
    });
  });

  it("push-to-talk disables automatic turn detection (null)", () => {
    expect(turnDetectionFor("ptt")).toBeNull();
  });

  it("buildClientSecretBody nests turn_detection under session.audio.input", () => {
    const body = buildClientSecretBody("auto");
    expect(body.session.audio.input.turn_detection).toMatchObject({
      type: "semantic_vad",
      eagerness: "low",
    });
    // Mic transcription for captions must still be present.
    expect(body.session.audio.input.transcription).toEqual({ model: "whisper-1" });
  });

  it("buildClientSecretBody sets turn_detection null for ptt", () => {
    const body = buildClientSecretBody("ptt");
    expect(body.session.audio.input.turn_detection).toBeNull();
  });

  it("buildClientSecretBody defaults to auto when no mode is passed", () => {
    const body = buildClientSecretBody();
    expect(body.session.audio.input.turn_detection).toMatchObject({
      type: "semantic_vad",
    });
  });
});
