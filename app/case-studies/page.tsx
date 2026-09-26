import type { Metadata } from "next";
import Link from "next/link";
import { AZ104_CASE_STUDIES } from "@/content/az104-case-studies";

export const metadata: Metadata = {
  title: "AZ-104 case studies — hecz / study",
  description: "Six original Azure administrator scenarios. Work through five connected questions per case, with explanations and Microsoft Learn evidence.",
};

export default function CaseStudiesPage() {
  return <div className="space-y-6">
    <Link href="/practice" className="text-sm underline">← Practice</Link>
    <header>
      <p className="font-mono text-sm text-[var(--accent)]">AZ-104 · original practice</p>
      <h1 className="font-display text-3xl mt-2">Work through an Azure scenario</h1>
      <p className="text-[var(--fg-muted)] mt-3">Read the company’s requirements, then answer five connected questions. Each answer explains the tradeoffs and links to Microsoft Learn.</p>
    </header>
    <div className="grid gap-4 sm:grid-cols-2">
      {AZ104_CASE_STUDIES.map(study => <article key={study.id} className="p-5 border border-[var(--border-strong)] rounded-[var(--r-md)] bg-[var(--surface)] flex flex-col gap-3">
        <p className="font-mono text-xs text-[var(--accent)]">{study.topic} · {study.questionIds.length} questions</p>
        <h2 className="text-lg font-semibold">{study.title}</h2>
        <p className="text-sm text-[var(--fg-muted)] flex-1">{study.scenario.split(". ")[0]}.</p>
        <Link className="inline-flex items-center justify-center min-h-11 px-4 bg-[var(--accent)] text-[var(--accent-fg)] rounded-[var(--r-sm)] font-medium" href={`/quiz?caseStudy=${study.id}`}>
          Start case study
        </Link>
      </article>)}
    </div>
    <p className="text-sm text-[var(--fg-muted)]">Fictional companies and original scenarios. These exercises are independent practice material, not Microsoft exam questions or replicas of exam labs.</p>
  </div>;
}
