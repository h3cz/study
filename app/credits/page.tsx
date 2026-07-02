"use client";

import Link from "next/link";

export default function CreditsPage() {
  return (
    <div
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        paddingTop: "40px",
        paddingBottom: "80px",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header style={{ marginBottom: "48px" }}>
        <h1
          className="font-display"
          style={{
            fontSize: "36px",
            fontWeight: 400,
            color: "var(--fg)",
            marginBottom: "20px",
            lineHeight: 1.15,
          }}
        >
          Built with gratitude
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: "var(--fg-muted)",
            lineHeight: 1.7,
            maxWidth: "600px",
          }}
        >
          hecz / study is a free, open study companion for CompTIA Security+,
          Network+, and A+. It was built by one person studying for the exam,
          and it stands entirely on the shoulders of free educators who make
          world-class technical training available to everyone. It will always
          be free — no ads, no paywall, no account required.
        </p>
      </header>

      {/* ── Professor Messer ────────────────────────────────────────────────── */}
      <Section title="Professor Messer">
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg-muted)",
            lineHeight: 1.7,
            marginBottom: "20px",
          }}
        >
          Professor Messer runs gold-standard free video courses for CompTIA
          Security+, Network+, and A+. This app links practice questions back
          to his videos when a source match exists and sends learners to his
          channel and site — his content is never redistributed here.
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg-muted)",
            lineHeight: 1.7,
            marginBottom: "24px",
          }}
        >
          When you miss a question, the app points you to the specific Messer
          video that teaches that objective. The goal is always to get you
          watching his course, not to replace it.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <ExternalButton
            href="https://www.professormesser.com/security-plus/sy0-701/sy0-701-video-training-course/"
            label="SY0-701 Free Course"
          />
          <ExternalButton
            href="https://www.youtube.com/@professormesser"
            label="YouTube Channel"
          />
          <ExternalButton
            href="https://discord.gg/professormesser"
            label="Discord Community"
          />
        </div>
      </Section>

      {/* ── Other Resources ─────────────────────────────────────────────────── */}
      <Section title="Other creators & resources">
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg-muted)",
            lineHeight: 1.7,
            marginBottom: "20px",
          }}
        >
          The{" "}
          <Link
            href="/library?tab=resources"
            style={{ color: "var(--accent)", textDecoration: "underline" }}
          >
            Library → Resources
          </Link>{" "}
          tab lists the full directory of study links. Here are the educators
          and communities specifically credited for content this app references:
        </p>
        <div className="space-y-3">
          <CreditRow
            name="Mike Chapple"
            description="Security+ author and instructor with clear exam tips, walkthroughs, and cram sessions listed in our Resources tab."
            href="https://www.youtube.com/@mikechapple"
          />
          <CreditRow
            name="r/CompTIA & r/SecurityPlus"
            description="The Reddit communities that have documented thousands of test experiences, study plans, and post-exam reports. Invaluable signal for what actually matters."
            href="https://reddit.com/r/CompTIA"
          />
          <CreditRow
            name="ExamCompass"
            description="Free multiple-choice practice questions by domain — a solid standalone drill resource."
            href="https://www.examcompass.com/comptia/security-plus-certification/free-comptia-security-plus-practice-tests"
          />
          <CreditRow
            name="TryHackMe"
            description="Browser-based hands-on labs mapped to Sec+ objectives. Highly recommended for the practical side of the exam."
            href="https://tryhackme.com/path/outline/comptia-security-plus"
          />
        </div>
      </Section>

      {/* ── How content is made ─────────────────────────────────────────────── */}
      <Section title="How content is made">
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg-muted)",
            lineHeight: 1.7,
            marginBottom: "12px",
          }}
        >
          Practice questions are generated from the publicly published CompTIA
          SY0-701 exam objectives and reviewed for accuracy. They are not
          copied from any commercial question bank.
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg-muted)",
            lineHeight: 1.7,
            marginBottom: "12px",
          }}
        >
          Videos from free creators are linked to their original source — never
          re-hosted. Thumbnails are served directly from YouTube. When you click
          through, you land on the creator&apos;s own channel.
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg-muted)",
            lineHeight: 1.7,
          }}
        >
          When you miss a question, the app points you to the creator&apos;s
          video that teaches that objective. The intent is always remediation —
          send you to the source, not keep you here longer.
        </p>
      </Section>

      {/* ── Voice tutor (the one honest exception) ──────────────────────────── */}
      <Section title="The one thing that uses live compute">
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg-muted)",
            lineHeight: 1.7,
            marginBottom: "12px",
          }}
        >
          The study app — questions, flashcards, exams, FSRS scheduling, and the
          free browser read-aloud — is free forever and runs no AI on our side.
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "var(--fg-muted)",
            lineHeight: 1.7,
          }}
        >
          The one exception is the optional{" "}
          <Link
            href="/voice"
            style={{ color: "var(--accent)", textDecoration: "underline" }}
          >
            Voice tutor
          </Link>
          : a live spoken AI tutor that runs OpenAI&apos;s realtime model in
          real time. That costs real money every minute, so it is capped (30
          minutes a day, 60 a month) and clearly labeled. It is free while in
          beta. The textbook is free; the tutor&apos;s time isn&apos;t — and we
          will always tell you which is which.
        </p>
      </Section>

      {/* ── Affiliation disclaimer ──────────────────────────────────────────── */}
      <section
        style={{
          marginBottom: "48px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          padding: "20px 24px",
        }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--fg-muted)",
            marginBottom: "12px",
          }}
        >
          Affiliation &amp; Monetization
        </p>
        <p
          style={{
            fontSize: "13px",
            color: "var(--fg-muted)",
            lineHeight: 1.65,
          }}
        >
          hecz / study is an independent project. It is not affiliated with,
          endorsed by, or sponsored by CompTIA, Professor Messer, or any creator
          linked here. CompTIA and Security+ are trademarks of CompTIA. This app
          is free and will never charge — if you ever see a paywall, it
          isn&apos;t us.
        </p>
      </section>

      {/* ── Page footer ─────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "24px",
          fontSize: "12px",
          color: "var(--fg-subtle)",
          lineHeight: 1.6,
        }}
      >
        Built by Hecz ·{" "}
        <a
          href="https://hecz.dev"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--fg-muted)", textDecoration: "underline" }}
        >
          hecz.dev
        </a>{" "}
        · Found a problem or want your content credited differently?{" "}
        <a
          href="https://hecz.dev"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent)", textDecoration: "underline" }}
        >
          Get in touch
        </a>
      </footer>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "48px" }}>
      <h2
        style={{
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          marginBottom: "16px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function ExternalButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        height: "36px",
        padding: "0 16px",
        border: "1px solid var(--accent)",
        borderRadius: "var(--r-sm)",
        color: "var(--accent)",
        fontSize: "13px",
        fontWeight: 500,
        fontFamily: "var(--font-sans)",
        textDecoration: "none",
        transition: "background-color 120ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
          "rgba(245,166,35,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
          "transparent";
      }}
    >
      {label} ↗
    </a>
  );
}

function CreditRow({
  name,
  description,
  href,
}: {
  name: string;
  description: string;
  href: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--r-md)",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "6px",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--fg)",
          }}
        >
          {name}
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: "11px",
            color: "var(--accent)",
            textDecoration: "none",
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.textDecoration =
              "underline";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none";
          }}
        >
          ↗
        </a>
      </div>
      <p
        style={{
          fontSize: "13px",
          color: "var(--fg-muted)",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
    </div>
  );
}
