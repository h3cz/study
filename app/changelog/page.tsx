import Link from "next/link";
import { changelogEntries, type ChangeEntry } from "@/lib/changelog";

function EntryCard({ entry, index }: { entry: ChangeEntry; index: number }) {
  return (
    <article
      className="changelog-entry"
      style={{
        borderTop: index === 0 ? "1px solid var(--border-strong)" : "1px solid var(--border)",
      }}
    >
      <div className="changelog-meta">
        <p
          className="font-mono"
          style={{
            color: "var(--accent)",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          {entry.label}
        </p>
        <time
          dateTime={entry.date}
          className="font-mono"
          style={{ color: "var(--fg-subtle)", fontSize: "12px" }}
        >
          {entry.date}
        </time>
      </div>
      <div
        className="changelog-card"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
        }}
      >
        <h2 className="changelog-title" style={{ color: "var(--fg)", fontWeight: 700, lineHeight: 1.15, marginBottom: "8px" }}>
          {entry.title}
        </h2>
        <p className="changelog-summary" style={{ color: "var(--fg-muted)", lineHeight: 1.6, marginBottom: "18px" }}>
          {entry.summary}
        </p>
        <div style={{ display: "grid", gap: "12px" }}>
          {entry.items.map((item) => (
            <section
              className="changelog-item"
              key={item.title}
              style={{
                borderLeft: "2px solid rgba(245,166,35,0.55)",
              }}
            >
              <h3 className="changelog-item-title" style={{ color: "var(--fg)", fontWeight: 700, marginBottom: "4px" }}>
                {item.title}
              </h3>
              <p className="changelog-item-body" style={{ color: "var(--fg-muted)", lineHeight: 1.55 }}>{item.body}</p>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function ChangelogPage() {
  return (
    <main className="changelog-main mx-auto max-w-4xl px-4 py-8 pb-24">
      <style>{`
        .changelog-main {
          overflow-x: hidden;
        }

        .changelog-entry {
          display: grid;
          grid-template-columns: minmax(92px, 120px) minmax(0, 1fr);
          gap: 18px;
          padding-top: 22px;
          min-width: 0;
        }

        .changelog-card {
          padding: 20px;
          min-width: 0;
          max-width: 100%;
          overflow-wrap: anywhere;
        }

        .changelog-title {
          font-size: 24px;
          overflow-wrap: anywhere;
        }

        .changelog-summary {
          font-size: 14px;
          overflow-wrap: anywhere;
        }

        .changelog-item {
          padding-left: 12px;
          min-width: 0;
        }

        .changelog-item-title {
          font-size: 15px;
          overflow-wrap: anywhere;
        }

        .changelog-item-body {
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        @media (max-width: 640px) {
          .changelog-main {
            padding-left: 14px;
            padding-right: 14px;
          }

          .changelog-entry {
            grid-template-columns: minmax(0, 1fr);
            gap: 10px;
            padding-top: 18px;
          }

          .changelog-meta {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 12px;
            min-width: 0;
          }

          .changelog-card {
            padding: 16px;
          }

          .changelog-title {
            font-size: 21px;
          }

          .changelog-summary {
            font-size: 13px;
            margin-bottom: 14px !important;
          }

          .changelog-item {
            padding-left: 10px;
          }

          .changelog-item-title {
            font-size: 14px;
          }

          .changelog-item-body {
            font-size: 12px;
          }

          .changelog-actions a {
            flex: 1 1 150px;
            justify-content: center;
          }
        }
      `}</style>
      <section style={{ marginBottom: "28px" }}>
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
          Changelog
        </p>
        <h1
          className="font-display"
          style={{
            color: "var(--fg)",
            fontSize: "clamp(44px, 9vw, 84px)",
            lineHeight: 0.92,
            fontWeight: 400,
            marginBottom: "16px",
          }}
        >
          What changed and why.
        </h1>
        <p style={{ color: "var(--fg-muted)", fontSize: "16px", lineHeight: 1.65, maxWidth: "680px" }}>
          A short product log for the study app, public starter, and class-lab materials. It is written for learners,
          classmates, instructors, and anyone evaluating the build.
        </p>
        <div className="changelog-actions" style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "20px" }}>
          <Link
            href="/lab"
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
            Open lab hub
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
            View public starter
          </a>
        </div>
      </section>

      <section style={{ display: "grid", gap: "22px" }} aria-label="Product changelog">
        {changelogEntries.map((entry, index) => (
          <EntryCard key={`${entry.date}-${entry.label}`} entry={entry} index={index} />
        ))}
      </section>
    </main>
  );
}
