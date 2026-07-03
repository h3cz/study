import { describe, expect, it } from "vitest";
import { importSummary, parseBankImportText } from "@/lib/bank-import";

describe("bank import parser", () => {
  it("parses the JSON authoring format into app question rows", () => {
    const parsed = parseBankImportText(
      JSON.stringify({
        questions: [
          {
            id: "class-q-1",
            certId: "secplus-sy0-701",
            objective: "1.2",
            source: { title: "Class notes", author: "JR", license: "Original" },
            stem: "Which property checks whether data changed?",
            choices: [
              { key: "A", text: "Availability" },
              { key: "B", text: "Integrity" },
              { key: "C", text: "Confidentiality" },
              { key: "D", text: "Obfuscation" },
            ],
            correctKey: "B",
            explanation: "Integrity is the property that protects accuracy and detects unauthorized change.",
            difficulty: 2,
          },
        ],
      }),
      "bank.json"
    );

    expect(parsed.errors).toEqual([]);
    expect(parsed.questions).toHaveLength(1);
    expect(parsed.questions[0]).toMatchObject({
      id: "class-q-1",
      certId: "secplus-sy0-701",
      domainId: "secplus-sy0-701:domain:1",
      objectiveId: "secplus-sy0-701:obj:1.2",
      difficulty: 2,
    });
    expect(parsed.questions[0].choices.filter((choice) => choice.correct)).toEqual([
      { key: "B", text: "Integrity", correct: true },
    ]);
  });

  it("parses CSV questions", () => {
    const parsed = parseBankImportText(
      [
        "id,certId,objective,stem,a,b,c,d,correctKey,explanation,difficulty,sourceTitle",
        "csv-q-1,secplus-sy0-701,1.1,\"Which control uses systems?\",Physical,Technical,Managerial,Directive,B,\"MFA is a technical control.\",1,Class notes",
      ].join("\n"),
      "questions.csv"
    );

    expect(parsed.errors).toEqual([]);
    expect(importSummary(parsed)).toEqual({
      questions: 1,
      flashcards: 0,
      perfQuestions: 0,
      acronyms: 0,
    });
    expect(parsed.questions[0].choices[1]).toEqual({
      key: "B",
      text: "Technical",
      correct: true,
    });
  });

  it("reports validation errors before importing bad banks", () => {
    const parsed = parseBankImportText(
      JSON.stringify({
        questions: [
          {
            objective: "9.9",
            stem: "",
            choices: [{ key: "A", text: "Only one choice" }],
            correctKey: "A",
            explanation: "",
          },
        ],
      }),
      "bad.json"
    );

    expect(parsed.questions).toHaveLength(0);
    expect(parsed.errors.join(" ")).toContain("stem is required");
    expect(parsed.errors.join(" ")).toContain("explanation is required");
    expect(parsed.errors.join(" ")).toContain("objective is missing");
  });

  it("supports flashcards, PBQs, and acronyms in JSON banks", () => {
    const parsed = parseBankImportText(
      JSON.stringify({
        flashcards: [
          {
            certId: "secplus-sy0-701",
            objective: "1.2",
            front: "CIA?",
            back: "Confidentiality, Integrity, Availability",
          },
        ],
        pbqs: [
          {
            certId: "secplus-sy0-701",
            objective: "1.1",
            prompt: "Match controls",
            leftLabel: "Example",
            rightLabel: "Category",
            pairs: [
              { left: "MFA", right: "Technical" },
              { left: "Door lock", right: "Physical" },
            ],
            explanation: "Controls are grouped by implementation.",
          },
        ],
        acronyms: [
          {
            certId: "secplus-sy0-701",
            acronym: "CIA",
            expansion: "Confidentiality, Integrity, Availability",
            domainHint: 1,
          },
        ],
      }),
      "mixed.json"
    );

    expect(parsed.errors).toEqual([]);
    expect(importSummary(parsed)).toEqual({
      questions: 0,
      flashcards: 1,
      perfQuestions: 1,
      acronyms: 1,
    });
  });
});
