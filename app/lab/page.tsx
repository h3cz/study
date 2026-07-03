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
  {
    href: "/changelog",
    label: "Read the changelog",
    description: "Recent product and public starter updates.",
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

const shareLinks: LinkItem[] = [
  {
    href: "https://study.hecz.dev/lab",
    label: "Live lab hub",
    description: "Start here when sharing with classmates.",
    external: true,
  },
  {
    href: "https://github.com/h3cz/study",
    label: "Public starter repo",
    description: "Forkable code without the private question bank.",
    external: true,
  },
  {
    href: "/docs/class-pack-template.zip",
    label: "Class pack",
    description: "Templates for questions, flashcards, sources, and peer review.",
  },
];

const demoSteps = [
  {
    label: "Pick a narrow topic",
    body: "Example: TCP vs UDP, not all of networking.",
  },
  {
    label: "Write five original MCQs",
    body: "Each question needs one best answer and explanations for the distractors.",
  },
  {
    label: "Add three flashcards",
    body: "Use these for exact facts, port numbers, acronyms, or short definitions.",
  },
  {
    label: "Track allowed sources",
    body: "Use class notes, labs, official objectives, and resources you have permission to reuse.",
  },
  {
    label: "Import, miss, revise",
    body: "Run the bank locally, review misses, then rewrite weak explanations before adding more.",
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
    <main className="lab-main mx-auto max-w-5xl px-4 py-8 pb-24">
      <style>{`
        .lab-main {
          overflow-x: hidden;
        }

        .lab-card,
        .lab-link,
        .lab-qr-card {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .lab-hero-actions a,
        .lab-share-actions a {
          white-space: nowrap;
        }

        .lab-qr {
          image-rendering: pixelated;
        }

        .lab-qr-row {
          display: grid;
          grid-template-columns: 120px minmax(0, 1fr);
          gap: 14px;
          align-items: center;
        }

        @media (max-width: 640px) {
          .lab-main {
            padding-left: 14px;
            padding-right: 14px;
          }

          .lab-hero-actions,
          .lab-share-actions {
            width: 100%;
          }

          .lab-hero-actions a,
          .lab-share-actions a {
            flex: 1 1 150px;
            justify-content: center;
          }

          .lab-qr-row {
            grid-template-columns: minmax(0, 1fr);
          }

          .lab-hero-title {
            font-size: 42px !important;
          }

          .lab-section-title {
            font-size: 21px !important;
          }
        }
      `}</style>
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
              className="font-display lab-hero-title"
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
            <div className="lab-hero-actions" style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
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
            className="lab-card"
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
            className="lab-card"
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
            <h2 className="lab-section-title" style={{ color: "var(--fg)", fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
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
            className="lab-card"
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

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "18px",
            alignItems: "stretch",
          }}
        >
          <div
            className="lab-qr-card"
            style={{
              background: "var(--surface)",
              border: "1px solid rgba(245,166,35,0.34)",
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
                  color: "var(--accent)",
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Share with class
              </p>
              <h2 className="lab-section-title" style={{ color: "var(--fg)", fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
                One scan gets everyone to the lab.
              </h2>
              <p style={{ color: "var(--fg-muted)", fontSize: "14px", lineHeight: 1.6 }}>
                Use this for a class demo, study group, or project showcase. The public repo stays clean; the official
                production app keeps its curated bank locked.
              </p>
            </div>
            <div className="lab-qr-row">
              <div
                style={{
                  background: "#fff",
                  borderRadius: "var(--r-sm)",
                  padding: "10px",
                  width: "120px",
                  height: "120px",
                }}
              >
                <Image
                  className="lab-qr"
                  src="/brand/lab-qr.svg"
                  alt="QR code for https://study.hecz.dev/lab"
                  width={100}
                  height={100}
                  unoptimized
                  style={{ display: "block", width: "100%", height: "100%" }}
                />
              </div>
              <div>
                <p className="font-mono" style={{ color: "var(--fg)", fontSize: "13px", lineHeight: 1.6 }}>
                  study.hecz.dev/lab
                </p>
                <p style={{ color: "var(--fg-muted)", fontSize: "12px", lineHeight: 1.5, marginTop: "6px" }}>
                  Short path for slides, Discord, classroom screens, and phone sharing.
                </p>
              </div>
            </div>
            <div className="lab-share-actions" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              <a
                href="/brand/lab-qr.svg"
                download
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
                Download QR
              </a>
              <Link
                href="/changelog"
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
                See updates
              </Link>
            </div>
          </div>

          <div
            className="lab-card"
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
                color: "var(--fg-subtle)",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Share links
            </p>
            <h2 className="lab-section-title" style={{ color: "var(--fg)", fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
              Class handoff checklist.
            </h2>
            <div style={{ display: "grid", gap: "10px" }}>
              {shareLinks.map((item, index) => (
                <ActionLink key={item.href} item={item} primary={index === 0} />
              ))}
            </div>
          </div>
        </section>

        <section
          className="lab-card"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            padding: "22px",
          }}
        >
          <div style={{ marginBottom: "14px" }}>
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
              Demo bank walkthrough
            </p>
            <h2 className="lab-section-title" style={{ color: "var(--fg)", fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
              Start with five questions before building a full bank.
            </h2>
            <p style={{ color: "var(--fg-muted)", fontSize: "14px", lineHeight: 1.6, maxWidth: "760px" }}>
              This keeps the first lab realistic: students learn the content loop and source discipline before they try
              to create hundreds of items.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "10px",
            }}
          >
            {demoSteps.map((step, index) => (
              <div
                key={step.label}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-sm)",
                  padding: "14px",
                  minWidth: 0,
                }}
              >
                <p className="font-mono" style={{ color: "var(--accent)", fontSize: "11px", marginBottom: "8px" }}>
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 style={{ color: "var(--fg)", fontSize: "15px", fontWeight: 700, lineHeight: 1.25, marginBottom: "6px" }}>
                  {step.label}
                </h3>
                <p style={{ color: "var(--fg-muted)", fontSize: "13px", lineHeight: 1.5 }}>{step.body}</p>
              </div>
            ))}
          </div>
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
