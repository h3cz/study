import type { Acronym, Difficulty, Flashcard, PerfQuestion, Question } from "@/lib/db";
import { DEFAULT_CERT_ID, getCert } from "@/lib/certs";

const CHOICE_KEYS = ["A", "B", "C", "D"] as const;
type ChoiceKey = (typeof CHOICE_KEYS)[number];

export interface BankImportSource {
  title?: string;
  author?: string;
  url?: string;
  license?: string;
}

export interface BankImportQuestion {
  id?: string;
  certId?: string;
  domainId?: string;
  objectiveId?: string;
  objective?: string;
  source?: BankImportSource;
  stem?: string;
  choices?: { key?: string; text?: string; correct?: boolean }[];
  correctKey?: string;
  explanation?: string;
  difficulty?: number;
  tags?: string[];
}

export interface BankImportFlashcard {
  id?: string;
  certId?: string;
  domainId?: string;
  objectiveId?: string;
  objective?: string;
  front?: string;
  back?: string;
}

export interface BankImportPbq {
  id?: string;
  certId?: string;
  domainId?: string;
  objectiveId?: string;
  objective?: string;
  prompt?: string;
  leftLabel?: string;
  rightLabel?: string;
  pairs?: { left?: string; right?: string }[];
  explanation?: string;
  difficulty?: number;
}

export interface BankImportAcronym {
  id?: string;
  certId?: string;
  acronym?: string;
  expansion?: string;
  hint?: string;
  domainHint?: number;
}

export interface BankImportPayload {
  questions?: BankImportQuestion[];
  flashcards?: BankImportFlashcard[];
  pbqs?: BankImportPbq[];
  perfQuestions?: BankImportPbq[];
  acronyms?: BankImportAcronym[];
}

export interface ParsedBankImport {
  questions: Question[];
  flashcards: Flashcard[];
  perfQuestions: PerfQuestion[];
  acronyms: Acronym[];
  warnings: string[];
  errors: string[];
}

export interface ImportSummary {
  questions: number;
  flashcards: number;
  perfQuestions: number;
  acronyms: number;
}

export function parseBankImportText(text: string, fileName = "bank.json"): ParsedBankImport {
  const trimmed = text.trim();
  if (!trimmed) return emptyParsed(["File is empty."]);

  if (fileName.toLowerCase().endsWith(".csv")) {
    return normalizePayload({ questions: parseCsvQuestions(trimmed) });
  }

  try {
    const raw = JSON.parse(trimmed) as unknown;
    return normalizePayload(toPayload(raw));
  } catch {
    return emptyParsed(["Could not parse JSON. Check commas, quotes, and brackets."]);
  }
}

export function importSummary(parsed: ParsedBankImport): ImportSummary {
  return {
    questions: parsed.questions.length,
    flashcards: parsed.flashcards.length,
    perfQuestions: parsed.perfQuestions.length,
    acronyms: parsed.acronyms.length,
  };
}

function toPayload(raw: unknown): BankImportPayload {
  if (Array.isArray(raw)) return { questions: raw as BankImportQuestion[] };
  if (raw && typeof raw === "object") return raw as BankImportPayload;
  return {};
}

function emptyParsed(errors: string[]): ParsedBankImport {
  return { questions: [], flashcards: [], perfQuestions: [], acronyms: [], warnings: [], errors };
}

function normalizePayload(payload: BankImportPayload): ParsedBankImport {
  const warnings: string[] = [];
  const errors: string[] = [];
  const questions: Question[] = [];
  const flashcards: Flashcard[] = [];
  const perfQuestions: PerfQuestion[] = [];
  const acronyms: Acronym[] = [];

  const rawQuestions = Array.isArray(payload.questions) ? payload.questions : [];
  const rawFlashcards = Array.isArray(payload.flashcards) ? payload.flashcards : [];
  const rawPbqs = Array.isArray(payload.pbqs)
    ? payload.pbqs
    : Array.isArray(payload.perfQuestions)
      ? payload.perfQuestions
      : [];
  const rawAcronyms = Array.isArray(payload.acronyms) ? payload.acronyms : [];

  rawQuestions.forEach((item, index) => {
    const result = normalizeQuestion(item, index);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (result.item) questions.push(result.item);
  });

  rawFlashcards.forEach((item, index) => {
    const result = normalizeFlashcard(item, index);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (result.item) flashcards.push(result.item);
  });

  rawPbqs.forEach((item, index) => {
    const result = normalizePbq(item, index);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (result.item) perfQuestions.push(result.item);
  });

  rawAcronyms.forEach((item, index) => {
    const result = normalizeAcronym(item, index);
    errors.push(...result.errors);
    warnings.push(...result.warnings);
    if (result.item) acronyms.push(result.item);
  });

  addDuplicateWarnings("question", questions, warnings);
  addDuplicateWarnings("flashcard", flashcards, warnings);
  addDuplicateWarnings("PBQ", perfQuestions, warnings);
  addDuplicateWarnings("acronym", acronyms, warnings);

  if (
    questions.length === 0 &&
    flashcards.length === 0 &&
    perfQuestions.length === 0 &&
    acronyms.length === 0 &&
    errors.length === 0
  ) {
    errors.push("No importable questions, flashcards, PBQs, or acronyms were found.");
  }

  return {
    questions: dedupeById(questions),
    flashcards: dedupeById(flashcards),
    perfQuestions: dedupeById(perfQuestions),
    acronyms: dedupeById(acronyms),
    warnings,
    errors,
  };
}

function normalizeQuestion(
  item: BankImportQuestion,
  index: number
): { item: Question | null; warnings: string[]; errors: string[] } {
  const label = `Question ${index + 1}`;
  const warnings: string[] = [];
  const errors: string[] = [];
  const certId = clean(item.certId) || DEFAULT_CERT_ID;
  const objectiveCode = objectiveCodeFrom(item);
  const objective = resolveObjective(certId, objectiveCode, item.objectiveId);
  const stem = clean(item.stem);
  const explanation = clean(item.explanation);
  const difficulty = normalizeDifficulty(item.difficulty);
  const correctKey = normalizeChoiceKey(item.correctKey);

  if (!stem) errors.push(`${label}: stem is required.`);
  if (!explanation) errors.push(`${label}: explanation is required.`);
  if (!objective) errors.push(`${label}: objective is missing or does not exist for ${certId}.`);

  const choices = CHOICE_KEYS.map((key) => {
    const fromChoices = item.choices?.find((choice) => normalizeChoiceKey(choice.key) === key);
    return {
      key,
      text: clean(fromChoices?.text),
      correct: fromChoices?.correct === true || correctKey === key,
    };
  });

  for (const choice of choices) {
    if (!choice.text) errors.push(`${label}: choice ${choice.key} is required.`);
  }

  const correctCount = choices.filter((choice) => choice.correct).length;
  if (correctCount !== 1) errors.push(`${label}: exactly one correct answer is required.`);

  if (!item.source?.title && !item.source?.url) {
    warnings.push(`${label}: add a source note before sharing this bank.`);
  }

  if (errors.length || !objective) return { item: null, warnings, errors };

  return {
    warnings,
    errors,
    item: {
      id: clean(item.id) || stableId("import-q", certId, objective.code, stem),
      certId,
      domainId: item.domainId || domainIdFor(certId, objective.code),
      objectiveId: objective.id,
      stem,
      choices,
      explanation,
      difficulty,
    },
  };
}

function normalizeFlashcard(
  item: BankImportFlashcard,
  index: number
): { item: Flashcard | null; warnings: string[]; errors: string[] } {
  const label = `Flashcard ${index + 1}`;
  const errors: string[] = [];
  const certId = clean(item.certId) || DEFAULT_CERT_ID;
  const objective = resolveObjective(certId, objectiveCodeFrom(item), item.objectiveId);
  const front = clean(item.front);
  const back = clean(item.back);

  if (!front) errors.push(`${label}: front is required.`);
  if (!back) errors.push(`${label}: back is required.`);
  if (!objective) errors.push(`${label}: objective is missing or does not exist for ${certId}.`);
  if (errors.length || !objective) return { item: null, warnings: [], errors };

  return {
    warnings: [],
    errors,
    item: {
      id: clean(item.id) || stableId("import-fc", certId, objective.code, front),
      certId,
      domainId: item.domainId || domainIdFor(certId, objective.code),
      objectiveId: objective.id,
      front,
      back,
    },
  };
}

function normalizePbq(
  item: BankImportPbq,
  index: number
): { item: PerfQuestion | null; warnings: string[]; errors: string[] } {
  const label = `PBQ ${index + 1}`;
  const errors: string[] = [];
  const certId = clean(item.certId) || DEFAULT_CERT_ID;
  const objective = resolveObjective(certId, objectiveCodeFrom(item), item.objectiveId);
  const prompt = clean(item.prompt);
  const explanation = clean(item.explanation);
  const pairs = Array.isArray(item.pairs)
    ? item.pairs
        .map((pair) => ({ left: clean(pair.left), right: clean(pair.right) }))
        .filter((pair) => pair.left && pair.right)
    : [];

  if (!prompt) errors.push(`${label}: prompt is required.`);
  if (!explanation) errors.push(`${label}: explanation is required.`);
  if (pairs.length < 2) errors.push(`${label}: at least two valid pairs are required.`);
  if (!objective) errors.push(`${label}: objective is missing or does not exist for ${certId}.`);
  if (errors.length || !objective) return { item: null, warnings: [], errors };

  return {
    warnings: [],
    errors,
    item: {
      id: clean(item.id) || stableId("import-pbq", certId, objective.code, prompt),
      certId,
      domainId: item.domainId || domainIdFor(certId, objective.code),
      objectiveId: objective.id,
      type: "drag-match",
      prompt,
      leftLabel: clean(item.leftLabel) || "Prompt",
      rightLabel: clean(item.rightLabel) || "Match",
      pairs,
      explanation,
      difficulty: normalizeDifficulty(item.difficulty),
    },
  };
}

function normalizeAcronym(
  item: BankImportAcronym,
  index: number
): { item: Acronym | null; warnings: string[]; errors: string[] } {
  const label = `Acronym ${index + 1}`;
  const errors: string[] = [];
  const certId = clean(item.certId) || DEFAULT_CERT_ID;
  const acronym = clean(item.acronym);
  const expansion = clean(item.expansion);
  const domainHint = Number(item.domainHint);

  if (!acronym) errors.push(`${label}: acronym is required.`);
  if (!expansion) errors.push(`${label}: expansion is required.`);
  if (errors.length) return { item: null, warnings: [], errors };

  return {
    warnings: [],
    errors,
    item: {
      id: clean(item.id) || stableId("import-ac", certId, acronym, expansion),
      certId,
      acronym,
      expansion,
      hint: clean(item.hint) || undefined,
      domainHint: Number.isInteger(domainHint) && domainHint >= 1 && domainHint <= 5
        ? (domainHint as 1 | 2 | 3 | 4 | 5)
        : undefined,
    },
  };
}

function parseCsvQuestions(text: string): BankImportQuestion[] {
  const rows = parseCsvRows(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => header.trim().toLowerCase());
  return rows.slice(1).map((row) => {
    const value = (name: string) => row[headers.indexOf(name)] ?? "";
    const certId = value("certid") || value("cert");
    const objective = value("objective") || value("objectivecode");
    return {
      id: value("id"),
      certId,
      objective,
      stem: value("stem") || value("question"),
      choices: [
        { key: "A", text: value("a") || value("choicea") },
        { key: "B", text: value("b") || value("choiceb") },
        { key: "C", text: value("c") || value("choicec") },
        { key: "D", text: value("d") || value("choiced") },
      ],
      correctKey: value("correctkey") || value("correct"),
      explanation: value("explanation"),
      difficulty: Number(value("difficulty") || 1),
      source: {
        title: value("sourcetitle") || value("source"),
        author: value("sourceauthor"),
        url: value("sourceurl"),
        license: value("license"),
      },
    };
  });
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === "\"" && next === "\"") {
        cell += "\"";
        i += 1;
      } else if (char === "\"") {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === "\"") {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows.filter((cells) => cells.some((value) => value.trim()));
}

function objectiveCodeFrom(item: { objective?: string; objectiveId?: string }): string {
  if (item.objective) return clean(item.objective);
  const objectiveId = clean(item.objectiveId);
  return objectiveId.includes(":obj:") ? objectiveId.split(":obj:").pop() ?? "" : objectiveId;
}

function resolveObjective(certId: string, objectiveCode: string, objectiveId?: string) {
  const cert = getCert(certId);
  const code = objectiveCode || objectiveCodeFrom({ objectiveId });
  for (const domain of cert.domains) {
    const objective = domain.objectives.find((item) => item.code === code);
    if (objective) return { ...objective, id: `${cert.id}:obj:${objective.code}` };
  }
  return null;
}

function domainIdFor(certId: string, objectiveCode: string): string {
  return `${certId}:domain:${objectiveCode.split(".")[0] || "1"}`;
}

function normalizeDifficulty(value: number | undefined): Difficulty {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(5, Math.max(1, Math.round(n))) as Difficulty;
}

function normalizeChoiceKey(value: unknown): ChoiceKey | null {
  const key = String(value ?? "").trim().toUpperCase();
  return CHOICE_KEYS.includes(key as ChoiceKey) ? (key as ChoiceKey) : null;
}

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function stableId(prefix: string, certId: string, scope: string, text: string): string {
  const source = `${certId}:${scope}:${text.toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
  }
  return `${prefix}-${certId}-${scope.replace(/[^a-z0-9]+/gi, "-")}-${hash.toString(36)}`;
}

function addDuplicateWarnings<T extends { id: string }>(
  label: string,
  items: T[],
  warnings: string[]
): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) warnings.push(`Duplicate ${label} id "${item.id}" will be imported once.`);
    seen.add(item.id);
  }
}

function dedupeById<T extends { id: string }>(items: T[]): T[] {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}
