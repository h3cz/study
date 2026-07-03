import type {
  Certification,
  Domain,
  Flashcard,
  Objective,
  PerfQuestion,
  Question,
} from "@/lib/db";
import { liveCerts } from "@/lib/certs";
import {
  LOCAL_FLASHCARDS,
  LOCAL_PERF_QUESTIONS,
  LOCAL_QUESTIONS,
} from "./local-bank";

export const CONTENT_VERSION = 1;

const certifications: Certification[] = liveCerts().map((cert) => ({
  id: cert.id,
  name: `${cert.fullName} ${cert.version}`,
  vendor: cert.vendor,
  version: cert.version,
  passingScore: cert.passingScore,
}));

const domains: Domain[] = liveCerts().flatMap((cert) =>
  cert.domains.map((domain) => ({
    id: `${cert.id}:domain:${domain.code}`,
    certId: cert.id,
    number: Number(domain.code),
    name: domain.name,
    weight: domain.weight,
  }))
);

const objectives: Objective[] = liveCerts().flatMap((cert) =>
  cert.domains.flatMap((domain) =>
    domain.objectives.map((objective) => ({
      id: `${cert.id}:obj:${objective.code}`,
      certId: cert.id,
      domainId: `${cert.id}:domain:${domain.code}`,
      code: objective.code,
      name: objective.name,
    }))
  )
);

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export const SEED_DATA: {
  certifications: Certification[];
  domains: Domain[];
  objectives: Objective[];
  questions: Question[];
  flashcards: Flashcard[];
} = {
  certifications,
  domains,
  objectives,
  questions: dedupeById(LOCAL_QUESTIONS),
  flashcards: dedupeById(LOCAL_FLASHCARDS),
};

export const perfQuestions: PerfQuestion[] = dedupeById(LOCAL_PERF_QUESTIONS);
