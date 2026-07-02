/**
 * question-search.test.ts
 *
 * Tests for the question search logic used in the library Search tab.
 * Pure logic tests — no IndexedDB or browser required.
 */

import { describe, it, expect } from "vitest";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Choice {
  key: "A" | "B" | "C" | "D";
  text: string;
  correct: boolean;
}

interface Question {
  id: string;
  certId: string;
  domainId: string;
  objectiveId: string;
  stem: string;
  choices: Choice[];
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

// ─── Search implementation (mirrors library page logic) ───────────────────────

function searchQuestions(questions: Question[], query: string, limit = 50): Question[] {
  const q = query.toLowerCase();
  if (!q.trim()) return [];
  return questions
    .filter((question) => {
      if (question.stem.toLowerCase().includes(q)) return true;
      if (question.explanation.toLowerCase().includes(q)) return true;
      return question.choices.some((c) => c.text.toLowerCase().includes(q));
    })
    .slice(0, limit);
}

// ─── Test data ────────────────────────────────────────────────────────────────

function makeQuestion(id: string, stem: string, explanation: string, choices: Partial<Choice>[] = []): Question {
  const defaultChoices: Choice[] = [
    { key: "A", text: "Option A", correct: true },
    { key: "B", text: "Option B", correct: false },
    { key: "C", text: "Option C", correct: false },
    { key: "D", text: "Option D", correct: false },
  ];
  return {
    id,
    certId: "secplus-sy0-701",
    domainId: "secplus-sy0-701:domain:1",
    objectiveId: "secplus-sy0-701:obj:1.1",
    stem,
    choices: choices.length > 0 ? (choices as Choice[]) : defaultChoices,
    explanation,
    difficulty: 2,
  };
}

const questions: Question[] = [
  makeQuestion(
    "q1",
    "What protocol does Kerberos use for authentication?",
    "Kerberos uses tickets to authenticate users in a network.",
    [
      { key: "A", text: "UDP port 88", correct: true },
      { key: "B", text: "TCP port 443", correct: false },
      { key: "C", text: "UDP port 53", correct: false },
      { key: "D", text: "TCP port 22", correct: false },
    ]
  ),
  makeQuestion(
    "q2",
    "Which encryption algorithm uses asymmetric keys?",
    "RSA is an asymmetric algorithm using public/private key pairs.",
    [
      { key: "A", text: "AES-256", correct: false },
      { key: "B", text: "RSA", correct: true },
      { key: "C", text: "3DES", correct: false },
      { key: "D", text: "Blowfish", correct: false },
    ]
  ),
  makeQuestion(
    "q3",
    "What is a zero-day vulnerability?",
    "A zero-day is a vulnerability unknown to the vendor with no available patch.",
  ),
  makeQuestion(
    "q4",
    "Which of the following is a social engineering attack?",
    "Phishing is a social engineering technique using deceptive emails.",
    [
      { key: "A", text: "SQL injection", correct: false },
      { key: "B", text: "Buffer overflow", correct: false },
      { key: "C", text: "Phishing email", correct: true },
      { key: "D", text: "Kerberoasting attack", correct: false },
    ]
  ),
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("searchQuestions", () => {
  it("matches by stem substring", () => {
    const results = searchQuestions(questions, "kerberos");
    expect(results.map((q) => q.id)).toContain("q1");
  });

  it("matches by explanation substring", () => {
    const results = searchQuestions(questions, "public/private key");
    expect(results.map((q) => q.id)).toContain("q2");
  });

  it("matches by choice text", () => {
    // "Kerberoasting attack" is in a choice for q4
    const results = searchQuestions(questions, "kerberoasting");
    expect(results.map((q) => q.id)).toContain("q4");
  });

  it("is case-insensitive", () => {
    const lower = searchQuestions(questions, "kerberos");
    const upper = searchQuestions(questions, "KERBEROS");
    const mixed = searchQuestions(questions, "Kerberos");
    expect(lower.map((q) => q.id)).toEqual(upper.map((q) => q.id));
    expect(lower.map((q) => q.id)).toEqual(mixed.map((q) => q.id));
  });

  it("empty query returns nothing", () => {
    expect(searchQuestions(questions, "")).toHaveLength(0);
    expect(searchQuestions(questions, "   ")).toHaveLength(0);
  });

  it("enforces limit of 50 results", () => {
    // Create 60 questions all matching "test"
    const manyQuestions = Array.from({ length: 60 }, (_, i) =>
      makeQuestion(`bulk-${i}`, `test question ${i}`, "explanation")
    );
    const results = searchQuestions(manyQuestions, "test", 50);
    expect(results.length).toBeLessThanOrEqual(50);
  });

  it("returns empty for query with no matches", () => {
    const results = searchQuestions(questions, "xyznotfound12345");
    expect(results).toHaveLength(0);
  });
});
