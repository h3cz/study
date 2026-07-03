"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, FileJson, Upload } from "lucide-react";
import { db, seedDb } from "@/lib/db";
import {
  importSummary,
  parseBankImportText,
  type ParsedBankImport,
} from "@/lib/bank-import";

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface-2)",
        borderRadius: "var(--r-sm)",
        padding: "10px 12px",
        minWidth: 0,
      }}
    >
      <p
        className="font-mono"
        style={{
          fontSize: "10px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--fg-subtle)",
          marginBottom: "3px",
        }}
      >
        {label}
      </p>
      <p className="font-mono" style={{ fontSize: "20px", color: "var(--fg)" }}>
        {value}
      </p>
    </div>
  );
}

export function QuestionBankImporter() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedBankImport | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const summary = useMemo(() => parsed ? importSummary(parsed) : null, [parsed]);
  const importable =
    parsed &&
    parsed.errors.length === 0 &&
    (parsed.questions.length + parsed.flashcards.length + parsed.perfQuestions.length + parsed.acronyms.length) > 0;

  async function handleFile(file: File | null) {
    setResult(null);
    setFileName(file?.name ?? null);
    if (!file) {
      setParsed(null);
      return;
    }
    const text = await file.text();
    setParsed(parseBankImportText(text, file.name));
  }

  async function handleImport() {
    if (!parsed || !importable) return;
    setBusy(true);
    setResult(null);
    try {
      await seedDb();
      await db.transaction(
        "rw",
        [db.questions, db.flashcards, db.perfQuestions, db.acronyms],
        async () => {
          if (parsed.questions.length) await db.questions.bulkPut(parsed.questions);
          if (parsed.flashcards.length) await db.flashcards.bulkPut(parsed.flashcards);
          if (parsed.perfQuestions.length) await db.perfQuestions.bulkPut(parsed.perfQuestions);
          if (parsed.acronyms.length) await db.acronyms.bulkPut(parsed.acronyms);
        }
      );
      const totals = importSummary(parsed);
      setResult(
        `Imported ${totals.questions} questions, ${totals.flashcards} flashcards, ${totals.perfQuestions} PBQs, and ${totals.acronyms} acronyms.`
      );
    } catch {
      setResult("Import failed. Check the file, refresh, and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "16px",
      }}
    >
      <label
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          border: "1px dashed var(--border-strong)",
          background: "var(--surface)",
          borderRadius: "var(--r-md)",
          padding: "22px",
          cursor: "pointer",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--fg)" }}>
          <FileJson size={20} color="var(--accent)" aria-hidden="true" />
          <span style={{ fontSize: "15px", fontWeight: 700, fontFamily: "var(--font-sans)" }}>
            Choose a JSON or CSV bank
          </span>
        </span>
        <span style={{ fontSize: "13px", color: "var(--fg-muted)", lineHeight: 1.5 }}>
          JSON can include questions, flashcards, PBQs, and acronyms. CSV imports multiple-choice questions.
        </span>
        <input
          type="file"
          accept=".json,.csv,application/json,text/csv"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          style={{ display: "none" }}
        />
      </label>

      {fileName && (
        <p className="font-mono" style={{ fontSize: "12px", color: "var(--fg-muted)" }}>
          Selected: {fileName}
        </p>
      )}

      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "8px",
          }}
        >
          <Metric label="Questions" value={summary.questions} />
          <Metric label="Flashcards" value={summary.flashcards} />
          <Metric label="PBQs" value={summary.perfQuestions} />
          <Metric label="Acronyms" value={summary.acronyms} />
        </div>
      )}

      {parsed?.errors.length ? (
        <div
          role="alert"
          style={{
            border: "1px solid rgba(229,92,92,0.45)",
            background: "rgba(229,92,92,0.08)",
            borderRadius: "var(--r-md)",
            padding: "14px",
          }}
        >
          <p style={{ display: "flex", gap: "8px", alignItems: "center", color: "var(--error)", fontWeight: 700 }}>
            <AlertCircle size={16} aria-hidden="true" />
            Fix these before importing
          </p>
          <ul style={{ marginTop: "8px", paddingLeft: "18px", color: "var(--fg-muted)", fontSize: "13px", lineHeight: 1.5 }}>
            {parsed.errors.slice(0, 8).map((error) => <li key={error}>{error}</li>)}
            {parsed.errors.length > 8 && <li>{parsed.errors.length - 8} more errors.</li>}
          </ul>
        </div>
      ) : null}

      {parsed?.warnings.length ? (
        <div
          style={{
            border: "1px solid rgba(245,166,35,0.36)",
            background: "rgba(245,166,35,0.06)",
            borderRadius: "var(--r-md)",
            padding: "14px",
            color: "var(--fg-muted)",
            fontSize: "13px",
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "var(--accent)" }}>Review before sharing:</strong>{" "}
          {parsed.warnings.slice(0, 3).join(" ")}
        </div>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
        <button
          type="button"
          onClick={handleImport}
          disabled={!importable || busy}
          style={{
            height: "44px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "0 16px",
            border: "none",
            borderRadius: "var(--r-sm)",
            background: importable ? "var(--accent)" : "var(--border-strong)",
            color: importable ? "var(--accent-fg)" : "var(--fg-muted)",
            fontWeight: 700,
            fontFamily: "var(--font-sans)",
            cursor: importable && !busy ? "pointer" : "default",
          }}
        >
          <Upload size={16} aria-hidden="true" />
          {busy ? "Importing..." : "Import to this device"}
        </button>
        <Link href="/docs/class-pack-template.zip" style={{ color: "var(--accent)", fontSize: "13px" }}>
          Download class pack
        </Link>
        <Link href="/docs/import-format.html" style={{ color: "var(--fg-muted)", fontSize: "13px" }}>
          Format guide
        </Link>
      </div>

      {result && (
        <p
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: result.startsWith("Imported") ? "var(--success)" : "var(--error)",
            fontSize: "13px",
          }}
        >
          {result.startsWith("Imported") && <CheckCircle2 size={16} aria-hidden="true" />}
          {result}
        </p>
      )}
    </div>
  );
}
