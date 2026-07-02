import Link from "next/link";

type ChangeItem = {
  title: string;
  body: string;
};

type ChangeEntry = {
  date: string;
  label: string;
  title: string;
  summary: string;
  items: ChangeItem[];
};

const entries: ChangeEntry[] = [
  {
    date: "2026-07-01",
    label: "Lab release",
    title: "Official app, open-source lab split",
    summary:
      "The production app now stays focused on the curated study experience while the public repo gives classmates and builders a clean starter kit.",
    items: [
      {
        title: "Added the Hecz Study Lab hub",
        body: "New /lab page explains the difference between the official app, the forkable lab starter, class resources, decks, and import guidance.",
      },
      {
        title: "Locked imports on production",
        body: "The /import page stays available for transparency, but production builds do not show the upload action unless NEXT_PUBLIC_ENABLE_BANK_IMPORT is explicitly enabled.",
      },
      {
        title: "Updated the public starter",
        body: "The h3cz/study repo ships without the private/generated question bank and points people toward building their own allowed content.",
      },
      {
        title: "Expanded class materials",
        body: "Added the class handout, branded lab guide, PowerPoint decks, import format docs, and class pack template for running a hands-on lab.",
      },
    ],
  },
  {
    date: "2026-06-30",
    label: "Compete polish",
    title: "Duels are slower, clearer, and less abrupt",
    summary:
      "Compete now explains the rules before play and requires both players to advance between rounds.",
    items: [
      {
        title: "Added a rules preview",
        body: "Players see the question count, timer, speed scoring, and round pacing before the first question.",
      },
      {
        title: "Added round-by-round Next flow",
        body: "A duel no longer snaps straight into the next question. Both players answer, then both click Next before the server advances.",
      },
      {
        title: "Made settings explicit",
        body: "Invite and quick-match flows make the selected question count and timer visible so both sides know the rules.",
      },
    ],
  },
  {
    date: "2026-06-30",
    label: "Showcase pass",
    title: "Better public project packaging",
    summary:
      "The repo now reads more like a project people can understand, fork, and evaluate.",
    items: [
      {
        title: "Added showcase visuals",
        body: "README and social-preview assets now show the product instead of only describing it.",
      },
      {
        title: "Clarified the question-bank boundary",
        body: "Docs now explain that the open-source version is a starter, not a redistributed private bank.",
      },
      {
        title: "Removed AI-agent contributor references",
        body: "Public-facing materials were cleaned up so the project is presented under the Hecz brand.",
      },
    ],
  },
];

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
        {entries.map((entry, index) => (
          <EntryCard key={`${entry.date}-${entry.label}`} entry={entry} index={index} />
        ))}
      </section>
    </main>
  );
}
