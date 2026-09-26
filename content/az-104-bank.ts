// AZ-104 (Microsoft Azure Administrator) question bank.
//
// All content here is original: scenarios, stems, choices, and explanations
// were authored fresh for this repo. Do not paste exam dumps or paid banks.
//
// The bank is authored in per-domain part files under ./parts and combined
// here so content/seed.ts can wire it in as a single import.
// Reviewed against Microsoft Learn on 2026-09-25. Full issue log, evidence,
// coverage limitations and paste-ready replacements: docs/az104-review/REPORT.md.
// 190 MCQs (including 30 questions in six case studies), 60 flashcards,
// 20 matching drills, 40 acronym/term drills. Difficulty audit: WORKSTREAM-1.md.
// Matching drills are learning exercises, not a reproduction of Azure exam labs.

import type { Acronym, Flashcard, PerfQuestion, Question } from "@/lib/db";

import {
  AZ104_D1_ACRONYMS,
  AZ104_D1_FLASHCARDS,
  AZ104_D1_PERF_QUESTIONS,
  AZ104_D1_QUESTIONS,
} from "./parts/az104-d1";
import {
  AZ104_D2_ACRONYMS,
  AZ104_D2_FLASHCARDS,
  AZ104_D2_PERF_QUESTIONS,
  AZ104_D2_QUESTIONS,
} from "./parts/az104-d2";
import {
  AZ104_D3_ACRONYMS,
  AZ104_D3_FLASHCARDS,
  AZ104_D3_PERF_QUESTIONS,
  AZ104_D3_QUESTIONS,
} from "./parts/az104-d3";
import {
  AZ104_D4_ACRONYMS,
  AZ104_D4_FLASHCARDS,
  AZ104_D4_PERF_QUESTIONS,
  AZ104_D4_QUESTIONS,
} from "./parts/az104-d4";
import {
  AZ104_D5_ACRONYMS,
  AZ104_D5_FLASHCARDS,
  AZ104_D5_PERF_QUESTIONS,
  AZ104_D5_QUESTIONS,
} from "./parts/az104-d5";

export const AZ104_QUESTIONS: Question[] = [
  ...AZ104_D1_QUESTIONS,
  ...AZ104_D2_QUESTIONS,
  ...AZ104_D3_QUESTIONS,
  ...AZ104_D4_QUESTIONS,
  ...AZ104_D5_QUESTIONS,
];

export const AZ104_FLASHCARDS: Flashcard[] = [
  ...AZ104_D1_FLASHCARDS,
  ...AZ104_D2_FLASHCARDS,
  ...AZ104_D3_FLASHCARDS,
  ...AZ104_D4_FLASHCARDS,
  ...AZ104_D5_FLASHCARDS,
];

export const AZ104_PERF_QUESTIONS: PerfQuestion[] = [
  ...AZ104_D1_PERF_QUESTIONS,
  ...AZ104_D2_PERF_QUESTIONS,
  ...AZ104_D3_PERF_QUESTIONS,
  ...AZ104_D4_PERF_QUESTIONS,
  ...AZ104_D5_PERF_QUESTIONS,
];

export const AZ104_ACRONYMS: Acronym[] = [
  ...AZ104_D1_ACRONYMS,
  ...AZ104_D2_ACRONYMS,
  ...AZ104_D3_ACRONYMS,
  ...AZ104_D4_ACRONYMS,
  ...AZ104_D5_ACRONYMS,
];
