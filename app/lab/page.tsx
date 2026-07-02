import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { isBankImportEnabled } from "@/lib/feature-flags";

type LinkItem = {
  href: string;
  label: string;
  description: string;
  external?: boolean;
};

const labLinks: LinkItem[] = [
  {
    href: "https://github.com/h3cz/study",
    label: "Fork the public starter",
    description: "Start from the clean open-source repo.",
    external: true,
  },
  {
    href: "/docs/class-pack-template.zip",
    label: "Download the class pack",
    description: "JSON, CSV, source checklist, and peer-review checklist.",
  },
  {
    href: "/docs/hecz-dev-study-lab-deck.pptx",
    label: "Open the brand deck",
    description: "hecz.dev-style starter-kit presentation.",
  },
  {
    href: "/docs/hecz-study-lab-deck.pptx",
    label: "Open the classroom deck",
    description: "Structured version for instructors and class sessions.",
  },
];

const docLinks: LinkItem[] = [
  {
    href: "/docs/build-your-bank.html",
    label: "Build your bank",
    description: "Question-writing rules and source hygiene.",
  },
  {
    href: "/docs/import-format.html",
    label: "Import format",
    description: "CSV and JSON shape for local/forked labs.",
  },
  {
    href: "/docs/hecz-class-lab.html",
    label: "Class lab handout",
    description: "Timing, rubric, and student deliverables.",
  },
];

function ActionLink({ item, primary = false }: { item: LinkItem; primary?: boolean }) {
  const style: CSSProperties = {
    display: "block",
    border: `1px solid ${primary ? "rgba(245,166,35,0.55)" : "var(--border)"}`,
    borderRadius: "var(--r-md)",
    padding: "16px",
    background: primary ? "rgba(245,166,35,0.08)" : "var(--surface)",
    textDecoration: "none",
  };

  const content = (
    <>
      <p
        style={{
          color: primary ? "var(--accent)" : "var(--fg)",
          fontSize: "15px",
          fontWeight: 700,
          fontFamily: "var(--font-sans)",
          marginBottom: "5px",
        }}
      >
        {item.label}
      </p>
      <p style={{ color: "var(--fg-muted)", fontSize: "13px", lineHeight: 1.45 }}>
        {item.description}
      </p>
    </>
  );

  if (item.external) {
    return (
      <a href={item.href} style={style} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} style={style}>
      {content}
    </Link>
  );
}

function Lane({
  eyebrow,
  title,
  body,
  points,
  tone,
}: {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  tone: "prod" | "lab";
}) {
  return (
    <section
      style={{
        background: tone === "prod" ? "var(--surface)" : "rgba(245,166,35,0.06)",
        border: `1px solid ${tone === "prod" ? "var(--border)" : "rgba(245,166,35,0.34)"}`,
        borderRadius: "var(--r-md)",
        padding: "22px",
      }}
    >
      <p
        className="font-mono"
        style={{
          color: tone === "prod" ? "var(--fg-subtle)" : "var(--accent)",
          fontSize: "10px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "10px",
        }}
      >
        {eyebrow}
      </p>
      <h2 style={{ color: "var(--fg)", fontSize: "22px", lineHeight: 1.1, fontWeight: 700, marginBottom: "10px" }}>
        {title}
      </h2>
      <p style={{ color: "var(--fg-muted)", fontSize: "14px", lineHeight: 1.6, marginBottom: "14px" }}>
        {body}
      </p>
      <ul style={{ color: "var(--fg-muted)", fontSize: "13px", lineHeight: 1.7, paddingLeft: "18px" }}>
        {points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </section>
  );
}

export default function LabPage() {
  const bankImportEnabled = isBankImportEnabled();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 pb-24">
      <div style={{ display: "grid", gap: "28px" }}>
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "24px",
            alignItems: "center",
          }}
        >
          <div>
            <p
              className="font-mono"
              style={{
                color: "var(--accent)",
                fontSize: "11px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Hecz study lab
            </p>
            <h1
              className="font-display"
              style={{
                color: "var(--fg)",
                fontSize: "clamp(44px, 9vw, 86px)",
                lineHeight: 0.9,
                fontWeight: 400,
                marginBottom: "16px",
                maxWidth: "760px",
              }}
            >
              Official study app. Open-source lab.
            </h1>
            <p style={{ color: "var(--fg-muted)", fontSize: "16px", lineHeight: 1.65, maxWidth: "680px" }}>
              The production app is the curated Hecz study experience. The public repo is the starter kit for people who
              want to fork it, build their own question bank, and run a local class lab.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
              <Link
                href="/practice"
                style={{
                  height: "42px",
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
                Study in prod
              </Link>
              <a
                href="https://github.com/h3cz/study"
                target="_blank"
                rel="noreferrer"
                style={{
                  height: "42px",
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
                Fork the lab
              </a>
            </div>
          </div>

          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              overflow: "hidden",
              background: "var(--surface)",
            }}
          >
            <Image
              src="/brand/github-social-preview.jpg"
              alt="hecz / study preview"
              width={1200}
              height={630}
              style={{ width: "100%", height: "auto", display: "block" }}
              priority
            />
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "14px",
          }}
        >
          <Lane
            eyebrow="Production"
            title="Curated Hecz study app"
            body="Use this when the goal is studying with the official bank and app behavior."
            points={[
              "Bank import is locked unless explicitly enabled.",
              "Official content remains the default experience.",
              "Learners should start with Practice, Review, Flashcards, and Compete.",
            ]}
            tone="prod"
          />
          <Lane
            eyebrow="Lab / fork"
            title="Build your own bank"
            body="Use this when the goal is teaching, remixing, or creating a personal/classroom question bank."
            points={[
              "Local development enables import automatically.",
              "Deployed forks can set NEXT_PUBLIC_ENABLE_BANK_IMPORT=true.",
              "Students bring allowed notes, labs, and source-checked resources.",
            ]}
            tone="lab"
          />
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "18px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              padding: "22px",
            }}
          >
            <p
              className="font-mono"
              style={{
                color: "var(--accent)",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              First lab run
            </p>
            <h2 style={{ color: "var(--fg)", fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
              The workflow is intentionally small.
            </h2>
            <div
              className="font-mono"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-sm)",
                padding: "14px",
                color: "var(--fg)",
                fontSize: "13px",
                lineHeight: 1.7,
                marginBottom: "12px",
              }}
            >
              notes -&gt; bank -&gt; practice -&gt; misses -&gt; better explanations
            </div>
            <ol style={{ color: "var(--fg-muted)", fontSize: "14px", lineHeight: 1.7, paddingLeft: "18px" }}>
              <li>Fork or clone the public starter.</li>
              <li>Pick one narrow topic.</li>
              <li>Write five original questions and three flashcards.</li>
              <li>Import locally, run a short session, and revise weak explanations.</li>
            </ol>
          </div>

          <aside
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-md)",
              padding: "18px",
              display: "grid",
              gap: "10px",
            }}
          >
            <p
              className="font-mono"
              style={{
                color: bankImportEnabled ? "var(--success)" : "var(--fg-subtle)",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Import status
            </p>
            <h2 style={{ color: "var(--fg)", fontSize: "18px", fontWeight: 700 }}>
              {bankImportEnabled ? "Importer enabled here" : "Importer locked here"}
            </h2>
            <p style={{ color: "var(--fg-muted)", fontSize: "13px", lineHeight: 1.55 }}>
              {bankImportEnabled
                ? "This environment can upload JSON or CSV banks into local browser storage."
                : "This production build keeps custom bank import off. Use local development or an enabled fork."}
            </p>
            <Link
              href="/import"
              style={{
                height: "40px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 14px",
                border: `1px solid ${bankImportEnabled ? "var(--accent)" : "var(--border-strong)"}`,
                color: bankImportEnabled ? "var(--accent)" : "var(--fg-muted)",
                borderRadius: "var(--r-sm)",
                fontSize: "13px",
                textDecoration: "none",
              }}
            >
              View import page
            </Link>
          </aside>
        </section>

        <section>
          <div style={{ marginBottom: "12px" }}>
            <p
              className="font-mono"
              style={{
                color: "var(--accent)",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Starter kit
            </p>
            <h2 style={{ color: "var(--fg)", fontSize: "24px", fontWeight: 700 }}>
              Share one page, not scattered links.
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            {labLinks.map((item, index) => (
              <ActionLink key={item.href} item={item} primary={index === 0} />
            ))}
          </div>
        </section>

        <section>
          <div style={{ marginBottom: "12px" }}>
            <p
              className="font-mono"
              style={{
                color: "var(--fg-subtle)",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Reference
            </p>
            <h2 style={{ color: "var(--fg)", fontSize: "24px", fontWeight: 700 }}>
              Docs for instructors and builders.
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            {docLinks.map((item) => (
              <ActionLink key={item.href} item={item} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
