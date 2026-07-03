import Link from "next/link";
import { QuestionBankImporter } from "@/components/QuestionBankImporter";
import { isBankImportEnabled } from "@/lib/feature-flags";

function ImportLocked() {
  return (
    <section
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        padding: "22px",
        display: "grid",
        gap: "14px",
      }}
    >
      <div>
        <p
          className="font-mono"
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginBottom: "8px",
          }}
        >
          Local lab feature
        </p>
        <h2
          style={{
            fontSize: "22px",
            lineHeight: 1.15,
            color: "var(--fg)",
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            marginBottom: "8px",
          }}
        >
          Bank import is locked on the production study app.
        </h2>
        <p style={{ color: "var(--fg-muted)", fontSize: "14px", lineHeight: 1.6 }}>
          The official Hecz study app uses the curated production bank. Importing custom banks is available for local labs,
          forks, and classroom builds so people can make their own study loop without changing this production experience.
        </p>
      </div>

      <div
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-sm)",
          padding: "14px",
        }}
      >
        <p className="font-mono" style={{ color: "var(--fg)", fontSize: "13px", lineHeight: 1.6 }}>
          NEXT_PUBLIC_ENABLE_BANK_IMPORT=true
        </p>
        <p style={{ color: "var(--fg-subtle)", fontSize: "12px", lineHeight: 1.5, marginTop: "6px" }}>
          Set this in a deployed lab fork, or run the app locally with <span className="font-mono">npm run dev</span>.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        <Link
          href="/lab"
          style={{
            height: "40px",
            display: "inline-flex",
            alignItems: "center",
            padding: "0 14px",
            background: "var(--accent)",
            color: "var(--accent-fg)",
            borderRadius: "var(--r-sm)",
            fontSize: "13px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Open lab hub
        </Link>
        <a
          href="/docs/class-pack-template.zip"
          style={{
            height: "40px",
            display: "inline-flex",
            alignItems: "center",
            padding: "0 14px",
            border: "1px solid var(--border-strong)",
            color: "var(--fg)",
            borderRadius: "var(--r-sm)",
            fontSize: "13px",
            textDecoration: "none",
          }}
        >
          Download class pack
        </a>
      </div>
    </section>
  );
}

export default function ImportPage() {
  const bankImportEnabled = isBankImportEnabled();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 pb-24">
      <div style={{ display: "grid", gap: "18px" }}>
        <div>
          <p
            className="font-mono"
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--accent)",
              marginBottom: "8px",
            }}
          >
            Bring your own bank
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(34px, 8vw, 56px)",
              lineHeight: 0.95,
              color: "var(--fg)",
              fontWeight: 400,
              marginBottom: "12px",
            }}
          >
            Import a study bank
          </h1>
          <p style={{ color: "var(--fg-muted)", fontSize: "15px", lineHeight: 1.6, maxWidth: "640px" }}>
            {bankImportEnabled
              ? "Upload original class questions, flashcards, matching drills, and acronyms. Everything is saved locally on this device first."
              : "The official production app keeps imports locked. Use a local lab or enabled fork to bring your own bank."}
          </p>
        </div>

        {bankImportEnabled ? (
          <section
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              padding: "20px",
            }}
          >
            <QuestionBankImporter />
          </section>
        ) : (
          <ImportLocked />
        )}

        <section
          style={{
            display: "grid",
            gap: "10px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "18px 20px",
          }}
        >
          <h2
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-muted)",
              fontFamily: "var(--font-sans)",
            }}
          >
            Before you import
          </h2>
          <ul style={{ color: "var(--fg-muted)", fontSize: "13px", lineHeight: 1.7, paddingLeft: "18px" }}>
            <li>Use your own notes, labs, instructor-approved material, or openly licensed resources.</li>
            <li>Do not import exam dumps, leaked questions, or copied paid-course banks.</li>
            <li>Keep a source note so classmates can review accuracy and reuse rights.</li>
          </ul>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/docs/build-your-bank.html" style={{ color: "var(--accent)", fontSize: "13px" }}>
              Build guide
            </Link>
            <Link href="/docs/class-lab.html" style={{ color: "var(--accent)", fontSize: "13px" }}>
              Class lab
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
