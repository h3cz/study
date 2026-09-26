import { describe, expect, it } from "vitest";
import { AZ104_ACRONYMS, AZ104_FLASHCARDS, AZ104_PERF_QUESTIONS, AZ104_QUESTIONS } from "@/content/az-104-bank";
import { SEED_DATA, CONTENT_VERSION, perfQuestions } from "@/content/seed";
import { newCertAcronyms } from "@/content/acronyms-newcerts";
import { getCert } from "@/lib/certs";

describe("AZ-104 publishable content contract", () => {
  const cert = getCert("az-104");
  const scoped = [...AZ104_QUESTIONS, ...AZ104_FLASHCARDS, ...AZ104_PERF_QUESTIONS];
  it("has globally unique stable IDs and valid cert/domain/objective references", () => {
    const all = [...scoped, ...AZ104_ACRONYMS];
    expect(new Set(all.map(q => q.id)).size).toBe(all.length);
    for (const q of all) expect(q.certId, q.id).toBe("az-104");
    for (const q of scoped) {
      const domain = cert.domains.find(d => q.domainId === `az-104:domain:${d.code}`);
      expect(domain, q.id).toBeDefined();
      expect(domain?.objectives.some(o => q.objectiveId === `az-104:obj:${o.code}`), q.id).toBe(true);
    }
  });
  it("requires four distinct A-D choices, one answer, explanation, and valid difficulty", () => {
    for (const q of AZ104_QUESTIONS) {
      expect(q.choices.map(c => c.key), q.id).toEqual(["A", "B", "C", "D"]);
      expect(q.choices.filter(c => c.correct), q.id).toHaveLength(1);
      expect(new Set(q.choices.map(c => c.text.trim())).size, q.id).toBe(4);
      expect(q.stem.trim().length, q.id).toBeGreaterThan(0);
      expect(q.explanation.trim().length, q.id).toBeGreaterThan(0);
      expect(Number.isInteger(q.difficulty) && q.difficulty >= 1 && q.difficulty <= 5, q.id).toBe(true);
    }
  });
  it("has no verbatim duplicate MCQ stems or ambiguous duplicate matching targets", () => {
    expect(new Set(AZ104_QUESTIONS.map(q => q.stem.toLowerCase().trim())).size).toBe(AZ104_QUESTIONS.length);
    for (const q of AZ104_PERF_QUESTIONS) {
      expect(new Set(q.pairs.map(p => p.left)).size, q.id).toBe(q.pairs.length);
      expect(new Set(q.pairs.map(p => p.right)).size, q.id).toBe(q.pairs.length);
    }
  });
  it("keeps domain representation inside the published April 2026 ranges", () => {
    const ranges = [[.2, .25], [.15, .2], [.2, .25], [.15, .2], [.1, .15]];
    expect(cert.domains.reduce((sum, d) => sum + d.weight, 0)).toBeCloseTo(1);
    cert.domains.forEach((d, i) => {
      const proportion = AZ104_QUESTIONS.filter(q => q.domainId === `az-104:domain:${d.code}`).length / AZ104_QUESTIONS.length;
      expect(proportion).toBeGreaterThanOrEqual(ranges[i][0]);
      expect(proportion).toBeLessThanOrEqual(ranges[i][1]);
      expect(d.weight).toBeGreaterThanOrEqual(ranges[i][0]);
      expect(d.weight).toBeLessThanOrEqual(ranges[i][1]);
    });
  });
  it("does not teach an answer-letter shortcut", () => {
    for (const key of ["A", "B", "C", "D"]) {
      const share = AZ104_QUESTIONS.filter(q => q.choices.find(c => c.correct)?.key === key).length / AZ104_QUESTIONS.length;
      expect(share).toBeGreaterThan(.15);
      expect(share).toBeLessThan(.35);
    }
  });
  it("preserves technical names and prose when answer positions change", () => {
    expect(AZ104_QUESTIONS.find(q => q.id === "az104-3-3.1-001")?.explanation).toContain("B-series is burstable");
    expect(AZ104_QUESTIONS.find(q => q.id === "az104-3-3.1-001")?.explanation).toContain("D-series is general-purpose");
    expect(AZ104_QUESTIONS.find(q => q.id === "az104-1-1.5-105")?.explanation).toContain("A supported move can change the resource ID");
  });
  it("wires all content modes into reseeding and matches the announced counts", () => {
    expect(CONTENT_VERSION).toBeGreaterThan(1);
    expect(AZ104_QUESTIONS).toHaveLength(160);
    expect(AZ104_FLASHCARDS).toHaveLength(60);
    expect(AZ104_PERF_QUESTIONS).toHaveLength(8);
    expect(AZ104_ACRONYMS).toHaveLength(40);
    for (const q of AZ104_QUESTIONS) expect(SEED_DATA.questions).toContainEqual(q);
    for (const q of AZ104_FLASHCARDS) expect(SEED_DATA.flashcards).toContainEqual(q);
    for (const q of AZ104_PERF_QUESTIONS) expect(perfQuestions).toContainEqual(q);
    for (const q of AZ104_ACRONYMS) expect(newCertAcronyms).toContainEqual(q);
    expect(cert.scoreMin).toBe(1);
    expect(cert.passingScore).toBe(700);
    expect(cert.scoreMax).toBe(1000);
  });
});
