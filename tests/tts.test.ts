/**
 * tts.test.ts
 * Unit tests for the pure text-formatting helpers in lib/tts.ts.
 *
 * The browser Speech APIs (speechSynthesis, SpeechSynthesisUtterance) cannot
 * be exercised in jsdom/vitest, so we only test the pure functions that
 * format text for natural reading. The runtime functions (speak, stopSpeaking,
 * listVoices) are guarded behind ttsAvailable() and no-op in this env.
 */

import { describe, it, expect } from "vitest";
import { buildFlashcardSpeech, buildQuestionSpeech } from "@/lib/tts";

// ── buildFlashcardSpeech ───────────────────────────────────────────────────────

describe("buildFlashcardSpeech", () => {
  it("returns just the front when no back is provided", () => {
    const result = buildFlashcardSpeech("CIA Triad");
    expect(result).toBe("CIA Triad");
  });

  it("formats front+back for natural reading", () => {
    const result = buildFlashcardSpeech("CIA Triad", "Confidentiality, Integrity, Availability");
    expect(result).toBe("Term: CIA Triad. Answer: Confidentiality, Integrity, Availability.");
  });

  it("trims leading and trailing whitespace from both sides", () => {
    const result = buildFlashcardSpeech("  AES  ", "  Advanced Encryption Standard  ");
    expect(result).toBe("Term: AES. Answer: Advanced Encryption Standard.");
  });

  it("trims front-only as well", () => {
    const result = buildFlashcardSpeech("  PKI  ");
    expect(result).toBe("PKI");
  });

  it("handles an empty back gracefully (treats as front-only)", () => {
    // empty string is falsy — returns just the front
    const result = buildFlashcardSpeech("Zero Trust", "");
    expect(result).toBe("Zero Trust");
  });

  it("handles multi-sentence back text", () => {
    const result = buildFlashcardSpeech(
      "Hashing",
      "A one-way function that maps data to a fixed-size digest. Cannot be reversed."
    );
    expect(result).toContain("Term: Hashing.");
    expect(result).toContain("Answer: A one-way function");
  });
});

// ── buildQuestionSpeech ───────────────────────────────────────────────────────

describe("buildQuestionSpeech", () => {
  const stem = "Which protocol operates at Layer 3 of the OSI model?";
  const choices = [
    { key: "A", text: "TCP" },
    { key: "B", text: "IP" },
    { key: "C", text: "Ethernet" },
    { key: "D", text: "TLS" },
  ];

  it("starts with 'Question:' followed by the stem", () => {
    const result = buildQuestionSpeech(stem, choices);
    expect(result).toMatch(/^Question: Which protocol/);
  });

  it("includes all four option keys and their text", () => {
    const result = buildQuestionSpeech(stem, choices);
    expect(result).toContain("Option A: TCP.");
    expect(result).toContain("Option B: IP.");
    expect(result).toContain("Option C: Ethernet.");
    expect(result).toContain("Option D: TLS.");
  });

  it("separates parts with a space", () => {
    const result = buildQuestionSpeech(stem, choices);
    // Each segment ends with a period and is separated by a space
    const parts = result.split(" Option ");
    expect(parts).toHaveLength(5); // 1 question + 4 options
  });

  it("trims whitespace from stem and choice text", () => {
    const result = buildQuestionSpeech("  What is ARP?  ", [
      { key: "A", text: "  Address Resolution Protocol  " },
    ]);
    expect(result).toContain("Question: What is ARP?.");
    expect(result).toContain("Option A: Address Resolution Protocol.");
  });

  it("handles a single choice", () => {
    const result = buildQuestionSpeech("True or false?", [{ key: "A", text: "True" }]);
    expect(result).toBe("Question: True or false?. Option A: True.");
  });

  it("returns only the question when choices array is empty", () => {
    const result = buildQuestionSpeech("What is HTTPS?", []);
    expect(result).toBe("Question: What is HTTPS?.");
  });

  it("preserves the order of choices as provided", () => {
    const result = buildQuestionSpeech("Order test", [
      { key: "D", text: "Fourth" },
      { key: "A", text: "First" },
    ]);
    const dIdx = result.indexOf("Option D:");
    const aIdx = result.indexOf("Option A:");
    expect(dIdx).toBeLessThan(aIdx);
  });
});
