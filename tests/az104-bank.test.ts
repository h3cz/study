import { describe, expect, it } from "vitest";
import { AZ104_ACRONYMS, AZ104_FLASHCARDS, AZ104_PERF_QUESTIONS, AZ104_QUESTIONS } from "@/content/az-104-bank";
import { SEED_DATA, CONTENT_VERSION, perfQuestions } from "@/content/seed";
import { newCertAcronyms } from "@/content/acronyms-newcerts";
import { getCert } from "@/lib/certs";
import { AZ104_CASE_STUDIES } from "@/content/az104-case-studies";
import audit from "@/docs/az104-review/difficulty-audit.json";
import sourceChecks from "@/docs/az104-review/source-link-check.json";
import { fullQuestionStem } from "@/lib/question-context";

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
    expect(CONTENT_VERSION).toBeGreaterThan(2);
    expect(AZ104_QUESTIONS).toHaveLength(190);
    expect(AZ104_FLASHCARDS).toHaveLength(60);
    expect(AZ104_PERF_QUESTIONS).toHaveLength(20);
    expect(AZ104_ACRONYMS).toHaveLength(40);
    for (const q of AZ104_QUESTIONS) expect(SEED_DATA.questions).toContainEqual(q);
    for (const q of AZ104_FLASHCARDS) expect(SEED_DATA.flashcards).toContainEqual(q);
    for (const q of AZ104_PERF_QUESTIONS) expect(perfQuestions).toContainEqual(q);
    for (const q of AZ104_ACRONYMS) expect(newCertAcronyms).toContainEqual(q);
    expect(cert.scoreMin).toBe(1);
    expect(cert.passingScore).toBe(700);
    expect(cert.scoreMax).toBe(1000);
  });
  it("provides six complete original case groups with usable standalone context", () => {
    expect(AZ104_CASE_STUDIES).toHaveLength(6);
    const ids = AZ104_CASE_STUDIES.flatMap(study => study.questionIds);
    expect(new Set(ids).size).toBe(30);
    for (const study of AZ104_CASE_STUDIES) {
      expect(study.questionIds.length).toBeGreaterThanOrEqual(4);
      expect(study.questionIds.length).toBeLessThanOrEqual(6);
      expect(study.scenario.length).toBeGreaterThan(300);
      for (const id of study.questionIds) {
        const question = AZ104_QUESTIONS.find(q => q.id === id)!;
        expect(question?.caseStudyId, id).toBe(study.id);
        expect(fullQuestionStem(question), id).toContain(study.scenario);
      }
    }
    expect(AZ104_QUESTIONS.filter(q => q.caseStudyId).map(q => q.id).sort()).toEqual(ids.sort());
  });
  it("records a rationale for every rating and preserves every baseline question", () => {
    expect(audit.questions).toHaveLength(AZ104_QUESTIONS.length);
    expect(new Set(audit.questions.map(row => row.id)).size).toBe(audit.questions.length);
    expect(audit.questions.filter(row => row.previous !== null)).toHaveLength(160);
    expect(audit.questions.filter(row => row.changed)).toHaveLength(86);
    for (const q of AZ104_QUESTIONS) {
      const row = audit.questions.find(row => row.id === q.id);
      expect(row?.difficulty, q.id).toBe(q.difficulty);
      expect(row?.reason.length, q.id).toBeGreaterThan(20);
      expect(row?.sourceUrls, q.id).toEqual(q.sourceUrls);
    }
  });
  it("has checked Microsoft Learn evidence for every MCQ and matching drill", () => {
    for (const q of [...AZ104_QUESTIONS, ...AZ104_PERF_QUESTIONS]) {
      expect(q.sourceUrls?.length, q.id).toBeGreaterThan(0);
      for (const url of q.sourceUrls ?? []) {
        expect(new URL(url).hostname).toBe("learn.microsoft.com");
        expect(new URL(url).protocol).toBe("https:");
        expect(sourceChecks.find(check => check.url === url)?.status, url).toBe(200);
      }
    }
    const added = AZ104_PERF_QUESTIONS.filter(q => /-10[1-3]$/.test(q.id));
    expect(added).toHaveLength(12);
    expect(new Set(added.map(q => q.domainId)).size).toBe(5);
  });
});
